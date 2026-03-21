# Type/Constant Inventory — Merge Targets (Initial Pass)

Generated from `type-constant-inventory-audit.json`. Use this to plan extractions and consolidations.

---

## 1. Extraction merge targets (by target file)

Each target path is a suggested type file; sources are composables (or utils) to extract types from.

### `(no target)`

- **Source:** `client/src/composables/admin/utils/nestedComputedFactory.ts`
  - Types: CreateNestedComputedOptions
  - Priority: low

- **Source:** `client/src/utils/admin/buildMetadataEntry.ts`
  - Types: BuildMetadataEntryOptions
  - Priority: low

- **Source:** `client/src/utils/admin/selectTypeResolver.ts`
  - Types: SelectConfigLike, OptionsSelectConfigLike
  - Priority: low

- **Source:** `client/src/utils/api/index.ts`
  - Types: 
  - Priority: low

- **Source:** `client/src/utils/autocomplete.ts`
  - Types: AutocompleteValue
  - Priority: low

- **Source:** `client/src/utils/booking/appointmentDataBuilders.ts`
  - Types: AttendeeSpecInput, CreateUserMutate, WizardBlocksForBuilders, AvailabilityPayload, BlockQuantities
  - Priority: low

- **Source:** `client/src/utils/booking/availabilityStepData.ts`
  - Types: SelectedTimeSlot, AvailabilityStepData
  - Priority: high

- **Source:** `client/src/utils/booking/bookingWizardStepValidators.ts`
  - Types: BuildBookingWizardStepValidatorsOptions
  - Priority: low

- **Source:** `client/src/utils/booking/cascadeFilterPipeline.ts`
  - Types: CascadeFilterParamsBase
  - Priority: low

- **Source:** `client/src/utils/booking/constraintColors.ts`
  - Types: 
  - Priority: low

- **Source:** `client/src/utils/booking/durationRounding.ts`
  - Types: RoundingMethod, DurationRoundingConfig
  - Priority: high

- **Source:** `client/src/utils/booking/perspectiveResolver.ts`
  - Types: ResolvedEventShapes
  - Priority: low

- **Source:** `client/src/utils/booking/selectionCardConfig.ts`
  - Types: 
  - Priority: low

- **Source:** `client/src/utils/booking/slotGenerationValidation.ts`
  - Types: SlotGenerationParams, SlotGenerationParamsBase
  - Priority: low

- **Source:** `client/src/utils/booking/timeSlotMatching.ts`
  - Types: LoadedTimeSlot
  - Priority: low

- **Source:** `client/src/utils/booking/wizardValidation.ts`
  - Types: StepValidator, UseWizardValidationReturn
  - Priority: high

- **Source:** `client/src/utils/collections/arrayDiff.ts`
  - Types: ArrayDiffResult
  - Priority: low

- **Source:** `client/src/utils/collections/resolveByIds.ts`
  - Types: ResolveByIdsResult
  - Priority: low

- **Source:** `client/src/utils/colors/complementaryColors.ts`
  - Types: 
  - Priority: low

- **Source:** `client/src/utils/entities/entityTypeMapping.ts`
  - Types: 
  - Priority: low

- **Source:** `client/src/utils/errors/axiosErrorUtils.ts`
  - Types: ExtractedErrorMessage
  - Priority: low

- **Source:** `client/src/utils/forms/fieldComponentDispatcher.ts`
  - Types: FieldComponent
  - Priority: high

- **Source:** `client/src/utils/forms/fieldLocationDispatcher.ts`
  - Types: FieldLocation, FieldLocationContext
  - Priority: low

- **Source:** `client/src/utils/forms/fieldSectionCategorization.ts`
  - Types: StatusButtonField
  - Priority: low

- **Source:** `client/src/utils/forms/getFieldKeys.ts`
  - Types: GetFieldKeysOptions
  - Priority: low

- **Source:** `client/src/utils/forms/layoutFieldCategorization.ts`
  - Types: FieldsByLayout
  - Priority: high

- **Source:** `client/src/utils/forms/selectDomAssociation.ts`
  - Types: SelectDomTarget
  - Priority: high

- **Source:** `client/src/utils/tablerIcons.ts`
  - Types: 
  - Priority: low

- **Source:** `client/src/utils/transformers/appointmentToWizardHelpers.ts`
  - Types: AppointmentVersionsResponse
  - Priority: low

- **Source:** `client/src/utils/transformers/appointmentToWizardTransformer.ts`
  - Types: WizardStateData
  - Priority: high

- **Source:** `client/src/utils/transformers/fetchToBusinessTransformer.ts`
  - Types: BusinessData
  - Priority: high

- **Source:** `client/src/utils/transformers/fetchToGlobalTransformer.ts`
  - Types: GlobalData
  - Priority: high

- **Source:** `client/src/utils/transformers/fieldClassification.ts`
  - Types: DehydrateFieldSets
  - Priority: low

- **Source:** `client/src/utils/transformers/globalToAdminTransformer.ts`
  - Types: AdminObject, AdminObjectMap
  - Priority: high

- **Source:** `client/src/utils/transformers/globalToBookingTransformer.ts`
  - Types: BookingPartInstance, BookingBlockShape, BookingBlockInstance, BookingData
  - Priority: high

- **Source:** `client/src/utils/wizardStateFieldConfig.ts`
  - Types: WizardInstance, WizardStateField, WizardFieldConfig
  - Priority: low

### `client/src/types/addressAutocomplete.ts`

- **Source:** `client/src/composables/useAddressAutocomplete.ts`
  - Types: SelectionResult, UseAddressAutocompleteOptions, UseAddressAutocompleteReturn
  - Priority: low

### `client/src/types/admin/attendeeQuickSelect.ts`

