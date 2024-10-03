---
title: Cross-Domain Messaging (XDM)
sidebar_position: 6
description: Communication between domains and consensus chain
keywords:
    - xdm
    - decex
    - xcm
    - challenge period
    - cross-chain messaging
    - cross-domain messaging
last_update:
  date: 10/03/2024
  author: Dariia Porechna
---

This document describes the current messaging protocol between domains in a trusted code environment (permissioned runtime instantiation). This protocol describes messaging between the consensus chain and any domain and between two domains.

## Primitives

### Chain
    
A chain is a blockchain within the Subspace Network. A chain is identified as the Consensus chain or a Domain with a `DomainID`
    
```rust
    pub enum ChainId {
        Consensus,
        Domain(DomainId),
    }
```
    
### Domain
    
A Domain is a blockchain with some application modules. These applications act as senders and receivers of the messages using messaging protocol. A unique identifier identifies each application. Domain operators execute transactions bundled by other operators of the same domain when a new block is available.
    
### Trusted third party
    
A trusted third party from the point of view of the domains is the consensus chain, the farmer network for block production. Domains use consensus chain to submit transaction bundles, verify the Message proofs of `domain_a` on `domain_b` and submit fraud proofs.
    
### Channel
    
A Channel is a bi-directional connection between two domains. Channel connection is established when the `src_chain_id` initiates the channel connection open message, and  `dst_chain_id` responds with either approval or rejection. Once a connection is open, sending messages back and forth is possible. A Channel would be open until a maximum number of messages are sent. This could be configured or defaulted to the maximum possible value of the `Nonce` type. 
    
There is a deposit to open a channel between domains. Deposit should be high enough to discourage and make it economically inefficient to DDOS channel initiation connections between domains. 
    
A channel can be closed on either end by the root user. Once closed, the channel will stop sending and receiving any further messages. The Relayer will communicate to the other domain to close the channel and clean up.
    
A channel can be in one of the following states (`State`):
    
- `Initiated`: When a channel is initiated but has not received acknowledgment from the other domain.
- `Open`: When a bi-directional channel is open to relay messages between domains.
- `Closed`: When the channel is closed between the domains and stops receiving and sending new messages to the other domain.
    
A Channel is defined as follows
    
```rust
    type Channel {
    	// Unique channel identifier within DomainID namespace
    	channel_id: ChannelID
    	// State of the channel
    	state: State
    	// Next valid Inbox nonce
    	next_inbox_nonce: Nonce
    	// Next valid Outbox nonce
    	next_outbox_nonce: Nonce
      // Latest outbox message nonce for which response was received from dst_chain.
    	latest_response_received_message_nonce: Nonce
    	// Fee Model for this channel
    	fee: FeeModel
    	// Max number of messages to be in outbox at a given time on both domains.
    	max_outgoing_messages: u32
    	/// Owner of the channel
   	/// Owner maybe None if the channel was initiated on the other chain.
	maybe_owner: Option<AccountId>,
    }
```
    
### Channel Inbox
    
All the incoming messages to the domain are validated and added to a pool before processing. If specific message arrived earlier than a previous message, it is stored until the previous message(s) is processed in the order of `Nonce`.
    
### Channel Outbox
    
All messages originated from `src_chain_id` to a `dst_chain_id` will be added to this queue in the runtime state. 
    
Messages stay in the outbox of `src_chain_id` until the domain block of `src_chain_id` containing the originating extrinsic is out of the challenge period or reached archiving depth (if `src_chain_id` is consensus chain).
    
There is also a notion of back pressure by limiting maximum number of messages queued `max_outgoing_messages` to outbox of `src_chain_id`. So when `dst_chain_id` doesn’t send any message responses, this should throttle the outbox until normal operation. Message is removed from the outbox once the message response is received from the `dst_chain_id`.
    
### Channel Response Queue
    
All the message responses to the messages in the outbox are validated and added to this queue. The message responses are passed to the application units within the domain. If a response for message arrived earlier that previous message responses, then this response is stored until the previous message responses are delivered.
    
### Channel Nonce
    
Channel nonce is used to order messages with in the channel and to avoid replay attacks.
    
A domain maintains 2 nonces for each domain and channel:
    
- `Incoming nonce`: This nonce is used to order the incoming messages to the domain through the channel from other domain. The nonce starts at 0 and is incremented after each received message.
- `Outgoing nonce`: This nonce is used to order the outgoing messages from this domain to the other domains. The nonce starts at 0 and is incremented after every sent message.

### Message Proof
    
Message proof that can verify the validity of the message from the point-of-view of the consensus chain. Proof combines the storage proofs to validate messages.
    
The proof consists of the following components:
    
- MMR proof for the state root of the parent consensus block
    
