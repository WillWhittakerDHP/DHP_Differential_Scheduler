# File Cohesion Audit Summary (Generated)

Generated from `.audit-reports/file-cohesion-audit.json`.

- Files with violations: **97**

## Top 30 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/configs/availabilitySettings.ts` | general | P0 | 37 | 649 | 24 | oversized, high-exports |
| `client/src/utils/booking/timeAvailabilityManager.ts` | utils | P0 | 36 | 1439 | 8 | oversized |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | components | P0 | 36 | 1650 | 0 | oversized |
| `server/src/services/googleMapsService.ts` | services | P0 | 28 | 929 | 15 | oversized, high-exports |
| `client/src/components/admin/dev/ApiDevPanel.vue` | components | P0 | 27 | 1349 | 0 | oversized |
| `client/src/utils/api.ts` | utils | P0 | 22 | 217 | 21 | high-exports |
| `server/src/db/models/admin/business_settings.ts` | general | P0 | 22 | 314 | 21 | high-exports |
| `client/src/types/appointment.ts` | general | P0 | 19 | 366 | 18 | oversized, high-exports |
| `client/src/views/admin/tabs/ShapesTab.vue` | components | P0 | 18 | 1005 | 0 | oversized |
| `server/src/routes/internal/relationships/relationshipRouter.ts` | routes | P0 | 16 | 835 | 0 | oversized, no-exports |
| `server/src/scripts/createAppointmentsFromCalendar.ts` | general | P0 | 13 | 671 | 0 | oversized, no-exports |
| `client/src/components/booking/steps/AvailabilityStep.vue` | components | P0 | 12 | 812 | 0 | oversized |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | components | P0 | 12 | 867 | 0 | oversized |
| `client/src/views/admin/tabs/InstancesTab.vue` | components | P0 | 12 | 862 | 0 | oversized |
| `client/src/vite-env.d.ts` | general | P0 | 12 | 143 | 16 | high-exports |
| `server/src/routes/internal/entities/entityRouter.ts` | routes | P0 | 10 | 613 | 0 | oversized, no-exports |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | components | P1 | 9 | 759 | 0 | oversized |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | utils | P1 | 9 | 525 | 2 | oversized |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | utils | P1 | 9 | 504 | 4 | oversized |
| `server/src/services/googleCalendarService.ts` | services | P1 | 9 | 610 | 10 | oversized |
| `server/src/routes/internal/businessSettingsRouter.ts` | routes | P1 | 7 | 558 | 0 | oversized, no-exports |
| `server/src/routes/internal/properties/propertyRouter.ts` | routes | P1 | 7 | 591 | 0 | oversized, no-exports |
| `server/src/scripts/importCalendarData.ts` | general | P1 | 7 | 503 | 0 | oversized, no-exports |
| `client/src/components/admin/generic/EntityCard.vue` | components | P1 | 6 | 644 | 0 | oversized |
| `client/src/components/booking/BookingWizard.vue` | components | P1 | 6 | 629 | 0 | oversized |
| `client/src/services/mapsApiService.ts` | services | P1 | 6 | 359 | 13 | high-exports |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | utils | P1 | 6 | 430 | 7 | oversized |
| `client/src/utils/booking/timeSlotFitter.ts` | utils | P1 | 6 | 419 | 10 | oversized |
| `client/src/utils/transformers/relationshipTransformers.ts` | utils | P1 | 5 | 351 | 11 | oversized, high-exports |
| `client/src/constants/entities.ts` | general | P1 | 4 | 27 | 12 | high-exports |

*...and 67 more files.*
