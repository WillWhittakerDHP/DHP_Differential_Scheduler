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