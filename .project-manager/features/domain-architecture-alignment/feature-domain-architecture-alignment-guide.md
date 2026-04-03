# Feature 20: Domain Architecture Alignment — Guide

**Purpose:** Harness planning surface for executing the locked domain principles and the Feature 20 implementation plan in ordered passes.

**Tier:** Feature (Tier 0)

**Feature Name:** Domain Architecture Alignment  
**Status:** In Progress — extension close-out ladder active  
**Directory:** `features/domain-architecture-alignment/`  
**PROJECT_PLAN:** Feature #20

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).
- [/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md](../../../.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md) — locked canonical sequencing plan for the post-20.6 close-out extension.

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Mandatory context for every phase and session

- Open **both** canonical documents (or the sections cited in the active phase guide) **before** implementation work.
- At **session start and end**, run **plan §9.1** (drift checklist) and cross-check **plan §9.1a** against **ARCHITECTURE_PRINCIPLES.md §8** invariants.
- Do not treat this feature guide as a substitute for the full implementation-plan sections that apply to the pass you are in.

---

## Feature objectives

- Execute **plan §8** ordered passes (20.1–20.6) without drifting from principles or implementation-plan acceptance checks, then complete the extension close-out phases (**20.7–20.8**) derived from the locked master plan.
- Keep booking totals on the client (PartFinalizer), relational event routing, and instance-level three-property storage aligned with principles.
- Coordinate with **Feature 6** (appointment workflow / booking) where surfaces overlap — principles + implementation plan remain authoritative for architecture.

---

## Phases breakdown (Feature 20 ↔ plan §8 plus close-out extension)

| Phase | Name | Plan § |
| --- | --- | --- |
| **20.1** | Pass 1 — Schema alignment | §8.1 |
| **20.2** | Pass 2 — API alignment | §8.2 |
| **20.3** | Pass 3 — Admin UX alignment | §8.3 |
| **20.4** | Pass 4 — Booking pipeline alignment | §8.4 |
| **20.5** | Pass 5 — Migration planning and data conversion | §8.5 |
| **20.6** | Pass 6 — Rollout and cleanup | §8.6 |
| **20.7** | Extension — Canonical lock and preflight safeguards | master plan Phase 0 |
| **20.8** | Extension — Truth docs and final close-out | master plan Phase 7 |

**Scope notes (admin metadata):** Pass **20.3** delivers domain editors per §8.3 **including** annotation direction (no long-term DB metadata exception). Pass **20.5** documents **admin metadata schema retirement** ordering (§8.5). Pass **20.6** executes **full** metadata stack removal after editors are proven (§8.6).

**Phase guides:** [phases/](./phases/) — `phase-20.1-guide.md` … `phase-20.8-guide.md`.

**Harness decomposition:** `/feature-start` scans this guide for lines matching `Phase X.Y:`. The following lines are intentional so tier-down output lists every implementation pass in order:

Phase 20.1: Pass 1 — Schema alignment  
Phase 20.2: Pass 2 — API alignment  
Phase 20.3: Pass 3 — Admin UX alignment  
Phase 20.4: Pass 4 — Booking pipeline alignment  
Phase 20.5: Pass 5 — Migration planning and data conversion  
Phase 20.6: Pass 6 — Rollout and cleanup  
Phase 20.7: Extension — Canonical lock and preflight safeguards  
Phase 20.8: Extension — Truth docs and final close-out  

## Phase 20.6

**Pass 6 — Rollout and cleanup** (`FEATURE_20_ARCHITECTURE_REDESIGN.md` **§8.6**): incremental rollout of domain editors; remove differential-role and other legacy paths only **after** replacements are proven; delete the **`EntityCard`** tree and the **full admin metadata stack** (DB tables, routes, client prefetch/mutation) per **§6.3a** and the **Pass 5** retirement ordering in **`DOMAIN_REWRITE_WORKLOG.md`**; complete **§9.3 / §9.4** review-gate artifacts before any canonical doc promotion or filename consolidation.

**Phase guide:** [phases/phase-20.6-guide.md](./phases/phase-20.6-guide.md)

**Post-20.6 note:** The original pass ladder ended here, but Feature 20 now continues through extension phases **20.7** and **20.8** before **`/feature-end`**.

---

## Phase 20.7

**Extension — Canonical lock and preflight safeguards** (locked master plan **Phase 0**): adopt the master close-out plan as the active sequencing surface, protect against contradictory redesign text, and produce the written preflight evidence package (event-routing watchpoint, invariant audit, migration policy restatement, and MLS / `property_details` boundary check).

**Phase guide:** [phases/phase-20.7-guide.md](./phases/phase-20.7-guide.md)

---

## Phase 20.8

**Extension — Truth docs and final close-out** (locked master plan **Phase 7**): reconcile `ARCHITECTURE.md`, planning surfaces, handoffs, and project-level Feature 20 wording so the document set matches the real implementation state before **`/feature-end`**.

**Phase guide:** [phases/phase-20.8-guide.md](./phases/phase-20.8-guide.md)

---

## Phase 20.0 (governance — no separate guide required initially)

Use this subsection when planning readiness and migration narrative without starting a numbered implementation pass.

- **Replacement readiness:** **§9.3** in `FEATURE_20_ARCHITECTURE_REDESIGN.md` (checklist before any doc promotion or canonical-path change).
- **Migration notes summary:** **§9.5** (ordering constraints for type renames, three-property move, placement, relational routing).
- **Audit trail:** [.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md](../../analysis/DOMAIN_REWRITE_WORKLOG.md) — session and decision history for the domain rewrite.

---

## Plan sections 0–7 — quick index

Use this index so work does not rely only on §8 pass text.

| Topic | Plan § |
| --- | --- |
| Rewrite scope, legacy removals, outline map | §0 |
| Rename mappings, part-instance migration | §1 |
| Schema / DB / Sequelize model changes | §2 |
| Admin redesign | §3 |
| Booking pipeline rewrite | §4 |
| Server routes and API alignment | §5 |
| Client inventory (utilities, components) | §6 |
| Resolved implementation positions | §7 |
| **Ordered passes (execution order)** | **§8** |
| Drift, gates, migration notes, risks | §9 |

---

## Research / handoff

- **Handoff:** [feature-domain-architecture-alignment-handoff.md](./feature-domain-architecture-alignment-handoff.md)
- **Log:** [feature-domain-architecture-alignment-log.md](./feature-domain-architecture-alignment-log.md)

---

## Overview

**Feature:** . Feature: domain-architecture-alignment

---

## Implementation Plan

Phases and implementation order. [Fill in from feature plan.]

---

## Feature Objectives

- Deliver **Feature: domain-architecture-alignment** end-to-end per PROJECT_PLAN and phase guides (migrations, server, client, and docs as scoped).
- Meet LAUNCH_CHECKLIST and security gates that apply before beta or production cutover.
- Publish stable contracts for downstream features (APIs, session/identity semantics, or docs) defined under **Dependencies** / **Implementation Plan**.


- [ ] ### Phase 1: Feature: domain-architecture-alignment
**Description:** Feature: domain-architecture-alignment
**Sessions:** [To be planned]
**Success Criteria:**
- [To be defined]