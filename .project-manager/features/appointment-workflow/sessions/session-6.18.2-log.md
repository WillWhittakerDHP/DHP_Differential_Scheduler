# Session 6.18.2: Admin alignment — canonical roles ↔ user-type block instances


### Task 6.18.2.1: Task 6.18.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.2.2



## Completed Tasks

### Task 6.18.2.1: Task 6.18.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.2.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (20): `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md`, `server/src/config/app.ts`, `server/src/db/models/index.ts`, `server/src/db/models/sequelizeModelAssociationsPartA.ts`, `server/src/db/models/sequelizeModelAssociationsPartB.ts`, `server/src/db/models/sequelizeModelsBag.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/middlewares/ownershipRegistry.ts`, `server/src/routes/internal/index.ts`, `server/src/utils/userTypeMapping.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.18.2.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.18.2.1-planning.md`, `server/src/db/migrations/20260432_000057_create_user_role_block_alignments.mjs`, `server/src/db/models/admin/user_role_block_alignment.ts`, `server/src/repositories/userRoleBlockAlignmentRepository.ts`, `server/src/routes/internal/userRoleBlockAlignment/`, `server/src/routes/schemas/userRoleBlockAlignmentSchemas.ts`, `server/src/utils/validateUserRoleBlockAlignmentPayload.ts`

### `git diff --stat HEAD`

