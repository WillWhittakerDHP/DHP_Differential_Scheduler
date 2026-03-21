**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Pattern Detection Audit Summary (Generated)

Generated from `client/.audit-reports/pattern-detection-audit.json`.

## Quick Index

| Category | Count |
| --- | ---: |
| String literals (3+ occurrences) | 3 |
| Type definitions | 0 |
| Enum patterns | 0 |
| Config locations | 42 |
| Function patterns | 442 |
| Common patterns | 58 |

## Top String Literals (by occurrence count)

| Value | Occurrences |
| --- | ---: |
| `held` | 7 |
| `confirmed` | 6 |
| `started` | 3 |

## Notes

- Full report: `client/.audit-reports/pattern-detection-audit.md`. String literals with 3+ occurrences may be candidates for enum/constant extraction.
