**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Type and Constant Inventory Audit (Generated)

Generated: 2026-03-16T01:21:35.090Z

## Summary

- Type files: **270**
- Constant files: **24**
- Config files: **41**
- Files with inline type exports: **115**
- Annotated: **325** | Unannotated: **10**

| Classification Issue | Count |
| --- | ---: |
| Mixed type+constant files | 14 |
| Inline types in composables | 85 |
| Configs with factory functions | 11 |
| Duplicate type names | 7 |
| Cleanup candidates (misplaced + unused) | 0 |
| Monomorphic generics | 9 |

## Monomorphic generics

Generic types always instantiated with the same argument; consider removing the generic or merging with the argument type.

| Type name | Defined in | Always used with | Usage count |
| --- | --- | --- | ---: |
| UpdateByIdPayload | `client/src/types/collectionTypes.ts` | `UpdatePayload` | 11 |
| CollectionQueryResult | `client/src/types/collectionTypes.ts` | `CollectionItem` | 3 |
| CollectionByIdQueryResult | `client/src/types/collectionTypes.ts` | `CollectionItem` | 3 |
| BusinessDataCollectionQueryResult | `client/src/types/dataCollections/businessDataCollectionTypes.ts` | `CollectionItem` | 4 |
| BusinessDataCollectionByIdQueryResult | `client/src/types/dataCollections/businessDataCollectionTypes.ts` | `CollectionItem` | 4 |
| BusinessDataCollectionSelector | `client/src/types/dataCollections/businessDataCollectionTypes.ts` | `CollectionItem` | 3 |
| GlobalDataCollectionQueryResult | `client/src/types/dataCollections/globalDataCollectionTypes.ts` | `CollectionItem` | 4 |
| GlobalDataCollectionByIdQueryResult | `client/src/types/dataCollections/globalDataCollectionTypes.ts` | `CollectionItem` | 4 |
| GlobalDataCollectionSelector | `client/src/types/dataCollections/globalDataCollectionTypes.ts` | `CollectionItem` | 3 |

## Type File Catalog (by domain)

