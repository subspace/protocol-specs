---
title: Domains Interfaces
sidebar_position: 2
description: Domain parameters and interfaces definitions.
keywords:
    - execution
    - decex
last_update:
  date: 03/06/2024
  author: Ning Lin
---

## Global Parameters

- `NextRuntimeID`: Auto-incrementing primary key for all domain runtimes registered on this chain. Runtimes are upgradable, but all domains of a given type must use the latest version of a runtime.
- `NextDomainID`: Auto-incrementing primary key for all domain instances registered on this chain.
- `NextOperatorID`: Auto-incrementing primary key for each registered domain operator.
- `DomainRuntimeUpgradeDelay`: The number of blocks before the runtime upgrade comes into effect after the submission of extrinsic `upgrade_domain_runtime`. The default is 14400 blocks (roughly one day).
- `MaxTransactionWeight`: The maximum execution weight for any transaction (or runtime call) that limits the execution weight of a fraud proof for consensus chain nodes.
- `TX_RANGE`: transaction pool range for one operator to determine which transactions are valid for inclusion in their bundle, currently equal to `U256::MAX/3`.
- `WeightToFee`: The conversion rate of the weight to the native currency on the chain, currently used to calculate transaction execution fees.
- `LengthToFee`: The conversion rate of the storage size to the native currency on the chain, currently used to calculate transaction storage fees.
- `MaxDomainBlockSize`: The system-wide maximum block size limit for all domains. The default is the consensus chain's normal extrinsics block size limit of 3.75 MiB.
- `MaxDomainBlockWeight`: The maximum execution weight for any domain block, most domains will be below this number. The default is the consensus chain's normal extrinsics block weight limit of 1.5 seconds of computation weight. (*Currently not enforced, issue* [#2226](https://github.com/subspace/subspace/issues/2226#issuecomment-1812425317))
- `MaxBundlesPerBlock`: The maximum number of bundles that may be included in a domain block. Roughly calculated as a fraction of the total available blockspace on the parent chain. Currently set to 10. (*Currently not enforced*)
- `MinOperatorStake`: The minimum deposit required to run an operator node. Currently set to 100 SSC on Gemini3g, previously twice the system-wide maximum block fee `2 * (MaxDomainBlockWeight * WeightToFee + MaxBlockSize*LengthToFee)`.
- `StakeEpochDuration`: The duration, in domain blocks, for each stake allocation re-adjustment period. To amortize the load of epoch transitions, each domain should have its epoch transition start point set as the block where it is registered, though the duration would be the same for all domains. At epoch transition, the stake distribution for the VRF election is recalculated, and any of the shares for each operator pool are recalculated if there have been any new deposits or withdrawals. Currently, 100 blocks.
- `StakeWithdrawalLockingPeriod`: The number of consensus chain blocks after a staking withdrawal has been submitted and cleared before it will be transferred back to owner balances. Currently, 14400 domain blocks *(Value TBD)*
- `BlockTreePruningDepth`: The confirmation depth at which domain blocks are pruned from the `BlockTree`*, de-facto challenge period.* Currently, 14400 domain blocks.
- `BundleLongevity`: How long the bundle is consider as not stale, defined in the number of consensus blocks. Currently, 5 consensus blocks.

<!-- - `MaxFraudProofSize`: The maximum size of a fraud proof, as enforced by the fraud proof storage metering scheme. This ensures that fraud proof size is not unbounded. The default is 1 MiB. -->
- `DomainInstantiationDeposit`: The amount of funds to be locked up for the domain instance creator. The initial value is 100 SSC *(Value TBD)*
- `MaxDomainNameLength`: The maximum domain name length limit for all domains. The default is 32 bytes.
- `MaxNominators`: The maximum number of nominators one domain operator can take. Currently 256.

## Runtime Calls

Listed in the order of call index in the runtime.

### submit_bundle

`submit_bundle(domain_id, execution_receipt, transfers)`

Any staked operator who is elected may produce and submit a new bundle. The bundle includes a proof-of-election for the VRF election, an execution receipt for the last block on this domain, and all of the new extrinsics within the bundle itself — all committed to in the bundle header. Consensus nodes will verify the proof-of-election against the corresponding stake table in the `DomainRegistry` and apply the new ER in the bundle header to the `BlockTree` of the domain.

### submit_fraud_proof

`submit_fraud_proof(domain_id, execution_receipt_hash, proof)`