- **Source:** `client/src/composables/admin/useAttendeeQuickSelect.ts`
  - Types: UseAttendeeQuickSelectReturn
  - Priority: low

### `client/src/types/admin/availabilitySettings.ts`

- **Source:** `client/src/composables/admin/useAvailabilitySettings.ts`
  - Types: UseAvailabilitySettingsOptions, UseAdminAvailabilitySettingsReturn
  - Priority: low

### `client/src/types/admin/blockInstanceForm.ts`

- **Source:** `client/src/composables/admin/useBlockInstanceForm.ts`
  - Types: UseBlockInstanceFormOptions, BlockInstanceFormData, UseBlockInstanceFormReturn
  - Priority: low

### `client/src/types/admin/businessControlsFormState.ts`

- **Source:** `client/src/composables/admin/useBusinessControlsFormState.ts`
  - Types: BusinessHoursDay, UseBusinessControlsFormStateParams
  - Priority: low

### `client/src/types/admin/businessRules.ts`

- **Source:** `client/src/composables/admin/useBusinessRules.ts`
  - Types: RuleType, BusinessRuleFormData, BusinessRuleCore
  - Priority: high

### `client/src/types/admin/calendarEntries.ts`

- **Source:** `client/src/composables/admin/useCalendarEntries.ts`
  - Types: UseCalendarEntriesReturn
  - Priority: low

### `client/src/types/admin/calibrationChart.ts`

- **Source:** `client/src/composables/admin/useCalibrationChart.ts`
  - Types: UseCalibrationChartReturn
  - Priority: low

### `client/src/types/admin/capacitySettings.ts`

- **Source:** `client/src/composables/admin/useCapacitySettings.ts`
  - Types: UseCapacitySettingsParams
  - Priority: low

### `client/src/types/admin/conditionalFieldVisibility.ts`

- **Source:** `client/src/composables/admin/useConditionalFieldVisibility.ts`
  - Types: FieldsByLocation, UseConditionalFieldVisibilityOptions, UseConditionalFieldVisibilityReturn
  - Priority: low

### `client/src/types/admin/dialogFormState.ts`

- **Source:** `client/src/composables/admin/useDialogFormState.ts`
  - Types: UseDialogFormStateOptions, UseDialogFormStateReturn
  - Priority: low

### `client/src/types/admin/dragAndDrop.ts`

- **Source:** `client/src/composables/admin/useDragAndDrop.ts`
  - Types: DragEndHandler, UseDragAndDropParams, UseDragAndDropReturn
  - Priority: low

### `client/src/types/admin/entityCardActions.ts`

- **Source:** `client/src/composables/admin/useEntityCardActions.ts`
  - Types: UseEntityCardActionsOptions, UseEntityCardActionsReturn
  - Priority: low

### `client/src/types/admin/entityCardComputed.ts`

- **Source:** `client/src/composables/admin/useEntityCardComputed.ts`
  - Types: UseEntityCardComputedParams, UseEntityCardComputedReturn
  - Priority: low

### `client/src/types/admin/entityCardExpansion.ts`

- **Source:** `client/src/composables/admin/useEntityCardExpansion.ts`
  - Types: UseEntityCardExpansionOptions, UseEntityCardExpansionReturn
  - Priority: low

### `client/src/types/admin/entityCardFieldConfiguration.ts`

- **Source:** `client/src/composables/admin/useEntityCardFieldConfiguration.ts`
  - Types: UseEntityCardFieldConfigurationParams, UseEntityCardFieldConfigurationReturn
  - Priority: high

### `client/src/types/admin/entityCardFieldContextAndVisibility.ts`

- **Source:** `client/src/composables/admin/useEntityCardFieldContextAndVisibility.ts`
  - Types: UseEntityCardFieldContextAndVisibilityParams
  - Priority: low

### `client/src/types/admin/entityCardForm.ts`

- **Source:** `client/src/composables/admin/useEntityCardForm.ts`
  - Types: UseEntityCardFormOptions, UseEntityCardFormReturn
  - Priority: low

### `client/src/types/admin/entityCardFormSetup.ts`

- **Source:** `client/src/composables/admin/useEntityCardFormSetup.ts`
  - Types: UseEntityCardFormSetupParams, UseEntityCardFormSetupReturn
  - Priority: low

### `client/src/types/admin/entityCardLayout.ts`

- **Source:** `client/src/composables/admin/useEntityCardLayout.ts`
  - Types: UseEntityCardLayoutOptions, UseEntityCardLayoutReturn
  - Priority: high

### `client/src/types/admin/entityCardMetadata.ts`

- **Source:** `client/src/composables/admin/useEntityCardMetadata.ts`
  - Types: UseEntityCardMetadataParams, UseEntityCardMetadataReturn
  - Priority: low

### `client/src/types/admin/entityCardSaveAndActions.ts`

- **Source:** `client/src/composables/admin/useEntityCardSaveAndActions.ts`
  - Types: UseEntityCardSaveAndActionsParams, UseEntityCardSaveAndActionsReturn
  - Priority: low

### `client/src/types/admin/entityCardSaveHandlers.ts`

- **Source:** `client/src/composables/admin/useEntityCardSaveHandlers.ts`
  - Types: UseEntityCardSaveHandlersParams
  - Priority: low

### `client/src/types/admin/entityCardStoreSync.ts`

- **Source:** `client/src/composables/admin/useEntityCardStoreSync.ts`
  - Types: UseEntityCardStoreSyncOptions, UseEntityCardStoreSyncReturn
  - Priority: low

### `client/src/types/admin/entityDragHandlers.ts`

- **Source:** `client/src/composables/admin/useEntityDragHandlers.ts`
  - Types: PatchOrderIndex, UseEntityDragHandlersParams, UseEntityDragHandlersReturn
  - Priority: high

