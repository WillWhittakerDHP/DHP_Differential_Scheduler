# Phase 20.11 Guide: Migration narrative and data conversion close-out

**Purpose:** Finish the residual migration and data-conversion narrative work so no cleanup or feature closeout relies on undocumented defaults or implicit routing assumptions.

**Tier:** Phase (Tier 1)

---

## Overview

**Phase Number:** 20.11  
**Phase Name:** Migration narrative and data conversion close-out  
**Description:** Finish baseline routing and seed expectations, conversion crosswalks, and metadata-retirement ordering narrative after execution work clarifies any remaining reality gaps.  
**Status:** Planned — start with **`phase-20.11-planning.md`**

---

## Objectives

- [ ] Baseline routing and seed expectations are explicit
- [ ] Conversion and migration crosswalks reflect the final execution reality
- [ ] Metadata-retirement ordering remains traceable before final cleanup/closeout

### Preflight follow-ups (Session 20.7.2)

Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §3 (pending); [`.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`](../../../analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) ordering.

- **Migration execution policy** — Restate workspace rule: run DDL/migrations only when **`DB_HOST`** is **`localhost`** / **`127.0.0.1`** (shared DB consumers do not execute migrations). Tie **Feature 20** migration sequence to this phase’s baseline and conversion crosswalks.
- **Routing reality** — After **20.8** API/schema work, update migration/seed narratives so **`event_assignments`** and related tables match the enforced contract.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.11.1** | Baseline routing and seed expectation close-out |
| **20.11.2** | Conversion crosswalk and migration narrative reconciliation |
| **20.11.3** | Metadata-retirement ordering and pass-traceability finalization |