Challenges an ER committed to in the `BlockTree` of a domain on the consensus chain with proof. This proof could be one of several types, such as invalid state transition or bundle equivocation. Consensus nodes will verify the proof before broadcasting on the network. The next farmer elected to produce a block will include all valid challenges it has received. This will result in pruning the invalid ER, along with all of its children from the `BlockTree`, while de-registering and slashing all accompanying operators in the `Operators` registry. 

### register_domain_runtime

`register_domain_runtime(name, runtime_blob) → runtime_id`

Registers a new domain runtime in `RuntimeRegistry` by name, and stores the WASM binary of the runtime on-chain. Sets the `runtime_id` in the `RuntimeRegistry` as `next_runtime_id` and increments the `next_runtime_id`. 

This is a permissioned operation restricted to the sudo account and (later) on-chain governance. The expectation is that there will only be a handful of unique runtimes (less than 10) until we transition to settlement domains (formerly system domains) which will unlock open domains.

### upgrade_domain_runtime

`upgrade_domain_runtime(runtime_id, runtime_blob)`

Upgrades the canonical WASM binary of an existing domain type (`runtime_id`) in  `RuntimeRegistry`. 

This is a permissioned operation, which follows the workflow of a forkless runtime upgrade within Substrate. When the runtime for a domain type is upgraded, all operators of the domains of this type must update the runtime for any respective domain instances. To allow for upgrade time, the upgrade takes effect after `DomainRuntimeUpgradeDelay` shortly rather than immediately. 

### register_operator

`register_operator(origin_account_id, domain_id, amount, operator_config) → operator_id`

