# Session 6.16.2: Multiple minimizers — segments, composable, orchestrator


### Task 6.16.2.1: Task 6.16.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.2.2



## Completed Tasks

### Task 6.16.2.1: Task 6.16.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.2.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (80): `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/components/booking/dev/ConstraintsPanel.vue`, `client/src/components/booking/dev/DevPanelsContainer.vue`, `client/src/components/booking/modals/README.md`, `client/src/components/booking/steps/AvailabilityStep.vue`, `client/src/components/booking/steps/AvailabilitySubStepContent.vue`, `client/src/components/booking/steps/ConfirmationStep.vue`, `client/src/composables/admin/useDifferentialPerspectives.ts`, `client/src/composables/admin/useWizardSettings.ts`, `client/src/composables/booking/availabilityOrchestratorActionsBundle.ts`, `client/src/composables/booking/availabilityOrchestratorFormsBundle.ts`, `client/src/composables/booking/availabilityOrchestratorSlotsBundle.ts`, `client/src/composables/booking/buildAvailabilitySubStepContext.ts`, `client/src/composables/booking/useAfterAppointmentBufferMinutes.ts`, `client/src/composables/booking/useAvailabilityConfirmationState.ts`, `client/src/composables/booking/useAvailabilityDevPanel.ts`, `client/src/composables/booking/useAvailabilityOrchestrator.ts`, `client/src/composables/booking/useAvailabilityOrchestratorActionsPhase.ts`, `client/src/composables/booking/useAvailabilityOrchestratorFormsPhase.ts`, `client/src/composables/booking/useAvailabilityOrchestratorMinimizerGates.ts`, `client/src/composables/booking/useAvailabilityOrchestratorReturn.ts`, `client/src/composables/booking/useAvailabilityOrchestratorSlotComputeds.ts`, `client/src/composables/booking/useAvailabilityOrchestratorSlotsPhase.ts`, `client/src/composables/booking/useAvailabilityStepData.ts`, `client/src/composables/booking/useAvailabilityStepUI.ts`, `client/src/composables/booking/useAvailabilitySubStepContent.ts`, `client/src/composables/booking/useAvailabilitySubSteps.ts`, `client/src/composables/booking/useBookingProgressSummaryStrip.ts`, `client/src/composables/booking/useMinimizerAvailabilityData.ts`, `client/src/composables/booking/useMinimizerAvailabilityDataCore.ts`, `client/src/composables/booking/useMinimizerAvailabilityDataTypes.ts`, `client/src/composables/booking/useMinimizerPartsScheduling.ts`, `client/src/configs/businessControlsTabStrings.ts`, `client/src/configs/eventPerspectiveLabels.ts`, `client/src/constants/availabilityStepConstants.ts`, `client/src/constants/minimizerScheduling.ts`, `client/src/types/admin/gridConfigHandlers.ts`, `client/src/types/admin/wizardSettings.ts`, `client/src/types/appointmentApi.ts`, `client/src/types/booking/appointmentSlots.ts`, `client/src/types/booking/availabilityDevPanel.ts`, `client/src/types/booking/availabilityOrchestrator.ts`, `client/src/types/booking/availabilityStepData.ts`, `client/src/types/booking/availabilityStepHandlers.ts`, `client/src/types/booking/injectionContexts.ts`, `client/src/types/booking/minimizerPartsScheduling.ts`, `client/src/types/booking/minimizerSchedulingWindow.ts`, `client/src/types/booking/partFinal.ts`, `client/src/types/minimizerScheduling.ts`, `client/src/types/wizardStepData.ts`, `client/src/utils/admin/gridConfigHandlers.ts`, `client/src/utils/booking/applyMinimizerWindowToComputedSlots.ts`, `client/src/utils/booking/appointmentSlotBuilder.ts`, `client/src/utils/booking/availabilityStepData.ts`, `client/src/utils/booking/availabilityStepHandlers.ts`, `client/src/utils/booking/clampContingencyDeadlineToEarliest.ts`, `client/src/utils/booking/confirmationStepDataSummary.ts`, `client/src/utils/booking/constraintColors.ts`, `client/src/utils/booking/minimizerDayDisplayLabel.ts`, `client/src/utils/booking/minimizerDurationFromAppointmentShape.ts`, `client/src/utils/booking/minimizerPartShapeName.ts`, `client/src/utils/booking/minimizerSchedulingBounds.ts`, `client/src/utils/booking/partFinalizer.ts`, `client/src/utils/transformers/apiEntityFieldNormalization.ts`, `client/src/utils/transformers/appointmentToWizardTransformer.ts`, `client/src/views/admin/tabs/components/GridConfigPanel.vue`, `client/src/views/admin/tabs/components/WizardConfigPanel.vue`, `server/src/config/entityRegistry.ts`, `server/src/db/models/admin/wizard_settings.ts`, `server/src/db/models/booking/block_instance.ts`, `server/src/db/models/booking/event_shape.ts`, `server/src/repositories/wizardSettingsRepository.ts`, `server/src/routes/schemas/wizardSettingsSchemas.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.16.2.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.16.2.1-planning.md`, `client/src/utils/booking/minimizerEventShapes.ts`, `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs`

