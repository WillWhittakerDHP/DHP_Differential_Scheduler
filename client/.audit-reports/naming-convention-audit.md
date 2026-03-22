**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Naming Convention Audit (Generated)

Generated at: 2026-03-22T02:01:39.793Z

## Summary

- Total allowed: **6**
- Requiring review: **1**

## Files with naming violations

| File | Rule | Line | Snippet |
| --- | --- | ---: | --- |
| `client/src/composables/admin/injectionKeys.ts` | composableFileName | 1 | Composable file should be use[Name].ts: injectionK |

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

| File | Rule | Line | Source | Reason |
| --- | --- | ---: | --- | --- |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | composableExport | 34 | pattern | Composables may export camelCase helpers used by other co... |
| `server/src/db/models/admin/adminMetadata.ts` | functionExport | 49 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/block_shape.ts` | functionExport | 34 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/admin/valid_event.ts` | functionExport | 25 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/block_instance.ts` | functionExport | 43 | pattern | Sequelize model factory convention: ModelNameFactory |
| `server/src/db/models/booking/event_assignment.ts` | functionExport | 34 | pattern | Sequelize model factory convention: ModelNameFactory |
