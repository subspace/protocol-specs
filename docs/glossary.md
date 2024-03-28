---
title: Glossary
sidebar_position: 5
description: Collection of terms and definitions used within the network.
keywords:
    - glossary
    - terminology
last_update:
  date: 03/28/2024
  author: Saeid Yazdinejad
---
import Collapsible from '@site/src/components/Collapsible/Collapsible';

<!-- A -->
## Archival Node
- Similar to the Full Node but retains all history and state since the genesis block, making it a comprehensive data repository.

## Archived History

It refers to the blockchain's historical data that has been specifically processed for preservation. This includes:

- **Transformation**: The blockchain history undergoes a transformation process, converting blocks into a format suitable for long-term storage and access.
- **Depth-Based Selection**: This history consists of blocks that have reached a certain depth from the chain's tip, ensuring a consistent approach to archiving data.

It also known as "archival history".


## Archiver

It is an implementation of the Archiving process


## Archiving

It is the transformation of Blockchain History into Archived History. It is defines by several steps:

1. **Transformation Depth**: It involves processing blocks at a certain depth from the chain's tip.
2. **Encoding and Buffering**: Blocks are SCALE-encoded and stored in a buffer.
3. **Slicing into Records**: The buffered data is sliced into records.
4. **Erasure Coding**: These records are then erasure-coded to ensure redundancy and fault tolerance.
5. **Commitment and Witnessing**: A KZG commitment is computed for both source and parity records, with a witness derived for each record.
6. **Piece Formation**: The combination of a record, its commitment, and witness forms a piece of Archived History, ready for Plotting and Farming by Farmers.

An **Archiver** implements the functionalities necessary for this process.

<!-- B -->

## Blockchain History

It refers to the entirety of blocks that constitute the blockchain. Specifically, it involves:

- **Collection of Blocks**: At its core, it represents the accumulated sequence of blockchain blocks over time.
- **Encoding**: In the Subspace context, blockchain history usually means SCALE (Simple Concatenated Aggregate Little-Endian)-encoded blocks.


## Blockchain State

It refers to the current status and data of a blockchain, resulting from the execution of transactions. This encompasses:

- **Transaction Outcomes**: The state reflects changes from transactions, such as account balances, smart contract states, and other relevant data.

## Beacon Chain

- **Core Shard Functionality**: It acts as a Blockchain Shard that other Shards commit to, serving as the foundational layer for network operations.
- **Characteristics in Subspace**:
    - **Index `0` Shard**: Designated as the Shard with index `0`, setting it apart as the primary reference point for the network.
    - **Randomness Source**: Utilized by every Shard (including itself) as a source of randomness.
    - **Global History Integration**: Integration of Archived History from all Shards into a cohesive Global History.
    - **Staking Hub**: Executors stake exclusively on the Beacon Chain only.


<!-- C -->

## Clockmaster

- A role on the Subspace Network that is responsible for running Proof-of-Time chain and maintaining the randomness beacon for the consensus chain.


## Client

Client refers to the entities involved in the client-server communication model with distinct roles and functions in the network ecosystem:

- **Light Client**: Operates by connecting to Full Nodes to process block headers without executing state transitions or storing history. Notably, it's designed for lightweight operations, such as running in a browser environment, for example, [Substrate Connect](https://github.com/paritytech/substrate-connect).
- **Browser Client**: Represents an application or library executed within a browser, facilitating interactions with the blockchain. This can occur either directly, as in the case of a Light Client, or indirectly through a Full Node's RPC, utilizing tools like the Polkadot.js API or subspace.js for blockchain interactions.

## Consensus Chain

It is a blockchain with consensus logic in the Subspace Network, designed for farmer consensus. Some key characteristics are:

- **Lightweight**: Minimized storage requirements to alleviate farmers' storage burdens.
- **Computational Simplicity**: Stripped of heavy computation to lower the processing load for farmers.
- **Fast Synchronization**: Engineered for quick updates to maintain farmer accessibility and network integrity.

