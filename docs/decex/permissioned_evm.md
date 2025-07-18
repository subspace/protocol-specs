---
title: Permissioned Auto EVM
hide_title: false
sidebar_position: 8
description: Autonomys permissioned Ethereum runtimes
keywords:
    - runtime
    - evm
    - ethereum
    - permissioned
last_update:
  date: 04/14/2025
  author: Teor
---

A "permissioned" Auto EVM instance uses an allow list to limit which users can create contracts.
After contract deployment, any user can call existing contracts.

## Core Functionality

The pallet filters contract creation calls based on an Ethereum account ID allow list:
- `pallet-ethereum` calls are filtered by the signer of the self-contained call. This includes `Legacy`, `EIP1559`, and `EIP2930` transactions.
- `pallet-evm` calls are filtered by the signer of the runtime call, which is typically the domain owner. This includes `create` and `create2` calls. If unsigned contract creation calls are permitted by other runtime settings, they are only allowed if the allow list is set to `Anyone`. The `source` field inside the transaction is ignored.

Contract calls nested within `pallet-utility` calls  are allowed or rejected accurately, regardless of their nesting depth. (Nested transactions use some temporary memory, but don't use stack-based recursion.)

Rejected transactions have a custom error code `ERR_CONTRACT_CREATION_NOT_ALLOWED`.

Contract creation calls nested within `pallet-domain-sudo` calls are rejected because they are not inherents.

## Pallets

The Permissioned Auto EVM functionality is implemented via two runtime pallets:
- `EVMNoncetracker`: A custom pallet used to track EVM nonces, and the EVM contract creation allow list. The crate is called `pallet-evm-tracker`, but existing runtimes keep the `EVMNoncetracker` name to preserve their storage names.
- `Domains`: The `send_evm_domain_set_contract_creation_allowed_by_call` in `pallet-domains` can be used by sudo or the domain owner to change the allow list on Permissioned EVMs.

`pallet-evm-tracker` depends on some upstream pallets:
- `Ethereum`: Ethereum-compatible transactions.
- `EVM`: An EVM hosted on Substrate, using a Substrate-specific transaction format.

## Global Parameters

_None_

## Runtime Instance Parameters

The `DomainConfig` can be used to configure the initial contract creation allow list. The relevant parameter is:

`DomainConfig`
    - `domain_runtime_config`: configurations that are specific to each domain type:
        - `Evm`:
            - `Public`: a public EVM where the contract creation allow list can't be changed (even by the domain owner or sudo)
            - `Private { initial_contract_creation_allow_list }`: A Permissioned EVM, with the accounts that are initially allowed to create contracts on this EVM domain. (It is called "Private" for backwards compatibility.)

The default configuration is `Public`.

## Pallet Calls

### pallet-domains

#### send_evm_domain_set_contract_creation_allowed_by_call

`send_evm_domain_set_contract_creation_allowed_by_call(domain_id, contract_creation_allowed_by)`

The sudo account or domain owner can replace the current contract creation allow list with a new list. This list applies to future contract creation transactions.

Existing contracts remain deployed, even if they were created by accounts that are no longer in the allow list.

### pallet-evm-tracker

#### set_contract_creation_allowed_by

`set_contract_creation_allowed_by(contract_creation_allowed_by)`

The `send_evm_domain_set_contract_creation_allowed_by_call` is turned into an inherent, which updates the pallet storage via this call.

## Pallet Storage Items

### pallet-domains

#### DomainRegistry

Used to check if the domain is a Permissioned EVM, before accepting the `send_evm_domain_set_contract_creation_allowed_by_call`.

Also holds the `initial_contract_creation_allow_list`, which is applied to Permissioned EVM domain storage at domain instantiation.

#### EvmDomainContractCreationAllowedByCalls

Temporary storage for the `send_evm_domain_set_contract_creation_allowed_by_call` in this block, if there is one.

### pallet-evm-tracker

#### AccountNonce

`AccountNonce` is used to track Ethereum account nonces. (It is not used in implementing Permissioned EVMs.)

#### ContractCreationAllowedBy

`ContractCreationAllowedBy` is a list of accounts that are allowed to create contracts.

It has two variants:
- `Anyone`: any account can create signed contracts, and unsigned contract creation is allowed.
- `Accounts(list)`: a list of Ethereum Account IDs that can create contracts. If the list is empty, all contract creation transactions are rejected.

