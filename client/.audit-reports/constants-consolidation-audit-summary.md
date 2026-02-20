**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Constants Consolidation Audit Summary (Generated)

Generated from `client/.audit-reports/constants-consolidation-audit.json`.

- Constants files: **24**
- Exports scanned: **67**
- Consolidation groups: **0**
- Requiring review: **0** | Allowed: **0**

## Top 0 Consolidation Groups

| Classification | Priority | Score | Description | Locations |
| --- | --- | ---: | --- | ---: |

## Notes

- **HOIST**: Same value in multiple files → single constant. **TEMPLATE**: Structural duplication. **ENUM**: Inline literals → enum/const.
- **P0/P1/P2**: Priority from config. See full report: `client/.audit-reports/constants-consolidation-audit.md`.
