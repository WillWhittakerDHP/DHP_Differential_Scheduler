**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Naming Convention Audit (Generated)

Generated at: 2026-02-23T18:12:56.717Z

## Summary

- Total allowed: **76**
- Requiring review: **3**

## Files with naming violations

| File | Rule | Line | Snippet |
| --- | --- | ---: | --- |
| `client/src/layouts/blank.vue` | componentFileName | 1 | Component file should be PascalCase: blank.vue |
| `client/src/layouts/default.vue` | componentFileName | 1 | Component file should be PascalCase: default.vue |
| `client/src/types/admin/AdminEntity.ts` | typesFileName | 1 | Types file should be camelCase: AdminEntity.ts |

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

| File | Rule | Line | Source | Reason |
| --- | --- | ---: | --- | --- |
| `client/src/composables/admin/tables/useAppointmentAttendees.ts` | composableExport | 18 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/tables/useAppointmentAttendees.ts` | composableExport | 31 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/tables/useAppointmentAttendees.ts` | composableExport | 36 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/tables/useAppointmentAttendees.ts` | composableExport | 41 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/tables/useAppointmentAttendees.ts` | composableExport | 45 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/tables/useAppointmentHelpers.ts` | composableExport | 1 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/tables/useAppointmentHelpers.ts` | composableExport | 15 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/tables/useTableModelHelpers.ts` | composableExport | 11 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useAvailabilitySettings.ts` | composableExport | 25 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 3 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 30 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 41 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 48 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | composableExport | 55 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useMetadataCache.ts` | composableExport | 122 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/utils/nestedComputedFactory.ts` | composableFileName | 1 | pattern | Composable utility; factory name is intentional |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | composableExport | 34 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useStepValidation.ts` | composableExport | 22 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/businessDataCollections/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 3 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 36 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 60 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/fieldContext/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/formFields/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/globalDataCollections/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/useAdminConfig.ts` | composableExport | 30 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/useApiErrorMessage.ts` | composableExport | 1 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/useLocalTime.ts` | composableExport | 21 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/useLocalTime.ts` | composableExport | 158 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/useLocalTime.ts` | composableExport | 172 | pattern | Composables may export camelCase helpers used by other co... |
| `server/src/db/models/admin/adminMetadata.ts` | functionExport | 35 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/adminPrimitiveMetadata.ts` | functionExport | 37 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/adminRelationshipMetadata.ts` | functionExport | 37 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/block_shape.ts` | functionExport | 32 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/business_rule.ts` | functionExport | 43 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/business_settings.ts` | functionExport | 93 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/part_shape.ts` | functionExport | 21 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/valid_annotation.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/valid_cascade.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/valid_event.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/valid_part.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/valid_pricing_cascade.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/beta/beta_feedback.ts` | functionExport | 50 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/beta/beta_feedback_tag.ts` | functionExport | 20 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/active_annotation.ts` | functionExport | 47 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/active_event.ts` | functionExport | 51 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/active_part.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/address.ts` | functionExport | 26 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/annotation_assignment.ts` | functionExport | 47 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/annotation_instance.ts` | functionExport | 43 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/annotation_shape.ts` | functionExport | 36 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/appointment.ts` | functionExport | 56 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/appointment_attendee.ts` | functionExport | 50 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/appointment_fee_entry.ts` | functionExport | 33 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/appointment_fee_summary.ts` | functionExport | 28 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/block_instance.ts` | functionExport | 39 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/block_instance_version.ts` | functionExport | 32 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/booking_cascade.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/dependent_instance.ts` | functionExport | 39 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/event_assignment.ts` | functionExport | 45 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/event_instance.ts` | functionExport | 53 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/event_shape.ts` | functionExport | 39 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/event_shape_attendee.ts` | functionExport | 45 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/instance_component.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/part_assignment.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/part_instance.ts` | functionExport | 32 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/part_instance_version.ts` | functionExport | 28 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/pricing_cascade.ts` | functionExport | 34 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/property_details.ts` | functionExport | 33 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/property_version.ts` | functionExport | 20 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/property_version_type.ts` | functionExport | 35 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/relationships.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/mappings/property_feature_mapping.ts` | functionExport | 30 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/mappings/property_field_mapping.ts` | functionExport | 26 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/participantModels/Users.ts` | functionExport | 27 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/types/express.d.ts` | typesFileName | 1 | specific | Express type augmentation; standard filename for declarat... |
