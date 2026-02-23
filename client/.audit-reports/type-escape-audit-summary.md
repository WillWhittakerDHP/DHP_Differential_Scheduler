**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type-Escape Audit Summary (Generated)

Generated from `client/.audit-reports/type-escape-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Total scanned | 4 |
| Findings | 2 |
| Files with findings | 2 |

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

## By rule

| Rule | Count |
| --- | ---: |
| as-any | 2 |

## Top 2 files

| File | Priority | Score |
| --- | --- | ---: |
| `undefined` | P2 | 3 |
| `undefined` | P2 | 3 |

## Notes

- Full report: `client/.audit-reports/type-escape-audit.md`. Rules: as-any, as-unknown, etc.
