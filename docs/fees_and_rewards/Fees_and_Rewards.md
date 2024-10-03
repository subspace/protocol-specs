---
title: Fees & Rewards Specification
sidebar_position: 1
description: Fees & Rewards Specification
keywords:
    - fees
    - rewards
    - WIP
last_update:
  date: 10/03/2024
  author: Dariia Porechna
---
import Collapsible from '@site/src/components/Collapsible/Collapsible';


## Terminology

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


<!-- <div align="center">
    <img src="/img/Fees & Rewards Specification_Stack_and_flow.png" alt="Fees & Rewards Specification Stack and Flow" />
</div> -->

### **Farmers Balance**

Balance held by users who pledge storage and participate in consensus by farming. Farmers may:

- Receive storage fees for the transactions and domain bundles they include in consensus blocks.
- Receive priority fees (tips) for the transactions and (potentially) domain bundles they include in consensus blocks.
- (Potentially) receive a compute fee cut from domain operators for domain bundles they include in consensus blocks.
- Receive block proposer rewards from the Protocol Issuance.
- Receive voting rewards issued by the protocol.
- Transfer balance.
- Transfer (lock) balance for purposes of nomination or operator staking into a Staking Pool.


### **Operators Staking Pool**

Balance held by a Staking Pool that consists of an Operator and Nominators shares as well as compute fees earned by the Operator. The Pool may:

- Receive compute fees from transactions the Operator executes and provides Execution Receipt for.
- (Potentially) receive priority fees (tips) for transactions they include in bundles.
- (Potentially) receive a storage fee cut from farmers for transactions they execute and provide Execution Receipt for.
- (Potentially) receive with compute rewards subsidy from Protocol Issuance.
- Be slashed for operator misbehavior.

### **Nominators Balance**

Balance held by nominators of the domains (regardless of whether the user is also a farmer or not) that is not currently staked. Nominators may:

- Deposit stake onto a Staking Pool
- Receive withdrawn stake from Staking Pool

*Note: this group is distinguished from Holders and Farmers, as nominating holders and farmers may exhibit different behavioral patterns compared to those who do not nominate*

### **Operators Balance**

Balance held by domain operators that is not currently staked. Operators may:

- Deposit stake onto a Staking Pool
- Receive withdrawn stake from Staking Pool

### **Protocol Issuance**

Supply of not yet minted credits:

- Distributes proposer block rewards.
- Distributes voter block rewards.
- Distributes data block rewards.
- (Potentially) Distributes compute rewards.
- Allocates direct allocations to holders' balance (only at genesis).

### **Holders Balance (incl. Foundation, Investors & Users)**

Balance held by users who do not pledge storage and participate in consensus by farming. Holders may:

- Receive direct allocations from the Protocol Issuance (only at genesis).
- Transfer balance.
- Transfer (lock) balance for purposes of nomination or operator stake into a Staking Pool.

</Collapsible>

## Dynamic Issuance

As opposed to having a fixed issuance rate, the Subspace Network implements a dynamic issuance rate based on network usage, where, roughly, the inflation rate is inversely proportional to the utilization rate of the blockspace. 

TLDR: The farmer who proposed a block gets some fresh SSC + fees, and voters get some fresh SSC regardless of what the proposer got.


[Dynamic Issuance Specification](docs/fees_and_rewards/Dynamic_Issuance.md)


## Consensus Extrinsic Fees

When an extrinsic is submitted to the blockchain, the signer must cover the fees associated with this extrinsic. A fee consists of the following components:

- storage fee
- compute(execution) fee
- optional priority fee (aka tip) ≥ 0

### Storage Fees

A storage fee (per byte) pays for the blockspace the extrinsic occupies and its eventual archival. It is computed as a function of the credit supply issued to date and the space availability in the network.

<center>

$\text{storage fee per byte}  = \frac{\text{total credit supply}}{\text{total space pledged}/\text{min replication factor}-\text{history size}} \frac{shannons}{byte}$

$\text{storage fee} \left(\text{tx}\right) = \text{storage fee per byte}*\text{length(tx)}\ shannons$
</center>

Implemented as 
<center>
```rust
transaction_byte_fee = credit_supply / max(TotalSpacePledged / MinReplicationFactor - BlockchainHistorySize, 1)
```
</center>
The intuition behind this formula is: given all the coins in existence to buy up all the storage pledged, how much would be the cost? The total credit supply includes tokens issued by the protocol as rewards and tokens issued under vesting grants (regardless of whether they have vested) minus burnt tokens. Locked or staked tokens on domains are also included as they are used to pay for storage fees of domain transactions.

A `transaction_byte_fee()` value computed on block finalization is persisted in the state and is valid for the next block. This value is used to validate extrinsics for inclusion in the next block. On initialization of the next block, this “next” value is moved to the current and used to deduct storage fees until the new value is computed during block finalization.

