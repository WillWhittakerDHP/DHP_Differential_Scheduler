# Type-Import Audit (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

## Summary

- Files scanned: **784**
- value-import-from-type-only-file: **0**
- type-used-as-value: **29**

## type-used-as-value

| File | Line | Symbol |
| --- | ---: | --- |
| `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` | 90 | FieldMetadataEntry |
| `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` | 96 | FieldMetadataEntry |
| `client/src/composables/admin/usePartsCollectionField.ts` | 97 | RelationshipFieldType |
| `client/src/composables/booking/usePerspectiveMapping.ts` | 4 | PerspectiveKey |
| `client/src/composables/fieldContext/useFieldContextState.ts` | 95 | GlobalEntity |
| `client/src/composables/useLocalTime.ts` | 65 | RFC3339DateTime |
| `client/src/composables/useLocalTime.ts` | 182 | RFC3339DateTime |
| `client/src/composables/useLocalTime.ts` | 221 | RFC3339DateTime |
| `client/src/types/appointmentApi.ts` | 34 | USER_ROLE_CLIENT |
| `client/src/types/appointmentApi.ts` | 51 | USER_ROLE_CLIENT |
| `client/src/types/appointmentApi.ts` | 34 | USER_ROLE_AGENT |
| `client/src/types/appointmentApi.ts` | 51 | USER_ROLE_AGENT |
| `client/src/types/property.ts` | 25 | USER_ROLE_CLIENT |
| `client/src/types/property.ts` | 46 | USER_ROLE_CLIENT |
| `client/src/types/user.ts` | 15 | USER_ROLE_CLIENT |
| `client/src/types/user.ts` | 25 | USER_ROLE_CLIENT |
| `client/src/types/user.ts` | 15 | USER_ROLE_AGENT |
| `client/src/types/user.ts` | 25 | USER_ROLE_AGENT |
| `client/src/types/wizard.ts` | 92 | Ref |
| `client/src/types/wizard.ts` | 93 | Ref |
| `client/src/types/wizard.ts` | 94 | Ref |
| `client/src/types/wizard.ts` | 95 | Ref |
| `client/src/types/wizard.ts` | 96 | Ref |
| `client/src/types/wizard.ts` | 97 | Ref |
| `client/src/utils/booking/partFinalizer.ts` | 62 | PartFinal |
| `client/src/utils/booking/slotShapeLookups.ts` | 4 | SlotShape |
| `client/src/utils/datetime.ts` | 34 | RFC3339DateTime |
| `client/src/utils/transformers/annotationTransformers.ts` | 66 | AnnotationInstance |
| `client/src/utils/transformers/transformerPrimitives.ts` | 113 | TernaryBoolean |

## Files by finding count (score)

| File | Score |
| --- | ---: |
| `client/src/types/wizard.ts` | 12 |
| `client/src/types/appointmentApi.ts` | 8 |
| `client/src/types/user.ts` | 8 |
| `client/src/composables/useLocalTime.ts` | 6 |
| `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` | 4 |
| `client/src/types/property.ts` | 4 |
| `client/src/composables/admin/usePartsCollectionField.ts` | 2 |
| `client/src/composables/booking/usePerspectiveMapping.ts` | 2 |
| `client/src/composables/fieldContext/useFieldContextState.ts` | 2 |
| `client/src/utils/booking/partFinalizer.ts` | 2 |
| `client/src/utils/booking/slotShapeLookups.ts` | 2 |
| `client/src/utils/datetime.ts` | 2 |
| `client/src/utils/transformers/annotationTransformers.ts` | 2 |
| `client/src/utils/transformers/transformerPrimitives.ts` | 2 |
