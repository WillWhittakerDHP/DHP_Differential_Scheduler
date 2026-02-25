**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type Similarity Audit Summary (Generated)

Generated from `client/.audit-reports/type-similarity-audit.json`.

## Quick Stats

- File count: **1083**
- Total definitions: **707**
- Groups: **24**

## Action table

| Action | Count | Meaning |
| --- | ---: | --- |
| UNIFY | 0 | Merge duplicate shapes |
| BRAND | 4 | Nominal typing |
| EXTEND | 18 | Extend shared base |
| REVIEW | 2 | Manual review |

## Index (ranked)

| Priority | Action | Relationship | Types | Files | Score |
| --- | --- | --- | --- | ---: | ---: |
| P0 | EXTEND | SUBSET | ComponentItem, BlockInstanceResponse, Se... | 0 | 63 |
| P0 | EXTEND | SUBSET | SelectedTimeSlot, LoadedTimeSlot, SlotTi... | 0 | 19 |
| P0 | BRAND | EXACT | SelectedTimeSlot, SlotTimeBounds... | 0 | 17 |
| P0 | REVIEW | EXACT | SelectGroup, GroupedByKeyItem, SelectGro... | 0 | 16 |
| P0 | BRAND | EXACT | RFC3339DateTime, ISO8601Date, GlobalEnti... | 0 | 16 |
| P0 | EXTEND | SUBSET | ParsedProperty, PropertyDetailsBase... | 0 | 15 |
| P0 | EXTEND | SUBSET | CapacityConstraint, IncomeCapacityFilter... | 0 | 14 |
| P0 | EXTEND | SUBSET | Props, DefaultLocation... | 0 | 13 |
| P0 | BRAND | EXACT | UseFieldKeyboardGuardReturn, FieldKeyboa... | 0 | 12 |
| P0 | EXTEND | SUBSET | PropertyValidationData, WizardStateData,... | 0 | 12 |
| P1 | BRAND | EXACT | PartInstanceBulkEditData, PartWithTotals... | 0 | 10 |
| P1 | EXTEND | SUBSET | UseEntityCardComputedReturn, UseEntityCa... | 0 | 10 |
| P1 | EXTEND | SUBSET | UseAppointmentDropdownReturn, DevPanelBu... | 0 | 10 |
| P1 | EXTEND | SUBSET | EntityCardSharedProps, UseEntityCardSave... | 0 | 10 |
| P1 | EXTEND | SUBSET | BetaFeedbackSubmission, BrowserContext... | 0 | 10 |
| P1 | EXTEND | SUBSET | BetaFeedback, BetaFeedbackFiltersBase... | 0 | 10 |
| P1 | EXTEND | SUBSET | BusinessRuleCore, BusinessRulesQueryFilt... | 0 | 10 |
| P1 | EXTEND | SUBSET | UsePartInstanceBulkEditReturn, PartInsta... | 0 | 10 |
| P1 | EXTEND | SUBSET | PropertyRequest, PropertyResponse... | 0 | 10 |
| P1 | EXTEND | SUBSET | UserRequest, UserResponse... | 0 | 10 |
| P1 | REVIEW | HIGH_OVERLAP | UseFieldKeyboardGuardOptions, FieldKeybo... | 0 | 9 |
| P1 | EXTEND | SUBSET | UseMoveablePartsSchedulingParams, UseApp... | 0 | 8 |
| P1 | EXTEND | SUBSET | Props, FieldInputProps... | 0 | 8 |
| P2 | EXTEND | SUBSET | NormalizedAppointmentForInvites, Appoint... | 0 | 6 |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/type-similarity-audit.md`. Run after type-import/type-escape cleanup.
