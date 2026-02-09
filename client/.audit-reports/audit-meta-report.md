# Audit Meta Report (Generated)

Generated at: 2026-02-09T16:43:28.285Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 65 | 65 |
| composables-logic | 169 | 169 |
| loop-mutation | 209 | 825 |
| hardcoding | 244 | 1037 |
| function-complexity | 385 | 385 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 328 | 328 |
| error-handling | 86 | 465 |
| deprecation | 164 | 435 |
| security | 19 | 19 |
| todo-aging | 18 | 32 |
| import-graph | 38 | 38 |
| file-cohesion | 114 | 114 |
| api-contract | 0 | 65 |
| constants-consolidation | 85 | 211 |

Audits loaded: 17 / 17

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs` | 194.0 | 5 | function-complexity, error-handling, deprecation, security, file-cohesion |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | 174.0 | 7 | loop-mutation, function-complexity, unused-code, error-handling, deprecation, file-cohesion, constants-consolidation |
| `server/src/config/googleOAuth.ts` | 165.0 | 5 | loop-mutation, function-complexity, unused-code, error-handling, security |
| `server/src/scripts/createAppointmentsFromCalendar.ts` | 158.5 | 5 | hardcoding, function-complexity, error-handling, deprecation, file-cohesion |
| `server/src/scripts/fix-primitive-metadata-cleanup.mjs` | 157.0 | 5 | function-complexity, error-handling, deprecation, security, file-cohesion |
| `client/src/configs/field/display/fullFieldDisplayConfig` | 150.0 | 1 | import-graph |
| `server/src/scripts/manual-migrate-fieldmetadata.mjs` | 145.0 | 4 | function-complexity, error-handling, security, file-cohesion |
| `server/src/app.ts` | 143.5 | 6 | hardcoding, function-complexity, unused-code, error-handling, security, constants-consolidation |
| `server/src/services/google/maps/placesApiService.ts` | 140.5 | 5 | loop-mutation, hardcoding, function-complexity, error-handling, deprecation |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | 135.5 | 7 | loop-mutation, hardcoding, function-complexity, unused-code, deprecation, todo-aging, file-cohesion |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 63 → 65 (↑ +2)
- **composables-logic**: 167 → 169 (↑ +2)
- **loop-mutation**: 842 → 825 (↓ -17)
- **hardcoding**: 1055 → 1037 (↓ -18)
- **function-complexity**: 371 → 385 (↑ +14)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 320 → 328 (↑ +8)
- **error-handling**: 539 → 465 (↓ -74)
- **deprecation**: 439 → 435 (↓ -4)
- **security**: 82 → 19 (↓ -63)
- **todo-aging**: 25 → 32 (↑ +7)
- **import-graph**: 37 → 38 (↑ +1)
- **file-cohesion**: 113 → 114 (↑ +1)
- **api-contract**: 77 → 65 (↓ -12)
- **constants-consolidation**: 190 → 211 (↑ +21)

## Exception Creep

Total allowed exceptions across all audits: **1314**
Previous run: 1319 (↓ -5)

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs` (5 audits): function-complexity, error-handling, deprecation, security, file-cohesion
- `client/src/utils/transformers/appointmentToWizardTransformer.ts` (7 audits): loop-mutation, function-complexity, unused-code, error-handling, deprecation, file-cohesion, constants-consolidation
- `server/src/config/googleOAuth.ts` (5 audits): loop-mutation, function-complexity, unused-code, error-handling, security
- `server/src/scripts/createAppointmentsFromCalendar.ts` (5 audits): hardcoding, function-complexity, error-handling, deprecation, file-cohesion
- `server/src/scripts/fix-primitive-metadata-cleanup.mjs` (5 audits): function-complexity, error-handling, deprecation, security, file-cohesion
- `server/src/scripts/manual-migrate-fieldmetadata.mjs` (4 audits): function-complexity, error-handling, security, file-cohesion
- `server/src/app.ts` (6 audits): hardcoding, function-complexity, unused-code, error-handling, security, constants-consolidation
- `server/src/services/google/maps/placesApiService.ts` (5 audits): loop-mutation, hardcoding, function-complexity, error-handling, deprecation
- `client/src/views/admin/tabs/BusinessControlsTab.vue` (7 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation, todo-aging, file-cohesion
- `server/src/scripts/backfill-input-config-from-selectable.mjs` (5 audits): hardcoding, function-complexity, error-handling, security, constants-consolidation
- `server/src/config/app.js` (5 audits): loop-mutation, function-complexity, unused-code, error-handling, file-cohesion
- `server/src/services/calendarErrorHandler.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation
- `server/src/services/constraintExtractor.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `server/src/routes/helpers/createCrudRouter.ts` (7 audits): hardcoding, function-complexity, unused-code, error-handling, file-cohesion, api-contract, constants-consolidation
- `server/src/test/setup/seedTestData.ts` (4 audits): hardcoding, function-complexity, unused-code, error-handling
