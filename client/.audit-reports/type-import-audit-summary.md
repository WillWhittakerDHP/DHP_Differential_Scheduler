**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type-Import Audit Summary (Generated)

Generated from `client/.audit-reports/type-import-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 778 |
| value-import-from-type-only-file | 0 |
| type-used-as-value | 2 |
| Files with findings | 2 |

## Top 2 files (by score)

| File | Score |
| --- | ---: |
| `client/src/configs/usStates.ts` | 2 |
| `client/src/types/component.ts` | 2 |

## Notes

- Full report: `client/.audit-reports/type-import-audit.md`. value-import-from-type-only-file: importing a value from a file that only exports types. type-used-as-value: symbol imported with "import type" but used in value position.
