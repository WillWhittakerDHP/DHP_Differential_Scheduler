**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type and Constant Inventory Audit Summary (Generated)

Generated from `client/.audit-reports/type-constant-inventory-audit.json`.

## Quick Index

| Category | Count |
| --- | ---: |
| Type files | 268 |
| Constant files | 23 |
| Config files | 34 |
| Files with inline type exports | 102 |
| Annotated | 325 |
| Unannotated | 0 |

## Classification Issues

| Issue | Count |
| --- | ---: |
| Mixed type+constant files | 12 |
| Inline types in composables | 71 |
| Configs with factory functions | 8 |
| Duplicate type names | 5 |
| Cleanup candidates (misplaced + unused) | 0 |

- Full report: `client/.audit-reports/type-constant-inventory-audit.md`. Run `npm run audit:type-constant-inventory` to refresh.
