# Phase 20.8 Guide: Truth docs and final close-out

**Purpose:** Phase-level harness guide for the final Feature 20 extension phase derived from the locked close-out master plan. This phase reconciles truth-bearing architecture and planning documents, retires or narrows parallel plan surfaces, and prepares Feature 20 for a clean **`/feature-end`**.

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — original Feature 20 implementation plan.
- [/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md](../../../../.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md) — locked canonical sequencing plan for the extension close-out.

**Conflict rule:** If truth-bearing docs disagree with the locked architecture docs, the architecture docs win. This phase updates derivative docs to match that reality.

---

## Verbatim directive (master plan: Phase 7)

This phase executes the final truth-doc and close-out work:

- retire contradictory or superseded architecture/planning text
- reconcile `ARCHITECTURE.md`
- reconcile the active plan set and project-level truth surfaces
- prepare Feature 20 for final harness close-out only after the document set reflects the real implementation state

---

## Related plan sections

- **Master plan — Phase 7**: truth docs and final close-out
- **Master plan — Final close-out criteria**
- **Master plan — Phase crosswalk**

---

## Principles and drift

This phase should not become a prose-only cleanup that hides unresolved reality. If the docs and implementation still diverge materially, document the debt explicitly instead of overstating completion.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.8  
**Phase Name:** Truth docs and final close-out  
**Description:** Reconcile truth-bearing architecture and planning docs to the locked close-out plan, retire plan forks, update project-level status language carefully, and prepare Feature 20 for **`/feature-end`**.  
**Status:** Planned — start with **`phase-20.8-planning.md`**

---

## Objectives

- [ ] **Truth-doc reconciliation** — `ARCHITECTURE.md` and close-out planning surfaces describe the same architecture as the locked docs.
- [ ] **Plan retirement / narrowing** — parallel plan surfaces no longer compete with the locked master plan.
- [ ] **Feature closeout readiness** — handoffs and project-level status point cleanly to **`/feature-end`** only when the document set is honest.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.8.1** | `ARCHITECTURE.md` truth alignment and booking-correlation/routing notes |
| **20.8.2** | Plan-set reconciliation, project-plan alignment, and retirement/narrowing of parallel planning surfaces |
| **20.8.3** | Final review packet, feature handoff cleanup, and `/feature-end` readiness |

**Harness order:** `/session-start 20.8.1` → … → `/session-end` each → `/phase-end 20.8` when all sessions complete.

---

## Tasks

Session guides/logs are created at **`/session-start`**. Keep the close-out evidence-based rather than narrative-driven.

- [ ] ### Session 20.8.1: Architecture truth alignment
**Description:** Reconcile `ARCHITECTURE.md` with the locked routing, lineage, metadata-retirement, and client-finalizer boundaries, adding concise notes where the implementation needs a clear pointer.

- [ ] ### Session 20.8.2: Planning-surface reconciliation
**Description:** Reconcile or retire parallel planning surfaces so the locked master plan is the clear sequencing authority; update project-level Feature 20 status language only as far as the evidence supports.

- [ ] ### Session 20.8.3: Final review and feature-end readiness
**Description:** Perform the final review pass across feature/phase handoffs, logs, and close-out criteria; prepare the feature for **`/feature-end`** only when the docs and implementation state line up honestly.

<!-- end excerpt phase -->