### `client/src/types/admin/entityFiltering.ts`

- **Source:** `client/src/composables/admin/useEntityFiltering.ts`
  - Types: UseEntityFilteringReturn
  - Priority: low

### `client/src/types/admin/entityGrouping.ts`

- **Source:** `client/src/composables/admin/useEntityGrouping.ts`
  - Types: UseEntityGroupingParams, UseEntityGroupingReturn
  - Priority: low

### `client/src/types/admin/entityStatus.ts`

- **Source:** `client/src/composables/admin/useEntityStatus.ts`
  - Types: UseEntityStatusOptions, UseEntityStatusReturn
  - Priority: low

### `client/src/types/admin/entityTabState.ts`

- **Source:** `client/src/composables/admin/useEntityTabState.ts`
  - Types: UseEntityTabStateReturn, UseEntityTabStateOptions
  - Priority: low

### `client/src/types/admin/expansionState.ts`

- **Source:** `client/src/composables/admin/useExpansionState.ts`
  - Types: UseExpansionStateReturn
  - Priority: low

### `client/src/types/admin/fieldComponent.ts`

- **Source:** `client/src/composables/admin/useFieldComponent.ts`
  - Types: UseFieldComponentOptions, UseFieldComponentReturn
  - Priority: low

### `client/src/types/admin/fieldContextManager.ts`

- **Source:** `client/src/composables/admin/useFieldContextManager.ts`
  - Types: UseFieldContextManagerOptions, UseFieldContextManagerReturn
  - Priority: low

### `client/src/types/admin/fieldInputHandlers.ts`

- **Source:** `client/src/composables/admin/useFieldInputHandlers.ts`
  - Types: UseFieldInputHandlersParams
  - Priority: low

### `client/src/types/admin/fieldInputSetup.ts`

- **Source:** `client/src/composables/admin/useFieldInputSetup.ts`
  - Types: UseFieldInputSetupOptions
  - Priority: low

### `client/src/types/admin/fieldLocation.ts`

- **Source:** `client/src/composables/admin/useFieldLocation.ts`
  - Types: UseFieldLocationOptions, UseFieldLocationReturn
  - Priority: low

### `client/src/types/admin/fieldMetadataUpdate.ts`

- **Source:** `client/src/composables/admin/useFieldMetadataUpdate.ts`
  - Types: FieldMetadataConfig
  - Priority: low

### `client/src/types/admin/fieldRendererComponent.ts`

- **Source:** `client/src/composables/admin/useFieldRendererComponent.ts`
  - Types: UseFieldRendererComponentOptions, UseFieldRendererComponentReturn
  - Priority: low

### `client/src/types/admin/formElementPatching.ts`

- **Source:** `client/src/composables/admin/useFormElementPatching.ts`
  - Types: UseFormElementPatchingOptions, FormElementPatchingOptionsBase, UseFormElementPatchingReturn
  - Priority: low

### `client/src/types/admin/iconPickerState.ts`

- **Source:** `client/src/composables/admin/useIconPickerState.ts`
  - Types: UseIconPickerStateOptions, UseIconPickerStateReturn
  - Priority: low

### `client/src/types/admin/instanceBulkEdit.ts`

- **Source:** `client/src/composables/admin/useInstanceBulkEdit.ts`
  - Types: UseInstanceBulkEditOptions, UseInstanceBulkEditReturn
  - Priority: low

### `client/src/types/admin/instanceComposableOptions.ts`

- **Source:** `client/src/composables/admin/useInstanceComposableOptions.ts`
  - Types: UseInstanceBlockInstancesByShapeOptions
  - Priority: high

### `client/src/types/admin/instanceDragAndDrop.ts`

- **Source:** `client/src/composables/admin/useInstanceDragAndDrop.ts`
  - Types: UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn
  - Priority: low

### `client/src/types/admin/instanceFiltering.ts`

- **Source:** `client/src/composables/admin/useInstanceFiltering.ts`
  - Types: UseInstanceFilteringOptions, UseInstanceFilteringReturn
  - Priority: low

### `client/src/types/admin/instanceGrouping.ts`

- **Source:** `client/src/composables/admin/useInstanceGrouping.ts`
  - Types: UseInstanceGroupingOptions, UseInstanceGroupingReturn
  - Priority: low

### `client/src/types/admin/instanceShape.ts`

- **Source:** `client/src/composables/admin/useInstanceShape.ts`
  - Types: UseInstanceShapeOptions, UseInstanceShapeReturn
  - Priority: low

### `client/src/types/admin/instancesTabEventInstance.ts`

- **Source:** `client/src/composables/admin/useInstancesTabEventInstance.ts`
  - Types: NewEventInstanceData, UseInstancesTabEventInstanceParams
  - Priority: low

### `client/src/types/admin/instancesTabEventInstanceDrag.ts`

- **Source:** `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts`
  - Types: UseInstancesTabEventInstanceDragParams
  - Priority: low

### `client/src/types/admin/instanceTabHandlers.ts`

- **Source:** `client/src/composables/admin/useInstanceTabHandlers.ts`
  - Types: UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn
  - Priority: low

### `client/src/types/admin/metadataCache.ts`

- **Source:** `client/src/composables/admin/useMetadataCache.ts`
  - Types: MetadataCache
  - Priority: low

### `client/src/types/admin/metadataFieldDrag.ts`

- **Source:** `client/src/composables/admin/useMetadataFieldDrag.ts`
  - Types: UseMetadataFieldDragParams
  - Priority: low

### `client/src/types/admin/metadataFieldOrdering.ts`

- **Source:** `client/src/composables/admin/useMetadataFieldOrdering.ts`
  - Types: UseMetadataFieldOrderingOptions, UseMetadataFieldOrderingReturn
  - Priority: low

