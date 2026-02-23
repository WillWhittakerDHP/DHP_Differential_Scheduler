**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type Similarity Audit Summary (Generated)

Generated from `client/.audit-reports/type-similarity-audit.json`.

## Quick Stats

- File count: **821**
- Total definitions: **662**
- Groups: **18**

## Action table

| Action | Count | Meaning |
| --- | ---: | --- |
| UNIFY | 0 | Merge duplicate shapes |
| BRAND | 1 | Nominal typing |
| EXTEND | 15 | Extend shared base |
| REVIEW | 2 | Manual review |

## Index (ranked)

| Priority | Action | Relationship | Types | Files | Score |
| --- | --- | --- | --- | ---: | ---: |
| P0 | EXTEND | SUBSET | ComponentItem, BlockInstanceResponse, Se... | 0 | 45 |
| P0 | EXTEND | SUBSET | UserRequest, UserResponse, ContactInfoBa... | 0 | 19 |
| P0 | BRAND | EXACT | RFC3339DateTime, ISO8601Date, GlobalEnti... | 0 | 16 |
| P0 | EXTEND | SUBSET | ParsedProperty, PropertyDetailsBase... | 0 | 15 |
| P0 | EXTEND | SUBSET | LoadedTimeSlot, SlotTimeBounds... | 0 | 15 |
| P0 | EXTEND | SUBSET | CapacityConstraint, IncomeCapacityFilter... | 0 | 14 |
| P0 | EXTEND | SUBSET | SlotDisplayData, ComputedSlot... | 0 | 13 |
| P0 | EXTEND | SUBSET | Props, DefaultLocation... | 0 | 13 |
| P0 | EXTEND | SUBSET | PropertyFormData, WizardStateData, Prope... | 0 | 12 |
| P0 | EXTEND | SUBSET | DevPanelButtons, UseAppointmentDropdownR... | 0 | 12 |
| P1 | EXTEND | SUBSET | BetaFeedback, BetaFeedbackFiltersBase... | 0 | 10 |
| P1 | EXTEND | SUBSET | PropertyRequest, PropertyResponse... | 0 | 10 |
| P1 | REVIEW | HIGH_OVERLAP | UseBlockInstanceFormReturn, UsePartInsta... | 0 | 9 |
| P1 | REVIEW | HIGH_OVERLAP | WizardState, WizardBlocksForBuilders... | 0 | 9 |
| P1 | EXTEND | SUBSET | Props, FieldInputProps... | 0 | 8 |
| P1 | EXTEND | SUBSET | UseAppointmentSlotsReturn, UseMoveablePa... | 0 | 8 |
| P1 | EXTEND | SUBSET | RelationshipFieldType, DependencyImpact... | 0 | 8 |
| P2 | EXTEND | SUBSET | NormalizedAppointmentForInvites, Appoint... | 0 | 6 |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/type-similarity-audit.md`. Run after type-import/type-escape cleanup.
