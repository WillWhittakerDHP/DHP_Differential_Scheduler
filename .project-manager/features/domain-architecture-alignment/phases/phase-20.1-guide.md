# Phase 20.1 Guide: Pass 1 — Schema alignment

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.1** (schema pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.1)

Scope:

- Rename block-shape types to `time`, `price`, and `event`.
- Move three-property storage to `block_instances`.
- Add event placement columns and event-instance ownership fields.
- Drop differential-role storage and other legacy columns called out in section 2.

Acceptance checks:

- Schema plan refers to `block_instances.composite`, `block_instances.orchestrator`, and `block_instances.wizardVisible`.
- No schema step enforces `orchestrator -> composite`.
- Event routing is still modeled through `event_assignments`.

---

## Related plan sections

- **§2** — Model changes (DB / Sequelize): enum renames, tables, columns aligned to this pass.
- **§1** — Rename mappings and part-instance migration (type renames `property`→`time`, etc.).
- **§0.2** — Legacy assumptions to remove (shape-level three-property framing, etc.).

---

## Principles and drift

Enforce **ARCHITECTURE_PRINCIPLES.md** §1 (domain separation), §2 (three-property instance model), §3–§5 as cited in plan §2. At session boundaries run **plan §9.1** and confirm **§9.1a** invariants (especially instance-level three-property storage and relational `event_assignments`).

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.1
**Phase Name:** Pass 1 — Schema alignment (models, enums, instance fields per plan §8.1 / doc §2).
**Description:** Align PostgreSQL schema and Sequelize models with locked domain principles: rename block shape types, add instance-level three-property columns, add event placement/ownership columns, drop legacy columns, rename attendee table.
**Status:** Not Started

---

## Objectives

- [ ] Block shape type enum renamed (`property`->`time`, `coupon`->`price`, `option`->`event`)
- [ ] `block_instances` carries `composite`, `orchestrator`, `wizardVisible`; legacy columns removed
- [ ] `event_shapes` has `placement_kind` + `anchor_edge`; legacy `differential_role` removed
- [ ] `event_instances` has `parent_block_instance_id` + location fields; calendar toggles moved from event_shapes
- [ ] `event_shape_attendees` renamed to `event_instance_attendees`
- [ ] Legacy shape-level booleans (`composable`, `isStateControl`, `canHaveParts`) removed from `block_shapes`
- [ ] Client constants and entity types updated to match schema
- [ ] App starts and lint passes

---

## Sessions Breakdown

Session 20.1.1: Block shape type enum rename
Session 20.1.2: Block instance three-property alignment and legacy cleanup
Session 20.1.3: Event schema alignment (placement, ownership, attendee rename)

## Tasks

Run `/session-start 20.1.1` to begin the first session. Each session covers one logical group of schema changes per the phase planning doc.
