"use strict";(self.webpackChunkportal=self.webpackChunkportal||[]).push([[0],{7856:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>a,toc:()=>l});var s=i(7624),t=i(2172);const r={title:"Glossary",sidebar_position:6,description:"Collection of terms and definitions used within the network.",keywords:["glossary","terminology"],last_update:{date:"04/10/2024",author:"Saeid Yazdinejad"}},o=void 0,a={id:"glossary",title:"Glossary",description:"Collection of terms and definitions used within the network.",source:"@site/docs/glossary.md",sourceDirName:".",slug:"/glossary",permalink:"/protocol-specs/docs/glossary",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:6,frontMatter:{title:"Glossary",sidebar_position:6,description:"Collection of terms and definitions used within the network.",keywords:["glossary","terminology"],last_update:{date:"04/10/2024",author:"Saeid Yazdinejad"}},sidebar:"tutorialSidebar",previous:{title:"Runtime",permalink:"/protocol-specs/docs/runtime"}},c={},l=[{value:"Archival Node",id:"archival-node",level:2},{value:"Archived History",id:"archived-history",level:2},{value:"Archiver",id:"archiver",level:2},{value:"Archiving",id:"archiving",level:2},{value:"Blockchain History",id:"blockchain-history",level:2},{value:"Blockchain State",id:"blockchain-state",level:2},{value:"Timekeeper",id:"timekeeper",level:2},{value:"Consensus Chain",id:"consensus-chain",level:2},{value:"Commitment",id:"commitment",level:2},{value:"DSN",id:"dsn",level:2},{value:"DAS",id:"das",level:2},{value:"Dilithium",id:"dilithium",level:2},{value:"Domain Operator",id:"domain-operator",level:2},{value:"Domain",id:"domain",level:2},{value:"Execution Chain",id:"execution-chain",level:2},{value:"Full Node",id:"full-node",level:2},{value:"Farmer",id:"farmer",level:2},{value:"Farming",id:"farming",level:2},{value:"Farmers",id:"farmers",level:2},{value:"Global History",id:"global-history",level:2},{value:"Node",id:"node",level:2},{value:"Plotting",id:"plotting",level:2},{value:"Piece",id:"piece",level:2},{value:"Plot",id:"plot",level:2},{value:"Raw Record",id:"raw-record",level:2},{value:"Record",id:"record",level:2},{value:"Reconstructor",id:"reconstructor",level:2},{value:"Reconstruction",id:"reconstruction",level:2},{value:"Subspace",id:"subspace",level:2},{value:"Subspace Blockchain",id:"subspace-blockchain",level:2},{value:"Subspace Network",id:"subspace-network",level:2},{value:"Segment",id:"segment",level:2},{value:"Segment Header",id:"segment-header",level:2},{value:"Sector",id:"sector",level:2},{value:"Sharding",id:"sharding",level:2},{value:"Shard",id:"shard",level:2}];function d(e){const n={code:"code",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,t.M)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h2,{id:"archival-node",children:"Archival Node"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"An Archival Node, similar to a Full Node, engages in processing all blocks and running all state transitions. Unlike a Full Node, which retains history and state for a configurable number of recent blocks, an Archival Node preserves the entire history and state of the blockchain since the genesis block, making it a comprehensive data repository."}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"archived-history",children:"Archived History"}),"\n",(0,s.jsx)(n.p,{children:"It refers to the blockchain's historical data that has been specifically processed for preservation. This includes:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Transformation"}),": The blockchain history undergoes a transformation process, converting blocks into a format suitable for long-term storage and access."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Depth-Based Confirmation"}),": This history consists of blocks that have reached a certain depth from the chain's tip, ensuring a consistent approach to archiving data."]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:'It also known as "archival history".'}),"\n",(0,s.jsx)(n.h2,{id:"archiver",children:"Archiver"}),"\n",(0,s.jsx)(n.p,{children:"It is an implementation of the Archiving process within the node."}),"\n",(0,s.jsx)(n.h2,{id:"archiving",children:"Archiving"}),"\n",(0,s.jsx)(n.p,{children:"It is the transformation of Blockchain History into Archived History. It is defined by several steps:"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Transformation Depth"}),": It involves processing blocks at a certain depth from the chain's tip."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Encoding and Buffering"}),": Blocks are SCALE-encoded and stored in a buffer."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Slicing into Records"}),": The buffered data is sliced into records."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Erasure Coding"}),": These records are then erasure-coded to ensure redundancy and fault tolerance."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Commitment and Witness Creation"}),": First, a KZG commitment is computed for each source and parity record, then to the set of all records (Segment) and a witness to the segment commitment derived for each record."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Piece Formation"}),": The combination of a record, its commitment, and witness forms a piece of Archived History, ready for Plotting and Farming by Farmers."]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["An ",(0,s.jsx)(n.strong,{children:"Archiver"})," implements the functionalities necessary for this process."]}),"\n",(0,s.jsx)(n.h2,{id:"blockchain-history",children:"Blockchain History"}),"\n",(0,s.jsx)(n.p,{children:"It refers to the entirety of blocks that constitute the blockchain. Specifically, it involves:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Collection of Blocks"}),": At its core, it represents the accumulated sequence of blockchain blocks over time."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Encoding"}),": In the Subspace context, blockchain history usually means SCALE (Simple Concatenated Aggregate Little-Endian)-encoded blocks."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"blockchain-state",children:"Blockchain State"}),"\n",(0,s.jsx)(n.p,{children:"It refers to the current status and data of a blockchain, resulting from the execution of transactions. This encompasses:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Transaction Outcomes"}),": The state reflects changes from transactions, such as account balances, smart contract states, and other relevant data."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"timekeeper",children:"Timekeeper"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"A role on the Subspace Network that is responsible for running Proof-of-Time chain and maintaining the randomness beacon for the consensus chain."}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"consensus-chain",children:"Consensus Chain"}),"\n",(0,s.jsx)(n.p,{children:"It is a blockchain with consensus logic in the Subspace Network, designed for farmer consensus. Some key characteristics are:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Lightweight"}),": Minimized storage requirements to alleviate farmers' storage burdens."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Computational Simplicity"}),": Stripped of heavy computation to lower the processing load for farmers."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Fast Synchronization"}),": Engineered for quick updates to maintain farmer accessibility and network integrity."]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:'Previously referred to as the "primary chain" or in the context of code inherited from Substrate, the "relay chain".'}),"\n",(0,s.jsx)(n.h2,{id:"commitment",children:"Commitment"}),"\n",(0,s.jsx)(n.p,{children:"It refers to cryptographic assurances related to data integrity, encompassing:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Record Commitment"}),": This is a KZG commitment to the blockchain data in a Raw Record."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Segment Commitment"}),": A KZG commitment that encapsulates the hashes of all Record Commitments within an Archived History Segment, providing a verifiable snapshot of the segment's integrity."]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:'Previously known as "records root".'}),"\n",(0,s.jsx)(n.h2,{id:"dsn",children:"DSN"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Short for Distributed Storage Network"}),"\n",(0,s.jsx)(n.li,{children:"Specifically in Subspace, means a network of Farmer nodes that have plotted pieces of Archival History and serve them to Clients"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"das",children:"DAS"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Short for Data Availability Sampling"}),"\n",(0,s.jsx)(n.li,{children:"A method where nodes can confirm the availability of data for a block without needing to download the whole block"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"dilithium",children:"Dilithium"}),"\n",(0,s.jsx)(n.p,{children:"Dilithium is the core consensus mechanism of the Subspace Network, built on the Proof-of-Archival-Storage principle. It ensures the network's data integrity and availability through a series of processes:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.strong,{children:"Archiving"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.strong,{children:"Plotting"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.strong,{children:"Audit"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.strong,{children:"Proving and Verification"})}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Dilithium incorporates ",(0,s.jsx)(n.strong,{children:"Proof-of-Space"})," and ",(0,s.jsx)(n.strong,{children:"Proof-of-Time"}),"."]}),"\n",(0,s.jsx)(n.p,{children:'Previously referred to as "consensus v2" or "consensus v2.3," Dilithium reflects the network\'s evolving consensus strategy.'}),"\n",(0,s.jsx)(n.h2,{id:"domain-operator",children:"Domain Operator"}),"\n",(0,s.jsx)(n.p,{children:"The Domain Operator in the Subspace Network serves a dual purpose:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Network Role"}),": Tasked with executing arbitrary computations on Domains, managing state transitions, and ensuring the ongoing operation (liveness) of the Execution Chain."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Software Utility"}),": Operates as the mechanism that executes the state transition logic for the Execution Chain, functioning as an optional component of the Full Node implementation."]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:'Previously known in some contexts as the "executor"'}),"\n",(0,s.jsx)(n.h2,{id:"domain",children:"Domain"}),"\n",(0,s.jsx)(n.p,{children:"It is an application-specific blockchain, akin to layer two networks on Ethereum or parachains on Polkadot, ones on Cosmos, subnets on Avalanche, and sovereign rollups on Celestia, with unique features:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Gossip Network"}),": Each Domain operates its own gossip network, known as a domain subnet."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Configurable Runtime"}),": Domains feature a customizable runtime with settings maintained on x-net."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Domain Operation"}),": Staked executors become Domain Operators, managing domain execution, collecting compute fees from users, and ensuring the integrity of state commitments."]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Domains are anchored to and validated by the Subspace Network for enhanced security and interoperability."}),"\n",(0,s.jsx)(n.h2,{id:"execution-chain",children:"Execution Chain"}),"\n",(0,s.jsx)(n.p,{children:"The Execution Chain in the Subspace Network is a computation-focused blockchain that operates without its own consensus mechanism. It is designed for:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"State Transition Execution"}),": Operators run state transitions on transaction bundles."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Deterministic Order"}),": Follows the Consensus Chain's consensus to execute transactions in a predetermined order."]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Network Implementation"}),": Though functioning like a complete blockchain, it is viewed as a crucial part of the network's infrastructure."]}),"\n",(0,s.jsx)(n.p,{children:'Formerly known as "secondary chain" or referred to as "cirrus," "parachain," and "cumulus" in contexts involving Cumulus-derived codebases.'}),"\n",(0,s.jsx)(n.h2,{id:"full-node",children:"Full Node"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Engages in processing all blocks and running all state transitions, while retaining history and state for a configurable number of recent blocks."}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"farmer",children:"Farmer"}),"\n",(0,s.jsx)(n.p,{children:'In the Subspace Network, the term "Farmer" embodies both a pivotal role and a specialized software, playing a dual function in the ecosystem:'}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Consensus Maintenance"}),": As a crucial role within the Subspace Network, a Farmer ensures the security and integrity of the Consensus Chain. This responsibility involves participating in the network's consensus mechanism to maintain a stable and secure blockchain environment."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Subspace Farmer Crate"}),": The essence of farming within Subspace is captured in the ",(0,s.jsx)(n.code,{children:"subspace-farmer"})," crate. This component is integral for:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Archival History Storage"}),": It archives segments of the network's history onto disk, preserving a record of transactions and interactions."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Block Reward Farming"}),": By utilizing the stored archival history, it engages in the process of farming, aiming to earn block rewards through participation in the network's consensus mechanism."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Distributed Storage Network (DSN) Participation"}),": As a node within the DSN, it aids in data retrieval, facilitating the synchronization of new nodes, supporting other farmers, and managing data requests from various clients."]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Versatility in Usage"}),": The ",(0,s.jsx)(n.code,{children:"subspace-farmer"})," crate is designed for flexibility, allowing for integration as a library in applications like Subspace Desktop or operation as a standalone command-line interface (CLI) application, binary, or executable."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:'Previously, the functionalities now encompassed by the Farmer role were referred to by various terms, including "client" and "node".'}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"farming",children:"Farming"}),"\n",(0,s.jsxs)(n.p,{children:["Farming involves participating in consensus through solving a puzzle based on the previously created plot, managed by ",(0,s.jsx)(n.code,{children:"subspace-farmer"}),". It includes:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Slot Notifications"}),": Listening for slot notifications from a Full Node."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Challenge Derivation"}),": Generating a local challenge."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Solution Search"}),": Finding a plot chunk that matches the solution range derived from the local challenge."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Solution Creation"}),": Responding to the challenge with a solution."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Block Signing"}),": Sealing and signing the new block as created by the Full Node to claim block rewards."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"farmers",children:"Farmers"}),"\n",(0,s.jsx)(n.p,{children:"It refers to two distinct yet interconnected concepts:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Individual Contributors"}),": Users who operate the combined Full Node + Farmer software package, participating in the Consensus Chain to vie for block rewards."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Collective Operations"}),": The term can also denote a group or fleet of Farmer instances, for example within the context of DSN."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"global-history",children:"Global History"}),"\n",(0,s.jsx)(n.p,{children:"Global History represents the aggregated record of all transactions and events across the entire network, encompassing all individual Subspace domain histories ordered by the consensus chain."}),"\n",(0,s.jsx)(n.h2,{id:"node",children:"Node"}),"\n",(0,s.jsx)(n.p,{children:'Within the Subspace Network, a "Node" represents a key component with distinct functionalities and roles in the peer-to-peer (P2P) network architecture.'}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"P2P Network Participant"}),": Conceptually, a node is a logical entity that participates in the P2P network, contributing to the network's functionality, security, and resilience."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Subspace Node"}),": Primarily, within Subspace, a node is implemented as a Substrate-based ",(0,s.jsx)(n.code,{children:"subspace-node"}),", which:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Network Connectivity"}),": Connects to other nodes within the P2P network, fostering a robust and interconnected network structure."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"History and State Maintenance"}),": Keeps track of the network's history and state, ensuring data integrity and continuity."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Block Production"}),": Participates in block production for consensus, playing a critical role in the network's operation and security."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Execution and RPC Endpoint"}),": Handles all aspects related to execution and can serve as an RPC endpoint for tools like Polkadot.js or for Farmers."]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Operational Modes"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.strong,{children:"Full Node"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.strong,{children:"Archival Node"})}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Versatility in Usage"}),": Like the Farmer, the Subspace Node can be integrated as a library in applications such as Subspace Desktop or function as a standalone CLI application, binary, or executable."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:'Within the context of the DSN, the term "Farmer" is also used to describe a specific type of node, highlighting the diverse roles within the Subspace ecosystem.'}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:'Historically, various terms including "client" and "farmer" have been used to describe entities that technically fall under the node definition.'}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"plotting",children:"Plotting"}),"\n",(0,s.jsxs)(n.p,{children:["It refers to the process of generating and updating plots on disk, crucial for the network's farming activities. This process is facilitated by the ",(0,s.jsx)(n.code,{children:"subspace-farmer"})," crate and encompasses:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Initial Plot Creation"}),": Setting up the initial plots necessary for farming."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Ongoing Maintenance"}),": Regularly updating and replotting to accommodate the expanding blockchain history, ensuring plots remain current and effective."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"piece",children:"Piece"}),"\n",(0,s.jsx)(n.p,{children:"It is a unit of measurement for Archived History, representing the elemental building block from which Archived History Segments are constructed. Each Piece comprises three key components:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Record"}),"\n",(0,s.jsx)(n.li,{children:"Commitment"}),"\n",(0,s.jsx)(n.li,{children:"Witness"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"plot",children:"Plot"}),"\n",(0,s.jsx)(n.p,{children:"A Plot refers to:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Farming Foundation"}),": A collection of Sectors."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Physical Representation"}),": A Plot is a contiguous binary file written to disk."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"raw-record",children:"Raw Record"}),"\n",(0,s.jsx)(n.p,{children:'It represents a piece of the Blockchain History, serving as the foundational "useful data" for the Proof of Archival Storage (PoAS) in the Subspace Network.'}),"\n",(0,s.jsx)(n.h2,{id:"record",children:"Record"}),"\n",(0,s.jsx)(n.p,{children:"It refers to a Raw Record that has undergone transformation for the purpose of Archiving. This transformation process includes the insertion of a 0 byte after every 31 bytes of the original Raw Record."}),"\n",(0,s.jsx)(n.p,{children:"This modification is necessary because the KZG commitment scheme operates on values up to 254 bits."}),"\n",(0,s.jsx)(n.h2,{id:"reconstructor",children:"Reconstructor"}),"\n",(0,s.jsx)(n.p,{children:"It is a program that implements the Reconstructing process, designed to revert Archived History back into its original or a usable form."}),"\n",(0,s.jsx)(n.h2,{id:"reconstruction",children:"Reconstruction"}),"\n",(0,s.jsx)(n.p,{children:"Reconstruction is the process of converting Archived History back into Blockchain History. It entails:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Segment-by-Segment Processing"}),": The transformation of pieces of Archived History, tackling one Archived History Segment at a time, back into blockchain blocks."]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"This allows for the initialization of new Full Nodes from genesis."}),"\n",(0,s.jsxs)(n.p,{children:["Implemented by a ",(0,s.jsx)(n.strong,{children:"Reconstructor"}),"."]}),"\n",(0,s.jsx)(n.p,{children:'Also known as "Extraction".'}),"\n",(0,s.jsx)(n.h2,{id:"subspace",children:"Subspace"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"An overarching term that typically encapsulates everything about the project and is not limited in scope just to the blockchain or any other component specifically"}),"\n",(0,s.jsx)(n.li,{children:"Often can be clarified to something more specific but is used interchangeably for simplicity"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"subspace-blockchain",children:"Subspace Blockchain"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"An overarching term that typically means Full Node that maintains both Consensus Chain and Execution Chain"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"subspace-network",children:"Subspace Network"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"An overarching term that typically means a combination of Subspace Blockchains (all Shards) and DSN"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"segment",children:"Segment"}),"\n",(0,s.jsx)(n.p,{children:"A Segment refers to a structured collection of blockchain blocks, serving two specific purposes:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Recorded History Segment"}),": This is a fixed-size chunk of the Blockchain History stored temporarily in a buffer before undergoing the Archiving process. It is composed of what are termed Raw Records."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Archived History Segment"}),": After the Archiving process, a Recorded History Segment becomes an Archived History Segment, retaining a fixed size. This transformation involves encoding the Raw Records into Pieces, making up the Archived History Segment."]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Archived History Segments can be converted back into Recorded History Segments through a Reconstructing process."}),"\n",(0,s.jsx)(n.p,{children:'Also known as "archived segment".'}),"\n",(0,s.jsx)(n.h2,{id:"segment-header",children:"Segment Header"}),"\n",(0,s.jsx)(n.p,{children:"A compact header in an Archived History Segment containing:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"The segment index"}),"\n",(0,s.jsx)(n.li,{children:"Segment commitment"}),"\n",(0,s.jsx)(n.li,{children:"A pointer to the previous segment header"}),"\n",(0,s.jsx)(n.li,{children:"Information about the progress of block archiving"}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"It previously known as root block, root block header"}),"\n",(0,s.jsx)(n.h2,{id:"sector",children:"Sector"}),"\n",(0,s.jsx)(n.p,{children:"It is a collection of encoded Pieces that are utilized in the Farming process. Each Sector encompasses:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Encoded Record Data from Pieces"}),"\n",(0,s.jsx)(n.li,{children:"Piece Commitments and Witnesses"}),"\n",(0,s.jsx)(n.li,{children:"Metadata: Additional information regarding the stored Pieces."}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"sharding",children:"Sharding"}),"\n",(0,s.jsx)(n.p,{children:"Sharding represents both an architectural strategy and a scalability technique, characterized by:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"General Concept"}),": The division and distribution of data across multiple related blockchains, integrated to function as a unified system."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Subspace Implementation"}),": In the Subspace Network, sharding manifests as a collective of Subspace Blockchain Nodes. These nodes may possess distinc Archived Histories but collaborate to compile a Global History that is used Plotting and Farming."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"shard",children:"Shard"}),"\n",(0,s.jsx)(n.p,{children:"In the Subspace Network, a Shard refers to:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Individual Blockchain Instance"}),": Each Shard is a separate instance of the Subspace Blockchain, possessing its own distinct Archived History which contributes to the overall Global History."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Scalability Contribution"}),": Distributing transactions, execution processes, and the corresponding state across multiple Shards."]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,t.M)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},2172:(e,n,i)=>{i.d(n,{I:()=>a,M:()=>o});var s=i(1504);const t={},r=s.createContext(t);function o(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:o(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);