### `client/src/types/admin/metadataModalHandlers.ts`

- **Source:** `client/src/composables/admin/useMetadataModalHandlers.ts`
  - Types: UseMetadataModalHandlersReturn
  - Priority: low

### `client/src/types/admin/partInstanceBulkEdit.ts`

- **Source:** `client/src/composables/admin/usePartInstanceBulkEdit.ts`
  - Types: PartInstanceBulkEditData, UsePartInstanceBulkEditOptions, UsePartInstanceBulkEditReturn
  - Priority: low

### `client/src/types/admin/partInstanceCollection.ts`

- **Source:** `client/src/composables/admin/usePartInstanceCollection.ts`
  - Types: PartInstanceCollectionModel
  - Priority: low

### `client/src/types/admin/partInstanceExpansion.ts`

- **Source:** `client/src/composables/admin/usePartInstanceExpansion.ts`
  - Types: UsePartInstanceExpansionOptions, UsePartInstanceExpansionReturn
  - Priority: low

### `client/src/types/admin/partInstanceForm.ts`

- **Source:** `client/src/composables/admin/usePartInstanceForm.ts`
  - Types: UsePartInstanceFormOptions, PartInstanceFormData, UsePartInstanceFormReturn
  - Priority: low

### `client/src/types/admin/partsTotals.ts`

- **Source:** `client/src/composables/admin/usePartsTotals.ts`
  - Types: UsePartsTotalsReturn
  - Priority: low

### `client/src/types/admin/relationshipCollection.ts`

- **Source:** `client/src/composables/admin/useRelationshipCollection.ts`
  - Types: NameGenerator, UseRelationshipCollectionOptions
  - Priority: low

### `client/src/types/admin/relationshipCollectionData.ts`

- **Source:** `client/src/composables/admin/useRelationshipCollectionData.ts`
  - Types: UseRelationshipCollectionDataReturn, UseRelationshipCollectionDataOptions, UseRelationshipCollectionDataReturnBase
  - Priority: low

### `client/src/types/admin/selectConfig.ts`

- **Source:** `client/src/composables/admin/useSelectConfig.ts`
  - Types: UseSelectConfigOptions, UseSelectConfigReturn
  - Priority: low

### `client/src/types/admin/selectDomTargets.ts`

- **Source:** `client/src/composables/admin/useSelectDomTargets.ts`
  - Types: UseSelectDomTargetsOptions, UseSelectDomTargetsReturn
  - Priority: low

### `client/src/types/admin/selectFieldValue.ts`

- **Source:** `client/src/composables/admin/useSelectFieldValue.ts`
  - Types: UseSelectFieldValueOptions, UseSelectFieldValueReturn
  - Priority: low

### `client/src/types/admin/selectFiltering.ts`

- **Source:** `client/src/composables/admin/useSelectFiltering.ts`
  - Types: UseSelectFilteringOptions, UseSelectFilteringReturn
  - Priority: high

### `client/src/types/admin/selectFormAssociation.ts`

- **Source:** `client/src/composables/admin/useSelectFormAssociation.ts`
  - Types: UseSelectFormAssociationOptions
  - Priority: low

### `client/src/types/admin/selectHandlers.ts`

- **Source:** `client/src/composables/admin/useSelectHandlers.ts`
  - Types: UseSelectHandlersOptions, UseSelectHandlersReturn
  - Priority: low

### `client/src/types/admin/selectInputsAsync.ts`

- **Source:** `client/src/composables/admin/useSelectInputsAsync.ts`
  - Types: UseSelectInputsAsyncOptions, UseSelectInputsAsyncReturn
  - Priority: low

### `client/src/types/admin/selectLabelResolution.ts`

- **Source:** `client/src/composables/admin/useSelectLabelResolution.ts`
  - Types: UseSelectLabelResolutionOptions, UseSelectLabelResolutionReturn
  - Priority: low

### `client/src/types/admin/shapeCreation.ts`

- **Source:** `client/src/composables/admin/useShapeCreation.ts`
  - Types: UseShapeCreationReturn, UseShapeCreationOptions
  - Priority: low

### `client/src/types/admin/shapeDisplayNames.ts`

- **Source:** `client/src/composables/admin/useShapeDisplayNames.ts`
  - Types: UseShapeDisplayNamesReturn
  - Priority: low

### `client/src/types/admin/shapeEditModal.ts`

- **Source:** `client/src/composables/admin/useShapeEditModal.ts`
  - Types: UseShapeEditModalOptions, UseShapeEditModalReturn
  - Priority: low

### `client/src/types/admin/shapeSaveHandlers.ts`

- **Source:** `client/src/composables/admin/useShapeSaveHandlers.ts`
  - Types: UseShapeSaveHandlersOptions, UseShapeSaveHandlersReturn
  - Priority: low

### `client/src/types/admin/shapesTabCreation.ts`

- **Source:** `client/src/composables/admin/useShapesTabCreation.ts`
  - Types: UseShapesTabCreationParams
  - Priority: low

### `client/src/types/admin/shapesTabDeletion.ts`

- **Source:** `client/src/composables/admin/useShapesTabDeletion.ts`
  - Types: UseShapesTabDeletionParams
  - Priority: low

### `client/src/types/admin/statusButtonFields.ts`

- **Source:** `client/src/composables/admin/useStatusButtonFields.ts`
  - Types: UseStatusButtonFieldsOptions, UseStatusButtonFieldsReturn
  - Priority: low

### `client/src/types/admin/statusButtonHandlers.ts`

- **Source:** `client/src/composables/admin/useStatusButtonHandlers.ts`
  - Types: UseStatusButtonHandlersOptions, UseStatusButtonHandlersReturn
  - Priority: low

