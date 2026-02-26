**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type and Constant Inventory Audit Summary (Generated)

Generated from `client/.audit-reports/type-constant-inventory-audit.json`.

## Quick Index

| Category | Count |
| --- | ---: |
| Type files | 264 |
| Constant files | 23 |
| Config files | 29 |
| Files with inline type exports | 48 |
| Annotated | 65 |
| Unannotated | 251 |

## Classification Issues

| Issue | Count |
| --- | ---: |
| Mixed type+constant files | 12 |
| Inline types in composables | 31 |
| Configs with factory functions | 5 |
| Duplicate type names | 4 |
| Cleanup candidates (misplaced + unused) | 0 |

- Full report: `client/.audit-reports/type-constant-inventory-audit.md`. Run `npm run audit:type-constant-inventory` to refresh.
