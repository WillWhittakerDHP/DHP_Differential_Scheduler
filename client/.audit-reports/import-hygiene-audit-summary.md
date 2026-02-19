# Import Hygiene Audit Summary (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated from `.audit-reports/import-hygiene-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 770 |
| Barrel directories | 22 |
| Barrel bypass violations | 0 |
| Inconsistent import paths | 0 |
| Duplicate re-exports | 0 |
| Deep relative imports | 0 |
| Type/value re-exports | 0 |

## Notes

- Full report with line-level detail: `client/.audit-reports/import-hygiene-audit.md`
- Barrel bypass = importing directly from a file when a barrel index.ts exists in that directory
- Deep relative = relative imports traversing 3+ parent directories (use @/ alias instead)
- Type/value re-export = barrel re-exporting a symbol that the source exports only as a type (use `export type { X }`)
