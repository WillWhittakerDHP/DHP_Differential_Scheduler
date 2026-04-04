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

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.10.1** | Lineage and part-correlation residuals |
| **20.10.2** | Slot/placement/layout residuals |
| **20.10.3** | Zero-out verification and differential-role-era booking cleanup |