### `client/src/types/admin/statusButtonToggle.ts`

- **Source:** `client/src/composables/admin/useStatusButtonToggle.ts`
  - Types: UseStatusButtonToggleOptions, UseStatusButtonToggleReturn
  - Priority: low

### `client/src/types/admin/tables/appointmentsTableHandlers.ts`

- **Source:** `client/src/composables/admin/tables/useAppointmentsTableHandlers.ts`
  - Types: UseAppointmentsTableHandlersParams
  - Priority: low

### `client/src/types/admin/tables/crudDataTableModel.ts`

- **Source:** `client/src/composables/admin/tables/useCrudDataTableModel.ts`
  - Types: CrudDataTableModelOptions, CrudDataTableModel
  - Priority: low

### `client/src/types/admin/tables/tableModelHelpers.ts`

- **Source:** `client/src/composables/admin/tables/useTableModelHelpers.ts`
  - Types: TableModelFormatHelpers
  - Priority: low

### `client/src/types/admin/tabNavigation.ts`

- **Source:** `client/src/composables/admin/useTabNavigation.ts`
  - Types: UseTabNavigationOptions, UseTabNavigationReturn
  - Priority: low

### `client/src/types/booking/apiCallStatus.ts`

- **Source:** `client/src/composables/booking/useApiCallStatus.ts`
  - Types: ApiCallStatus, ApiCallStatusState
  - Priority: low

### `client/src/types/booking/appointmentDataCollection.ts`

- **Source:** `client/src/composables/booking/useAppointmentDataCollection.ts`
  - Types: UseAppointmentDataCollectionParams, UseAppointmentDataCollectionReturn
  - Priority: low

### `client/src/types/booking/appointmentDropdown.ts`

- **Source:** `client/src/composables/booking/useAppointmentDropdown.ts`
  - Types: UseAppointmentDropdownOptions, UseAppointmentDropdownReturn
  - Priority: low

### `client/src/types/booking/appointmentDuration.ts`

- **Source:** `client/src/composables/booking/useAppointmentDuration.ts`
  - Types: UseAppointmentDurationParams, UseAppointmentDurationReturn
  - Priority: low

### `client/src/types/booking/appointmentShape.ts`

- **Source:** `client/src/composables/booking/useAppointmentShape.ts`
  - Types: UseAppointmentShapeParams, UseAppointmentShapeReturn
  - Priority: low

### `client/src/types/booking/appointmentSlots.ts`

- **Source:** `client/src/composables/booking/useAppointmentSlots.ts`
  - Types: UseAppointmentSlotsParams, UseAppointmentSlotsReturn
  - Priority: low

### `client/src/types/booking/appointmentTimes.ts`

- **Source:** `client/src/composables/booking/useAppointmentTimes.ts`
  - Types: UseAppointmentTimesParams, UseAppointmentTimesReturn
  - Priority: low

### `client/src/types/booking/availabilityDefaults.ts`

- **Source:** `client/src/composables/booking/useAvailabilityDefaults.ts`
  - Types: UseAvailabilityDefaultsOptions, UseAvailabilityDefaultsReturn
  - Priority: low

### `client/src/types/booking/availabilityDevPanel.ts`

- **Source:** `client/src/composables/booking/useAvailabilityDevPanel.ts`
  - Types: UseAvailabilityDevPanelParams
  - Priority: low

### `client/src/types/booking/availabilityEmptyState.ts`

- **Source:** `client/src/composables/booking/useAvailabilityEmptyState.ts`
  - Types: UseAvailabilityEmptyStateParams, UseAvailabilityEmptyStateReturn
  - Priority: low

### `client/src/types/booking/availabilityLogic.ts`

- **Source:** `client/src/composables/booking/useAvailabilityLogic.ts`
  - Types: TimeSlotsPerDay
  - Priority: low

### `client/src/types/booking/availabilityOrchestrator.ts`

- **Source:** `client/src/composables/booking/useAvailabilityOrchestrator.ts`
  - Types: UseAvailabilityOrchestratorParams
  - Priority: low

### `client/src/types/booking/availabilitySettings.ts`

- **Source:** `client/src/composables/booking/useAvailabilitySettings.ts`
  - Types: UseBookingAvailabilitySettingsReturn
  - Priority: low

### `client/src/types/booking/availabilitySlotColor.ts`

- **Source:** `client/src/composables/booking/useAvailabilitySlotColor.ts`
  - Types: UseAvailabilitySlotColorParams, UseAvailabilitySlotColorReturn
  - Priority: low

### `client/src/types/booking/availabilityStepData.ts`

- **Source:** `client/src/composables/booking/useAvailabilityStepData.ts`
  - Types: UseAvailabilityStepDataReturn
  - Priority: low

### `client/src/types/booking/availabilityStepHandlers.ts`

- **Source:** `client/src/composables/booking/useAvailabilityStepHandlers.ts`
  - Types: UseAvailabilityStepHandlersParams, UseAvailabilityStepHandlersReturn
  - Priority: low

### `client/src/types/booking/availabilityUI.ts`

- **Source:** `client/src/composables/booking/useAvailabilityUI.ts`
  - Types: UseAvailabilityUIParams, UseAvailabilityUIReturn
  - Priority: low

### `client/src/types/booking/availabilityValidation.ts`

- **Source:** `client/src/composables/booking/useAvailabilityValidation.ts`
  - Types: UseAvailabilityValidationParams, UseAvailabilityValidationReturn
  - Priority: low

### `client/src/types/booking/blockInstanceSelection.ts`

- **Source:** `client/src/composables/booking/useBlockInstanceSelection.ts`
  - Types: SelectionMode
  - Priority: low

### `client/src/types/booking/bookingWizardStepValidators.ts`