### Compute (Execution) Fees

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



### Bundle Storage Fees

As a special case of Consensus Extrinsic Fees, the protocol defines Bundle Storage Fees. A bundle in this context is extrinsic in itself, submitted by a domain operator (using `submit_bundle` runtime call), containing other extrinsic submitted by their respective signers.

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

The `ER::block_fees` field stores the fees split by storage and compute fees (similar to how the consensus chain stores block fees). The fraud proof for this field  ([**Invalid Block Fees** ](docs/decex/fraud_proofs.md#invalid-block-fees)) handles both parts. The [**Inherent Extrinsic**](docs/decex/fraud_proofs.md#inherent-extrinsic) fraud proof variant handles the invalid inherent proof for `transaction_byte_fee`.

When registering onto a domain, a percentage $s$ (currently 20%) of the operator’s stake is transferred to a “storage fee fund”. A `storage_fund_account` is a separate account from stake, derived uniquely from operator public key. The storage fee for a bundle $B$ will be paid from this account. 
We can estimate the minimum operator stake required to be able to produce bundles for a challenge period.

Any subsequent operator&nominator stake deposits will automatically allocate the same percentage $s$ to the `storage_fund_account`. Unlike staking deposits that are locked in the nominator account in `pallet_balances`, a % required for storage fees is transferred to `storage_fund_account` sub-account for this operator.

Every nomination deposit gives the same  $s$ %  to storage fees reserve like the operator deposit. Storage fees are shared with nominators according to their shares in the pool for withdrawals, however, the amount of `storage_fund_account` and current epoch storage fees do not influence the share value.
Withdrawal amounts are converted to shares according to end of epoch share value and the same amount of shares is withdrawn from `storage_fund_account`. See [example](#deposit--withdraw-example).

If the `storage_fund_account` does not have enough funds to pay the consensus chain for blockspace, the operator cannot submit a new bundle (or only include as many tx as they can pay for). They can either top it up via a deposit or wait until some of the rewards clear the challenge period (both take effect at the end of epoch).
After the domain block that executes the bundle $B$ clears the challenge period, the storage fees for the txs in the bundle will go to `storage_fund_account` of the bundle author (while the compute fees go to ER producer). If the tx was duplicated across multiple bundles (of different authors), its storage fee gets split between all bundle authors who bundled it. The same author should not be allowed to duplicate a tx in his bundles, so they will only get the fee part once.

If the operator is slashed, their `storage_fund_account` is slashed too.
If the operator or nominator withdraws below minimum stake (or deregisters) they are paid back all their shares in both stake and `storage_fund_account`.


Every nomination deposit gives the same  $s$ %  to storage fees reserve like the operator deposit. Storage fees are shared with nominators according to their shares in the pool for withdrawals, however, the amount of `storage_fund_account` and current epoch storage fees do not influence the share value (to sustain our current assumption of increasing share value).
Withdrawal amounts are converted to shares according to end of epoch share value and the same amount of shares is withdrawn from `storage_fund_account`. See example.


If the `storage_fund_account` does not have enough funds to pay the consensus chain for blockspace, the operator cannot submit a new bundle (or only include as many tx as they can pay for). They can either top it up via a deposit or wait until some of the rewards clear the challenge period (both take effect at the end of epoch).
After the domain block that executes the bundle $B$ clears the challenge period, the storage fees for the txs in the bundle will go to `storage_fund_account` of the bundle author (while the compute fees go to ER producer). If the tx was duplicated across multiple bundles (of different authors), its storage fee gets split between all bundle authors who bundled it. The same author should not be allowed to duplicate a tx in his bundles, so they will only get the fee part once.


If the operator is slashed, their `storage_fund_account` is slashed too.
If the operator or nominator withdraws below minimum stake (or deregisters) they are paid back all their shares in both stake and `storage_fund_account`.



<div align="center">
    <img src="/img/Fees & Rewards Specification_Bundle-st-fee.png" alt="Bundle Storage Fees" />
</div>


**Refund**

When the domain block containing the bundle is confirmed, the total storage fees (`total_storage_fees=ER::total_fees.storage_fees`) are refunded back to the `storage_fund_account`s of the operators who authored the bundles included in this block. 

Let `paid_storage` be the amount of fees this operator paid for their bundle and `total_paid_storage` be the total all operators paid in this block. Because `total_storage_fees` in this block does not necessarily equal `total_paid_storage` (may be more due to higher price on domain or less due to unaccounted duplication) we refund operators proportionally to what they have paid.

`refund_amount = total_storage_fees * (paid_storage/total_paid_storage)`

## Deposit & Withdraw example
<Collapsible title="Example">


Operator $O$ has staked 100 SSC with a minimum nominator stake of 10 SSC and nomination tax of 5%. Assume the storage fee reserve is 20%. The operator has to reserve 20 SSC for storage fees. Operator $O$ has 2 nominators $N_1 $ and $N_2$ each staked 50 SSC and reserved 20% = 10 SSC each for storage fees. Initially $\text{shares\_per\_ssc} = 1$, so $O$ gets 80 shares, and $N_1$ and $N_2$ each get 40 shares and $
\text{total\_shares}=80+40+40=160$ in the stake and the same shares in the storage fee reserve. 

Deposits:

- $O$: `shares`=80, `storage_fee_deposit`=20 SSC
- $N_1$: `shares`=40, `storage_fee_deposit`=10 SSC
- $N_2$: `shares`=40, `storage_fee_deposit`=10 SSC

total shares: 160, 
total stake: 160, 
shares per ssc: 1, 
storage fee fund balance:40


In the next epoch, the pool has earned 20 SSC of compute fees and refunded an extra 4 SSC of storage fees, and the operator took 5% of compute fees as a commission (1 SSC). The pool stake is now$ 160+20=180$ SSC and storage reserve is now $40+4=44$ SSC.
The pool end-of-epoch $\text{shares\_per\_ssc}$ is now $160/(160 + 20 * (1-0.05)) = 0.893855$. Notice that 4 SSC of storage fees do not count into current epoch rewards used for this calculation, which allows us to sustain our current assumptions of increasing share value despite fluctuating size of storage fee reserve. 
If a new nominator $N_3$ stakes 67.2 SSC, 13.44 SSC will be reserved for storage fee fund, and the $\text{shares}$ they will get is $((67.2-13.44) * 0.893855) = 48$. The pool total stake becomes $181+53.76=234.76$ SSC, total shares $160+24+1$=209 and storage fee reserve 57.44 SSC.


Deposits:

- $O$: `shares`=81, `storage_fee_deposit`=20.05 SSC
- $N_1$: `shares`=40, `storage_fee_deposit`=10 SSC
- $N_2$: `shares`=40, `storage_fee_deposit`=10 SSC
- $N_3$: `shares`=48, `storage_fee_deposit`=13.44 SSC

total shares: 209, 
total stake: 234.76, 
shares per ssc: 0.893855, 
storage fee fund balance: 57.44

**Generic withdrawal formula:**

The total withdraw amount the nominator gets is (withdrawn from stake) + (withdrawn from storage fund)

withdrawn from stake = `withdraw_shares/shares_per_ssc`

withdrawn from storage fee fund =
`withdraw_shares/shares * storage_fee_deposit/total_storage_fee_deposits * storage_fee_fund_account_balance`

The nominator’s known deposit is updated
`storage_fee_deposit = storage_fee_deposit(1 - withdraw_shares/shares)` 
`shares = shares-withdraw_shares`

The total of all nominator deposits is updated
`total_storage_fee_deposits`=`total_storage_fee_deposits`-`withdraw_shares/shares * storage_fee_deposit`


**Withdrawal scenarios:**

1. Operator deregisters, storage fee fund > $\sum$ deposits
2. Operator deregisters, storage fee fund < $\sum$ deposits
3. Nominator completely unstakes, storage fee fund > $\sum$ deposits
4. Nominator completely unstakes, storage fee fund < $\sum$ deposits
5. Nominator partially unstakes, storage fee fund > $\sum$ deposits
6. Nominator partially unstakes, storage fee fund < $\sum$ deposits


**Scenario 1: Operator deregisters, storage fee fund > $\sum$ deposits**

The fund gets divided according to their deposit share (not stake share). Everyone gets their deposit back and little extra.

Assume storage fund is $57.44$ and `total_storage_fee_deposits`=$(20.05 + 10 + 10 + 13.44)=53.49$ 

$O$  gets $20.05/53.49*57.44=21.5$, 
$N_1$ and $N_2$ both get $10/53.49*57.44=10.74$,
$N_3$ gets $13.44/53.49*57.44=14.43$

**Scenario 2: Operator deregisters, storage fee fund < $\sum$ deposits**

The fund gets divided according to their deposit share (not stake share). Everyone loses a bit.

Assume storage fund is $50$ and `total_storage_fee_deposits`=$(20.05 + 10 + 10 + 13.44)=53.49$ 

$O$ gets $20.05/53.49*50=18.74$, 
$N_1$ and $N_2$ both get $10/53.49*50=9.35$,
$N_3$ gets $13.44/53.49*50=12.56$

**Scenario 3: Nominator completely unstakes, storage fee fund > $\sum$ deposits**

Assume storage fund is $57.44$ and `total_storage_fee_deposits`=$(20.05 + 10 + 10 + 13.44)=53.49$ 

 $N_2$ unstakes and gets $10/53.49*57.44=10.74$

The storage fund becomes $46.7$ and `total_storage_fee_deposits`=$(20.05 + 10 + 13.44)=43.49$
Everyone else can still withdraw more than they deposited.

**Scenario 4: Nominator completely unstakes, storage fee fund < $\sum$ deposits**

Assume storage fund is $50$ and `total_storage_fee_deposits`=$(20.05 + 10 + 10 + 13.44)=53.49$ 

 $N_2$ unstakes and gets $10/53.49*50=9.35$

The storage fund becomes $40.65$ and `total_storage_fee_deposits`=$(20.05 + 10 + 13.44)=43.49$
Everyone shares proportional loss unless they wait for the fund to fill up.

**Scenario 5: Nominator partially unstakes, storage fee fund > $\sum$ deposits**

Assume storage fund is $57.44$ and `total_storage_fee_deposits`=$(20.05 + 10 + 10 + 13.44)=53.49$ 

 $N_2$ unstakes $15$ of their $40$ shares and gets $15/40*10/53.49*57.44=4$

The storage fund becomes $53.44$ and `total_storage_fee_deposits`=$(20.05 + 10+(1-15/40)*10 + 13.44)=49.74$
Everyone else can still withdraw more than they deposited. $N_2$ has gained $0.25$ from storage fees.

**Scenario 6: Nominator partially unstakes, storage fee fund < $\sum$ deposits**

Assume storage fund is $50$ and `total_storage_fee_deposits`=$(20.05 + 10 + 10 + 13.44)=53.49$ 

 $N_2$ unstakes $15$ of their $40$ shares and gets $15/40*10/53.49*50=3.5$

$N_2$ known deposit is updated to `shares`$=40-15=25$ 
`storage_fee_deposit`$=10*(1-15/40)=6.25$

The storage fund becomes $46.5$ and `total_storage_fee_deposits`=$(20.05 + 10 + (1-15/40)*10 + 13.44)=49.74$
Everyone shares proportional loss unless they wait for the fund to fill up. $N_2$ has lost 0.25 on storage fees.



</Collapsible>





<Collapsible title="Fund reserved amount">


Let us estimate the amount of SSC on mainnet an operator needs to hold to pay for bundle storage fees for the first challenge period before they get paid back.
There are several parameters that influence this number:

- `transaction_byte_fee`, which in turn depends on
    - credit supply: on mainnet genesis ~57% of capped supply of SSC is going to be issue. The more we issue, the higher this number gets → higher fees.
    - “free space”: diff between pledged space and `MIN_REPLICATION_FACTOR*history_size`. To lower the fees pledged space should grow faster than history, which is consistent with what we saw in public testnets. During Space Racing we can ensure network is bootstrapped with say 2PiB.
- `avg_bundle_size` or `max_bundle_size`: If we take bundle slot probability =1 and bundle size limit = 1/6 of consensus block limit of 3.5 MiB, each bundle can be 583 KiB maximum at full utilization. On gemini-3g, bundles are on average below 5KiB.
- `challenge_period_slots` in slots: each hour is 3600 slots, a day is 86400, a week is 604800

The formula to estimate the required reserve for a domain:

`transaction_byte_fee * bundle_size * challenge_period_slots * bundle_slot_probability`

This is the amount of credits all operators on domain need in total to be able to produce bundles for a duration of challenge period at any given time.
For example, with numbers above:

<center>
$\frac{3*10^9*0.57*10^{18}}{
(2 \text{PiB} -
25*1\text{GiB})}*5\text{KiB}*86400*1\approx 336 \text{\ SSC}$
</center>

would allow a domain to produce ~5KiB bundles every slot for 1 week at mainnet launch. It’s 7 times more if challenge period is 1 week: 2350 SSC.
For full bundles, that is up to 300k SSC for a week and ~50kSSC for a day (which are arguably both prohibitively large).
We can define MinOperatorStake as a necessary condition to operate on the domain, but it does not have to be sufficient to pay for all blockspace on the max estimates. Let’s say we allow operators who can afford 1% of that reserve estimate.

</Collapsible>





<Collapsible title="Notes">


- Why don’t we charge the operator account directly? Because we want operators to stake as long as possible and for coins to stay “locked” in stake. If we charge the operator's wallet, the operator will want to withdraw rewards more often. Compute rewards are auto-staked instead.
- We separate the “storage reserve” from the stake to first, not have to change stake intra-epoch, and second so that they are not disincentivized from including bigger tx since it will not affect their relative stake weight in the domain when they have just joined.
- We have to carefully compute how much SSC should storage fee deposit (and minimum stake) have, so that the operator can pay for the bundles when they are elected until the first challenge period is over and they get paid back the storage fees.

</Collapsible>
