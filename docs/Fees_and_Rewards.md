---
title: Fees & Rewards Specification
sidebar_position: 5
description: Fees & Rewards Specification
keywords:
    - fees
    - rewards
    - WIP
last_update:
  date: 03/29/2024
  author: Saeid Yazdinejad
---
import Collapsible from '@site/src/components/Collapsible/Collapsible';


# Terminology

- **Fees** are *payments* for transactions. Fees are paid with existing SSC. Fees include:
    - transaction storage fees for blockspace used
    - transaction weight (compute) fees based on computational resources consumed
    - transaction priority fees (aka tips)
- **Rewards** are *earnings* to network participants. Rewards are paid by the protocol itself by issuance of new SSC. This will increase/inflate the current supply up to a maximum fixed total supply. Rewards include:
    - block rewards
    - vote rewards
- Network participants will receive compensation through a combination of “rewards” and “fees”, based on their role.
    - Farmers receive rewards for block production and fees for storage
    - Operator nodes/pools receive transaction fees

<Collapsible title="Stock & Flow">

</Collapsible>

# Dynamic Issuance

As opposed to having a fixed issuance rate, the Subspace Network implements a dynamic issuance rate based on network usage, where, roughly, the inflation rate is inversely proportional to the utilization rate of the blockspace. 

TLDR: The farmer who proposed a block gets some fresh SSC + fees, and voters get some fresh SSC regardless of what the proposer got.

<!-- https://subspacelabs.notion.site/Dynamic-Issuance-Specification-3bdf63955cb943489347889775d71c24?pvs=25 -->


# Consensus Extrinsic Fees

When an extrinsic is submitted to the blockchain, the signer must cover the fees associated with this extrinsic. A fee consists of the following components:

- storage fee
- compute(execution) fee
- optional priority fee (aka tip) ≥ 0

## Storage Fees

A storage fee (per byte) pays for the blockspace the extrinsic occupies and its eventual archival. It is computed as a function of the credit supply issued to date and the space availability in the network.

<center>

$\text{storage fee per byte}  = \frac{\text{total credit supply}}{\text{total space pledged}/\text{min replication factor}-\text{history size}} \frac{shannons}{byte}$

$\text{storage fee} \left(\text{tx}\right) = \text{storage fee per byte}*\text{length(tx)}\ shannons$
</center>

<!-- Implemented as 
transaction_byte_fee = credit_supply / max(TotalSpacePledged/MinReplicationFactor - BlockchainHistorySize, 1)$ -->

The intuition behind this formula is: given all the coins in existence to buy up all the storage pledged, how much would be the cost? The total credit supply includes tokens issued by the protocol as rewards and tokens issued under vesting grants (regardless of whether they have vested) minus burnt tokens. Locked or staked tokens on domains are also included as they are used to pay for storage fees of domain transactions.

A `transaction_byte_fee()` value computed on block finalization is persisted in the state and is valid for the next block. This value is used to validate extrinsics for inclusion in the next block. On initialization of the next block, this “next” value is moved to the current and used to deduct storage fees until the new value is computed during block finalization.

## Compute (Execution) Fees

A compute fee (per weight unit) pays for the computational resources spent to execute the extrinsic.

Compute fees for the execution of extrinsics on the consensus chain (e.g., balance transfers) are collected by the block proposer. 
Compute fees for executing transaction bundles on domains are paid to the domain operators who submit the Execution Receipt containing this bundle (split between all operators who submit this ER) after the ER has cleared the challenge period.

- `WeightToFee` is the conversion rate of the weight to the native currency on the chain, currently used to calculate transaction execution fees. Currently set to 1 Shannon/weight unit (static, actual value TBD).
- `MAX_NORMAL_WEIGHT` is the weight limit of a full consensus block set to `0.75*BLOCK_WEIGHT_FOR_2_SEC` for normal txs
- `max_bundle_weight` is the weight limit of a domain bundle set to TODO

