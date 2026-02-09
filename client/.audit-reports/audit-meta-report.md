# Audit Meta Report (Generated)

Generated at: 2026-02-08T23:31:55.243Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 63 | 63 |
| composables-logic | 167 | 167 |
| loop-mutation | 198 | 842 |
| hardcoding | 212 | 1124 |
| function-complexity | 356 | 356 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 313 | 313 |
| error-handling | 81 | 622 |
| deprecation | 155 | 433 |
| security | 78 | 78 |
| todo-aging | 16 | 25 |
| import-graph | 35 | 35 |
| file-cohesion | 97 | 97 |
| api-contract | 0 | 77 |

Audits loaded: 16 / 16

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/routes/internal/properties/propertyRouter.ts` | 542.5 | 7 | hardcoding, function-complexity, error-handling, deprecation, security, file-cohesion, api-contract |
| `server/src/routes/internal/entities/entityRouter.ts` | 482.5 | 7 | hardcoding, function-complexity, error-handling, deprecation, security, file-cohesion, api-contract |
| `server/src/routes/internal/relationships/relationshipRouter.ts` | 463.5 | 7 | hardcoding, function-complexity, unused-code, error-handling, security, file-cohesion, api-contract |
| `server/src/routes/internal/appointments/appointmentRouter.ts` | 362.0 | 7 | hardcoding, function-complexity, error-handling, deprecation, security, file-cohesion, api-contract |
| `client/src/utils/booking/timeAvailabilityManager.ts` | 330.0 | 7 | loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation, file-cohesion |
| `server/src/services/googleMapsService.ts` | 310.0 | 7 | loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation, file-cohesion |
| `server/src/routes/internal/users/userRouter.ts` | 308.5 | 5 | hardcoding, error-handling, security, file-cohesion, api-contract |
| `server/src/routes/internal/businessSettingsRouter.ts` | 257.0 | 6 | hardcoding, function-complexity, error-handling, security, file-cohesion, api-contract |
| `server/src/scripts/fix-missing-layout-configs.mjs` | 238.0 | 5 | hardcoding, function-complexity, error-handling, security, file-cohesion |
| `server/src/routes/internal/businessRulesRouter.ts` | 234.5 | 4 | hardcoding, error-handling, security, api-contract |

## Exception Creep

Total allowed exceptions across all audits: **1319**

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `server/src/routes/internal/properties/propertyRouter.ts` (7 audits): hardcoding, function-complexity, error-handling, deprecation, security, file-cohesion, api-contract
- `server/src/routes/internal/entities/entityRouter.ts` (7 audits): hardcoding, function-complexity, error-handling, deprecation, security, file-cohesion, api-contract
- `server/src/routes/internal/relationships/relationshipRouter.ts` (7 audits): hardcoding, function-complexity, unused-code, error-handling, security, file-cohesion, api-contract
- `server/src/routes/internal/appointments/appointmentRouter.ts` (7 audits): hardcoding, function-complexity, error-handling, deprecation, security, file-cohesion, api-contract
- `client/src/utils/booking/timeAvailabilityManager.ts` (7 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation, file-cohesion
- `server/src/services/googleMapsService.ts` (7 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation, file-cohesion
- `server/src/routes/internal/users/userRouter.ts` (5 audits): hardcoding, error-handling, security, file-cohesion, api-contract
- `server/src/routes/internal/businessSettingsRouter.ts` (6 audits): hardcoding, function-complexity, error-handling, security, file-cohesion, api-contract
- `server/src/scripts/fix-missing-layout-configs.mjs` (5 audits): hardcoding, function-complexity, error-handling, security, file-cohesion
- `server/src/routes/internal/businessRulesRouter.ts` (4 audits): hardcoding, error-handling, security, api-contract
- `server/src/routes/internal/admin-metadata/adminMetadataRouter.ts` (5 audits): hardcoding, function-complexity, error-handling, security, api-contract
- `server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs` (5 audits): function-complexity, error-handling, deprecation, security, file-cohesion
- `server/src/scripts/importCalendarData.ts` (5 audits): hardcoding, function-complexity, error-handling, deprecation, file-cohesion
- `client/src/components/admin/dev/ApiDevPanel.vue` (7 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation, file-cohesion
- `server/src/services/googleCalendarService.ts` (8 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation, security, file-cohesion
