# File Cohesion Audit Summary (Generated)

Generated from `.audit-reports/file-cohesion-audit.json`.

- Files with violations: **78**

## Top 30 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/configs/availabilitySettings.ts` | general | P0 | 40 | 668 | 24 | oversized, high-exports |
| `server/src/db/models/admin/business_settings.ts` | general | P0 | 22 | 327 | 21 | high-exports |
| `client/src/views/admin/tabs/ShapesTab.vue` | components | P0 | 18 | 1006 | 0 | oversized |
| `client/src/views/admin/tabs/InstancesTab.vue` | components | P0 | 12 | 862 | 0 | oversized |
| `client/src/vite-env.d.ts` | general | P0 | 12 | 143 | 16 | high-exports |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | components | P1 | 9 | 755 | 0 | oversized |
| `server/src/scripts/importCalendarData.ts` | general | P1 | 7 | 475 | 0 | oversized, no-exports |
| `client/src/components/admin/generic/EntityCard.vue` | components | P1 | 6 | 693 | 0 | oversized |
| `client/src/components/booking/BookingWizard.vue` | components | P1 | 6 | 635 | 0 | oversized |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | utils | P1 | 6 | 415 | 6 | oversized |
| `server/src/services/slotComputationService.ts` | services | P1 | 6 | 527 | 1 | oversized |
| `client/src/constants/apiStatus.ts` | general | P1 | 4 | 76 | 12 | high-exports |
| `client/src/constants/entities.ts` | general | P1 | 4 | 29 | 12 | high-exports |
| `client/src/composables/admin/useSelectConfig.ts` | composables | P2 | 3 | 443 | 3 | oversized |
| `client/src/composables/admin/useSelectFiltering.ts` | composables | P2 | 3 | 472 | 3 | oversized |
| `client/src/composables/booking/useAvailabilityLogic.ts` | composables | P2 | 3 | 429 | 3 | oversized |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | composables | P2 | 3 | 416 | 1 | oversized |
| `client/src/configs/field/display/selectableDisplayConfig.ts` | general | P2 | 3 | 423 | 5 | oversized |
| `client/src/utils/booking/mockGoogleCalendar.ts` | utils | P2 | 3 | 332 | 3 | oversized |
| `client/src/utils/booking/partFinalizer.ts` | utils | P2 | 3 | 301 | 4 | oversized |
| `client/src/utils/tablerIcons.ts` | utils | P2 | 3 | 366 | 1 | oversized |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | utils | P2 | 3 | 350 | 2 | oversized |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | utils | P2 | 3 | 393 | 4 | oversized |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | components | P2 | 3 | 525 | 0 | oversized |
| `server/src/services/computedAvailabilityService.ts` | services | P2 | 3 | 418 | 1 | oversized |
| `client/src/utils/entities/entityTypeMapping.ts` | utils | P2 | 2 | 108 | 11 | high-exports |
| `server/src/routes/internal/relationships/relationshipHelpers.ts` | routes | P2 | 2 | 307 | 11 | high-exports |
| `client/src/composables/admin/useEntityCardReadiness.ts` | composables | P2 | 1 | 9 | 0 | no-exports |
| `client/src/composables/booking/useSelectionCard.ts` | composables | P2 | 1 | 3 | 0 | no-exports |
| `client/src/composables/booking/useSelectionCardComponent.ts` | composables | P2 | 1 | 4 | 0 | no-exports |

*...and 48 more files.*