### Domain: admin

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/attendeeQuickSelect.ts` | dedicated | UseAttendeeQuickSelectReturn | no | Attendee quick-select dropdown types | feature |
| `client/src/types/admin/availabilitySettings.ts` | dedicated | UseAvailabilitySettingsOptions, UseAdminAvailabilitySettingsReturn | no | Admin availability settings form types | feature |
| `client/src/types/admin/blockInstanceForm.ts` | dedicated | UseBlockInstanceFormOptions, BlockInstanceFormData | no | Block instance form field and state types | feature |
| `client/src/types/admin/buildMetadataEntry.ts` | dedicated | BuildMetadataEntryOptions | no | Metadata entry builder function types | feature |
| `client/src/types/admin/businessControlsFormState.ts` | dedicated | BusinessHoursDay, UseBusinessControlsFormStateParams | no | Business controls form state and field types | feature |
| `client/src/types/admin/businessRules.ts` | dedicated | RuleType, BusinessRuleFormData, BusinessRuleCore | no | Business rules management interface types | feature |
| `client/src/types/admin/calendarEntries.ts` | dedicated | UseCalendarEntriesReturn | no | Calendar entry display and management types | feature |
| `client/src/types/admin/calibrationChart.ts` | dedicated | SvgChartShape, UseCalibrationChartReturn | no | Calibration chart display and data types | feature |
| `client/src/types/admin/capacityConstraintsHandlers.ts` | dedicated | CapacityConstraintsState, UseCapacityConstraintsHandlersReturn | no | Capacity constraint handler function types | feature |
| `client/src/types/admin/capacitySettings.ts` | dedicated | UseCapacitySettingsParams | no | Capacity settings configuration types | feature |
| `client/src/types/admin/conditionalFieldVisibility.ts` | dedicated | FieldsByLocation, UseConditionalFieldVisibilityOptions, UseConditionalFieldVisibilityReturn | no | Conditional field visibility rule types | feature |
| `client/src/types/admin/dialogFormState.ts` | dedicated | UseDialogFormStateOptions, UseDialogFormStateReturn | no | Dialog form modal state management types | feature |
| `client/src/types/admin/dragAndDrop.ts` | dedicated | DragEndHandler, UseDragAndDropParams, UseDragAndDropReturn | no | General drag-and-drop interaction types for admin | feature |
| `client/src/types/admin/entityCardActions.ts` | dedicated | UseEntityCardActionsOptions, UseEntityCardActionsReturn | no | Entity card action button and handler types | feature |
| `client/src/types/admin/entityCardComputed.ts` | dedicated | UseEntityCardComputedParams, UseEntityCardComputedReturn | no | Entity card computed property types | feature |
| `client/src/types/admin/entityCardExpansion.ts` | dedicated | UseEntityCardExpansionOptions, UseEntityCardExpansionReturn | no | Entity card expansion panel state types | feature |
| `client/src/types/admin/entityCardFieldConfiguration.ts` | dedicated | UseEntityCardFieldConfigurationParams, UseEntityCardFieldConfigurationReturn | no | Entity card field configuration and layout types | feature |
| `client/src/types/admin/entityCardFieldContextAndVisibility.ts` | dedicated | UseEntityCardFieldContextAndVisibilityParams | no | Entity card field context and conditional visibility types | feature |
| `client/src/types/admin/entityCardForm.ts` | dedicated | UseEntityCardFormOptions, UseEntityCardFormReturn | no | Entity card form data and submission types | feature |
| `client/src/types/admin/entityCardFormSetup.ts` | dedicated | UseEntityCardFormSetupParams, UseEntityCardFormSetupReturn | no | Entity card form initialization types | feature |
| `client/src/types/admin/entityCardLayout.ts` | dedicated | UseEntityCardLayoutOptions, UseEntityCardLayoutReturn | no | Entity card layout and section types | feature |
| `client/src/types/admin/entityCardMetadata.ts` | dedicated | UseEntityMetadataReturn, UseEntityCardMetadataParams, UseEntityCardMetadataReturn | no | Entity card metadata display and edit types | feature |
| `client/src/types/admin/entityCardSaveAndActions.ts` | dedicated | UseEntityCardSaveAndActionsParams, UseEntityCardSaveAndActionsReturn | no | Entity card combined save and action types | feature |
| `client/src/types/admin/entityCardSaveHandlers.ts` | dedicated | UseEntityCardSaveHandlersParams | no | Entity card save handler function types | feature |
| `client/src/types/admin/entityCardSaveState.ts` | dedicated | UseEntityCardSaveStateReturn | no | UseEntityCardSaveStateReturn for entity card save state. | feature |
| `client/src/types/admin/entityCardStoreSync.ts` | dedicated | UseEntityCardStoreSyncOptions, UseEntityCardStoreSyncReturn | no | Entity card store synchronization types | feature |
| `client/src/types/admin/entityDragHandlers.ts` | dedicated | PatchOrderIndex, UseEntityDragHandlersParams, UseEntityDragHandlersReturn | no | Entity drag event handler function types | feature |
| `client/src/types/admin/entityFiltering.ts` | dedicated | UseEntityFilteringReturn | no | Entity list filtering criteria and state types | feature |
| `client/src/types/admin/entityFormRedirectOptions.ts` | dedicated | UseEntityFormRedirectOptions | no | UseEntityFormRedirectOptions for entity form redirect behavior. | feature |
| `client/src/types/admin/entityGrouping.ts` | dedicated | UseEntityGroupingParams, UseEntityGroupingReturn | no | Entity grouping and categorization types | feature |
| `client/src/types/admin/entityInstanceFormBase.ts` | dedicated | UseEntityInstanceFormReturn | no | Shared return shape for block/part instance form composables. | feature |
| `client/src/types/admin/entityStatus.ts` | dedicated | UseEntityStatusOptions, UseEntityStatusReturn | no | Entity status enum and transition types | feature |
| `client/src/types/admin/entityTabState.ts` | dedicated | UseEntityTabStateReturn, UseEntityTabStateOptions | no | Entity tab navigation state types | feature |
| `client/src/types/admin/expansionState.ts` | dedicated | UseExpansionStateReturn | no | Panel expansion state tracking types | feature |
| `client/src/types/admin/fieldComponent.ts` | dedicated | UseFieldComponentOptions, UseFieldComponentReturn | no | Field component prop and rendering types | feature |
| `client/src/types/admin/fieldContextManager.ts` | dedicated | UseFieldContextManagerOptions, UseFieldContextManagerReturn | no | Field context management and lifecycle types | feature |
| `client/src/types/admin/fieldInputHandlers.ts` | dedicated | UseFieldInputHandlersParams | no | Field input event handler function types | feature |
| `client/src/types/admin/fieldInputSetup.ts` | dedicated | UseFieldInputSetupOptions | no | Field input initialization and setup types | feature |
| `client/src/types/admin/fieldKeyboardGuard.ts` | dedicated | FieldKeyboardGuardType, UseFieldKeyboardGuardOptions, UseFieldKeyboardGuardReturn | no | FieldKeyboardGuardType, UseFieldKeyboardGuardOptions, UseFieldKeyboardGuardReturn. | feature |
| `client/src/types/admin/fieldLocation.ts` | dedicated | UseFieldLocationOptions, UseFieldLocationReturn | no | Field location and section assignment types | feature |
| `client/src/types/admin/fieldMetadataUpdate.ts` | dedicated | FieldMetadataConfig | no | FieldMetadataConfig and types for useFieldMetadataUpdate. | feature |
| `client/src/types/admin/fieldRendererComponent.ts` | dedicated | UseFieldRendererComponentOptions, UseFieldRendererComponentReturn | no | UseFieldRendererComponentOptions, UseFieldRendererComponentReturn. | feature |
| `client/src/types/admin/formElementPatching.ts` | dedicated | UseFormElementPatchingOptions, FormElementPatchingOptionsBase, UseFormElementPatchingReturn | no | Form element patching options and return types. | feature |
| `client/src/types/admin/gridConfigHandlers.ts` | dedicated | GridConfigState, UseGridConfigHandlersReturn | no | Grid configuration handler function types | feature |
| `client/src/types/admin/iconPickerState.ts` | dedicated | UseIconPickerStateOptions, UseIconPickerStateReturn | no | UseIconPickerStateOptions, UseIconPickerStateReturn. | feature |
| `client/src/types/admin/instanceBulkEdit.ts` | dedicated | UseInstanceBulkEditOptions, UseInstanceBulkEditReturn | no | UseInstanceBulkEditOptions, UseInstanceBulkEditReturn. | feature |
| `client/src/types/admin/instanceComposableOptions.ts` | dedicated | UseInstanceBlockInstancesByShapeOptions | no | Instance composable configuration option types | feature |
| `client/src/types/admin/instanceDragAndDrop.ts` | dedicated | UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn | no | UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn. | feature |
| `client/src/types/admin/instanceFiltering.ts` | dedicated | UseInstanceFilteringOptions, UseInstanceFilteringReturn | no | UseInstanceFilteringOptions, UseInstanceFilteringReturn. | feature |
| `client/src/types/admin/instanceGrouping.ts` | dedicated | UseInstanceGroupingOptions, UseInstanceGroupingReturn | no | UseInstanceGroupingOptions, UseInstanceGroupingReturn. | feature |
| `client/src/types/admin/instanceShape.ts` | dedicated | UseInstanceShapeOptions, UseInstanceShapeReturn | no | UseInstanceShapeOptions, UseInstanceShapeReturn. | feature |
| `client/src/types/admin/instanceTabHandlers.ts` | dedicated | UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn | no | UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn. | feature |
| `client/src/types/admin/instancesTab.ts` | dedicated | UseInstancesTabReturn | no | Instances tab component state and handler types | feature |
| `client/src/types/admin/instancesTabEventInstance.ts` | dedicated | NewEventInstanceData, UseInstancesTabEventInstanceParams | no | UseInstancesTabEventInstanceParams, NewEventInstanceData. | feature |
| `client/src/types/admin/instancesTabEventInstanceDrag.ts` | dedicated | UseInstancesTabEventInstanceDragParams | no | UseInstancesTabEventInstanceDragParams. | feature |
| `client/src/types/admin/metadataCache.ts` | dedicated | MetadataEntityType, MetadataCache, UseMetadataCacheReturn | no | MetadataCache, UseMetadataCacheReturn, MetadataEntityType. | feature |
| `client/src/types/admin/metadataFieldDrag.ts` | dedicated | UseMetadataFieldDragParams | no | UseMetadataFieldDragParams. | feature |
| `client/src/types/admin/metadataFieldOrdering.ts` | dedicated | UseMetadataFieldOrderingOptions, UseMetadataFieldOrderingReturn | no | UseMetadataFieldOrderingOptions, UseMetadataFieldOrderingReturn. | feature |
| `client/src/types/admin/metadataModalHandlers.ts` | dedicated | UseMetadataModalHandlersReturn | no | UseMetadataModalHandlersReturn. | feature |
| `client/src/types/admin/nestedComputedFactory.ts` | dedicated | CreateNestedComputedOptions | no | Nested computed property factory pattern types | feature |
| `client/src/types/admin/partInstanceBulkEdit.ts` | dedicated | UsePartInstanceBulkEditOptions, UsePartInstanceBulkEditReturn | no | PartInstanceBulkEditData, UsePartInstanceBulkEditOptions, UsePartInstanceBulkEditReturn. | feature |
| `client/src/types/admin/partInstanceCollection.ts` | dedicated | PartInstanceCollectionModel | no | PartInstanceCollectionModel. | feature |
| `client/src/types/admin/partInstanceExpansion.ts` | dedicated | UsePartInstanceExpansionOptions, UsePartInstanceExpansionReturn | no | UsePartInstanceExpansionOptions, UsePartInstanceExpansionReturn. | feature |
| `client/src/types/admin/partInstanceForm.ts` | dedicated | UsePartInstanceFormOptions, PartInstanceFormData | no | PartInstanceFormData, UsePartInstanceFormOptions, UsePartInstanceFormReturn. | feature |
| `client/src/types/admin/partPricing.ts` | dedicated | PartPricingFields | no | Part pricing calculation and display types | feature |
| `client/src/types/admin/partsTotals.ts` | dedicated | UsePartsTotalsReturn | no | UsePartsTotalsReturn. | feature |
| `client/src/types/admin/propertyCreateForm.ts` | dedicated | UsePropertyCreateFormReturn | no | Property creation form field and state types | feature |
| `client/src/types/admin/relationshipCollection.ts` | dedicated | NameGenerator, UseRelationshipCollectionOptions | no | NameGenerator, RelationshipCollectionModel, UseRelationshipCollectionOptions. | feature |
| `client/src/types/admin/relationshipCollectionData.ts` | dedicated | UseRelationshipCollectionDataReturn, UseRelationshipCollectionDataOptions, UseRelationshipCollectionDataReturnBase | no | UseRelationshipCollectionDataOptions, UseRelationshipCollectionDataReturnBase, UseRelationshipCollectionDataReturn. | feature |
| `client/src/types/admin/selectConfig.ts` | dedicated | UseSelectConfigOptions, UseSelectConfigReturn | no | UseSelectConfigOptions, UseSelectConfigReturn. | feature |
| `client/src/types/admin/selectDomTargets.ts` | dedicated | UseSelectDomTargetsOptions, UseSelectDomTargetsReturn | no | UseSelectDomTargetsOptions, UseSelectDomTargetsReturn. | feature |
| `client/src/types/admin/selectFieldValue.ts` | dedicated | UseSelectFieldValueOptions, UseSelectFieldValueReturn | no | UseSelectFieldValueOptions, UseSelectFieldValueReturn. | feature |
| `client/src/types/admin/selectFiltering.ts` | dedicated | UseSelectFilteringOptions, UseSelectFilteringReturn | no | Select option filtering and search types | feature |
| `client/src/types/admin/selectFormAssociation.ts` | dedicated | UseSelectFormAssociationOptions | no | UseSelectFormAssociationOptions. | feature |
| `client/src/types/admin/selectHandlers.ts` | dedicated | UseSelectHandlersOptions, UseSelectHandlersReturn | no | UseSelectHandlersOptions, UseSelectHandlersReturn. | feature |
| `client/src/types/admin/selectInputsAsync.ts` | dedicated | UseSelectInputsAsyncOptions, UseSelectInputsAsyncReturn | no | UseSelectInputsAsyncOptions, UseSelectInputsAsyncReturn. | feature |
| `client/src/types/admin/selectLabelResolution.ts` | dedicated | UseSelectLabelResolutionOptions, UseSelectLabelResolutionReturn | no | UseSelectLabelResolutionOptions, UseSelectLabelResolutionReturn. | feature |
| `client/src/types/admin/selectTypeResolver.ts` | dedicated | SelectConfigLike, OptionsSelectConfigLike | no | Select input type resolution and mapping types | feature |
| `client/src/types/admin/shapeDisplayNames.ts` | dedicated | UseShapeDisplayNamesReturn | no | UseShapeDisplayNamesReturn. | feature |
| `client/src/types/admin/shapeEditModal.ts` | dedicated | UseShapeEditModalOptions, UseShapeEditModalReturn | no | UseShapeEditModalOptions, UseShapeEditModalReturn. | feature |
| `client/src/types/admin/shapesTab.ts` | dedicated |  | no | Shapes tab component state and action types | feature |
| `client/src/types/admin/shapesTabCreation.ts` | dedicated |  | no | UseShapesTabCreationParams. | feature |
| `client/src/types/admin/shapesTabDeletion.ts` | dedicated | ShapesTabBaseParams | no | UseShapesTabDeletionParams. | feature |
| `client/src/types/admin/statusButtonFields.ts` | dedicated | UseStatusButtonFieldsOptions, UseStatusButtonFieldsReturn | no | UseStatusButtonFieldsOptions, UseStatusButtonFieldsReturn. | feature |
| `client/src/types/admin/statusButtonHandlers.ts` | dedicated | UseStatusButtonHandlersOptions, UseStatusButtonHandlersReturn | no | UseStatusButtonHandlersOptions, UseStatusButtonHandlersReturn. | feature |
| `client/src/types/admin/statusButtonToggle.ts` | dedicated | UseStatusButtonToggleOptions, UseStatusButtonToggleReturn | no | UseStatusButtonToggleOptions, UseStatusButtonToggleReturn. | feature |
| `client/src/types/admin/tabNavigation.ts` | dedicated | UseTabNavigationOptions, UseTabNavigationReturn | no | UseTabNavigationOptions, UseTabNavigationReturn. | feature |

### Domain: admin/calendarSettings.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/calendarSettings.ts` | dedicated | UseAdminCalendarSettingsOptions, UseAdminCalendarSettingsReturn | no | (none) | unknown |