- **Source:** `client/src/composables/booking/useBookingWizardStepValidators.ts`
  - Types: BookingWizardStepValidators, UseBookingWizardStepValidatorsOptions
  - Priority: low

### `client/src/types/booking/cascadeInstances.ts`

- **Source:** `client/src/composables/booking/useCascadeInstances.ts`
  - Types: UseCascadeInstancesOptions, UseCascadeInstancesReturn
  - Priority: low

### `client/src/types/booking/computedAvailability.ts`

- **Source:** `client/src/composables/booking/useComputedAvailability.ts`
  - Types: UseComputedAvailabilityParams, UseComputedAvailabilityReturn
  - Priority: high

### `client/src/types/booking/confirmationStepData.ts`

- **Source:** `client/src/composables/booking/useConfirmationStepData.ts`
  - Types: UseConfirmationStepDataParams, UseConfirmationStepDataReturn
  - Priority: low

### `client/src/types/booking/contactsStepData.ts`

- **Source:** `client/src/composables/booking/useContactsStepData.ts`
  - Types: ContactInfo, UseContactsStepDataOptions, UseContactsStepDataReturn
  - Priority: high

### `client/src/types/booking/contactsValidation.ts`

- **Source:** `client/src/composables/booking/useContactsValidation.ts`
  - Types: UseContactsValidationReturn, UseContactsValidationParams
  - Priority: low

### `client/src/types/booking/dependentInstances.ts`

- **Source:** `client/src/composables/booking/useDependentInstances.ts`
  - Types: UseDependentInstancesOptions, UseDependentInstancesReturn
  - Priority: low

### `client/src/types/booking/dev/panelPosition.ts`

- **Source:** `client/src/composables/booking/dev/usePanelPosition.ts`
  - Types: UsePanelPositionOptions, UsePanelPositionReturn
  - Priority: low

### `client/src/types/booking/devPanelsComputed.ts`

- **Source:** `client/src/composables/booking/useDevPanelsComputed.ts`
  - Types: DevPanelsComputedData, UseDevPanelsComputedOptions, UseDevPanelsComputedReturn, ServiceSummary
  - Priority: high

### `client/src/types/booking/durationRounding.ts`

- **Source:** `client/src/composables/booking/useDurationRounding.ts`
  - Types: UseDurationRoundingReturn
  - Priority: low

### `client/src/types/booking/dynamicGridConfig.ts`

- **Source:** `client/src/composables/booking/useDynamicGridConfig.ts`
  - Types: UseDynamicGridConfigOptions, UseDynamicGridConfigReturn
  - Priority: low

### `client/src/types/booking/elementDimensions.ts`

- **Source:** `client/src/composables/booking/useElementDimensions.ts`
  - Types: UseElementDimensionsOptions, UseElementDimensionsReturn
  - Priority: low

### `client/src/types/booking/instanceComponents.ts`

- **Source:** `client/src/composables/booking/useInstanceComponents.ts`
  - Types: UseInstanceComponentsOptions, UseInstanceComponentsReturn
  - Priority: low

### `client/src/types/booking/instanceComponentsList.ts`

- **Source:** `client/src/composables/booking/useInstanceComponentsList.ts`
  - Types: UseInstanceComponentsListOptions
  - Priority: low

### `client/src/types/booking/instanceDescriptions.ts`

- **Source:** `client/src/composables/booking/useInstanceDescriptions.ts`
  - Types: UseInstanceDescriptionsOptions, UseInstanceDescriptionsReturn
  - Priority: low

### `client/src/types/booking/instanceDisplay.ts`

- **Source:** `client/src/composables/booking/useInstanceDisplay.ts`
  - Types: UseInstanceDisplayOptions, UseInstanceDisplayReturn
  - Priority: high

### `client/src/types/booking/instanceSelectionConfig.ts`

- **Source:** `client/src/composables/booking/useInstanceSelectionConfig.ts`
  - Types: UseInstanceSelectionConfigOptions, UseInstanceSelectionConfigReturn
  - Priority: low

### `client/src/types/booking/instanceSelectionState.ts`

- **Source:** `client/src/composables/booking/useInstanceSelectionState.ts`
  - Types: GenericWizardInstance, UseInstanceSelectionStateParams, UseInstanceSelectionStateReturn
  - Priority: low

### `client/src/types/booking/mockCalendarRefresh.ts`

- **Source:** `client/src/composables/booking/useMockCalendarRefresh.ts`
  - Types: UseMockCalendarRefreshReturn
  - Priority: low

### `client/src/types/booking/moveablePartsScheduling.ts`

- **Source:** `client/src/composables/booking/useMoveablePartsScheduling.ts`
  - Types: ComputeMoveableSlotsParams
  - Priority: low

### `client/src/types/booking/optionTypeBlockSelection.ts`

- **Source:** `client/src/composables/booking/useOptionTypeBlockSelection.ts`
  - Types: UseOptionTypeBlockSelectionParams, UseOptionTypeBlockSelectionReturn
  - Priority: low

### `client/src/types/booking/perspectiveMapping.ts`

- **Source:** `client/src/composables/booking/usePerspectiveMapping.ts`
  - Types: UsePerspectiveMappingParams, UsePerspectiveMappingReturn
  - Priority: low

### `client/src/types/booking/pricingCascadeInstances.ts`

- **Source:** `client/src/composables/booking/usePricingCascadeInstances.ts`
  - Types: UsePricingCascadeInstancesOptions, UsePricingCascadeInstancesReturn
  - Priority: low

### `client/src/types/booking/propertyDetailsLogic.ts`

- **Source:** `client/src/composables/booking/usePropertyDetailsLogic.ts`
  - Types: PropertyFormStateCore, UsePropertyDetailsLogicReturn
  - Priority: high

### `client/src/types/booking/propertyFormState.ts`

