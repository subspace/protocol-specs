---
title: Consensus Chain
sidebar_position: 1
description: General sub-protocols of the consensus chain operation. 
keywords:
    - consensus
    - block
    - header
    - transaction
    - synchronization
last_update:
  date: 02/14/2024
  author: Dariia Porechna
---

Unless specified otherwise below, consensus chain primitives are inherited from Substrate.

## Public Parameters

These parameters are fixed at the beginning of the protocol and used by all clients. 

- Genesis block (derived from Substrate chain specification)

# Consensus Block Structure

A block on the consensus chain largely follows standard Substrate block structure:

- Header,
- Body,
- Justifications

## Header

The block header carries a set of consensus items necessary for integrity and continuity of the consensus chain:

- `number`: block number
- `extrinsics_root`: Merkle root hash of extrinsics trie included in the block body.
- `state_root`: Merkle root hash of state trie, used to verify the state of the consensus chain.
- `parent_hash`: hash of the parent block
- `digest`: set of Subspace-specific auxiliary data

### Digest Items

PreRuntime items:

- `Slot`: the slot claimed by this block
- `Solution`: the PoS solution as defined in [Proving](proof_of_archival_storage.md#proving)
- `PreDigestPotInfo`: information about PoT chain, includes `proof_of_time` output for the claimed slot and `future_proof_of_time` for a future slot as defined in [PoT specification](proof_of_time.md#farming).

Consensus log items:

- `PotSlotIterations` number of iterations for proof-of-time evaluation per slot, corresponds to slot that directly follows parent block's slot and can change before slot for which block is produced.
- `SolutionRange` solution range for this block/era.
- `PotParametersChange` change of parameters to apply to PoT chain, including at which slot change of parameters takes effect `slot`, new number of slot iterations `slot_iterations` and entropy (`entropy`) that should be injected at the `slot`.
- `NextSolutionRange` new solution range for next block/era.
- (`SegmentIndex`,`SegmentCommitment`) index and KZG commitment of the new segments archived right before this block that were not yet included in previous blocks.
- `EnableSolutionRangeAdjustmentAndOverride`: enable solution range adjustment and override solution range to a given value. Can only be set if solution range adjustment is currently disabled (network early days).
- `RootPlotPublicKeyUpdate` whether the root plot public key was updated and its new value.

Seal: farmer (block proposer) signature

## Body

The body consists of a set of `Extrinsic`, including:

- `Normal`(e.g. transfers, domain bundles, staking)
- `Operational` (e.g. votes, fraud proofs)
- `Mandatory` (e.g. runtime upgrades)

such that total size and weight fit within block storage and compute limits. The limits currently are 5 MiB and equivalent of 2 sec compute time, out of which Normal extrinsics can take up to 75%.

## Justifications

Justifications contain a set of all PoT checkpoints since the parent block up to `future_proof_of_time`. See more in [PoT specification](proof_of_time.md#farming).

# Synchronization

***Sync from DSN implementation***

1. Connect node to Kademlia DHT and get 20 peers closest to random key (using disjoint query path) that support the segment-header request response protocol.
    
    Fall back to fewer number of nodes on each attempt if not enough nodes found, which might be the case in small dev networks and similar circumstances.
    
2. Ask the peers about their latest `segment_header`s
    
    In case the number of obtained `segment_header`s doesn’t change twice in a row, we may have gotten a response from all available nodes that support the segment-header request response protocol.
    
3. Find the `segment_header` that largest subset of peers agree on as their newest (mode) from their last 2 segment headers.
4. Download the chain of archived `segment_headers` backwards from newest to oldest, checking that every older segment header is part of the next (by hash, as described in [Archiving](#archiving))
5. Download full segments in forward direction, verifying each piece against `segment_commitment` in from corresponding `segment_header` along the way:
    1. Split piece into `record`, `record_commitment` and `record_witness`
    2. Hash the `record_commitment` to obtain the `record_commitment_hash`
    3. Verify the `record_witness` for the `piece_index` , `record_commitment_hash` and `segment_commitment`
    4. In case verification fails, the peer that returns an invalid piece must be banned.
6. Reconstruct blocks from headers.
7. Verify and import blocks into the chain. PoT is verified probabilistically according to [Major Sync](proof_of_time.md#major-sync) 
8. Blocks that are close to the tip and were not archived yet are handled by [Substrate Sync](#substrate-sync) 

***When and how to use sync from DSN***

1. Sync from DSN should be attempted first thing on node startup, before Substrate node is fully started
2. Sync from DSN should be attempted during normal operations when any of the following events (triggers) happen:
    1. When node has not imported blocks for a long time (currently 10 minutes)
    2. When Substrate and/or Subspace networking identified that node was offline network-wise and then became online, meaning there could have been some blocks it missed in the meantime
3. Implementation must only run one DSN sync at a time and not try to run multiple concurrently
4. DSN sync must be able to terminate early if local chain already contains imported blocks that DSN sync was about to download (doesn’t happen often, but possible)
5. Node blocks that are finalized and pruned must be much higher than archiving point such that block available through DSN sync and regular Substrate sync have significant overall (5 archived segments worth of blocks right now)

## Substrate Sync

*Default sync in Substrate*

1. Given the connected synced peers (with the `is_syncing: false` status) and their best blocks and find the tip.
2. Download blocks from the last archived block to tip from the peers in batches in parallel.
3. Import and verify blocks. Ban bad peers.
4. When you are close to tip (~18 blocks) switch to keep-up sync
5. When get to tip start participate in consensus