### Domain: admin/generic

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/components/admin/generic/fields/fieldTypes.ts` | colocated | FieldInputProps | no | Field renderer and field input prop types for generic fields. | shared |

### Domain: admin/tables

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/tables/appointmentsTableHandlers.ts` | dedicated | UseAppointmentsTableHandlersReturn, UseAppointmentsTableHandlersParams | no | Appointments table action handler types | feature |
| `client/src/types/admin/tables/crudDataTableModel.ts` | dedicated | CrudDataTableModelOptions, CrudDataTableModel, CrudDataTableModelGrouped | no | CRUD data table model and column definition types | feature |
| `client/src/types/admin/tables/tableModelHelpers.ts` | dedicated | TableModelFormatHelpers | no | Table model helper utility types for admin tables | feature |

### Domain: admin/wizardSettings.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/wizardSettings.ts` | dedicated | UseAdminWizardSettingsOptions, UseAdminWizardSettingsReturn | no | (none) | unknown |

### Domain: booking

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/apiCallStatus.ts` | dedicated | ApiCallStatus, ApiCallStatusState, UseApiCallStatusReturn | no | ApiCallStatus, ApiCallStatusState, UseApiCallStatusReturn. | shared |
| `client/src/types/booking/appointmentDataBuilders.ts` | dedicated | AppointmentAttendeeRoleLiteral, AttendeeSpecInput, CreateUserMutate, AvailabilityPayload, BlockQuantities | no | Appointment data builder function types | feature |
| `client/src/types/booking/appointmentDataCollection.ts` | dedicated | UseAppointmentDataCollectionParams, UseAppointmentDataCollectionReturn | no | UseAppointmentDataCollectionParams, UseAppointmentDataCollectionReturn. | feature |
| `client/src/types/booking/appointmentDropdown.ts` | dedicated | UseAppointmentDropdownOptions, UseAppointmentDropdownReturn | no | Appointment dropdown selector types for booking UI | feature |
| `client/src/types/booking/appointmentDuration.ts` | dedicated | UseAppointmentDurationParams, UseAppointmentDurationReturn | no | Appointment duration calculation and display types | feature |
| `client/src/types/booking/appointmentShape.ts` | dedicated | UseAppointmentShapeParams, UseAppointmentShapeReturn | no | Appointment shape configuration and mapping types | feature |
| `client/src/types/booking/appointmentSlots.ts` | dedicated | UseAppointmentSlotsParams, UseAppointmentSlotsReturn | no | Appointment time slot structure and grouping types | feature |
| `client/src/types/booking/appointmentTimes.ts` | dedicated | UseAppointmentTimesParams, UseAppointmentTimesReturn | no | Appointment time range and scheduling types | feature |
| `client/src/types/booking/availabilityDefaults.ts` | dedicated | UseAvailabilityDefaultsOptions, UseAvailabilityDefaultsReturn | no | Default availability configuration value types | feature |
| `client/src/types/booking/availabilityDevPanel.ts` | dedicated | UseAvailabilityDevPanelParams | no | Availability dev panel debug display types | feature |
| `client/src/types/booking/availabilityEmptyState.ts` | dedicated | UseAvailabilityEmptyStateParams, UseAvailabilityEmptyStateReturn | no | Empty state display types when no slots available | feature |
| `client/src/types/booking/availabilityLogic.ts` | dedicated | TimeSlotsPerDay | no | Availability business logic and filtering types | feature |
| `client/src/types/booking/availabilityOrchestrator.ts` | dedicated | UseAvailabilityOrchestratorReturn, UseAvailabilityOrchestratorParams | no | Availability data orchestration and coordination types | feature |
| `client/src/types/booking/availabilitySettings.ts` | dedicated | UseBookingAvailabilitySettingsReturn | no | Availability settings configuration types for booking | feature |
| `client/src/types/booking/availabilitySlotColor.ts` | dedicated | UseAvailabilitySlotColorParams, UseAvailabilitySlotColorReturn | no | Availability slot color coding and visual indicator types | feature |
| `client/src/types/booking/availabilityStepData.ts` | dedicated | SelectedTimeSlot, AvailabilityStepData, UseAvailabilityStepDataReturn | no | Data types for the availability wizard step | feature |
| `client/src/types/booking/availabilityStepHandlers.ts` | dedicated | UseAvailabilityStepHandlersParams, UseAvailabilityStepHandlersReturn | no | Availability step event handler function types | feature |
| `client/src/types/booking/availabilityUI.ts` | dedicated | UseAvailabilityUIParams, UseAvailabilityUIReturn | no | UI state and display types for availability step | feature |
| `client/src/types/booking/availabilityValidation.ts` | dedicated | UseAvailabilityValidationParams, UseAvailabilityValidationReturn | no | Validation types for availability slot selection | feature |
| `client/src/types/booking/blockFinal.ts` | dedicated | BlockFinal | no | BlockFinal type for booking flow. | shared |
| `client/src/types/booking/blockInstanceSelection.ts` | dedicated | SelectionMode, UseBlockInstanceSelectionParams, UseBlockInstanceSelectionReturnSingle, UseBlockInstanceSelectionReturnMultiple | no | Block instance selection state and handler types | feature |
| `client/src/types/booking/bookingWizardStepValidators.ts` | dedicated | BuildBookingWizardStepValidatorsOptions, UseBookingWizardStepValidatorsOptions, BookingWizardStepValidators | no | Step validator function types for booking wizard | feature |
| `client/src/types/booking/cascadeFilterPipeline.ts` | dedicated | CascadeFilterParamsBase | no | Cascade filter pipeline stage and result types | feature |
| `client/src/types/booking/cascadeInstances.ts` | dedicated | UseCascadeInstancesOptions, UseCascadeInstancesReturn | no | Cascade instance resolution and filtering types | feature |
| `client/src/types/booking/computedAvailability.ts` | dedicated | UseComputedAvailabilityParams, UseComputedAvailabilityReturn | no | Computed availability derived state types | feature |
| `client/src/types/booking/confirmationStepData.ts` | dedicated | UseConfirmationStepDataParams, UseConfirmationStepDataReturn | no | Data types for the confirmation wizard step | feature |
| `client/src/types/booking/contactsStepData.ts` | dedicated | ContactInfo, UseContactsStepDataOptions, UseContactsStepDataReturn | no | Data types for the contacts wizard step | feature |
| `client/src/types/booking/contactsValidation.ts` | dedicated | UseContactsValidationReturn, UseContactsValidationParams | no | Contact form validation rules and result types | feature |
| `client/src/types/booking/dateRangeDecider.ts` | dedicated | DisplayedMonth | no | DisplayedMonth type for date range decider. | shared |
| `client/src/types/booking/dependentInstances.ts` | dedicated | UseDependentInstancesOptions, UseDependentInstancesReturn | no | Dependent instance resolution and linking types | feature |
| `client/src/types/booking/devPanelButtonsContext.ts` | dedicated | DevPanelButtonsContext | no | Dev panel button context types for debug controls | feature |
| `client/src/types/booking/devPanelsComputed.ts` | dedicated | DevPanelsComputedData, UseDevPanelsComputedOptions, ServiceSummary, TimeSlotResults, UseDevPanelsComputedReturn | no | Computed properties types for dev panel display | feature |
| `client/src/types/booking/durationRounding.ts` | dedicated | RoundingMethod, DurationRoundingConfig, UseDurationRoundingReturn | no | Duration rounding logic and configuration types | feature |
| `client/src/types/booking/dynamicGridConfig.ts` | dedicated | UseDynamicGridConfigOptions, UseDynamicGridConfigReturn | no | Dynamic grid layout configuration and breakpoint types | feature |
| `client/src/types/booking/elementDimensions.ts` | dedicated | UseElementDimensionsOptions, UseElementDimensionsReturn | no | Element dimension measurement and resize types | feature |
| `client/src/types/booking/instanceComponents.ts` | dedicated | UseInstanceComponentsOptions, UseInstanceComponentsReturn | no | Instance component composition and rendering types | feature |
| `client/src/types/booking/instanceComponentsList.ts` | dedicated | UseInstanceComponentsListOptions, UseInstanceComponentsListReturn | no | Instance components list rendering types | feature |
| `client/src/types/booking/instanceDescriptions.ts` | dedicated | UseInstanceDescriptionsOptions, UseInstanceDescriptionsReturn | no | Instance description and label generation types | feature |
| `client/src/types/booking/instanceDisplay.ts` | dedicated | UseInstanceDisplayOptions, UseInstanceDisplayReturn | no | Instance display formatting and rendering types | feature |
| `client/src/types/booking/instanceSelectionConfig.ts` | dedicated | UseInstanceSelectionConfigOptions, UseInstanceSelectionConfigReturn | no | Configuration types for instance selection behavior | feature |
| `client/src/types/booking/instanceSelectionState.ts` | dedicated | GenericWizardInstance, UseInstanceSelectionStateParams, UseInstanceSelectionStateReturn | no | Reactive state types for instance selection tracking | feature |
| `client/src/types/booking/mockCalendarRefresh.ts` | dedicated | UseMockCalendarRefreshReturn | no | Mock calendar refresh testing utility types | feature |
| `client/src/types/booking/moveablePartsScheduling.ts` | dedicated | ComputeMoveableSlotsParams | no | Moveable parts scheduling configuration types | feature |
| `client/src/types/booking/optionTypeBlockSelection.ts` | dedicated | UseOptionTypeBlockSelectionParams, UseOptionTypeBlockSelectionReturn | no | Option type block selection handler types | feature |
| `client/src/types/booking/partFinal.ts` | dedicated | PartFinal | no | PartFinal type for booking flow. | shared |
| `client/src/types/booking/perspectiveMapping.ts` | dedicated | UsePerspectiveMappingParams, UsePerspectiveMappingReturn | no | Perspective mapping between entity views types | feature |
| `client/src/types/booking/perspectiveResolver.ts` | dedicated | ResolvedEventShapes | no | Perspective resolution types for entity display context | feature |
| `client/src/types/booking/pricingCascadeInstances.ts` | dedicated | UsePricingCascadeInstancesOptions, UsePricingCascadeInstancesReturn | no | Pricing cascade instance resolution types | feature |
| `client/src/types/booking/propertyDetailsLogic.ts` | dedicated | PropertyFormStateCore, UsePropertyDetailsLogicReturn | no | Property details step business logic types | feature |
| `client/src/types/booking/propertyFormState.ts` | dedicated | UsePropertyFormStateReturn | no | Property form reactive state and field types | feature |
| `client/src/types/booking/propertyFormWatchers.ts` | dedicated | UsePropertyFormWatchersReturn | no | Property form watcher configuration and handler types | feature |
| `client/src/types/booking/propertyTypeBlockConfig.ts` | dedicated | UsePropertyTypeBlockConfigParams, UsePropertyTypeBlockConfigReturn | no | Property type to block mapping configuration types | feature |
| `client/src/types/booking/propertyTypeBlockSelection.ts` | dedicated | UsePropertyTypeBlockSelectionParams, UsePropertyTypeBlockSelectionReturn | no | Property type block selection handler types | feature |
| `client/src/types/booking/propertyValidation.ts` | dedicated | PropertyAddressValidationRules, PropertySizeValidationRules, PropertyValidationData, UsePropertyValidationParams | no | Property field validation rules and result types | feature |
| `client/src/types/booking/responsiveGrid.ts` | dedicated | UseResponsiveGridOptions, UseResponsiveGridReturn | no | Responsive grid layout configuration types | feature |
| `client/src/types/booking/selectionCardGroupConfig.ts` | dedicated | UseSelectionCardGroupConfigParams, UseSelectionCardGroupConfigReturn | no | Selection card group layout and configuration types | feature |
| `client/src/types/booking/slotGenerationValidation.ts` | dedicated | SlotGenerationParams, SlotGenerationParamsBase | no | Slot generation validation and error types | feature |
| `client/src/types/booking/stepValidation.ts` | dedicated | CustomValidator, UseStepValidationParams, UseStepValidationReturn | no | Individual step validation state and result types | feature |
| `client/src/types/booking/timeSlotCalculations.ts` | dedicated | DifferentialTimeBlocks, UseTimeSlotCalculationsParams, UseTimeSlotCalculationsReturn | no | Time slot calculation and duration computation types | feature |
| `client/src/types/booking/timeSlotMatching.ts` | dedicated | LoadedTimeSlot, MatchLoadedTimeSlotsResult | no | Time slot matching and comparison utility types | feature |
| `client/src/types/booking/wizardAppointmentManagement.ts` | dedicated | UseWizardAppointmentManagementReturn | no | Wizard appointment creation and update management types | feature |
| `client/src/types/booking/wizardDateAvailability.ts` | dedicated | UseWizardDateAvailabilityParams, UseWizardDateAvailabilityReturn | no | Wizard date availability query and state types | feature |
| `client/src/types/booking/wizardDevMode.ts` | dedicated | UseWizardDevModeReturn | no | Wizard dev mode toggle and configuration types | feature |
| `client/src/types/booking/wizardDisplay.ts` | dedicated | UseWizardDisplayParams, UseWizardDisplayReturn | no | Wizard display mode and layout configuration types | feature |
| `client/src/types/booking/wizardFilteredOptions.ts` | dedicated | UseWizardFilteredOptionsParams, UseWizardFilteredOptionsReturn | no | Wizard filtered option list and query types | feature |
| `client/src/types/booking/wizardNavigation.ts` | dedicated | UseWizardNavigationParams, UseWizardNavigationReturn | no | Wizard step navigation state and action types | feature |
| `client/src/types/booking/wizardStateData.ts` | dedicated | WizardStateData | no | Wizard global state data container types | feature |
| `client/src/types/booking/wizardStepContent.ts` | dedicated | UseWizardStepContentReturn | no | Wizard step content rendering and layout types | feature |
| `client/src/types/booking/wizardStepDataRefs.ts` | dedicated | UseWizardStepDataRefsReturn | no | Wizard step reactive data reference types | feature |
| `client/src/types/booking/wizardStepSync.ts` | dedicated | UseWizardStepSyncParams | no | Wizard step synchronization and data flow types | feature |
| `client/src/types/booking/wizardStepValidation.ts` | dedicated | UseWizardStepValidationParams, UseWizardStepValidationReturn | no | Per-step validation logic types for booking wizard | feature |
| `client/src/types/booking/wizardSubmission.ts` | dedicated | UseWizardSubmissionParams, UseWizardSubmissionReturn | no | Wizard submission payload and API request types | feature |
| `client/src/types/booking/wizardValidation.ts` | dedicated | StepValidator, UseWizardValidationReturn, UseWizardValidationParams | no | Wizard-level validation orchestration types | feature |
| `client/src/types/booking/wizardValidationErrors.ts` | dedicated | UseWizardValidationErrorsOptions, UseWizardValidationErrorsReturn | no | Wizard validation error display and tracking types | feature |

### Domain: booking/dev

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/dev/panelPosition.ts` | dedicated | UsePanelPositionOptions, UsePanelPositionReturn | no | Dev panel position and layout types for booking debug UI | feature |