Previously referred to as the "primary chain" or in the context of code inherited from the Polkadot codebase, the "relay chain" or "polkadot."

## Commitment

It refers to cryptographic assurances related to data integrity, encompassing:

- **Record Commitment**: This is a KZG commitment to the blockchain data in a Raw Record.
- **Segment Commitment**: A KZG commitment that encapsulates the hashes of all Record Commitments within an Archived History Segment, providing a verifiable snapshot of the segment's integrity.

Previously known as "records root".


<!-- D -->

## DSN

- Short for Distributed Storage Network
- Specifically in Subspace, means a network of Farmer nodes that have plotted pieces of Archival History and serve them to Clients

## DAS

- Short for Data Availability Sampling
- A method where nodes can confirm the availability of data for a block without needing to download the whole block


## Dilithium

Dilithium is the core consensus mechanism of the Subspace Network, built on the Proof-of-Archival-Storage principle. It ensures the network's data integrity and availability through a series of processes:

- **Archiving**
- **Plotting**
- **Audit**
- **Proving and Verification**

Dilithium incorporates **Proof-of-Space** and **Proof-of-Time**.

Previously referred to as "consensus v2" or "consensus v2.3," Dilithium reflects the network's evolving consensus strategy.

## Domain Operator

The Domain Operator in the Subspace Network serves a dual purpose:

- **Network Role**: Tasked with executing arbitrary computations on Domains, managing state transitions, and ensuring the ongoing operation (liveness) of the Execution Chain.
- **Software Utility**: Operates as the mechanism that executes the state transition logic for the Execution Chain, functioning as an optional component of the Full Node implementation.

**Previous Terminology**: Known in some contexts as the "executor"

## Domain

It is an application-specific blockchain, akin to layer two networks on Ethereum or parachains on Polkadot, ones on Cosmos, subnets on Avalanche, and sovereign rollups on Celestia, with unique features:

- **Gossip Network**: Each Domain operates its own gossip network, known as a domain subnet.
- **Configurable Runtime**: Domains feature a customizable runtime with settings maintained on x-net.
- **Domain Operation**: Staked executors can become Domain Operators, managing domain operations, collecting compute fees from users, and ensuring the integrity of state commitments.

Domains are anchored to and validated by the Subspace Network for enhanced security and interoperability.

<!-- E -->

## Execution Chain

The Execution Chain in the Subspace Network is a computation-focused blockchain that operates without its own consensus mechanism. It is designed for:

- **State Transition Execution**: Operators run state transitions on transaction bundles.
- **Deterministic Order**: Follows the Consensus Chain's consensus to execute transactions in a predetermined order.

**Network Implementation**: Though functioning like a complete blockchain, it is viewed as a crucial part of the network's infrastructure.

Formerly known as "secondary chain" or referred to as "cirrus," "parachain," and "cumulus" in contexts involving Cumulus-derived codebases.


<!-- F -->



## Full Node
- Engages in processing all blocks and running all state transitions, while retaining history and state for a configurable number of recent blocks.



## Farmer

In the Subspace Network, the term "Farmer" embodies both a pivotal role and a specialized software, playing a dual function in the ecosystem:

<Collapsible title="Role in the Network">

- **Consensus Maintenance**: As a crucial role within the Subspace Network, a Farmer ensures the security and integrity of the Consensus Chain. This responsibility involves participating in the network's consensus mechanism to maintain a stable and secure blockchain environment.

</Collapsible>

<Collapsible title="Software Functionality">

- **Subspace Farmer Crate**: The essence of farming within Subspace is captured in the `subspace-farmer` crate. This component is integral for:
    - **Archival History Storage**: It archives segments of the network's history onto disk, preserving a record of transactions and interactions.
    - **Block Reward Farming**: By utilizing the stored archival history, it engages in the process of farming, aiming to earn block rewards through participation in the network's consensus mechanism.
    - **Distributed Storage Network (DSN) Participation**: As a node within the DSN, it aids in data retrieval, facilitating the synchronization of new nodes, supporting other farmers, and managing data requests from various clients.
