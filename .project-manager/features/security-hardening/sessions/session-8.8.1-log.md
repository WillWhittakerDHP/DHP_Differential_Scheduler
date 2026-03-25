# Session 8.8.1: ** Create Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models; wire `validateRequest` callbacks into all three CRUD router configs; run server lint; update GC-8-JOI checklist


### Task 8.8.1.1: Task 8.8.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.8.1.2



## Completed Tasks

### Task 8.8.1.1: Task 8.8.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.8.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/security-hardening/across-ladder.json`, `.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md`, `.project-manager/features/security-hardening/sessions/session-8.8.1-log.md`, `server/src/routes/schemas/userSchemas.ts`, `.project-manager/features/security-hardening/sessions/task-8.8.1.1-handoff.md`, `.project-manager/features/security-hardening/sessions/task-8.8.1.1-planning.md`, `server/src/routes/schemas/propertyMappingSchemas.ts`

### `git diff --stat HEAD`

```text
.../features/security-hardening/across-ladder.json |  2 +-
 .../sessions/session-8.8.1-guide.md                |  2 +-
 .../sessions/session-8.8.1-log.md                  | 18 +++++++
 server/src/routes/schemas/userSchemas.ts           | 57 ++++++++++++----------
 4 files changed, 51 insertions(+), 28 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/security-hardening/across-ladder.json b/.project-manager/features/security-hardening/across-ladder.json
index ba05673c..a926d4b6 100644
--- a/.project-manager/features/security-hardening/across-ladder.json
+++ b/.project-manager/features/security-hardening/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "security-hardening",
-  "derivedAt": "2026-03-25T20:08:39.698Z",
+  "derivedAt": "2026-03-25T20:11:53.440Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "8.1",
diff --git a/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md b/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
index c7f31890..d58abb01 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
@@ -43,7 +43,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 8.8.1.1: Create Joi schema files
+- [x] #### Task 8.8.1.1: Create Joi schema files
 **Goal:** Define Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping (create/update/patch per model)
 **Files:** 
 - `server/src/routes/schemas/userSchemas.ts` (new)
diff --git a/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md b/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
index 77b0899e..108bb07f 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
@@ -1,2 +1,20 @@
 # Session 8.8.1: ** Create Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models; wire `validateRequest` callbacks into all three CRUD router configs; run server lint; update GC-8-JOI checklist
 
+
+### Task 8.8.1.1: Task 8.8.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 8.8.1.2
+
+
+
+## Completed Tasks
+
+### Task 8.8.1.1: Task 8.8.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 8.8.1.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/server/src/routes/schemas/userSchemas.ts b/server/src/routes/schemas/userSchemas.ts
index 358cb4bd..f0f0a92f 100644
--- a/server/src/routes/schemas/userSchemas.ts
+++ b/server/src/routes/schemas/userSchemas.ts
@@ -1,41 +1,46 @@
 /**
- * Joi schemas for user CRUD routes.
- * Mirrors User model fields from db/models/participantModels/Users.ts.
+ * Joi schemas for User CRUD (`createCrudRouter` validateRequest).
+ * Aligns with `Users` model: first_name, last_name, email, user_role, phone, login_id.
  */
 
 import Joi from 'joi'
 
-const userRoleValues = ['client', 'agent', 'transaction_manager', 'seller', 'inspector'] as const
+const USER_ROLE_VALUES = [
+  'client',
+  'agent',
+  'transaction_manager',
+  'seller',
+  'inspector',
+] as const
 
-/** POST /users: requires firstName, lastName, email, userRole. */
-export const userCreateBodySchema = Joi.object({
-  firstName: Joi.string().required(),
-  lastName: Joi.string().required(),
-  email: Joi.string().email().required(),
+const userMutableFields = {
+  firstName: Joi.string().trim().min(1).required(),
+  lastName: Joi.string().trim().min(1).required(),
+  email: Joi.string().trim().email().required(),
   phone: Joi.string().allow(null, '').optional(),
   userRole: Joi.string()
-    .valid(...userRoleValues)
+    .valid(...USER_ROLE_VALUES)
     .required(),
-}).required()
+  loginId: Joi.number().integer().allow(null).optional(),
+}
 
-/** PUT /users/:id: at least one field required. */
-export const userUpdateBodySchema = Joi.object({
-  firstName: Joi.string().optional(),
-  lastName: Joi.string().optional(),
-  email: Joi.string().email().optional(),
-  phone: Joi.string().allow(null, '').optional(),
-  userRole: Joi.string()
-    .valid(...userRoleValues)
-    .optional(),
-}).min(1).required()
+/** POST /users */
+export const userCreateBodySchema = Joi.object(userMutableFields).unknown(true).required()
+
+/** PUT /users/:id — full replace semantics; same required fields as create. */
+export const userUpdateBodySchema = Joi.object(userMutableFields).unknown(true).required()
 
-/** PATCH /users/:id: at least one field required. */
+/** PATCH /users/:id — partial update; at least one field. */
 export const userPatchBodySchema = Joi.object({
-  firstName: Joi.string().optional(),
-  lastName: Joi.string().optional(),
-  email: Joi.string().email().optional(),
+  firstName: Joi.string().trim().min(1).optional(),
+  lastName: Joi.string().trim().min(1).optional(),
+  email: Joi.string().trim().email().optional(),
   phone: Joi.string().allow(null, '').optional(),
   userRole: Joi.string()
-    .valid(...userRoleValues)
+    .valid(...USER_ROLE_VALUES)
     .optional(),
-}).min(1).required()
+  loginId: Joi.number().integer().allow(null).optional(),
+})
+  .min(1)
+  .unknown(true)
+  .required()
```
<!-- /harness:anchor:commit-preview -->
