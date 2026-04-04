# Phase 20.8 Guide: Residual schema and API enforcement

**Purpose:** Phase-level harness guide for the second execution-first Feature 20 extension phase. This phase converts the preflight findings into concrete schema, contract, and validation work so later admin and booking phases run against stable boundaries.

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — original Feature 20 implementation plan.
- [architecture-alignment-closeout-master-plan.md](../architecture-alignment-closeout-master-plan.md) — in-repo close-out sequencing index (phases **20.7–20.13**).

**Conflict rule:** If truth-bearing docs disagree with the locked architecture docs, the architecture docs win. This phase updates derivative docs to match that reality.

---

## Phase intent

This phase executes the residual work from master-plan **Phases 1–2** that remains after **20.1–20.6**:

- part-ledger naming and contract alignment
- event ownership and routing integrity enforcement
- attendee ownership alignment
- placement validation and API tightening
- legacy alias tightening where adapters are still overstating the old model

---

## Overview

**Phase Number:** 20.8  
**Phase Name:** Residual schema and API enforcement  
**Description:** Finish or verify remaining part-ledger naming, event ownership, attendee ownership, placement validation, and legacy alias tightening so downstream admin and booking work execute against stable contracts.  
**Status:** Planned — start with **`phase-20.8-planning.md`**

---

## Objectives

- [ ] **Ledger contract** — residual `rateOverBase*` / `timePerUnit` / `feePerUnit` drift is removed or explicitly contained.
- [ ] **Routing ownership** — `event_assignments`, `parent_block_instance_id`, and attendee ownership are enforced consistently.
- [ ] **Validation tightening** — placement and legacy-alias validators teach the locked model rather than the transitional one.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.8.1** | Part-ledger naming and version-table residuals |
| **20.8.2** | Event ownership, attendee ownership, and routing-integrity enforcement |
| **20.8.3** | Placement validation and legacy alias tightening |

**Harness order:** `/session-start 20.8.1` → … → `/session-end` each → `/phase-end 20.8` when all sessions complete.

---

## Tasks

Session guides/logs are created at **`/session-start`**. Keep this phase focused on residual contract work, not broad replay of completed phases.

- [ ] ### Session 20.8.1: Part-ledger contract residuals
**Description:** Verify and finish any remaining `rateOverBase*` to `timePerUnit` / `feePerUnit` drift in storage, models, shared types, client types, and versioning.

- [ ] ### Session 20.8.2: Event ownership and attendee ownership
**Description:** Verify and finish enforcement of `event_instances.parent_block_instance_id`, relational routing integrity, and `event_shape_attendees` to `event_instance_attendees` ownership alignment.

- [ ] ### Session 20.8.3: Placement validation and alias tightening
**Description:** Tighten placement validators and remove or narrow compatibility layers that still teach `property` / `coupon` / `option` or similar legacy concepts as live truth.

<!-- end excerpt phase -->
