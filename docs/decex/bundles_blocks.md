---
title: Bundles and Domain Blocks
sidebar_position: 3
description: Structure of bundles and domain blocks.
keywords:
    - execution
    - decex
    - bundle
last_update:
  date: 03/04/2024
  author: Dariia Porechna
---

import Collapsible from '@site/src/components/Collapsible/Collapsible';

## Bundles

Operators produce bundles, which add new extrinsics to the execution inbox, and output the execution result of all prior bundles. Bundles are produced probabilistically based on the stake-weighted operator VRF election. The bundle consists of a header and a body.

### Bundle Header

- `ProofOfElection`: the proof for the stake-weighted VRF election.
    - `domain_id`: the index of the domain for this bundle. Must exist within the `DomainRegistry`.
    - `operator_id`: the id for this operator in the registry. We do not need to include the public key since it already resides within the operator registry.
    - `slot_number`: the time slot number for the randomness beacon.
    - `proof_of_time`: random output for that slot from the [Proof-of-Time](/docs/consensus/proof_of_time.md) beacon.
    - `vrf_signature`: the signature of the slot randomness using the operator’s private key. Used to verify the VRF election based on the operator's proportion of stake for this domain.
- `ExecutionReceipt` of the last domain block executed.
- `estimated_bundle_weight`: the total (estimated) weight of all extrinsics in the bundle. Used to prevent overloading the bundle with compute.
- `bundle_extrinsics_root`: the Merkle root of all new extrinsics included in this bundle, will be added to the `execution_inbox` for this domain must be included in the next domain block for it to be valid. 
- `signature`: the Schnorr signature of the hash of the bundle header.

### Bundle Body

The bundle body is largely an “opaque blob” for consensus nodes. They only check to ensure the total size, weight, and Merkle roots are correct, but they should not need to interpret the semantics of individual transactions.

- `extrinsics` 
an ordered list of all new extrinsics being proposed by this operator for the next domain block.

### Bundle Limits

The size of bundle body in bytes and it's `estimated_bundle_weight` are limited by the `max_block_size` and `max_block_weight` [domain configuration](workflow.md#domain-genesis-config) items as well as the consensus block size and weight limits based on the expected number of bundles `bundle_slot_probability/SLOT_PROBABILITY` in a single block.

`DomainBundleLimit` is a struct that contains the maximum bundle size and weight:
- `max_bundle_weight = max_block_weight/(bundle_slot_probability/SLOT_PROBABILITY + 2*Sqrt(bundle_slot_probability/SLOT_PROBABILITY)+1)`
- `max_bundle_size = max_block_size/(bundle_slot_probability/SLOT_PROBABILITY + 2*Sqrt(bundle_slot_probability/SLOT_PROBABILITY)+1)`

## Domain Blocks

Domain block follows the standard [Substrate block format](https://github.com/paritytech/substrate/blob/689da495a0c0c0c2466fe90a9ea187ce56760f2d/primitives/runtime/src/generic/block.rs#L82). It consists of a Header and a list of extrinsics that are compiled from the bundles contained within the consensus block.

- [Header](https://github.com/paritytech/substrate/blob/689da495a0c0c0c2466fe90a9ea187ce56760f2d/primitives/runtime/src/generic/header.rs#L39):
    - *`parent_hash`*
    - *`number`*
    - *`state_root`*
    - *`extrinsics_root`*
    
    
    <Collapsible title="Note">
    Substrate header also contains a *`digest`* field, but it is usually unused for the domain block. It was used to feed some consensus chain data into the domain block before but will likely not be used going forward if it causes a challenge for fraud proofs.
    </Collapsible>
  
- Extrinsics

## Execution Receipt

Execution Receipt (ER) is a deterministic receipt for the execution of a domain block. It provides a way to prove or disprove valid execution of the ordered set of extrinsics in the domain block body.

- `domain_block_number`: the index of the current domain block that forms the basis of this ER.
- `domain_block_hash`: the block hash corresponding to `domain_block_number`.
- `domain_block_extrinsics_root`: extrinsics root field of the header of the domain block referenced by this ER.
- `parent_domain_block_receipt_hash`: a pointer to the hash of the ER for the last domain block. The parent must have already been included in this domain’s blocktree by the consensus chain for this bundle to be valid. Note that this does not have to be the tip of the domain blocktree (on the consensus chain), as this bundle could be confirming an existing tip or forking away from a fraudulent branch.
- `consensus_block_number`: a pointer to the consensus block index which contains all of the bundles that were used to derive and order all extrinsics executed by the current domain block for this ER.
- `consensus_block_hash`: a pointer to the consensus block hash which contains all of the bundles that were used to derive and order all extrinsics executed by the current domain block for this ER. 
    <Collapsible title="Note">
    Consensus block number alone is insufficient, since their could be honest forks of the consensus chain.
    </Collapsible>
    
- `inboxed_bundles`: list of all bundles included in and excluded from execution by this domain block, contains a list of hashes and invalidity reasons for bundles `(Valid or Invalid(InvalidBundleType), extrinsics_root)`. The bundles marked `Invalid` were initially included in the consensus block, but later deemed invalid and excluded from execution.
- `bundle_extrinsics_roots`: all `extrinsic_root`s for all bundles being executed by this block. Used to ensure these are contained within the state of the `execution_inbox`.
- `final_state_root`: the final state root for the current domain block reflected by this ER. Used for verifying storage proofs for domains.
- `execution_trace`: an ordered list of the post-state root values after each transaction in the current domain block was executed, as computed locally by this operator.
- `execution_trace_root`: the Merkle root of the execution trace for the current domain block. Used for verifying fraud proofs.
- `block_fees`: all SSC fees for this ER to be shared across operators. These include the total execution and storage fees for executing the previous domain block and fees for relaying the XDM messages to other domains.
- `transfers`: amounts transferred via XDM to/from other domains or consensus chain or otherwise burned/minted on this domain
    - `transfers_in` into the current domain
    - `transfers_out` out of the current domain