- **Versatility in Usage**: The `subspace-farmer` crate is designed for flexibility, allowing for integration as a library in applications like Subspace Desktop or operation as a standalone command-line interface (CLI) application, binary, or executable.


</Collapsible>


<!-- <Collapsible title="Future Developments">

- **Potential for New Implementations**: While the `subspace-farmer` serves as the reference implementation, the evolving nature of Subspace anticipates the introduction of alternative farmer implementations, enhancing the network's robustness and adaptability.

</Collapsible> -->


<Collapsible title="Historical Context">

- Previously, the functionalities now encompassed by the Farmer role were referred to by various terms, including "client" and "node," reflecting the evolving lexicon as the Subspace Network matures and refines its conceptual framework.

</Collapsible>

## Farming

Farming involves participating in consensus through solving a puzzle based on the previously created plot, managed by `subspace-farmer`. It includes:

- **Slot Notifications**: Listening for slot notifications from a Full Node.
- **Challenge Derivation**: Generating a local challenge.
- **Solution Search**: Finding a plot chunk that matches the solution range derived from the local challenge.
- **Solution Creation**: Responding to the challenge with a solution.
- **Block Signing**: Sealing and signing the new block as created by the Full Node to claim block rewards.

## Farmers

It refers to two distinct yet interconnected concepts:

- **Individual Contributors**: Users who operate the combined Full Node + Farmer software package, participating in the Consensus Chain to vie for block rewards.
- **Collective Operations**: The term can also denote a group or fleet of Farmer instances, for example within the context of DSN.

<!-- G -->

## Global History

Global History represents the aggregated record of all transactions and events across the entire network, encompassing all individual Subspace Blockchains (or Shards).



<!-- H -->
<!-- I -->
<!-- J -->
<!-- K -->
<!-- L -->
<!-- M -->
<!-- N -->

## Node

Within the Subspace Network, a "Node" represents a key component with distinct functionalities and roles in the peer-to-peer (P2P) network architecture.

<Collapsible title="Conceptual Role">

- **P2P Network Participant**: Conceptually, a node is a logical entity that participates in the P2P network, contributing to the network's functionality, security, and resilience.

</Collapsible>

<Collapsible title="Specific Implementation in Subspace">

- **Subspace Node**: Primarily, within Subspace, a node is implemented as a Substrate-based `subspace-node`, which:
    - **Network Connectivity**: Connects to other nodes within the P2P network, fostering a robust and interconnected network structure.
    - **History and State Maintenance**: Keeps track of the network's history and state, ensuring data integrity and continuity.
    - **Block Production**: Participates in block production for consensus, playing a critical role in the network's operation and security.
    - **Execution and RPC Endpoint**: Handles all aspects related to execution and can serve as an RPC endpoint for tools like Polkadot.js or for Farmers.
- **Operational Modes**:
    - **Full Node**
    - **Archival Node**
- **Versatility in Usage**: Like the Farmer, the Subspace Node can be integrated as a library in applications such as Subspace Desktop or function as a standalone CLI application, binary, or executable.

- Within the context of the DSN, the term "Farmer" is also used to describe a specific type of node, highlighting the diverse roles within the Subspace ecosystem.

</Collapsible>


<!-- - **Future Developments**: Although the `subspace-node` serves as the reference implementation, there is potential for alternative implementations in the future, which would augment the network's capabilities and flexibility. -->


<Collapsible title="Historical Context">

- Historically, various terms including "client" and "farmer" have been used to describe entities that now fall under the node category, reflecting the ongoing evolution and refinement of terminology within the Subspace Network.

</Collapsible>

<!-- O -->
<!-- P -->

## Plotting

It refers to the process of generating and updating plots on disk, crucial for the network's farming activities. This process is facilitated by the `subspace-farmer` tool and encompasses:

- **Initial Plot Creation**: Setting up the initial plots necessary for farming.
- **Ongoing Maintenance**: Regularly updating and replotting to accommodate the expanding blockchain history, ensuring plots remain current and effective.

## Piece

