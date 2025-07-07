# Arithmetic dust

When doing floating number arithmetic, dust is inevitable due to limited accuracy.

In [the staking protocol](staking.md), floating number arithmetic is used for conversion between the stake and the share, we need to carefully choose the rounding direction in every conversion and ensure the dust is always flavored the protocol instead of the user because the latter can potentially lead to exploitation.

# Invariant in staking

Within the staking protocol, the operator pool track the total stake and the total share in the `operator.current_total_stake` and `operator.current_total_shares` storage respectively. The share price is calculated as `current_total_shares / current_total_stake`. While individual nominator track their own share in the pool in the `Deposits` storage (noted as `nominator.shares` for convenience), for which they are entitled to withdraw.

There are 3 invariants in the protocol that should always hold:

## INVARIANT_1: `current_total_stake >= current_total_shares`

Initially, when the operator just registered, the operator owner is the first and only nominator, `current_total_stake:current_total_shares = 1:1` and is equal to the operator's deposit. When the operator receives reward, the reward is added to `current_total_stake` while the `current_total_shares` remains unchanged thus resulting in the share price increased `current_total_stake > current_total_shares`.

If the share price decreased during deposit/withdraw/unlock/slash, it means the reward (if any) is burned or stolen silently. And if the invariant broke i.e. `current_total_stake < current_total_shares`, it means there is nominator losing its stake and part of any new deposit will be burned immediately when joining the operator pool.

NOTE: Even during slashing, the operator's stake is fully slashed (not partially), and each nominator's stake and share will be removed from the pool, so slashing won't cause the share price decrease.

## INVARIANT_2: `current_total_shares >= sum(nominator.shares)`

The `current_total_shares` is expected to be the sum of all the nominator's shares in the pool (excluding pending deposits and withdrawals in the current epoch).

If this invariant broke i.e. `current_total_shares < sum(nominator.shares)`, it means there is nominator that entitled more share than it should be, and by withdrawing the extra share before other nominators, it essentially steals stake from other nominators because there is a check to reject the withdraw request after `current_total_shares` become zero.

## INVARIANT_3: `current_total_stake >= sum(share_to_stake(nominator.shares))`

NOTE: `INVARIANT_3` is an extension of `INVARIANT_2` accounted with `share-to-stake` conversion.

`current_total_stake` is an accumulation of the nominator deposit and the operator reward, since accumulation is simply addition, there is no arithmetic dust, thus `current_total_stake` represents the actual balance that all the nominators in the pool together owned and entitled to unlock. Any fund unlocked beyond `current_total_stake` is essentially minted out of thin air.

# Arithmetic in staking

The arithmetic in staking is happening in 3 parts:

### The individual nominator

Within an epoch, when a nominator deposits or withdraws, it keeps track of the deposited stake and the withdrawn share. After the epoch transition, and the share price is available, it can:
- Convert the deposited stake to share, for which it is entitled to withdraw later
- Convert the withdrawn share to stake, for which it is entitled to unlock later

### The operator pool

Within an epoch, the operator pool accumulates all the deposited stake in `deposits_in_epoch` and all the withdrawn shares in `withdrawals_in_epoch`. During epoch transition, it will add the reward (if any) to `current_total_stake` and then calculate a new share price as `current_total_shares / current_total_stake`. With this share price, it:
- Convert the `deposits_in_epoch` to share, and add `deposits_in_epoch` and this share to `current_total_stake` and `current_total_shares` respectively
- Convert the `withdrawals_in_epoch` to stake, and add `withdrawals_in_epoch` and this stake to `current_total_shares` and `current_total_stake` respectively

### Nominator unlock and slash

NOTE: The unlock here refers to the nominator unlock after the operator is de-registered, this is different from the `unlock_fund` after withdraw.

The unlock and slash can be seen as a variant of the nominator withdraw:
- The nominator is fully withdrawing all its shares.
- The share is converted to stake based on the latest share price, and the share and stake are removed from the operator pool's `current_total_shares` and `current_total_stake` directly (not through epoch transition).
- For unlock, the stake is transferred to the nominator account. For slash, the stake is transferred to the treasury.

## Arithmetic rounding direction

Arithmetic dust is inevitable for stake-share conversion since the share price is a floating number. Assume `stake_to_share` and `share_to_stake` are perfect arithmetics with no dust, but wherever they show up there must be an associated dust `D`, e.g. `stake_to_share(x) - D` means convert `x` stake to share with rounding down. 

