**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Error Handling Audit Summary (Generated)

Generated from `client/.audit-reports/error-handling-audit.json`.

- Requiring review: **20**
- Allowed exceptions: **0**

## Delta (vs previous run)

| Baseline state | Count |
| --- | ---: |
| New | 20 |
| Regressed | 0 |
| Unchanged | 0 |
| Resolved | 0 |

### By rule

| Rule | New | Unchanged | Resolved | Regressed |
| --- | ---: | ---: | ---: | ---: |
| catch-without-logger | 18 | 0 | 0 | 0 |
| empty-catch | 2 | 0 | 0 | 0 |

### New findings

| File | Line | Rule | Snippet |
| --- | ---: | --- | --- |
| `client/src/composables/admin/useSelectFiltering.ts` | 176 | empty-catch | } catch { |
| `client/src/composables/admin/useSelectFiltering.ts` | 355 | empty-catch | } catch { |
| `client/src/composables/admin/tables/useCrudDataTableModel.ts` | 116 | catch-without-logger | } catch (_error) { |
| `client/src/composables/admin/tables/useCrudDataTableModel.ts` | 142 | catch-without-logger | } catch (_error) { |
| `client/src/composables/admin/tables/useCrudDataTableModel.ts` | 164 | catch-without-logger | } catch (_error) { |
| `server/src/api/api.controller.ts` | 6 | catch-without-logger | } catch { |
| `server/src/api/api.controller.ts` | 15 | catch-without-logger | } catch { |
| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | 256 | catch-without-logger | } catch (_error) { |
| `client/src/components/admin/generic/DynamicForm.vue` | 105 | catch-without-logger | } catch { |
| `client/src/components/admin/generic/EntityFormContent.vue` | 65 | catch-without-logger | } catch { |
| `client/src/components/beta/BetaFeedbackDashboard.vue` | 208 | catch-without-logger | } catch { |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | 25 | catch-without-logger | } catch { |
| `client/src/composables/admin/useEntityDisplay.ts` | 47 | catch-without-logger | } catch { |
| `client/src/composables/admin/useFieldContextMetadataEntity.ts` | 64 | catch-without-logger | } catch { |
| `client/src/composables/admin/usePartsCollectionField.ts` | 32 | catch-without-logger | } catch { |
| `client/src/composables/admin/useRelationshipCollection.ts` | 149 | catch-without-logger | } catch { |
| `client/src/composables/admin/useRelationshipCollectionField.ts` | 30 | catch-without-logger | } catch { |
| `client/src/composables/admin/useSelectConfig.ts` | 79 | catch-without-logger | } catch { |
| `client/src/composables/useFormValidation.ts` | 149 | catch-without-logger | } catch { |
| `client/src/utils/booking/timeSlotMatching.ts` | 35 | catch-without-logger | } catch { |

## Top 16 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |
| `client/src/composables/admin/useSelectFiltering.ts` | P0 | 20 | 2 | 0 | 0 |
| `client/src/composables/admin/tables/useCrudDataTableModel.ts` | P2 | 3 | 0 | 0 | 3 |
| `server/src/api/api.controller.ts` | P2 | 2 | 0 | 0 | 2 |
| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | P2 | 1 | 0 | 0 | 1 |
| `client/src/components/admin/generic/DynamicForm.vue` | P2 | 1 | 0 | 0 | 1 |
| `client/src/components/admin/generic/EntityFormContent.vue` | P2 | 1 | 0 | 0 | 1 |
| `client/src/components/beta/BetaFeedbackDashboard.vue` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useEntityDisplay.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useFieldContextMetadataEntity.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/usePartsCollectionField.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useRelationshipCollection.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useRelationshipCollectionField.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useSelectConfig.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/useFormValidation.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/utils/booking/timeSlotMatching.ts` | P2 | 1 | 0 | 0 | 1 |

## Notes

- **P0**: Silent error swallowing (empty catch, silent .catch()).
- **P1**: Console in catch, type suppressions (@ts-ignore, as any).
- **P2**: General console usage.