- **Source:** `client/src/composables/booking/usePropertyFormState.ts`
  - Types: UsePropertyFormStateReturn
  - Priority: low

### `client/src/types/booking/propertyFormWatchers.ts`

- **Source:** `client/src/composables/booking/usePropertyFormWatchers.ts`
  - Types: UsePropertyFormWatchersReturn
  - Priority: low

### `client/src/types/booking/propertyTypeBlockConfig.ts`

- **Source:** `client/src/composables/booking/usePropertyTypeBlockConfig.ts`
  - Types: UsePropertyTypeBlockConfigParams, UsePropertyTypeBlockConfigReturn
  - Priority: high

### `client/src/types/booking/propertyTypeBlockSelection.ts`

- **Source:** `client/src/composables/booking/usePropertyTypeBlockSelection.ts`
  - Types: UsePropertyTypeBlockSelectionParams, UsePropertyTypeBlockSelectionReturn
  - Priority: low

### `client/src/types/booking/propertyValidation.ts`

- **Source:** `client/src/composables/booking/usePropertyValidation.ts`
  - Types: UsePropertyValidationReturn, PropertyValidationData, UsePropertyValidationParams
  - Priority: high

### `client/src/types/booking/responsiveGrid.ts`

- **Source:** `client/src/composables/booking/useResponsiveGrid.ts`
  - Types: UseResponsiveGridOptions, UseResponsiveGridReturn
  - Priority: low

### `client/src/types/booking/selectionCard/selectionCard.ts`

- **Source:** `client/src/composables/booking/selectionCard/useSelectionCard.ts`
  - Types: UseSelectionCardOptions, UseSelectionCardReturn, UseSelectionCardGroupOptions, UseSelectionCardGroupReturn
  - Priority: low

### `client/src/types/booking/selectionCard/selectionCardComponent.ts`

- **Source:** `client/src/composables/booking/selectionCard/useSelectionCardComponent.ts`
  - Types: UseSelectionCardComponentReturn
  - Priority: low

### `client/src/types/booking/selectionCard/selectionCardConfig.ts`

- **Source:** `client/src/composables/booking/selectionCard/useSelectionCardConfig.ts`
  - Types: UseSelectionCardConfigParams, UseSelectionCardConfigReturn
  - Priority: low

### `client/src/types/booking/selectionCard/selectionCardGroupState.ts`

- **Source:** `client/src/composables/booking/selectionCard/useSelectionCardGroupState.ts`
  - Types: UseSelectionCardGroupStateParams, UseSelectionCardGroupStateReturn
  - Priority: low

### `client/src/types/booking/selectionCard/selectionCardHandlers.ts`

- **Source:** `client/src/composables/booking/selectionCard/useSelectionCardHandlers.ts`
  - Types: UseSelectionCardHandlersParams, UseSelectionCardHandlersReturn
  - Priority: low

### `client/src/types/booking/selectionCard/selectionCardState.ts`

- **Source:** `client/src/composables/booking/selectionCard/useSelectionCardState.ts`
  - Types: UseSelectionCardStateParams, UseSelectionCardStateReturn
  - Priority: low

### `client/src/types/booking/selectionCard/selectionCardStyles.ts`

- **Source:** `client/src/composables/booking/selectionCard/useSelectionCardStyles.ts`
  - Types: UseSelectionCardStylesParams, UseSelectionCardStylesParamsBase, UseSelectionCardStylesReturn
  - Priority: high

### `client/src/types/booking/selectionCardGroupConfig.ts`

- **Source:** `client/src/composables/booking/useSelectionCardGroupConfig.ts`
  - Types: UseSelectionCardGroupConfigParams, UseSelectionCardGroupConfigReturn
  - Priority: low

### `client/src/types/booking/stepValidation.ts`

- **Source:** `client/src/composables/booking/useStepValidation.ts`
  - Types: CustomValidator, UseStepValidationParams, UseStepValidationReturn
  - Priority: low

### `client/src/types/booking/timeSlotCalculations.ts`

- **Source:** `client/src/composables/booking/useTimeSlotCalculations.ts`
  - Types: DifferentialTimeBlocks
  - Priority: low

### `client/src/types/booking/wizardAppointmentManagement.ts`

- **Source:** `client/src/composables/booking/useWizardAppointmentManagement.ts`
  - Types: UseWizardAppointmentManagementReturn
  - Priority: low

### `client/src/types/booking/wizardDateAvailability.ts`

- **Source:** `client/src/composables/booking/useWizardDateAvailability.ts`
  - Types: UseWizardDateAvailabilityParams
  - Priority: low

### `client/src/types/booking/wizardDevMode.ts`

- **Source:** `client/src/composables/booking/useWizardDevMode.ts`
  - Types: UseWizardDevModeReturn
  - Priority: low

### `client/src/types/booking/wizardDisplay.ts`

- **Source:** `client/src/composables/booking/useWizardDisplay.ts`
  - Types: UseWizardDisplayParams, UseWizardDisplayReturn
  - Priority: low

### `client/src/types/booking/wizardFilteredOptions.ts`

- **Source:** `client/src/composables/booking/useWizardFilteredOptions.ts`
  - Types: UseWizardFilteredOptionsParams, UseWizardFilteredOptionsReturn
  - Priority: low

### `client/src/types/booking/wizardNavigation.ts`

- **Source:** `client/src/composables/booking/useWizardNavigation.ts`
  - Types: UseWizardNavigationParams, UseWizardNavigationReturn
  - Priority: low

### `client/src/types/booking/wizardStepContent.ts`

- **Source:** `client/src/composables/booking/useWizardStepContent.ts`
  - Types: UseWizardStepContentReturn
  - Priority: low

### `client/src/types/booking/wizardStepDataRefs.ts`

