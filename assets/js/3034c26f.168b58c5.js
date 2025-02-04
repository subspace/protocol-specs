"use strict";(self.webpackChunkportal=self.webpackChunkportal||[]).push([[768],{4804:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>o,default:()=>u,frontMatter:()=>c,metadata:()=>r,toc:()=>l});var t=s(7624),i=s(2172);const c={title:"Runtime",hide_title:!1,sidebar_position:5,description:"Subspace runtime configuration",keywords:["runtime"],last_update:{date:"01/28/2025",author:"Teor"}},o=void 0,r={id:"runtime",title:"Runtime",description:"Subspace runtime configuration",source:"@site/docs/runtime.md",sourceDirName:".",slug:"/runtime",permalink:"/protocol-specs/docs/runtime",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:5,frontMatter:{title:"Runtime",hide_title:!1,sidebar_position:5,description:"Subspace runtime configuration",keywords:["runtime"],last_update:{date:"01/28/2025",author:"Teor"}},sidebar:"tutorialSidebar",previous:{title:"Dynamic Issuance",permalink:"/protocol-specs/docs/fees_and_rewards/Dynamic_Issuance"},next:{title:"Glossary",permalink:"/protocol-specs/docs/glossary"}},a={},l=[];function d(e){const n={code:"code",li:"li",p:"p",ul:"ul",...(0,i.M)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:"A runtime in Subspace refers to the runtime logic that defines the state transition function of the chain."}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:"The runtime contains all the pallets (modules) that make up the logic of the blockchain. This includes consensus mechanisms, accounts, balances, governance, etc."}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:"The runtime defines the types, storage, and functions that the nodes will execute as they process blocks and extrinsics."}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:["\n",(0,t.jsx)(n.p,{children:"The runtime is upgradeable, allowing to add/remove/modify pallets and logic while preserving blockchain state."}),"\n"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Runtimes are compiled to Wasm to be executed efficiently and securely in a sandboxed environment."}),"\n",(0,t.jsxs)(n.p,{children:["The ",(0,t.jsx)(n.code,{children:"Runtime"})," struct defines the runtime configuration and pallets for the Subspace blockchain. It contains in this order:"]}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"System"}),": The FRAME system pallet that provides core low level functionality and types for accounts, blocks, miscellaneous runtime APIs like depositing logs, allows managing runtime constants and parameters, etc."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Timestamp"}),": A pallet that provides timestamp functionality for blocks, extrinsics and events."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Subspace"}),": A custom pallet for Subspace consensus that provides the core logic needed to coordinate farmers."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"OffencesSubspace"}),": A custom pallet for managing offences for the Subspace consensus layer. Some key offences it handles include block and vote equivocation and other offences related to consensus participation. The pallet has logic and storage to detect these offences, record them, and determine appropriate penalties."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Rewards"}),": A custom pallet for managing farmer rewards for blocks and votes."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Balances"}),": A pallet that manages account balances."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"TransactionFees"}),": A custom pallet for transaction fees."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"TransactionPayment"}),": A pallet that provides fee calculation and payment."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Utility"}),": A pallet for useful runtime functions."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Domains"}),": The custom pallet for implementing logic and storage interactions for domain-related actions like registering domains, depositing funds, withdrawing, etc. This includes reading and writing from storage, emitting events, returning errors, basic logic and validation, and calling into other pallets."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"RuntimeConfigs"}),": A custom pallet for runtime configurations."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Vesting"}),": A pallet for locked vesting of token grants."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Mmr"}),": A pallet for MMR proofs."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"SubspaceMmr"}),": A custom pallet for Subspace MMR proofs."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Messenger"}),": A custom pallet for cross-chain messages, including between consensus and domains and intra-domain."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Transporter"}),": A custom pallet to transfer funds between consensus chain and domains."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Sudo"}),": A pallet that allows superuser access."]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"EVM runtimes can also contain these pallets:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"Ethereum"}),": Ethereum-compatible transactions."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"EVM"}),": An EVM hosted on Substrate, using a Substrate-specific transaction format."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"EVMChainId"}),": Storage for the Ethereum chain ID."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"BaseFee"}),": Ethereum-specific fee changes."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"EVMNoncetracker"}),": A custom pallet used to track EVM nonces, and the EVM contract creation allow list. The crate is called ",(0,t.jsx)(n.code,{children:"pallet-evm-tracker"}),", but existing runtimes keep the ",(0,t.jsx)(n.code,{children:"EVMNoncetracker"})," name to preserve their storage."]}),"\n"]})]})}function u(e={}){const{wrapper:n}={...(0,i.M)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},2172:(e,n,s)=>{s.d(n,{I:()=>r,M:()=>o});var t=s(1504);const i={},c=t.createContext(i);function o(e){const n=t.useContext(c);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),t.createElement(c.Provider,{value:n},e.children)}}}]);