---
title: Staking
sidebar_position: 5
description: Staking sub-protocols.
keywords:
    - execution
    - decex
    - staking
    - deposit
    - withdraw
    - unlock
last_update:
  date: 09/25/2024
  author: Dariia Porechna
---

While the below scheme is different from traditional checkpointed or snapshotted staking protocols, it has the benefit being more efficient while consuming far less state. Specifically the state is constant in the number of operators and nominators. Most of the time, we only adjust the `current_epoch_fees` for an operator pool every time fees from confirmed blocks are collected (which is frequent). 

Individual nominator shares for a given pool are independent of other nominators shares. Nominators shares only have to be updated when a deposit or withdrawal is made, which are relatively infrequent (compared to bundle production). 

## Operator Registration

Any user who has the `MinOperatorStake` and sufficient hardware for running an operator node may choose to register as an operator by calling the `register_operator` extrinsic on a specific domain.

###  Operator Config
The settings for nominators, which include:
- `nomination_tax`: the tax rate for compute fees earned by the pool (e.g. 5%).
- `minimum_nominator_stake`: the minimum stake needed to participate as a nominator for this pool. Should be > 1 SSC.

### Steps

1. The operator must provide an `operator_config` and the following fields:
    - `domain_id` of the target domain they wish to stake on
    - `signing_key`
2. This immediately creates a new entry in the `Operators` registry, which creates a new staking pool for nominators to join. The pool is divided into shares on pro-rata basis, proportional to each nominators amount in the `current_total_stake`.
3. The deposit is applied to the `Deposits` storage for this operator as a pending deposit. The `operator_id` is also added to the `next_operators` set in the `DomainRegistry`.
4. A 20% of the deposit is transferred to a `storage_fund_account` towards paying storage fees for bundles. The rest of the deposit amount remains locked in operator’s balance account.
5. At the next epoch transition for this domain, the `current_total_stake` for this domain is updated to reflect the operator’s deposit (minus the storage fund %). The `operator_id` is moved to the `current_operators` for this domain. 
6. The operator will get shares equal to their deposit (the `share_price` at the pool start is equal to `1`). The `total_shares` and `current_total_stake` are set to the staked value. Their initial pending deposit is moved to `KnownDeposit`.
7. The operator may now participate in the VRF bundle election.

## Nominator Registration

