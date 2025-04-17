"use strict";(self.webpackChunkportal=self.webpackChunkportal||[]).push([[13],{8453:(e,n,o)=>{o.d(n,{R:()=>r,x:()=>c});var i=o(6540);const t={},s=i.createContext(t);function r(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),i.createElement(s.Provider,{value:n},e.children)}},9308:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>h,frontMatter:()=>r,metadata:()=>i,toc:()=>l});const i=JSON.parse('{"id":"decex/overview","title":"Domains Overview","description":"General workflow of the domain operation.","source":"@site/docs/decex/overview.md","sourceDirName":"decex","slug":"/decex/overview","permalink":"/protocol-specs/docs/decex/overview","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"title":"Domains Overview","sidebar_position":1,"description":"General workflow of the domain operation.","keywords":["execution","decex"],"last_update":{"date":"01/09/2025","author":"Saeid Yazdinejad"}},"sidebar":"tutorialSidebar","previous":{"title":"Decoupled Execution","permalink":"/protocol-specs/docs/category/decoupled-execution"},"next":{"title":"Domains Interfaces","permalink":"/protocol-specs/docs/decex/interfaces"}}');var t=o(4848),s=o(8453);const r={title:"Domains Overview",sidebar_position:1,description:"General workflow of the domain operation.",keywords:["execution","decex"],last_update:{date:"01/09/2025",author:"Saeid Yazdinejad"}},c=void 0,d={},l=[{value:"Terminology",id:"terminology",level:2},{value:"High-Level Workflow",id:"high-level-workflow",level:2}];function a(e){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h2,{id:"terminology",children:"Terminology"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Domain"}),": an enshrined rollup that performs settlement or execution for the consensus chain. Each domain uses a standard set of permissioned runtimes but may have a user-defined configuration."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Domain Operator"}),": an account, that by staking SSC and running a operator software, operates a domain node and takes the responsibility of producing new bundles when elected, validating transactions, and executing transactions within a specific domain. Operators also watch for fraud and challenge other potentially fraudulent operators."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Domain Subnet"}),": a separate P2P gossip network for each domain"]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Domain Bundle:"})," a collection of transactions for a domain that are ready for execution"]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Execution Receipt (ER):"})," a commitment to the execution of a domain block, included in the bundle"]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Domain Block"}),": a derived block that consists of transactions from one or more bundles, deterministically ordered"]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Fraud Proof:"})," proof that shows that a commitment to some block with an execution receipt is invalid"]}),"\n",(0,t.jsx)(n.h2,{id:"high-level-workflow",children:"High-Level Workflow"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Bootstrap Consensus Chain"})}),"\n",(0,t.jsx)(n.p,{children:"Given a genesis block and at least one genesis farmer, we will have block production on the consensus chain. On its own, the consensus chain will only issue rewards to farmers and allow for balance transfers of SSC."}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Domain Creation"})}),"\n",(0,t.jsxs)(n.p,{children:["The sudo user will register the first domain runtime by calling the ",(0,t.jsx)(n.code,{children:"register_domain_runtime"})," extrinsic, uploading its WASM runtime directly into the chain state. The sudo user will then instantiate the first domain by calling the ",(0,t.jsx)(n.code,{children:"instantiate_domain"})," extrinsic on the previously registered domain runtime. This will include a genesis config, from which we may derive a chainspec and a genesis block."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#domain-instantiation--upgrades",children:"Domain Instantiation & Upgrades"})]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Operator Staking"})}),"\n",(0,t.jsxs)(n.p,{children:["Anyone may now deposit SSC and stake as an operator of this domain, allowing them to participate in the VRF election to produce bundles and executed domain blocks. They do this by submitting the ",(0,t.jsx)(n.code,{children:"register_operator"})," extrinsic targeting the first domain instance along with the minimum required staking deposit. On the next stake epoch, they will be eligible to participate in the VRF election."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/staking",children:"Staking Protocol"})]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Domain Transactions"})}),"\n",(0,t.jsx)(n.p,{children:"Users of the first domain may now produce extrinsics (transactions) and submit them to operators on the domain\u2019s subnet. When pre-validating extrinsics, operators only check to ensure the extrinsic is well-formed and that the user can afford the blockspace storage fee. They do not attempt to execute the transaction to determine if the execution weight can be paid."}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"VRF Election"})}),"\n",(0,t.jsxs)(n.p,{children:["For each time slot, the registered operator will attempt to solve the VRF puzzle with the success probability determined by the ",(0,t.jsx)(n.code,{children:"bundle_slot_probability"})," defined in the genesis ",(0,t.jsx)(n.code,{children:"domain_config"}),". To do so, they sign the slot challenge and check if it is below the desired threshold. When elected, they will produce a new domain bundle."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#bundle-producer-election",children:"Bundle Producer Election"})]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Bundle Production"})}),"\n",(0,t.jsxs)(n.p,{children:["To produce a new bundle, the operator will include a ",(0,t.jsx)(n.code,{children:"ProofOfElection"})," for the VRF election, an ",(0,t.jsx)(n.code,{children:"ExecutionReceipt"})," that either extends or confirms the last domain block tracked on the consensus chain and all ",(0,t.jsx)(n.code,{children:"extrinsics"})," that fall within the operator's sector of the extrinsic sortition ring. The bundle is then broadcast on the consensus chain gossip network via ",(0,t.jsx)(n.code,{children:"submit_bundle"})," extrinsic."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see  ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#domain-bundle-production",children:"Domain Bundle Production"})]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Bundle Verification"})}),"\n",(0,t.jsxs)(n.p,{children:["All consensus nodes receiving the bundle will only verify that it is well-formed and includes a valid ",(0,t.jsx)(n.code,{children:"ProofOfElection"})," based on the stake distribution for this epoch before broadcasting to their peers and placing the bundle within their local extrinsic pool."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#initial-domain-bundle-verification-by-consensus-nodes",children:"Initial Domain Bundle Verification by Consensus Nodes"})]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Consensus Block Production"})}),"\n",(0,t.jsxs)(n.p,{children:["When a consensus node is elected to produce a new block, it will include as many valid domain bundles as will fit into the block and broadcast on the consensus network. Other nodes will only accept blocks that include valid bundles. On block execution, each bundle header will be applied to the consensus chain state by calling ",(0,t.jsx)(n.code,{children:"submit_bundle"}),". The ",(0,t.jsx)(n.code,{children:"ExecutionReceipt"})," will extend or confirm an entry within the domain\u2019s ",(0,t.jsx)(n.code,{children:"BlockTree"}),", while the ",(0,t.jsx)(n.code,{children:"bundle_extrinsics"})," will be added to the domain\u2019s ",(0,t.jsx)(n.code,{children:"execution_inbox"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#bundle-header-application",children:"Bundle Header Application "})]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Domain Block Execution"})}),"\n",(0,t.jsxs)(n.p,{children:["Given a valid consensus block with at least one domain bundle, the domain operator (or any full domain node) may build and execute the resulting domain block. Extrinsics will be deduplicated, grouped by sender ID, and shuffled using the consensus block PoAS as the seed. This mitigates the ability for operators to extract value from users by re-ordering or inserting their own extrinsics. The domain block with then be carefully executed, one extrinsic at a time, allowing the operator to produce an ",(0,t.jsx)(n.code,{children:"ExecutionReceipt"}),", which is cached until they produce the next bundle."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#domain-block-production",children:"Domain Block Production"})," and ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#domain-block-execution-on-the-operator-node",children:"Domain Block Execution on the Operator Node"})]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Challenging Operators"})}),"\n",(0,t.jsxs)(n.p,{children:["Any node who observes an ",(0,t.jsx)(n.code,{children:"ExecutionReceipt"})," within any bundle for any consensus chain block that differs from what they produced locally has detected fraud. To handle the fraud they will produce a ",(0,t.jsx)(n.code,{children:"submit_fraud_proof"})," extrinsic, which includes a proof. If the proof is valid, it will be included in the consensus chain, which will prune the ",(0,t.jsx)(n.code,{children:"ExecutionReceipt"})," (and all children) from the ",(0,t.jsx)(n.code,{children:"BlockTree"})," and slash all related operators."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/staking#slashing-stake",children:"Slashing Stake"})," and ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/fraud_proofs",children:"Fraud Proofs"}),"."]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.strong,{children:"Submit Missing Receipt"})}),"\n",(0,t.jsxs)(n.p,{children:["After a fraud proof is accepted, the targetted bad receipt and all its descendant receipts will be pruned, this will create a gap between the latest domain block (i.e. ",(0,t.jsx)(n.code,{children:"HeadDomainNumber"}),") and the latest receipt on chain (i.e. ",(0,t.jsx)(n.code,{children:"HeadReceiptNumber"}),"), when this happen the operator will start producing the ",(0,t.jsx)(n.code,{children:"submit_receipt"})," extrinsic to fill up this gap, and after ",(0,t.jsx)(n.code,{children:"HeadDomainNumber - HeadReceiptNumber = 1"})," the operator will resume producing ",(0,t.jsx)(n.code,{children:"submit_bundle"})," extrinsic."]}),"\n",(0,t.jsxs)(n.p,{children:["For more details, see ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/interfaces#submit_receipt",children:(0,t.jsx)(n.code,{children:"submit_receipt"})})," and ",(0,t.jsx)(n.a,{href:"/protocol-specs/docs/decex/workflow#lagging-operator-protection",children:"Lagging operator protection"}),"."]}),"\n"]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(a,{...e})}):a(e)}}}]);