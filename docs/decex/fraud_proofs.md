---
title: Fraud Proofs
sidebar_position: 6
description: Proving fraudulent behavior on domains
keywords:
    - execution
    - decex
    - fraud proof
    - challenge period
last_update:
  date: 03/15/2024
  author: Ning Lin
---
import Collapsible from '@site/src/components/Collapsible/Collapsible';


Every domain operator executes the domain block ([as described](workflow.md#domain-block-execution-on-the-operator-node)), derived deterministically from the consensus block, and submits this computational result to the consensus chain as an execution receipt within the next bundle this operator produces, thereby committing to the execution result. By default, the computation result is optimistically assumed correct until challenged by a fraud proof during the challenge period of `BlockTreePruningDepth` blocks. All domain nodes scrutinize the submitted execution results, and upon detecting any discrepancies, they challenge the execution by submitting a fraud proof to the consensus chain as an unsigned extrinsic. This fraud proof includes or calls from a host function all necessary data and the state of the domain required for the verification process, which can be executed by a node on the consensus chain (has access to the consensus state but not the domain). If the node who detected fraud is also a registered operator of this domain, they can submit a new execution receipt to the consensus chain with their next bundle, which will override the fraudulent one in the [block tree](interfaces.md#block_tree) once the fraud proof is accepted by the consensus chain.

Any domain node (a node that has an up-to-date state of domain A) can submit fraud proofs for domain A. Whether the node is acting honestly or not in this particular instance is determined by the validity of the fraud proof. The node does not have to stake or run operator (produce bundles) to report fraud.

Fraud proofs are verified on the client side, first in the transaction pool and then on importing the block.

Broadly, fraud proofs can be categorized into those caused by invalid execution receipt fields and those caused by invalid state transitions.

We currently handle the following types of fraud proofs:

- [Bundle Equivocation](#bundle-equivocation)

Execution Receipt invalid due to incorrect fields:

- [Invalid Block Fees](#invalid-block-fees) - incorrect fees information
- [Invalid Transfers](#invalid-transfers)  - incorrect bookkeeping of transferred or burnt coins on domain
- [Invalid Extrinsics Root](#invalid-extrinsics-root) - incorrect set or order of extrinsics executed in this ER
- [Invalid Domain Block Hash](#invalid-domain-block-hash) - incorrect domain block header hash
- [Incorrect List of Inboxed Bundles](#incorrect-list-of-inboxed-bundles) - some valid bundles were listed as invalid, or missing, and/or some executed bundles were invalid due to extrinsics in their body being invalid, in [order](#invalid_bundle) of `InvalidBundleType`.

Incorrect state transition:

- [Invalid State Transition](#invalid-state-transition)

## Invalid Bundle

An invalid bundle is a bundle that exhibits misbehavior either in its extrinsic content or the execution receipt. An invalid bundle may or may not go into the consensus block. If the consensus node can identify the invalidity of a bundle without requiring the transaction data, such bundles will be promptly detected and rejected by the consensus node. As a result, they will not be included in the consensus block. On the other hand, there may be other invalid bundles that the consensus node cannot identify without processing the complete transaction data. In such cases, these invalid bundles will be included in the consensus block and handled by the operators. 

Operators will be responsible for filtering out the invalid bundles included in the consensus block. A bundle can be invalid due to one or several extrinsics in its body being invalid, for the following reasons in this order (`InvalidBundleType`):

1. `UndecodableTx(extrinsic_index)`
2. `OutOfRangeTx(extrinsic_index)`
3. `InherentExtrinsic(extrinsic_index)`
4. `IllegalTx(extrinsic_index)`
5. `InvalidXDM(extrinsic_index)`

An operator executing a domain block will signal such invalid bundles with their `InvalidBundleType` in the execution receipt `ER::inboxed_bundles` field. Once the ER is confirmed, the authors of invalid bundles will be slashed.

Once operators have signaled all invalid bundles, the remaining data for computation is considered clean, following conventional Fraud Proof principles. To prove the integrity of clean data later, auxiliary data is added to the receipt, including crucial information like `inboxed_bundles`, `domain_block_extrinsics_root`, and `domain_block_hash`. The transactions within the remaining bundles are compiled into the final extrinsic list of the domain block, which is subsequently executed. Any misbehavior from this execution would fall under an invalid state transition category.

## Invalid Receipt

An invalid execution receipt (ER) of a domain block may exhibit misbehavior either in its executed extrinsic content or auxiliary information fields. The execution receipt for the previous block are submitted by the operator together with their next bundle as a way to make operators commit to their ERs. For the complete list of ER fields see [Execution Receipt](bundles_blocks.md#execution-receipt) 

When an honest operator detects an incorrect field in ER produced by another operator, they submit a fraud proof. If such proof is valid, the fraudulent operator is slashed off their stake immediately.

### Consensus Nodes

The consensus node will verify as much as possible on receiving a bundle as [described here](workflow.md#initial-domain-bundle-verification-by-consensus-nodes).Once the bundles are well-formed, the consensus node can include them in the block. Verifying other reasons for invalid bundles exceeds the ability of the consensus node and is deterred to operators. 

The consensus node then includes the rest of the bundles in the next consensus block.
At this stage, the consensus node can report bundle equivocation. Note that operators can report this too.

### Bundle Equivocation

A dishonest operator may produce multiple bundles on the same slot with the same proof-of-election.

Similar to [how consensus block equivocation is addressed](https://github.com/paritytech/substrate/blob/689da495a0c0c0c2466fe90a9ea187ce56760f2d/client/consensus/slots/src/aux_schema.rs#L53), consensus chain nodes perform a check to determine if a bundle has been equivocated when verifying its validity. If an equivocation is detected, then this bundle is invalid, and the consensus chain node generates a bundle equivocation proof by submitting an unsigned extrinsic locally.

**Prover provides:**

- `header_1`: first header involved in the equivocation.
- `header_2`: second header involved in the equivocation.

Note: offender ID, slot and target domain are in the bundle header

**Verifier checks:**

1. Check whether the signatures on `header_1` and `header_2` correspond to the `offender` key.
2. Check that both headers are produced by the same operator on the same domain.
3. Check that `header_1` and `header_2` claim the same `slot` with the valid `proof_of_election`.
4. Check that `header_1` and `header_2` are different.
5. If either of the above is false, then the proof is invalid ⇒ ignore the fraud proof.
6. If all of the 1-4 are true, then the proof is valid ⇒ Accept the fraud proof and punish the `offender`


## Operators

After the operator receives a new consensus block, they validate the bundles relevant to their domain included in that block. They check the bundle for cases where a dishonest operator may have attempted to manipulate it by adding extrinsics that are not supposed to be included or removing them.

A class of fraudulent behaviors to be caught by honest operators within bundles are the discrepancies in the various domain state-related Execution Receipt (`ER`) fields (`domain_block_extrinsics_root`, `execution_trace`, etc.).

## Invalid Block Fees

A dishonest operator may include incorrect info on fees extracted from the executed block, causing an incorrect `ER::block_fees` field.

<Collapsible title="Note">
    Initially, a naive approach was to include an additional trace in the receipt that tracks the reward differences in each transaction, similar to the execution trace for the state difference. However, it was discovered that the multiple traces shares one pattern: every state transition, such as InitializeBlock, ApplyExtinsic, and FinalizeBlock, essentially follows a process of taking the input and pre_state and producing an output \{ input, pre_state ⇒ output }\. 
    
    Moreover, the state itself can undergo changes during this process. The post_state_root, in essence, represents the most condensed expression of the output, and we can extend it to encompass reward changes as well since they are part of the output.

    A proposed solution is to enhance the current trace from a list of intermediate state roots to a more comprehensive list of intermediate outputs that include reward information after each transaction. By incorporating reward information into the trace, we can detect the correctness of rewards after each transaction and generate a fraud proof if any discrepancies arise.

    - Before: the trace is a list of post_state_root
    - Proposition: the trace is a list of TraceDetails \{ post_state_root, rewards_info }\.
</Collapsible>


Detect if the external ER has a different `block_fees` field, if so the operator will need to construct a fraud proof that includes the correct `block_fees` field and data that prove the integrity of this correct `block_fees`.

**Prover provides:**

- `domain_id`: the id of the domain this fraud proof targeted
- `bad_receipt_hash`*:* the targeted invalid ER
- `storage_proof`: the storage proof of the `pallet_operator_rewards::BlockRewards` storage item from the domain chain that attests correct `block_fees`

**Verifier checks:**

1. Verify `bad_receipt_hash` exists
2. Verify the `bad_receipt_hash.final_state_root` corresponds to the value included with the consensus chain state root
3. Verify that storage proofs included a value for `block_fees != bad_receipt_hash::block_fees`

## Invalid Transfers

A dishonest operator may include incorrect info on transfers sent or received in extrinsics of the executed block, causing an incorrect `ER::transfers` field.

Detect if the external ER has a different `transfers` field, if so the operator will need to construct a fraud proof that includes the correct `transfers` field and data that prove the integrity of this correct `transfers`.

**Prover provides:**

- `domain_id`: the id of the domain this fraud proof targeted
- `bad_receipt_hash`*:* the targeted invalid ER
- `storage_proof`: the storage proof of the `Transfers` storage item from the domain chain that attests correct `transfers`

**Verifier checks:**

1. Verify `bad_receipt_hash` exists
2. Verify the `bad_receipt_hash.final_state_root` corresponds to the value included with the consensus chain state root
3. Verify that storage proofs included a value for `transfers.transfers_in != bad_receipt_hash::transfers.transfers_in` or `transfers.transfers_out != bad_receipt_hash::transfers.transfers_out`

## Invalid Extrinsics Root

When building a domain block, a dishonest operator may incorrectly change the extrinsics ordering compiled from the bundles or include an incorrect timestamp or runtime code upgrade inherents, causing an incorrect `ER::domain_block_extrinsics_root` field. This field represents the Merkle root of the final compiled extrinsic list, obtained from the bundles and specifically used to construct the domain block

1. Ordering transactions requires a known set of extrinsics, which, in turn, depends on identifying valid bundles. As such, this type of fraud proof depends on the [Incorrect List of Inboxed Bundles](#incorrect-list-of-inboxed-bundles), which should be reported first. 
2. Once we have a set of valid bundles from the host function, an honest operator can identify a mismatch in the `domain_block_extrinsics_root`, they can generate a fraud proof by providing all the bundles present in the corresponding consensus block. 
    
Upon receiving the proof, the consensus node can rerun the shuffle algorithm to reconstruct the final extrinsic list and obtain the correct `domain_block_extrinsics_root` value.

**Prover provides:**

- `domain_id`: ID of the domain this fraud proof targets.
- `bad_receipt_hash`: the targeted invalid ER.
- `valid_bundle_digests`: list of lists of extrinsics `(index, (signer,hash))` from all bundles

**Verifier checks:**

1. Verify a `bad_receipt` with `bad_receipt_hash` exists
2. Obtain from the host function the `block_randomness` for `consensus_block_hash` in `bad_receipt`
3. Obtain from the host function the timestamp extrinsic and runtime upgrade `set_code` extrinsic (if applicable). The inherents are not part of any bundle and are ingested directly into the domain block from the consensus chain.
4. Check that `valid_bundle_digests` correspond to the bundle digests in the targeted ER
5. Shuffle the extrinsics collected from `valid_bundle_digests`, timestamp and runtime upgrade extrinsics using `block_randomness` as a seed 
6. Compare if the root of the resulting ordered tree is different from `bad_receipt.domain_block_extrinsics_root` ⇒ Accept the fraud proof and punish the producer of `bad_receipt`.
7. If the root is same ⇒ Ignore the fraud proof.

## Invalid Domain Block Hash

Detect if the external ER has a different `ER::domain_block_hash` field, if so, the operator will need to construct a fraud proof that includes all components necessary to construct the domain block header and data that prove the integrity of these components:

- `domain_id`: the id of the domain this fraud proof targeted
- `bad_receipt_hash`, the targeted invalid ER hash
- `digest_storage_proof`, the storage proof of the `pallet_system::Digest` storage item of the domain chain

This fraud proof depends on [Invalid Extrinsics Root](#invalid-extrinsics-root) and [Invalid State Transition](#invalid-state-transition) proof being produced first and any fraud proofs for the parent domain block execution receipt.

**Verifier checks:**

1. Verify the `bad_receipt` with `bad_receipt_hash` exists.
2. Verify `bad_receipt.parent_domain_block_receipt_hash` corresponds to an existing `parent_receipt`
3. Verify the `digest` storage proof with `ER::final_state_root`
4. Construct the `derived_domain_block_hash` from `(bad_receipt.domain_block_number, bad_receipt.domain_block_extrinsic_root, bad_receipt.final_state_root, parent_receipt.domain_block_hash, digest)` by reconstructing a new header and hashing it.
5. Verify that `derived_domain_block_hash != bad_receipt.domain_block_hash` ⇒ Accept the fraud proof and punish the producer of `bad_receipt`.
6. If both `domain_block_hash` are same ⇒ Ignore the fraud proof.

## Incorrect List of Inboxed Bundles

A dishonest operator may misrepresent which bundles in the domain block were deemed invalid and excluded from execution or flag valid bundles as invalid, causing an incorrect `ER::inboxed_bundles` field of structure`(Valid or Invalid(InvalidBundleType), extrinsics_root)`. 

A fraud proof for this field only reports the first mismatch and does not need to report if there are multiple, as a single mismatch is sufficient to demonstrate the filed is incorrect.

There are several variants of why `inboxed_bundles` in the receipt can be wrong:

1. **Valid Bundle** 
    A valid bundle is listed as valid, but the bundle digest (list of extrinsic signers and hashes) is different.   
2. **True Invalid Bundle**
    1. An dishonest operator tries to pass an invalid bundle as valid. If an invalid bundle is marked as `Valid` in the bad ER, a fraud proof can be generated to demonstrate the bundle is actually wrong due to one of the above listed reasons (`IllegalTx`, `OutOfRangeTx`, etc.).
    2. An dishonest operator lists an invalid bundle as `Invalid`, but the reason why it is invalid (`InvalidBundleType`) is incorrect (i.e. locally checked `InvalidBundleType` is of higher precedence (in [this](#invalid-bundle) order) than listed in the ER or happens at an earlier extrinsic.) 
3. **False Invalid Bundle**
    1. An dishonest operator tries to present a valid bundle as `Invalid`. A fraud proof to show that `InvalidBundleType` is unjustified.
    2. An dishonest operator lists an invalid bundle as `Invalid`, but the reason why it is invalid (`InvalidBundleType`) is incorrect (i.e. a valid extrinsic is marked as invalid, an invalid extrinsic is marked invalid for a wrong reason, etc.) 

### Valid Bundle

**Prover provides:**

- `domain_id`: ID of the domain this fraud proof targets.
- `bad_receipt_hash`: the targeted invalid ER.
- `bundle_index`: index of mismatched bundle

**Verifier checks:**

1. Verify the `bad_receipt` with `bad_receipt_hash` exists.
2. Obtain from the host function the `bundle_body`  of the bundle in question.
3. Compute `valid_bundle_digest` of the `bundle_body`.
4. Compare that the digest is different from the one in `bad_receipt` ⇒ Accept the fraud proof and punish the producer of `bad_receipt`.
5. If the digest is same ⇒ Ignore the fraud proof.

### True/False Invalid Bundle

**Prover provides:**

- `domain_id`: ID of the domain this fraud proof targets.
- `bad_receipt_hash`: the targeted invalid ER.
- `bundle_index`: index of mismatched bundle
- `invalid_bundle_type(extrinsic_index)`: the `InvalidBundleType` with the mismatched extrinsic
- `extrinsic_inclusion_proof`: proof-of-inclusion of the extrinsic in the `invalid_bundle_type`
- `is_true_invalid_fraud_proof`: whether the variant of this proof is `TrueInvalid`(`true`) or `FalseInvalid`(`false`)

**Verifier checks:**

1. Verify the `bad_receipt` with `bad_receipt_hash` exists.
2. Determine the fraud proof variant. If `is_true_invalid_fraud_proof==true` then it’s `TrueInvalid`, else `FalseInvalid`.
3. Determine which scenario the fraud proof corresponds to (if any) based on its structure:
    1. For `FalseInvalid`, the `invalid_bundle_type` in the fraud proof and `bad_receipt` should be same for `bundle_index` (because the fraud proof will try to show it is wrong).
    2. For `TrueInvalid`, either:
        1. The proof trying to prove the bundle at `bundle_index` is invalid due to `invalid_bundle_type` while `bad_receipt` claims bundle at `bundle_index` is `Valid`.
        2. The proof trying to prove there is an invalid extrinsic that the `bad_receipt` thinks is valid in the questioned bundle, so the proof should point to an extrinsic with a smaller `extrinsic_index` than that in of the `bad_receipt`.
        3. The proof trying to prove the invalid extrinsic at `extrinsic_index` can not pass a validity check (e.g. `OutOfRangeTx`) that the `bad_receipt` thinks it can, so the proof should point to the same extrinsic and a check that is performed before the one in `bad_receipt` (in this [order](https://www.notion.so/Fraud-Proofs-v2-5295d767e5bb4bc9b170ce48e52c4754?pvs=21)).
    3. If none of the above match the fields of the fraud proof ⇒ Ignore the fraud proof.
4. Verify the storage proof `extrinsic_inclusion_proof` and get the `encoded_extrinsic`.
5. Verify `invalid_bundle_type(extrinsic_index)` as defined below.

The list below constitutes the possible fraudulent behaviors an operator can check for in a set of extrinsics included in a bundle.

### Undecodable Transaction

A dishonest operator may have included an extrinsic that fails to decode or excluded a decodable extrinsic as invalid. 

**Verifier checks:**

1. Attempt to decode the `encoded_extrinsic`.
2. If the attempt fails, the extrinsic is truly `Undecodable`.
3. For a `TrueInvalid` fraud proof, the tx must be `Undecodable` for the fraud proof to be considered valid.
4. For a `FalseInvalid` fraud proof, the tx must be decodable for the fraud proof to be considered valid.

### Out Of Range Transaction

A dishonest operator may have included a transaction not in the respective tx range defined here when producing a bundle or excluded a transaction within range as being out of range.

**Verifier checks:**

1. Request a check from the host function on whether the transaction is within the range according to the rule defined in [Transaction Selection for Bundle Production](workflow.md#transaction-selection-for-bundle-production) 
2. For a `TrueInvalid` fraud proof, the tx must be outside of the range for fraud proof to be considered valid.
3. For a `FalseInvalid` fraud proof, the tx must be within the range for fraud proof to be considered valid.

### Inherent Extrinsic

A dishonest operator may have included an inherent extrinsic, which should not have been bundled or excluded a valid transaction that is not inherent. The inherent extrinsic data is data external to the domain from the consensus chain. 

**Verifier checks:**

1. Request a check from the host function on whether the extrinsic is an inherent extrinsic.
2. For a `TrueInvalid` fraud proof, the tx must be an inherent extrinsic.
3. For a `FalseInvalid` fraud proof, the tx must not be an inherent extrinsic.

### Illegal Transaction

When producing a bundle, a dishonest operator may include a transaction that fails to pass the basic transaction validity check wasting the blockspace, or exclude a valid transaction. The basic checks of transaction validity are [defined in Substrate](https://github.com/paritytech/polkadot-sdk/blob/0e49ed72aa365475e30069a5c30e251a009fdacf/substrate/primitives/runtime/src/transaction_validity.rs#L40), including account balance too low, bad signature, 

**Verifier checks:**

1. Obtain from the host function the full body of the in question (all extrinsics).
2. Request from the host function a check of all extrinsics in the bundle within the same runtime context
3. For a `TrueInvalid` fraud proof, the tx must be illegal for fraud proof to be considered valid.
4. For a `FalseInvalid` fraud proof, the tx must be illegal for fraud proof to be considered valid.

<!-- TODO check if still corect ### **Invalid XDM**

A dishonest operator may include an invalid XDM extrinsic or exclude a valid XDM extrinsic.

- Note
    
    The presence of a filter-out process complicates the fraud proof mechanism. To address this, we propose eliminating the filtering of any extrinsic and instead allowing them to fail if they are found to be invalid.
    
    This approach resembles the ApplyExtrinsic in the state transition below. However, for the verification process, a different state witness is used. Specifically, we need to provide a state witness of the consensus chain in order to verify the validity of XDM.
    
    We can consider extending the intermediate state root to include additional information. For instance, we could introduce a structure like something like NormalExtrinsic(state_root) and XDM(state_root) to facilitate a quick determination of the required state witness whenever there is a trace mismatch.
    

**Verifier checks:**

TODO

--- -->

Note, that a dishonest operator may also ignore some valid transactions by not including them in the bundle.

The motivation behind such behavior could be due to the operator's laziness or, in more concerning scenarios, the operator may be maliciously excluding valid transactions for personal gain (e.g., censorship). Unfortunately, detecting such behavior is challenging and is not feasible in any way. On the positive side, the users will resubmit their transactions, eventually going to some honest operators. In other words, our design is censorship-resistant.

## Invalid State Transition

A dishonest operator may produce a domain block that results in an incorrect state root by modifying the state in an invalid way `ER::execution_trace`. The honest operator detects at which index of the execution trace the ER is incorrect.

This fraud proof depends on any fraud proofs for the parent domain block execution receipt (`parent_receipt.domain_block_hash`).

Proving and verification algorithm varies depending on which execution phase the transition was applied wrongly. 

**Prover provides:**

- `domain_id`: ID of the domain this fraud proof targets.
- `bad_receipt_hash`: hash of the fraudulent receipt in which the trace mismatch was found.
- `proof`: storage proof which can be used to reconstruct a partial state trie to re-run the execution by someone who does not own the whole state.
- `execution_phase`: which [execution phase](workflow.md#domain-block-execution-on-the-operator-node) the alleged wrong state transition happened.
    1. `InitializeBlock` phase
        
        The input data for `InitializeBlock` $B_n$ is the initialized block header $Header_n$ (see `initialize_block(header)` [definition](https://github.com/paritytech/substrate/blob/689da495a0c0c0c2466fe90a9ea187ce56760f2d/frame/executive/src/lib.rs#L396)). There are five [components](bundles_blocks.md#domain-blocks) in the domain block [header](https://github.com/paritytech/substrate/blob/689da495a0c0c0c2466fe90a9ea187ce56760f2d/primitives/runtime/src/generic/header.rs#L39): 
        
        - `parent_hash`: hash of parent domain block header $B_{n-1}$
        - `block_number`: $n$
        - `state_root`: default value of Hash as it’s not executed yet
        - `extrinsics_root`: default value of Hash as it’s not initialized yet
        - `digest`: consensus block hash
        
        The fields are the default value or in the receipt, so the prover constructs a storage proof `proof` of the execution of the `InitializeBlock` phase with the above inputs.
        
    2. `ApplyExtrinsic` phase, and specifically during application of which extrinsic with `(extrinsic_proof, mismatch_index)` 
        
         To prove the `ApplyExtrinsic` execution step, we provide:
        
        - `mismatch_index`: extrinsic index in the domain block after correct shuffling $i$
        - `extrinsic_proof`: Merkle proof of the extrinsic data at the index $i$ against `domain_block_extrinsics_root`
        
        Verifier can fetch the full extrinsic data from the host function, so we do not have to include it.
        
        The prover constructs the storage `proof` for the execution delta of state right before (after executing all previous extrinsics) and right after (before executing the rest of the extrinsics).
        
    3. `FinalizeBlock` phase, and `trace_length` to show after how many steps of execution trace the execution of the block should be finalized (length of trace). 
        
        This phase requires no additional input data.      

**Verifier checks:**

1. Fetch the domain runtime code from the host function.
2. Verify the correctness of transition data based on `execution_phase`:
    - `InitializeBlock` phase: fetch `domain_block_hash` in the parent receipt
    - `ApplyExtrinsic` phase: verify the Merkle proof `extrinsic_proof` of extrinsic against `domain_block_extrinsics_root`
    - `FinalizeBlock`
        - Let `M = bad_receipt.execution_trace.len()`
        - If `trace_length >= M`, verify that the `bad_receipt`'s `execution_trace[M-2] -> execution_trace[M-1]` is not a valid state transition of `finalize_block`, means the `execution_trace` should not stop at M.
        - If `trace_length < M`, verify that `bad_receipt`'s `execution_trace[trace_length-2] ->` `execution_trace[trace_length-1]` is a valid state transition of `finalize_block`, means the `execution_trace` should stop at `trace_length`.
3. Re-run the state transition and get the post-state root after the execution.
4. If the post-state root matches the state root in the trace of the header being challenged, then the proof is invalid ⇒ ignore the proof
5. If the post-state root does not match the state root in the trace, then the proof is valid ⇒ accept the proof and punish the authors of receipt identified by `bad_receipt_hash`.

## Fraud proof priority in transaction pool

To prune a chain of fraudulent Execution Receipts and slash the operators who submitted them, it is sufficient to include in a consensus block and process only a single fraud proof for the oldest fraudulent ER. If the fraud proof is valid, all the children blocks will be pruned and operators slashed automatically.
A fraud proof that targets a bad ER has a priority is defined as `MAX - blocks_before_bad_er_confirm`, where `blocks_before_bad_er_confirm` is how many blocks remain until this ER is outside the challenge period. A fraud proof that targets a bad ER that is closer to being confirmed is more urgent and thus has a higher priority to be accepted by the transaction pool and to be included in the next consensus block. For a given domain, at most one fraud proof will be accepted by the transaction pool at a time; if an incoming fraud proof has a higher priority than the fraud proof already in the pool then it will replace the previous fraud proof, otherwise it will be rejected.

For the bundle equivocation fraud proof, since it is not time-sensitive its priority is a const value `MAX - challenge_period - 1` thus lower than any other type of fraud proofs that target bad ER. For a given operator, at most one bundle equivocation fraud proof will be accepted by the transaction pool at a time, if there is already a bundle equivocation fraud proof in the pool, incoming bundle equivocation fraud proof that targetting the same operator will be rejected.

<!-- TODO check if still correct
### Excessive Transaction

A dishonest operator may include a transaction resulting in a huge state witness that is unable to fit into the parent chain’s extrinsic.

1. To verify the state transition proof, the verifier must re-execute a transaction using the pre-state provided in the proof. This pre-state, i.e., state witness, including all the storage reads and writes within the transaction, it’s part of the proof and is sent to the parent chain as an unsigned extrinsic. However, this approach can encounter challenges when fitting the proof into the parent chain's extrinsic due to size limitations. Moreover, the exact size of the state witness remains unknown until the transaction is executed.

This attack vector requires operators to execute the domain transaction using a custom Overlay that will abort once the proof size exceeds the max storage proof size limit, which will simply make the transaction execution fail. Once finding an excessive transaction, the honest operator dumps the entire storage proof on abortion and includes it into the proof, which must be able to fit into the parent chain’s extrinsic.

The proposed solution is mentioned in [In order to prevent that scenario, the operator executes the domain block by consistently utilizing a custom **`TrieBackend`** or something similar, capable of aborting the execution when there is excessive storage access. Throughout this execution, the size of the storage proof needed to prove the execution on the verifier side is kept track of, specifically, by the **`ProofRecorder`** in Substrate. If the storage proof size exceeds the maximum proof size limit `MaxFraudProofSize`, an **`OutOfStorage`** error will be triggered by the backend, resulting in the failure of the transaction.  This is similar `OutOfGas` in Ethereum. From an external perspective, this failure is indistinguishable from a failure caused by internal transaction logic.](https://www.notion.so/In-order-to-prevent-that-scenario-the-operator-executes-the-domain-block-by-consistently-utilizing--e8ed7d8827df489d937cc6b4cfb18ab5?pvs=21) 

- Open domain runtime code may contain the InitializeBlock/FinalizeBlock logic that can cause huge state witness (*later*). -->
