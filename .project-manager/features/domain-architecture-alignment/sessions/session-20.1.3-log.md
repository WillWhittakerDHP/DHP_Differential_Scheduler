# Session 20.1.3: ** Event schema alignment -- migration: ADD `placement_kind`, `anchor_edge` to `event_shapes`, DROP `differential_role`, move `include_reschedule_link`/`include_cancel_link` to `event_instances`; ADD `parent_block_instance_id` + location fields to `event_instances`; rename `event_shape_attendees` -> `event_instance_attendees`; seed default placement types (§2.2); update Sequelize models + client types.


### Task 20.1.3.1: Task 20.1.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.3.2



## Completed Tasks

### Task 20.1.3.1: Task 20.1.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.3.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (44): `.project-manager/PROJECT_PLAN.md`, `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md`, `client/src/composables/admin/useInstancesTab.ts`, `client/src/composables/admin/useShapesTab.ts`, `client/src/composables/booking/useAppointmentShape.ts`, `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, `client/src/constants/entityFieldConstants.ts`, `client/src/constants/relationships.ts`, `client/src/types/entities.ts`, `client/src/utils/admin/selectFieldValueResolution.ts`, `client/src/utils/admin/selectHandlersNormalization.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/utils/booking/appointmentShapeEventAttendees.ts`, `client/src/utils/booking/cascadeFilterPipeline.ts`, `client/src/utils/transformers/apiEntityFieldNormalization.ts`, `client/src/utils/transformers/entityTransformers.ts`, `client/src/utils/transformers/fetchToGlobalTransformer.ts`, `server/.env.example`, `server/src/config/app.ts`, `server/src/db/models/booking/appointment_attendee.ts`, `server/src/db/models/booking/event_instance.ts`, `server/src/db/models/booking/event_shape.ts`, `server/src/db/models/booking/event_shape_attendee.ts`, `server/src/db/models/index.ts`, `server/src/db/models/sequelizeModelAssociationsPartA.ts`, `server/src/db/models/sequelizeModelAssociationsPartB.ts`, `server/src/db/models/sequelizeModelsBag.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/middlewares/security.ts`, `server/src/routes/internal/appointments/appointmentCrudRouter.ts`, `server/src/routes/internal/entities/entityConstants.ts`, `server/src/routes/internal/entities/entitySanitizers.ts`, `server/src/routes/internal/relationships/relationshipConstants.ts`, `server/src/routes/internal/relationships/relationshipHelpersMapping.ts`, `server/src/routes/internal/relationships/relationshipHelpersValidation.ts`, `server/src/services/invites/eventInstancePreviewService.ts`, `server/src/services/invites/inviteAttendeeHelpers.ts`, `server/src/services/invites/inviteOrchestrationService.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.3.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.3.1-planning.md`, `server/src/db/migrations/20260432_000061_event_schema_placement_instance_attendees.mjs`, `server/src/db/models/booking/event_instance_attendee.ts`

### `git diff --stat HEAD`