It is a unit of measurement for Archived History, representing the elemental building block from which Archived History Segments are constructed. Each Piece comprises three key components:

- Record
- Commitment
- Witness

## Plot

A Plot refers to:

- **Farming Foundation**: A collection of Sectors.
- **Physical Representation**: A Plot is a contiguous binary file written to disk.


<!-- Q -->
<!-- R -->

## Raw Record

It represents a piece of the Blockchain History, serving as the foundational "useful data" for the Proof of Archival Storage (PoAS) in the Subspace Network.

## Record

It refers to a Raw Record that has undergone transformation for the purpose of Archiving. This transformation process includes the insertion of a 0 byte after every 31 bytes of the original Raw Record.
<Collapsible title="Note">
This modification is necessary because the KZG commitment scheme operates on values up to 254 bits.
</Collapsible>

## Reconstructor

It is a program that implements the Reconstructing process, designed to revert Archived History back into its original or a usable form.

## Reconstruction

Reconstruction is the process of converting Archived History back into Blockchain History. It entails:

- **Segment-by-Segment Processing**: The transformation of pieces of Archived History, tackling one Archived History Segment at a time, back into blockchain blocks.

This allows for the initialization of new Full Nodes from genesis.

Implemented by a **Reconstructor**.

Also known as "Extraction".

<!-- S -->

## Subspace

- An overarching term that typically encapsulates everything about the project and is not limited in scope just to the blockchain or any other component specifically
- Often can be clarified to something more specific but is used interchangeably for simplicity


## Subspace Blockchain

- An overarching term that typically means Full Node that maintains both Consensus Chain and Execution Chain


## Subspace Network

- An overarching term that typically means a combination of Subspace Blockchains (all Shards) and DSN

## Subspace CLI

- A Command Line Interface application automates the tasks of Subspace Farmers and Executors by running an instance of Farmer and Full Node within the same terminal instance

## Subspace Desktop

- Conceptually a desktop application for Subspace Network, currently (temporarily) discontinued
- Specifically serves the following features
    - Running a Full Node
    - Farming by pledging space to the network
    - Running Executor (in the future)
    - Basic wallet functionality (in the future)




## Segment

A Segment refers to a structured collection of blockchain blocks, serving two specific purposes:

- **Recorded History Segment**: This is a fixed-size chunk of the Blockchain History stored temporarily in a buffer before undergoing the Archiving process. It is composed of what are termed Raw Records.

- **Archived History Segment**: After the Archiving process, a Recorded History Segment becomes an Archived History Segment, retaining a fixed size. This transformation involves encoding the Raw Records into Pieces, making up the Archived History Segment.

Archived History Segments can be converted back into Recorded History Segments through a Reconstructing process.

Also known as "archived segment".


## Segment Header

A compact header in an Archived History Segment containing:
- The segment index
- Segment commitment
- A pointer to the previous segment header
- Information about the progress of block archiving

It previously known as root block, root block header




## Sector

It is a collection of encoded Pieces that are utilized in the Farming process. Each Sector encompasses:

- Encoded Record Data from Pieces
- Piece Commitments and Witnesses
- Metadata: Additional information regarding the stored Pieces.








## Sharding

Sharding represents both an architectural strategy and a scalability technique, characterized by:

- **General Concept**: The division and distribution of data across multiple related blockchains, integrated to function as a unified system.
- **Subspace Implementation**: In the Subspace Network, sharding manifests as a collective of Subspace Blockchain Nodes. These nodes may possess distinc Archived Histories but collaborate to compile a Global History that is used Plotting and Farming.


## Shard

In the Subspace Network, a Shard refers to:

- **Individual Blockchain Instance**: Each Shard is a separate instance of the Subspace Blockchain, possessing its own distinct Archived History which contributes to the overall Global History.
- **Scalability Contribution**: Distributing transactions, execution processes, and the corresponding state across multiple Shards.



<!-- T -->
<!-- U -->
<!-- V -->
<!-- W -->
<!-- X -->
<!-- Y -->
<!-- Z -->