### The operator pool convert `deposits_in_epoch` to share: rounding down

If:
- Rounding up, there are `D` more shares added to `current_total_shares`, essentially breaking `INVARIANT_1`.
- Rounding down, there are `D` less shares added to `current_total_shares`, essentially giving out the dust as a reward to the pool and increasing the share price.

### The operator pool convert `withdrawals_in_epoch` to stake: rounding down

If:
- Rounding up, there are `D` more stakes removed from `current_total_stake`, essentially breaking `INVARIANT_1`.
- Rounding down, there are `D` less stakes removed to `current_total_stake`, essentially leaving the dust as a reward to the pool and increasing the share price.

#### The individual nominator converts deposited stake to share: rounding down

If:
- Rounding up, there are `D` more shares giving out to the nominator, essentially breaking `INVARIANT_2`.
- Rounding down, there are `D` less shares the nominator entitled to withdraw, essentially leaving the dust in the pool that will never withdraw and will be given to the treasury after all nominators are unlocked.

#### The individual nominator converts the withdrawn share to stake: rounding down

If:
- Rounding up, there are `D` more stake the nominator can unlock, essentially minting `D` stake out of thin air.
- Rounding down, there are `D` less stake the nominator can unlock, essentially burning `D` stake.

## Connection between the stake-share conversion in the individual nominator and the operator pool

### Deposit: stake-to-share conversion

Within a given epoch, assuming there are `n` nominators deposited `stake_0, .., stake_n` respectively. So:
```rust
// For individual nominator:
for stake_i in  stake_0, .., stake_n {
    nominator.balance -= stake_i
    nominator_i.shares += stake_to_share(stake_i) - D_i
}

// For the operator pool:
deposits_in_epoch = sum(stake_0, .., stake_n)

operator.current_total_stake += deposits_in_epoch
operator.current_total_shares += stake_to_share(deposits_in_epoch) - D
```

The update of the deposited stake on both the individual nominator and the operator pool are pure addition with no arithmetic dust. While the update of the share is based on the stake-to-share conversion, and the only connection between the nominator share and the `operator.current_total_shares` is the same share price that they use to convert deposited stake.

For the `INVARIANT_2` to hold:
```rust
stake_to_share(deposits_in_epoch) - D >= sum(stake_to_share(stake_i)) - D_i)

stake_to_share(deposits_in_epoch) - D >= sum(stake_to_share(stake_i)) - sum(D_i)

-D >= -sum(D_i)

D <= sum(D_i)
```

So the sum of the dust of all the individual nominator's stake-to-share conversion must be larger or equal to the dust of the operator's stake-to-share conversion, otherwise, `INVARIANT_2` will be broken. For `D <= sum(D_i)`, the share `sum(D_i) - D` is left in the pool that no one is entitled to withdraw and is given to the treasury after all nominators are unlocked.

### Withdraw: share-to-stake conversion

Within a given epoch, assuming there are `n` nominators withdraw `share_0, .., share_n` respectively:

```rust
// For individual nominator:
for share_i in  share_0, .., share_n {
    nominator.shares -= share_i;
    nominator.balance += share_to_stake(share_i) - D_i
}

// For the operator pool:
withdrawals_in_epoch = sum(share_0, .., share_n)

operator.current_total_shares -= withdrawals_in_epoch
operator.current_total_stake -= share_to_stake(withdrawals_in_epoch) - D
```

The update of the withdrawn share on both the individual nominator and the operator pool are pure subtraction with no arithmetic dust. While the update of the stake is based on the share-to-stake conversion, and the only connection between the nominator unlocked stake and the `operator.current_total_stake` is the same share price that they use to convert withdrawn shares.

For the `INVARIANT_3` to hold:
```rust
share_to_stake(withdrawals_in_epoch) - D >= sum(share_to_stake(share_i)) - D_i)

share_to_stake(withdrawals_in_epoch) - D >= sum(share_to_stake(share_i)) - sum(D_i)

-D >= -sum(D_i)

D <= sum(D_i)
```

So the sum of the dust of all the individual nominator's share-to-stake conversion must be larger or equal to the dust of the operator's share-to-stake conversion, otherwise, `INVARIANT_3` will be broken. For `D <= sum(D_i)`, the stake `sum(D_i) - D` is burn.

NOTE: The nominator unlock and slash can be seen as a variant of full withdrawal where `n = 1` and `withdrawals_in_epoch = share_1 = nominator.shares` so `D = D_1`, `INVARIANT_3` is always held in these cases.
