# Type Similarity Audit Summary (Generated)

Generated from `.audit-reports/type-similarity-audit.json`.

## Quick Stats

- Files scanned: **723**
- Type definitions: **696**
- Similarity groups: **102**

| Action | Count | Meaning |
| --- | ---: | --- |
| UNIFY | 43 | Same concept duplicated — consolidate |
| BRAND | 14 | Different concept, same shape — add branding |
| EXTEND | 36 | Superset/subset — use extends |
| REVIEW | 9 | High overlap — needs judgment |

## Index (ranked)

| Priority | Action | Relationship | Types | Files | Score |
| --- | --- | --- | --- | ---: | ---: |
| P0 | EXTEND | SUBSET | `ComponentItem`, `ComponentItem`, `BlockInstanceResponse`, `BookingBlockInstance`, `SelectionCardItem`, `PartInstanceSnapshot`, `BlockInstanceSnapshot`, `AttendeeResponse`, `PropertyVersionType`, `VersionBlockInstance`, `BookingPartInstance`, `BookingBlockShape`, `BlockInstanceSnapshot`, `BlockInstanceFormData`, `SelectionCardItemWithComponents` | 9 | 65 |
| P0 | EXTEND | SUBSET | `ContactInfo`, `UserResponse`, `UserRequest`, `UserResponse`, `WizardStateData`, `ParsedClient`, `AppointmentWithDetails`, `PropertyFormData`, `PropertyDetails`, `PropertyDetailsData`, `PropertyDetailsStepData`, `PropertyResponse`, `PropertyRequest`, `PropertyResponse`, `ParsedProperty` | 11 | 63 |
| P0 | EXTEND | SUBSET | `DayHours`, `CalendarEvent`, `BusyTimeRange`, `CachedCalendarEvent`, `CreatedEventResponse`, `BusyTimeRange`, `CalendarEvent`, `ComputedAvailabilityRequest`, `DateRangeConfig`, `GoogleCalendarBusyPeriod`, `DayBusinessHours`, `DateRangeConfig`, `DayHours`, `DateRangeConfig` | 8 | 61 |
| P0 | REVIEW | EXACT | `DayHours`, `DateRangeConfig`, `GoogleCalendarBusyPeriod`, `DayBusinessHours`, `DateRangeConfig`, `DayHours`, `DateRangeConfig` | 5 | 35 |
| P0 | BRAND | EXACT | `BusinessDataCollectionCrudConfig`, `BusinessDataCollectionCrudComposableReturn`, `BusinessDataCollectionQueryOptions`, `GlobalDataCollectionCrudConfig`, `GlobalDataCollectionCrudComposableReturn`, `GlobalDataCollectionQueryOptions`, `IdentifiableById`, `EntityWithStringId` | 6 | 32 |
| P0 | EXTEND | SUBSET | `Coordinates`, `DefaultLocation`, `Coordinates`, `Coordinates`, `Coordinates` | 5 | 27 |
| P0 | UNIFY | EXACT | `Coordinates`, `Coordinates`, `Coordinates`, `Coordinates` | 4 | 25 |
| P0 | REVIEW | EXACT | `ISO8601Date`, `RFC3339DateTime`, `GlobalEntityId`, `RFC3339DateTime` | 3 | 25 |
| P0 | EXTEND | SUBSET | `TimeRange`, `MoveableSlot`, `SelectedTimeSlot`, `LoadedTimeSlot`, `TimeSlot` | 5 | 25 |
| P0 | UNIFY | EXACT | `RollingWeekDirection`, `RollingWeekDirection`, `RollingWeekDirection`, `RollingWeekDirection` | 4 | 23 |
| P0 | EXTEND | SUBSET | `AvailabilitySettings`, `RawAvailabilitySettings`, `DurationRoundingConfig`, `AvailabilitySettingsData` | 3 | 23 |
| P0 | EXTEND | SUBSET | `DefaultLocation`, `RouteLocation`, `RouteLocation`, `DefaultLocation` | 4 | 23 |
| P0 | EXTEND | SUBSET | `WorkCapacityFilter`, `CapacityConstraint`, `WorkCapacityFilter`, `WorkCapacityFilter` | 3 | 23 |
| P0 | REVIEW | HIGH_OVERLAP | `FieldMetadataEntry`, `FieldMetadataEntry`, `FieldMetadataEntry`, `RelationshipMetadataEntry` | 4 | 22 |
| P0 | UNIFY | EXACT | `DriveTimeApplyTo`, `DriveTimeApplyTo`, `DriveTimeApplyTo` | 3 | 21 |
| P0 | UNIFY | EXACT | `ConstraintEnforcement`, `ConstraintEnforcement`, `ConstraintEnforcement` | 3 | 21 |
| P0 | UNIFY | EXACT | `RangeConstraintType`, `RangeConstraintType`, `RangeConstraintType` | 3 | 21 |
| P0 | UNIFY | EXACT | `WorkCapacityFilter`, `WorkCapacityFilter`, `WorkCapacityFilter` | 3 | 21 |
| P0 | UNIFY | EXACT | `RollingWeekCapacityFilter`, `RollingWeekCapacityFilter`, `RollingWeekCapacityFilter` | 3 | 21 |
| P0 | UNIFY | EXACT | `Props`, `Props`, `Props`, `Props`, `Props`, `Props`, `Props`, `Props` | 8 | 20 |
| P0 | EXTEND | SUBSET | `Props`, `Props`, `Props`, `Props`, `Props`, `Props`, `Props`, `Props`, `Props` | 9 | 20 |
| P0 | UNIFY | EXACT | `LeadTimeConfig`, `LeadTimeConfig`, `LeadTimeConfig` | 3 | 19 |
| P0 | EXTEND | SUBSET | `RangeConstraint`, `RangeConstraint`, `RangeConstraint` | 3 | 19 |
| P0 | EXTEND | SUBSET | `DriveTimeConfig`, `OverlapConstraint`, `DriveTimeConfig` | 3 | 19 |
| P0 | UNIFY | EXACT | `CalendarConfig`, `CalendarConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `BusyTimeRange`, `BusyTimeRange` | 2 | 17 |
| P0 | UNIFY | EXACT | `CalendarEntry`, `CalendarEntry` | 2 | 17 |
| P0 | UNIFY | EXACT | `PlaceDetails`, `PlaceDetails` | 2 | 17 |
| P0 | UNIFY | EXACT | `ConditionalValidationRuleConfig`, `ConditionalValidationRuleConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `BufferConfig`, `BufferConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `AutocompletePrediction`, `AutocompletePrediction` | 2 | 17 |
| P0 | BRAND | EXACT | `CachedCalendarEvent`, `CalendarEvent` | 2 | 17 |
| P0 | UNIFY | EXACT | `AddressComponents`, `AddressComponents` | 2 | 17 |
| P0 | UNIFY | EXACT | `RequiredFieldsRuleConfig`, `RequiredFieldsRuleConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `RouteLocation`, `RouteLocation` | 2 | 17 |
| P0 | UNIFY | EXACT | `RequiresAgentRuleConfig`, `RequiresAgentRuleConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `ComponentConfig`, `ComponentConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `ValidationMessageRuleConfig`, `ValidationMessageRuleConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `AppLogger`, `AppLogger` | 2 | 17 |
| P0 | UNIFY | EXACT | `RangeConstraint`, `RangeConstraint` | 2 | 17 |
| P0 | UNIFY | EXACT | `DefaultLocation`, `DefaultLocation` | 2 | 17 |
| P0 | UNIFY | EXACT | `DriveTimeConfig`, `DriveTimeConfig` | 2 | 17 |
| P0 | UNIFY | EXACT | `LogLevel`, `LogLevel` | 2 | 17 |
| P0 | UNIFY | EXACT | `CalendarProvider`, `CalendarProvider` | 2 | 17 |
| P0 | REVIEW | EXACT | `StepDefinition`, `StepDefinition`, `WizardStepConfig` | 3 | 16 |
| P0 | EXTEND | SUBSET | `DevPanelButtons`, `UseAppointmentDropdownReturn`, `UseWizardDevModeOptions`, `UseAppointmentDropdownOptions` | 3 | 16 |
| P0 | EXTEND | SUBSET | `Props`, `Props`, `Props`, `UseEntityCardSaveStateOptions`, `UseEntityFormOptions` | 5 | 16 |
| P0 | UNIFY | EXACT | `BufferType`, `BufferType` | 2 | 15 |
| P0 | BRAND | EXACT | `SelectedTimeSlot`, `TimeSlot` | 2 | 15 |
| P0 | UNIFY | EXACT | `BufferPlacement`, `BufferPlacement` | 2 | 15 |
| P0 | EXTEND | SUBSET | `RouteMatrixResult`, `RouteMatrixResult` | 2 | 15 |
| P0 | REVIEW | HIGH_OVERLAP | `AttendeeRequest`, `AttendeeRequest` | 2 | 14 |
| P0 | EXTEND | SUBSET | `UsePropertyDetailsLogicParams`, `UsePropertyFormStateReturn`, `UsePropertyFormWatchersParams` | 3 | 14 |
| P0 | EXTEND | SUBSET | `SlotGenerationParams`, `GenerateSlotsWithAvailabilityParams`, `FitTimeSlotsParams` | 3 | 14 |
| P0 | BRAND | EXACT | `UseBlockInstanceFormOptions`, `UsePartInstanceFormOptions` | 2 | 12 |
| P0 | UNIFY | EXACT | `ParsedBusyTimeRange`, `ParsedBusyTimeRange` | 2 | 12 |
| P0 | BRAND | EXACT | `BusinessDataCollectionEndpoints`, `GlobalDataCollectionEndpoints` | 2 | 12 |
| P0 | UNIFY | EXACT | `EntityMetadataType`, `EntityMetadataType` | 2 | 12 |
| P0 | BRAND | EXACT | `UseSelectionCardConfigParams`, `UseSelectionCardGroupConfigParams` | 2 | 12 |
| P0 | BRAND | EXACT | `BusinessDataCollectionQueryResult`, `GlobalDataCollectionQueryResult` | 2 | 12 |
| P0 | UNIFY | EXACT | `FieldMetadataEntry`, `FieldMetadataEntry` | 2 | 12 |
| P0 | BRAND | EXACT | `PropertiesTableModel`, `UsersTableModel` | 2 | 12 |
| P0 | UNIFY | EXACT | `ContactsStepData`, `ContactsStepData` | 2 | 12 |
| P0 | BRAND | EXACT | `BusinessDataCollectionByIdQueryResult`, `GlobalDataCollectionByIdQueryResult` | 2 | 12 |
| P0 | UNIFY | EXACT | `VirtualFieldType`, `VirtualFieldType` | 2 | 12 |
| P0 | UNIFY | EXACT | `RetryConfig`, `RetryConfig` | 2 | 12 |
| P0 | UNIFY | EXACT | `UseWizardValidationReturn`, `UseWizardValidationReturn` | 2 | 12 |
| P0 | UNIFY | EXACT | `UpdateByIdPayload`, `UpdateByIdPayload` | 2 | 12 |
| P0 | BRAND | EXACT | `UseInstanceBulkEditOptions`, `UseInstanceFilteringOptions` | 2 | 12 |
| P0 | REVIEW | EXACT | `Props`, `Props`, `TimeBasisHandlerProps` | 3 | 12 |
| P0 | BRAND | EXACT | `UseAvailabilitySlotColorParams`, `UsePerspectiveMappingParams` | 2 | 12 |
| P0 | UNIFY | EXACT | `RelationshipFieldType`, `RelationshipFieldType` | 2 | 12 |
| P0 | UNIFY | EXACT | `SelectDomTarget`, `SelectDomTarget` | 2 | 12 |
| P0 | EXTEND | SUBSET | `Props`, `Props`, `Props`, `TimeBasisHandlerProps` | 4 | 12 |
| P0 | EXTEND | SUBSET | `FieldsByLocation`, `FieldsByLocation`, `UseFieldContextManagerOptions` | 3 | 12 |
| P0 | EXTEND | SUBSET | `LoadingIndicatorInstance`, `UseLoadingIndicatorReturn`, `LoadingIndicatorInstance` | 3 | 12 |
| P1 | BRAND | EXACT | `AppointmentData`, `DevPanelsComputedData` | 2 | 10 |
| P1 | BRAND | EXACT | `Props`, `UseSelectConfigOptions` | 2 | 10 |
| P1 | UNIFY | EXACT | `LoadingIndicatorInstance`, `LoadingIndicatorInstance` | 2 | 10 |
| P1 | EXTEND | SUBSET | `SelectGroup`, `GroupedEntities` | 2 | 10 |
| P1 | EXTEND | SUBSET | `PriceData`, `BlockInstanceFeeResult` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseAvailabilityStepDataParams`, `UseAvailabilityValidationParams` | 2 | 10 |
| P1 | EXTEND | SUBSET | `BusinessRule`, `BusinessRuleFormData` | 1 | 10 |
| P1 | EXTEND | SUBSET | `RelationshipCollectionModel`, `UseRelationshipCollectionDataReturn` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseFormElementPatchingOptions`, `FormElementPatchingOptions` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseEntityCrudMutationsReturn`, `UseEntityCrudActionsReturn`, `UseEntityCrudStateReturn` | 3 | 10 |
| P1 | EXTEND | SUBSET | `UseFieldInputHandlersParams`, `UseSelectHandlersOptions` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseFormFieldsReturn`, `UseFormFieldsStandardLayoutReturn` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseSelectionCardComponentParams`, `UseSelectionCardStylesParams` | 2 | 10 |
| P1 | EXTEND | SUBSET | `UseComponentDistributionReturn`, `DistributionPreview` | 2 | 10 |
| P1 | REVIEW | HIGH_OVERLAP | `UseInstanceDescriptionsOptions`, `UseInstanceDisplayOptions` | 2 | 9 |
| P1 | UNIFY | EXACT | `Props`, `Props` | 2 | 8 |
| P1 | REVIEW | EXACT | `AnnotationConfig`, `EventConfig` | 1 | 8 |
| P1 | UNIFY | EXACT | `ServiceSummary`, `ServiceSummary` | 2 | 8 |
| P1 | BRAND | EXACT | `AvailabilityManagerResult`, `FitTimeSlotsResult` | 2 | 8 |
| P1 | EXTEND | SUBSET | `UseFormFieldsOptions`, `UseFormFieldsContextOptions` | 2 | 8 |
| P1 | EXTEND | SUBSET | `Props`, `ContingencyPeriod` | 2 | 8 |
| P1 | EXTEND | SUBSET | `FieldMetadata`, `DisplayProps` | 1 | 8 |
| P1 | EXTEND | SUBSET | `UseAppointmentSlotsReturn`, `UseMoveablePartsSchedulingParams` | 2 | 8 |
| P1 | REVIEW | HIGH_OVERLAP | `CalendarEvent`, `CalendarEvent` | 2 | 7 |
| P2 | EXTEND | SUBSET | `Suggestion`, `SearchResults` | 1 | 6 |
| P2 | EXTEND | SUBSET | `Props`, `Props` | 2 | 6 |

## Notes

- This is a *signal* index. Use the full report for structural details: `client/.audit-reports/type-similarity-audit.md`.
- Run before `typecheck:audit` to identify root-cause type duplication.
