---
title: Proof-of-Archival-Storage
sidebar_position: 2
description: Proof-of-Archival-Storage Dilithium Consensus
keywords:
    - archiving
    - farming
    - plotting
    - auditing
last_update:
  date: 07/18/2025
  author: Jeremy Frank
---
import Collapsible from '@site/src/components/Collapsible/Collapsible';


## Public Parameters and Values

### Protocol Constants


These parameters are fixed at the beginning of the protocol and used by all clients.

- `SLOT_PROBABILITY`: the probability of successful block in a slot (active slots coefficient), currently 1/6. This defines the expected block production rate of 1 block every 6 seconds
- `INITIAL_SOLUTION_RANGE`: solution range for proof-of-replication challenge for the first era
- `ERA_DURATION_IN_BLOCKS`: solution range is adjusted after this many blocks, currently 2016 (as in Bitcoin)
- `KZG_PUBLIC_PARAMETERS`: universal reference values for [KZG Polynomial Commitment scheme](https://dankradfeist.de/ethereum/2020/06/16/kate-polynomial-commitments.html) obtained through an MPC [ceremony](https://ceremony.ethereum.org/)
- `KZG_MAX_DEGREE` is $2^{15}$: the maximum degree of the polynomial possible to commit to under the KZG scheme
- `CONFIRMATION_DEPTH_K`: minimal depth after which a block can enter the recorded history (a global constant, as opposed to the client-dependent transaction confirmation depth), currently 100
- `EXPECTED_VOTES_PER_BLOCK`: number of votes expected per block, currently 9
- `SAFE_BYTES` is 31 bytes: the size into which raw history data is partitioned before Archiving for KZG commitment, required to ensure that values fit the size of the point subgroup of BLS12-381 curve
- `FULL_BYTES` is 32 bytes: the size into which encoded data is partitioned after Archiving
- `NUM_CHUNKS` is $2^{15}$: number of KZG field elements that compose a record, `NUM_CHUNKS` ≤ `KZG_MAX_DEGREE`.
- `NUM_S_BUCKETS`: number of s-buckets in a record (and by extension in plot sector), currently $2^{16}$ (`NUM_CHUNKS / ERASURE_CODING_RATE`)
- `RAW_RECORD_SIZE` is $\lessapprox$ 1 MiB: the size of a record of raw blockchain history before Archiving to be transformed into a piece (`SAFE_BYTES * NUM_CHUNKS = 1015808 b`)
- `NUM_RAW_RECORDS` is 128: the number of raw records in a Recorded History Segment
- `RECORDED_HISTORY_SEGMENT_SIZE` is roughly 128 MiB: size of raw recorded history segment ready for Archiving (`RAW_RECORD_SIZE * NUM_RAW_RECORDS`)
- `RECORD_SIZE` is 1 MiB: the size of useful data in one piece (`FULL_BYTES * NUM_CHUNKS = 1048576 b`)
- `WITNESS_SIZE` is 48 bytes: the size of KZG witness
- `COMMITMENT_SIZE` is 48 bytes: the size of KZG commitment
- `PIECE_SIZE` is  $\gtrapprox$ 1 MiB: a piece of blockchain history (`RECORD_SIZE + COMMITMENT_SIZE + WITNESS_SIZE = 1048672 b`)

    <Collapsible title="Implementation Note">
    In a piece, the chunks should be full 32 bytes, because after performing field operations (i.e. erasure coding) the resulting field elements are not guaranteed to fit into 31 bytes anymore.
    </Collapsible>

- `ERASURE_CODING_RATE`: parameter of erasure code operation, specifies what portion of data is enough to recover it fully in case of loss, currently 1/2
- `NUM_PIECES` is 256: the number of pieces in an Archived History Segment after erasure coding (`NUM_RAW_RECORDS/ERASURE_CODING_RATE`)
- `K`: space parameter (memory hardness) for *proof-of-space*, currently 20
- `RECENT_SEGMENTS`: number of latest archived segments that are considered Recent History for the purposes of Plotting (currently 3)
- `RECENT_HISTORY_FRACTION`: fraction of recently archived pieces from the `RECENT_SEGMENTS` in each sector (currently 1/10)
- `MIN_SECTOR_LIFETIME`: minimum lifetime of a plotted sector, measured in archived segments, currently 4

### Dynamic Blockchain Values

These parameters are derived from the blockchain and are dynamically updated over time.

- `slot_number`: current slot number, derived since genesis from the [Proof-of-Time](proof_of_time.md) chain
- `solution_range`: farming difficulty parameter, dynamically adjusted to control the block generation rate
- `voting_solution_range`: voting difficulty parameter, dynamically adjusted to control the vote generation rate. This range is larger than `solution_range` to allow for multiple votes per block (`solution_range * (EXPECTED_VOTES_PER_BLOCK+1)`)
- `global_randomness`: used to derive slot challenges, from the [Proof-of-Time](proof_of_time.md) chain
- `pieces[]`: all pieces of the recorded blockchain history
- `history_size`: number of archived segments of the blockchain history until this moment
- `segment_commitments[]`: hash map of KZG commitments computed over pieces in a segment and stored in the runtime
- `BlockList`: list of public keys that committed offenses

### Consensus Parameters

These parameters are fixed at the beginning of the protocol and used by all clients, however they can be updated if necessary.

- `max_pieces_in_sector`: number of pieces to be retrieved from blockchain history by a farmer under Verifiable Sector Construction (VSC) and encoded in a single sector by an honest farmer, currently 1000
- `sector_size`: size of a plotted sector on disk, currently ~1 GiB (`max_pieces_in_sector * RECORD_SIZE`)

## Archiving

***Preparing the history***

1. The genesis block is archived as soon as it produced.
We extend the encoding of the genesis block with extra pseudorandom data up to `RECORDED_HISTORY_SEGMENT_SIZE`, such that the very first archived segment can be produced right away, bootstrapping the farming process.
This extra data is added to the end of the [SCALE-encoded](https://docs.substrate.io/reference/scale-codec/) block, so during decoding of the genesis block it'll be ignored.
2. Once any block produced after genesis becomes `CONFIRMATION_DEPTH_K`-deep, it is included in the *recorded history*. Recorded history is added to a buffer of capacity `RECORDED_HISTORY_SEGMENT_SIZE`.
3. When added to the buffer, blocks are turned into `SegmentItem`s.
4. Each segment will have parent `segment_header` included as the first item. Each `segment_header` includes hash of the previous segment header and the segment commitment of the previous segment. Together segment headers form a chain that is used for quick and efficient verification that some `piece` corresponds to the actual archival history of the blockchain.
5. Segment items are combined into segments. Each segment contains at least two of the following `SegmentItem`s, in this order:
    1. The previous segment’s `SegmentHeader`
    2. `BlockContinuation`, if remained from the previous segment
    3. `Block`(s), as many as fit fully into the current segment, may be none
    4. `BlockStart`, if the next block doesn't fit within the current segment
    5. `Padding` (zero or more) in case padding bytes are necessary to complete the segment to `RECORDED_HISTORY_SEGMENT_SIZE`
6. When the buffer (after SCALE-encode) contains enough data to fill a record of `RAW_RECORD_SIZE` bytes, it is archived:
    1. Split the record into  $d$ = $2^{15}$=`NUM_CHUNKS` chunks of size `SAFE_BYTES`.
    2. Interpolate a `polynomial` over the chunks of the record with `poly(record)`.
    3. Commit to the record polynomial under KZG and obtain the source `record_commitment` $C_i$ as `Commit(polynomial)`. This will allow us to later compute proofs that a chunk belongs to a particular record.
7. Once `NUM_RAW_RECORDS` (128) records have been committed, stack them into a matrix of $n =$ `NUM_RAW_RECORDS` rows and $d$ columns. Each row is a record.
8. **Erasure code records** column-wise with `extend(column, ERASURE_CODING_RATE)`

    This effectively doubles the number of rows and thus, records per segment to `NUM_PIECES` (256).

9. **Erasure code commitments** with `extend(record_commitments, ERASURE_CODING_RATE)`.

    <Collapsible title="Note">
    By doing this step we can effectively save almost half of the record commitment time in archival. Instead of directly committing to parity records we erasure code the commitments here, which should match the parity record commitments, but being much faster to compute.
    </Collapsible>

10. Hash each `record_commitment`, both source and parity, into 254-bit scalar `record_commitment_hash`es values $h_0…h_{2n}$.

    <Collapsible title="Note">
     Commitments are hashed to 254 bits (we hash it as usual and set last 2 bits to 0) to bring them back down to field elements so it becomes possible to KZG commit to them (at cost of losing homomorphic properties). There is no direct way to commit to 48-byte KZG commitments without greatly increasing proof size and computation time (i.e. by using IPP proofs). Committing to the hashes effectively makes a one level Verkle tree.
    </Collapsible>

11. Interpolate a polynomial `segment_polynomial` over these hashes and commit to it under KZG to get the `segment_commitment` $C_s$ as `commit(Poly(record_commitment_hashes))`.
12. For each `record_commitment_hashes[i]` $h_i$, compute a `record_witness` $\pi_i$ to the `segment_commitment` $C_s$ as `create_witness(segment_polynomial, i)`.

    This will allow us to prove that a record belongs to an archived history segment without having to provide all other segment commitments at a cost of storing additional 48 bytes per piece.

13. For each record, form a `piece = record || record_commitment || record_witness` $(r_i||C_i|| \pi_i)$
14. Append the `segment_commitment` to the global `segment_commitments[]` table of the chain.
15. The segment now consists of `NUM_PIECES` records of 1MiB each, `NUM_PIECES` piece commitments, `NUM_PIECES` proofs of 48 bytes each and one 48-byte `segment_commitment`.

    The pieces with even indices ((0, 2, …, 254) of this segment) correspond to source records and the pieces with odd indices ((1, 3, …, 255)of this segment) correspond to parity records. The blockchain history data is effectively contained only in pieces with an even `piece_index`.


![Figure 3: Piece Building Process corresponds to steps 5-12 of Archiving.](/img/Archiving_Process.png)

<center>Figure 3: Piece Building Process corresponds to steps 5-12 of Archiving.</center>


## Plotting

### Pre-plotting Initialization

***Determining and retrieving the assigned portion of the history***

1. Given the total allocated disk space, reserve some space ($<2\%$) for commitments and other auxiliary information.
2. Create a single plot of `plot_size = allocated_plotting_space`. Sizes of farmer plots are independent from size of blockchain history, but must be a multiple of `sector_size`.
3. Generate a farmer identity, that is a key pair `public_key, secret_key` under the digital signature scheme. These signing keys are independent from reward address of an entity (exactly as payout address in Bitcoin mining) described in [Block reward address](docs/consensus/consensus_chain.md#block-reward-address).
4. Derive an identifier `public_key_hash` as `hash(public_key)`. This farmer id will also serve as the basis for their single global network peer id in the DHT.
5. Determine the `sector_count = plot_size / sector_size`.
6. **Verifiable Sector Construction (VSC)**:

    Determine which pieces are to be downloaded for this sector:

    1. Index the sectors sequentially and for each sector derive `sector_id = keyed_hash(public_key_hash, sector_index || history_size)`, where `sector_index` is the sector index in the plot and `history_size` is the current history size at the time of sector creation.
    2. For each sector, for each `piece_offset` in `0..max_pieces_in_sector`, derive the `piece_index` in global blockchain history this slot will contain, as follows:
        1. At the start of the chain, if `history_size <= RECENT_SEGMENTS / RECENT_HISTORY_FRACTION` the pieces for this sector are selected uniformly as `piece_index = keyed_hash(piece_offset, sector_id) mod (history_size * NUM_PIECES)` for `piece_offset` in `0..max_pieces_in_sector`
        2. Later, when history grows (`history_size > RECENT_SEGMENTS / RECENT_HISTORY_FRACTION`) to make sure recent archived history is plotted on farmer storage as soon as possible we select `RECENT_HISTORY_FRACTION` of pieces for each sector from the last `RECENT_SEGMENTS` archived segments.
        3. For `piece_offset` in `0..max_pieces_in_sector * RECENT_HISTORY_FRACTION * 2`:
            1. If `piece_offset` is odd, select a piece from recent history as `piece_index = keyed_hash(piece_offset, sector_id) mod (RECENT_SEGMENTS * NUM_PIECES) + ((history_size - RECENT_SEGMENTS) * NUM_PIECES)`
            2. If `piece_offset` is even, select a piece uniformly from all history as `piece_index = keyed_hash(piece_offset, sector_id) mod (history_size * NUM_PIECES)`
        4. The rest of the pieces for this sector are selected uniformly as `piece_index = keyed_hash(piece_offset, sector_id) mod (history_size * NUM_PIECES)` for `piece_offset` in `(2 * RECENT_HISTORY_FRACTION * max_pieces_in_sector)..max_pieces_in_sector`
    3. Retain the `history_size` count at the time of sector creation. This sector will expire at a point in the future as described in [Sector Expiration](#sector-expiration).
7. Retrieve each piece from the Distributed Storage Network (DSN) and verify against segment commitment obtained from the node.

<div align="center">

![Raw Sector Light](/img/Raw_Sector-light.svg#gh-light-mode-only)
![Raw Sector Dark](/img/Raw_Sector-dark.svg#gh-dark-mode-only)

</div>

<center>Figure 4: Verifiable Sector Construction.</center><br />


8. For each synced sector, proceed to [Plotting](#plotting) phase.

### Plotting to Disk

***Sealing the history***

For each sector, given that all pieces assigned to the sector reside locally in memory, encode pieces row-wise (piece by piece or one piece at a time).

For each piece in the sector:

1. Extract the bundled record from the piece and retain the `record_witness` and  `record_commitment` alongside the plot.
2. Split the extracted record into `FULL_BYTES`-sized `record_chunks`, which are guaranteed to contain values that fit into the scalar field.
3. Erasure code the record with `extended_chunks = extend(record_chunks, ERASURE_CODING_RATE)`

    <Collapsible title="Implementation Note">
        - (Optimization, Implemented) It is faster to do FFT over domain $2^{16}$ with `extend` and throw away all values that are not in `proven_indices` then evaluate at proven indices. FFT complexity is expected at $O(2nlog(2n)) \approx 2^{16}*16 = 2^{20}$ while direct evaluation is $O(n^2)\approx (2^{15})^2 = 2^{30}$
    </Collapsible>

4. Derive an `evaluation_seed` from `sector_id` and `piece_offset` within this sector as `evaluation_seed = hash(sector_id || piece_offset)`
5. Derive a Chia proof-of-space table `pos_table = generate(K, evaluation_seed)`
6. Initialize `num_successfully_encoded_chunks = 0` to indicate how many chunks were encoded so far.
7. Iterate through each `(s_bucket, chunk)` in `extended_chunks`:
    1. Query the `pos_table` for a valid proof-of-space `proof_of_space` for this chunk as `find_proof(pos_table, s_bucket)`.
    2. If it exists, encode the current chunk as `encode(chunk, hash(proof_of_space))` and increase `num_successfully_encoded_chunks` by 1. Otherwise, continue to the next chunk.
    3. Place the encoded chunk into a corresponding s-bucket for given index `s_bucket` and set corresponding bit in the `encoded_chunks_used` bitfield to `1`.

    <Collapsible title="Implementation Note">
        There is one `encoded_chunks_used` bitfield per record  which indicates which s-buckets contain its encoded chunks.
    </Collapsible>


8. If `num_successfully_encoded_chunks >= NUM_CHUNKS` all chunks were encoded successfully, take the necessary `NUM_CHUNKS` and  proceed to the next record.
9. Else, if `num_successfully_encoded_chunks < NUM_CHUNKS`, select extra chunks to store at the end after encoded chunks:
    1. Compute `num_unproven = NUM_CHUNKS - num_successfully_encoded_chunks`
    2. Save as `extra_chunks` the first `num_unproven` chunks of the source record corresponding to the indices where `encoded_chunks_used` is not set.

    <Collapsible title="Note">
        Testing with k=17 showed that the event when `pos_table` did not contain $2^{15}$ proofs within $2^{16}$ possible bucket indices, and thus `encoded_chunks_used` has less than $2^{15}$ bits set, happened for ~0.8% records we should retain necessary amount of source chunks for the record to be recoverable and provable. These extra chunks cannot participate in farming though.
    </Collapsible>

10. Once all records are encoded, write the sector to disk, one s-bucket at time in order of the index, each followed by `encoded_chunks_used` bitfield corresponding to selected chunks.
11. The final plotted sector consists of `max_pieces_in_sector` many `encoded_chunks_used` bitfields of size `NUM_S_BUCKETS` each,  `NUM_S_BUCKETS` s-buckets and commitments and witnesses of pieces in this sector.

    Each `encoded_chunks_used` indicator vector has bit set to `1` at places corresponding to the record positions whose chunks are encoded in this s-bucket and are eligible for farming.


![Figure 5: Complete Plotting process for an example sector of 4 pieces](/img/Plotting_Process.png)

<center>Figure 5: Complete Plotting process for an example sector of 4 pieces</center>


<Collapsible title="Implementation Note">
    1. Plotting consists of transforming raw sectors into encoded sectors, which can be viewed as converting a row-wise matrix of raw records into a row-wise matrix of encoded records and viewing that as a column-wise matrix of s-buckets.
    2. Sectors are written to disk in a manner that is optimized for sector audits (as opposed to efficient recovery of pieces).
</Collapsible>

### Sector Expiration

After `MIN_SECTOR_LIFETIME` segments were archived (since sector creation), the farmer should check whether the sector have expired and can no longer be farmed based on the “age” (history size at plotting) of each sector.
For each sector `sector_id` and `history_size` when this sector was plotted:

1.  When current history size of the chain reaches `sector_expiration_check_history_size = history_size + MIN_SECTOR_LIFETIME` farmer should check when to expire this sector based on corresponding `segment_commitment` of last archived segment.
2. Compute `sector_max_lifetime = MIN_SECTOR_LIFETIME + 4 * history_size`. With this limitation on sector lifetime, a sector with expire with probability ~50% by the time history doubles since it’s initial plotting point and is guaranteed to expire by the time history doubles again.
3. Compute `expiration_history_size = hash(sector_id || segment_commitment) mod (sector_max_lifetime - sector_expiration_check_history_size) + sector_expiration_check_history_size`
4. When the current history size reaches `expiration_history_size`, expire this sector.
5. Replot the sector for new history size as described in [Plotting](#plotting).

## Farming

***Auditing the history***

### Challenge Generation

1. For each `slot_number`, compute the `global_challenge` as `hash(global_randomness||slot_number)`. The `slot_number` and `global_randomness` are derived from PoT (see [derive_global_randomness](./proof_of_time.md#derive_global_randomness)).
2. Compute the `sector_slot_challenge = global_challenge XOR sector_id`
3. Compute the `s_bucket_audit_index = sector_slot_challenge mod NUM_S_BUCKETS`

### Audit

1. Read the corresponding s-bucket at `s_bucket_audit_index` from disk into memory.
2. For each `chunk` in the bucket, compute `audit_chunk = keyed_hash(sector_slot_challenge, chunk)`, truncated to 8 bytes
3. Check if the result (as integer) falls within +/-`voting_solution_range/2` of the `global_challenge`
4. Sort all the potentially winning `audit_chunks` by their “quality” - the closest to `global_challenge` first.
5. [Prove](#proving) the best chunk and [submit](#submitting-a-solution) the solution.

### Proving

1. For a winning `audit_chunk` (8 bytes), derive the `chunk_offset` from the parent full chunk’s position in the *s-bucket.*
2. Get the full 32 byte `chunk` at that `chunk_offset`.
3. From `encoded_chunks_used` bitfields determine if it is an encoded chunk.
4. If not, chunk is not eligible for proving.
5. If yes, then determine parent record `piece_offset` of this `chunk`.
6.  Compute the steps 1-7 in [Recovering the Record](#recovering-the-record) and obtain `plotted_chunks`
7. Save the `proof_of_space` for this `chunk` used for decoding
8. Recover the `extended_chunks_poly` using decoded chunks with `recover_poly(plotted_chunks)`.
9. Retrieve the `record_commitment`.
10. Compute the `chunk_witness` for the decoded winning `chunk` that ties back to the `record_commitment` as `create_witness(extended_chunks_poly, s_bucket_audit_index)`, and attach both to the solution for verification against the original record commitment stored in the history.
11. Retrieve the `record_witness` that ties back to the `segment_commitment`.
12. Produce a `solution` consisting of

    ```rust
    struct Solution {
    	public_key:          32 bytes
    	reward_address:      32 bytes
    	sector_index:         2 bytes
    	history_size:         8 bytes
    	piece_offset:         2 bytes
    	record_commitment:   48 bytes
    	record_witness:      48 bytes
    	chunk:               32 bytes
    	chunk_witness:       48 bytes
    	proof_of_space:     160 bytes
    }
    ```


### Submitting a solution

If the winning `audit_chunk` is within `solution_range`:

1. Attach `solution` to block header.
2. Forge a new `block` (as defined in Substrate framework).
3. Seal the `block` content with `sign(secret_key, block)`.

Otherwise, submit a vote extrinsic with `solution`.

## Verification

***Ensuring a solution comes from a valid plot***

1. If the `public_key` of the block's farmer is in the block list, ignore the block.
2. Verify that the consensus log in the block header is correct. This includes `solution_range` and `global_randomness`.
3. Verify that PoT items in the header are correct according to [New Blocks](./proof_of_time.md#new-blocks)
4. Verify that `solution_range` and `global_randomness` are correct for the `slot_number` of the block.
5. Compute the `global_challenge = hash(global_randomness||slot_number)`.
6. Verify that current chain history size in segments is greater than winning `piece_index / NUM_PIECES`.
7. Verify that the `history_size` in the solution is not greater than the current chain `history_size`.
8. Verify that `piece_offset ≤ max_pieces_in_sector`
9. Re-derive `sector_id`
    1. Compute `public_key_hash = hash(public_key)`
   2. Re-derive the `sector_id = keyed_hash(public_key_hash, sector_index || history_size)`
10. Verify that the `sector_id` submitted has not expired:
    1. Compute `sector_expiration_check_history_size = history_size + MIN_SECTOR_LIFETIME` and `sector_max_lifetime = MIN_SECTOR_LIFETIME + 4 * history_size`.
    2. Take the archived segment `segment_commitment` at `sector_expiration_check_history_size`.
    3. Compute `expiration_history_size = hash(sector_id||segment_commitment) mod (sector_max_lifetime - sector_expiration_check_history_size) + sector_expiration_check_history_size`
    4. Check that `expiration_history_size` is smaller than current history size of the chain.
11. Re-derive the `sector_slot_challenge = global_challenge XOR sector_id`
12. Re-derive the `s_bucket_audit_index = sector_slot_challenge mod NUM_S_BUCKETS`
13. Re-derive the `evaluation_seed` for the record from the `sector_id` and `piece_offset` as `hash(sector_id || piece_offset)`
14. Verify `proof_of_space` with `Is_Proof_Valid(K, evaluation_seed, s_bucket_audit_index, proof_of_space)`
15. Ensure the `chunk` satisfies the challenge criteria:
    1. Compute the `masked_chunk` as `Encode(chunk, hash(proof_of_space))`
    2. Compute the keyed hash `keyed_hash(sector_slot_challenge, masked_chunk)` truncated to `audit_chunk` size
    3. Ensure the result falls within +/- `solution_range/2` of the `global_challenge`
16. Ensure the provided `chunk` was correctly extended from a history piece for the assigned record commitment:
    1. Verify the `chunk_witness` for the given `chunk`, `record_commitment`, and `s_bucket_audit_index`
17. Ensure the encoded record belongs to the assigned slot and that record also belongs to the history:
    1. Re-derive the `piece_index` from the `piece_offset` and `history_size` the same way as during [pre-plotting](#pre-plotting-initialization) (as described in Verifiable Sector Construction)
    2. Retrieve the `segment_commitment` of the segment that contains the assigned `piece_index`
    3. Hash the `record_commitment` to obtain the `record_commitment_hash`
    4. Verify the `record_witness` for the `piece_index` , `record_commitment_hash` and `segment_commitment`
18. Ensure the farmer did not outsource solving to a third-party without revealing their private keys by verifying the `farmer_signature` with the `public_key` and `chunk`.
19. Verify the signature on the block content.
20. If another block signed with the solution with same solution (`public_key`, `sector_index`, `piece_offset`,`chunk`, `chunk_audit_index` and `slot_number`) had already been received, report an equivocation by `public_key` and ignore the block.

The above steps assume standard block and transaction verification.

## Extraction

***Serving data from the plot***

1. When requested a piece at `piece_index` identify `sector_index` and `piece_offset` where that piece is stored.
2. For the record plotted at `piece_offset` in that sector perform record recovery and compose the piece.

### Recovering the Record

1. From the record’s `encoded_chunks_used` bitfield determine which s-buckets contain chunks of this record.
2. Read all the `plotted_chunks` of the parent record from their respective s-buckets. Set the encoded chunk value `None` in places where `encoded_chunks_used` is `0`.
Total length of `plotted_chunks` should be `NUM_CHUNKS/ERASURE_CODING_RATE`.
3. Derive the `evaluation_seed` for the record from `sector_id` and `piece_offset` within this sector as `evaluation_seed = hash(sector_id || piece_offset)`
4. Derive a Chia proof-of-space table `pos_table = generate(K, evaluation_seed)`
5. Iterate through each `(s_bucket, plotted_chunk)` in `plotted_chunks`:
    1. If `plotted_chunk` is `None`, continue to next chunk.
    2. Else, query the `pos_table` for a valid proof-of-space`proof_of_space` for this chunk as `find_proof(pos_table, s_bucket)`. The proof should exist if the chunk was encoded and plotted.
    3. Decode the chunk in-place with `decode(plotted_chunk, hash(proof_of_space))`.
6. If the number of `plotted_chunks` is less then `NUM_CHUNKS`, we need extra chunks to recover the record. Insert each `extra_chunk` in places of `None` in `plotted_chunks` from the beginning, however many extra chunks there are.
7. Recover the source `record` from the decoded chunks with `recover(plotted_chunks))`.

### Composing the Piece

1. Retrieve the `record_commitment` and `record_witness` from the sector table.
2. Return the recovered piece as `record || record_commitment || record_witness`.

## Randomness Updates

Global randomness is updated every slot with the output of Proof-of-Time chain for that slot. See [Proof-of-Time Specification](./proof_of_time.md).

## Solution Range Updates

Initial solution range `INITIAL_SOLUTION_RANGE` is computed based on a single plotted sector with the goal of getting a single winning chunk in each slot with probability `SLOT_PROBABILITY`, as follows:

Let `num_audit_chunks` be the number of tickets read during single slot audit in a sector. For each piece (`max_pieces_in_sector`), we audit a single full chunk in a single s-bucket. The probability of s-bucket containing a full chunk at that position is `NUM_CHUNKS/NUM_S_BUCKETS` (1/2). Thus, a farmer has this many tickets at each slot:

$$
\text{num\_chunks} = \text{max\_pieces\_in\_sector}*\frac{\text{NUM\_CHUNKS}}{\text{NUM\_S\_BUCKETS}}
$$

To compute initial solution range for one sector, maximum possible solution range (`U64::MAX`) is divided by `num_chunks` and multiplied by slot probability:

$$
\frac{\text{U64::MAX}}{\text{num\_chunks}}*\text{SLOT\_PROBABILITY}
$$

`INITIAL_SOLUTION_RANGE` becomes `solution_range` for the first **era**.

Global `solution_range` is adjusted every era accordingly to actual and expected blocks produced per era to keep block production at the same pace while space pledged on the network change:

1. After every `ERA_DURATION_IN_BLOCKS` number of blocks, a new era begins.
2. At the start of a new era, compute and store new `solution_range`

$\text{next\_solution\_range} = \max\left(\min\left(\frac{\text{era\_slot\_count}}{\text{ERA\_DURATION\_IN\_BLOCKS}}*\text{SLOT\_PROBABILITY}, 4\right), 1/4\right)*\text{solution\_range}$.

### Conversion Rate Between Solution Range and Space Pledged

The relationship between the solution range and the amount of space pledged is dynamically calculated using the function `solution_range_to_sectors`. This function computes the number of sectors corresponding to a given solution range by adjusting for slot probability and the configuration of data within sectors. Specifically, the maximum possible solution range (`SolutionRange::MAX`) is first reduced according to the slot probability, which reflects the desired frequency of successful block production. This is further adjusted by the distribution of data, particularly the ratio of the number of chunks per s-bucket in each sector (`MAX_PIECES_IN_SECTOR * Record::NUM_CHUNKS / Record::NUM_S_BUCKETS`), to account for the probability of an occupied s-bucket being successfully audited in the verification process. The resulting figure is then divided by the current solution range to determine the total number of sectors that this solution range can effectively cover.

```rust
const fn solution_range_to_sectors(solution_range: SolutionRange) -> u64 {
    let sectors = SolutionRange::MAX
        // Account for slot probability
        / SLOT_PROBABILITY.1 * SLOT_PROBABILITY.0
        // Now take sector size and probability of hitting occupied s-bucket in sector into account
        / (MAX_PIECES_IN_SECTOR as u64 * Record::NUM_CHUNKS as u64 / Record::NUM_S_BUCKETS as u64);

    // Take solution range into account
    sectors / solution_range
}
```
