# Phase 20.6 Guide: Pass 6 — Rollout and cleanup

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.6** (rollout and cleanup pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.6)

Scope:

- Roll out domain editors incrementally.
- Delete differential-role code after the replacement path is in place.
- Delete `EntityCard` and the **entire** admin metadata infrastructure (including annotation-related metadata tables and pipeline code) after replacement editors are proven.
- Prepare replacement review for consolidating this document as the sole canonical implementation plan (retire older redesign filenames if any remain).

Cleanup grouping:

- Differential-role utilities and shared types
- Event-instance standalone editing remnants
- Generic `EntityCard` component tree
- Generic `EntityCard` composables and types
- Admin metadata database tables, routes, and client prefetch/mutation paths (full stack)
- Remaining event-shape display/config wiring no longer needed after placement-type conversion

Acceptance checks:

- Cleanup follows replacement, not the reverse.
- Review gate artifacts are complete before replacing the old redesign file.
- Remaining risks and open decisions are carried into the final review section.

---

## Related plan sections

- **§6.3** / **§6.3a** — Shared display, metadata cleanup, and full deletion inventory for `EntityCard` and related infrastructure.
- **§9.3** / **§9.4** — Replacement readiness and review gate before any redesign doc promotion or filename consolidation.
- **§8.3** — Admin UX pass (replacement editors must precede deletions).

---

## Principles and drift

**Cleanup follows replacement, not the reverse** (plan §8.6). Enforce **ARCHITECTURE_PRINCIPLES.md** §7 (domain editors). Run **plan §9.1** / **§9.1a** through rollout.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.6
**Phase Name:** Pass 6 — Rollout, cleanup, doc promotion (§8.6).
**Description:** Incremental rollout of domain editors; delete differential-role and legacy admin code; **remove the full admin metadata stack** (per §6.3a) after cutover; review gate before doc promotion.
**Status:** Not Started

---

## Objectives

- [ ] **Replacement first** — No metadata or EntityCard deletion until replacement editors are proven (plan §8.6 acceptance).
- [ ] **Cleanup** — EntityCard tree, metadata composables/types/utils, admin metadata **server** models/routes, and client `admin-metadata` usage removed per §6.3a.
- [ ] **Docs** — `ARCHITECTURE.md` / handoff reflect end state; review gate §9.3–§9.4 satisfied if promoting canonical docs.

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.] Defer detailed session IDs until `/phase-start 20.6`; trace execution to **FEATURE_20 §6.3a** deletion inventory and **DOMAIN_REWRITE_WORKLOG** Pass 5 narrative for metadata ordering.
