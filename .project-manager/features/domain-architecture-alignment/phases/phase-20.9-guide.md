# Phase 20.9 Guide: Residual admin surface alignment

**Purpose:** Finish the remaining admin-surface work from the locked close-out plan so the live admin path is clearly domain-specific rather than generic/transitional.

**Tier:** Phase (Tier 1)

---

## Canonical sources

- `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`
- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
- [architecture-alignment-closeout-master-plan.md](../architecture-alignment-closeout-master-plan.md) — in-repo close-out sequencing index (phases **20.7–20.13**).

---

## Overview

**Phase Number:** 20.9  
**Phase Name:** Residual admin surface alignment  
**Description:** Finish remaining orchestration, services, segment-manager, and generic-surface cutover work that still separates the live admin from the locked domain-editor end state.  
**Status:** Planned — start with **`phase-20.9-planning.md`**

---

## Objectives

- [ ] Orchestration/services surfaces match the intended domain split
- [ ] Segment management is event-block-instance-scoped
- [ ] Residual dominant generic editor paths are removed or narrowed

### Preflight follow-ups (Session 20.7.2)

Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §2; authority: [`.project-manager/ARCHITECTURE.md`](../../../ARCHITECTURE.md) §9–§14.

- **§14.2a–c (unknown)** — Prove composite / orchestrator / `wizardVisible` semantics against cascade graphs and wizard visibility lists (not only model columns).
- **§14.6 (unknown)** — User-type / orchestrator instances drive cascades; three-property flags remain configuration — verify wiring without hard-coded product constraints.
- **§1.4 (risk)** — Keep **`blockInstance.eventAssignments`** and **`partInstance.eventAssignments`** (code-first metadata) consistent with **migrations** and the **global relationship** graph returned by the API — editors are not a second source of truth.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.9.1** | Tabs and top-level admin IA residuals |
| **20.9.2** | Service/editor convergence and segment-manager residuals |
| **20.9.3** | Remaining generic editor cutover and annotation/editor finish work |

