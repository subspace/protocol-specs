---
title: Offline operator detection
sidebar_position: 9
description: Detecting offline operators
keywords:
  - operators
  - decex
last_update:
  date: 10/14/2025
  author: Vedhavyas Singareddi
---

Single-epoch enforcement against slots. Uses the domain's bundle-slot probability and a Chernoff lower-tail bound.
Enforces “throughput relevance” so we only check operators whose expected contribution this epoch is large enough to
matter.

## Goals

- Maintain continuous throughput by enforcing that throughput-relevant operators produce enough bundles relative to
  their stake in the epoch.
- Keep runtime cost low: O(1) math per operator at epoch end
- Ignore small-stake/low-expectation operators(they remain eligible to produce) but do not cause throughput halt

## Definitions

- Epoch (domain): Ends when N domain blocks have finalized since the previous epoch boundary.
- Slot: Consensus scheduling unit. An operator can submit at most one bundle per slot. A domain block may aggregate
  bundles from multiple slots.
- Bundle-slot probability: θ = bundle_slot_probability = (theta_num, theta_den). Typically θ = 1/1.
- Operator stake:
    - operator_stake_i: operator i’s stake at epoch start.
    - total_domain_stake: sum of operator_stake over all operators in the eligible set at epoch start.
    - stake_share_i: p_i = operator_stake_i / total_domain_stake (fixed during the epoch).
- VRF threshold (as implemented):
    - threshold_i = (u128::MAX / theta_den) × theta_num / total_domain_stake × operator_stake_i
    - Selection (win) if VRF_u128 < threshold_i
    - Exact per-slot win probability: p_slot_i_exact = threshold_i / 2^128
- Per-epoch counters:
    - epoch_start_slot: slot index at epoch start
    - epoch_end_slot: slot of latest consensus block where epoch is transitioned.
    - slots_in_epoch: S = epoch_end_slot − epoch_start_slot + 1
    - bundles_in_epoch_i: x_i = total bundles included for operator i in the epoch
- Enforcement parameters:
    - tau_check (τ): per-epoch false-positive target for the lower-tail test (e.g., 0.01).
    - ln_one_over_tau = ln(1/τ) (precomputed constant in fixed-point).
    - base_minimum_bundles (E_base): minimum expected bundles to be produced by operator in a given epoch (e.g., 3
      bundles).
    - throughput_relevance_base_minimum (E_relevance): the enforced minimum expected bundles for Chernoff to be
      meaningful:
        - E_relevance = ceil(max(E_check_base, 2 × ln(1/τ)))
        - Example: τ = 1% → 2 ln(100) ≈ 9.21 → E_relevance = 10.

## Process

1. Epoch start (immediately after previous epoch end)
    - Apply staking rewards/updates.
    - Determine eligible operators: operator_stake_i ≥ minimum_stake_units.
    - Compute total_domain_stake and stake_share_i = operator_stake_i / total_domain_stake for each eligible operator.
    - Record epoch_start_slot = current slot.
    - Reset bundles_in_epoch_i = 0 for all eligible operators.
    - Reset domain_block_count_in_epoch = 0.
2. During the epoch
    - On each bundle submission:
        - For each included bundle (one per slot), increment bundles_in_epoch_i for its operator i by 1.
3. End of epoch (evaluation) and immediate start of next epoch
    - Compute slots_in_epoch S = epoch_end_slot − epoch_start_slot + 1.
    - For each operator i that was eligible at this epoch’s start:
        - Compute per-slot win probability: p_slot_i = min(1, (theta_num/theta_den) × stake_share_i).
        - Compute expected bundles for the epoch: μ_i = S × p_slot_i.
        - Throughput relevance enforcement:
            - If μ_i < E_relevance: skip checking operator i (not throughput-relevant this epoch).
            - Else:
                - Chernoff lower-tail threshold:
                    - r_i = floor( μ_i − sqrt( 2 × μ_i × ln(1/τ) ) ), clamped to [0, S].
                    - Guarantee: P_honest[X_i < r_i] ≤ τ.
                - Decision:
                    - If x_i < r_i: mark operator i as underperforming, potentially offline
                    - Else: operator i performed well and produces at least lower bound number of bundles in the epoch.
    - Reset per-epoch counters:
        - bundles_in_epoch_i = 0 for all operators.
    - Start next epoch:
        - Snapshot stakes, recompute eligibility and stake_share_i, set epoch_start_slot = current slot, and clear
          exclusion flags by not including excluded operators in the new eligible set.

## Chernoff Threshold Details

We test X_i ~ Binomial(S, p_slot_i) at lower tail level τ without scanning a CDF.

- Mean: μ_i = S × p_slot_i
- Additive Chernoff (lower tail): for any t ∈ [0, μ_i],
  P[X_i ≤ μ_i − t] ≤ exp(−t^2 / (2 μ_i)).
- Choose t = sqrt(2 μ_i ln(1/τ)), yielding:
    - r_i = floor( μ_i − sqrt(2 μ_i ln(1/τ)) ), clamped to [0, S].
    - This ensures an honest operator fails with probability at most τ.
- Throughput relevance floor:
    - When μ_i < 2 ln(1/τ), the bound becomes trivial (r_i ≤ 0). To avoid meaningless checks, enforce:
        - E_relevance = ceil(max(E_check_base, 2 ln(1/τ))).
        - Only operators with μ_i ≥ E_relevance are checked in the epoch.

Notes:

- τ controls strictness:
    - τ = 1% → ln(1/τ) ≈ 4.605 → 2 ln(1/τ) ≈ 9.21 → E_relevance ≥ 10.
- Raising E_relevance reduces how many operators are checked (lower runtime cost). Lowering τ (more conservative)
  increases E_relevance.

## Parameter Recommendations

- tau_check τ: 0.01 (1%).
- E_base: 3 (optional soft floor).
- Enforced throughput relevance: E_relevance = ceil(max(3, 2 ln(1/τ))) → with τ=1%, E_relevance=10.

Coverage intuition (with τ=1% and θ=(1, 1)):

- If S ≈ 600 slots/epoch, μ_i ≥ 10 implies stake_share_i ≥ ~10/600 ≈ 1.67%.
- Only operators above ~1.67% stake share will be checked; others are ignored for enforcement this epoch (but can still
  produce).
