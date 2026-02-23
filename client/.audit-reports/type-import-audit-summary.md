**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type-Import Audit Summary (Generated)

Generated from `client/.audit-reports/type-import-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 2 |
| value-import-from-type-only-file | 0 |
| type-used-as-value | 1 |
| Files with findings | 1 |

## Delta (vs previous run)

| Baseline state | Count |
| --- | ---: |
| New | 1 |
| Regressed | 0 |
| Unchanged | 0 |
| Resolved | 0 |

### By rule

| Rule | New | Unchanged | Resolved | Regressed |
| --- | ---: | ---: | ---: | ---: |
| type-used-as-value | 1 | 0 | 0 | 0 |

### New findings

| File | Line | Rule | Snippet |
| --- | ---: | --- | --- |
| `client/fixtures/audits/type-import/type-used-as-value/tp/import-type-used-as-value.ts` | 3 | type-used-as-value | Foo |

## Top 1 files (by score)

| File | Score |
| --- | ---: |
| `client/fixtures/audits/type-import/type-used-as-value/tp/import-type-used-as-value.ts` | 2 |

## Notes

- Full report: `client/.audit-reports/type-import-audit.md`. value-import-from-type-only-file: importing a value from a file that only exports types. type-used-as-value: symbol imported with "import type" but used in value position.
