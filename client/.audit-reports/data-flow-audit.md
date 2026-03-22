**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Data Flow Validation Audit (Generated)

Generated at: 2026-03-22T02:02:06.462Z

## Summary

- Total allowed: **0**
- Requiring review: **3**

## Files with potential unvalidated input

| File | Rule | Line | Snippet |
| --- | --- | ---: | --- |
| `server/src/routes/internal/calendarSettings/calendarSettingsCrudRouter.ts` | reqBodyUnvalidated | 34 | const settingValue = req.body?.setting_value; |
| `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts` | reqBodyUnvalidated | 16 | const b = req.body as Record<string, unknown> |
| `server/src/routes/internal/wizardSettings/wizardSettingsCrudRouter.ts` | reqBodyUnvalidated | 34 | const settingValue = req.body?.setting_value; |

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

- (no exceptions configured)
