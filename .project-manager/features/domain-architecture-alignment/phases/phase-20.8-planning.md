<!-- harness-planning-rollup tier=phase id=20.8 consolidatedAt=2026-04-03T22:25:00.000Z -->

# Consolidated planning: phase 20.8

## Phase 20.8 (parent)

## Story

**As a** maintainer moving from preflight evidence into execution, **I want** the remaining schema and API contract drift closed first, **so that** admin and booking follow-on work runs against stable naming, ownership, and validation boundaries.

**Estimated size:** **M**

---

## Analysis

- **Problem / why now:** Residual schema/API ambiguity is the cheapest place to create downstream confusion. If event ownership, attendee ownership, placement validation, or part-ledger naming are still fuzzy, later UI and booking work will either duplicate adapters or mask the wrong contract.
- **Boundaries:** Server models/routes/validators, shared types, and selected client types/transformers only where contract naming still leaks into the app.
- **Patterns:** Use the Phase 20.7 evidence package to narrow scope to actual residual drift rather than replaying all of **20.1–20.2**.

## Goal

1. Finish residual part-ledger contract alignment.
2. Finish residual event ownership and attendee ownership enforcement.
3. Tighten placement validation and legacy alias behavior so the API teaches the locked architecture.

## Decomposition

- **Session 20.8.1:** Part-ledger naming and version-table residuals
- **Session 20.8.2:** Event ownership, attendee ownership, and routing-integrity enforcement
- **Session 20.8.3:** Placement validation and legacy alias tightening

## Acceptance Criteria

- [ ] Residual `rateOverBase*` drift is resolved or explicitly quarantined
- [ ] `event_assignments` and `parent_block_instance_id` enforcement matches the locked contract
- [ ] Attendee ownership is segment-based, not placement-type-based
- [ ] Placement validators and compatibility layers no longer teach the wrong model
