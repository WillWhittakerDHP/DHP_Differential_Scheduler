# Phase 20.10 Guide: Residual booking pipeline alignment

**Purpose:** Finish the booking-critical residuals from the locked close-out plan so the live pipeline reflects lineage, placement-driven layout, and the client-only PartFinalizer contract.

**Tier:** Phase (Tier 1)

---

## Canonical sources

- `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`
- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
- [architecture-alignment-closeout-master-plan.md](../architecture-alignment-closeout-master-plan.md) — in-repo close-out sequencing index (phases **20.7–20.13**).

---

## Overview

**Phase Number:** 20.10  
**Phase Name:** Residual booking pipeline alignment  
**Description:** Finish residual lineage, placement-layout, zero-out-ordering, and differential-role retirement work on the booking-critical path.  
**Status:** Planned — start with **`phase-20.10-planning.md`**

---

## Objectives

- [ ] Residual `partShape`-truth correlation is eliminated
- [ ] Placement/layout derives from event instances and placement types
- [ ] Zero-out ordering is verified in the actual live path

### Preflight follow-ups (Session 20.7.2)

Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §§1–2; authority: [`.project-manager/ARCHITECTURE.md`](../../../ARCHITECTURE.md) §10–§14.

- **§14.3d (unknown)** — PartFinalizer / slot pipeline key **`eventAssignmentsByPartShape`** and **`groupPartsByShape`** by **part shape name** — reconcile with **lineage** bucket rules (§10.2 / §14.3d) when multiple work items could collide.
- **§14.3g (unknown)** — Per-block-instance provenance / undo / reconfiguration — operational verification on live path.
- **§10.3 step 5 (unknown)** — **Zero-out last** vs current **`filterZeroedParts` / `filterZeroedBlocks`** exclusion before slot-shape — prove ordering matches **ARCHITECTURE** §10.3.
- **§14.4a–c (unknown)** — New event placement types via data rows without mandatory engine change per row.
- **§14.5 (unknown)** — **`property_details`** as appointment data vs time-configuration rates — full boundary paragraph tracks **preflight** §4 (session **20.7.3**).
- **§1.4 (risk)** — If the live pipeline requires **part-scoped** `event_assignments` edges, align **`appointmentSlotBuilder`** consumption with API/global graph.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.10.1** | Lineage and part-correlation residuals |
| **20.10.2** | Slot/placement/layout residuals |
| **20.10.3** | Zero-out verification and differential-role-era booking cleanup |

