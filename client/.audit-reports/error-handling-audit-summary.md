# Error Handling Audit Summary (Generated)

Generated from `.audit-reports/error-handling-audit.json`.

- Requiring review: **465**
- Allowed exceptions: 0

## Top 30 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/test/setup/seedTestData.ts` | P0 | 61 | 0 | 12 | 1 |
| `server/src/app.ts` | P0 | 49 | 0 | 8 | 9 |
| `server/src/scripts/createAppointmentsFromCalendar.ts` | P0 | 46 | 0 | 7 | 11 |
| `server/src/scripts/fixUserRolesAndEmails.ts` | P0 | 41 | 0 | 4 | 21 |
| `server/src/scripts/manual-migrate-fieldmetadata.mjs` | P0 | 38 | 0 | 2 | 28 |
| `server/src/config/app.js` | P0 | 35 | 0 | 7 | 0 |
| `server/src/routes/external/googleOauthRoutes.ts` | P0 | 32 | 0 | 6 | 2 |
| `server/src/config/googleOAuth.ts` | P0 | 31 | 0 | 4 | 11 |
| `server/src/routes/helpers/createCrudRouter.ts` | P0 | 30 | 0 | 6 | 0 |
| `server/src/scripts/backfill-input-config-from-selectable.mjs` | P0 | 28 | 0 | 2 | 18 |
| `server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs` | P0 | 26 | 0 | 2 | 16 |
| `server/src/scripts/setDifferentialServices.mjs` | P0 | 25 | 0 | 3 | 10 |
| `server/src/scripts/fix-appointment-data.mjs` | P0 | 24 | 0 | 3 | 9 |
| `server/src/scripts/check-layout-configs.mjs` | P0 | 23 | 0 | 2 | 13 |
| `server/src/scripts/check-specific-shape.mjs` | P0 | 23 | 0 | 2 | 13 |
| `server/src/scripts/fix-validConstituents.mjs` | P0 | 22 | 0 | 2 | 12 |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P0 | 21 | 0 | 3 | 6 |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | P0 | 21 | 0 | 4 | 1 |
| `server/src/routes/internal/properties/propertyHelpers.ts` | P0 | 20 | 0 | 4 | 0 |
| `server/src/scripts/fix-primitive-metadata-cleanup.mjs` | P0 | 20 | 0 | 1 | 15 |
| `server/src/services/appointmentCalendarService.ts` | P0 | 20 | 0 | 2 | 10 |
| `server/src/scripts/flatten-input-config.mjs` | P0 | 19 | 0 | 3 | 4 |
| `server/src/config/app.ts` | P0 | 16 | 0 | 2 | 6 |
| `server/src/services/calendarErrorHandler.ts` | P0 | 16 | 0 | 2 | 6 |
| `server/src/routes/external/calendarRoutes.ts` | P0 | 15 | 0 | 3 | 0 |
| `server/src/routes/external/mapsRoutes.ts` | P0 | 15 | 0 | 3 | 0 |
| `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataCrudRouter.ts` | P0 | 15 | 0 | 3 | 0 |
| `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataCrudRouter.ts` | P0 | 15 | 0 | 3 | 0 |
| `server/src/routes/internal/businessSettings/businessSettingsHelpers.ts` | P0 | 15 | 0 | 3 | 0 |
| `server/src/scripts/fix-appointment-block-instances.mjs` | P0 | 15 | 0 | 1 | 10 |

*...and 56 more files. See full report for details.*

## Notes

- P0: Silent error swallowing (empty catch, silent .catch())
- P1: Console in catch blocks, type suppressions (@ts-ignore, as any)
- P2: General console usage
