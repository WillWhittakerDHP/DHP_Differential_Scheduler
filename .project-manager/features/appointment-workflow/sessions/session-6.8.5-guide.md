## Phase intent (goals and context)

# Phase 6.8 Guide: Admin Force-Create & Constraint Overrides

**Purpose:** Phase-level guide for planning and tracking the admin force-create and constraint override workflow

**Tier:** Phase (Tier 1 - High-Level)

## Session intent from phase guide

- [ ] ### Session 6.8.5: Block-level agentPermissions

**Description:** Add `agent_permissions` (TernaryBoolean: `'true'`, `'false'`, `'override'`) to `block_instances`, same pattern as `differential`. Full stack: migration, model, versioning (if used), client types, transformer. Effective permission: state = (user role, block.agentPermissions); admin always allowed; agent when `'true'` or `'override'`; client when `'false'` or `'override'`. Update Force Schedule and Override visibility (from 6.8.3/6.8.4) to respect agentPermissions when user role is available (Feature 7).

**Tasks:**
1. Migration: add `agent_permissions` column, default `'false'` (same `ternary_boolean` ENUM as `differential`). 2. Model: add to Sequelize BlockInstance; versioning: add to instanceVersioning if block instances are versioned. 3. Client types and transformer: add to BookingBlockInstance / globalToBookingTransformer. 4. Update Force Schedule and Override visibility logic to respect (user role, block.agentPermissions).

- [x] #### Task 6.8.5.1: ** Block-level agentPermissions

**Goal:** ** Block-level agentPermissions

**Files:**
(See tierUp guide and context above.)

**Approach:** See tierUp scope above.

**Checkpoint:** Verify per tierUp success criteria. [Fill in]
**Files:**
- [Files to work with]
**Approach:** [Fill in]
**Checkpoint:** [What needs to be verified]