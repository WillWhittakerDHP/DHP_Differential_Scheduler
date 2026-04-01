# Feature 20: Domain Architecture Alignment — Guide

**Purpose:** Harness planning surface for executing the locked domain principles and v2 implementation plan in ordered passes.

**Tier:** Feature (Tier 0)

**Feature Name:** Domain Architecture Alignment  
**Status:** Planning  
**Directory:** `features/domain-architecture-alignment/`  
**PROJECT_PLAN:** Feature #20

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/DOMAIN_ARCHITECTURE_REDESIGN_v2.md](.project-manager/analysis/DOMAIN_ARCHITECTURE_REDESIGN_v2.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or v2.

---

## Mandatory context for every phase and session

- Open **both** canonical documents (or the sections cited in the active phase guide) **before** implementation work.
- At **session start and end**, run **v2 §9.1** (drift checklist) and cross-check **v2 §9.1a** against **ARCHITECTURE_PRINCIPLES.md §8** invariants.
- Do not treat this feature guide as a substitute for the full v2 sections that apply to the pass you are in.

---

## Feature objectives

- Execute **v2 §8** ordered passes (20.1–20.6) without drifting from principles or v2 acceptance checks.
- Keep booking totals on the client (PartFinalizer), relational event routing, and instance-level three-property storage aligned with principles.
- Coordinate with **Feature 6** (appointment workflow / booking) where surfaces overlap — principles + v2 remain authoritative for architecture.

---

## Phases breakdown (Feature 20 ↔ v2 §8)

| Phase | Name | v2 section |
| --- | --- | --- |
| **20.1** | Pass 1 — Schema alignment | §8.1 |
| **20.2** | Pass 2 — API alignment | §8.2 |
| **20.3** | Pass 3 — Admin UX alignment | §8.3 |
| **20.4** | Pass 4 — Booking pipeline alignment | §8.4 |
| **20.5** | Pass 5 — Migration planning and data conversion | §8.5 |
| **20.6** | Pass 6 — Rollout and cleanup | §8.6 |

**Phase guides:** [phases/](./phases/) — `phase-20.1-guide.md` … `phase-20.6-guide.md`.

**Harness decomposition:** `/feature-start` scans this guide for lines matching `Phase X.Y:`. The following lines are intentional so tier-down output lists every implementation pass in order:

Phase 20.1: Pass 1 — Schema alignment  
Phase 20.2: Pass 2 — API alignment  
Phase 20.3: Pass 3 — Admin UX alignment  
Phase 20.4: Pass 4 — Booking pipeline alignment  
Phase 20.5: Pass 5 — Migration planning and data conversion  
Phase 20.6: Pass 6 — Rollout and cleanup  

---

## Phase 20.0 (governance — no separate guide required initially)

Use this subsection when planning readiness and migration narrative without starting a numbered implementation pass.

- **Replacement readiness:** v2 **§9.3** (checklist before swapping v2 into the canonical redesign path).
- **Migration notes summary:** v2 **§9.5** (ordering constraints for type renames, three-property move, placement, relational routing).
- **Audit trail:** [.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md](../../analysis/DOMAIN_REWRITE_WORKLOG.md) — session and decision history for the domain rewrite.

---

## v2 sections 0–7 — quick index

Use this index so work does not rely only on §8 pass text.

| Topic | v2 section |
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