### Domain: booking/selectionCard

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/selectionCard/selectionCard.ts` | dedicated | UseSelectionCardOptions, UseSelectionCardReturn, UseSelectionCardGroupOptions, UseSelectionCardGroupReturn | no | Core selection card type definitions and interfaces | feature |
| `client/src/types/booking/selectionCard/selectionCardComponent.ts` | dedicated | UseSelectionCardComponentReturn | no | Component prop and emit types for selection card | feature |
| `client/src/types/booking/selectionCard/selectionCardConfig.ts` | dedicated | UseSelectionCardConfigParams, UseSelectionCardConfigReturn | no | Configuration types for booking selection card components | feature |
| `client/src/types/booking/selectionCard/selectionCardGroupState.ts` | dedicated | UseSelectionCardGroupStateParams, UseSelectionCardGroupStateReturn | no | Group state types for multi-selection card sets | feature |
| `client/src/types/booking/selectionCard/selectionCardHandlers.ts` | dedicated | UseSelectionCardHandlersParams, UseSelectionCardHandlersReturn | no | Event handler types for selection card user actions | feature |
| `client/src/types/booking/selectionCard/selectionCardState.ts` | dedicated | UseSelectionCardStateParams, UseSelectionCardStateReturn | no | State management types for selection card interaction | feature |
| `client/src/types/booking/selectionCard/selectionCardStyles.ts` | dedicated | UseSelectionCardStylesParams, UseSelectionCardStylesParamsBase, UseSelectionCardStylesReturn | no | Style and theming types for selection card display | feature |
| `client/src/components/booking/types/selectionCardTypes.ts` | colocated | ComponentItem, SelectionCardItem, GridColumns, StatePlugin, SelectionCardConfig | no | Selection card configuration, appearance, and feature-flag types. | feature |

### Domain: componentEntity

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/componentEntity/componentEntityActions.ts` | dedicated | UseComponentEntityActionsReturn | no | Component entity action handler types | shared |
| `client/src/types/componentEntity/componentEntityDomain.ts` | dedicated | UseComponentEntityDomainParams, UseComponentEntityDomainReturn | no | Component entity domain model types | shared |
| `client/src/types/componentEntity/componentEntityQuery.ts` | dedicated | UseComponentEntityQueryReturn | no | Component entity query and fetch types | shared |

