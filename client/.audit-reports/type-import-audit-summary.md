# Type-Import Audit Summary (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated from `.audit-reports/type-import-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 796 |
| value-import-from-type-only-file | 0 |
| type-used-as-value | 21 |
| Files with findings | 12 |

## Top 12 files (by score)

| File | Score |
| --- | ---: |
| `client/src/types/appointmentApi.ts` | 8 |
| `client/src/types/user.ts` | 8 |
| `client/src/composables/useLocalTime.ts` | 6 |
| `client/src/types/property.ts` | 4 |
| `client/src/composables/admin/usePartsCollectionField.ts` | 2 |
| `client/src/composables/booking/usePerspectiveMapping.ts` | 2 |
| `client/src/composables/fieldContext/useFieldContextState.ts` | 2 |
| `client/src/utils/booking/partFinalizer.ts` | 2 |
| `client/src/utils/booking/slotShapeLookups.ts` | 2 |
| `client/src/utils/datetime.ts` | 2 |
| `client/src/utils/transformers/annotationTransformers.ts` | 2 |
| `client/src/utils/transformers/transformerPrimitives.ts` | 2 |

## Notes

- Full report: `client/.audit-reports/type-import-audit.md`
- value-import-from-type-only-file: importing a value from a file that only exports types
- type-used-as-value: symbol imported with "import type" but used in value position
