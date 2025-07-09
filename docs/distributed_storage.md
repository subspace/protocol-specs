---
title: Distributed Storage Network
hide_title: false
sidebar_position: 7
description: Distributed Storage Network protocols
keywords:
    - storage
    - network
    - protocol
last_update:
  date: 07/09/2025
  author: Teor
---

## Introduction

Encoded pieces from the [proof of storage consensus protocol](consensus/proof_of_archival_storage.md) are hosted by the subspace Distributed Storage Network (DSN).

Objects stored in the DSN can be reconstructed from retrieved source pieces.
If a specific source piece is not available, the segment can be reconstructed from any 128 of the 256 source and parity pieces.

### High-Level Data Flows

Objects are submitted in extrinsics, included in blocks, archived into a segment and pieces (with mappings), then distributed to farmers.
Then piece-based object mappings can be used to retrieve the piece(s) for an object, and reconstruct its data.

#### Object Submission

An extrinsic containing an object is submitted as part of a consensus transaction, and included in a block.

Currently, objects are mapped from `system.remark[_with_event]` extrinsics.
Older mainnet blocks also contain history seeding extrinsics, which are mapped by older runtime versions.

#### Object Mapping Generation during Block Archiving

After the block is confirmed, and during bulk block sync on a new node, object mappings can be generated for new or existing objects.

When syncing near tip, blocks are recieved via gossip between nodes.
During bulk block sync, farmers provide pieces, which are reconstructed on the node, to produce the blocks in that segment.

When archiving, mappings are produced for each block, by querying the runtime.
When the block is added to a segment, the mappings are converted to piece mappings, and sent to subscribed RPC clients.
Mappings in blocks split between segments can be delayed until the next block is confirmed and archived.

After the completion of the segment, archived pieces are sent to farmers, which provide them to DSN clients (the node, gateway, and other farmers).

Archiving also happens during bulk block sync.
The pieces already exist on the network, but the segments and blocks are still reconstructed, then turned into segments again.
This allows nodes to generate all historical mappings, not just the ones near the tip.

#### Object Retrieval using Mappings

After mappings and pieces are available on the network, objects can be reconstructed using those mappings.

The subspace gateway uses each mapping to retireve the piece(s) containing that object from the DSN (from farmers).
These objects are reconstructed and verified using the object data hash in the mapping.
For objects that cross segments, segment padding, segment headers, and block continuation headers are discarded.

After object reconstruction, the gateway returns the object data corresponding to the mapping.

Note: there is no segment reconstruction on the gateway.
To avoid segment reconstruction, segment headers and block continuation headers are parsed and discarded, and multiple end of segment padding lengths are tried agaonst the data hash.
