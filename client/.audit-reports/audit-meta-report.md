# Audit Meta Report (Generated)

Generated at: 2026-02-10T13:52:21.687Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 64 | 64 |
| composables-logic | 170 | 170 |
| loop-mutation | 194 | 701 |
| hardcoding | 229 | 884 |
| function-complexity | 350 | 350 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 325 | 325 |
| error-handling | 46 | 85 |
| deprecation | 154 | 394 |
| security | 7 | 7 |
| todo-aging | 17 | 30 |
| import-graph | 40 | 40 |
| file-cohesion | 81 | 81 |
| api-contract | 0 | 66 |
| constants-consolidation | 92 | 217 |

Audits loaded: 17 / 17

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/configs/field/display/fullFieldDisplayConfig` | 150.0 | 1 | import-graph |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | 107.5 | 5 | loop-mutation, hardcoding, function-complexity, deprecation, file-cohesion |
| `server/src/services/slotComputationService.ts` | 101.0 | 3 | loop-mutation, hardcoding, function-complexity |
| `server/src/routes/internal/appointments/appointmentCrudRouter.ts` | 95.0 | 5 | hardcoding, deprecation, security, file-cohesion, api-contract |
| `server/src/routes/internal/entities/entityBulkRouter.ts` | 90.5 | 4 | function-complexity, security, file-cohesion, api-contract |
| `server/src/services/computedAvailabilityService.ts` | 89.0 | 4 | loop-mutation, hardcoding, function-complexity, constants-consolidation |
| `server/src/services/google/maps/mapsHelpers.ts` | 88.7 | 7 | loop-mutation, hardcoding, function-complexity, unused-code, deprecation, file-cohesion, constants-consolidation |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | 88.5 | 5 | loop-mutation, hardcoding, function-complexity, deprecation, file-cohesion |
| `server/src/scripts/importCalendarData.ts` | 86.5 | 5 | hardcoding, function-complexity, error-handling, file-cohesion, constants-consolidation |
| `server/src/routes/internal/relationships/relationshipInstanceComponentRouter.ts` | 85.0 | 4 | hardcoding, security, file-cohesion, api-contract |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 64 → 64 (→ 0)
- **composables-logic**: 170 → 170 (→ 0)
- **loop-mutation**: 705 → 701 (↓ -4)
- **hardcoding**: 897 → 884 (↓ -13)
- **function-complexity**: 351 → 350 (↓ -1)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 329 → 325 (↓ -4)
- **error-handling**: 99 → 85 (↓ -14)
- **deprecation**: 398 → 394 (↓ -4)
- **security**: 7 → 7 (→ 0)
- **todo-aging**: 30 → 30 (→ 0)
- **import-graph**: 40 → 40 (→ 0)
- **file-cohesion**: 83 → 81 (↓ -2)
- **api-contract**: 66 → 66 (→ 0)
- **constants-consolidation**: 219 → 217 (↓ -2)

## Exception Creep

Total allowed exceptions across all audits: **1313**
Previous run: 1313 (→ 0)

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/utils/transformers/fetchToGlobalTransformer.ts` (5 audits): loop-mutation, hardcoding, function-complexity, deprecation, file-cohesion
- `server/src/services/slotComputationService.ts` (3 audits): loop-mutation, hardcoding, function-complexity
- `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (5 audits): hardcoding, deprecation, security, file-cohesion, api-contract
- `server/src/routes/internal/entities/entityBulkRouter.ts` (4 audits): function-complexity, security, file-cohesion, api-contract
- `server/src/services/computedAvailabilityService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, constants-consolidation
- `server/src/services/google/maps/mapsHelpers.ts` (7 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation, file-cohesion, constants-consolidation
- `client/src/utils/transformers/appointmentToWizardTransformer.ts` (5 audits): loop-mutation, hardcoding, function-complexity, deprecation, file-cohesion
- `server/src/scripts/importCalendarData.ts` (5 audits): hardcoding, function-complexity, error-handling, file-cohesion, constants-consolidation
- `server/src/routes/internal/relationships/relationshipInstanceComponentRouter.ts` (4 audits): hardcoding, security, file-cohesion, api-contract
- `server/src/services/google/maps/routesApiService.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation, constants-consolidation
- `client/src/utils/transformers/globalToBookingTransformer.ts` (5 audits): loop-mutation, function-complexity, deprecation, file-cohesion, constants-consolidation
- `client/src/composables/admin/useBusinessRules.ts` (7 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation, constants-consolidation
- `server/src/routes/internal/relationships/relationshipHelpers.ts` (4 audits): hardcoding, function-complexity, error-handling, constants-consolidation
- `client/src/views/admin/tabs/components/AppointmentsTable.vue` (7 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, todo-aging, file-cohesion
- `client/src/views/admin/tabs/BusinessRulesTab.vue` (4 audits): hardcoding, function-complexity, deprecation, file-cohesion
