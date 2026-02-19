# File Cohesion Audit Summary (Generated)

Generated from `.audit-reports/file-cohesion-audit.json`.

- Files with violations: **91**

## Top 30 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | components | P1 | 9 | 724 | 0 | oversized |
| `server/src/scripts/importCalendarData.ts` | general | P1 | 7 | 475 | 0 | oversized, no-exports |
| `client/src/components/booking/BookingWizard.vue` | components | P1 | 6 | 644 | 0 | oversized |
| `client/src/configs/availabilitySettings.ts` | general | P1 | 6 | 506 | 13 | high-exports |
| `client/src/configs/field/display/selectableDisplayConfig.ts` | general | P1 | 6 | 497 | 5 | oversized |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | utils | P1 | 6 | 404 | 4 | oversized |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | utils | P1 | 6 | 430 | 6 | oversized |
| `server/src/services/slotComputationService.ts` | services | P1 | 6 | 537 | 1 | oversized |
| `client/src/constants/apiStatus.ts` | general | P1 | 4 | 76 | 12 | high-exports |
| `client/src/types/entities.ts` | general | P1 | 4 | 113 | 12 | high-exports |
| `server/src/routes/internal/relationships/relationshipHelpers.ts` | routes | P1 | 4 | 341 | 12 | high-exports |
| `client/src/composables/admin/useSelectConfig.ts` | composables | P2 | 3 | 443 | 3 | oversized |
| `client/src/composables/admin/useSelectFiltering.ts` | composables | P2 | 3 | 472 | 3 | oversized |
| `client/src/composables/booking/useAvailabilityLogic.ts` | composables | P2 | 3 | 429 | 3 | oversized |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | composables | P2 | 3 | 432 | 1 | oversized |
| `client/src/utils/booking/mockGoogleCalendar.ts` | utils | P2 | 3 | 335 | 3 | oversized |
| `client/src/utils/booking/partFinalizer.ts` | utils | P2 | 3 | 318 | 4 | oversized |
| `client/src/utils/tablerIcons.ts` | utils | P2 | 3 | 366 | 1 | oversized |
| `client/src/utils/transformers/appointmentToWizardHelpers.ts` | utils | P2 | 3 | 334 | 7 | oversized |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | utils | P2 | 3 | 320 | 2 | oversized |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | components | P2 | 3 | 525 | 0 | oversized |
| `server/src/routes/helpers/crudRouteHandlers.ts` | utils | P2 | 3 | 311 | 5 | oversized |
| `server/src/scripts/helpers/calendarParsingHelpers.ts` | utils | P2 | 3 | 308 | 7 | oversized |
| `server/src/services/computedAvailabilityService.ts` | services | P2 | 3 | 434 | 1 | oversized |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | utils | P2 | 3 | 377 | 8 | oversized |
| `client/src/constants/entities.ts` | general | P2 | 2 | 30 | 11 | high-exports |
| `client/src/constants/fieldMetadata.ts` | general | P2 | 2 | 122 | 11 | high-exports |
| `client/src/utils/entities/entityTypeMapping.ts` | utils | P2 | 2 | 108 | 11 | high-exports |
| `server/src/routes/internal/properties/propertyHelpers.ts` | routes | P2 | 2 | 233 | 11 | high-exports |
| `client/src/composables/admin/useEntityCardReadiness.ts` | composables | P2 | 1 | 9 | 0 | no-exports |

*...and 61 more files.*
