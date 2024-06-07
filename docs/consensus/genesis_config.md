---
title: Genesis Block
sidebar_position: 1
description: Genesis Configuration 
keywords:
    - genesis
    - initial configuration
last_update:
  date: 06/07/2024
  author: Saeid Yazdinejad
---


<!-- ## Genesis Configuration -->

This section details the genesis configuration process for the Subspace network, establishing the foundational state of the blockchain with critical operational and network-specific parameters.

## Network Setup

### WASM Setup

Incorporates the compiled runtime logic into the genesis block, defining all operational rules and behaviors of the network.

```rust
let wasm_binary = WASM_BINARY.ok_or_else(|| "Wasm binary must be built for Gemini".to_string())?;
```

### Chain Type
Specifies the type of network, highlighting its use in a development or mainnet environment.


<!-- ## Subspace Genesis Config -->

<!-- ### sudo_account
Specifies the account with administrative privileges, enabling essential governance functionalities.

```rust
let sudo_account = get_account_id_from_seed("Alice");
``` -->



## Genesis Params

### initial_balance

Sets up initial token distributions to facilitate early operations and ensure liquidity from the start.

### enable_rewards_at
Controls the activation of network rewards, set manually in this configuration.

```rust
enable_rewards_at: EnableRewardsAt::Manually,
```

### allow_authoring_by

Allows any eligible participant to produce blocks, promoting a decentralized and inclusive network environment.

```rust
allow_authoring_by: AllowAuthoringBy::Anyone,
```

### pot_slot_iterations

This parameter sets the number of iterations for the Proof-of-Time (PoT) function required per time slot. It balances the computational difficulty with accessibility, ensuring that the proof workload remains feasible yet secure against rapid advances in hardware capabilities.

```rust
pot_slot_iterations: NonZeroU32::new(100_000_000).expect("Not zero; qed"),
```

### enable_domains

Activates domain-specific features within the network.


```rust
enable_domains: true,
```

### enable_dynamic_cost_of_storage

Keeps the cost of storage static by setting this parameter to false.

```rust
enable_dynamic_cost_of_storage: false,
```

### enable_balance_transfers and enable_non_root_calls

Enables balance transfers between accounts and allows non-administrative actions within the network.

```rust
enable_balance_transfers: true,
enable_non_root_calls: true,
```

### confirmation_depth_k

Defines the number of subsequent blocks required to consider a transaction or block finalized.


### rewards_config

Details how network rewards are structured to incentivize participation and maintain network security.

```rust
rewards_config: RewardsConfig {
    remaining_issuance:
    proposer_subsidy_points:,
    voter_subsidy_points:,
},
```


## Genesis Domain Params

Describes configurations specific to domains within the network, including runtime parameters and permissions.

### genesis_domains
Configures specific domains with tailored runtime settings, permissions, and operational rules.

```rust
struct GenesisDomainParams {
    permissioned_action_allowed_by: PermissionedActionAllowedBy<AccountId>,
    genesis_domains: Vec<GenesisDomain>,
}
```




