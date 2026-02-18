# Import Hygiene Audit Summary (Generated)

Generated from `.audit-reports/import-hygiene-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 757 |
| Barrel directories | 24 |
| Barrel bypass violations | 0 |
| Inconsistent import paths | 0 |
| Duplicate re-exports | 0 |
| Deep relative imports | 0 |

## Notes

- Full report with line-level detail: `client/.audit-reports/import-hygiene-audit.md`
- Barrel bypass = importing directly from a file when a barrel index.ts exists in that directory
- Deep relative = relative imports traversing 3+ parent directories (use @/ alias instead)
