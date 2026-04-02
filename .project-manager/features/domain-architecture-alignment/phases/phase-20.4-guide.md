# Phase 20.4 Guide: Pass 4 — Booking pipeline alignment

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.4** (booking pipeline pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.4)

Scope:

- Remove differential-role pipeline pieces.
- Rewrite grouping and layout helpers around event instances plus placement-type lookups.
- Preserve lineage-based part correlation and zero-out ordering.

Acceptance checks:

- Pipeline text follows Principles §4.4 resolution order.
- Placement derives from event shapes and event instances, not computed role flags.
- Finalizer remains client-side.

---

## Related plan sections

- **§4** — Booking pipeline rewrite (full detail).
- **§5** — API boundaries (no server-side resolution).
- **§6.2** — Booking utilities to rewrite or delete.

---

## Principles and drift

Anchor on **ARCHITECTURE_PRINCIPLES.md** §4 (two-tier resolution, PartFinalizer client-only, **§4.4** order). Run **plan §9.1** / **§9.1a** at session boundaries.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.4
**Phase Name:** ** Pass 4 — Booking pipeline alignment (finalizer, transformers, steps §8.4 / §4).
**Description:** [Fill in]
**Status:** Not Started

---

## Objectives

- [ ] Objectives to be planned. Add key outcomes for this phase.

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.]
