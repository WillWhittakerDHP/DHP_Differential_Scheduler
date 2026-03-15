# Session 6.10.4 Guide: Coupon fee calculation (percentage and negative base fee)

**Phase:** 6.10 — Fee Preview & Coupon Visibility  
**Session:** 6.10.4 — Coupon fee calculation  
**Status:** In Progress  
**Branch:** TBD

**Depends on:** Session 6.10.3 (fee bar and popover; Confirmation step conditional coupon row).

---

## Quick Start

### Session Overview

**Session ID:** 6.10.4  
**Session Name:** Coupon fee calculation — add percentage column to part instance, adjust Part/Block Finals for percentage off and negative base fee  
**Description:** Wire coupon fee calculation into the booking fee pipeline: add percentage column to part instance, adjust Part/Block Finals for percentage off and negative base fee so fee preview and Confirmation step show real coupon impact.

**Status:** Not Started

### Tasks

- [x] #### Task 6.10.4.1: Add percentage column to part instance
**Goal:** Add percentage column (e.g. percentage off) to part instance; wire into fee pipeline inputs.  
**Files:** Part-instance / block-shape types; fee pipeline entry points.  
**Approach:** Extend types; ensure field flows to Part/Block Finals.  
**Checkpoint:** Part instance has optional percentage field; pipeline receives it.

- [x] #### Task 6.10.4.2: Adjust Part/Block Finals for percentage off and negative base fee
**Goal:** Apply percentage off and negative base fee in Part/Block Finals; integrate with confirmation pricing.  
**Files:** `client/src/utils/booking/` (partsTotals, partFinalizer, BlockFinal, confirmationStepData.ts).  
**Approach:** Apply percentage off to part/block totals; handle negative base fee; wire into buildConfirmationPriceData.  
**Checkpoint:** Fee preview and Confirmation step show correct totals when coupon is applied; lint and app start pass.

---

## Session Workflow

- Use `/session-start 6.10.4` to load context and plan; then proceed with tasks.
- Work one task at a time; run `/task-end 6.10.4.N` when each task is done; cascade to next task or session-end per workflow.
- End with `/session-end 6.10.4` when all tasks are complete (verify app, lint, update docs, commit, then push or skip).

---

## Reference

- Phase guide: `phases/phase-6.10-guide.md`
- Planning doc: `sessions/session-6.10.4-planning.md`
- Fee pipeline: `client/src/utils/booking/confirmationStepData.ts`, partsTotals, BlockFinal, partFinalizer
