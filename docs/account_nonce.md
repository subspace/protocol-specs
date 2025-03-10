---
title: Account nonce
hide_title: false
sidebar_position: 5
description: Subspace account nonce
keywords:
    - account
    - nonce
last_update:
  date: 03/07/2025
  author: Ning Lin
---
The nonce is an integer value in the account data. The nonce is attached to the transaction to be signed and is increased by one for every transaction that is included on-chain. A signed transaction that contains a nonce that doesn't match the nonce in the account data will be rejected to include on-chain, this essentially prevents replaying of a previous on-chain signed transaction.

## Account reap
Refer to [Existential Deposit and Reaping](https://wiki.polkadot.network/docs/learn-accounts#existential-deposit-and-reaping).

## Replay attack
Refer to [Replay Attack](https://wiki.polkadot.network/docs/transaction-attacks#replay-attack).

## Default nonce for new account
To futher mitigate the potential replay attack for mortal transactions, in both the consensus chain and any domain chain, when a new account is created its default nonce value is set to the current block number (rather than 0 or a any other constant value). This ensures if an account is reaped and then later re-created, in most cases, the new account's nonce is larger than the previous nonce before the account was reaped, which invalidates all previously signed transactions.

## Compatibility
The new default nonce value mechanism doesn't affect the nonce value of any existing account that is created before this mechanism is activated in the network.

For new accounts that are created (or re-created) with this mechanism, its default nonce value will be set to the block number in which the account is created. So when constructing a signed transaction for a new (or potentially reaped) account, tools and custom code should always query the account nonce from on-chain data, instead of assuming a nonce value.