```rust
    pub struct MMRProof {
    	// consensus block number below archiving depth at which this MMR proof was generated
    	consensus_block_number	
    	// Leaf data that contains consensus storage root 
    	// storage root is used to verify the `ConfirmedDomainBlocks` storage
    	leaf_data
    	// merkle proof for this MMR
    	proof
    }
```
    
- Proof of the source domain state root and XDM inclusion in runtime
    
```rust
    pub struct Proof<BlockNumber, BlockHash, StateRoot> {
    	// MMR proof, which provides the state root of consensus hash
    	MMRProof
      
      /// Storage proof that src chain state_root is confirmed on Consensus chain.
      /// This is optional when the src_chain is Consensus.
      pub domain_confirmed_proof: Option<StorageProof>,
    
    	// Storage proof that message is processed on src_chain.
      pub message_proof: StorageProof,
    }
```
    
### Message
    
Message encompasses the actual message being sent and metadata about the message itself. MessageID is a unique tuple of (`ChannelID` , `Nonce`). There are two types of Message payloads:
    
- `Protocol` payload, used by the protocol to open or close, acknowledge channel connection with other domain.
        
- `Endpoint` payload, used by the protocol to pass messages between endpoint on the `src` and `dst` domains.
        
```rust
    pub struct Message<Balance> {
        /// Chain (consensus or domain id) that initiated this message.
        pub src_chain_id: ChainId,
        /// Chain (consensus or domain id) this message is intended for.
        pub dst_chain_id: ChainId,
        /// ChannelId the message was sent through.
        pub channel_id: ChannelId,
        /// Message nonce within the channel.
        pub nonce: Nonce,
        /// Payload of the message
        pub payload: VersionedPayload<Balance>,
        /// Last delivered message response nonce on src_chain.
        pub last_delivered_message_response_nonce: Option<Nonce>,
    }
```
    
The response message follows the same structure except the `payload` contains either `Protocol(Response)` or `Endpoint(Response)`
    
### Message Lifecycle
    
Conceptually, a message can be in one of the following states during its lifecycle:
    
From the POV of the sender `src_chain_id`:

- Outboxed: A message-request is added to the outbox for the relayers to relay message to `dst_chain_id`. It stays in the outbox until the message-response is received.
- Delivered: After message-response is received and executed, the message request is cleared from the outbox.
    
From the POV of the receiver `dst_chain_id`:
    
- Inboxed: A message-request is added to the inbox for the execution and response. It is not executed until the domain block of `src_chain_id` containing the originating extrinsic is out of the challenge period or reached archiving depth (if `src_chain_id` is consensus chain).
- Cleared: After message-request is executed and message-response is constructed, the message-request is cleared from the inbox and message-response is added to the outbox.

### Relayer Component
    
A relayer component relays message from `src_chain_id` to `dst_chain_id`. Domain operators have builtin relayer to relay messages from the domain to other domains and the consensus chain. 
    
Operators on `domain_a` relay messages originating in `domain_a` to the consensus network and listen for messages destined to `domain_a` from any other domain. Messages are sent through the consensus network where all operators of all domains are present.
    
The payload for the extrinsic could be a message-request or a message-response.
    
### Fees
    
Fees are collected from the sender of the message on `src_chain_id` to pay for relay and execution of their message on both `src_chain_id` and `dst_chain_id` respectively.
    
Compute fees are computed based on weights of the exact calls performed on both `src_chain_id` and `dst_chain_id` in total. Collected compute fees for the portion of execution happening on `src_chain_id` is paid to operators of `src_chain_id` and the compute fees for the portion of execution happening `dst_chain_id`. The portion of fees that is to be distributed on `dst_chain_id` is burned on `src_chain_id` when message is added to outbox.  
    
The burnt fees are subtracted from `src_chain_id` bookkeeping balance (if it’s a domain).
    
The relay fee is split equally among operators on `src_chain_id` and `dst_chain_id` who have submitted the ER that includes the message.
    
On the source chain, this reward is distributed when the message gets the response from the `dst_chain_id`. On the `dst_chain_id`, when it receives the next message, it will collect all the messages that are marked delivered on `src_chain_id`, mints the funds, and, distributes the rewards to the relayer pool on `dst_chain_id` for each message.
    
The minted fees are added to `dst_chain_id` bookkeeping balance (if it’s a domain).
    
**Outbox Message Fees**
    
1. User `sender` sends a message from `src_chain_id`
2. `src_chain_id` collects `fees` to be paid by `sender` as follows:
    1. Compute fee for message execution on `dst_chain_id`. This amount is burnt on `src_chain_id` and minted on `dst_chain_id` later.
    2. Relay fee for the relayers on `dst_chain_id`. This amount is burnt on `src_chain_id` and minted on `dst_chain_id` later.
    3. Compute fee for message response execution on `src_chain_id`. 
    4. Relay fee for the relayers on `src_chain_id` for relaying the response.
