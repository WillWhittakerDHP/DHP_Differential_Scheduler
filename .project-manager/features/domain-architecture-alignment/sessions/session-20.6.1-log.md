# Session 20.6.1 Log: Admin metadata stack removal (server + client API)

**Status:** In Progress
**Date:** 2026-04-03

---

## Session Goal

[Document concrete session goal]

### Task 20.6.1.1: Task 20.6.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.1.2



## Completed Tasks

### Task 20.6.1.1: Task 20.6.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (54): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md`, `client/src/components/admin/MetadataEditModal.vue`, `client/src/components/admin/generic/EntityCardContent.vue`, `client/src/components/admin/generic/fields/FieldRenderer.vue`, `client/src/components/admin/generic/fields/PrimitiveInputs.vue`, `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue`, `client/src/composables/admin/useAdmin.ts`, `client/src/composables/admin/useAdminMetadataMutations.ts`, `client/src/composables/admin/useBaseCollectionFieldCore.ts`, `client/src/composables/admin/useFieldContextManager.ts`, `client/src/composables/admin/useFieldRendererErrorWatch.ts`, `client/src/composables/admin/useInstancesTab.ts`, `client/src/composables/admin/useMetadataCache.ts`, `client/src/composables/admin/useMetadataEditModal.ts`, `client/src/composables/admin/useMetadataFieldDrag.ts`, `client/src/composables/admin/usePrimitiveMetadataSave.ts`, `client/src/composables/admin/useShapeEditModal.ts`, `client/src/composables/admin/useShapesTab.ts`, `client/src/composables/admin/useShapesTabModals.ts`, `client/src/composables/admin/useStatusButtonToggle.ts`, `client/src/constants/adminPrimitiveMetadataOptions.ts`, `client/src/router/index.ts`, `client/src/types/admin/adminInjectionKeys.ts`, `client/src/types/admin/fieldMetadataMutationVariables.ts`, `client/src/types/admin/instancesTab.ts`, `client/src/types/admin/metadataModalHandlers.ts`, `client/src/types/admin/shapeEditModal.ts`, `client/src/types/admin/shapesTab.ts`, `client/src/types/metadataEditorProps.ts`, `client/src/utils/admin/adminMetadataSaveRequest.ts`, `client/src/utils/api/adminMetadataApi.ts`, `client/src/utils/api/apiExportBundleB.ts`, `client/src/utils/fieldContext/fieldContextDisplayConfigGuard.ts`, `client/src/utils/forms/formFieldsMetadataWarningResolution.ts`, `client/src/views/admin/tabs/InstancesTab.vue`, `client/src/views/admin/tabs/ShapesTab.vue`, `client/src/views/admin/tabs/components/BlockInstancesGroup.vue`, `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue`, `client/src/views/admin/tabs/components/ShapesTabBlockPanel.vue`, `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue`, `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.1.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.1.1-planning.md`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `client/src/utils/admin/codeFirstSelectInputConfigs.ts`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          |  33 +++
 .../across-ladder.json                             |  28 +-
 .../feature-domain-architecture-alignment-guide.md |   6 +
 .../phases/phase-20.6-guide.md                     |  51 +++-
 client/src/components/admin/MetadataEditModal.vue  | 111 -------
 .../components/admin/generic/EntityCardContent.vue |   2 +-
 .../admin/generic/fields/FieldRenderer.vue         |   5 +-
 .../admin/generic/fields/PrimitiveInputs.vue       |   2 +-
 .../metadata/AdminPrimitiveMetadataEditor.vue      | 322 ---------------------
 client/src/composables/admin/useAdmin.ts           |   2 +-
 .../composables/admin/useAdminMetadataMutations.ts |  55 ----
 .../admin/useBaseCollectionFieldCore.ts            |   2 +-
 .../composables/admin/useFieldContextManager.ts    |   2 +-
 .../admin/useFieldRendererErrorWatch.ts            |   2 +-
 client/src/composables/admin/useInstancesTab.ts    |  14 -
 client/src/composables/admin/useMetadataCache.ts   |  61 +---
 .../src/composables/admin/useMetadataEditModal.ts  |  34 ---
 .../src/composables/admin/useMetadataFieldDrag.ts  |  49 ----
 .../composables/admin/usePrimitiveMetadataSave.ts  |  91 ------
 client/src/composables/admin/useShapeEditModal.ts  |  36 ---
 client/src/composables/admin/useShapesTab.ts       |  47 +--
 client/src/composables/admin/useShapesTabModals.ts |  94 ------
 .../src/composables/admin/useStatusButtonToggle.ts |   4 -
 .../src/constants/adminPrimitiveMetadataOptions.ts |  38 ---
 client/src/router/index.ts                         |  31 --
 client/src/types/admin/adminInjectionKeys.ts       |   2 -
 .../types/admin/fieldMetadataMutationVariables.ts  |  24 --
 client/src/types/admin/instancesTab.ts             |   2 -
 client/src/types/admin/metadataModalHandlers.ts    |   9 -
 client/src/types/admin/shapeEditModal.ts           |  11 -
 client/src/types/admin/shapesTab.ts                |  10 +-
 client/src/types/metadataEditorProps.ts            |  11 -
 client/src/utils/admin/adminMetadataSaveRequest.ts |  75 -----
 client/src/utils/api/adminMetadataApi.ts           |   8 -
 client/src/utils/api/apiExportBundleB.ts           |   1 -
 .../fieldContext/fieldContextDisplayConfigGuard.ts |   2 +-
 .../forms/formFieldsMetadataWarningResolution.ts   |  12 +-
 client/src/views/admin/tabs/InstancesTab.vue       |  24 +-
 client/src/views/admin/tabs/ShapesTab.vue          |  98 +------
 .../admin/tabs/components/BlockInstancesGroup.vue  |   9 -
 .../tabs/components/ShapesTabAnnotationPanel.vue   |  20 --
 .../admin/tabs/components/ShapesTabBlockPanel.vue  |  10 -
 .../admin/tabs/components/ShapesTabEventPanel.vue  |  20 --
 .../admin/tabs/components/ShapesTabPartPanel.vue   |  20 --
 44 files changed, 141 insertions(+), 1349 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index 7fc22ce5..4d26fcc3 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -3653,3 +3653,36 @@ Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application w
 
 - **Suggestion:** (1) Playbook note: phase-end **requires tier-quality pass**, not only “no FAIL” in the summary table. (2) Dedupe autofix directives by **`auditName` + location**. (3) Optional: retry **`typecheck:audit`** when errors contradict manual **`vue-tsc`**. (4) Enforce **`## Next Action`** on phase handoff materialization.
 
