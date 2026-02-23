**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Error Handling Audit Summary (Generated)

Generated from `client/.audit-reports/error-handling-audit.json`.

- Requiring review: **2**
- Allowed exceptions: **0**

## Delta (vs previous run)

| Baseline state | Count |
| --- | ---: |
| New | 2 |
| Regressed | 0 |
| Unchanged | 0 |
| Resolved | 0 |

### By rule

| Rule | New | Unchanged | Resolved | Regressed |
| --- | ---: | ---: | ---: | ---: |
| as-any | 2 | 0 | 0 | 0 |

### New findings

| File | Line | Rule | Snippet |
| --- | ---: | --- | --- |
| `client/fixtures/audits/type-escape/as-any/tp/has-as-any.ts` | 3 | as-any | const y = x as any |
| `client/fixtures/audits/type-escape/as-any/tp/unnecessary-as-any.ts` | 3 | as-any | const y = x as any |

## Top 2 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |
| `client/fixtures/audits/type-escape/as-any/tp/has-as-any.ts` | P1 | 5 | 0 | 1 | 0 |
| `client/fixtures/audits/type-escape/as-any/tp/unnecessary-as-any.ts` | P1 | 5 | 0 | 1 | 0 |

## Notes

- **P0**: Silent error swallowing (empty catch, silent .catch()).
- **P1**: Console in catch, type suppressions (@ts-ignore, as any).
- **P2**: General console usage.