- **Source:** `client/src/composables/booking/useWizardStepDataRefs.ts`
  - Types: UseWizardStepDataRefsReturn
  - Priority: high

### `client/src/types/booking/wizardStepSync.ts`

- **Source:** `client/src/composables/booking/useWizardStepSync.ts`
  - Types: UseWizardStepSyncParams
  - Priority: low

### `client/src/types/booking/wizardStepValidation.ts`

- **Source:** `client/src/composables/booking/useWizardStepValidation.ts`
  - Types: UseWizardStepValidationParams
  - Priority: low

### `client/src/types/booking/wizardSubmission.ts`

- **Source:** `client/src/composables/booking/useWizardSubmission.ts`
  - Types: UseWizardSubmissionParams, UseWizardSubmissionReturn
  - Priority: low

### `client/src/types/booking/wizardValidation.ts`

- **Source:** `client/src/composables/booking/useWizardValidation.ts`
  - Types: UseWizardValidationParams
  - Priority: low

### `client/src/types/booking/wizardValidationErrors.ts`

- **Source:** `client/src/composables/booking/useWizardValidationErrors.ts`
  - Types: UseWizardValidationErrorsOptions, UseWizardValidationErrorsReturn
  - Priority: low

### `client/src/types/business.ts`

- **Source:** `client/src/composables/useBusiness.ts`
  - Types: 
  - Priority: low

### `client/src/types/componentDistribution.ts`

- **Source:** `client/src/composables/useComponentDistribution.ts`
  - Types: UseComponentDistributionOptions, UseComponentDistributionReturn
  - Priority: low

### `client/src/types/componentEntity/componentEntityActions.ts`

- **Source:** `client/src/composables/componentEntity/useComponentEntityActions.ts`
  - Types: UseComponentEntityActionsReturn
  - Priority: low

### `client/src/types/componentEntity/componentEntityDomain.ts`

- **Source:** `client/src/composables/componentEntity/useComponentEntityDomain.ts`
  - Types: UseComponentEntityDomainParams, UseComponentEntityDomainReturn
  - Priority: low

### `client/src/types/componentEntity/componentEntityQuery.ts`

- **Source:** `client/src/composables/componentEntity/useComponentEntityQuery.ts`
  - Types: UseComponentEntityQueryReturn
  - Priority: low

### `client/src/types/dataCollections/dataCollectionActions.ts`

- **Source:** `client/src/composables/dataCollections/useDataCollectionActions.ts`
  - Types: DataCollectionCrudConfig
  - Priority: low

### `client/src/types/dev/apiDevPanelData.ts`

- **Source:** `client/src/composables/dev/useApiDevPanelData.ts`
  - Types: OAuthStatusShape, RateLimitShape, DevPanelCacheEntry, DevPanelCacheStats, DevPanelCacheShape
  - Priority: low

### `client/src/types/dev/devPanelTabs.ts`

- **Source:** `client/src/composables/dev/useDevPanelTabs.ts`
  - Types: DevPanelTab
  - Priority: low

### `client/src/types/entityCrud/entityCrudQuery.ts`

- **Source:** `client/src/composables/entityCrud/useEntityCrudQuery.ts`
  - Types: UseEntityCrudQueryReturn
  - Priority: low

### `client/src/types/entityCrud/entityCrudState.ts`

- **Source:** `client/src/composables/entityCrud/useEntityCrudState.ts`
  - Types: UseEntityCrudStateReturn
  - Priority: low

### `client/src/types/entityCrud/sharedMutationHandlers.ts`

- **Source:** `client/src/composables/entityCrud/useSharedMutationHandlers.ts`
  - Types: InvalidateEntityQueriesOptions, MutationContextWithPreviousData
  - Priority: low

### `client/src/types/entityForm.ts`

- **Source:** `client/src/composables/useEntityForm.ts`
  - Types: UseEntityFormReturn
  - Priority: low

### `client/src/types/fieldContext/fieldContextActions.ts`

- **Source:** `client/src/composables/fieldContext/useFieldContextActions.ts`
  - Types: UseFieldContextActionsReturn
  - Priority: low

### `client/src/types/fieldContext/fieldContextSaveHelpers.ts`

- **Source:** `client/src/composables/fieldContext/useFieldContextSaveHelpers.ts`
  - Types: SaveComponentEntityParams, SaveRelationshipFieldParams, SaveRegularFieldParams
  - Priority: low

### `client/src/types/formFields/formFieldsContext.ts`

- **Source:** `client/src/composables/formFields/useFormFieldsContext.ts`
  - Types: UseFormFieldsContextReturn
  - Priority: low

### `client/src/types/layoutLoading.ts`

- **Source:** `client/src/composables/useLayoutLoading.ts`
  - Types: UseLayoutLoadingOptions, UseLayoutLoadingReturn
  - Priority: low

### `client/src/types/loadingIndicator.ts`

- **Source:** `client/src/composables/useLoadingIndicator.ts`
  - Types: LoadingIndicatorInstance, UseLoadingIndicatorReturn
  - Priority: high

### `client/src/types/partInstanceData.ts`

- **Source:** `client/src/composables/usePartInstanceData.ts`
  - Types: UsePartInstanceDataOptions, UsePartInstanceDataReturn
  - Priority: low

### `client/src/types/selectOptions.ts`

- **Source:** `client/src/composables/useSelectOptions.ts`
  - Types: SelectOptionBase, UseSelectOptionsOptions, UseSelectOptionsReturn
  - Priority: high

---

## 2. Duplicate type names (consolidation candidates)

Same type/interface name in multiple files — pick one canonical location and merge or re-export.

_None._
---

## 3. Cleanup candidates (misplaced + unused)

_None (or unused-code-audit not run)._
