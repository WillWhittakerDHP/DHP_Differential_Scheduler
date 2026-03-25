# Session 7.4.4 Log: ** Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified (lint + smoke).

**Status:** In Progress
**Date:** 2026-03-25

---

## Session Goal

[Document concrete session goal]

### Task 7.4.4.1: Task 7.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 7.4.4.2



## Completed Tasks

### Task 7.4.4.1: Task 7.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 7.4.4.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (10): `.project-manager/features/authentication/across-ladder.json`, `client/tsconfig.tsbuildinfo`, `server/docs/SECURITY_STUBS.md`, `.project-manager/features/authentication/phases/phase-7.4-handoff.md`, `.project-manager/features/authentication/sessions/session-7.4.4-guide.md`, `.project-manager/features/authentication/sessions/session-7.4.4-log.md`, `.project-manager/features/authentication/sessions/session-7.4.4-planning.md`, `.project-manager/features/authentication/sessions/task-7.4.4.1-handoff.md`, `.project-manager/features/authentication/sessions/task-7.4.4.1-planning.md`, `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`

### `git diff --stat HEAD`

```text
.../features/authentication/across-ladder.json     | 29 +++++++++++++++-------
 client/tsconfig.tsbuildinfo                        |  2 +-
 server/docs/SECURITY_STUBS.md                      |  3 +++
 3 files changed, 24 insertions(+), 10 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/authentication/across-ladder.json b/.project-manager/features/authentication/across-ladder.json
index e5151d25..14ee98b1 100644
--- a/.project-manager/features/authentication/across-ladder.json
+++ b/.project-manager/features/authentication/across-ladder.json
@@ -1,26 +1,37 @@
 {
   "schemaVersion": 1,
   "feature": "authentication",
-  "derivedAt": "2026-03-23T17:44:13.905Z",
+  "derivedAt": "2026-03-25T19:26:57.756Z",
   "sourceTier": "session",
   "phasesOnDisk": [
-    "7.2"
+    "7.1",
+    "7.2",
+    "7.3"
   ],
-  "phaseAcrossTotal": 1,
-  "focusPhaseId": "7.2",
+  "phaseAcrossTotal": 3,
+  "focusPhaseId": "7.4",
   "nextPhaseAcross": null,
   "prevPhaseId": null,
   "sessionsByPhase": {
+    "7.1": [
+      "7.1.1",
+      "7.1.2"
+    ],
     "7.2": [
       "7.2.1",
       "7.2.2",
       "7.2.3"
+    ],
+    "7.3": [
+      "7.3.1",
+      "7.3.2",
+      "7.3.3"
     ]
   },
-  "focusSessionId": "7.2.1",
-  "sessionAcrossTotal": 3,
-  "sessionIndex0Based": 0,
-  "nextSessionAcross": "7.2.2",
+  "focusSessionId": "7.4.4",
+  "sessionAcrossTotal": 0,
+  "sessionIndex0Based": null,
+  "nextSessionAcross": null,
   "taskAcrossTotal": 2,
-  "nextTaskAcross": "7.2.1.1"
+  "nextTaskAcross": "7.4.4.1"
 }
diff --git a/client/tsconfig.tsbuildinfo b/client/tsconfig.tsbuildinfo
index ea447fb8..6d02e444 100644
--- a/client/tsconfig.tsbuildinfo
+++ b/client/tsconfig.tsbuildinfo
@@ -1 +1 @@
-{"root":["./src/main.ts","./src/vite-env.d.ts","./src/@core/enums.ts","./src/@core/index.ts","./src/@core/initcore.ts","./src/@core/types.ts","./src/@core/composable/createurl.ts","./src/@core/composable/usecookie.ts","./src/@core/composable/usecustomizeroptions.ts","./src/@core/composable/usegenerateimagevariant.ts","./src/@core/composable/useresponsivesidebar.ts","./src/@core/composable/useskins.ts","./src/@core/libs/apex-chart/apexcharconfig.ts","./src/@core/stores/config.ts","./src/@core/utils/colorconverter.ts","./src/@core/utils/formatters.ts","./src/@core/utils/helpers.ts","./src/@core/utils/plugins.ts","./src/@core/utils/validators.ts","./src/@core/utils/vuetify.ts","./src/@layouts/config.ts","./src/@layouts/enums.ts","./src/@layouts/index.ts","./src/@layouts/symbols.ts","./src/@layouts/types.ts","./src/@layouts/utils.ts","./src/@layouts/plugins/casl.ts","./src/@layouts/stores/config.ts","./src/components/admin/dev/devpaneltypes.ts","./src/components/admin/generic/entitycardconstants.ts","./src/components/admin/generic/entitycardkeyboardconstants.ts","./src/components/admin/generic/fields/fieldrenderercomponentmap.ts","./src/components/admin/generic/fields/fieldtypes.ts","./src/components/booking/plugins/localstateplugin.ts","./src/components/booking/plugins/wizardstateplugin.ts","./src/components/booking/types/selectioncardtypes.ts","./src/composables/useaddressautocomplete.ts","./src/composables/useaddressautocompletemodelwatchers.ts","./src/composables/useaddressautocompleteselection.ts","./src/composables/useaddressautocompletesuggestions.ts","./src/composables/useadminconfig.ts","./src/composables/useapierrormessage.ts","./src/composables/useappointment.ts","./src/composables/useasyncoperation.ts","./src/composables/usebooking.ts","./src/composables/usebusiness.ts","./src/composables/usecomponentdistribution.ts","./src/composables/usecomponententity.ts","./src/composables/useentityform.ts","./src/composables/usefieldvalue.ts","./src/composables/useformfields.ts","./src/composables/useformvalidation.ts","./src/composables/useglobal.ts","./src/composables/uselayoutloading.ts","./src/composables/useloadingindicator.ts","./src/composables/usemapssessiontoken.ts","./src/composables/usenotification.ts","./src/composables/useproperty.ts","./src/composables/userelationship.ts","./src/composables/useselectoptions.ts","./src/composables/usethememode.ts","./src/composables/useuser.ts","./src/composables/admin/businesscontrolstabcomposablesbundle.ts","./src/composables/admin/entitycardactionspersistence.ts","./src/composables/admin/useadmin.ts","./src/composables/admin/useadminavailabilitysettings.ts","./src/composables/admin/useadminavailabilitysettingscore.ts","./src/composables/admin/useadmincalendarsettings.ts","./src/composables/admin/useadminmetadatamutations.ts","./src/composables/admin/useadminwizardsettings.ts","./src/composables/admin/useannotationcontenteditor.ts","./src/composables/admin/useapidevpanelvisibility.ts","./src/composables/admin/useattendeequickselect.ts","./src/composables/admin/usebasecollectionfield.ts","./src/composables/admin/usebasecollectionfieldbindingcomputeds.ts","./src/composables/admin/usebasecollectionfieldbindings.ts","./src/composables/admin/usebasecollectionfieldcore.ts","./src/composables/admin/usebasecollectionfieldtypes.ts","./src/composables/admin/useblockinstancecreate.ts","./src/composables/admin/useblockinstanceform.ts","./src/composables/admin/useblockinstancelist.ts","./src/composables/admin/usebooleaninputclick.ts","./src/composables/admin/usebuffersettings.ts","./src/composables/admin/usebusinesscontrolsformstate.ts","./src/composables/admin/usebusinesscontrolstab.ts","./src/composables/admin/usebusinesshoursformstate.ts","./src/composables/admin/usebusinessruleform.ts","./src/composables/admin/usebusinessrules.ts","./src/composables/admin/usebusinessrulestab.ts","./src/composables/admin/usecalendarentries.ts","./src/composables/admin/usecalendarholdformstate.ts","./src/composables/admin/usecalibrationchart.ts","./src/composables/admin/usecapacitysettings.ts","./src/composables/admin/usecomponentdistributionconfirm.ts","./src/composables/admin/useconditionalfieldvisibility.ts","./src/composables/admin/useconfirmationandholdspanel.ts","./src/composables/admin/usedefaultlocation.ts","./src/composables/admin/usedifferentialperspectives.ts","./src/composables/admin/usedraganddrop.ts","./src/composables/admin/usedraganddrophelpers.ts","./src/composables/admin/usedraganddropinstance.ts","./src/composables/admin/useentitycardactions.ts","./src/composables/admin/useentitycardannotationcomposedmetadata.ts","./src/composables/admin/useentitycardexpansion.ts","./src/composables/admin/useentitycardfieldconfiguration.ts","./src/composables/admin/useentitycardfieldcontextandvisibility.ts","./src/composables/admin/useentitycardform.ts","./src/composables/admin/useentitycardformsetup.ts","./src/composables/admin/useentitycardmetadata.ts","./src/composables/admin/useentitycardprimarytitlemodels.ts","./src/composables/admin/useentitycardreadiness.ts","./src/composables/admin/useentitycardsaveandactions.ts","./src/composables/admin/useentitycardsavehandlers.ts","./src/composables/admin/useentitycardsavestate.ts","./src/composables/admin/useentitycardstoresync.ts","./src/composables/admin/useentitycardsubpanels.ts","./src/composables/admin/useentitydraghandlers.ts","./src/composables/admin/useentityfiltering.ts","./src/composables/admin/useentityformredirectoptions.ts","./src/composables/admin/useentityidreset.ts","./src/composables/admin/useentitymetadata.ts","./src/composables/admin/useentitystatus.ts","./src/composables/admin/useentitytabstate.ts","./src/composables/admin/useeventinstancebuilder.ts","./src/composables/admin/useeventinstancessection.ts","./src/composables/admin/useeventtemplatepreview.ts","./src/composables/admin/useexpansionstate.ts","./src/composables/admin/usefeepreview.ts","./src/composables/admin/usefieldcomponent.ts","./src/composables/admin/usefieldcontextmanager.ts","./src/composables/admin/usefieldcontextmetadataentity.ts","./src/composables/admin/usefieldinputhandlers.ts","./src/composables/admin/usefieldinputsetup.ts","./src/composables/admin/usefieldlocation.ts","./src/composables/admin/usefieldrenderercomponent.ts","./src/composables/admin/usefieldrenderererrorwatch.ts","./src/composables/admin/useformelementpatching.ts","./src/composables/admin/useformfieldconfigs.ts","./src/composables/admin/useiconpickerstate.ts","./src/composables/admin/useinstancebulkedit.t
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