### `git diff --stat HEAD`

```text
.../appointment-workflow/across-ladder.json        |   2 +-
 .../sessions/session-6.16.2-guide.md               |   2 +-
 .../sessions/session-6.16.2-log.md                 |  18 ++
 .../fields/DifferentialEventRoleOverridesField.vue |   2 +-
 .../components/booking/dev/ConstraintsPanel.vue    |  18 +-
 .../components/booking/dev/DevPanelsContainer.vue  |   6 +-
 client/src/components/booking/modals/README.md     |   2 +-
 .../components/booking/steps/AvailabilityStep.vue  |  40 +--
 .../booking/steps/AvailabilitySubStepContent.vue   |  42 +--
 .../components/booking/steps/ConfirmationStep.vue  |  12 +-
 .../admin/useDifferentialPerspectives.ts           |  22 +-
 client/src/composables/admin/useWizardSettings.ts  |  24 +-
 .../availabilityOrchestratorActionsBundle.ts       |   2 +-
 .../booking/availabilityOrchestratorFormsBundle.ts |   2 +-
 .../booking/availabilityOrchestratorSlotsBundle.ts |   4 +-
 .../booking/buildAvailabilitySubStepContext.ts     |  18 +-
 .../booking/useAfterAppointmentBufferMinutes.ts    |   2 +-
 .../booking/useAvailabilityConfirmationState.ts    |   6 +-
 .../composables/booking/useAvailabilityDevPanel.ts |   8 +-
 .../booking/useAvailabilityOrchestrator.ts         |  58 ++--
 .../useAvailabilityOrchestratorActionsPhase.ts     |  54 ++--
 .../useAvailabilityOrchestratorFormsPhase.ts       |  14 +-
 .../useAvailabilityOrchestratorMinimizerGates.ts   |  48 ++++
 .../booking/useAvailabilityOrchestratorReturn.ts   |  36 +--
 .../useAvailabilityOrchestratorSlotComputeds.ts    |  16 +-
 .../useAvailabilityOrchestratorSlotsPhase.ts       | 132 ++++-----
 .../composables/booking/useAvailabilityStepData.ts |   4 +-
 .../composables/booking/useAvailabilityStepUI.ts   |  21 +-
 .../booking/useAvailabilitySubStepContent.ts       |  52 ++--
 .../composables/booking/useAvailabilitySubSteps.ts |  18 +-
 .../booking/useBookingProgressSummaryStrip.ts      |   8 +-
 .../booking/useMinimizerAvailabilityData.ts        | 117 ++++++++
 .../booking/useMinimizerAvailabilityDataCore.ts    | 167 +++++++++++
 .../booking/useMinimizerAvailabilityDataTypes.ts   |  14 +
 .../booking/useMinimizerPartsScheduling.ts         | 309 +++++++++++++++++++++
 client/src/configs/businessControlsTabStrings.ts   |  22 +-
 client/src/configs/eventPerspectiveLabels.ts       |   2 +-
 client/src/constants/availabilityStepConstants.ts  |  10 +-
 client/src/constants/minimizerScheduling.ts        |   9 +
 client/src/types/admin/gridConfigHandlers.ts       |   6 +-
 client/src/types/admin/wizardSettings.ts           |   6 +-
 client/src/types/appointmentApi.ts                 |   6 +-
 client/src/types/booking/appointmentSlots.ts       |   2 +-
 client/src/types/booking/availabilityDevPanel.ts   |   6 +-
 .../src/types/booking/availabilityOrchestrator.ts  |  40 +--
 client/src/types/booking/availabilityStepData.ts   |   6 +-
 .../src/types/booking/availabilityStepHandlers.ts  |  22 +-
 client/src/types/booking/injectionContexts.ts      |  10 +-
 .../src/types/booking/minimizerPartsScheduling.ts  |  10 +
 .../src/types/booking/minimizerSchedulingWindow.ts |  11 +
 client/src/types/booking/partFinal.ts              |   2 +-
 client/src/types/minimizerScheduling.ts            |  28 ++
 client/src/types/wizardStepData.ts                 |   6 +-
 client/src/utils/admin/gridConfigHandlers.ts       |  12 +-
 .../booking/applyMinimizerWindowToComputedSlots.ts | 149 ++++++++++
 client/src/utils/booking/appointmentSlotBuilder.ts |   2 +-
 client/src/utils/booking/availabilityStepData.ts   |   6 +-
 .../src/utils/booking/availabilityStepHandlers.ts  |  40 +--
 .../booking/clampContingencyDeadlineToEarliest.ts  |   2 +-
 .../utils/booking/confirmationStepDataSummary.ts   |  34 +--
 client/src/utils/booking/constraintColors.ts       |  12 +-
 .../src/utils/booking/minimizerDayDisplayLabel.ts  |  65 +++++
 .../minimizerDurationFromAppointmentShape.ts       |  21 ++
 client/src/utils/booking/minimizerPartShapeName.ts |  55 ++++
 .../src/utils/booking/minimizerSchedulingBounds.ts |  67 +++++
 client/src/utils/booking/partFinalizer.ts          |   4 +-
 .../transformers/apiEntityFieldNormalization.ts    |   2 +-
 .../transformers/appointmentToWizardTransformer.ts |   2 +-
 .../admin/tabs/components/GridConfigPanel.vue      |  10 +-
 .../admin/tabs/components/WizardConfigPanel.vue    |  16 +-
 server/src/config/entityRegistry.ts                |   2 +-
 server/src/db/models/admin/wizard_settings.ts      |  16 +-
 server/src/db/models/booking/block_instance.ts     |   2 +-
 server/src/db/models/booking/event_shape.ts        |   6 +-
 .../src/repositories/wizardSettingsRepository.ts   |  18 +-
 server/src/routes/schemas/wizardSettingsSchemas.ts |   6 +-
 76 files changed, 1571 insertions(+), 482 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index cb050926..a049c4c2 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-03-25T22:06:44.147Z",
+  "derivedAt": "2026-03-25T22:08:00.512Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
index 8b5af11d..20d263c8 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
@@ -43,7 +43,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 6.16.2.1: [Task Name]
+- [x] #### Task 6.16.2.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
index c9c525ca..2973aa39 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
@@ -1,2 +1,20 @@
 # Session 6.16.2: Multiple minimizers — segments, composable, orchestrator
 
+
+### Task 6.16.2.1: Task 6.16.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.16.2.2
+
+
+
+## Completed Tasks
+
+### Task 6.16.2.1: Task 6.16.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.16.2.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue b/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue
index 7138fd2b..64d1cd73 100644
--- a/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue
+++ b/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue
@@ -131,7 +131,7 @@ const roleSelectItems = computed((): RoleSelectItem[] => [
   { title: 'Inherit (use event shape template)', value: INHERIT_SENTINEL },
   { title: DIFFERENTIAL_ROLE_LABELS.major, value: 'major' },
   { title: DIFFERENTIAL_ROLE_LABELS.minor, value: 'minor' },
-  { title: DIFFERENTIAL_ROLE_LABELS.moveable, value: 'moveable' },
+  { title: DIFFERENTIAL_ROLE_LABELS.minimizer, value: 'minimizer' },
   { title: DIFFERENTIAL_ROLE_LABELS.margin, value: 'margin' },
   { title: DIFFERENTIAL_ROLE_LABELS.none, value: 'none' },
 ])
diff --git a/client/src/components/booking/dev/ConstraintsPanel.vue b/client/src/components/booking/dev/ConstraintsPanel.vue
index 843faffd..c6796247 100644
--- a/client/src/components/booking/dev/ConstraintsPanel.vue
+++ b/client/src/components/booking/dev/ConstraintsPanel.vue
@@ -73,14 +73,14 @@
         </VCol>
       </VRow>
     </div>
-    <div v-if="moveableWindowDisplay" class="mb-4">
-      <VCardTitle class="text-body-large font-weight-bold pa-2">Moveable window (client virtual)</VCardTitle>
+    <div v-if="minimizerWindowDisplay" class="mb-4">
+      <VCardTitle class="text-body-large font-weight-bold pa-2">Minimizer window (client virtual)</VCardTitle>
       <VRow density="comfortable" class="ma-0">
         <VCol cols="12" md="6">
           <VCard variant="outlined" density="compact" class="pa-2">
             <div class="text-body-small text-medium-emphasis">Earliest completion start</div>
             <div class="text-body-medium font-weight-medium">
-              {{ formatIsoForDev(moveableWindowDisplay.earliestStart) }}
+              {{ formatIsoForDev(minimizerWindowDisplay.earliestStart) }}
             </div>
           </VCard>
         </VCol>
@@ -89,8 +89,8 @@
             <div class="text-body-small text-medium-emphasis">Latest slot end (contingency)</div>
             <div class="text-body-medium font-weight-medium">
               {{
-                moveableWindowDisplay.latestEnd
-                  ? formatIsoForDev(moveableWindowDisplay.latestEnd)
+                minimizerWindowDisplay.latestEnd
+                  ? formatIsoForDev(minimizerWindowDisplay.latestEnd)
                   : 'Not applied (no closing deadline)'
               }}
             </div>
@@ -104,15 +104,15 @@
 <script setup lang="ts">
 import { computed } from 'vue'
 import type { AvailabilitySettings } from '@/configs/availabilitySettings'
-import type { MoveableSchedulingWindow } from '@/types/booking/moveableSchedulingWindow'
+import type { MinimizerSchedulingWindow } from '@/types/booking/minimizerSchedulingWindow'
 
 const props = defineProps<{
   availabilitySettingsValue: AvailabilitySettings | null
-  moveableSchedulingWindow?: MoveableSchedulingWindow | null
+  minimizerSchedulingWindow?: MinimizerSchedulingWindow | null
 }>()
 
-const moveableWindowDisplay = computed<MoveableSchedulingWindow | null>(
-  () => props.moveableSchedulingWindow ?? null
+const minimizerWindowDisplay = computed<MinimizerSchedulingWindow | null>(
+  () => props.minimizerSchedulingWindow ?? null
 )
 
 function formatIsoForDev(iso: string): string {
diff --git a/client/src/components/booking/dev/DevPanelsContainer.vue b/client/src/components/booking/dev/DevPanelsContainer.vue
index 6584c8cd..3cf7520e 100644
--- a/client/src/components/booking/dev/DevPanelsContainer.vue
+++ b/client/src/components/booking/dev/DevPanelsContainer.vue
@@ -43,8 +43,8 @@ const { settings: availabilitySettings } = useAvailabilitySettings()
 
 const availabilitySettingsValue = computed(() => availabilitySettings?.value ?? null)
 
-const moveableSchedulingWindowForPanel = computed(() =>
-  unref(devPanelData.value.moveableSchedulingWindow) ?? null
+const minimizerSchedulingWindowForPanel = computed(() =>
+  unref(devPanelData.value.minimizerSchedulingWindow) ?? null
 )
 
 const {
@@ -193,7 +193,7 @@ provide(instancesPanelContextKey, {
           <VWindowItem value="constraints">
             <ConstraintsPanel
               :availability-settings-value="availabilitySettingsValue"
-              :moveable-scheduling-window="moveableSchedulingWindowForPanel"
+              :minimizer-scheduling-window="minimizerSchedulingWindowForPanel"
             />
           </VWindowItem>
         </VWindow>
diff --git a/client/src/components/booking/modals/README.md b/client/src/components/booking/modals/README.md
index 5edc543f..605aacfc 100644
--- a/client/src/components/booking/modals/README.md
+++ b/client/src/components/booking/modals/README.md
@@ -18,7 +18,7 @@ Reusable confirmation modal shell used when a step requires the user to confirm
 | Step | Component | Purpose |
 |------|-----------|---------|
 | Property details | PropertyConfirmationModal | Confirm property info before continuing |
-| Availability (moveable) | MoveablePartsModal | Confirm contingency and completion time |
+| Availability (minimizer) | MinimizerPartsModal | Confirm contingency and completion time |
 
 ### Step-level concept: `confirmModal`
 
diff --git a/client/src/components/booking/steps/AvailabilityStep.vue b/client/src/components/booking/steps/AvailabilityStep.vue
index dfd3f961..ed76ff67 100644
--- a/client/src/components/booking/steps/AvailabilityStep.vue
+++ b/client/src/components/booking/steps/AvailabilityStep.vue
@@ -58,17 +58,17 @@ useWizardStepSync({
 const confirmation = useAvailabilityConfirmationState()
 const { labels: bookingWizardLabels } = useWizardSettings()
 
-const moveableInfeasible = computed(() => {
-  if (!o.hasMoveablePartsGated.value) return false
+const minimizerInfeasible = computed(() => {
+  if (!o.hasMinimizerPartsGated.value) return false
   const c = o.contingencyPeriod.value
   if (c.hasContingency !== true 
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
