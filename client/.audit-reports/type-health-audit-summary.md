**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type-Health Audit Summary (Generated)

Generated from `client/.audit-reports/type-health-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Total scanned | 1065 |
| Findings | 362 |
| Files with findings | 142 |

## Delta (vs previous run)

| Baseline state | Count |
| --- | ---: |
| New | 362 |
| Regressed | 0 |
| Unchanged | 0 |
| Resolved | 0 |

### By rule

| Rule | New | Unchanged | Resolved | Regressed |
| --- | ---: | ---: | ---: | ---: |
| record-string-unknown | 273 | 0 | 0 | 0 |
| writable-computed-ref-usage | 46 | 0 | 0 | 0 |
| excessive-union | 22 | 0 | 0 | 0 |
| typeof-ref-return | 14 | 0 | 0 | 0 |
| re-export-only-file | 5 | 0 | 0 | 0 |
| typeof-computed-return | 1 | 0 | 0 | 0 |
| triple-intersection | 1 | 0 | 0 | 0 |

### New findings

| File | Line | Rule | Snippet |
| --- | ---: | --- | --- |
| `client/src/components/admin/InstanceBulkEditModal.vue` | 178 | record-string-unknown | entityCardRef.value.form.values as Record<string, unknown> |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | 199 | record-string-unknown | entityCardRef.value.form.values as Record<string, unknown> |
| `client/src/components/admin/component/ComponentDistributionModal.vue` | 122 | record-string-unknown | (e: 'confirm', distributionStrategy: DistributionStrategy, d |
| `client/src/components/admin/dev/ApiDevPanelDriveTimeTab.vue` | 6 | record-string-unknown | function driveTimeEntryData(entry: DevPanelCacheEntry): Reco |
| `client/src/components/admin/dev/ApiDevPanelDriveTimeTab.vue` | 7 | record-string-unknown | return entry.data as Record<string, unknown> | undefined |
| `client/src/components/admin/generic/CardButton.vue` | 17 | excessive-union | type ButtonPosition = 'top-right' | 'top-left' | 'bottom-rig |
| `client/src/components/admin/generic/EntityFormContent.vue` | 28 | record-string-unknown | form: FormContext<Record<string, unknown>> |
| `client/src/components/admin/generic/collections/PartsCollection.vue` | 84 | record-string-unknown | bulkEditData: bulkEdit.bulkEditData as Ref<Record<string, un |
| `client/src/components/admin/generic/collections/PartsCollection.vue` | 88 | record-string-unknown | handleBulkEditConfirm: bulkEdit.handleBulkEditConfirm as (da |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | 115 | typeof-computed-return | entity: entityForMetadata as ReturnType<typeof computed<Glob |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | 39 | record-string-unknown | const appointmentData = useDevPanelsAppointmentData(devPanel |
| `client/src/components/booking/plugins/wizardStatePlugin.ts` | 15 | record-string-unknown | return FIELD_NAMES.ENTITY_KEY in item && (item as Record<str |
| `client/src/composables/admin/tables/useAppointmentsTableHandlers.ts` | 83 | record-string-unknown | const applyCreatePatch = (patch: Partial<Record<string, unkn |
| `client/src/composables/admin/useAdminMetadataMutations.ts` | 64 | record-string-unknown | } as { fieldKey: string; blockShapeRef: string | null } & Re |
| `client/src/composables/admin/useAdminPrimitiveMetadataMutations.ts` | 58 | record-string-unknown | } as { fieldKey: string } & Record<string, unknown> |
| `client/src/composables/admin/useAdminRelationshipMetadataMutations.ts` | 56 | record-string-unknown | } as { relationshipKey: string } & Record<string, unknown> |
| `client/src/composables/admin/useBufferSettings.ts` | 4 | writable-computed-ref-usage | import { computed, type Ref, type WritableComputedRef } from |
| `client/src/composables/admin/useBufferSettings.ts` | 27 | writable-computed-ref-usage | ): WritableComputedRef<TValue> { |
| `client/src/composables/admin/useBufferSettings.ts` | 56 | writable-computed-ref-usage | ): WritableComputedRef<TValue> { |
| `client/src/composables/admin/useBufferSettings.ts` | 80 | writable-computed-ref-usage | buffersAppointmentMinutes: WritableComputedRef<number> |
| *...and 342 more* | | | |

## By rule

| Rule | Count |
| --- | ---: |
| record-string-unknown | 273 |
| writable-computed-ref-usage | 46 |
| excessive-union | 22 |
| typeof-ref-return | 14 |
| re-export-only-file | 5 |
| typeof-computed-return | 1 |
| triple-intersection | 1 |

## Repair waves

- **Local** (not exported or zero consumers): 339
- **Low fan-in** (exported, 1–3 consumers): 15
- **High fan-in** (exported, 4+ consumers): 8

## Top 20 files by severity

| File | Priority | Score |
| --- | --- | ---: |
| `server/src/routes/internal/businessSettings/businessSettingsValidators.ts` | P0 | 38 |
| `server/src/routes/internal/admin-metadata/adminMetadataHelpers.ts` | P0 | 21 |
| `client/src/vite-env.d.ts` | P1 | 11 |
| `client/src/composables/beta/useFeedbackDashboard.ts` | P1 | 10 |
| `client/src/composables/beta/useFeedbackDetail.ts` | P1 | 8 |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | P1 | 8 |
| `client/src/composables/layout/useNavSearch.ts` | P1 | 6 |
| `server/src/routes/internal/entities/entitySanitizers.ts` | P1 | 6 |
| `server/src/routes/internal/properties/propertyValidators.ts` | P1 | 6 |
| `server/src/routes/internal/relationships/relationshipQueryBuilders.ts` | P1 | 6 |
| `server/src/utils/propertyTransformers.ts` | P1 | 6 |
| `client/src/composables/admin/useSelectConfig.ts` | P2 | 5 |
| `client/src/composables/fieldContext/useFieldContextState.ts` | P2 | 5 |
| `client/src/composables/layout/useSuspenseFallback.ts` | P2 | 4 |
| `client/src/types/admin/AdminEntity.ts` | P2 | 4 |
| `client/src/types/admin/dialogFormState.ts` | P2 | 4 |
| `client/src/types/admin/relationshipCollection.ts` | P2 | 4 |
| `client/src/utils/admin/selectTypeResolver.ts` | P2 | 4 |
| `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` | P2 | 4 |
| `client/src/composables/admin/useRelationshipCollection.ts` | P2 | 3 |

*...and 122 more. See full report.*

## Notes

- Full report: `client/.audit-reports/type-health-audit.md`. Rules: nested utility types, Record<string,any>, ReturnType<typeof ref/computed>, excessive unions, etc. Use repair waves for prioritized fixes.
