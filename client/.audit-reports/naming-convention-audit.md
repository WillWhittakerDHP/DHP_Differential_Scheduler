**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Naming Convention Audit (Generated)

Generated at: 2026-03-21T15:39:08.068Z

## Summary

- Total allowed: **2**
- Requiring review: **0**

## Files with naming violations

None.

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

| File | Rule | Line | Source | Reason |
| --- | --- | ---: | --- | --- |
| `client/src/composables/admin/useInstanceDragAndDrop.ts` | composableExport | 28 | pattern | Composables may export camelCase helpers used by other co... |
| `server/src/db/models/booking/event_shape.ts` | functionExport | 41 | pattern | Sequelize model factory convention: ModelNameFactory |
