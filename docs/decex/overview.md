---
title: Domains Overview
sidebar_position: 1
description: General workflow of the domain operation. 
keywords:
    - execution
    - decex
last_update:
  date: 01/09/2025
  author: Saeid Yazdinejad
---

## Terminology

**Domain**: an enshrined rollup that performs settlement or execution for the consensus chain. Each domain uses a standard set of permissioned runtimes but may have a user-defined configuration.

**Domain Operator**: an account, that by staking SSC and running a operator software, operates a domain node and takes the responsibility of producing new bundles when elected, validating transactions, and executing transactions within a specific domain. Operators also watch for fraud and challenge other potentially fraudulent operators.

**Domain Subnet**: a separate P2P gossip network for each domain

**Domain Bundle:** a collection of transactions for a domain that are ready for execution

**Execution Receipt (ER):** a commitment to the execution of a domain block, included in the bundle

**Domain Block**: a derived block that consists of transactions from one or more bundles, deterministically ordered

**Fraud Proof:** proof that shows that a commitment to some block with an execution receipt is invalid

## High-Level Workflow

1. **Bootstrap Consensus Chain**
    
    Given a genesis block and at least one genesis farmer, we will have block production on the consensus chain. On its own, the consensus chain will only issue rewards to farmers and allow for balance transfers of SSC. 
    
    <!-- TODO verify the page is up to date For more information, see **Link TBD**. -->
    
2. **Domain Creation**
    
    The sudo user will register the first domain runtime by calling the `register_domain_runtime` extrinsic, uploading its WASM runtime directly into the chain state. The sudo user will then instantiate the first domain by calling the `instantiate_domain` extrinsic on the previously registered domain runtime. This will include a genesis config, from which we may derive a chainspec and a genesis block. 
    
    For more details see [Domain Instantiation & Upgrades](workflow.md#domain-instantiation--upgrades) 
    
3. **Operator Staking**
    
    Anyone may now deposit SSC and stake as an operator of this domain, allowing them to participate in the VRF election to produce bundles and executed domain blocks. They do this by submitting the `register_operator` extrinsic targeting the first domain instance along with the minimum required staking deposit. On the next stake epoch, they will be eligible to participate in the VRF election. 
    
    For more details, see [Staking Protocol](staking.md) 
    
4. **Domain Transactions**
    
    Users of the first domain may now produce extrinsics (transactions) and submit them to operators on the domain’s subnet. When pre-validating extrinsics, operators only check to ensure the extrinsic is well-formed and that the user can afford the blockspace storage fee. They do not attempt to execute the transaction to determine if the execution weight can be paid.
    
5. **VRF Election**
    
    For each time slot, the registered operator will attempt to solve the VRF puzzle with the success probability determined by the `bundle_slot_probability` defined in the genesis `domain_config`. To do so, they sign the slot challenge and check if it is below the desired threshold. When elected, they will produce a new domain bundle. 
    
    For more details, see [Bundle Producer Election](workflow.md#bundle-producer-election) 
    
6. **Bundle Production**
    
    To produce a new bundle, the operator will include a `ProofOfElection` for the VRF election, an `ExecutionReceipt` that either extends or confirms the last domain block tracked on the consensus chain and all `extrinsics` that fall within the operator's sector of the extrinsic sortition ring. The bundle is then broadcast on the consensus chain gossip network via `submit_bundle` extrinsic. 
    
    For more details, see  [Domain Bundle Production](workflow.md#domain-bundle-production)
    
7. **Bundle Verification**
    
    All consensus nodes receiving the bundle will only verify that it is well-formed and includes a valid `ProofOfElection` based on the stake distribution for this epoch before broadcasting to their peers and placing the bundle within their local extrinsic pool.
    
    For more details, see [Initial Domain Bundle Verification by Consensus Nodes](workflow.md#initial-domain-bundle-verification-by-consensus-nodes) 
    
8. **Consensus Block Production**
    
    When a consensus node is elected to produce a new block, it will include as many valid domain bundles as will fit into the block and broadcast on the consensus network. Other nodes will only accept blocks that include valid bundles. On block execution, each bundle header will be applied to the consensus chain state by calling `submit_bundle`. The `ExecutionReceipt` will extend or confirm an entry within the domain’s `BlockTree`, while the `bundle_extrinsics` will be added to the domain’s `execution_inbox`. 
    
    For more details, see [Bundle Header Application ](workflow.md#bundle-header-application) 
    
9. **Domain Block Execution**
    
    Given a valid consensus block with at least one domain bundle, the domain operator (or any full domain node) may build and execute the resulting domain block. Extrinsics will be deduplicated, grouped by sender ID, and shuffled using the consensus block PoAS as the seed. This mitigates the ability for operators to extract value from users by re-ordering or inserting their own extrinsics. The domain block with then be carefully executed, one extrinsic at a time, allowing the operator to produce an `ExecutionReceipt`, which is cached until they produce the next bundle. 
    
    For more details, see [Domain Block Production](workflow.md#domain-block-production) and [Domain Block Execution on the Operator Node](workflow.md#domain-block-execution-on-the-operator-node) 
    
10. **Challenging Operators** 
    
    Any node who observes an `ExecutionReceipt` within any bundle for any consensus chain block that differs from what they produced locally has detected fraud. To handle the fraud they will produce a `submit_fraud_proof` extrinsic, which includes a proof. If the proof is valid, it will be included in the consensus chain, which will prune the `ExecutionReceipt` (and all children) from the `BlockTree` and slash all related operators. 
    
    For more details, see [Slashing Stake](staking.md#slashing-stake) and [Fraud Proofs](fraud_proofs.md).

11. **Submit Missing Receipt**

    After a fraud proof is accepted, the targetted bad receipt and all its descendant receipts will be pruned, this will create a gap between the latest domain block (i.e. `HeadDomainNumber`) and the latest receipt on chain (i.e. `HeadReceiptNumber`), when this happen the operator will start producing the `submit_receipt` extrinsic to fill up this gap, and after `HeadDomainNumber - HeadReceiptNumber = 1` the operator will resume producing `submit_bundle` extrinsic.

    For more details, see [`submit_receipt`](interfaces.md#submit_receipt) and [Lagging operator protection](workflow.md#lagging-operator-protection).
