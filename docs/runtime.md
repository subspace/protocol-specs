---
title: Runtime
hide_title: false
sidebar_position: 5
description: Subspace runtime configuration
keywords:
    - runtime
last_update:
  date: 04/16/2024
  author: Dariia Porechna
---
A runtime in Subspace refers to the runtime logic that defines the state transition function of the chain.

- The runtime contains all the pallets (modules) that make up the logic of the blockchain. This includes consensus mechanisms, accounts, balances, governance, etc.

- The runtime defines the types, storage, and functions that the nodes will execute as they process blocks and extrinsics.

- The runtime is upgradeable, allowing to add/remove/modify pallets and logic while preserving blockchain state.

Runtimes are compiled to Wasm to be executed efficiently and securely in a sandboxed environment.

The `Runtime` struct defines the runtime configuration and pallets for the Subspace blockchain. It contains in this order:
- `System`: The FRAME system pallet that provides core low level functionality and types for accounts, blocks, miscellaneous runtime APIs like depositing logs, allows managing runtime constants and parameters, etc.
- `Timestamp`: A pallet that provides timestamp functionality for blocks, extrinsics and events.
- `Subspace`: A custom pallet for Subspace consensus that provides the core logic needed to coordinate farmers.
- `OffencesSubspace`: A custom pallet for managing offences for the Subspace consensus layer. Some key offences it handles include block and vote equivocation and other offences related to consensus participation. The pallet has logic and storage to detect these offences, record them, and determine appropriate penalties.
- `Rewards`: A custom pallet for managing farmer rewards for blocks and votes.
- `Balances`: A pallet that manages account balances.
- `TransactionFees`: A custom pallet for transaction fees.
- `TransactionPayment`: A pallet that provides fee calculation and payment.
- `Utility`: A pallet for useful runtime functions.
- `Domains`: The custom pallet for implementing logic and storage interactions for domain-related actions like registering domains, depositing funds, withdrawing, etc. This includes reading and writing from storage, emitting events, returning errors, basic logic and validation, and calling into other pallets.
- `RuntimeConfigs`: A custom pallet for runtime configurations.
- `Vesting`: A pallet for locked vesting of token grants.
- `Mmr`: A pallet for MMR proofs.
- `SubspaceMmr`: A custom pallet for Subspace MMR proofs.
- `Messenger`: A custom pallet for cross-chain messages, including between consensus and domains and intra-domain.
- `Transporter`: A custom pallet to transfer funds between consensus chain and domains.
- `Sudo`: A pallet that allows superuser access.

