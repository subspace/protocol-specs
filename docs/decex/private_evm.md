---
title: Private EVM
hide_title: false
sidebar_position: 8
description: Subspace private Ethereum runtimes
keywords:
    - runtime
    - evm
    - ethereum
last_update:
  date: 01/28/2025
  author: Teor
---
A "private" EVM instance uses an allow list to limit which users can create contracts.
After contract deployment, any user can call existing contracts.

## Core Functionality

The pallet filters contract creation calls based on an Ethereum account ID allow list:
- `pallet-ethereum` calls are filtered by the signer of the self-contained call. This includes `Legacy`, `EIP1559`, and `EIP2930` transactions.
- `pallet-evm` calls are filtered by the signer of the runtime call, which is typically the domain owner. This includes `create` and `create2` calls. If unsigned contract creation calls are permitted by other runtime settings, they are only allowed if the allow list is set to `Anyone`. The `source` field inside the transaction is ignored.

Contract calls nested within `pallet-utility` calls  are allowed or rejected accurately, regardless of their nesting depth. (Nested transactions use some temporary memory, but don't use stack-based recursion.)

Rejected transactions have a custom error code `ERR_CONTRACT_CREATION_NOT_ALLOWED`.

## Pallets

The private EVM functionality is implemented via a runtime pallet:
- `EVMNoncetracker`: A custom pallet used to track EVM nonces, and the EVM contract creation allow list. The crate is called `pallet-evm-tracker`, but existing runtimes keep the `EVMNoncetracker` name to preserve their storage.

This pallet depends on some upstream pallets:
- `Utility`: A pallet allowing calls to be batched or wrapped inside other calls. (Its other low-level functionality is not used by `pallet-evm-tracker`.)
- `Ethereum`: Ethereum-compatible transactions.
- `EVM`: An EVM hosted on Substrate, using a Substrate-specific transaction format.

## Global Parameters

_None_

## Runtime Instance Parameters

The `DomainConfig` can be used to configure the initial contract creation allow list. The relevant parameter is:

`DomainConfig`
    - `domain_runtime_config`: configurations that are specific to each domain type:
        - `Evm`:
            - `initial_contract_creation_allow_list`: The accounts that are initially allowed to create contracts on this EVM domain.

If no list is configured, the default configuration allows anyone to create Ethereum contracts.

## Pallet Calls

Listed in the order of call index in the pallet.

### set_contract_creation_allowed_by

`set_contract_creation_allowed_by(contract_creation_allowed_by)`

The domain owner can replace the current contract creation allow list with a new list. This list applies to future contract creation transactions.
Existing contracts remain deployed, even if they were created by accounts that are no longer in the allow list.

## Pallet Storage Items

### AccountNonce

`AccountNonce` is used to track Ethereum account nonces. (It is not used in implementing Private EVM.)

### ContractCreationAllowedBy

`ContractCreationAllowedBy` is a list of accounts that are allowed to create contracts.

It has two variants:
- `Anyone`: any account can create signed contracts, and unsigned contract creation is allowed.
- `Accounts(list)`: a list of Ethereum Account IDs that can create contracts. If the list is empty, all contract creation transactions are rejected.

If no list has been set, anyone is allowed to create contracts by default.