Registers a new operator with `operator_id` and the corresponding staking pool in the `Operators` registry with a given `operator_config` (as defined [here](staking.md#operator-config)). The operator must transfer `amount ≥ MinOperatorStake` from `pallet_balances` to the staking table within the `Operators` registry **and choose a domain to stake on. An operator may only be staked on one domain at a time. Any user may submit this extrinsic. Note that the `origin_account_id` between the balance and staking tables are the same. Any resulting bundle rewards are automatically re-staked into the pool.

For permissioned domains (that implement `allowlist`), the operator id should be present in the allowlist.

### nominate_operator

`nominate_operator(operator_id, account_id, amount) → nominator_id`

Adds a `PendingDeposit` with `account_id` to the storage of the operator `operator_id` in and deposits SSC from an account balance (i.e., in *`pallet_balances`*) into the staking pool `Deposits` of a registered operator, awarding the nominator pro-rata shares in the pool when the share price for this epoch will become known. The nominator must transfer `amount` ≥ `min_nominator_stake` (as defined within the operator’s config). The nominator will receive shares in the operator's pool, which they can later withdraw for SSC. 

This is a permissionless operation; however, currently, only `MaxNominators` nominators per operator are supported. Note that `account_id` between the balance and staking account are the same.
If the operator is no longer registered, the funds will be returned to the reward address in *`pallet_balances`*.

### instantiate_domain

`instantiate_domain(domain_config) → domain_id`

Instantiates a new domain in the `DomainRegistry` based on a `runtime_id` (existing in `RuntimeRegistry`) and a user-provided `domain_config`. Sets the `domain_id` in the `DomainRegistry` as the `next_domain_id` and increments the `next_domain_id`. `DomainInstantiationDeposit` amount of free balance will be locked up for the domain creator; if the domain creator doesn’t have enough free balance, the domain instantiation will fail.

This permissionless operation allows anyone to create their instance of a domain runtime based on a desired config.

### deregister_operator

`deregister_operator(operator_id)`

At any time, an operator may initiate a de-registration, removing them and their stake pool from the domain bundle election, allowing them to withdraw all of their funds as well as removing their entry in the `Operators` registry while returning all funds for nominators. This does not require approval from nominators. At the next epoch transition, the pool in the `Operators` registry will be frozen (`status` set to `Deregistered`) until the `StakeWithdrawalLockingPeriod` has passed. Following this, all operator and nominator funds in the pool will be transferred to corresponding accounts in `pallet_balances` proportional to their shares in the pool. Since this could cause a significant load on the withdrawals table for large pools, the entire pool could be applied to the withdrawal table and transferred in mass when the unlock period has elapsed.  We don't do the final staked value calculation for each nominator at the time of epoch transition for this entire pool. This happens when they are about to be unlocked. For a regular withdrawal, the final staked value will be calculated at the time of epoch transition.

### withdraw_stake

`withdraw_stake(operator_id, nominator_id, shares)`

Initiates a withdrawal of shares from an operator pool of `operator_id` into an account balance of  `nominator_id`. This may be initiated by any individual nominator or the controlling operator (so long as they do not withdraw below the `MinOperatorStake`). A nominator may choose to withdraw their stake partially for a specific amount of shares or fully (all shares). Any nominator who draws all shares will be removed from the staking pool. 

At the next epoch transition, the staked pool shares for the given domain will be adjusted and the withdrawal will be initiated. These funds will remain locked for the `StakeWithdrawalLockingPeriod`, after which they are transferred to `pallet_balances` under the same `account_id` of the nominator.

To unlock funds, the nominator has to submit an `unlock_funds(operator_id, nominator_id)` extrinsic.

### unlock_funds

`unlock_funds(operator_id, nominator_id)`

To complete an initiated withdrawal, the nominator has to submit an unlock extrinsic after the locking period has passed.
If a withdrawal has passed the `StakeWithdrawalLockingPeriod`, the funds are unlocked in the nominator’s account in `pallet_balances`.

### unlock_operator

`unlock_operator(operator_id, nominator_id)`

To complete an initiated deregistration of an operator, they need to submit an unlock extrinsic after the locking period has passed. This withdraws all the stake and fees to all nominators according to their shares.
If a withdrawal has passed the `StakeWithdrawalLockingPeriod`, the funds are unlocked in the operator’s and nominators’ accounts in `pallet_balances`.

### update_domain_operator_allow_list

`update_domain_operator_allow_list(domain_id, operator_allow_list)`

Updates the allowlist of operators who can stake on this domain. 

If the previous allowed list is set to specific operators and new allowlist is set to `Anyone`, then domain will become permissioned to open for all operators. If the previous allowlist is set to `Anyone` or specific operators and the new allowlist is set to a different set of specific operators, then all the registered not allowed operators will continue to operate until they de-register themselves.

### force_staking_epoch_transition

`force_staking_epoch_transition(domain_id)`

Initiates an epoch transition immediately, without waiting for a `StakeEpochDuration` blocks to be created. 
This operation can only be initiated by a root user. It is used to ensure domain liveness under circumstances when, for example, a large amount of stake went offline, and a domain can’t produce blocks frequently enough.

## Runtime Storage Items

### Runtime Registry

`RuntimeRegistry` a mapping of `runtime_id` → `runtime_object`
- `runtime_id` auto-incrementing primary key for each domain runtime type
- `runtime_object`:
    - `runtime_name` user selected name, i.e., “EVM”
    - `runtime_type` type of this runtime, i.e., `Evm`
    - `runtime_upgrades` number of runtime upgrades applied to this runtime.
    - `hash` runtime hash for the last upgrade.
    - `raw_genesis` WASM runtime blob that contains the runtime code.
    - `version` runtime version info of the current runtime.
    - `created_at` consensus chain block number when first registered.
    - `updated_at`  consensus chain block number when last upgraded.

### Domain Registry

`DomainRegistry` a mapping of `domain_id` → `domain_object`
- `domain_id`: auto-incrementing primary key for each domain instance
- `domain_object`:
    - `owner_account_id`: the address of the domain creator, used to validate updating the domain config.
    - `created_at`: the consensus chain block number when the domain first instantiated.
    - `genesis_receipt_hash`: the hash of the genesis block execution receipt for this domain
    - `domain_runtime_info`: domain runtime-specific information to create domain raw genesis. (e.g. EVM chain id)
    - `domain_config`:
        - `domain_name`: user-defined name for this domain (string)
        - `runtime_id`: a pointer to the `RuntimeRegistry` entry for this domain
        - `max_block_size`: the max block size for this domain; may not exceed the system-wide `MaxDomainBlockSize` limit.
        - `max_block_weight`: the max block weight for this domain, may not exceed the system-wide `MaxDomainBlockWeight` limit
        - `target_bundles_per_slot`: the expected number of a successful bundles in a slot. This defines the expected bundle production rate; must be `> 0`. A value `<1` means not all slots will have a bundle. Recommended value: 1.

### Domain Staking Summary

`DomainStakingSummary` is a mapping of `domain_id` → `stake_summary`
- `stake_summary`:
    - `current_epoch_index`: index of the current epoch for the operator election for this domain.
    - `current_total_stake`: total stake for this domain used in the VRF election for this epoch. Updated on each epoch transition.
    - `current_operators`: the set of all `(operator_id, balance)` that are registered for this domain, which may need to be updated at epoch transition.
    - `next_operators`: a set of tuples `operator_id` reflecting any changes to the `current_operators` set
    - `current_epoch_fees`: a set of tuples as `(operator_id, balance)` reflecting any fees accumulated by each `operator_id` pool in the current epoch.

### Block Tree

`BlockTree` is a mapping of `(domain_id, domain_block_number)` to a hash of Execution Receipt (ER), which can be used get the block tree node in `BlockTreeNodes`

`BlockTreeNodes` is a mapping of ER hash to domain block:
- `execution_receipt`: the full ER from the bundle header
- `operator_ids`: the set of all operators who have committed to this ER within a bundle. Used to determine who to slash if a fraudulent branch of the `BlockTree` is pruned

`LatestConfirmedDomainBlockNumber` is a mapping of `domain_id` → `domain_block_number`, which stores the latest confirmed (pruned) domain block number for each domain.

### Operator Details

`Operators` is a mapping of `operator_id` → `operator_object` defined as: 
- `operator_id`: auto-incrementing primary key for each operator
- `Operator`:
    - `signing_key`: the public key used to sign bundles for the VRF election
    - `current_domain_id`: the domain this operator is staked on
    - `next_domain_id`: the domain this operator is going to be staked on next when (if) they decide to switch (currently unused)
    - `minimum_nominator_stake`: the minimum stake needed to participate as a nominator for this pool, as determined by the operator in their config. Default is 1 SSC.
    - `nomination_tax`: the tax rate for withdrawals from the pool by nominators, as determined by the operator in their config. Default is 5%.
    - `current_total_stake`: the total active stake for this operator’s pool for the current epoch. Used for calculating and verifying the VRF election for the chosen domain.
    - `current_epoch_fees`: fees accumulated by this pool in the current epoch from the domain blocks that were confirmed.
    - `current_total_shares`: the total shares in the staking pool. Should be equal to the sum of all nominators `shares` and the operator share.
    - `status`: whether the operator is `Registered`, `Deregistered` or `Slashed`. This field is used to verify if nominators can submit deposits/withdrawals to this operator pool.
    - `deposits_in_epoch`: total deposited SSC during the previous epoch
    - `withdrawals_in_epoch`: total withdrawn shares during the previous epoch
    - `total_storage_fee_deposit`: the total amount deposited by nominators towards the storage fee fund
    

`OperatorEpochSharePrice` is a mapping of `(operator_id, epoch_id)` → `Shannon` containing share price for past epochs for which withdrawals were initiated. Epoch is identified by it’s domain and epoch number.

### Deposits

`Deposits` is a mapping of `(operator_id, nominator_id)` → `Deposit` which doubles as a registry of all nominators of an operator and their stake share. Each `Deposit` consists of: 
- `KnownDeposit`:
    - `shares`: the total number of shares within the pool owned by this nominator
    - `storage_fee_deposit`: the total remaining deposit towards bundle storage fees
- `PendingDeposit(effective_domain_epoch, amount)`: the SSC amount recently deposited by the nominator for which we have not yet computed the corresponding share price

### Withdrawals

`Withdrawals` is a mapping `(operator_id, nominator_id)` → `Vec(Withdrawal)` containing all initiated withdrawals until they are unlocked. Each `Withdrawal` contains:
- `total_withdrawal_amount`: total withdrawal amount requested by the nominator that is in an unlocking state, excluding withdrawal in shares.
- `withdrawals`: a vector of individual withdrawal amounts with their unlocking block for a given domain:
    - `domain_id`: next epoch wrt to the epoch where the withdrawal was initiated
    - `unlock_at_confirmed_domain_block_number`: domain block number at which this amount will be unlocked when it is confirmed
    - `amount_to_unlock`: amount of SSC corresponding to converted shares from older withdrawals
    - `storage_fee_refund`: the amount of SSC refunded from storage fee fund deposit
- `withdrawal_in_shares`: shares the nominator would like to withdraw, for a withdrawal that was initiated by a nominator and not yet converted to SSC due to unfinished domain epoch:
    - `domain_epoch`: domain and epoch id when the withdrawal was submitted
    - `unlock_at_confirmed_domain_block_number`: domain block number at which this withdrawal will be unlocked when it is confirmed
    - `shares`: shares unstaked, but yet to be converted into SSC
    - `storage_fee_refund`: the amount of SSC refunded from storage fee fund deposit corresponding to `shares`
