---
title: Transporter Precompile
hide_title: false
sidebar_position: 2
description: Cross-domain token transfer precompile for Auto EVM
keywords:
  - precompile
  - transporter
  - cross-domain
  - evm
  - transfer
last_update:
  date: 10/15/2025
  author: Jeremy Frank
---

The Transporter Precompile enables EVM smart contracts to transfer tokens from Auto EVM domains to the Autonomys consensus chain using the [Cross-Domain Messaging (XDM)](../xdm.md) protocol.

## Core Functionality

The Transporter Precompile is deployed at address `0x0000000000000000000000000000000000000800` and adds the following functionality:

- Initiate transfers from the caller on an EVM domain to an AccountId32 on the consensus chain
- Expose `minimum_transfer_amount()` to surface the current minimum transfer threshold

## Goals

- EVM-native UX: callable by EOAs and contracts like a regular Solidity interface.
- Tooling interoperability: works with common EVM tooling without custom RPCs.
- Observability: standardized `TransferToConsensus(address,bytes32,uint256)` event.

### Interoperability with EVM tooling

- Calling: use a Solidity interface (or ethers.js/web3.js ABI) targeting
  `0x0000000000000000000000000000000000000800`.
- Read-only: `minimum_transfer_amount()` supports `eth_call` for UI prechecks.
- Events: indexers can decode with the event selector of
  `keccak("TransferToConsensus(address,bytes32,u256)")`.

## Functions

### transfer_to_consensus_v1

```solidity
function transfer_to_consensus_v1(bytes32 receiver, uint256 amount) external
```

Transfers tokens from the calling EVM account to an AccountId32 on the consensus chain.

**Parameters:**

- `receiver` (bytes32): The AccountId32 of the recipient on the consensus chain
- `amount` (uint256): The amount of tokens to transfer (in Shannon units)

### minimum_transfer_amount

```solidity
function minimum_transfer_amount() external view returns (uint256)
```

Returns the minimum amount required for cross-domain transfers.

## Events

### TransferToConsensus

```solidity
event TransferToConsensus(address indexed sender, bytes32 indexed receiver, uint256 amount)
```

Emitted when a transfer to the consensus chain is initiated.

**Parameters:**

- `sender` (address indexed): The EVM address that initiated the transfer
- `receiver` (bytes32 indexed): The consensus chain AccountId32 that will receive the tokens
- `amount` (uint256): The amount of tokens transferred

## Underlying Implementation

The precompile wraps the `pallet-transporter` functionality, which:

1. **Burns Tokens**: Uses the currency pallet to burn tokens from the sender's account
2. **Creates Transfer Record**: Stores the transfer details in `OutgoingTransfers` storage
3. **Sends Cross-Domain Message**: Uses the messenger system to communicate with the destination chain
4. **Handles Confirmations**: Tracks transfer status and handles confirmations/failures

## Usage Examples

### Basic Transfer

```solidity
// Transfer 1000 tokens to consensus chain account
bytes32 consensusAccount = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
uint256 amount = 1000 * 10**18; // Assuming 18 decimals

ITransporter transporter = ITransporter(0x0000000000000000000000000000000000000800);
transporter.transfer_to_consensus_v1(consensusAccount, amount);
```

### Check Minimum Amount

```solidity
ITransporter transporter = ITransporter(0x0000000000000000000000000000000000000800);
uint256 minAmount = transporter.minimum_transfer_amount();

// Only proceed if we meet the minimum
if (amount >= minAmount) {
    transporter.transfer_to_consensus_v1(receiver, amount);
}
```

## Related Components

- **pallet-transporter**: The underlying Substrate pallet that handles cross-domain transfers
- **pallet-messenger**: Provides the cross-domain communication infrastructure
- **EVM Domain Runtime**: Hosts the precompile and manages EVM execution
- **Consensus Chain**: The destination for transfers initiated by this precompile
