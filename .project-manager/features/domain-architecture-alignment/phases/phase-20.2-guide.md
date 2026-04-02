# Phase 20.2 Guide: Pass 2 — API alignment

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.2** (API pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.2)

Scope:

- Update entity and relationship routes to accept renamed types and instance-level three-property fields.
- Scope event-instance APIs to parent event block instances.
- Keep server responses centered on configuration and raw storage rows needed by the client finalizer.

Acceptance checks:

- Route payloads and validators match the schema pass.
- No API path introduces server-side booking-total resolution.
- Event-shape APIs expose placement fields only, not differential-role concepts.

---

## Related plan sections

- **§5** — Server route and API alignment (full API surface and validators).
- **§4** — Booking pipeline (client finalizer contract; server must not become a second calculator).
- **§2** — Schema the routes must reflect after Pass 1.

---

## Principles and drift

Align with **ARCHITECTURE_PRINCIPLES.md** §4 (persistence vs resolution), §5 (event model). Run **plan §9.1** / **§9.1a** at session boundaries; reject server-side booking total resolution.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.2
**Phase Name:** ** Pass 2 — API alignment (routes, validation, shared contracts §8.2 / §5).
**Description:** Align internal entity/relationship routes and validators with Phase 20.1 schema; scope event instances to parent event block instances; no server-side booking resolution.
**Status:** Complete (2026-04-02)

---

## Objectives

- [x] Entity and relationship routes accept Phase 20.1 schema: renamed block-shape `type` values and instance `composite` / `orchestrator` / `wizardVisible`.
- [x] Event-shape APIs expose placement fields only; event instances scoped with `parent_block_instance_id` and segment payload fields per Principles §5.4.
- [x] No server-side booking-total or PartFinalizer-equivalent logic in any route touched in this phase.
- [x] Preview, appointment persistence, and calendar integration read configuration and raw rows only (plan §5.2).

---

## Tasks

Sessions below mirror **phase-20.2-planning.md** decomposition. Run **`/session-start 20.2.x`** in order.

---

## Sessions breakdown

- [x] ### Session 20.2.1: Block shape & block instance entity routes
**Description:** Align `blockShape` / `blockInstance` internal CRUD and validators with Phase 20.1 (`type` enum, `composite`, `orchestrator`, `wizardVisible`).

**Tasks:** Task blocks added at session-start.

- [x] ### Session 20.2.2: Event shape & event instance entity routes
**Description:** Placement-only surfaces for event shapes; event instances require parent event block context and validate segment fields per §5.4.

**Tasks:** Task blocks added at session-start.

- [x] ### Session 20.2.3: Relationships & event-instance preview
**Description:** `eventAssignments`, instance-level attendees, `validEventCascades`; re-scope preview to segments under a parent event block instance.

**Tasks:** Task blocks added at session-start.

- [x] ### Session 20.2.4: Appointments, calendar integration & API cleanup
**Description:** Appointment persistence without recomputing totals; calendar services read segment identity and placement policy; remove differential-role-specific route helpers per §5.3 where safe.

**Tasks:** Task blocks added at session-start.

<!-- end excerpt phase -->