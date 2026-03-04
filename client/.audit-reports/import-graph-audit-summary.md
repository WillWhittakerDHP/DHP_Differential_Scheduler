**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Import Graph Audit Summary (Generated)

Generated from `client/.audit-reports/import-graph-audit.json`.

- Cycles: **0**
- Fan-out violations: **0**
- Fan-in violations: **2**
- Composable chain-depth violations: **8**
- Cross-boundary: **0**

### Top composable chains (by depth)

| Composable | Depth |
| --- | ---: |
| `client/src/composables/fieldContext/useFieldContext` | 4 |
| `client/src/composables/formFields/useFormFields` | 4 |
| `client/src/composables/admin/useInstancesTab` | 3 |
| `client/src/composables/admin/usePartsCollectionField` | 3 |
| `client/src/composables/admin/useRelationshipCollectionField` | 3 |
| `client/src/composables/booking/useBookingWizardSetup` | 3 |
| `client/src/composables/booking/useMoveablePartsScheduling` | 3 |
| `client/src/composables/fieldContext/useFieldContextState` | 3 |

## Top 10 files by score

| File | Priority | Score |
| --- | --- | ---: |
| `undefined` | P1 | 8 |
| `undefined` | P1 | 8 |
| `undefined` | P2 | 4 |
| `undefined` | P2 | 4 |
| `undefined` | P2 | 4 |
| `undefined` | P2 | 4 |
| `undefined` | P2 | 4 |
| `undefined` | P2 | 4 |
| `undefined` | P2 | 2 |
| `undefined` | P2 | 2 |
