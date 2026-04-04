# Phase 20.7 Guide: Canonical lock and preflight safeguards

**Purpose:** Phase-level harness guide for Feature 20 extension work derived from the locked close-out master plan. This phase turns the master plan into the active canonical sequencing surface and establishes the preflight safeguards that must hold before any further close-out execution.

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — original Feature 20 implementation plan and pass inventory.
- [/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md](../../../../.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md) — locked canonical sequencing plan for the post-20.6 close-out extension.

**Conflict rule:** If this guide disagrees with the locked architecture docs, the analysis docs win. If sequencing conflicts remain after that, the locked master plan wins over older feature-planning surfaces.

---

## Verbatim directive (master plan: Resolved Positions + Phase 0)

This phase operationalizes the master plan's preflight section:

- lock the master plan as the active close-out sequencing surface
- add immediate safeguards before execution
- run the event-routing watchpoint before Phase 2- and Phase 4-style follow-on work
- run an invariant audit that explicitly checks client-finalizer boundaries, lineage, event ownership, zero-out ordering, and `property_details` separation

This phase exists because the original Feature 20 pass ladder ended at **20.6**, but the close-out work now needs one explicit harness phase to:

- prevent contradictory redesign docs from remaining silently active
- keep agents from treating old plan forks as equal authorities
- force the highest-risk ambiguity (`event_assignments`) into a written preflight checkpoint

---

## Related plan sections

- **Master plan — Resolved Positions**: event routing, lineage, client PartFinalizer, zero-out ordering, domain-editor end state
- **Master plan — Phase 0**: preflight alignment and audit
- **Master plan — Risk register**: event-routing ambiguity as the highest-scrutiny watchpoint

---

## Principles and drift

Do **not** reopen the architecture in this phase. The goal is to confirm code/document reality against the locked contract and set execution safeguards for the remaining close-out work.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.7  
**Phase Name:** Canonical lock and preflight safeguards  
**Description:** Lock the master close-out plan as the active sequencing surface, add warning/tombstone protections to contradictory doc paths, and produce the preflight evidence package required for the remaining close-out work.  
**Status:** Planned — start with **`phase-20.7-planning.md`**

---

## Objectives

- [ ] **Canonical lock** — the master close-out plan is explicitly recognized as the active sequencing surface for post-20.6 Feature 20 work.
- [ ] **Preflight safeguards** — contradictory redesign/planning surfaces are marked so future agents do not follow the wrong mental model.
- [ ] **Evidence package** — event-routing watchpoint, invariant audit, migration policy restatement, and `property_details` boundary check are written in-repo.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.7.1** | Canonical lock, plan adoption, and contradictory-doc warning/tombstone pass |
| **20.7.2** | Event-routing watchpoint, invariant audit, migration policy restatement, and MLS / `property_details` boundary verification |

**Harness order:** `/session-start 20.7.1` → … → `/session-end` each → `/phase-end 20.7` when all sessions complete.

---

## Tasks

Session guides/logs are created at **`/session-start`**. This phase should produce the documents that downstream close-out work can cite directly.

- [ ] ### Session 20.7.1: Canonical plan adoption and doc protections
**Description:** Mark the locked master plan as the active close-out sequencing surface; update feature-level guidance so the new ladder is visible; add warning/tombstone text where contradictory or superseded planning paths could still mislead agents.

**Tasks:**
- Update feature-level guidance so post-20.6 work points to the master plan and to phases **20.7** and **20.8**.
- Add brief warning/tombstone language to any contradictory redesign/planning surface that is still likely to be consulted.
- Ensure handoff text no longer treats **`/feature-end`** as the immediate next action after **20.6**.

- [ ] ### Session 20.7.2: Preflight evidence package
**Description:** Produce the written preflight package required by the master plan: event-routing watchpoint, invariant audit, migration execution policy restatement, and `property_details` separation confirmation.

**Tasks:**
- Confirm the live meaning of `event_assignments` where code still appears ambiguous.
- Write the invariant audit and map every failing row to an owning close-out phase.
- Restate migration execution policy in the active close-out docs.
- Verify `property_details` remains appointment-scoped input data and is not drifting into time-configuration storage.

<!-- end excerpt phase -->
