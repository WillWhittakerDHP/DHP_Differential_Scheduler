# Type-Import Audit Summary (Generated)

Generated from `.audit-reports/type-import-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 783 |
| value-import-from-type-only-file | 89 |
| type-used-as-value | 36 |
| Files with findings | 64 |

## Top 20 files (by score)

| File | Score |
| --- | ---: |
| `server/src/config/entityRegistry.ts` | 16 |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | 16 |
| `client/src/types/wizard.ts` | 12 |
| `server/src/routes/internal/properties/propertyHelpers.ts` | 12 |
| `server/src/scripts/importCalendarData.ts` | 12 |
| `server/src/services/appointmentCalendarService.ts` | 10 |
| `server/src/services/instanceVersioning.ts` | 10 |
| `client/src/types/appointmentApi.ts` | 8 |
| `client/src/types/user.ts` | 8 |
| `server/src/routes/internal/properties/propertyTypesRouter.ts` | 8 |
| `client/src/composables/useLocalTime.ts` | 6 |
| `server/src/routes/internal/entities/entityHelpers.ts` | 6 |
| `server/src/routes/internal/properties/propertyCrudRouter.ts` | 6 |
| `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` | 4 |
| `client/src/composables/booking/useWizardDevMode.ts` | 4 |
| `client/src/types/property.ts` | 4 |
| `server/src/routes/internal/appointments/appointmentCrudRouter.ts` | 4 |
| `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` | 4 |
| `server/src/routes/internal/businessRulesCrudRouter.ts` | 4 |
| `server/src/routes/internal/relationships/relationshipCrudRouter.ts` | 4 |

*...and 44 more files. See full report for details.*

## Notes

- Full report: `client/.audit-reports/type-import-audit.md`
- value-import-from-type-only-file: importing a value from a file that only exports types
- type-used-as-value: symbol imported with "import type" but used in value position