### Domain: dataCollections

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/dataCollections/businessDataCollectionTypes.ts` | dedicated | BusinessDataCollectionQueryResult, BusinessDataCollectionByIdQueryResult, BusinessDataCollectionSelector, BusinessDataCollectionUpdater, BusinessDataCollectionEndpoints… | no | Business data collection query types | shared |
| `client/src/types/dataCollections/dataCollectionActions.ts` | dedicated | DataCollectionCrudConfig, UseDataCollectionActionsReturn | no | Data collection mutation and action types | shared |
| `client/src/types/dataCollections/globalDataCollectionTypes.ts` | dedicated | GlobalDataCollectionQueryResult, GlobalDataCollectionByIdQueryResult, GlobalDataCollectionSelector, GlobalDataCollectionUpdater, GlobalDataCollectionEndpoints… | no | Global data collection query types | shared |

### Domain: dev

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/dev/apiDevPanelData.ts` | dedicated | OAuthStatusShape, RateLimitShape, DevPanelCacheEntry, DevPanelCacheStats, DevPanelCacheShape… | no | API dev panel data display and inspection types | feature |
| `client/src/types/dev/devPanelTabs.ts` | dedicated | DevPanelTab, UseDevPanelTabsReturn | no | Dev panel tab configuration and navigation types | feature |
| `client/src/components/admin/dev/devPanelTypes.ts` | colocated | DevPanelVisibleProps | no | Dev panel visibility props and component types. | feature |

### Domain: entity

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entities.ts` | dedicated | AnnotationShapeEntity, GlobalEntity | no | Core entity type definitions (runtime helpers moved to utils/globalEntity.ts). | shared |
| `client/src/types/entity/formDataEnums.ts` | dedicated |  | no | Form data enums: field type, mode, primitive type, etc. | shared |
| `client/src/types/entity/formFields.ts` | dedicated | PrimitiveFormField, PrimitiveFieldType, DependencyImpactBase, RelationshipFieldType, VirtualFieldType… | no | Form field config types for entity forms. | shared |
| `client/src/types/entity/selectOptions.ts` | dedicated | SelectGroup | no | Select options types for entity fields. | shared |
| `client/src/types/relationships.ts` | dedicated | GlobalRelationship, CreateRelationshipPayload, FetchedRelationship, CreateRelationshipPayloadBase | no | Relationship type definitions for parent-child entity connections. | shared |

### Domain: entityCrud

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entityCrud/entityCrudQuery.ts` | dedicated | UseEntityCrudQueryReturn | no | Entity CRUD query and fetch types | shared |
| `client/src/types/entityCrud/entityCrudState.ts` | dedicated | UseEntityCrudStateReturn, UseEntityCrudStateReturnBase | no | Entity CRUD state management types | shared |
| `client/src/types/entityCrud/entityCrudTypes.ts` | dedicated | OrderIndexUpdate, BulkUpdate, UseEntityCrudActionsReturn, EntityCrudMutationContext, UseEntityCrudMutationsReturnBase | no | Core entity CRUD operation types | shared |
| `client/src/types/entityCrud/sharedMutationHandlers.ts` | dedicated | InvalidateEntityQueriesOptions, MutationContextWithPreviousData | no | Shared entity mutation handler types | shared |

### Domain: fieldContext

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/fieldContext/fieldContextActions.ts` | dedicated | UseFieldContextActionsReturn | no | Field context action handler types | shared |
| `client/src/types/fieldContext/fieldContextSaveHelpers.ts` | dedicated | SaveComponentEntityParams, SaveRelationshipFieldParams, SaveRegularFieldParams | no | Field context save helper function types | shared |
| `client/src/types/fieldContext/fieldContextState.ts` | dedicated | UseFieldContextStateOptions, UseFieldContextStateReturn, UseFieldContextStateReturnGrouped | no | UseFieldContextStateOptions and UseFieldContextStateReturn. | shared |
| `client/src/composables/fieldContext/types.ts` | colocated | FieldDisplayConfig, FieldValidationRules, FieldContextType, FieldContextTypeGrouped | no | Field context types for entity form fields. | shared |

### Domain: formFields

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/formFields/formFieldsContext.ts` | dedicated | UseFormFieldsContextReturn | no | Form fields context types for field rendering and form state. | shared |
| `client/src/types/forms/fieldComponent.ts` | dedicated | FieldComponent | no | Form field component type definitions | shared |
| `client/src/types/forms/fieldLocationDispatcher.ts` | dedicated | FieldLocation, FieldLocationContext | no | Field location dispatch and routing types | shared |
| `client/src/types/forms/fieldSectionCategorization.ts` | dedicated | StatusButtonField | no | Field section categorization and grouping types | shared |
| `client/src/types/forms/getFieldKeys.ts` | dedicated | GetFieldKeysOptions | no | Field key extraction and typing utilities | shared |
| `client/src/types/forms/layoutFieldCategorization.ts` | dedicated | FieldsByLayout | no | Layout field categorization and section types | shared |
| `client/src/types/forms/selectDomAssociation.ts` | dedicated | SelectDomTarget | no | Select input DOM association and binding types | shared |
| `client/src/composables/formFields/types.ts` | colocated | UseFormFieldsContextOptions, UseFormFieldsOptionsBase, UseFormFieldsStandardLayoutReturn | no | Form fields types and layout config. | shared |

