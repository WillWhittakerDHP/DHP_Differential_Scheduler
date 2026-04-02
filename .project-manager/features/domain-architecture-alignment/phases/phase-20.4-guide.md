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
**Phase Name:** Pass 4 — Booking pipeline alignment (PartFinalizer, slot/time, minimizer, perspective; §8.4 / §4).  
**Description:** Remove differential-role **pipeline** enrichment; drive grouping, slot layout, time-axis application, minimizer bounds, and perspective from **event instances + placement** while preserving **lineage** correlation and **zero-out** ordering. **PartFinalizer stays client-side.**  
**Status:** Not Started

---

## Objectives

- [ ] Map and align the client booking pipeline with FEATURE_20 **§4.2** (named stages, correct order).
- [ ] Remove **`enrichBlockFinalsWithDifferentialRoles`** (and equivalent) in favor of **placement + segment/instance**-derived structure; align **PartFinal** with **§4.3**.
- [ ] Rewrite **slot shape** and **applyShapeToTime** (and related helpers) to use **placement_kind / anchor_edge** and grouping, not role flags.
- [ ] Update **perspective** and **minimizer** paths; delete unused **§6.2** **`differentialRole*`** utilities when grep-clean.
- [ ] Lint clean, app starts, phase log + handoff updated at **phase-end**.

---

## Tasks

Run sessions **in order** (see **phase-20.4-planning.md** § Decomposition). Cascade: `session-end` → next `session-start` → `phase-end 20.4` when all sessions complete.

Harness expects each session below as `### Session X.Y.Z:` (do not remove headings — tier-start uses them to sync decomposition and scaffold session guides).

- [x] ### Session 20.4.1: Pipeline audit + safe dead-code

**Description:** Document the current PartFinalizer / booking chain vs **§4.2**; inventory every **DifferentialRole** / role-enrichment / **PartFinal** major-minor-minimizer consumer; remove only **confirmed** dead branches without behavior change elsewhere.

**Tasks:** Session planning → grep-backed inventory → minimal removals → lint / smoke.

- [x] ### Session 20.4.2: Remove role enrichment; narrow PartFinal

**Description:** Replace differential-role enrichment of block finals with **event assignments + placement + segments**; migrate first-party consumers in the same slice per **§4.3**.

**Tasks:** Session planning → implement replacement → update types/usages → lint / booking smoke.

- [ ] ### Session 20.4.3: Slot shape + time axis

**Description:** **`calculateSlotShape`**, **`partFinalizerSlotShape`**, **`applyShapeToTime`** (and related) driven by **placement** and instance grouping, not computed role flags.

**Tasks:** Session planning → helper rewrites → consumer updates → lint / smoke.

- [ ] ### Session 20.4.4: Perspective + minimizer + shared cleanup

**Description:** **`perspectiveResolver`**, **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`partFinalizerSlotShapeHelpers`** as needed; remove **§6.2** **`differentialRole*`** paths when unused.

**Tasks:** Session planning → pipeline tail updates → shared delete/rename → final grep → lint / smoke.

<!-- end excerpt phase -->