+
+### 2026-04-03 — 20.6.1 — session — start — validation_failed
+
+- **reasonCodeRaw:** validation_failed
+- **reasonCodeNormalized:** validation_failed
+- **isFailureReason:** true
+- **tier:** session
+- **action:** start
+- **identifier:** 20.6.1
+- **featureName:** domain-architecture-alignment
+- **stepPath:** header_branch, validate
+
+- **Symptom:** Harness start failed (reasonCode=validation_failed).
+- **Context:** tier=session; identifier=20.6.1; featureName=domain-architecture-alignment
+
+nextAction:
+## Session Validation
+# Session 20.6.1 Validation
+
+✅ **Status:** Ready to start
+
+## Details
+
+- Session 20.6.1 is not completed
+- Work stays on feature branch feature/domain-architecture-alignment
+- This is the first session in the phase
+- Phase 20.6 is not complete
+- Ready to start with /session-start 20.6.1
+
+## TierUp Context Required
+- Phase guide has no session entry for this session (tierUp context required).
+
+Ensure phase guide has a session entry for this session and phase handoff exists, then re-run /session-start.
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index abde6112..9a0d2d30 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,8 +1,8 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-03T01:28:24.533Z",
-  "sourceTier": "phase_end",
+  "derivedAt": "2026-04-03T12:41:20.139Z",
+  "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
     "20.2",
@@ -12,9 +12,9 @@
     "20.6"
   ],
   "phaseAcrossTotal": 6,
-  "focusPhaseId": "20.5",
-  "nextPhaseAcross": "20.6",
-  "prevPhaseId": "20.4",
+  "focusPhaseId": "20.6",
+  "nextPhaseAcross": null,
+  "prevPhaseId": "20.5",
   "sessionsByPhase": {
     "20.1": [
       "20.1.1",
@@ -44,12 +44,18 @@
       "20.5.1",
       "20.5.2",
       "20.5.3"
+    ],
+    "20.6": [
+      "20.6.1",
+      "20.6.2",
+      "20.6.3",
+      "20.6.4"
     ]
   },
-  "focusSessionId": null,
-  "sessionAcrossTotal": null,
-  "sessionIndex0Based": null,
-  "nextSessionAcross": null,
-  "taskAcrossTotal": null,
-  "nextTaskAcross": null
+  "focusSessionId": "20.6.1",
+  "sessionAcrossTotal": 4,
+  "sessionIndex0Based": 0,
+  "nextSessionAcross": "20.6.2",
+  "taskAcrossTotal": 2,
+  "nextTaskAcross": "20.6.1.1"
 }
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
index 8d34a051..bdd62ae3 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
@@ -60,6 +60,12 @@ Phase 20.4: Pass 4 — Booking pipeline alignment
 Phase 20.5: Pass 5 — Migration planning and data conversion  
 Phase 20.6: Pass 6 — Rollout and cleanup  
 
