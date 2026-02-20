# Type Similarity Audit Summary (Generated)

Generated from `.audit-reports/type-similarity-audit.json`.

## Quick Stats

- Files scanned: **825**
- Type definitions: **658**
- Similarity groups: **30**

| Action | Count | Meaning |
| --- | ---: | --- |
| UNIFY | 0 | Same concept duplicated — consolidate |
| BRAND | 3 | Different concept, same shape — add branding |
| EXTEND | 27 | Superset/subset — use extends |
| REVIEW | 0 | High overlap — needs judgment |

## Index (ranked)

| Priority | Action | Relationship | Types | Files | Score |
| --- | --- | --- | --- | ---: | ---: |
| P0 | EXTEND | SUBSET | `ComponentItem`, `ComponentItem`, `BlockInstanceResponse`, `SelectionCardItem`, `AttendeeResponse`, `PropertyVersionType`, `VersionBlockInstance`, `BookingPartInstance`, `BookingBlockShape`, `BlockInstanceSnapshot`, `BlockInstanceLike`, `PropertyResponse`, `UserResponse`, `AppointmentResponse`, `BetaFeedback`, `FetchedInstanceComponent`, `PropertyResponse`, `ShapeFieldMetadata`, `ShapeLayoutConfig`, `UserResponse`, `PropertyFieldMappingRow`, `PropertyFeatureMappingRow`, `BetaFeedbackFilters`, `UserRequest`, `ContactInfoBase` | 15 | 105 |
| P0 | EXTEND | SUBSET | `CalendarEvent`, `TimeRangeBounds`, `CalendarEvent`, `BusyTimeRange`, `CreatedEventResponse`, `BusyTimeRange`, `ComputedAvailabilityRequest` | 4 | 35 |
| P0 | EXTEND | SUBSET | `SelectedTimeSlot`, `LoadedTimeSlot`, `ServerTimeSlot`, `SlotTimeBounds` | 4 | 23 |
| P0 | EXTEND | SUBSET | `PropertyRequest`, `PartialPropertyDetails`, `PropertyDetailsBase`, `ParsedProperty` | 4 | 23 |
| P0 | BRAND | EXACT | `PartialPropertyDetails`, `PropertyDetailsBase` | 2 | 17 |
| P0 | BRAND | EXACT | `RFC3339DateTime`, `ISO8601Date`, `GlobalEntityId` | 2 | 16 |
| P0 | EXTEND | SUBSET | `PriceData`, `FeeEntryBase` | 2 | 15 |
| P0 | EXTEND | SUBSET | `CapacityConstraint`, `IncomeCapacityFilter`, `WorkCapacityFilter` | 1 | 14 |
| P0 | EXTEND | SUBSET | `SlotDisplayData`, `ComputedSlot` | 2 | 13 |
| P0 | EXTEND | SUBSET | `PropertyFormData`, `WizardStateData`, `PropertyDetailsStepData` | 3 | 12 |
| P0 | EXTEND | SUBSET | `DevPanelButtons`, `UseAppointmentDropdownReturn`, `UseWizardDevModeOptions` | 3 | 12 |
| P1 | EXTEND | SUBSET | `RelationshipCollectionModel`, `UseRelationshipCollectionDataReturn` | 2 | 10 |
| P1 | EXTEND | SUBSET | `InstanceComponent`, `CreateRelationshipPayload` | 2 | 10 |
| P1 | EXTEND | SUBSET | `DefaultLocation`, `RouteLocation` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseEntityCrudMutationsReturn`, `UseEntityCrudActionsReturn`, `UseEntityCrudStateReturn` | 3 | 10 |
| P1 | EXTEND | SUBSET | `DriveTimeConfig`, `OverlapConstraint` | 1 | 10 |
| P1 | EXTEND | SUBSET | `CascadeFilterParams`, `PipelineParams` | 1 | 10 |
| P1 | EXTEND | SUBSET | `UseFormFieldsReturn`, `UseFormFieldsStandardLayoutReturn` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseSelectionCardComponentParams`, `UseSelectionCardStylesParams` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseComponentDistributionReturn`, `DistributionPreview` | 2 | 10 |
| P1 | BRAND | EXACT | `BusinessDataCollectionQueryOptions`, `GlobalDataCollectionQueryOptions` | 2 | 8 |
| P1 | EXTEND | SUBSET | `Props`, `ContingencyPeriod` | 2 | 8 |
| P1 | EXTEND | SUBSET | `Props`, `TimeBasisHandlerProps` | 2 | 8 |
| P1 | EXTEND | SUBSET | `FieldMetadata`, `DisplayProps` | 1 | 8 |
| P1 | EXTEND | SUBSET | `Props`, `FieldInputProps` | 2 | 8 |
| P1 | EXTEND | SUBSET | `UseAppointmentSlotsReturn`, `UseMoveablePartsSchedulingParams` | 2 | 8 |
| P1 | EXTEND | SUBSET | `FieldsByLocation`, `FieldsByLocation` | 2 | 8 |
| P1 | EXTEND | SUBSET | `RelationshipFieldType`, `DependencyImpact` | 2 | 8 |
| P2 | EXTEND | SUBSET | `Suggestion`, `SearchResults` | 1 | 6 |
| P2 | EXTEND | SUBSET | `Props`, `Props` | 2 | 6 |

## Notes

- This is a *signal* index. Use the full report for structural details: `client/.audit-reports/type-similarity-audit.md`.
- Run before `typecheck:audit` to identify root-cause type duplication.