```text
.../appointment-workflow/across-ladder.json        |  2 +-
 .../sessions/session-6.18.2-guide.md               |  2 +-
 .../sessions/session-6.18.2-log.md                 | 18 ++++++++++
 server/src/config/app.ts                           |  1 +
 server/src/db/models/index.ts                      |  4 +++
 .../db/models/sequelizeModelAssociationsPartA.ts   |  5 ++-
 .../db/models/sequelizeModelAssociationsPartB.ts   |  5 ++-
 server/src/db/models/sequelizeModelsBag.ts         |  1 +
 server/src/middlewares/ownershipEnforcement.ts     |  8 +++++
 server/src/middlewares/ownershipRegistry.ts        |  6 ++++
 server/src/routes/internal/index.ts                |  3 ++
 server/src/utils/userTypeMapping.ts                | 40 ++++++++++++++++++++++
 12 files changed, 91 insertions(+), 4 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index d0adf873..d08c00cc 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-04-02T00:16:55.097Z",
+  "derivedAt": "2026-04-02T00:19:02.322Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
index 95b995f4..430db6ff 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 6.18.2.1: [Task Name]
+- [x] #### Task 6.18.2.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
index 11dca7c3..ada13a95 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
@@ -1,2 +1,20 @@
 # Session 6.18.2: Admin alignment — canonical roles ↔ user-type block instances
 
+
+### Task 6.18.2.1: Task 6.18.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.18.2.2
+
+
+
+## Completed Tasks
+
+### Task 6.18.2.1: Task 6.18.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.18.2.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/server/src/config/app.ts b/server/src/config/app.ts
index b85ec57a..e938e578 100644
--- a/server/src/config/app.ts
+++ b/server/src/config/app.ts
@@ -63,4 +63,5 @@ export const {
   BetaFeedbackTag,
   PropertyFieldMapping,
   PropertyFeatureMapping,
+  UserRoleBlockAlignment,
 } = models;
diff --git a/server/src/db/models/index.ts b/server/src/db/models/index.ts
index a665b4e2..14319f10 100644
--- a/server/src/db/models/index.ts
+++ b/server/src/db/models/index.ts
@@ -59,6 +59,7 @@ import { BetaFeedbackFactory } from "./beta/beta_feedback.js";
 import { BetaFeedbackTagFactory } from "./beta/beta_feedback_tag.js";
 import { PropertyFieldMappingFactory } from "./mappings/property_field_mapping.js";
 import { PropertyFeatureMappingFactory } from "./mappings/property_feature_mapping.js";
+import { UserRoleBlockAlignmentFactory } from "./admin/user_role_block_alignment.js";
 
 import { associateSequelizeModels } from "./sequelizeModelAssociations.js";
 export function initializeModels(sequelize: Sequelize) {
@@ -157,6 +158,7 @@ export function initializeModels(sequelize: Sequelize) {
   const BetaFeedbackTag = BetaFeedbackTagFactory(sequelize);
   const PropertyFieldMapping = PropertyFieldMappingFactory(sequelize);
   const PropertyFeatureMapping = PropertyFeatureMappingFactory(sequelize);
+  const UserRoleBlockAlignment = UserRoleBlockAlignmentFactory(sequelize);
 
   BetaFeedback.hasMany(BetaFeedbackTag, { foreignKey: 'feedbackId', as: 'tags' });
   PropertyFeatureMapping.belongsTo(BlockInstance, {
@@ -185,6 +187,7 @@ export function initializeModels(sequelize: Sequelize) {
     AdminMetadata, AdminMetadataSelectOption, AdminPrimitiveMetadata, AdminPrimitiveMetadataSelectOption,
     AdminRelationshipMetadata, AdminRelationshipMetadataSelectOption,
     BetaFeedback, BetaFeedbackTag, PropertyFieldMapping, PropertyFeatureMapping,
+    UserRoleBlockAlignment,
   })
 
   return {
@@ -224,5 +227,6 @@ export function initializeModels(sequelize: Sequelize) {
     BetaFeedbackTag,
     PropertyFieldMapping,
     PropertyFeatureMapping,
+    UserRoleBlockAlignment,
   };
 }
diff --git a/server/src/db/models/sequelizeModelAssociationsPartA.ts b/server/src/db/models/sequelizeModelAssociationsPartA.ts
index ba67dcfd..7f670bd0 100644
--- a/server/src/db/models/sequelizeModelAssociationsPartA.ts
+++ b/server/src/db/models/sequelizeModelAssociationsPartA.ts
@@ -61,8 +61,11 @@ export function associateSequelizeShapesAndEvents(m: SequelizeModelsBag): void {
     BetaFeedbackTag,
     PropertyFieldMapping,
     PropertyFeatureMapping,
+    UserRoleBlockAlignment,
   } = m
-PartShape.hasMany(PartInstance, { foreignKey: 'part_shape_ref', as: 'part_instances' });
+  void UserRoleBlockAlignment
+
+  PartShape.hasMany(PartInstance, { foreignKey: 'part_shape_ref', as: 'part_instances' });
   PartInstance.belongsTo(PartShape, { foreignKey: 'part_shape_ref', as: 'part_shape' });
 
   BlockShape.hasMany(BlockInstance, { foreignKey: 'block_shape_ref', as: 'block_instances' });
diff --git a/server/src/db/models/sequelizeModelAssociationsPartB.ts b/server/src/db/models/sequelizeModelAssociationsPartB.ts
index 3b77aae7..ae45d928 100644
--- a/server/src/db/models/sequelizeModelAssociationsPartB.ts
+++ b/server/src/db/models/sequelizeModelAssociationsPartB.ts
@@ -61,8 +61,11 @@ export function associateSequelizePropertyAdminAndAvailability(m: SequelizeModel
     BetaFeedbackTag,
     PropertyFieldMapping,
     PropertyFeatureMapping,
+    UserRoleBlockAlignment,
   } = m
-Address.hasMany(PropertyVersion, { foreignKey: 'address_id', as: 'propertyVersions' });
+  void UserRoleBlockAlignment
+
+  Address.hasMany(PropertyVersion, { foreignKey: 'address_id', as: 'propertyVersions' });
   PropertyVersion.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
   
   PropertyVersion.hasMany(PropertyDetails, { foreignKey: 'property_version_id', as: 'propertyDetails' });
diff --git a/server/src/db/models/sequelizeModelsBag.ts b/server/src/db/models/sequelizeModelsBag.ts
index 240c5b50..44f0522f 100644
--- a/server/src/db/models/sequelizeModelsBag.ts
+++ b/server/src/db/models/sequelizeModelsBag.ts
@@ -61,4 +61,5 @@ export type SequelizeModelsBag = {
   PropertyFeatureMapping: ModelCtor<Model>
   Session: ModelCtor<Model>
   MagicLink: ModelCtor<Model>
+  UserRoleBlockAlignment: ModelCtor<Model>
 }
diff --git a/server/src/middlewares/ownershipEnforcement.ts b/server/src/middlewares/ownershipEnforcement.ts
index 44ac00b2..d052f448 100644
--- a/server/src/middlewares/ownershipEnforcement.ts
+++ b/server/src/middlewares/ownershipEnforcement.ts
@@ -324,6 +324,14 @@ async function handleSpecialResource(
   if (resourceName === 'businessSetting') {
     return handleBusinessSetting(paramKey, req, res, logger)
   }
+  if (resourceName === 'userRoleBlockAlignment') {
+    const rawId = readParam(req, paramKey)
+    if (rawId !== undefined) {
+      sendNotFound(res, RESOURCE_NOT_FOUND)
+      return false
+    }
+    return handleSingletonAdminSetting(req, res, logger)
+  }
   if (resourceName === 'calendarSetting' || resourceName === 'wizardSetting') {
     const rawId = readParam(req, paramKey)
     if (rawId === undefined) {
diff --git a/server/src/middlewares/ownershipRegistry.ts b/server/src/middlewares/ownershipRegistry.ts
index 1a3dcb1d..e560892e 100644
--- a/server/src/middlewares/ownershipRegistry.ts
+++ b/server/src/middlewares/ownershipRegistry.ts
@@ -37,6 +37,7 @@ const OWNERSHIP_RESOURCE_NAMES = [
   'property field mapping',
   'propertyType',
   'user',
+  'userRoleBlockAlignment',
   'wizardSetting',
 ] as const
 
@@ -102,6 +103,11 @@ const OWNERSHIP_REGISTRY: Record<OwnershipResourceName, OwnershipRegistryEntry>
     owner: { mode: 'row_pk_is_user' },
     notes: 'Users may only mutate their own row: `row.id === req.user.id`.',
   },
+  userRoleBlockAlignment: {
+    kind: 'special',
+    reason:
+      'Singleton `user_role_block_alignments` — internal staff only (same as calendar/wizard singleton PUT).',
+  },
   wizardSetting: {
     kind: 'special',
     reason: 'Singleton `wizard_settings` — same 
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