3. Message is sent to `dst_chain_id`.
4. Once the response is received from `dst_chain_id`, `src_chain_id` distributes the rewards from `sender` to operators.
5. This message nonce is sent to `dst_chain_id` as `last_delivered_message_response_nonce` as an acknowledgement so that it can rewards its operators.
    
**Inbox Message Fees**
    
1. `dst_chain_id` receives a message from `src_chain_id`
2. `dst_chain_id` mints received fees after message validation
3. Message is processed and response is sent
4. After the delivery acknowledgement from `src_chain_id`, the `dst_chain_id` distributes the fees from `sender` equally to operators who have submitted the ER containing the message extrinsic

## High-Level Workflow

The following describes the generic message from one domain to another. This message could be a protocol message to initiate or close channel connection or an endpoint specific message through an established Channel. In either case, the base message passing remains same:

1. User submits a transaction with the message and the required fees. The funds are locked in users account.
2. Message with an assigned `nonce` is added to the `outbox` of `src_chain_id` with a runtime event issued.
3. The operator of `src_chain_id` extracts the message and prepares it to be relayed it to the transaction pool of domain `dst_chain_id`. The relayer needs to construct a storage proof to prove that this message was accepted by domain `src_chain_id` (by proving the message is included in domain `src_chain_id` runtime state), and a state root of domain `src_chain_id` (with respect to a consensus chain state root) so that domain `dst_chain_id` can verify the storage proof.
4. Operator of `src_chain_id` waits until the domain block with the ER containing the state root used to construct the storage proof is cleared from the challenge period before gossiping the message.
5. Operator of `src_chain_id` gossips the message to the consensus network where all other operators are connected.
6. Operators of `dst_chain_id` listen to gossip on consensus and takes the message bound for `dst_chain_id` into its domain transaction pool while ignoring other messages.
7. Message proof is validated and if valid added to the inbox of `dst_chain_id`.
8. Next message nonce is taken from the inbox of `dst_chain_id`.
9. Message is executed and response is stored.
10. Operator of `dst_chain_id` waits until the domain block with the message transaction is cleared from the challenge period before gossiping the message response.
11. Message response on  `src_chain_id` is validated using storage proofs on the consensus chain.
12. Next Message response nonce is submitted to the endpoint and message is removed from the outbox of `src_chain_id`.
13. When the `src_chain_id` prepares the next message, it will include the latest message nonce that was successful as part of the payload to notify `dst_chain_id` of message response acknowledgement.

![XDM](/img/XDM.png)

## Networking

The messaging protocol uses the consensus network to relay messages, since all the operators of all the domains must also be connected to the consensus network.

This model assumes that there is at least one `dst_chain_id` domain operator to pick the transaction and include in the bundle. If there are no operators to pick the transaction, message could be undelivered until its resubmitted in the network.

## Type definitions

- `ChainId`: enum that identifies whether the chain is Consensus or a Domain with `DomainId`
- `DomainID`: uniquely identifies a given Domain, `U32`.
- `ChannelId`: uniquely identifies a channel, `U256`.
- `AccountId`: is the public key of the User account
- `Nonce`: is an incrementing value used for ordering message and avoid replay attacks. We also use nonce as the message ID for a given domain for a given channel, `U256`.
- `MessageId`: uniquely identifies a message, a tuple `(ChannelId, Nonce)`
- `EndpointId` : represents a unique id of the endpoint on a domain, `U64`.

## Functions

Detailed description of each function required to be present in the protocol.

## Chain Allow List

Consensus chain maintains a `ChainAllowList` to keep track of the authorized domain chains that can establish channels with the Consensus chain. `ChainAllowList` can be defined at Genesis and can be updated later by the sudo account adding or removing chains.

When a Consensus chain receives an `initiate_channel` XDM to open the channel, if the `src_chain` is in the allowlist, then channel is opened else XDM is rejected.
Practically, this means that a newly initialized domain chain needs to be approved by governance and added to the Consensus chain's `ChainAllowList` before it can initiate a channel with the Consensus chain.

Similarly, each domain chain maintains its own `DomainChainAllowList` to keep track of the authorized domains it can establish channels with. This allows the domains to control and restrict which other domains they want to interact with. Updating domain-specific lists is done within a domain by the domain's sudo or governance, without consensus chain approval.

### Initiate Channel

1. Channel `initiate_channel` transaction is sent by the root user of the domain.
2. If the domain is in the allow list, the next available `ChannelID` is assigned to the new channel.
3. If no Channel exits, Channel is created and set to `Initiated` status and cannot accept or receive any messages yet.
4. `Protocol` payload message to open the channel is added to the `src_chain_id` domain outbox with nonce `0` 

