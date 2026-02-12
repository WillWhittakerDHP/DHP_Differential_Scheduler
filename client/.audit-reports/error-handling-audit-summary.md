# Error Handling Audit Summary (Generated)

Generated from `.audit-reports/error-handling-audit.json`.

- Requiring review: **41**
- Allowed exceptions: 0

## Top 23 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/routes/internal/properties/propertyHelpers.ts` | P0 | 20 | 0 | 4 | 0 |
| `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/properties/propertyValidators.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/relationships/relationshipErrorHandler.ts` | P0 | 10 | 0 | 2 | 0 |
| `server/src/routes/internal/relationships/relationshipHelpers.ts` | P0 | 10 | 0 | 2 | 0 |
| `client/src/composables/formFields/useFormFieldsContext.ts` | P1 | 7 | 0 | 1 | 2 |
| `client/src/components/admin/InstanceBulkEditModal.vue` | P1 | 6 | 0 | 1 | 1 |
| `client/src/components/admin/MetadataEditModal.vue` | P1 | 6 | 0 | 1 | 1 |
| `client/src/composables/admin/useInstanceBulkEdit.ts` | P1 | 6 | 0 | 1 | 1 |
| `client/src/composables/admin/usePartInstanceBulkEdit.ts` | P1 | 6 | 0 | 1 | 1 |
| `client/src/composables/booking/useAppointmentLoader.ts` | P1 | 6 | 0 | 1 | 1 |
| `client/src/plugins/1.router/guards.ts` | P1 | 6 | 0 | 1 | 1 |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | P1 | 5 | 0 | 1 | 0 |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | P1 | 5 | 0 | 1 | 0 |
| `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` | P1 | 5 | 0 | 1 | 0 |
| `server/src/scripts/importCalendarData.ts` | P1 | 5 | 0 | 1 | 0 |
| `server/src/services/appointmentSnapshotLoader.ts` | P1 | 5 | 0 | 1 | 0 |
| `server/src/services/instanceVersioning.ts` | P1 | 5 | 0 | 1 | 0 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P2 | 2 | 0 | 0 | 2 |
| `client/src/composables/booking/usePropertyDetailsLogic.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/entityCrud/usePrimitiveMutation.ts` | P2 | 1 | 0 | 0 | 1 |

## Notes

- P0: Silent error swallowing (empty catch, silent .catch())
- P1: Console in catch blocks, type suppressions (@ts-ignore, as any)
- P2: General console usage
