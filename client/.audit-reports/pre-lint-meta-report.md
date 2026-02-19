# Pre-Lint Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Use this report to build a **repair plan** before running `audit:all`.

Generated at: 2026-02-19T02:25:03.653Z

## Pre-Lint Audit Summary

| Audit | Files with findings | Total findings | Detail |
| --- | ---: | ---: | --- |
| lint | 1 | 1 | Errors + warnings: 1 in 1 files |
| lint-warnings | 1 | 1 | Warnings only: 1 in 1 files |

Audits loaded: 2 / 2

## Repair plan readiness

**Total pre-lint findings:** 2

Address the findings above (see each audit's JSON/MD in `.audit-reports/`) before running full audit.

## Top hotspot files (pre-lint)

| File | Score | Audits | Which audits |
| --- | ---: | ---: | --- |
| `client/src/composables/admin/useInstanceFiltering.ts` | 3.0 | 2 | lint, lint-warnings |

## Next steps

1. Run pre-lint audits: `npm run audit:pre-lint`
2. Run this meta report: `npm run audit:pre-lint:meta`
3. Fix findings using lint-audit.md and lint-warnings-audit.md in `client/.audit-reports/`
4. Re-run pre-lint + meta until total findings are acceptable
5. Run `npm run audit:all`