### Open Channel

Before sending any messages, domain needs to have an channel open with the `dst_chain_id`:

1. Channel is initiated by `src_chain_id` as described in [Initiate Channel](#initiate-channel)
2. Operator on `dst_chain_id` receives a message with the corresponding `Protocol` `ChannelOpen` payload and `nonce=0`.
3. Channel status is set to `Open` and a corresponding event is issued
4. Operators on `dst_domain` submits the transaction with message response to `src_chain_id` 
5. `src_domain` moves the channel state to `Open` and starts accepting messages to be sent over channel

### Close Channel

Any domain of either end of the open channel can close the channel:

1. Channel close transaction is sent by the root user.
2. Channel state is set to `Closed`
3. `Protocol` payload message to close channel is added to the `src_chain_id` outbox
4. Operator on `src_chain_id` gossips the message
5. Operator on `dst_chain_id` receives a message with the corresponding `Protocol` `ChannelClose` payload.
6. Channel close response is submitted to `src_chain_id` 

### Send message

When user wants to send message from endpoint on `src_chain_id` to an endpoint on `dst_chain_id`  with open channel to `dst_chain_id`.

1. User sends a transaction that results in a message to an endpoint on `dst_chain_id`.
2. Transaction is included in the runtime state of `src_chain_id`.
3. A next incrementing `nonce` > 0 (0 is always reserved for Channel open message) is assigned to the message bound to `dst_chain_id`.
4. Next message nonce storage is updated.
5. Execution layer stores the message in the `Outbox` and emits `new_message` event.
6. Operator of `src_chain_id` waits until the domain block with the ER containing the state root used to construct the storage proof is cleared from the challenge period before gossiping the message (or below archiving depth if `src_chain_id` is consensus chain).
7. The operator of `src_chain_id` extracts the message and prepares it to be relayed it to the transaction pool of domain `dst_chain_id`. The relayer needs to construct a storage proof to prove that this message was accepted by domain `src_chain_id` (by proving the message is included in domain `src_chain_id` runtime state), and a state root of domain `src_chain_id` (with respect to a parent consensus chain state root via MMR) so that domain `dst_chain_id` can verify the storage proof.
8. Operator of `src_chain_id` gossips the message to the consensus network where all other operators are connected.

### Receive message

When a relayer from `src_chain_id` submits the message to the inbox of the `dst_chain_id`:

1. `dst_chain_id` verifies the message by verifying the storage proof from the point of view of the consensus chain as follows:
    1. Check if the MMR proof is constructed at a finalized consensus block to ensure the `MMR::verify_proof` result is deterministic regardless of the consensus chain fork.
    2. Verifies MMR proof using consensus chain `MMR::verify_proof` function to extract the MMR leaf data and the corresponding state root of consensus chain.
    3. Using `consensus_chain_state_root`, `domain_confirmed_proof` is verified and associated domain’s `state_root` is extracted from `DomainBlockInfo`
    4. Using `domain_state_root`, `message_proof` is verified and actual XDM is extracted from the storage proof.
2. `dst_chain_id` adds the message to its inbox.
3. `dst_chain_id` listens for next message to process from the inbox in the nonce order.
4. Message is passed to the endpoint and eventually executed and response is stored for that message.
5. `dst_chain_id` takes the latest delivered message nonce on `src_chain_id` and distributes the rewards to the operators and deletes any stored state pertaining to any message with nonce below the confirmed nonce.

### Receive message response

Relayer from the `dst_chain_id` will submit the message response to the `src_chain_id`:

1. `src_chain_id` verifies the message response and adds it to the message response queue.
2. `src_chain_id` listens for next message response and submits the response to the caller module on the `src_domain`
3. `src_chain_id` marks the message nonce as the last confirmed message which is included in the next message bound to `dst_chain_id`
4.  `src_chain_id` then deletes the state pertaining to the original message from the runtime. 

## XDM delays

Since XDM is inherently a request response protocol it may require a response in some cases.

The use cases such as transfer or sending some payload where response is just an acknowledgement, it is generally ignored. With that in mind, the following table will give the time to send a message from `Any chain -> Any chain`

Where `K = Archiving depth` (currently 100 consensus blocks) and `D = Domain challenge period` (currently 14400 domain blocks)

| Domain → Any chain | Consensus → Any domain |
| --- | --- |
| K + D | K |

For XDM where response is required from, the following table captures the time in blocks

| Domain → Consensus → Domain | Consensus → Domain → Consensus | Domain A → Domain B → Domain A |
| --- | --- | --- |
| 2 * K + D | D + 2 * K | 2 * K + 2 * D |
