**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Naming Convention Audit (Generated)

Generated at: 2026-02-26T00:03:36.878Z

## Summary

- Total allowed: **16**
- Requiring review: **0**

## Files with naming violations

None.

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

| File | Rule | Line | Source | Reason |
| --- | --- | ---: | --- | --- |
| `client/src/composables/admin/useAdminAvailabilitySettings.ts` | composableExport | 22 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useFormElementPatching.ts` | composableExport | 18 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useFormElementPatching.ts` | composableExport | 67 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/useMetadataCache.ts` | composableExport | 138 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/admin/utils/nestedComputedFactory.ts` | composableFileName | 1 | pattern | Composable utility; factory name is intentional |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | composableExport | 29 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | composableExport | 59 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | composableExport | 85 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useStepValidation.ts` | composableExport | 12 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/booking/useWizardStepContent.ts` | composableExport | 7 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 3 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 31 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | composableExport | 55 | pattern | Composables may export camelCase helpers used by other co... |
| `client/src/composables/fieldContext/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/formFields/types.ts` | composableFileName | 1 | pattern | Barrel/composable package; types file is conventional |
| `client/src/composables/useAdminConfig.ts` | composableExport | 50 | pattern | Composables may export camelCase helpers used by other co... |
