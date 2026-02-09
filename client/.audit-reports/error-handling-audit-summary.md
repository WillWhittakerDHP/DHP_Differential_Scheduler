# Error Handling Audit Summary (Generated)

Generated from `.audit-reports/error-handling-audit.json`.

- Requiring review: **622**
- Allowed exceptions: 0

## Top 30 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/routes/internal/relationships/relationshipRouter.ts` | P0 | 79 | 0 | 15 | 4 |
| `server/src/routes/internal/properties/propertyRouter.ts` | P0 | 76 | 0 | 15 | 1 |
| `server/src/routes/internal/entities/entityRouter.ts` | P0 | 63 | 0 | 12 | 3 |
| `server/src/test/setup/seedTestData.ts` | P0 | 61 | 0 | 12 | 1 |
| `server/src/scripts/importCalendarData.ts` | P0 | 57 | 0 | 8 | 17 |
| `server/src/routes/internal/admin-metadata/adminMetadataRouter.ts` | P0 | 55 | 0 | 10 | 5 |
| `server/src/routes/internal/appointments/appointmentRouter.ts` | P0 | 52 | 0 | 9 | 7 |
| `server/src/app.ts` | P0 | 49 | 0 | 8 | 9 |
| `server/src/scripts/fix-missing-layout-configs.mjs` | P0 | 48 | 0 | 4 | 28 |
| `server/src/scripts/createAppointmentsFromCalendar.ts` | P0 | 46 | 0 | 7 | 11 |
| `server/src/routes/internal/users/userRouter.ts` | P0 | 45 | 0 | 9 | 0 |
| `server/src/scripts/fixUserRolesAndEmails.ts` | P0 | 41 | 0 | 4 | 21 |
| `server/src/scripts/manual-migrate-fieldmetadata.mjs` | P0 | 38 | 0 | 2 | 28 |
| `client/src/components/admin/dev/ApiDevPanel.vue` | P0 | 37 | 0 | 7 | 2 |
| `server/src/config/app.js` | P0 | 35 | 0 | 7 | 0 |
| `server/src/routes/internal/businessRulesRouter.ts` | P0 | 35 | 0 | 7 | 0 |
| `server/src/services/googleCalendarService.ts` | P0 | 33 | 1 | 1 | 18 |
| `server/src/routes/external/googleOauthRoutes.ts` | P0 | 32 | 0 | 6 | 2 |
| `server/src/config/googleOAuth.ts` | P0 | 31 | 0 | 4 | 11 |
| `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataRouter.ts` | P0 | 30 | 0 | 6 | 0 |
| `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataRouter.ts` | P0 | 30 | 0 | 6 | 0 |
| `server/src/routes/internal/businessSettingsRouter.ts` | P0 | 30 | 0 | 6 | 0 |
| `server/src/scripts/backfill-input-config-from-selectable.mjs` | P0 | 28 | 0 | 2 | 18 |
| `server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs` | P0 | 26 | 0 | 2 | 16 |
| `server/src/scripts/setDifferentialServices.mjs` | P0 | 25 | 0 | 3 | 10 |
| `server/src/scripts/fix-appointment-data.mjs` | P0 | 24 | 0 | 3 | 9 |
| `server/src/scripts/check-layout-configs.mjs` | P0 | 23 | 0 | 2 | 13 |
| `server/src/scripts/check-specific-shape.mjs` | P0 | 23 | 0 | 2 | 13 |
| `server/src/scripts/fix-validConstituents.mjs` | P0 | 22 | 0 | 2 | 12 |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P0 | 21 | 0 | 3 | 6 |

*...and 51 more files. See full report for details.*

## Notes

- P0: Silent error swallowing (empty catch, silent .catch())
- P1: Console in catch blocks, type suppressions (@ts-ignore, as any)
- P2: General console usage
