**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Deprecation & Legacy Accommodation Audit Summary (Generated)

Generated from `client/.audit-reports/deprecation-audit.json`.

- Files with findings: **1**
- Requiring review: **10**
- Allowed exceptions: **0**

- Annotated deprecations: **0**
- Runtime legacy accommodation: **14**

## Top 1 files (ranked by score)

| File | Priority | Score | Annotations | Legacy/Compat |
| --- | --- | ---: | ---: | ---: |
| `server/src/services/invites/inviteOrchestrationService.ts` | P0 | 36 | 0 | 14 |

## Notes

- **Annotations**: @deprecated, // Deprecated, (deprecated), LEGACY/compat markers.
- **Legacy/Compat**: Runtime keywords, || '', ?? '', default params, chaining fallbacks.
- See full report: `client/.audit-reports/deprecation-audit.md`.
