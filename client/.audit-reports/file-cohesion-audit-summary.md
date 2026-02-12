# File Cohesion Audit Summary (Generated)

Generated from `.audit-reports/file-cohesion-audit.json`.

- Files with violations: **82**

## Top 30 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/configs/availabilitySettings.ts` | general | P0 | 40 | 668 | 24 | oversized, high-exports |
| `server/src/db/models/admin/business_settings.ts` | general | P0 | 22 | 327 | 21 | high-exports |
| `client/src/views/admin/tabs/ShapesTab.vue` | components | P0 | 18 | 1006 | 0 | oversized |
| `client/src/views/admin/tabs/InstancesTab.vue` | components | P0 | 12 | 875 | 0 | oversized |
| `client/src/vite-env.d.ts` | general | P0 | 12 | 143 | 16 | high-exports |
| `client/src/components/admin/generic/EntityCard.vue` | components | P1 | 9 | 704 | 0 | oversized |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | components | P1 | 9 | 756 | 0 | oversized |
| `server/src/scripts/importCalendarData.ts` | general | P1 | 7 | 475 | 0 | oversized, no-exports |
| `client/src/components/booking/BookingWizard.vue` | components | P1 | 6 | 635 | 0 | oversized |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | utils | P1 | 6 | 405 | 4 | oversized |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | utils | P1 | 6 | 415 | 6 | oversized |
| `server/src/services/slotComputationService.ts` | services | P1 | 6 | 527 | 1 | oversized |
| `client/src/constants/apiStatus.ts` | general | P1 | 4 | 76 | 12 | high-exports |
| `client/src/constants/entities.ts` | general | P1 | 4 | 29 | 12 | high-exports |
| `client/src/composables/admin/useSelectConfig.ts` | composables | P2 | 3 | 443 | 3 | oversized |
| `client/src/composables/admin/useSelectFiltering.ts` | composables | P2 | 3 | 472 | 3 | oversized |
| `client/src/composables/booking/useAvailabilityLogic.ts` | composables | P2 | 3 | 429 | 3 | oversized |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | composables | P2 | 3 | 449 | 1 | oversized |
| `client/src/configs/field/display/selectableDisplayConfig.ts` | general | P2 | 3 | 423 | 5 | oversized |
| `client/src/utils/booking/mockGoogleCalendar.ts` | utils | P2 | 3 | 335 | 3 | oversized |
| `client/src/utils/booking/partFinalizer.ts` | utils | P2 | 3 | 319 | 4 | oversized |
| `client/src/utils/differentialScheduling.ts` | utils | P2 | 3 | 321 | 6 | oversized |
| `client/src/utils/tablerIcons.ts` | utils | P2 | 3 | 366 | 1 | oversized |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | utils | P2 | 3 | 350 | 2 | oversized |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | components | P2 | 3 | 525 | 0 | oversized |
| `server/src/scripts/helpers/calendarParsingHelpers.ts` | utils | P2 | 3 | 308 | 7 | oversized |
| `server/src/services/computedAvailabilityService.ts` | services | P2 | 3 | 420 | 1 | oversized |
| `client/src/constants/fieldMetadata.ts` | general | P2 | 2 | 124 | 11 | high-exports |
| `client/src/utils/entities/entityTypeMapping.ts` | utils | P2 | 2 | 108 | 11 | high-exports |
| `server/src/routes/internal/properties/propertyHelpers.ts` | routes | P2 | 2 | 233 | 11 | high-exports |

*...and 52 more files.*
