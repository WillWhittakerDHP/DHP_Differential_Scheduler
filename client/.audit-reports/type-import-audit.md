# Type-Import Audit (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


## Summary

- Files scanned: **797**
- value-import-from-type-only-file: **0**
- type-used-as-value: **21**

## type-used-as-value

| File | Line | Symbol |
| --- | ---: | --- |
| `client/src/composables/admin/usePartsCollectionField.ts` | 97 | RelationshipFieldType |
| `client/src/composables/booking/usePerspectiveMapping.ts` | 4 | PerspectiveKey |
| `client/src/composables/fieldContext/useFieldContextState.ts` | 95 | GlobalEntity |
| `client/src/composables/useLocalTime.ts` | 65 | RFC3339DateTime |
| `client/src/composables/useLocalTime.ts` | 182 | RFC3339DateTime |
| `client/src/composables/useLocalTime.ts` | 221 | RFC3339DateTime |
| `client/src/types/appointmentApi.ts` | 35 | USER_ROLE_CLIENT |
| `client/src/types/appointmentApi.ts` | 52 | USER_ROLE_CLIENT |
| `client/src/types/appointmentApi.ts` | 35 | USER_ROLE_AGENT |
| `client/src/types/appointmentApi.ts` | 52 | USER_ROLE_AGENT |
| `client/src/types/property.ts` | 25 | USER_ROLE_CLIENT |
| `client/src/types/property.ts` | 46 | USER_ROLE_CLIENT |
| `client/src/types/user.ts` | 15 | USER_ROLE_CLIENT |
| `client/src/types/user.ts` | 25 | USER_ROLE_CLIENT |
| `client/src/types/user.ts` | 15 | USER_ROLE_AGENT |
| `client/src/types/user.ts` | 25 | USER_ROLE_AGENT |
| `client/src/utils/booking/partFinalizer.ts` | 63 | PartFinal |
| `client/src/utils/booking/slotShapeLookups.ts` | 4 | SlotShape |
| `client/src/utils/datetime.ts` | 34 | RFC3339DateTime |
| `client/src/utils/transformers/annotationTransformers.ts` | 66 | AnnotationInstance |
| `client/src/utils/transformers/transformerPrimitives.ts` | 113 | TernaryBoolean |

## Files by finding count (score)

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
