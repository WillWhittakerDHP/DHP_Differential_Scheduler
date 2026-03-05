# Session 6.7.2 Guide: Admin UI — display scheduled_by; includeScheduledBy toggle in event instances

**Purpose:** Session-level guide with task breakdown.
**Tier:** Session

---

## Quick Start

### Session Overview

**Session ID:** 6.7.2
**Session Name:** Admin UI — display scheduled_by; includeScheduledBy toggle in event instances
**Description:** Show scheduled_by in appointment details; add includeScheduledBy (metadata visibility) in event instances section.

**Duration:** [Estimated hours/days]
**Status:** Complete

### Tasks

- [x] #### Task 6.7.2.1: Display scheduled_by in appointment details

**Goal:** Show who scheduled the appointment in admin appointment details (scheduled_by id and/or display name).

**Files:**
- Admin appointment details view/component; API or transformer if needed for scheduler name; client types if new fields.

**Approach:** Use existing or new API shape to expose scheduled_by (and optional display name); add display in admin appointment details following existing detail patterns.

**Checkpoint:** Admin can see who scheduled each appointment in the details view.

- [x] #### Task 6.7.2.2: Add includeScheduledBy toggle in event instances

**Goal:** Add a toggle in the event instances section (e.g. Instance Fields modal) to control whether scheduled-by is included in event instance display/export.

**Files:**
- `client/src/views/admin/tabs/components/EventInstancesSection.vue`, `client/src/composables/admin/useEventInstancesSection.ts`; `client/src/configs/field/form/appliedForm/eventInstanceFields.ts`; admin_metadata (migration).

**Approach:** Add scheduledBy to event instance metadata and primitive field config; visibility in Instance Fields modal controls inclusion. Follow metadata-driven field visibility.

**Checkpoint:** Toggle (visibility) is visible in Instance Fields modal and persists via metadata; event instances display/export can respect includeScheduledBy when migration is run.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 6.7.2 [description]` to load handoff, guide, and task context.

### During Session

1. Work on one task at a time.
2. Document decisions inline in code.
3. After each task run `/task-end` and cascade to next or session-end.

### After Session

Run `/session-end 6.7.2`; verify app starts and lint passes; update handoff; push when ready.

---

## Phase intent (goals and context)

**Warning: Feature guide not found or phase 6.7 not listed.** Planning will proceed with minimal context.

- [x] ### Session 6.7.1: Backend — set scheduled_by_id on create from req.user

**Description:** Set scheduled_by_id on appointment create from req.user; block client override.

**Tasks:** 6.7.1.1 (set in create path + block override)
**Focus:** Server create handler, sanitize/request body.

- [ ] ### Session 6.7.2: Admin UI — display scheduled_by; includeScheduledBy toggle in event instances

**Description:** Show scheduled_by in appointment details; add includeScheduledBy toggle in event instances section.

**Tasks:** 6.7.2.1 (display scheduled_by in appointment details), 6.7.2.2 (includeScheduledBy toggle in event instances)
**Focus:** Admin appointment details view; EventInstancesSection / Instance Fields (toggle).

## Session intent from phase guide

- [ ] ### Session 6.7.2: Admin UI — display scheduled_by; includeScheduledBy toggle in event instances

**Description:** Show scheduled_by in appointment details; add includeScheduledBy toggle in event instances section.

**Tasks:** 6.7.2.1 (display scheduled_by in appointment details), 6.7.2.2 (includeScheduledBy toggle in event instances)
**Focus:** Admin appointment details view; EventInstancesSection / Instance Fields (toggle).

- [x] #### Task 6.7.2.1: Display scheduled_by in appointment details

**Goal:** Show who scheduled the appointment in admin appointment details (scheduled_by id and/or display name).

**Files:**
- Admin appointment details view/component; API or transformer if needed for scheduler name; client types if new fields.

**Approach:** Use existing or new API shape to expose scheduled_by (and optional display name); add display in admin appointment details following existing detail patterns.

**Checkpoint:** Admin can see who scheduled each appointment in the details view.

- [x] #### Task 6.7.2.2: Add includeScheduledBy toggle in event instances

**Goal:** Add a toggle in the event instances section (e.g. Instance Fields modal or event instances UI) to control whether scheduled-by is included in event instance display/export.

**Files:**
- `client/src/views/admin/tabs/components/EventInstancesSection.vue`, `client/src/composables/admin/useEventInstancesSection.ts`; possibly `client/src/configs/field/form/appliedForm/eventInstanceFields.ts` or display config if the toggle drives which fields are shown.

**Approach:** Add includeScheduledBy state (e.g. in InstancesTab context or useEventInstancesSection); expose as a toggle in the Event Instances UI (e.g. next to "Instance Fields" or inside the Instance Fields modal); when enabled, include scheduled_by in event instance display/export. Follow existing toggle patterns (e.g. eventInstanceMetadataModalOpen).

**Checkpoint:** Toggle is visible and persists preference; event instances display/export respects includeScheduledBy.

<!-- end excerpt session -->