+## Phase 20.6
+
+**Pass 6 — Rollout and cleanup** (`FEATURE_20_ARCHITECTURE_REDESIGN.md` **§8.6**): incremental rollout of domain editors; remove differential-role and other legacy paths only **after** replacements are proven; delete the **`EntityCard`** tree and the **full admin metadata stack** (DB tables, routes, client prefetch/mutation) per **§6.3a** and the **Pass 5** retirement ordering in **`DOMAIN_REWRITE_WORKLOG.md`**; complete **§9.3 / §9.4** review-gate artifacts before any canonical doc promotion or filename consolidation.
+
+**Phase guide:** [phases/phase-20.6-guide.md](./phases/phase-20.6-guide.md)
+
 ---
 
 ## Phase 20.0 (governance — no separate guide required initially)
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md
index eafa4834..482a9dd2 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md
@@ -62,7 +62,7 @@ Acceptance checks:
 **Phase Number:** 20.6
 **Phase Name:** Pass 6 — Rollout, cleanup, doc promotion (§8.6).
 **Description:** Incremental rollout of domain editors; delete differential-role and legacy admin code; **remove the full admin metadata stack** (per §6.3a) after cutover; review gate before doc promotion.
-**Status:** Not Started
+**Status:** In progress — session **20.6.1** first; follow **`phase-20.6-planning.md`** decomposition
 
 ---
 
@@ -74,6 +74,53 @@ Acceptance checks:
 
 ---
 
+## Sessions breakdown
+
+| Session | Focus |
+|--------|--------|
+| **20.6.1** | Admin metadata stack removal — server models/routes/migrations + client **`admin-metadata`** API usage (per **§6.3a** + worklog ordering). |
+| **20.6.2** | **EntityCard** tree and façade consumers per **`ENTITY_CARD_CONSUMERS_20.6.md`**. |
+| **20.6.3** | Differential-role + event-shape / event-instance legacy remnants (**§8.6** grouping). |
+| **20.6.4** | Review gate, **`ARCHITECTURE.md`** / handoffs, **`/feature-end`** readiness. |
+
+**Harness order:** `/session-start 20.6.1` → … → `/session-end` each → `/phase-end 20.6` when all sessions complete.
+
+---
+
 ## Tasks
 
-Sessions and tasks for this phase. [See Sessions Breakdown below.] Defer detailed session IDs until `/phase-start 20.6`; trace execution to **FEATURE_20 §6.3a** deletion inventory and **DOMAIN_REWRITE_WORKLOG** Pass 5 narrative for metadata ordering.
+Session guides/logs are created at **`/session-start`**. Trace execution to **FEATURE_20 §6.3a** and **`DOMAIN_REWRITE_WORKLOG.md` → `### Admin metadata retirement (Pass 5 narrative)`**.
+
+- [ ] ### Session 20.6.1: Admin metadata stack removal (server + client API)
+**Description:** Drop or detach **admin metadata** Sequelize models and migrations per **DB_HOST** policy; remove **`server/src/routes/internal/admin-metadata`** and related **primitive/relationship metadata** routes if in scope; remove client **`admin-metadata`** prefetch/mutations after confirming domain editors do not depend on rows.
+
+**Tasks:**
+- Inventory consumers: ripgrep **`admin-metadata`**, **`AdminMetadata`**, **`adminMetadata`** across `client/src` and `server/src`; cross-check **`server/src/routes/internal/index.ts`** mounts.
+- Remove or narrow **client** API modules and TanStack/query keys that call metadata endpoints; replace reads with entity/settings APIs already used by Pass 3–4 editors where needed.
+- Remove **server** routers, helpers, Joi schemas tied to metadata POST/GET; update **`metadataValidatorFactory`** consumers so lint/tsc stay green.
+- Author **migration(s)** to drop or detach metadata tables (names from **§6.3a** + live models under **`server/src/db/models/admin/`**); do not run DDL on remote **DB_HOST**.
+- Verify admin UI smoke paths still load for shapes/instances/settings without metadata rows.
+
+- [ ] ### Session 20.6.2: EntityCard tree and façade consumers
+**Description:** Replace or inline remaining **`EntityCard.vue`** import sites in **`ENTITY_CARD_CONSUMERS_20.6.md`**; delete **`EntityCard*`** shell compo
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
