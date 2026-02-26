# Allowlist Cleanup Audit (Generated)

Generated at: 2026-02-26T00:04:12.494Z

## Summary

- Suppression hits recorded: **2** (error-handling, type-import)
- Missing audit JSON inputs: **0**
- Prune suggestions: **0**
- Missing allowlist specific file references: **14**
- Never-permissible allowlist violations: **0**

## Missing Specific File References

| Audit | File | Rule IDs |
| --- | --- | --- |
| import-graph | `client/src/composables/useAppointment` | * |
| import-graph | `client/src/composables/useProperty` | * |
| import-graph | `client/src/composables/useUser` | * |
| import-graph | `client/src/composables/admin/useBusinessRulesTab` | * |
| import-graph | `client/src/composables/admin/useEntityCardSaveAndActions` | * |
| import-graph | `client/src/composables/admin/usePartInstanceCollection` | * |
| import-graph | `client/src/composables/admin/useRelationshipCollection` | * |
| import-graph | `client/src/composables/booking/useAvailabilityOrchestrator` | * |
| import-graph | `client/src/composables/booking/useDevPanelsAppointmentData` | * |
| import-graph | `client/src/composables/admin/tables/useAppointmentsTableModel` | * |
| import-graph | `client/src/composables/admin/tables/usePropertiesTableModel` | * |
| import-graph | `client/src/composables/admin/tables/useUsersTableModel` | * |
| import-graph | `client/src/composables/booking/useAppointmentLoader` | * |
| import-graph | `client/src/composables/admin/useEntityCardFormSetup` | * |

## Result

- **FAIL**: Fix allowlist integrity issues before relying on audit outputs.
