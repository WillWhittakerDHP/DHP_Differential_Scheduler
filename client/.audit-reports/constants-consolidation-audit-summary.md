**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Constants Consolidation Audit Summary (Generated)

Generated from `client/.audit-reports/constants-consolidation-audit.json`.

- Constants files: **26**
- Exports scanned: **81**
- Consolidation groups: **8**
- Requiring review: **28** | Allowed: **0**

## Top 8 Consolidation Groups

| Classification | Priority | Score | Description | Locations |
| --- | --- | ---: | --- | ---: |
| HOIST | P0 | 44 | Replace inline usage with imported const... | 10 |
| HOIST | P0 | 20 | Replace inline usage with imported const... | 4 |
| HOIST | P0 | 20 | Create shared constant in server/src/con... | 3 |
| HOIST | P0 | 20 | Create shared constant in server/src/con... | 3 |
| HOIST | P1 | 12 | Replace inline usage with imported const... | 2 |
| HOIST | P1 | 12 | Replace inline usage with imported const... | 2 |
| HOIST | P1 | 12 | Replace inline usage with imported const... | 2 |
| HOIST | P1 | 12 | Replace inline usage with imported const... | 2 |

## Notes

- **HOIST**: Same value in multiple files → single constant. **TEMPLATE**: Structural duplication. **ENUM**: Inline literals → enum/const.
- **P0/P1/P2**: Priority from config. See full report: `client/.audit-reports/constants-consolidation-audit.md`.
