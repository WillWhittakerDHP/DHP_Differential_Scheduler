# Type Similarity Audit Summary (Generated)

Generated from `.audit-reports/type-similarity-audit.json`.

## Quick Stats

- Files scanned: **812**
- Type definitions: **664**
- Similarity groups: **46**

| Action | Count | Meaning |
| --- | ---: | --- |
| UNIFY | 0 | Same concept duplicated — consolidate |
| BRAND | 5 | Different concept, same shape — add branding |
| EXTEND | 35 | Superset/subset — use extends |
| REVIEW | 6 | High overlap — needs judgment |

## Index (ranked)

| Priority | Action | Relationship | Types | Files | Score |
| --- | --- | --- | --- | ---: | ---: |
| P0 | EXTEND | SUBSET | `ContactInfo`, `UserResponse`, `UserRequest`, `UserResponse`, `WizardStateData`, `ParsedClient`, `AppointmentWithDetails`, `PropertyFormData`, `PropertyDetails`, `PropertyDetailsStepData`, `PropertyDetailsData`, `PropertyResponse`, `PropertyRequest`, `PropertyResponse`, `ParsedProperty`, `PartialPropertyDetails`, `PropertyEnrichmentResponse` | 13 | 71 |
| P0 | EXTEND | SUBSET | `ComponentItem`, `ComponentItem`, `BlockInstanceResponse`, `BookingBlockInstance`, `SelectionCardItem`, `AttendeeResponse`, `PropertyVersionType`, `VersionBlockInstance`, `BookingPartInstance`, `BookingBlockShape`, `BlockInstanceSnapshot`, `BlockInstanceFormData` | 9 | 53 |
| P0 | EXTEND | SUBSET | `CalendarEvent`, `GoogleCalendarBusyPeriod`, `DayBusinessHours`, `DayHours`, `DateRangeConfig`, `CalendarEvent`, `BusyTimeRange`, `CreatedEventResponse`, `BusyTimeRange`, `ComputedAvailabilityRequest` | 5 | 47 |
| P0 | EXTEND | SUBSET | `TimeRange`, `MoveableSlot`, `SelectedTimeSlot`, `LoadedTimeSlot`, `ServerTimeSlot`, `ComputedSlot` | 6 | 31 |
| P0 | BRAND | EXACT | `BusinessDataCollectionCrudConfig`, `BusinessDataCollectionCrudComposableReturn`, `BusinessDataCollectionQueryOptions`, `GlobalDataCollectionCrudConfig`, `GlobalDataCollectionCrudComposableReturn`, `GlobalDataCollectionQueryOptions`, `IdentifiableById` | 5 | 28 |
| P0 | BRAND | EXACT | `GoogleCalendarBusyPeriod`, `DayBusinessHours`, `DayHours`, `DateRangeConfig` | 3 | 25 |
| P0 | REVIEW | EXACT | `ISO8601Date`, `RFC3339DateTime`, `GlobalEntityId`, `RFC3339DateTime` | 3 | 25 |
| P0 | EXTEND | SUBSET | `AvailabilitySettings`, `DurationRoundingConfig`, `RawAvailabilitySettings`, `AvailabilitySettingsData` | 3 | 23 |
| P0 | EXTEND | SUBSET | `PriceData`, `BlockInstanceFeeResult`, `AppointmentFeeEntry` | 3 | 19 |
| P0 | REVIEW | HIGH_OVERLAP | `FieldMetadataEntry`, `FieldMetadataEntry`, `RelationshipMetadataEntry` | 3 | 18 |
| P0 | EXTEND | SUBSET | `Props`, `EntityCardSharedProps`, `Props`, `UseEntityCardSaveStateOptions`, `UseEntityFormOptions` | 5 | 18 |
| P0 | REVIEW | EXACT | `StepDefinition`, `StepDefinition`, `WizardStepConfig` | 3 | 16 |
| P0 | BRAND | EXACT | `UseBufferSettingsParams`, `UseDefaultLocationParams`, `UseDifferentialPerspectivesParams` | 3 | 16 |
| P0 | EXTEND | SUBSET | `DevPanelButtons`, `UseAppointmentDropdownReturn`, `UseWizardDevModeOptions`, `UseAppointmentDropdownOptions` | 3 | 16 |
| P0 | REVIEW | HIGH_OVERLAP | `AttendeeRequest`, `AttendeeRequest` | 2 | 14 |
| P0 | EXTEND | SUBSET | `UsePropertyDetailsLogicParams`, `UsePropertyFormStateReturn`, `UsePropertyFormWatchersParams` | 3 | 14 |
| P0 | EXTEND | SUBSET | `CapacityConstraint`, `IncomeCapacityFilter`, `WorkCapacityFilter` | 1 | 14 |
| P0 | BRAND | EXACT | `UseSelectionCardConfigParams`, `UseSelectionCardGroupConfigParams` | 2 | 12 |
| P0 | BRAND | EXACT | `PropertiesTableModel`, `UsersTableModel` | 2 | 12 |
| P0 | REVIEW | EXACT | `RollingWeekIncomeCapacityFilter`, `RollingWeekCapacityFilter` | 1 | 12 |
| P1 | EXTEND | SUBSET | `UseAvailabilityStepDataParams`, `UseAvailabilityValidationParams` | 2 | 10 |
| P1 | EXTEND | SUBSET | `MinimalSlotParams`, `SlotGenerationParams` | 2 | 10 |
| P1 | EXTEND | SUBSET | `BusinessRule`, `BusinessRuleFormData` | 1 | 10 |
| P1 | EXTEND | SUBSET | `SelectOption`, `USStateOption` | 2 | 10 |
| P1 | EXTEND | SUBSET | `RelationshipCollectionModel`, `UseRelationshipCollectionDataReturn` | 2 | 10 |
| P1 | EXTEND | SUBSET | `InstanceComponent`, `CreateRelationshipPayload` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseFormElementPatchingOptions`, `FormElementPatchingOptions` | 2 | 10 |
| P1 | EXTEND | SUBSET | `DefaultLocation`, `RouteLocation` | 2 | 10 |
| P1 | EXTEND | SUBSET | `BetaFeedback`, `BetaFeedbackFilters` | 1 | 10 |
| P1 | EXTEND | SUBSET | `UseEntityCrudMutationsReturn`, `UseEntityCrudActionsReturn`, `UseEntityCrudStateReturn` | 3 | 10 |
| P1 | EXTEND | SUBSET | `DriveTimeConfig`, `OverlapConstraint` | 1 | 10 |
| P1 | EXTEND | SUBSET | `CascadeFilterParams`, `PipelineParams` | 1 | 10 |
| P1 | EXTEND | SUBSET | `UseFormFieldsReturn`, `UseFormFieldsStandardLayoutReturn` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseSelectionCardComponentParams`, `UseSelectionCardStylesParams` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseComponentDistributionReturn`, `DistributionPreview` | 2 | 10 |
| P1 | REVIEW | HIGH_OVERLAP | `UseInstanceDescriptionsOptions`, `UseInstanceDisplayOptions` | 2 | 9 |
| P1 | EXTEND | SUBSET | `UseFormFieldsOptions`, `UseFormFieldsContextOptions` | 2 | 8 |
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
