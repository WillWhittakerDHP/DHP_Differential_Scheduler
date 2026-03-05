## Phase intent (goals and context)

# Phase 6.8 Guide: Admin Force-Create & Constraint Overrides

**Purpose:** Phase-level guide for planning and tracking the admin force-create and constraint override workflow

**Tier:** Phase (Tier 1 - High-Level)

## Session intent from phase guide

- [ ] ### Session 6.8.4: ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Description:** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Tasks:**
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

- [x] #### Task 6.8.4.1: ** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Goal:** ** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Files:**
(See tierUp guide and context above.)

**Approach:** See tierUp scope above.

**Checkpoint:** Verify per tierUp success criteria. [Fill in]
**Files:**
- [Files to work with]
**Approach:** [Fill in]
**Checkpoint:** [What needs to be verified]