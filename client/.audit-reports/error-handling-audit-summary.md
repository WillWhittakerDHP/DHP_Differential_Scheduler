# Error Handling Audit Summary (Generated)

Generated from `.audit-reports/error-handling-audit.json`.

- Requiring review: **85**
- Allowed exceptions: 0

## Top 30 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/routes/internal/properties/propertyHelpers.ts` | P0 | 20 | 0 | 4 | 0 |
| `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataCrudRouter.ts` | P0 | 15 | 0 | 3 | 0 |
| `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataCrudRouter.ts` | P0 | 15 | 0 | 3 | 0 |
| `server/src/routes/internal/businessSettings/businessSettingsHelpers.ts` | P0 | 15 | 0 | 3 | 0 |
| `client/src/composables/admin/useBusinessRules.ts` | P0 | 11 | 0 | 2 | 1 |
| `client/src/components/booking/AppointmentSlotGrid.vue` | P0 | 10 | 1 | 0 | 0 |
| `client/src/composables/admin/useDragAndDrop.ts` | P0 | 10 | 1 | 0 | 0 |
| `client/src/composables/admin/useEntityCardActions.ts` | P0 | 10 | 1 | 0 | 0 |
| `client/src/composables/admin/useStatusButtonToggle.ts` | P0 | 10 | 0 | 2 | 0 |
| `client/src/utils/api/relationshipApiHelpers.ts` | P0 | 10 | 1 | 0 | 0 |
| `client/src/utils/booking/mockGoogleCalendar.ts` | P0 | 10 | 1 | 0 | 0 |
| `client/src/utils/dev/formatDevPanelData.ts` | P0 | 10 | 0 | 2 | 0 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/helpers/routerErrorHandler.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/admin-metadata/adminMetadataCrudRouter.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/admin-metadata/adminMetadataHelpers.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/properties/propertyValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/relationships/relationshipErrorHandler.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/relationships/relationshipHelpers.ts` | P0 | 10 | 0 | 2 | 0 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P1 | 7 | 0 | 1 | 2 |
| `client/src/composables/formFields/useFormFieldsContext.ts` | P1 | 7 | 0 | 1 | 2 |
| `client/src/components/admin/InstanceBulkEditModal.vue` | P1 | 6 | 0 | 1 | 1 |
| `client/src/components/admin/MetadataEditModal.vue` | P1 | 6 | 0 | 1 | 1 |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | P1 | 6 | 0 | 1 | 1 |
| `client/src/composables/admin/useInstanceBulkEdit.ts` | P1 | 6 | 0 | 1 | 1 |
| `client/src/composables/admin/usePartInstanceBulkEdit.ts` | P1 | 6 | 0 | 1 | 1 |
| `client/src/composables/booking/useAppointmentLoader.ts` | P1 | 6 | 0 | 1 | 1 |

*...and 16 more files. See full report for details.*

## Notes

- P0: Silent error swallowing (empty catch, silent .catch())
- P1: Console in catch blocks, type suppressions (@ts-ignore, as any)
- P2: General console usage