Subspace [implements](https://github.com/subspace/subspace/pull/2156) Polkadot’s [slow adjusting fee](https://research.web3.foundation/Polkadot/overview/token-economics#2-slow-adjusting-mechanism) mechanism. The fee multiplier is slightly adjusted every block based on utilization of available block weight by normal extrinsics.

- `TargetBlockFullness` ($s^*$) is the target utilization of block weight by the normal extrinsics we adjust the fees with. Currently set to `0.5`. Blocks filled less will cause the fee multiplier to decrease, and more will increase. This parameter can be adjusted depending on the observed volumes during spikes compared to average volumes, and in general it provides a trade-off between higher average fees and longer transaction inclusion times during spikes.
- $s$ denotes real block weight utilization in the previous block (`block_weight/MAX_NORMAL_WEIGHT`)
- `AdjustmentVariable` ($v$) is the fee variability factor, which controls how quickly the transaction fees adjust. A higher value causes fees to have higher block-to-block variability. Currently, 75/1 000 000

<center>
$\text{targeted adjustment parameter}=(1+v(s−s^∗)+v^2(s−s^∗)^2/2)$

$\text{compute fee multiplier} = \text{targeted adjustment parameter}*\text{prev compute fee multiplier}$

$\text{compute fee(tx)} = \text{compute fee multiplier}*\text{weight to fee}*\text{weight(tx)} \ shannons$

</center>



## Bundle Storage Fees

As a special case of [Consensus Extrinsic Fees](https://www.notion.so/Consensus-Extrinsic-Fees-e8a5f0953d7046ecaaae589a7c13bd8a?pvs=21), the protocol defines Bundle Storage Fees. A bundle in this context is extrinsic in itself, submitted by a domain operator (using `submit_bundle` runtime call), containing other extrinsic submitted by their respective signers.

Signers who submit extrinsics for execution on domains should pay respective storage and compute fees as defined by the configuration of a particular domain (i.e., in the domain’s native token, with/without dynamic adjustment, etc.), which is outside this section's scope.

With respect to the consensus chain, domain operators should pay the consensus block proposers in SSC for the blockspace that the bundles occupy according to the storage fee for that block (`transaction_byte_fee`) and bundle byte size (`bundle_size`). Both the bundle body (extrinsics), bundle header and the Execution Receipt attached to it count towards bundle size for the storage.

Storage fee for the bundle is received by the consensus block proposer (farmer) when the bundle is included in the consensus block, regardless of whether the ER in this bundle ends up invalid or the operator gets slashed in the same epoch.


**Price**

The price for storage to be deducted is injected into the domain by an inherent extrinsic carrying the `transaction_byte_fee` for the next consensus block. 

The storage fee that the domain charges to the sender of the transaction is higher (e.g., `domain_transaction_byte_fee > 2.4 * transaction_byte_fee` converted to SSC, currently 3x) than that determined by the consensus chain to make up for possible duplication of txs taking up blockspace.

This higher `domain_transaction_byte_fee` value is used during the initial validation and the execution of extrinsics on the domain side. The new value for `domain_transaction_byte_fee` for the next block is set during block execution finalization.

Higher prices should make up to the operators for fees they paid to consensus for duplicated txs.

<Collapsible title="Price Note">
 Given we have no bundle gossip (at least yet) to signal to operators that a tx was already included in a bundle (or other deduplication mechanism prior to execution phase, which is a separate discussion), an operator can only remove tx from the pool when it is included in the consensus block. But they need to produce bundles every slot, and remain “in the dark” for a few slots as to what txs other operators have already included. Because of this the same tx may be bundled multiple times by different operators and thus will have to be paid for multiple times by the domain when the user only paid once. Assuming txs signers are uniformly distributed 0..2^256-1, tx range is 2^256/3 and the average block time is 6 slots to offset the overlaps of duplicated txs between operator ranges it is sensible for domain to charge at least a 2.4x storage fee until we can reduce the duplication probability and price.
</Collapsible>


**Who pays**

The user who sends txs to the domain has to pay `domain_byte_fee` (whether in SSC or domain’s token) according to the specific domain’s rules (only once per tx, no matter if it ends up duplicated).

The operator who submits the bundle has to front-pay for the blockspace used by txs in the bundle to the farmer.

**When**

The operator pool is charged when the bundle is included in the consensus chain.

The user is charged when the domain block that includes the bundle is executed.

**How**

The `ER::block_fees` field stores the fees split by storage and compute fees (similar to how the consensus chain stores block fees). The fraud proof for this field  ([**Invalid Block Fees** ](https://www.notion.so/Invalid-Block-Fees-dd30a64b5c814367bc7e0d44e041afc0?pvs=21)) handles both parts. The [**Inherent Extrinsic**](https://www.notion.so/Inherent-Extrinsic-53b70d913daf4fdbb98dd3027fab9c09?pvs=21) fraud proof variant handles the invalid inherent proof for `transaction_byte_fee`.

When registering onto a domain, a percentage $s$ (currently 20%) of the operator’s stake is transferred to a “storage fee fund”. A `storage_fund_account` is a separate account from stake, derived uniquely from operator public key. The storage fee for a bundle $B$ will be paid from this account. 
We can estimate the minimum operator stake required to be able to produce bundles for a challenge period.

Any subsequent operator&nominator stake deposits will automatically allocate the same percentage $s$ to the `storage_fund_account`. Unlike staking deposits that are locked in the nominator account in `pallet_balances`, a % required for storage fees is transferred to `storage_fund_account` sub-account for this operator.

Every nomination deposit gives the same  $s$ %  to storage fees reserve like the operator deposit. Storage fees are shared with nominators according to their shares in the pool for withdrawals, however, the amount of `storage_fund_account` and current epoch storage fees do not influence the share value (to sustain our current [assumption](https://www.notion.so/3fb0ec6e4d204c4881a7df50ef58da8f?pvs=21) of increasing share value).
Withdrawal amounts are converted to shares according to end of epoch share value and the same amount of shares is withdrawn from `storage_fund_account`. See [example](https://www.notion.so/Fees-Rewards-Specification-WIP-1b835c7684a940f188920802ca6791f2?pvs=21).

If the `storage_fund_account` does not have enough funds to pay the consensus chain for blockspace, the operator cannot submit a new bundle (or only include as many tx as they can pay for). They can either top it up via a deposit or wait until some of the rewards clear the challenge period (both take effect at the end of epoch).
After the domain block that executes the bundle $B$ clears the challenge period, the storage fees for the txs in the bundle will go to `storage_fund_account` of the bundle author (while the compute fees go to ER producer). If the tx was duplicated across multiple bundles (of different authors), its storage fee gets split between all bundle authors who bundled it. The same author should not be allowed to duplicate a tx in his bundles, so they will only get the fee part once.

If the operator is slashed, their `storage_fund_account` is slashed too.
If the operator or nominator withdraws below minimum stake (or deregisters) they are paid back all their shares in both stake and `storage_fund_account`.


Every nomination deposit gives the same  $s$ %  to storage fees reserve like the operator deposit. Storage fees are shared with nominators according to their shares in the pool for withdrawals, however, the amount of storage_fund_account and current epoch storage fees do not influence the share value (to sustain our current assumption of increasing share value).
Withdrawal amounts are converted to shares according to end of epoch share value and the same amount of shares is withdrawn from storage_fund_account. See example.


If the storage_fund_account does not have enough funds to pay the consensus chain for blockspace, the operator cannot submit a new bundle (or only include as many tx as they can pay for). They can either top it up via a deposit or wait until some of the rewards clear the challenge period (both take effect at the end of epoch).
After the domain block that executes the bundle $B$ clears the challenge period, the storage fees for the txs in the bundle will go to storage_fund_account of the bundle author (while the compute fees go to ER producer). If the tx was duplicated across multiple bundles (of different authors), its storage fee gets split between all bundle authors who bundled it. The same author should not be allowed to duplicate a tx in his bundles, so they will only get the fee part once.


If the operator is slashed, their storage_fund_account is slashed too.
If the operator or nominator withdraws below minimum stake (or deregisters) they are paid back all their shares in both stake and storage_fund_account.


<!-- <Image> -->


**Refund**

When the domain block containing the bundle is confirmed, the total storage fees (`total_storage_fees=ER::total_fees.storage_fees`) are refunded back to the `storage_fund_account`s of the operators who authored the bundles included in this block. 

Let `paid_storage` be the amount of fees this operator paid for their bundle and `total_paid_storage` be the total all operators paid in this block. Because `total_storage_fees` in this block does not necessarily equal `total_paid_storage` (may be more due to higher price on domain or less due to unaccounted duplication) we refund operators proportionally to what they have paid.

`refund_amount = total_storage_fees * (paid_storage/total_paid_storage)`


<Collapsible title="Deposit & Withdraw example">

</Collapsible>

<Collapsible title="Fund reserved amount">

</Collapsible>


<Collapsible title="Notes">

</Collapsible>
