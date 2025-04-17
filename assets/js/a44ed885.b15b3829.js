"use strict";(self.webpackChunkportal=self.webpackChunkportal||[]).push([[192],{5175:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>h,frontMatter:()=>r,metadata:()=>i,toc:()=>l});const i=JSON.parse('{"id":"consensus/consensus_chain","title":"Consensus Chain","description":"General sub-protocols of the consensus chain operation.","source":"@site/docs/consensus/consensus_chain.md","sourceDirName":"consensus","slug":"/consensus/consensus_chain","permalink":"/protocol-specs/docs/consensus/consensus_chain","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"title":"Consensus Chain","sidebar_position":1,"description":"General sub-protocols of the consensus chain operation.","keywords":["consensus","block","header","transaction","synchronization"],"last_update":{"date":"10/03/2024","author":"Dariia Porechna"}},"sidebar":"tutorialSidebar","previous":{"title":"Consensus","permalink":"/protocol-specs/docs/category/consensus"},"next":{"title":"Proof-of-Archival-Storage","permalink":"/protocol-specs/docs/consensus/proof_of_archival_storage"}}');var o=s(4848),t=s(8453);const r={title:"Consensus Chain",sidebar_position:1,description:"General sub-protocols of the consensus chain operation.",keywords:["consensus","block","header","transaction","synchronization"],last_update:{date:"10/03/2024",author:"Dariia Porechna"}},c=void 0,a={},l=[{value:"Public Parameters",id:"public-parameters",level:2},{value:"Header",id:"header",level:2},{value:"Digest Items",id:"digest-items",level:3},{value:"Body",id:"body",level:2},{value:"Justifications",id:"justifications",level:2},{value:"Synchronization",id:"synchronization",level:2},{value:"Fast sync",id:"fast-sync",level:2},{value:"Substrate Sync",id:"substrate-sync",level:2},{value:"Block Reward Address",id:"block-reward-address",level:2}];function d(e){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,t.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.p,{children:"Unless specified otherwise below, consensus chain primitives are inherited from Substrate."}),"\n",(0,o.jsx)(n.h2,{id:"public-parameters",children:"Public Parameters"}),"\n",(0,o.jsx)(n.p,{children:"These parameters are fixed at the beginning of the protocol and used by all clients."}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsx)(n.li,{children:"Genesis block (derived from Substrate chain specification)"}),"\n"]}),"\n",(0,o.jsx)(n.h1,{id:"consensus-block-structure",children:"Consensus Block Structure"}),"\n",(0,o.jsx)(n.p,{children:"A block on the consensus chain largely follows standard Substrate block structure:"}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsx)(n.li,{children:"Header,"}),"\n",(0,o.jsx)(n.li,{children:"Body,"}),"\n",(0,o.jsx)(n.li,{children:"Justifications"}),"\n"]}),"\n",(0,o.jsx)(n.h2,{id:"header",children:"Header"}),"\n",(0,o.jsx)(n.p,{children:"The block header carries a set of consensus items necessary for integrity and continuity of the consensus chain:"}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"number"}),": block number"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"extrinsics_root"}),": Merkle root hash of extrinsics trie included in the block body."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"state_root"}),": Merkle root hash of state trie, used to verify the state of the consensus chain."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"parent_hash"}),": hash of the parent block"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"digest"}),": set of Subspace-specific auxiliary data"]}),"\n"]}),"\n",(0,o.jsx)(n.h3,{id:"digest-items",children:"Digest Items"}),"\n",(0,o.jsx)(n.p,{children:"PreRuntime items:"}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"Slot"}),": the slot claimed by this block"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"Solution"}),": the PoS solution as defined in ",(0,o.jsx)(n.a,{href:"/protocol-specs/docs/consensus/proof_of_archival_storage#proving",children:"Proving"})]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"PreDigestPotInfo"}),": information about PoT chain, includes ",(0,o.jsx)(n.code,{children:"proof_of_time"})," output for the claimed slot and ",(0,o.jsx)(n.code,{children:"future_proof_of_time"})," for a future slot as defined in ",(0,o.jsx)(n.a,{href:"/protocol-specs/docs/consensus/proof_of_time#farming",children:"PoT specification"}),"."]}),"\n"]}),"\n",(0,o.jsx)(n.p,{children:"Consensus log items:"}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"PotSlotIterations"})," number of iterations for proof-of-time evaluation per slot, corresponds to slot that directly follows parent block's slot and can change before slot for which block is produced."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"SolutionRange"})," solution range for this block/era."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"PotParametersChange"})," change of parameters to apply to PoT chain, including at which slot change of parameters takes effect ",(0,o.jsx)(n.code,{children:"slot"}),", new number of slot iterations ",(0,o.jsx)(n.code,{children:"slot_iterations"})," and entropy (",(0,o.jsx)(n.code,{children:"entropy"}),") that should be injected at the ",(0,o.jsx)(n.code,{children:"slot"}),"."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"NextSolutionRange"})," new solution range for next block/era."]}),"\n",(0,o.jsxs)(n.li,{children:["(",(0,o.jsx)(n.code,{children:"SegmentIndex"}),",",(0,o.jsx)(n.code,{children:"SegmentCommitment"}),") index and KZG commitment of the new segments archived right before this block that were not yet included in previous blocks."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"EnableSolutionRangeAdjustmentAndOverride"}),": enable solution range adjustment and override solution range to a given value. Can only be set if solution range adjustment is currently disabled (network early days)."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"RootPlotPublicKeyUpdate"})," whether the root plot public key was updated and its new value."]}),"\n"]}),"\n",(0,o.jsx)(n.p,{children:"Seal: farmer (block proposer) signature"}),"\n",(0,o.jsx)(n.h2,{id:"body",children:"Body"}),"\n",(0,o.jsxs)(n.p,{children:["The body consists of a set of ",(0,o.jsx)(n.code,{children:"Extrinsic"}),", including:"]}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"Normal"}),"(e.g. transfers, domain bundles, staking)"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"Operational"})," (e.g. votes, fraud proofs)"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"Mandatory"})," (e.g. runtime upgrades)"]}),"\n"]}),"\n",(0,o.jsx)(n.p,{children:"such that total size and weight fit within block storage and compute limits. The limits currently are 5 MiB and equivalent of 2 sec compute time, out of which Normal extrinsics can take up to 75%."}),"\n",(0,o.jsx)(n.h2,{id:"justifications",children:"Justifications"}),"\n",(0,o.jsxs)(n.p,{children:["Justifications contain a set of all PoT checkpoints since the parent block up to ",(0,o.jsx)(n.code,{children:"future_proof_of_time"}),". See more in ",(0,o.jsx)(n.a,{href:"/protocol-specs/docs/consensus/proof_of_time#farming",children:"PoT specification"}),"."]}),"\n",(0,o.jsx)(n.h2,{id:"synchronization",children:"Synchronization"}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.em,{children:(0,o.jsx)(n.strong,{children:"Sync from DSN implementation"})})}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsx)(n.p,{children:"Connect node to Kademlia DHT and get 20 peers closest to random key (using disjoint query path) that support the segment-header request response protocol."}),"\n",(0,o.jsx)(n.p,{children:"Fall back to fewer number of nodes on each attempt if not enough nodes found, which might be the case in small dev networks and similar circumstances."}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Ask the peers about their latest ",(0,o.jsx)(n.code,{children:"segment_header"}),"s"]}),"\n",(0,o.jsxs)(n.p,{children:["In case the number of obtained ",(0,o.jsx)(n.code,{children:"segment_header"}),"s doesn\u2019t change twice in a row, we may have gotten a response from all available nodes that support the segment-header request response protocol."]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Find the ",(0,o.jsx)(n.code,{children:"segment_header"})," that largest subset of peers agree on as their newest (mode) from their last 2 segment headers."]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Download the chain of archived ",(0,o.jsx)(n.code,{children:"segment_headers"})," backwards from newest to oldest, checking that every older segment header is part of the next (by hash, as described in ",(0,o.jsx)(n.a,{href:"/protocol-specs/docs/consensus/proof_of_archival_storage#archiving",children:"Archiving"}),")"]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Download full segments in forward direction, verifying each piece against ",(0,o.jsx)(n.code,{children:"segment_commitment"})," in from corresponding ",(0,o.jsx)(n.code,{children:"segment_header"})," along the way:"]}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["Split piece into ",(0,o.jsx)(n.code,{children:"record"}),", ",(0,o.jsx)(n.code,{children:"record_commitment"})," and ",(0,o.jsx)(n.code,{children:"record_witness"})]}),"\n",(0,o.jsxs)(n.li,{children:["Hash the ",(0,o.jsx)(n.code,{children:"record_commitment"})," to obtain the ",(0,o.jsx)(n.code,{children:"record_commitment_hash"})]}),"\n",(0,o.jsxs)(n.li,{children:["Verify the ",(0,o.jsx)(n.code,{children:"record_witness"})," for the ",(0,o.jsx)(n.code,{children:"piece_index"})," , ",(0,o.jsx)(n.code,{children:"record_commitment_hash"})," and ",(0,o.jsx)(n.code,{children:"segment_commitment"})]}),"\n",(0,o.jsx)(n.li,{children:"In case verification fails, the peer that returns an invalid piece must be banned."}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsx)(n.p,{children:"Reconstruct blocks from headers."}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Verify and import blocks into the chain. PoT is verified probabilistically according to ",(0,o.jsx)(n.a,{href:"/protocol-specs/docs/consensus/proof_of_time#major-sync",children:"Major Sync"})]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Blocks that are close to the tip and were not archived yet are handled by ",(0,o.jsx)(n.a,{href:"#substrate-sync",children:"Substrate Sync"})]}),"\n"]}),"\n"]}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.em,{children:(0,o.jsx)(n.strong,{children:"When and how to use sync from DSN"})})}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsx)(n.li,{children:"Sync from DSN should be attempted first thing on node startup, before Substrate node is fully started"}),"\n",(0,o.jsxs)(n.li,{children:["Sync from DSN should be attempted during normal operations when any of the following events (triggers) happen:","\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsx)(n.li,{children:"When node has not imported blocks for a long time (currently 10 minutes)"}),"\n",(0,o.jsx)(n.li,{children:"When Substrate and/or Subspace networking identified that node was offline network-wise and then became online, meaning there could have been some blocks it missed in the meantime"}),"\n"]}),"\n"]}),"\n",(0,o.jsx)(n.li,{children:"Implementation must only run one DSN sync at a time and not try to run multiple concurrently"}),"\n",(0,o.jsx)(n.li,{children:"DSN sync must be able to terminate early if local chain already contains imported blocks that DSN sync was about to download (doesn\u2019t happen often, but possible)"}),"\n",(0,o.jsx)(n.li,{children:"Node blocks that are finalized and pruned must be much higher than archiving point such that block available through DSN sync and regular Substrate sync have significant overall (5 archived segments worth of blocks right now)"}),"\n"]}),"\n",(0,o.jsx)(n.h2,{id:"fast-sync",children:"Fast sync"}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["Obtain segment headers from DSN as described in steps 1 to 4 of ",(0,o.jsx)(n.a,{href:"#synchronization",children:"sync from DSN implementation"})]}),"\n",(0,o.jsxs)(n.li,{children:["Download and reconstruct all blocks from the last segment of archived history","\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsx)(n.li,{children:"Note: In most cases it'll be necessary to download second last segment as well due to the first block being partially included in latest segment"}),"\n"]}),"\n"]}),"\n",(0,o.jsx)(n.li,{children:"Download state that corresponds to the first block received in the previous step using Substrate State Sync"}),"\n",(0,o.jsx)(n.li,{children:"Import the first block of the last segment with its state into the blockchain DB bypassing the blockchain checks of missing parent block, it is important for this to be an atomic operation"}),"\n",(0,o.jsx)(n.li,{children:"Import and execute other remaining blocks from the last segment as they would normally"}),"\n",(0,o.jsxs)(n.li,{children:["Pass the control to ",(0,o.jsx)(n.a,{href:"#synchronization",children:"sync from DSN implementation"}),". It will either download the new archived segment if any or pass the control to ",(0,o.jsx)(n.a,{href:"#substrate-sync",children:"Substrate Sync"}),"."]}),"\n"]}),"\n",(0,o.jsx)(n.h2,{id:"substrate-sync",children:"Substrate Sync"}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.em,{children:"Default sync in Substrate"})}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["Given the connected synced peers (with the ",(0,o.jsx)(n.code,{children:"is_syncing: false"})," status) and their best blocks and find the tip."]}),"\n",(0,o.jsx)(n.li,{children:"Download blocks from the last archived block to tip from the peers in batches in parallel."}),"\n",(0,o.jsx)(n.li,{children:"Import and verify blocks. Ban bad peers."}),"\n",(0,o.jsx)(n.li,{children:"When you are close to tip (~18 blocks) switch to keep-up sync"}),"\n",(0,o.jsx)(n.li,{children:"When get to tip start participate in consensus"}),"\n"]}),"\n",(0,o.jsx)(n.h2,{id:"block-reward-address",children:"Block Reward Address"}),"\n",(0,o.jsxs)(n.p,{children:["In a basic blockchain farming setup, a farmer\u2019s identity would be used for plot creation, block signing, and receiving block rewards, posing risks like plot invalidation on testnet when used across multiple nodes and incompatibility with cold wallets. To address these,  the farmer's identity is decoupled from the reward address by introducing a ",(0,o.jsx)(n.code,{children:"--reward-address"})," argument in the farmer app, allowing the specification of a separate address for block rewards. This additional ",(0,o.jsx)(n.code,{children:"reward_address"})," block header field, enhances security, supports multi-replica farming, and aligns farming operations with practices in PoW mining where reward addresses are independent of operational identities."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-rust",children:"pub struct Solution<PublicKey, RewardAddress> {\n    /// Public key of the farmer that created the solution\n    pub public_key: PublicKey,\n    /// Address for receiving block reward\n    pub reward_address: RewardAddress,\n    /// Index of the sector where solution was found\n    pub sector_index: SectorIndex,\n    /// Size of the blockchain history at time of sector creation\n    pub history_size: HistorySize,\n    /// Pieces offset within sector\n    pub piece_offset: PieceOffset,\n    /// Record commitment that can use used to verify that piece was included in blockchain history\n    pub record_commitment: RecordCommitment,\n    /// Witness for above record commitment\n    pub record_witness: RecordWitness,\n    /// Chunk at above offset\n    pub chunk: Scalar,\n    /// Witness for above chunk\n    pub chunk_witness: ChunkWitness,\n    /// Proof of space for piece offset\n    pub proof_of_space: PosProof,\n}\n"})})]})}function h(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>c});var i=s(6540);const o={},t=i.createContext(o);function r(e){const n=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);