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
**Description:** [Fill in]
**Status:** Not Started

---

## Objectives

- [ ] Objectives to be planned. Add key outcomes for this phase.

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.]
