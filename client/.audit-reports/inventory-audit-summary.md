**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Composable & Component Inventory Audit Summary (Generated)

Generated from `client/.audit-reports/inventory-audit.json`.

## Summary

- Composables: **273** | Utilities: **135** | Components: **72**
- Annotated: **480** | Unannotated: **0**

| Reuse tier | Count |
| --- | ---: |
| feature | 359 |
| shared | 117 |
| local | 4 |

| Classification issue | Count |
| --- | ---: |
| Utils in disguise (composables with no Vue reactivity) | 8 |
| Composables in disguise (utils importing Vue) | 6 |

- Full report: `client/.audit-reports/inventory-audit.md`.
