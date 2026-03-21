**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type Similarity Audit Summary (Generated)

Generated from `client/.audit-reports/type-similarity-audit.json`.

## Quick Stats

- File count: **1138**
- Total definitions: **787**
- Groups: **9**

## Action table

| Action | Count | Meaning |
| --- | ---: | --- |
| UNIFY | 0 | Merge duplicate shapes |
| BRAND | 0 | Nominal typing |
| EXTEND | 9 | Extend shared base |
| REVIEW | 0 | Manual review |

## Index (ranked)

| Priority | Action | Relationship | Types | Files | Score |
| --- | --- | --- | --- | ---: | ---: |
| P0 | EXTEND | SUBSET | ComponentItem, BlockInstanceResponse, Se... | 0 | 59 |
| P0 | EXTEND | SUBSET | UseAdminMetadataMutationsReturn, SaveFie... | 0 | 22 |
| P0 | EXTEND | SUBSET | MoveableSlot, SlotAvailabilityResult... | 0 | 15 |
| P0 | EXTEND | SUBSET | LoadedTimeSlot, SlotTimeBounds... | 0 | 15 |
| P0 | EXTEND | SUBSET | UseShapesTabModalsReturn, UseMetadataMod... | 0 | 14 |
| P1 | EXTEND | SUBSET | UseAdminRelationshipMetadataMutationsRet... | 0 | 10 |
| P1 | EXTEND | SUBSET | UserRequest, UserResponse... | 0 | 10 |
| P1 | EXTEND | SUBSET | UseBookingWizardReturnGrouped, UseBookin... | 0 | 10 |
| P1 | EXTEND | SUBSET | ContactsFormContext, ContactRefs... | 0 | 8 |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/type-similarity-audit.md`. Run after type-import/type-escape cleanup.
