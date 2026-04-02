# Session 20.2.1: ** **Block shape & block instance** internal entity routes — validate renamed `type` values (`user`, `service`, `time`, `price`, `event`) and instance **`composite` / `orchestrator` / `wizardVisible`**; align batch CRUD + `entitySanitizers` / Joi with Sequelize models.


### Task 20.2.1.1: Task 20.2.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.1.2



## Completed Tasks

### Task 20.2.1.1: Task 20.2.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md`, `client/tsconfig.tsbuildinfo`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.1.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.1.1-planning.md`, `server/src/routes/internal/entities/blockShapeEntityValidation.ts`

### `git diff --stat HEAD`

```text
.../across-ladder.json                             |  2 +-
 .../sessions/session-20.2.1-guide.md               |  2 +-
 .../sessions/session-20.2.1-log.md                 | 18 ++++++++++++++
 client/tsconfig.tsbuildinfo                        |  1 -
 .../routes/internal/entities/entityCrudRouter.ts   | 29 ++++++++++++++++++++++
 5 files changed, 49 insertions(+), 3 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index c9fe15c9..6d533d74 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T17:13:34.993Z",
+  "derivedAt": "2026-04-02T17:17:30.522Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
index 53e2ac3d..adda598e 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.2.1.1: [Task Name]
+- [x] #### Task 20.2.1.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
index 16afd66b..b61ace16 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
@@ -1,2 +1,20 @@
 # Session 20.2.1: ** **Block shape & block instance** internal entity routes — validate renamed `type` values (`user`, `service`, `time`, `price`, `event`) and instance **`composite` / `orchestrator` / `wizardVisible`**; align batch CRUD + `entitySanitizers` / Joi with Sequelize models.
 
+
+### Task 20.2.1.1: Task 20.2.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.2.1.2
+
+
+
+## Completed Tasks
+
+### Task 20.2.1.1: Task 20.2.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.2.1.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/tsconfig.tsbuildinfo b/client/tsconfig.tsbuildinfo
deleted file mode 100644
index 428c37ec..00000000
--- a/client/tsconfig.tsbuildinfo
+++ /dev/null
@@ -1 +0,0 @@
-{"root":["./src/main.ts","./src/vite-env.d.ts","./src/@core/enums.ts","./src/@core/index.ts","./src/@core/initcore.ts","./src/@core/types.ts","./src/@core/composable/createurl.ts","./src/@core/composable/usecookie.ts","./src/@core/composable/usecustomizeroptions.ts","./src/@core/composable/usegenerateimagevariant.ts","./src/@core/composable/useresponsivesidebar.ts","./src/@core/composable/useskins.ts","./src/@core/libs/apex-chart/apexcharconfig.ts","./src/@core/stores/config.ts","./src/@core/utils/colorconverter.ts","./src/@core/utils/formatters.ts","./src/@core/utils/helpers.ts","./src/@core/utils/plugins.ts","./src/@core/utils/validators.ts","./src/@core/utils/vuetify.ts","./src/@layouts/config.ts","./src/@layouts/enums.ts","./src/@layouts/index.ts","./src/@layouts/symbols.ts","./src/@layouts/types.ts","./src/@layouts/utils.ts","./src/@layouts/plugins/casl.ts","./src/@layouts/stores/config.ts","./src/components/admin/dev/devpaneltypes.ts","./src/components/admin/generic/entitycardconstants.ts","./src/components/admin/generic/entitycardkeyboardconstants.ts","./src/components/admin/generic/fields/fieldrenderercomponentmap.ts","./src/components/admin/generic/fields/fieldtypes.ts","./src/components/booking/plugins/localstateplugin.ts","./src/components/booking/plugins/wizardstateplugin.ts","./src/components/booking/types/selectioncardtypes.ts","./src/composables/useaddressautocomplete.ts","./src/composables/useaddressautocompletemodelwatchers.ts","./src/composables/useaddressautocompleteselection.ts","./src/composables/useaddressautocompletesuggestions.ts","./src/composables/useadminconfig.ts","./src/composables/useapierrormessage.ts","./src/composables/useappointment.ts","./src/composables/useasyncoperation.ts","./src/composables/usebooking.ts","./src/composables/usebusiness.ts","./src/composables/usecomponentdistribution.ts","./src/composables/usecomponententity.ts","./src/composables/useentityform.ts","./src/composables/usefieldvalue.ts","./src/composables/useformfields.ts","./src/composables/useformvalidation.ts","./src/composables/useglobal.ts","./src/composables/uselayoutloading.ts","./src/composables/useloadingindicator.ts","./src/composables/usemapssessiontoken.ts","./src/composables/usenotification.ts","./src/composables/useproperty.ts","./src/composables/userelationship.ts","./src/composables/useselectoptions.ts","./src/composables/usethememode.ts","./src/composables/useuser.ts","./src/composables/admin/businesscontrolstabcomposablesbundle.ts","./src/composables/admin/entitycardactionspersistence.ts","./src/composables/admin/useadmin.ts","./src/composables/admin/useadminavailabilitysettings.ts","./src/composables/admin/useadminavailabilitysettingscore.ts","./src/composables/admin/useadmincalendarsettings.ts","./src/composables/admin/useadminentitydeletewizard.ts","./src/composables/admin/useadminmetadatamutations.ts","./src/composables/admin/useadminorganizationdefaults.ts","./src/composables/admin/useadminuserroleblockalignment.ts","./src/composables/admin/useadminwizardsettings.ts","./src/composables/admin/useannotationcontenteditor.ts","./src/composables/admin/useapidevpanelvisibility.ts","./src/composables/admin/useattendeequickselect.ts","./src/composables/admin/usebasecollectionfield.ts","./src/composables/admin/usebasecollectionfieldbindingcomputeds.ts","./src/composables/admin/usebasecollectionfieldbindingcomputedskeys.ts","./src/composables/admin/usebasecollectionfieldbindingcomputedsparent.ts","./src/composables/admin/usebasecollectionfieldbindings.ts","./src/composables/admin/usebasecollectionfieldcore.ts","./src/composables/admin/usebasecollectionfieldtypes.ts","./src/composables/admin/useblockinstancecreate.ts","./src/composables/admin/useblockinstanceform.ts","./src/composables/admin/useblockinstancelist.ts","./src/composables/admin/usebooleaninputclick.ts","./src/composables/admin/usebuffersettings.ts","./src/composables/admin/usebusinesscontrolsformstate.ts","./src/composables/admin/usebusinesscontrolspersistedsavebuttons.ts","./src/composables/admin/usebusinesscontrolstab.ts","./src/composables/admin/usebusinesscontrolstabsaveandstatus.ts","./src/composables/admin/usebusinesshoursformstate.ts","./src/composables/admin/usebusinessruleform.ts","./src/composables/admin/usebusinessrules.ts","./src/composables/admin/usebusinessrulestab.ts","./src/composables/admin/usecalendarentries.ts","./src/composables/admin/usecalendarholdformstate.ts","./src/composables/admin/usecalibrationchart.ts","./src/composables/admin/usecapacitysettings.ts","./src/composables/admin/usecomponentdistributionconfirm.ts","./src/composables/admin/useconditionalfieldvisibility.ts","./src/composables/admin/useconfirmationandholdspanel.ts","./src/composables/admin/usedefaultlocation.ts","./src/composables/admin/usedifferentialperspectives.ts","./src/composables/admin/usedraganddrop.ts","./src/composables/admin/usedraganddrophelpers.ts","./src/composables/admin/useentitycardactions.ts","./src/composables/admin/useentitycardannotationcomposedmetadata.ts","./src/composables/admin/useentitycardexpansion.ts","./src/composables/admin/useentitycardfieldconfiguration.ts","./src/composables/admin/useentitycardfieldcontextandvisibility.ts","./src/composables/admin/useentitycardform.ts","./src/composables/admin/useentitycardformsetup.ts","./src/composables/admin/useentitycardmetadata.ts","./src/composables/admin/useentitycardprimarytitlemodels.ts","./src/composables/admin/useentitycardreadiness.ts","./src/composables/admin/useentitycardsaveandactions.ts","./src/composables/admin/useentitycardsavehandlers.ts","
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