### Domain: root

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/addressAutocomplete.ts` | dedicated | SelectionResult, UseAddressAutocompleteEmit, UseAddressAutocompleteOptions, UseAddressAutocompleteReturn | no | Address autocomplete input and suggestion types | shared |
| `client/src/types/admin.ts` | dedicated | DisplayFieldType | no | Top-level admin domain type re-exports and interfaces | feature |
| `client/src/types/annotations.ts` | dedicated | AnnotationShape, AnnotationInstance, AnnotationMetadata, AnnotationWithMetadata, AnnotationMap… | no | Annotation entity data structure types | shared |
| `client/src/types/appointment.ts` | dedicated | TimeRange, PerspectiveKey, AppointmentSlots, EventFinal, SlotShape… | no | Core appointment data structure types | feature |
| `client/src/types/appointmentApi.ts` | dedicated | AttendeeResponse, AppointmentRequest, AppointmentResponse | no | Appointment API request and response types | feature |
| `client/src/types/appointmentStatus.ts` | dedicated | AppointmentStatus | no | Appointment status enum and transition types | feature |
| `client/src/types/autocomplete.ts` | dedicated | AutocompleteValue | no | Autocomplete input component types | shared |
| `client/src/types/availability.ts` | dedicated | PropertyDetails | no | Core availability slot and schedule types | feature |
| `client/src/types/availabilitySettingsParams.ts` | dedicated | UseBufferSettingsParams, UseDefaultLocationParams, AvailabilitySettingsFormParams | no | Availability settings parameter types for API calls | feature |
| `client/src/types/availabilityStepParams.ts` | dedicated | AvailabilityStepParamsBase | no | Availability step parameter and query types | feature |
| `client/src/types/betaFeedback.ts` | dedicated | FeedbackCategory, FeedbackSeverity, FeedbackStatus, BetaFeedbackFilters, BetaFeedback… | no | Beta feedback form and submission types | feature |
| `client/src/types/business.ts` | dedicated | UseBusinessReturn | no | Business entity data structure types | feature |
| `client/src/types/collectionTypes.ts` | dedicated | WithId, UpdateByIdPayload, CollectionQueryResult, CollectionByIdQueryResult, CollectionEndpoints | no | Canonical collection types: WithId, UpdateByIdPayload, CollectionQueryResult, etc. | shared |
| `client/src/types/collections/arrayDiff.ts` | dedicated | ArrayDiffResult | no | Array diff comparison and change detection types | shared |
| `client/src/types/collections/resolveByIds.ts` | dedicated | ResolveByIdsResult | no | Resolve-by-ID lookup and mapping types | shared |
| `client/src/types/component.ts` | dedicated | ComponentStrategy, ComponentConfig, DistributionStrategy, FetchedInstanceComponent, Component… | no | Component entity data structure types | feature |
| `client/src/types/componentDistribution.ts` | dedicated | UseComponentDistributionOptions, UseComponentDistributionReturn | no | Component distribution layout types | shared |
| `client/src/types/datetime.ts` | dedicated | DayOfWeek | no | Date, time, and timezone utility types | shared |
| `client/src/types/entityForm.ts` | dedicated | UseEntityFormReturn | no | Entity form field definition and state types | shared |
| `client/src/types/errors/axiosErrorUtils.ts` | dedicated | ExtractedErrorMessage | no | Extracted error message types for Axios error handling. | shared |
| `client/src/types/events.ts` | dedicated | EventShape, EventInstance | no | Application event and callback types | shared |
| `client/src/types/formValidation.ts` | dedicated | ValidationRule, ValidationResult | no | ValidationRule and ValidationResult for form validation. | shared |
| `client/src/types/googleCalendar.ts` | dedicated | GoogleCalendarBusyPeriod, GoogleFreeBusyResponse | no | Google Calendar API integration types | feature |
| `client/src/types/layoutLoading.ts` | dedicated | UseLayoutLoadingOptions, UseLayoutLoadingReturn | no | Layout loading state indicator types | shared |
| `client/src/types/loadingIndicator.ts` | dedicated | LoadingIndicatorInstance, UseLoadingIndicatorReturn | no | Loading indicator display and state types | shared |
| `client/src/types/logger.ts` | dedicated |  | no | Canonical logger types (LogLevel, AppLogger, Logger); re-exported from shared. | shared |
| `client/src/types/metadataEditorProps.ts` | dedicated | MetadataEditorPropsBase | no | Metadata editor component prop types | shared |
| `client/src/types/moveableScheduling.ts` | dedicated | ContingencyPeriod, MoveableSchedulingOptions | no | Moveable scheduling constraint and boundary types | feature |
| `client/src/types/partInstanceData.ts` | dedicated | UsePartInstanceDataOptions, UsePartInstanceDataReturn | no | Part instance data structure types | feature |
| `client/src/types/property.ts` | dedicated | PropertyVersionType, PropertyTypesRequest | no | Property entity data structure types | feature |
| `client/src/types/propertyForm.ts` | dedicated | PropertySource, PropertyFormData | yes | Property form field definition and validation types | feature |
| `client/src/types/selectOptions.ts` | dedicated | SelectOptionOrHeader, SelectOptionBase, SelectOptionGroupHeader, UseSelectOptionsOptions, UseSelectOptionsReturn | yes | Generic select option and dropdown types | shared |
| `client/src/types/shapeFieldMetadata.ts` | dedicated | ShapeFieldMetadata, ShapeLayoutConfig, ComposedFieldConfig | no | Shape field metadata configuration types | shared |
| `client/src/types/ternary.ts` | dedicated | TernaryBoolean | no | Ternary logic value types for three-state fields | shared |
| `client/src/types/transformers/adminObject.ts` | dedicated | AdminObject, AdminObjectMap | no | Admin object transformer input/output types | shared |
| `client/src/types/transformers/appointmentToWizardHelpers.ts` | dedicated | VersionBlockInstance, AppointmentVersionsResponse | no | Appointment-to-wizard data mapping helper types | shared |
| `client/src/types/transformers/bookingData.ts` | dedicated | BookingPartInstance, BookingBlockShape, BookingBlockInstance, BookingData | no | Booking data transformer types | shared |
| `client/src/types/transformers/businessData.ts` | dedicated | BusinessData | no | Business data transformer types | shared |
| `client/src/types/transformers/fieldClassification.ts` | dedicated | DehydrateFieldSets | no | Field classification and categorization types | shared |
| `client/src/types/transformers/globalData.ts` | dedicated | GlobalData | no | Global data transformer types | shared |
| `client/src/types/user.ts` | dedicated |  | no | User entity and session types | shared |
| `client/src/types/userTypes.ts` | dedicated | UserTypeBlock | no | User profile and authentication types | shared |
| `client/src/types/vueRefTypes.ts` | dedicated | ReadonlyVueRef | no | Vue ref type helpers and unwrap utilities | shared |
| `client/src/types/vuetifyTypes.ts` | dedicated | VuetifyAnchor | no | Vuetify component type augmentations and helpers | shared |
| `client/src/types/wizard.ts` | dedicated | WizardMode, UseBookingWizardReturn, PropertyDetailsStepData, WizardState, WizardSelectionMethods… | no | Core booking wizard state and navigation types | feature |
| `client/src/types/wizardDevOptions.ts` | dedicated | WizardDevOptionsBase | no | Wizard dev mode option and toggle types | feature |
| `client/src/types/wizardStateFieldConfig.ts` | dedicated | WizardInstance, WizardStateField, WizardFieldConfig | no | Wizard state field configuration and mapping types | feature |
| `client/src/types/wizardStepData.ts` | dedicated | SummaryData, PriceData | no | Wizard step data container and shape types | feature |
| `shared/types/appointmentFeeTypes.ts` | dedicated | AppointmentFeeSummaryCreate, AppointmentFeeEntryCreate, AppointmentFeeSummary, FeeEntryBase, AppointmentFeeBreakdownPayload | no | Appointment fee calculation and pricing types | shared |
| `shared/types/appointmentTypes.ts` | dedicated | AttendeeRequest, AdminEntryAppointmentItem | no | Shared appointment data structure types | shared |
| `shared/types/availabilityTypes.ts` | dedicated | RFC3339DateTime, ConstraintEnforcement, RollingWeekDirection, ConstraintCategory, RangeConstraintType… | no | Shared availability slot and scheduling types | shared |
| `shared/types/businessRulesTypes.ts` | dedicated | RuleConfig, RequiredFieldsRuleConfig, RequiresAgentRuleConfig, ConditionalValidationRuleConfig, ValidationMessageRuleConfig | no | Business rules configuration and constraint types | shared |
| `shared/types/calendarTypes.ts` | dedicated | CalendarProvider, AdminEntryTimeoutUnit, CalendarEntry, AdminEntryTimeout, CalendarConfig | no | Shared calendar event and scheduling types | shared |
| `shared/types/componentTypes.ts` | dedicated | ComponentStrategy, ComponentConfig | no | Shared component entity data types | shared |
| `shared/types/contactTypes.ts` | dedicated | ContactInfoBase | no | Contact information and attendee types | shared |
| `shared/types/coreEntityTypes.ts` | dedicated | CoreEntity | no | Core entity type definitions shared between client and server | shared |
| `shared/types/identifiable.ts` | dedicated | IdentifiableById | no | Base Identifiable interface with id field for entities | shared |
| `shared/types/loggerTypes.ts` | dedicated | LogLevel, AppLogger, Logger, LoggerEnvConfig | no | Logger interface and log level types shared across packages | shared |
| `shared/types/mapsTypes.ts` | dedicated | MapsApiErrorType, RouteLocation, RouteMatrixStatus, AutocompletePrediction, AddressComponents… | no | Google Maps address and geocoding types | shared |
| `shared/types/metadataEntryTypes.ts` | dedicated | MetadataEntryBase | no | Metadata entry structure types for entity fields | shared |
| `shared/types/primitiveBrands.ts` | dedicated | ISO8601Date, GlobalEntityId | no | Branded primitive types for type-safe entity IDs and keys | shared |
| `shared/types/propertyEnrichmentTypes.ts` | dedicated |  | no | Property enrichment data from external sources | shared |
| `shared/types/propertyTypes.ts` | dedicated | PropertyAddressBase, PropertyDetailsBase | no | Shared property entity data types | shared |

### Domain: utils/booking

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/utils/booking/bookingFinalTypes.ts` | colocated |  | no | Re-export barrel for BlockFinal type from booking/blockFinal. | feature |

## Constants vs Configs Boundary

