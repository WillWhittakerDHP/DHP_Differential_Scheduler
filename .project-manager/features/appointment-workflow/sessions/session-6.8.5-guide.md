# Session 6.8.5 Guide: Block-level agentPermissions

**Purpose:** Session-level guide for adding `agent_permissions` to block_instances (full stack) and updating Force Schedule and Override visibility to respect (user role, block.agentPermissions).

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

**Session ID:** 6.8.5
**Session Name:** Block-level agentPermissions
**Description:** Add `agent_permissions` (TernaryBoolean: `'true'`, `'false'`, `'override'`) to `block_instances`, same pattern as `differential`. Full stack: migration, model, versioning (if used), client types, transformer. Semantics: `true` = agents only; `false` = clients; `override` = admins can use regardless. Drives which blocks/features are visible or usable per role. Effective permission: state = (user role, block.agentPermissions); tooltips and permissions (Override constraints, Hold Slot, Force schedule) are variable and state-driven. Update Force Schedule and Override visibility (from 6.8.3/6.8.4) to respect agentPermissions when user role is available (Feature 7).

**Status:** Not Started

---

## Tasks

- [ ] #### Task 6.8.5.1: Migration — add agent_permissions column

**Goal:** Add `agent_permissions` column to `block_instances` using existing `ternary_boolean` ENUM, default `'false'`.

**Files:**
- **Server:** New migration in `server/src/db/migrations/`; reference `server/src/db/migrations/20260210_000001_baseline_schema.sql` (block_instances, `differential` column pattern).

**Approach:**
1. Create migration that adds `agent_permissions public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL` to `block_instances`.
2. Run migration; verify schema.

**Checkpoint:**
- Column exists; default is `'false'`; type is `ternary_boolean`.

---

- [ ] #### Task 6.8.5.2: Model and versioning

**Goal:** Add `agent_permissions` to Sequelize BlockInstance model and to instanceVersioning if block instances are versioned.

**Files:**
- **Server:** `server/src/db/models/booking/block_instance.ts` (add declare and attribute); `server/src/services/instanceVersioning.ts` (add to version data if applicable); `server/src/db/models/booking/block_instance_version.ts` if version table has the column.

**Approach:**
1. Add `agentPermissions` (or `agent_permissions` with field mapping) to BlockInstance model, type `'true' | 'false' | 'override'`.
2. If block instances use instanceVersioning, add to version diff and apply logic (same pattern as `differential`).

**Checkpoint:**
- Model includes agent_permissions; versioning tracks it if used.

---

- [ ] #### Task 6.8.5.3: Client types and transformer

**Goal:** Add `agentPermissions` to client BookingBlockInstance types and globalToBookingTransformer so wizard and admin UI can read it.

**Files:**
- **Client:** Types for booking block instance (e.g. in `client/src/utils/transformers/` or types); `globalToBookingTransformer.ts` (map from API response).

**Approach:**
1. Add `agentPermissions: 'true' | 'false' | 'override'` to the client-side block instance type used in booking flow.
2. In globalToBookingTransformer, map `agent_permissions` from API to `agentPermissions`.

**Checkpoint:**
- Client types and transformer include agentPermissions; confirmation step and Force Schedule/Override UI can consume it.

---

- [ ] #### Task 6.8.5.4: Force Schedule and Override visibility

**Goal:** Update Force Schedule and Override visibility logic to respect (user role, block.agentPermissions). Admin always allowed; agent when `'true'` or `'override'`; client when `'false'` or `'override'`. Tooltips and permissions (Override constraints, Hold Slot, Force schedule) driven by this state.

**Files:**
- **Client:** Composables or components that gate Force Schedule button and Override constraints (from Sessions 6.8.3/6.8.4); tooltips/permissions driven by state (wizard mode, user role, block.agentPermissions).

**Approach:**
1. Where Force Schedule and Override visibility are gated (e.g. by user role stub), add check: effective permission = (user role, block.agentPermissions). Use block.agentPermissions from transformed block data.
2. When Feature 7 provides user role, same logic applies; admins get override behavior.
3. Ensure tooltips and permission labels (Override constraints, Hold Slot, Force schedule) are variable and state-driven from this state.

**Checkpoint:**
- Visibility and tooltips respect block.agentPermissions; admins get override; logic documented.

---

## Session Workflow

### Before Starting a Session

Use `/session-start 6.8.5 [description]` to load handoff, session guide, and task context. Implement tasks in order; after each task run checkpoint and proceed to next or `/session-end 6.8.5`.

### Session Labeling Format

Label the session: **Session: 6.8.5 — Block-level agentPermissions**. Work tasks 6.8.5.1 → 6.8.5.4 in order.

---

## Reference

- **Phase guide:** `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md` (subsection “Block-level agentPermissions”)
- **Session planning:** `.project-manager/features/appointment-workflow/sessions/session-6.8.5-planning.md`
- **Existing pattern:** `differential` column in `server/src/db/models/booking/block_instance.ts` and baseline schema (ternary_boolean ENUM).

<!-- end excerpt session -->