```text
.project-manager/PROJECT_PLAN.md                   |   8 ++
 .../across-ladder.json                             |   2 +-
 .../sessions/session-20.1.3-guide.md               |   2 +-
 .../sessions/session-20.1.3-log.md                 |  18 ++++
 client/src/composables/admin/useInstancesTab.ts    |   3 +
 client/src/composables/admin/useShapesTab.ts       |   6 +-
 .../src/composables/booking/useAppointmentShape.ts |   6 +-
 .../display/appliedDisplay/eventShapeDisplays.ts   |  19 ++--
 client/src/constants/entityFieldConstants.ts       |   2 +
 client/src/constants/relationships.ts              |   4 +-
 client/src/types/entities.ts                       |  26 +++--
 .../src/utils/admin/selectFieldValueResolution.ts  |   4 +-
 .../src/utils/admin/selectHandlersNormalization.ts |   5 +-
 client/src/utils/blockInstanceUtils.ts             |  26 ++++-
 .../booking/appointmentShapeEventAttendees.ts      |  53 +++++----
 client/src/utils/booking/cascadeFilterPipeline.ts  |  17 ++-
 .../transformers/apiEntityFieldNormalization.ts    |  21 ----
 .../src/utils/transformers/entityTransformers.ts   |  28 ++++-
 .../utils/transformers/fetchToGlobalTransformer.ts |   2 +-
 server/.env.example                                |   3 +
 server/src/config/app.ts                           |   2 +-
 .../src/db/models/booking/appointment_attendee.ts  |   2 +-
 server/src/db/models/booking/event_instance.ts     |  62 +++++++++++
 server/src/db/models/booking/event_shape.ts        |  68 +++++-------
 .../src/db/models/booking/event_shape_attendee.ts  | 119 ---------------------
 server/src/db/models/index.ts                      |   8 +-
 .../db/models/sequelizeModelAssociationsPartA.ts   |  21 ++--
 .../db/models/sequelizeModelAssociationsPartB.ts   |   3 +-
 server/src/db/models/sequelizeModelsBag.ts         |   2 +-
 server/src/middlewares/ownershipEnforcement.ts     |   2 +-
 server/src/middlewares/security.ts                 |  39 ++++++-
 .../internal/appointments/appointmentCrudRouter.ts |  65 +++++++----
 .../routes/internal/entities/entityConstants.ts    |   4 +
 .../routes/internal/entities/entitySanitizers.ts   |  25 +++--
 .../relationships/relationshipConstants.ts         |   6 +-
 .../relationships/relationshipHelpersMapping.ts    |   2 +-
 .../relationships/relationshipHelpersValidation.ts |  10 +-
 .../invites/eventInstancePreviewService.ts         |  13 ++-
 .../src/services/invites/inviteAttendeeHelpers.ts  |  30 +++---
 .../services/invites/inviteOrchestrationService.ts |  27 +++--
 40 files changed, 421 insertions(+), 344 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/PROJECT_PLAN.md b/.project-manager/PROJECT_PLAN.md
index 502c7aa0..4beec54d 100644
--- a/.project-manager/PROJECT_PLAN.md
+++ b/.project-manager/PROJECT_PLAN.md
@@ -519,6 +519,14 @@ Implement the following so that authenticated users and roles are used where oth
 
 > **Steps 1–5 are independent of Feature 7** and can be done now. Steps 6–7 require working sessions/auth and align with Feature 7's Enactment phase.
 
+### Follow-up: appointment version snapshots access (`GET …/appointments/:id/versions`)
+
+**Current behavior (wizard / domain work):** This route uses `requireAuth`. By default, **`requireAuthThenStaffOrOwnership('appointment','id')`** allows internal staff roles (agent, admin, transaction_manager, owner) to read version payloads for any appointment id; non-staff still require `scheduledById === req.user.id` (registry ownership).
+
+**Temporary escape hatch:** `RELAX_APPOINTMENT_VERSIONS_OWNERSHIP=true` skips the ownership/staff-or-owner step so **any authenticated user** can call the endpoint for any id. Documented in `server/.env.example`. Intended only for local debugging; **do not leave enabled in production**.
+
+**Revisit before release:** Remove `RELAX_APPOINTMENT_VERSIONS_OWNERSHIP` from all deployed envs; confirm product policy (org scoping, audit logging, whether customers may ever need this route without being `scheduledById`). Adjust middleware or split public vs internal paths if requirements change.
+
 ### Related Documents
 - **Checklist:** `../../LAUNCH_CHECKLIST.md` Phase 2
 
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index e760bbf9..3b55ad0d 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T15:41:18.276Z",
+  "derivedAt": "2026-04-02T15:46:25.726Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
index a524f055..8452f43c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.1.3.1: Event DDL, seeds, and core models/types
+- [x] #### Task 20.1.3.1: Event DDL, seeds, and core models/types
 **Goal:** Migrations add/drop/rename columns and tables; Sequelize + `app.js` exports + associations match; client `EventShapeEntity` / `EventInstanceEntity` and transformers/sanitizers reflect new fields; no stale model references to dropped shape columns.
 **Files:**
 - `server/src/db/migrations/*.mjs`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
index 3014e06c..002f4508 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
@@ -1,2 +1,20 @@
 # Session 20.1.3: ** Event schema alignment -- migration: ADD `placement_kind`, `anchor_edge` to `event_shapes`, DROP `differential_role`, move `include_reschedule_link`/`include_cancel_link` to `event_instances`; ADD `parent_block_instance_id` + location fields to `event_instances`; rename `event_shape_attendees` -> `event_instance_attendees`; seed default placement types (§2.2); update Sequelize models + client types.
 
+
+### Task 20.1.3.1: Task 20.1.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.3.2
+
+
+
+## Completed Tasks
+
+### Task 20.1.3.1: Task 20.1.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.3.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/composables/admin/useInstancesTab.ts b/client/src/composables/admin/useInstancesTab.ts
index 78d3ac33..d4b8b5dd 100644
--- a/client/src/composables/admin/useInstancesTab.ts
+++ b/client/src/composables/admin/useInstancesTab.ts
@@ -167,6 +167,9 @@ export function useInstancesTab(): UseInstancesTabReturn {
     colorId: null,
     status: 'confirmed',
     reminderOverrides: null,
+    includeRescheduleLink: true,
+    includeCancelLink: true,
+    parentBlockInstanceId: null,
     scheduledBy: null,
   }))
 
diff --git a/client/src/composables/admin/useShapesTab.ts b/client/src/composables/admin/useShapesTab.ts
index 1601c130..ae1a8289 100644
--- a/client/src/composables/admin/useShapesTab.ts
+++ b/client/src/composables/admin/useShapesTab.ts
@@ -190,9 +190,9 @@ export function useShapesTab(): UseShapesTabReturn {
     entityKey: 'eventShape',
     orderIndex: 0,
     active: true,
-    differentialRole: 'none',
-    includeRescheduleLink: true,
-    includeCancelLink: true,
+    placementKind: 'primary',
+    anchorEdge: null,
+    differentialRole: 'major',
   }))
 
   return {
diff --git a/client/src/composables/booking/useAppointmentShape.ts b/client/src/composables/booking/useAppointmentShape.ts
index 35f2ee87..441188e4 100644
--- a/client/src/composables/booking/useAppointmentShape.ts
+++ b/client/src/composables/booking/useAppointmentShape.ts
@@ -79,7 +79,11 @@ export function useAppointmentShape(params: UseAppointmentShapeParams): UseAppoi
         rawAttendeeAssignments !== undefined && rawAttendeeAssignments !== null ? rawAttendeeAssignments : []
       ) as GlobalRelationship[]
 
-      eventShapes = mergeAttendeesIntoEventShapes(eventShapes, attendeeAssignmentsRelationships)
+      eventShapes = mergeAttendeesIntoEventShapes(
+        eventShapes,
+        eventInstances,
+        attendeeAssignmentsRelationships
+      )
 
       const partShapes = getGlobalEntities('partShape')
       const partShapeById = new Map(partShapes.map((ps) => [ps.id, ps as GlobalEntity<'partShape'>]))
diff --git a/client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts b/client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts
index 7ba20032..2bbfad92 100644
--- a/client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts
+++ b/client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts
@@ -30,23 +30,16 @@ export const eventShapeDisplays = {
     stacked: false,
   },
 
-  differentialRole: {
-    label: "Differential role",
-    placeholder: "Select scheduling role (or none)",
+  placementKind: {
+    label: 'Placement kind',
+    placeholder: 'primary | secondary | marginal | floating',
     inline: true,
     stacked: false,
   },
 
-  includeRescheduleLink: {
-    label: "Include reschedule link",
-    placeholder: "Show {rescheduleLink} in calendar invite templates",
-    inline: true,
-    stacked: false,
-  },
-
-  includeCancelLink: {
-    label: "Include cancel link",
-    placeholder: "Show {cancelLink} in calendar invite templates",
+  anchorEdge: {
+    label: 'Anchor edge',
+    placeholder: 'start | end (omit for primary)',
     inline: true,
     stacked: false,
   },
diff --git a/client/src/constants/entityFieldConstants.ts b/client/src/constants/entityFieldConstants.ts
index 704cd0e6..bd70b0d5 100644
--- a/client/src/constants/entityFieldConstants.ts
+++ b/client/src/constants/entityFieldConstants.ts
@@ -10,6 +10,8 @@ export const FIELD_NAMES = {
   ANNOTATIONS: 'annotations',
   /** Matches server entityConstants FIELD_NAMES.DIFFERENTIAL_ROLE (event shape / API). */
   DIFFERENTIAL_ROLE: 'differentialRole',
+  PLACEMENT_KIND: 'placementKind',
+  ANCHOR_EDGE: 'anchorEdge',
 } as const
 
 export const TEMPORARY_ID_PATTERNS = {
diff -
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