| Category | File | Const exports | Type exports | Factory fns |
| --- | --- | ---: | ---: | --- |
| constants | `client/src/constants/adminPrimitiveMetadataOptions.ts` | 4 | 0 | no |
| constants | `client/src/constants/apiStatus.ts` | 11 | 1 | no |
| constants | `client/src/constants/appointmentStatus.ts` | 2 | 0 | yes |
| constants | `client/src/constants/appointmentsTableConstants.ts` | 2 | 0 | no |
| constants | `client/src/constants/attendeeRoles.ts` | 0 | 0 | no |
| constants | `client/src/constants/availabilitySettings.ts` | 3 | 1 | no |
| constants | `client/src/constants/availabilityStepConstants.ts` | 2 | 0 | no |
| constants | `client/src/constants/blockShapeTypes.ts` | 1 | 1 | no |
| constants | `client/src/constants/bookingMode.ts` | 1 | 1 | no |
| constants | `client/src/constants/businessControlsOptions.ts` | 8 | 1 | no |
| constants | `client/src/constants/businessRulesConstants.ts` | 6 | 0 | no |
| constants | `client/src/constants/component.ts` | 3 | 0 | no |
| constants | `client/src/constants/constraintTypes.ts` | 0 | 0 | no |
| constants | `client/src/constants/entities.ts` | 9 | 2 | no |
| constants | `client/src/constants/entityFieldConstants.ts` | 5 | 0 | no |
| constants | `client/src/constants/entitySchemaDefaults.ts` | 1 | 0 | no |
| constants | `client/src/constants/errorMessages.ts` | 6 | 0 | no |
| constants | `client/src/constants/fieldMetadata.ts` | 6 | 3 | no |
| constants | `client/src/constants/mapsConstants.ts` | 2 | 1 | no |
| constants | `client/src/constants/moveableScheduling.ts` | 2 | 0 | no |
| constants | `client/src/constants/primitives.ts` | 0 | 3 | no |
| constants | `client/src/constants/relationships.ts` | 1 | 1 | no |
| constants | `client/src/constants/scheduling.ts` | 3 | 0 | no |
| constants | `client/src/constants/statusButtonLabels.ts` | 1 | 0 | no |
| configs | `client/src/configs/adminConfig.ts` | 0 | 3 | yes |
| configs | `client/src/configs/availabilitySettings/api.ts` | 0 | 0 | yes |
| configs | `client/src/configs/availabilitySettings/businessHours.ts` | 0 | 0 | yes |
| configs | `client/src/configs/availabilitySettings/calendar.ts` | 0 | 0 | yes |
| configs | `client/src/configs/availabilitySettings/constraints.ts` | 0 | 0 | yes |
| configs | `client/src/configs/availabilitySettings/index.ts` | 0 | 0 | no |
| configs | `client/src/configs/availabilitySettings/types.ts` | 1 | 4 | no |
| configs | `client/src/configs/businessControlsTabStrings.ts` | 1 | 0 | no |
| configs | `client/src/configs/calendarSettings/api.ts` | 0 | 0 | yes |
| configs | `client/src/configs/calendarSettings/index.ts` | 0 | 0 | no |
| configs | `client/src/configs/calendarSettings/types.ts` | 1 | 0 | no |
| configs | `client/src/configs/calendarSettings/validation.ts` | 0 | 0 | yes |
| configs | `client/src/configs/contactsValidationStrings.ts` | 1 | 0 | no |
| configs | `client/src/configs/eventPerspectiveLabels.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/annotationInstanceDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/annotationShapeDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/baseEntityDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/blockShapeDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/eventInstanceDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/partInstanceDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/appliedDisplay/partShapeDisplays.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/display/displayFieldTypes.ts` | 0 | 4 | no |
| configs | `client/src/configs/field/display/fullFieldDisplayConfig.ts` | 0 | 0 | yes |
| configs | `client/src/configs/field/display/selectableDisplayConfig.ts` | 0 | 1 | yes |
| configs | `client/src/configs/field/form/appliedForm/annotationInstanceFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/annotationShapeFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/baseEntityFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/blockInstancePrimitiveFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/blockShapePrimitiveFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/eventInstanceFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/eventShapeFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/partInstancePrimitiveFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/field/form/appliedForm/partShapePrimitiveFields.ts` | 1 | 0 | no |
| configs | `client/src/configs/propertyValidationStrings.ts` | 1 | 0 | no |
| configs | `client/src/configs/usStates.ts` | 1 | 1 | no |
| configs | `client/src/configs/wizardSettings/api.ts` | 0 | 0 | yes |
| configs | `client/src/configs/wizardSettings/index.ts` | 0 | 0 | no |
| configs | `client/src/configs/wizardSettings/types.ts` | 0 | 1 | no |
| configs | `client/src/configs/wizardSteps.ts` | 1 | 1 | no |

## Inline Type Exports

### Unreviewed