Any user who has `MinNominatorStake` may choose to join this operator’s pool by calling the `nominate_operator` [extrinsic](interfaces.md#nominate_operator) with the `deposit_amount` of SSC they wish to stake. 

Note: the actual calculations are done in Shannons, and 1 SSC = $10^{18}$ Shannons

First nomination:

1. The deposit of `deposit_amount` SSC is added to the `Deposits` storage as a `PendingDeposit` for the operator pool they chose.
2. A 20% of the deposit is transferred to a `storage_fund_account` towards paying storage fees for bundles. The rest of the deposit amount remains locked in operator’s balance account.
3. Deposit `deposit_amount`(minus the 20% for storage fund) is locked for `nominator_id` account in `pallet_balances` and `operator_id`’s `deposits_in_epoch` is incremented by the same amount.
4. During the next epoch transition, the `deposit_amount` is added to `current_total_stake` of the operator pool and domain’s `current_total_stake`.

Note that nominator shares are not yet “assigned” until they either add a new deposit in a subsequent epoch or initiate a withdrawal.

For subsequent nomination deposits see [Stake Deposits](#stake-deposits).

## Stake Withdrawals

Any registered operator or nominator may initiate a withdrawal of their stake from the pool by submitting a `withdraw_stake` [extrinsic](interfaces.md#withdraw_stake) which support different types of withdrawal:
- All, withdraw all the stake
- Percent, withdraw a given percentage of the stake
- Stake, withdraw a given amount of stake (i.e. balance)
    The stake is calculated by the share price at this instant, it may not be accurate and may withdraw a bit more stake if there is reward happen later in this epoch
- Share, withdraw a given amount of share

If the nominator's stake after withdrawal results in an amount below the operator's required `minimum_nominator_stake,` the nominator is automatically completely unstaked. Contrary, the operator cannot withdraw below the `MinOperatorStake`.

A withdrawal is logically composed of 2 parts. First, a user request to withdraw shares (`withdraw_stake`) that unstakes a given amount of stake at the end of epoch, and second, a request to unlock (`unlock_funds` [extrinsic](interfaces.md#unlock_funds)) and actually transfer to the balance account the amount of SSC for those shares after the locking period has passed.

A nominator can submit `withdraw_stake` extrinsics to request withdrawal. Withdrawals requested in the same epoch are aggregated into one, and there are at most `WithdrawalLimit` number of withdrawal allowed for a given nominator at the same time, once this limit is reached, the nominator need to submit `unlock_funds` extrinsic to unlock the withdrawal before requesting a new one.

1. Nominator submits a `withdraw_stake` extrinsic.
2. If there are any pending deposits `PendingDeposit` for this nominator for any previous epoch `n`, then use the `OperatorEpochSharePrice` stored for those specific deposit epoch `n` and calculate the `shares` and add it to existing `shares` in `KnownDeposit`.This would not be unbounded and at max be 1 `PendingDeposit` for a given nominator.
3. If there are any withdrawals `withdrawals_in_shares` for this nominator for any previous epoch `n`, then use the `OperatorEpochSharePrice` stored for those specific epoch `n` and convert the `shares` to SSC, move the withdrawal into the converted `withdrawals` vector and add the amount to `total_withdrawal_amount`.
4. Ensure the total number of withdrawals in the `withdrawals` vector is less than `WithdrawalLimit` 
5. Once the pending nominator deposit shares are calculated and added to known shares, 
    1. If there are no withdrawals initiated this epoch yet, a `Withdrawal` item is created with 
        1. `allowed_since_domain_epoch` set to current epoch, 
        2. `unlock_at_confirmed_domain_block_number = LatestConfirmedDomainBlockNumber(domain_id) + StakeWithdrawalLockingPeriod`,
        3. `withdraw_shares` requested, 
        4. `storage_fee_refund = withdraw_shares/total_shares*storage_fee_deposit/total_storage_fee_deposit*storage_fund_account_balance`
    2. If there is already a withdrawal for the same `allowed_since_domain_epoch`, `Withdrawal` storage is incremented with intended #`withdraw_shares` and `storage_fee_refund` to withdraw, and `unlock_at_confirmed_domain_block_number` is updated to a higher value `LatestConfirmedDomainBlockNumber(domain_id) + StakeWithdrawalLockingPeriod`. All the withdrawals submitted in the same epoch are unlocked at the unlocking time of the last withdrawal of that epoch.
    3. Similar to `total_withdrawal_amount`, add `storage_fee_refund` to `total_storage_fee_withdrawal`
    4. `Nominator` shares and storage fee deposit in their known deposits `KnownDeposit` are reduced:
        1. `shares = shares - withdraw_shares`
        2. `storage_fee_deposit = storage_fee_deposit(1 - withdraw_shares/shares)` 
6. `operator_id` ‘s `withdrawals_in_epoch` are incremented with total of `withdraw_shares` from all nominators withdraw requests for the next epoch.
7. The total of all nominator storage fee deposits (`total_storage_fee_deposit`) is decremented by `storage_fee_refund`.
8. The `storage_fee_refund` amount is locked in the operator’s `storage_fund_account` and not used to pay for any future bundles.

### Unlock withdrawn funds

Once the previous epoch (of `withdraw_shares` extrinsic) is completed and share price for that epoch is noted, nominators can withdraw the requested shares that had passed the unlocking period.

1. Nominator submits `unlock_funds(operator_id, nominator_id)` 
2. Operator iterate the `nominator_id`'s withdrawal from the oldest to newest
    1. If the withdrawal's `StakeWithdrawalLockingPeriod` period is not complete (the `unlock_at_confirmed_domain_block_number` is higher than `LatestConfirmedDomainBlockNumber(domain_id)`), then stop iterating.
    2. Remove the withdrawal from the the `withdrawals` vector
    3. Calculate `amount_to_unlock` as SSC amount for withdrawn shares using share value for epoch stored at `OperatorEpochSharePrice` the withdraw is allowed from.
    4. Add the `amount_to_unlock` to `total_amount_to_unlock` and the `storage_fee_refund` to `total_storage_fee_refund`
3. Deduct `total_amount_to_unlock` from `total_withdrawal_amount` and `total_storage_fee_refund` from `total_storage_fee_withdrawal`
4. Release `total_storage_fee_refund` from locked to transferrable state for nominator account.
5. If `total_amount_to_unlock` is more than SSC amount that was locked for staking on this operator, the excess is minted and locked to nominator account.
6. Finally, `total_amount_to_unlock` of SSC is released from locked to transferrable state for nominator account.

## Stake Deposits

Existing nominators may choose to add more stake to the same operator’s pool they are already nominating using the same `nominate_operator` [extrinsic](interfaces.md#nominate_operator) with the `deposit_amount` of SSC they wish to stake. 

1. Nominator with balance account `nominator_id` submits an extrinsic to deposit for next epoch for a given `OperatorPool` as `nominate_operator(OperatorPoolId, nominator_id, deposit_amount)`
2. The `deposit_amount` is locked for  `nominator_id` account in `pallet_balances`.
3. The deposit is added as `PendingDeposit` to `Deposits` storage for this nominator-operator pair as a key.
4. If there is a pending deposit for this nominator submitted this epoch, the existing pending deposit is incremented with `deposit_amount`.
5. If there are any pending deposits for this nominator for any previous epoch `n`, then use the `OperatorEpochSharePrice` stored for those specific deposit epoch `n` and calculate the `shares` and add it to existing `shares` in `KnownDeposit`.This would not be unbounded and at max be 1 `PendingDeposit` for a given nominator.
6. A 20% of the deposit is transferred to a `storage_fund_account` towards paying storage fees for bundles. The rest of the deposit amount remains locked in nominator’s balance account.
7. The amount transferred is applied to domain’s balance. 
8. The deposit of `deposit_amount`(minus the storage fund %) SSC is applied to the `deposits_in_epoch` table within the operator pool. 
9. During the next epoch transition, 
    1. Compute the operator’s pool end-of-epoch `share_price` as the sum of all stake in the pool and rewards gained during the previous epoch divided by the total number of shares `(current_total_stake + current_epoch_rewards * (1-nomination_tax)) / total_shares`.
    2. Assign the `shares` to this nominator based on the `share_price` of the pool (as `shares = deposit_amount / share_price`).
    3. The `deposit_amount` is added to `current_total_stake` of the operator pool and domain’s `current_total_stake`.
    4. The `shares` of this nominator are added to `total_shares` of the pool.

## Operator Deregistration

See the corresponding `deregister_operator` [extrinsic](interfaces.md#deregister_operator). 

## Slashing Stake

If any `submit_fraud_proof` [extrinsic](interfaces.md#submit_fraud_proof) is accepted by the chain, the operator’s entire pool is slashed.

1. The pool is immediately frozen for withdrawals and deposits, by setting `status` in `Operators` registry entry of this operator to `Slashed`.
2. All new deposits are canceled and returned to senders.
3. The `Withdrawals` table is checked to see if there are any withdrawals initiated for this operator, all of which are sent to the treasury account.
4. The entire operator pool balance of `current_total_stake` and any rewards received will be transferred to treasury account and operator is removed from the `next_operators`.
5. At epoch transition, the entire pool balance is applied to the SSC treasury account, and the Operator is removed from the `Operators` registry.

## Fees Distribution

For each confirmed domain block this domain, fees are distributed as follows:

- The storage fees (`ER::block_fees.storage_fee`) for bundles in that block are refunded to the operators who authored those bundles according to how much they front-paid for bundle size.
- The execution fees (`ER::block_fees.execution_fee`) from the newly confirmed domain block are applied to the `current_epoch_fees` for this domain in the `DomainRegistry` and the operators pool (who submitted this ER) in the `Operators` registry.
- Operator will get a cut of all fees collected by this pool as per `nomination_tax` specified in operator’s config at the epoch transition.
- Operator’s cut will be automatically re-staked (via a deposit) to the operator’s nomination at next epoch transition. Operator’s `shares`, `total_shares` and `current_total_stake` will be updated with the corresponding deposit.
- At the next epoch transition we check all domains and apply all changes corresponding to rewards, deposits and withdrawals to the `current_total_stake`, and the iterating through all registered operators and updating their `current_total_stake` as well. Note that this only changes the total pool balance, but does not affect `total_shares` or `shares` for any individual nominators.

Note: because of the challenge period, the fees distribution is delayed, and as a result, the set of nominators in the operator pool may have changed in the meantime. New operators who joined after the newly confirmed block was produced will get fees share from the blocks produced before they joined. Nominators who withdraw some shares will get lesser fee share. Nominators who withdraw completely, do not get fees for the last blocks still in challenge period, even though they were staking when those blocks were produced.
