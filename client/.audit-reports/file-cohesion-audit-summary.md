# File Cohesion Audit Summary (Generated)

Generated from `.audit-reports/file-cohesion-audit.json`.

- Files with violations: **81**

## Top 30 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/configs/availabilitySettings.ts` | general | P0 | 37 | 649 | 24 | oversized, high-exports |
| `client/src/utils/api.ts` | utils | P0 | 26 | 237 | 23 | high-exports |
| `server/src/db/models/admin/business_settings.ts` | general | P0 | 22 | 314 | 21 | high-exports |
| `client/src/types/appointment.ts` | general | P0 | 19 | 374 | 18 | oversized, high-exports |
| `client/src/views/admin/tabs/ShapesTab.vue` | components | P0 | 18 | 1005 | 0 | oversized |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | components | P0 | 12 | 867 | 0 | oversized |
| `client/src/views/admin/tabs/InstancesTab.vue` | components | P0 | 12 | 862 | 0 | oversized |
| `client/src/vite-env.d.ts` | general | P0 | 12 | 143 | 16 | high-exports |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | components | P1 | 9 | 759 | 0 | oversized |
| `client/src/components/booking/steps/AvailabilityStep.vue` | components | P1 | 9 | 775 | 0 | oversized |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | utils | P1 | 9 | 508 | 4 | oversized |
| `server/src/scripts/importCalendarData.ts` | general | P1 | 7 | 491 | 0 | oversized, no-exports |
| `client/src/components/admin/generic/EntityCard.vue` | components | P1 | 6 | 644 | 0 | oversized |
| `client/src/components/booking/BookingWizard.vue` | components | P1 | 6 | 635 | 0 | oversized |
| `client/src/constants/apiStatus.ts` | general | P1 | 4 | 76 | 12 | high-exports |
| `client/src/constants/entities.ts` | general | P1 | 4 | 27 | 12 | high-exports |
| `server/src/routes/internal/relationships/relationshipCrudRouter.ts` | routes | P1 | 4 | 450 | 0 | oversized, no-exports |
| `client/src/composables/admin/useSelectConfig.ts` | composables | P2 | 3 | 424 | 3 | oversized |
| `client/src/composables/admin/useSelectFiltering.ts` | composables | P2 | 3 | 470 | 3 | oversized |
| `client/src/composables/booking/useAvailabilityLogic.ts` | composables | P2 | 3 | 429 | 3 | oversized |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | composables | P2 | 3 | 421 | 1 | oversized |
| `client/src/configs/field/display/selectableDisplayConfig.ts` | general | P2 | 3 | 422 | 5 | oversized |
| `client/src/utils/booking/mockGoogleCalendar.ts` | utils | P2 | 3 | 332 | 3 | oversized |
| `client/src/utils/booking/partFinalizer.ts` | utils | P2 | 3 | 315 | 4 | oversized |
| `client/src/utils/tablerIcons.ts` | utils | P2 | 3 | 366 | 1 | oversized |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | utils | P2 | 3 | 363 | 2 | oversized |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | utils | P2 | 3 | 372 | 6 | oversized |
| `client/src/views/admin/tabs/BusinessRulesTab.vue` | components | P2 | 3 | 529 | 0 | oversized |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | utils | P2 | 3 | 313 | 5 | oversized |
| `client/src/types/entities.ts` | general | P2 | 2 | 93 | 11 | high-exports |

*...and 51 more files.*