- `client/src/composables/admin/injectionKeys.ts`: RuleFormDialogContext, InstancesTabContext (imported by 2 files)
- `client/src/composables/admin/tables/useAppointmentsTableModel.ts`: AppointmentsTableLookups (imported by 0 files)
- `client/src/composables/admin/useAdmin.ts`: UseAdminReturn (imported by 0 files)
- `client/src/composables/admin/useAdminMetadataMutations.ts`: UseAdminMetadataMutationsReturn (imported by 0 files)
- `client/src/composables/admin/useAdminPrimitiveMetadataMutations.ts`: UseAdminPrimitiveMetadataMutationsReturn (imported by 0 files)
- `client/src/composables/admin/useAdminRelationshipMetadataMutations.ts`: UseAdminRelationshipMetadataMutationsReturn (imported by 0 files)
- `client/src/composables/admin/useApiDevPanelVisibility.ts`: UseApiDevPanelVisibilityOptions (imported by 0 files)
- `client/src/composables/admin/useBaseCollectionField.ts`: BaseCollectionFieldParentContext, UseBaseCollectionFieldReturn, CollectionFieldResolverContext, CollectionFieldConfig (imported by 0 files)
- `client/src/composables/admin/useBlockInstanceCreate.ts`: UseBlockInstanceCreateOptions (imported by 0 files)
- `client/src/composables/admin/useBlockInstanceList.ts`: UseBlockInstanceListReturn (imported by 0 files)
- `client/src/composables/admin/useBooleanInputClick.ts`: UseBooleanInputClickParams (imported by 0 files)
- `client/src/composables/admin/useBusinessHoursFormState.ts`: UseBusinessHoursFormStateReturn (imported by 1 files)
- `client/src/composables/admin/useBusinessRuleForm.ts`: UseBusinessRuleFormReturn (imported by 0 files)
- `client/src/composables/admin/useBusinessRulesTab.ts`: UseBusinessRulesTabReturn (imported by 0 files)
- `client/src/composables/admin/useCalendarHoldFormState.ts`: UseCalendarHoldFormStateReturn (imported by 1 files)
- `client/src/composables/admin/useComponentDistributionConfirm.ts`: UseComponentDistributionConfirmOptions (imported by 0 files)
- `client/src/composables/admin/useConfirmationAndHoldsPanel.ts`: ConfirmationAndHoldsPanelEmit, ConfirmationAndHoldsPanelProps, UseConfirmationAndHoldsPanelReturn (imported by 0 files)
- `client/src/composables/admin/useEntityCardSubPanels.ts`: SubPanelFields, UseEntityCardSubPanelsOptions, UseEntityCardSubPanelsReturn (imported by 0 files)
- `client/src/composables/admin/useEntityMetadata.ts`: UseEntityMetadataReturn (imported by 0 files)
- `client/src/composables/admin/useEventInstancesSection.ts`: UseEventInstancesSectionReturn (imported by 0 files)
- `client/src/composables/admin/useFeePreview.ts`: UseFeePreviewOptions, UseFeePreviewReturn (imported by 0 files)
- `client/src/composables/admin/useFieldRendererErrorWatch.ts`: UseFieldRendererErrorWatchParams (imported by 0 files)
- `client/src/composables/admin/useFormFieldConfigs.ts`: UseFormFieldConfigsReturn (imported by 0 files)
- `client/src/composables/admin/useInstancesTabCreateModal.ts`: UseInstancesTabCreateModalReturn (imported by 0 files)
- `client/src/composables/admin/useMetadataEditModal.ts`: MetadataEditorSaveRef, UseMetadataEditModalOptions (imported by 0 files)
- `client/src/composables/admin/useOverlapConstraintsPanel.ts`: UseOverlapConstraintsPanelReturn (imported by 0 files)
- `client/src/composables/admin/usePartsCollectionField.ts`: UsePartsCollectionFieldReturn (imported by 0 files)
- `client/src/composables/admin/usePrimitiveMetadataSave.ts`: UsePrimitiveMetadataSaveOptions (imported by 0 files)
- `client/src/composables/admin/usePropertyMappingsTab.ts`: PropertyFieldMappingRow, PropertyFeatureMappingRow (imported by 0 files)
- `client/src/composables/admin/useRelationshipCollectionField.ts`: UseRelationshipCollectionFieldReturn (imported by 0 files)
- `client/src/composables/admin/useSelectChipRender.ts`: UseSelectChipRenderReturn (imported by 0 files)
- `client/src/composables/admin/useSelectEnumOptions.ts`: UseSelectEnumOptionsReturn (imported by 0 files)
- `client/src/composables/admin/useShapeForm.ts`: ShapeFormEntityKey, ShapeFormData, BlockShapeFormData, PartShapeFormData (imported by 0 files)
- `client/src/composables/admin/useShapesTabModals.ts`: UseShapesTabModalsReturn (imported by 1 files)
- `client/src/composables/admin/useWizardSettings.ts`: UseWizardSettingsOptions, WizardSubStepLabels, UseWizardSettingsReturn (imported by 0 files)
- `client/src/composables/beta/useFeedbackSubmit.ts`: UseFeedbackSubmitOptions, UseFeedbackSubmitReturn (imported by 0 files)
- `client/src/composables/booking/bookingDevPanelKeys.ts`: InstancesPanelContext, ContactsFormContext (imported by 0 files)
- `client/src/composables/booking/bookingKeys.ts`:  (imported by 0 files)
- `client/src/composables/booking/bookingWizardStepKeys.ts`:  (imported by 0 files)
- `client/src/composables/booking/injectionKeys.ts`: AvailabilitySubStepOrchestratorState, InstancesPanelContext, ContactsFormContext, AvailabilitySubStepContext (imported by 2 files)
- `client/src/composables/booking/useAppointmentLoader.ts`: UseAppointmentLoaderReturn (imported by 0 files)
- `client/src/composables/booking/useAvailabilityConfirmationState.ts`: AvailabilityConfirmationState, UseAvailabilityConfirmationStateReturn (imported by 1 files)
- `client/src/composables/booking/useAvailabilityStepAccordion.ts`: UseAvailabilityStepAccordionParams, UseAvailabilityStepAccordionReturn (imported by 0 files)
- `client/src/composables/booking/useAvailabilityStepFeePreview.ts`: UseAvailabilityStepFeePreviewParams, UseAvailabilityStepFeePreviewReturn (imported by 0 files)
- `client/src/composables/booking/useAvailabilityStepSlotOverlay.ts`: UseAvailabilityStepSlotOverlayParams, UseAvailabilityStepSlotOverlayReturn (imported by 0 files)
- `client/src/composables/booking/useAvailabilityStepUI.ts`: UseAvailabilityStepUIParams, UseAvailabilityStepUIReturn (imported by 0 files)
- `client/src/composables/booking/useAvailabilitySubSteps.ts`: AvailabilitySubStepDef, UseAvailabilitySubStepsParams, UseAvailabilitySubStepsReturn (imported by 0 files)
- `client/src/composables/booking/useBookingWizardSetup.ts`: UseBookingWizardSetupReturn (imported by 0 files)
- `client/src/composables/booking/useCancelAppointment.ts`: UseCancelAppointmentReturn (imported by 0 files)
- `client/src/composables/booking/useDelayedModalVisibility.ts`: UseDelayedModalVisibilityParams, UseDelayedModalVisibilityReturn (imported by 0 files)
- `client/src/composables/booking/useListForAdminEntry.ts`: UseListForAdminEntryReturn (imported by 0 files)
- `client/src/composables/booking/useMoveableAvailabilityData.ts`: UseMoveableAvailabilityDataParams, UseMoveableAvailabilityDataReturn (imported by 0 files)
- `client/src/composables/booking/usePropertyTypeSelectWidth.ts`: PropertyTypeLike, UsePropertyTypeSelectWidthParams, UsePropertyTypeSelectWidthReturn (imported by 0 files)
- `client/src/composables/booking/useSlotGridDisplay.ts`: UseSlotGridDisplayOptions (imported by 0 files)
- `client/src/composables/booking/useWizardNumberUpdate.ts`: UseWizardNumberUpdateReturn (imported by 0 files)
- `client/src/composables/entityCrud/useEntityCrud.ts`: UseEntityCrudReturn (imported by 0 files)
- `client/src/composables/fieldContext/useFieldContextEntityDerived.ts`: UseFieldContextEntityDerivedParams, UseFieldContextEntityDerivedReturn (imported by 0 files)
- `client/src/composables/layout/useNavSearch.ts`: SearchResultsGroup (imported by 0 files)
- `client/src/composables/layout/useNotificationActions.ts`: NotificationItem (imported by 0 files)
- `client/src/composables/useAdminConfig.ts`: UseAdminConfigReturn (imported by 0 files)
- `client/src/composables/useAsyncOperation.ts`: WithAsyncOperationState, WithAsyncOperationOptions (imported by 0 files)
- `client/src/composables/useAvailability.ts`: UseAvailabilityReturn (imported by 0 files)
- `client/src/composables/useBooking.ts`: UseBookingReturn (imported by 0 files)
- `client/src/composables/useComponentEntity.ts`: UseComponentEntityReturn (imported by 0 files)
- `client/src/composables/useGlobal.ts`: UseGlobalReturn (imported by 0 files)
- `client/src/composables/useMapsSessionToken.ts`: UseMapsSessionTokenReturn (imported by 0 files)
- `client/src/composables/useNotification.ts`: UseNotificationReturn (imported by 0 files)
- `client/src/composables/useRelationship.ts`: UseRelationshipCrudReturn (imported by 0 files)
- `client/src/composables/useThemeMode.ts`: UseThemeModeReturn, UseThemeModeOptions (imported by 0 files)
- `client/src/utils/admin/businessRulesApi.ts`: BusinessRulesQueryFilters (imported by 0 files)
- `client/src/utils/admin/calibrationChartTransforms.ts`:  (imported by 0 files)
- `client/src/utils/admin/entityCardTitleKeydown.ts`: EntityCardTitleKeydownReturn (imported by 0 files)
- `client/src/utils/admin/entityDisplay.ts`: EntityDisplayConfig, EntityDisplayReturn (imported by 0 files)
- `client/src/utils/admin/entityList.ts`: EntityListOptions, EntityListReturn (imported by 1 files)
- `client/src/utils/admin/entityListDelete.ts`: EntityListDeleteOptions (imported by 0 files)
- `client/src/utils/admin/inputConfigEditor.ts`: InputConfigFormData, InputConfigEditorOptions, InputConfigEditorReturn (imported by 0 files)
- `client/src/utils/admin/metadataFieldUpdates.ts`: MetadataFieldUpdatesOptions, MetadataFieldUpdatesReturn (imported by 0 files)
- `client/src/utils/admin/selectFilterStrategies.ts`: ValidChildrenKey (imported by 0 files)
- `client/src/utils/admin/selectOptionTransforms.ts`: GroupWithParent (imported by 0 files)
- `client/src/utils/admin/shapesTabDeletion.ts`: UseShapesTabDeletionReturn (imported by 0 files)
- `client/src/utils/beta/betaFeedback.ts`: BetaFeedbackReturn (imported by 0 files)
- `client/src/utils/beta/captureBrowserContext.ts`: BrowserContext (imported by 0 files)
- `client/src/utils/booking/devPanelsFormatters.ts`: DevPanelsFormattersReturn (imported by 0 files)
- `client/src/utils/booking/timeBasisHandler.ts`: TimeBasisHandlerProps, TimeBasisHandlerEmits, TimeBasisHandlerReturn (imported by 0 files)
- `client/src/utils/time/localTime.ts`: LocalTimeReturn (imported by 0 files)

### Queued for Extraction

_None._

## Cleanup Candidates (misplaced + unused)

_None (or unused-code-audit.json not available)._

## Duplicate Type Names

- **UseEntityMetadataReturn**: client/src/types/admin/entityCardMetadata.ts, client/src/composables/admin/useEntityMetadata.ts
- **UsePartInstanceBulkEditOptions**: client/src/types/admin/partInstanceBulkEdit.ts, client/src/composables/admin/usePartInstanceBulkEdit.ts
- **DurationRoundingConfig**: client/src/types/booking/durationRounding.ts, shared/types/availabilityTypes.ts
- **ComponentStrategy**: client/src/types/component.ts, shared/types/componentTypes.ts
- **ComponentConfig**: client/src/types/component.ts, shared/types/componentTypes.ts
- **InstancesPanelContext**: client/src/composables/booking/bookingDevPanelKeys.ts, client/src/composables/booking/injectionKeys.ts
- **ContactsFormContext**: client/src/composables/booking/bookingDevPanelKeys.ts, client/src/composables/booking/injectionKeys.ts
