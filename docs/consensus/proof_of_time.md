---
title: Proof-of-Time
sidebar_position: 4
description: Proof-of-Time Dilithium Consensus component
keywords:
    - pot
    - timekeeper
    - randomness
last_update:
  date: 02/14/2024
  author: Dariia Porechna
---

import Collapsible from '@site/src/components/Collapsible/Collapsible';


This specification defines a secure proof-of-time randomness beacon construction for [Farming](proof_of_archival_storage.md#farming) sub-protocol of the Dilithium consensus and bundle proposer election among operators.

## Terminology

**Timekeeper**

Timekeepers are the nodes that run the evaluation of the Proof-of-Time chain and gossip their outputs to other nodes. Timekeepers are expected to dedicate a full CPU core to Proof-of-Time.

**Node**

A Node or Consensus Node (unless otherwise noted as Timekeeper) is a PoT client node that does not run the PoT evaluation component. It only consumes PoT messages from Timekeepers or the blockchain.

## Primitives

We construct a PoT function by iterating AES-128 a large number of times. The prover evaluation latency for the fastest available hardware platform is calculated as the number of iterations times the latency for a single iteration of AES-128 on that hardware platform. We may then tune the number of iterations based on the lowest-latency hardware platform at the time to guarantee the minimum wall-clock time required for anyone to evaluate the PoT. 

## Public Constants

- `BLOCK_AUTHORING_DELAY`: number of slots between when the new global randomness value is revealed at slot `t` and when the farmer can claim block with that randomness at slot `t + BLOCK_AUTHORING_DELAY`, currently set to the maximum time needed to produce a PoS solution (4 slots, ~4 seconds)
- `POT_ENTROPY_INJECTION_INTERVAL`: number of blocks after which the proof-of-time chain input is updated with consensus chain entropy, currently 50 blocks, roughly equal to ~5 minutes at the expected block production rate

<Collapsible title="Note">
This parameter is $c$ in security analysis.
</Collapsible>
        
- `POT_ENTROPY_INJECTION_LOOKBACK_DEPTH`: depth at which the injected block is taken, measured in multiples of `POT_ENTROPY_INJECTION_INTERVAL`s, currently `2` *(equal to 100 blocks, the archiving depth)*
- `POT_ENTROPY_INJECTION_DELAY`: number of slots between when the injection condition is met at slot `t` and when the injection into the PoT chain happens at slot `t + POT_ENTROPY_INJECTION_DELAY`, currently equal to 15 slots
- `NUM_CHECKPOINTS`: number of checkpoint values for the proof-of-time verification published in 1 slot, currently 8
- `EXPECTED_POT_VERIFICATION_SPEEDUP`: expected speed-up of PoT verification to evaluation, currently 7. Used by nodes to decide whether to attempt to verify or evaluate locally under a potential DoS attack.

## Parameters

- `pot_slot_iterations`: number of iterations of PoT function required per single time slot. Should be divisible by  `2 * NUM_CHECKPOINTS`

## APIs

### prove
`prove(seed, pot_iterations)`→ `PotCheckpoints`

Takes a `seed` and number of iterations `pot_iterations` and repeatedly evaluates AES-128 for a total of `pot_iterations` times. The final output will contain `NUM_CHECKPOINTS` results of AES-128 encryption of `checkpoint_iterations` each.

1. Set `input = seed`
2. Set `key = hash(seed)` truncated to 128 bits
3. Set the number of iterations of PoT function required per one checkpoint `checkpoint_iterations = pot_iterations / NUM_CHECKPOINTS`
4. For `_` in `0..NUM_CHECKPOINTS`:
    1. Run evaluation of `output = aes_encrypt(key, input)` for `checkpoint_iterations` iterations.
    2. Append the `output` value to `checkpoints`
    3. Set `input = output`. The `key` stays the same.
5. Output `checkpoints`

![PoT Evaluator time in iteration.png](/img/PoT_Evaluator_time_in_iter.png)


### output
`output(checkpoints: PotCheckpoints)` → `PotOutput`

Gives the last value in the PoT evaluation result.

Implemented as `checkpoints[NUM_CHECKPOINTS-1]`

### derive_global_randomness

`derive_global_randomness(pot_output: PotOutput)` → `global_randomness`

Derive global randomness for use on the consensus chain from the output of PoT evaluation.

Implemented as `hash(pot_output)`

### verify

`verify(seed, iterations, checkpoints)` → `bool`

Verifies that the `proof_of_time` was computed correctly for `pot_iterations` number of times.

1. Check that `iterations` are divisible by `2 * checkpoints.len()`
2. Set `checkpoint_iterations = iterations / checkpoints.len()`
3. Set `key = hash(seed)`
4. Iterate through `checkpoints` in `proof_of_time` in steps of 2. The first checkpoint is `seed`.
5. For each pair of `checkpoints[i]` and `checkpoints[i+1]`run:
    
    
    ![Subspace v2 Master - Consensus (2).png](/img/PoT_Verification.png)
    
    1. Loop evaluation of `aes_encrypt(key, checkpoints[i])` encryption routine for `checkpoint_iterations/2` iterations.
    2. Loop evaluation of `aes_decrypt(key, checkpoint[i+1])` decryption routine for `checkpoint_iterations/2` iterations.
6. If all pairs are correct, return `True`, otherwise, return `False`

<Collapsible title="Implementation Notes">
- Doing encryption for $iterations/2$ and decryption for $iterations/2$ allows as to achieve same level of parallelism as if we had 16 checkpoints while only explicitly including 8. We take a pair of consecutive checkpoints, start encryption from one side and decryption from the other, and see if they meet in the middle. We can do so because key is the same for all checkpoints.
</Collapsible>


## Building the PoT chain

The PoT evaluation is continuously running since genesis, and all its outputs should form a chain.

Each node on the network keeps a local view of the recent PoT chain that extends the PoT chain of the consensus chain they follow. All nodes perpetually try to extend their PoT chain as high as possible.

There are three ways a node may get the proofs to extend its local view of the PoT chain:

- Blockchain: Proofs included in blocks of the consensus chain
- Gossip: Proofs received from other nodes on the network
- [Evaluation](#evaluation): Proofs computed locally (common case for Timekeepers)
1. When a node comes online (for the first time or otherwise), it should perform a major sync of the consensus chain ([Consensus Chain sync](#consensus-chain-sync)), if needed (if the best block tip is behind the chain tip), and get the latest “committed” PoT from the newest block header.
2. If the node previously held a local view of the PoT tree, which is no longer consistent with the PoT synced consensus chain (i.e., proofs are outdated or orphaned), discard the outdated view and reorg the tip of the PoT chain and restart Timekeeper to build on top of this new tip.
3. Listen to gossip for PoT messages newer than the last PoT included on the consensus chain. 
4. Process the received gossip PoT proofs and extend the local PoT chain with each new slot proof verified as per [PoT Gossip Processing](#pot-gossip-processing).
5. As soon as local best proof is up-to-date with observed gossip, Timekeepers should start evaluating on top of it.
6. The `slot_number` in the best valid proof known to this node becomes the tip of the PoT chain in the view of this node for all intents and purposes.

<Collapsible title="Implementation note about Timekeeper transition">
When Chain reorg happens or when the new potential tip is received via Gossip, Timekeeper should be able to jump in ASAP and start building on the new tip even though it may not yet be verified in case of Gossip. If Gossiped message ends up being invalid Timekeeper instance will be stopped. This implies it must be possible to run more than one concurrent Timekeeper in order to minimize transition latency.
</Collapsible>


## Timekeeper Algorithms

Timekeepers run PoT evaluation for a specified number of iterations for the next slot from the `best_proof` at each time slot. The `best_proof` is the latest PoT value considered valid by this Timekeeper. 

### Slot Inputs

At the consensus chain genesis, the Timekeepers must start the PoT chain evaluation before block production.

#### Slot Number

The genesis `slot_number` is set to `pot_genesis_slot = 0`.

After each [Evaluation](#evaluation) is computed the `slot_number` is increased by one.

### Seed

The genesis `seed` value is set to `hash(genesis_block_hash || external_entropy)`. The `external_entropy` should be set to a common value for all nodes (i.e., the last Bitcoin block hash before mainnet T (like [Spacemesh](https://github.com/spacemeshos/wiki/wiki/Genesis-ceremony#key-block-height-to-be-announced-on-thursday)) to ensure no one has a headstart in PoT computation provided via CLI.

For subsequent slots (with `slot_number > 0`), there are two cases for seed value:

- `seed = best_proof.output()`
- or `seed = hash(entropy||tip.output)` if `slot_number == injection_slot` (see: [Entropy Injection](#consensus-chain-entropy-injection-into-pot-randomness)).

### Slot Iterations

Each slot requires `pot_slot_iterations` defined in the genesis config. 

Occasionally, we may update the number of iterations per slot, which will take effect at the nearest injection slot. All subsequent slots will be evaluated and verified with respect to the updated number of iterations.

### Evaluation

1. Compute `checkpoints = prove(seed, pot_slot_iterations)`
2. Gossip the `ProofOfTime:{slot_number, seed, pot_slot_iterations, checkpoints}`  ([definition](#pot-gossipping)) to other nodes.


![Subspace v2 Master - Consensus.png](/img/PoT_Evaluation.png)


Note for [Randomness Updates](proof_of_archival_storage.md#randomness-updates): The `global_randomness` that farmers will use for the slot `next_slot` is computed as `derive_global_randomness(new_proof_of_time.output())`

### Consensus Chain Entropy Injection into PoT Randomness

Entropy from the consensus chain is injected into the PoT chain every `POT_ENTROPY_INJECTION_INTERVAL` blocks, starting from block number `POT_ENTROPY_INJECTION_INTERVAL * (POT_ENTROPY_INJECTION_LOOKBACK_DEPTH + 1)`  since genesis:

1. **Entropy Sourcing**
    1. For every block where `block_number % POT_ENTROPY_INJECTION_INTERVAL == 0`, derive entropy as `entropy = hash(chunk || proof_of_time)`, where `chunk` is the winning PoS solution chunk and `proof_of_time` is the PoT output of the slot claimed by this block.
    2. Store the `entropy` associated with `block_number` and undefined (for now) future `injection_slot` at which it will be injected into the PoT chain. 
2. **Setting Injection Slot**
    1. Set `injection_slot = slot + POT_INJECTION_DELAY` for entropy entry associated with block `block_number - POT_ENTROPY_INJECTION_INTERVAL * POT_ENTROPY_INJECTION_LOOKBACK_DEPTH`, where `slot` corresponds to the slot claimed by current block  `block_number`.
    2. If no such entry exists because the subtraction from `block_number` underflows or hits genesis block number 0), no injection needs to be done.
3. **Entropy Injection:**
    1. When PoT evaluation reaches `injection_slot`, inject the entropy value into the seed as [specified](#consensus-chain-entropy-injection-into-pot-randomness).
    2. Once a block is built on a slot higher than `injection_slot`, the corresponding entropy entry can be erased as no longer needed.


### PoT Gossipping

The gossip mechanism that we already have from Substrate can be used for message propagation of encoded `ProofOfTime`.

Timekeeper nodes that compute PoT, gossip the outputs to their peers.

Each PoT output is 160 bytes, so propagating them should be relatively lightweight and not significantly burden the network. PoT messages are unsigned and canonical.

The proof-of-time sent by Timekeepers to their peers should contain the following fields:

```rust
struct ProofOfTime {
	// version of PoT used, necessary to potentially replace AES with VDF
	V0 {
		slot_number: u64
		// input into PoT evaluation function
		seed: [u8;16],
		// iterations computed for this slot
		slot_iterations: u64,
		// NUM_CHECKPOINTS intermediate evaluations (including output)
		checkpoints: Vec<[u8;16]>
	}
}
```

All nodes will verify before re-gossiping and as a result propagation to whole network takes some time.

### PoT Gossip Processing

Upon receiving a new gossiped proof `proof_of_time`, all up-to-date nodes:

1. Verify that its `slot_number` is not older than that of the `best_proof` verified by this node. If it is, ignore.
2. If the node has already seen and gossiped the same `proof_of_time`, do not re-gossip it.
3. If the node already has a valid PoT for this `slot_number` and
    1. Newly received one has a  different set of `proof_of_time.checkpoints` for the same inputs `seed` and `slot_iterations` they ignore it and ban the peer that sent it
    2. if `seed` or `slot_iterations` is different we assume that the proof might be coming from a fork and simply ignore it without banning the peer
4. Verify that its `slot_number` not too far in the future .(Exact value TBD, suggested +10-15)
5. If the node doesn’t have a valid PoT for `slot_number-1`, they should save the `proof_of_time` in a tree and wait until they receive and verify the previous PoTs before proceeding.
6. If the node already has a valid PoT for `slot_number-1`, they can verify the received proofs for `slot_number`:
    1. For all proofs for this slot, verify that the slot inputs (`seed` and `slot_iterations`) match the expected as defined in [Slot Inputs](#slot-inputs) accounting for eventual injection and iteration updates if necessary. Discard the proofs with incorrect inputs.
    2. Let `num_proofs` be the number of proofs remaining for this slot after the input check. 
    3. If `num_proofs < EXPECTED_POT_VERIFICATION_SPEEDUP`, attempt to find the correct proof by verifying the checkpoints were computed correctly with `verify(seed, slot_iterations, checkpoints)` for each proof, starting with proofs sent by most reputable peer.
        1. If a proof validates successfully, forward PoT message to their peers and proceed with the audit and solving.
        2. Ban the peers who sent all other proofs.
    4. Else, if `num_proofs >= EXPECTED_POT_VERIFICATION_SPEEDUP`, suspect an attack is underway:
        1. Verify checkpoints from the peer with the best reputation with `verify(seed, slot_iterations, checkpoints)`
        2. If verification fails,  fall back to local evaluation for this slot with `local_checkpoints = prove(seed, slot_iterations)`. Compare `local_checkpoints` to all the received proofs for this slot and ban the peers who sent wrong proofs. Gossip the proof with `local_checkpoints`.

### Farming

1. The farmer tracks slots based on PoT chain. The last valid proof output they receive is used to derive latest randomness to then derive challenge for audit.
2. For every `slot_number` farmer audits their plot as described in [Audit](proof_of_archival_storage.md#audit) for potential solutions for all as far into the future as revealed randomness allows based on the global randomness they have received from the node so far.
3. If they win a challenge, they start solving and proving it, as described in [Proving](proof_of_archival_storage.md#proving), to later claim the slot and produce a block with the precomputed solution.
4. In the block, the farmer should include the output of proof-of-time at the slot they claim for verifiability.
    
    To keep the header minimal size, only the outputs of claimed slot `x` and `x + BLOCK_AUTHORING_DELAY` are included in block header pre-digest items. The output of claimed slot `x` is sufficient to verify PoS solution.
    
    The `BLOCK_AUTHORING_DELAY` is required to make sure faster farmers (farmers that can produce PoS faster due to faster SSD and/or CPU) do not get advantage in the race to produce a block.
    
    All checkpoints of all slots passed since the parent block’s future proof of time (if any) up to `slot_number + BLOCK_AUTHORING_DELAY` of current block are included in [justifications](https://substrate-developer-hub.github.io/rustdocs/latest/sp_runtime/generic/struct.SignedBlock.html) to allow more parallelism during PoT verification. Essentially all checkpoints that were not yet seen on chain must be included and subsequently archived as part of the block.

## Consensus Chain sync

### Major Sync

(Extends [Synchronization](consensus_chain.md#synchronization))

Since PoT is currently costly to verify, it makes verifying the blocks costly too. Even more so if a node has to sync a significant amount of blocks.

When syncing, during block import verification, the node generally verifies everything **except** PoT.

1. During verification of an individual block (stateless part of the process that happens before block is imported) `block_number`, make an on the spot decision whether to verify PoT for this block depending on distance from `target` with `should_verify_pot(block_number, target)`
2. If `true`, fully verify PoT of this block. Otherwise, skip PoT verification.
3. If the verification passes, the block’s PoT is valid.
4. If the verification fails, reject the block and the whole fork as invalid. Seek to sync on another fork.

`should_verify_pot(block_number, target)` → `bool`

Depending on how far `block_number` is from the `target` we define a few threshold for number of blocks verified. Let `diff = target - block_number`

1. For `diff ≤ 1581` blocks, return `true` to verify all blocks
2. for `diff ≤ 6234` blocks, verify `sample_size = 1581` blocks
3. for `diff ≤ 63240` blocks, verify `sample_size = 3162*(diff-3162)/(diff-1)` blocks
4. for `diff ≤ 3 162 000` blocks, verify `sample_size = 3162` blocks 
5. for `diff > 3 162 000` blocks, verify `sample_size = diff/1000` blocks

Generate a random number `n` in the range `0..=(diff)` and if `n<sample_size` return `true`, otherwise return `false`. 

<Collapsible title="Explanation">
    Base sample size computed as $n=\frac{Z^2\ p\ (1−p)}{E^2}$, where $Z$ is the $Z$-score, which is 2.58 for a 99% confidence level, $*p*$ is the expected proportion of correct proofs 0.95, $E$ is the margin of error, which is 0.01 for 1% results in $n=3162$ under the assumption of infinitely large population $N$ (number of blocks to sync). However, quite often that is not the case, so we have to adjust the sample size for each of the bins. Usually that is done via finite population correction $FPC = \sqrt\frac{N-n}{N-1}$ and $n'=n*FPC^2$, however that doesn’t help in cases  $N\approx n$ and $N<n$
    
    To simplify the implementation, I define the following bins with boundaries that personally make sense:

    - for $N≤1581$, verify all blocks as they are recent enough (~2.5 hrs) and may also have checkpoints available
    - for $N≤2n=6234$, I cut off the FPC at $n'=0.5n = 1581$ which results in >25% verification probability for blocks that are ~10hr old under normal operation
    - for $N ≤ 20n = 63240$, $n'=n*\frac{N-n}{N-1}$, which results in 25 to 4.7% verification for newer to older blocks
    - for $20n<N\leq 1000n$, sample estimate stays  $n'=n$
    - for $N>1000n$, I set a lower limit of $n'=N/1000$ to make sure older block are at least minimally verified

    Here’s a plot of verification probability of each block until example target 500 000 (Sep 19 2023 Gemini3f)

    ![PoT_Explanation_SC_1.png](/img/PoT_Explanation_SC_1.png) 


    Close-up to last 15k blocks

    ![PoT_Explanation_SC_2.png](/img/PoT_Explanation_SC_2.png)

    
</Collapsible>


<Collapsible title="Note">
    We may want to accept the fork after this probabilistic verification passes, but eventually and asynchronously verify it fully. See discussion on time [here](https://forum.subspace.network/t/pot-verification-during-genesis-sync/1606). We don’t know if it’s [implementable](https://www.notion.so/Dilithium-PoT-Specification-4e17a6d5b03a4abea864ba2d0b97970e?pvs=21)
</Collapsible>

### New Blocks

(Extends [Verification](proof_of_archival_storage.md#verification))

When a new block is received, in addition to PoS and consensus log checks, compare the PoT values in the header to the local view of the PoT chain.
If the proof-of-time included in the block header covers local proofs that have already been verified, the block’s PoT passes validation.

If the proof-of-time is not consistent with local view or the local view is missing some required slots — do necessary verification, including proving.
