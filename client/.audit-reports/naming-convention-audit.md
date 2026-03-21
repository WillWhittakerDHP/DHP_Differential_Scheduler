**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Naming Convention Audit (Generated)

Generated at: 2026-03-21T17:26:39.235Z

## Summary

- Total allowed: **41**
- Requiring review: **6**

## Files with naming violations

| File | Rule | Line | Snippet |
| --- | --- | ---: | --- |
| `client/src/composables/admin/injectionKeys.ts` | composableFileName | 1 | Composable file should be use[Name].ts: injectionK |
| `client/src/composables/booking/bookingDevPanelKeys.ts` | composableFileName | 1 | Composable file should be use[Name].ts: bookingDev |
| `client/src/composables/booking/bookingKeys.ts` | composableFileName | 1 | Composable file should be use[Name].ts: bookingKey |
| `client/src/composables/booking/bookingWizardStepKeys.ts` | composableFileName | 1 | Composable file should be use[Name].ts: bookingWiz |
| `client/src/composables/booking/injectionKeys.ts` | composableFileName | 1 | Composable file should be use[Name].ts: injectionK |
| `client/src/composables/fieldContext/buildFieldContextReturn.ts` | composableFileName | 1 | Composable file should be use[Name].ts: buildField |

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

| File | Rule | Line | Source | Reason |
| --- | --- | ---: | --- | --- |
| `client/src/composables/admin/useAdminAvailabilitySettings.ts` | composableExport | 18 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 5 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 32 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 43 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 50 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 57 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useFormElementPatching.ts` | composableExport | 27 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useFormElementPatching.ts` | composableExport | 85 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useMetadataCache.ts` | composableExport | 132 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/utils/nestedComputedFactory.ts` | composableFileName | 1 | pattern | Composable utility; factory name is intentional |
| `client/src/composables/booking/useAvailabilityLogic.ts` | composableExport | 26 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useListForAdminEntry.ts` | composableExport | 38 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | composableExport | 34 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useStepValidation.ts` | composableExport | 12 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useTimeSlotMatching.ts` | composableExport | 15 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useWizardStepContent.ts` | composableExport | 7 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 3 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 31 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 55 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/fieldContext/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/formFields/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/useAdminConfig.ts` | composableExport | 50 | pattern | Composables may export camelCase helpers used by other co... |
| `server/src/db/models/admin/block_shape.ts` | functionExport | 32 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/business_settings.ts` | functionExport | 85 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/calendar_settings.ts` | functionExport | 27 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/wizard_settings.ts` | functionExport | 37 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/active_annotation.ts` | functionExport | 46 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/active_event.ts` | functionExport | 50 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/annotation_assignment.ts` | functionExport | 46 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/annotation_instance.ts` | functionExport | 42 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/appointment.ts` | functionExport | 68 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/appointment_attendee.ts` | functionExport | 50 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/appointment_fee_summary.ts` | functionExport | 29 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/block_instance.ts` | functionExport | 40 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/block_instance_version.ts` | functionExport | 33 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/constraint_override.ts` | functionExport | 34 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/event_assignment.ts` | functionExport | 44 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/event_shape_attendee.ts` | functionExport | 44 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/property_version_type.ts` | functionExport | 34 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/mappings/property_feature_mapping.ts` | functionExport | 31 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/types/express.d.ts` | typesFileName | 1 | specific | Express type augmentation; standard filename for declarat... |
