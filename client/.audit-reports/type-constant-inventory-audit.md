**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Type and Constant Inventory Audit (Generated)

Generated: 2026-02-26T23:57:46.441Z

## Summary

- Type files: **263**
- Constant files: **23**
- Config files: **34**
- Files with inline type exports: **93**
- Annotated: **64** | Unannotated: **256**

| Classification Issue | Count |
| --- | ---: |
| Mixed type+constant files | 12 |
| Inline types in composables | 62 |
| Configs with factory functions | 8 |
| Duplicate type names | 5 |
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

### Domain: addressAutocomplete.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/addressAutocomplete.ts` | dedicated | SelectionResult, UseAddressAutocompleteEmit, UseAddressAutocompleteOptions, UseAddressAutocompleteReturn | no | (none) | unknown |

### Domain: admin

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardSaveState.ts` | dedicated | UseEntityCardSaveStateReturn | no | UseEntityCardSaveStateReturn for entity card save state. | feature |
| `client/src/types/admin/entityFormRedirectOptions.ts` | dedicated | UseEntityFormRedirectOptions | no | UseEntityFormRedirectOptions for entity form redirect behavior. | feature |
| `client/src/types/admin/fieldKeyboardGuard.ts` | dedicated | FieldKeyboardGuardType, UseFieldKeyboardGuardOptions, UseFieldKeyboardGuardReturn | no | FieldKeyboardGuardType, UseFieldKeyboardGuardOptions, UseFieldKeyboardGuardReturn. | feature |
| `client/src/types/admin/fieldMetadataUpdate.ts` | dedicated | FieldMetadataConfig | no | FieldMetadataConfig and types for useFieldMetadataUpdate. | feature |
| `client/src/types/admin/fieldRendererComponent.ts` | dedicated | UseFieldRendererComponentOptions, UseFieldRendererComponentReturn | no | UseFieldRendererComponentOptions, UseFieldRendererComponentReturn. | feature |
| `client/src/types/admin/formElementPatching.ts` | dedicated | UseFormElementPatchingOptions, FormElementPatchingOptionsBase, UseFormElementPatchingReturn | no | Form element patching options and return types. | feature |
| `client/src/types/admin/iconPickerState.ts` | dedicated | UseIconPickerStateOptions, UseIconPickerStateReturn | no | UseIconPickerStateOptions, UseIconPickerStateReturn. | feature |
| `client/src/types/admin/instanceBulkEdit.ts` | dedicated | UseInstanceBulkEditOptions, UseInstanceBulkEditReturn | no | UseInstanceBulkEditOptions, UseInstanceBulkEditReturn. | feature |
| `client/src/types/admin/instanceDragAndDrop.ts` | dedicated | UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn | no | UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn. | feature |
| `client/src/types/admin/instanceFiltering.ts` | dedicated | UseInstanceFilteringOptions, UseInstanceFilteringReturn | no | UseInstanceFilteringOptions, UseInstanceFilteringReturn. | feature |
| `client/src/types/admin/instanceGrouping.ts` | dedicated | UseInstanceGroupingOptions, UseInstanceGroupingReturn | no | UseInstanceGroupingOptions, UseInstanceGroupingReturn. | feature |
| `client/src/types/admin/instanceShape.ts` | dedicated | UseInstanceShapeOptions, UseInstanceShapeReturn | no | UseInstanceShapeOptions, UseInstanceShapeReturn. | feature |
| `client/src/types/admin/instanceTabHandlers.ts` | dedicated | UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn | no | UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn. | feature |
| `client/src/types/admin/instancesTabEventInstance.ts` | dedicated | NewEventInstanceData, UseInstancesTabEventInstanceParams | no | UseInstancesTabEventInstanceParams, NewEventInstanceData. | feature |
| `client/src/types/admin/instancesTabEventInstanceDrag.ts` | dedicated | UseInstancesTabEventInstanceDragParams | no | UseInstancesTabEventInstanceDragParams. | feature |
| `client/src/types/admin/metadataCache.ts` | dedicated | MetadataEntityType, MetadataCache, UseMetadataCacheReturn | no | MetadataCache, UseMetadataCacheReturn, MetadataEntityType. | feature |
| `client/src/types/admin/metadataFieldDrag.ts` | dedicated | UseMetadataFieldDragParams | no | UseMetadataFieldDragParams. | feature |
| `client/src/types/admin/metadataFieldOrdering.ts` | dedicated | UseMetadataFieldOrderingOptions, UseMetadataFieldOrderingReturn | no | UseMetadataFieldOrderingOptions, UseMetadataFieldOrderingReturn. | feature |
| `client/src/types/admin/metadataModalHandlers.ts` | dedicated | UseMetadataModalHandlersReturn | no | UseMetadataModalHandlersReturn. | feature |
| `client/src/types/admin/partInstanceBulkEdit.ts` | dedicated | UsePartInstanceBulkEditOptions, UsePartInstanceBulkEditReturn | no | PartInstanceBulkEditData, UsePartInstanceBulkEditOptions, UsePartInstanceBulkEditReturn. | feature |
| `client/src/types/admin/partInstanceCollection.ts` | dedicated | PartInstanceCollectionModel | no | PartInstanceCollectionModel. | feature |
| `client/src/types/admin/partInstanceExpansion.ts` | dedicated | UsePartInstanceExpansionOptions, UsePartInstanceExpansionReturn | no | UsePartInstanceExpansionOptions, UsePartInstanceExpansionReturn. | feature |
| `client/src/types/admin/partInstanceForm.ts` | dedicated | UsePartInstanceFormOptions, PartInstanceFormData | no | PartInstanceFormData, UsePartInstanceFormOptions, UsePartInstanceFormReturn. | feature |
| `client/src/types/admin/partsTotals.ts` | dedicated | UsePartsTotalsReturn | no | UsePartsTotalsReturn. | feature |
| `client/src/types/admin/relationshipCollection.ts` | dedicated | NameGenerator, UseRelationshipCollectionOptions | no | NameGenerator, RelationshipCollectionModel, UseRelationshipCollectionOptions. | feature |
| `client/src/types/admin/relationshipCollectionData.ts` | dedicated | UseRelationshipCollectionDataReturn, UseRelationshipCollectionDataOptions, UseRelationshipCollectionDataReturnBase | no | UseRelationshipCollectionDataOptions, UseRelationshipCollectionDataReturnBase, UseRelationshipCollectionDataReturn. | feature |
| `client/src/types/admin/selectConfig.ts` | dedicated | UseSelectConfigOptions, UseSelectConfigReturn | no | UseSelectConfigOptions, UseSelectConfigReturn. | feature |
| `client/src/types/admin/selectDomTargets.ts` | dedicated | UseSelectDomTargetsOptions, UseSelectDomTargetsReturn | no | UseSelectDomTargetsOptions, UseSelectDomTargetsReturn. | feature |
| `client/src/types/admin/selectFieldValue.ts` | dedicated | UseSelectFieldValueOptions, UseSelectFieldValueReturn | no | UseSelectFieldValueOptions, UseSelectFieldValueReturn. | feature |
| `client/src/types/admin/selectFormAssociation.ts` | dedicated | UseSelectFormAssociationOptions | no | UseSelectFormAssociationOptions. | feature |
| `client/src/types/admin/selectHandlers.ts` | dedicated | UseSelectHandlersOptions, UseSelectHandlersReturn | no | UseSelectHandlersOptions, UseSelectHandlersReturn. | feature |
| `client/src/types/admin/selectInputsAsync.ts` | dedicated | UseSelectInputsAsyncOptions, UseSelectInputsAsyncReturn | no | UseSelectInputsAsyncOptions, UseSelectInputsAsyncReturn. | feature |
| `client/src/types/admin/selectLabelResolution.ts` | dedicated | UseSelectLabelResolutionOptions, UseSelectLabelResolutionReturn | no | UseSelectLabelResolutionOptions, UseSelectLabelResolutionReturn. | feature |
| `client/src/types/admin/shapeDisplayNames.ts` | dedicated | UseShapeDisplayNamesReturn | no | UseShapeDisplayNamesReturn. | feature |
| `client/src/types/admin/shapeEditModal.ts` | dedicated | UseShapeEditModalOptions, UseShapeEditModalReturn | no | UseShapeEditModalOptions, UseShapeEditModalReturn. | feature |
| `client/src/types/admin/shapesTabCreation.ts` | dedicated |  | no | UseShapesTabCreationParams. | feature |
| `client/src/types/admin/shapesTabDeletion.ts` | dedicated | ShapesTabBaseParams | no | UseShapesTabDeletionParams. | feature |
| `client/src/types/admin/statusButtonFields.ts` | dedicated | UseStatusButtonFieldsOptions, UseStatusButtonFieldsReturn | no | UseStatusButtonFieldsOptions, UseStatusButtonFieldsReturn. | feature |
| `client/src/types/admin/statusButtonHandlers.ts` | dedicated | UseStatusButtonHandlersOptions, UseStatusButtonHandlersReturn | no | UseStatusButtonHandlersOptions, UseStatusButtonHandlersReturn. | feature |
| `client/src/types/admin/statusButtonToggle.ts` | dedicated | UseStatusButtonToggleOptions, UseStatusButtonToggleReturn | no | UseStatusButtonToggleOptions, UseStatusButtonToggleReturn. | feature |
| `client/src/types/admin/tabNavigation.ts` | dedicated | UseTabNavigationOptions, UseTabNavigationReturn | no | UseTabNavigationOptions, UseTabNavigationReturn. | feature |

### Domain: admin.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin.ts` | dedicated | DisplayFieldType | no | (none) | unknown |

### Domain: admin/attendeeQuickSelect.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/attendeeQuickSelect.ts` | dedicated | UseAttendeeQuickSelectReturn | no | (none) | unknown |

### Domain: admin/availabilitySettings.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/availabilitySettings.ts` | dedicated | UseAvailabilitySettingsOptions, UseAdminAvailabilitySettingsReturn | no | (none) | unknown |

### Domain: admin/blockInstanceForm.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/blockInstanceForm.ts` | dedicated | UseBlockInstanceFormOptions, BlockInstanceFormData | no | (none) | unknown |

### Domain: admin/buildMetadataEntry.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/buildMetadataEntry.ts` | dedicated | BuildMetadataEntryOptions | no | (none) | unknown |

### Domain: admin/businessControlsFormState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/businessControlsFormState.ts` | dedicated | BusinessHoursDay, UseBusinessControlsFormStateParams | no | (none) | unknown |

### Domain: admin/businessRules.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/businessRules.ts` | dedicated | RuleType, BusinessRuleFormData, BusinessRuleCore | no | (none) | unknown |

### Domain: admin/calendarEntries.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/calendarEntries.ts` | dedicated | UseCalendarEntriesReturn | no | (none) | unknown |

### Domain: admin/calibrationChart.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/calibrationChart.ts` | dedicated | SvgChartShape, UseCalibrationChartReturn | no | (none) | unknown |

### Domain: admin/capacitySettings.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/capacitySettings.ts` | dedicated | UseCapacitySettingsParams | no | (none) | unknown |

### Domain: admin/conditionalFieldVisibility.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/conditionalFieldVisibility.ts` | dedicated | FieldsByLocation, UseConditionalFieldVisibilityOptions, UseConditionalFieldVisibilityReturn | no | (none) | unknown |

### Domain: admin/dev

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/components/admin/dev/devPanelTypes.ts` | colocated | DevPanelVisibleProps | no | (none) | unknown |

### Domain: admin/dialogFormState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/dialogFormState.ts` | dedicated | UseDialogFormStateOptions, UseDialogFormStateReturn | no | (none) | unknown |

### Domain: admin/dragAndDrop.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/dragAndDrop.ts` | dedicated | DragEndHandler, UseDragAndDropParams, UseDragAndDropReturn | no | (none) | unknown |

### Domain: admin/entityCardActions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardActions.ts` | dedicated | UseEntityCardActionsOptions, UseEntityCardActionsReturn | no | (none) | unknown |

### Domain: admin/entityCardComputed.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardComputed.ts` | dedicated | UseEntityCardComputedParams, UseEntityCardComputedReturn | no | (none) | unknown |

### Domain: admin/entityCardExpansion.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardExpansion.ts` | dedicated | UseEntityCardExpansionOptions, UseEntityCardExpansionReturn | no | (none) | unknown |

### Domain: admin/entityCardFieldConfiguration.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardFieldConfiguration.ts` | dedicated | UseEntityCardFieldConfigurationParams, UseEntityCardFieldConfigurationReturn | no | (none) | unknown |

### Domain: admin/entityCardFieldContextAndVisibility.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardFieldContextAndVisibility.ts` | dedicated | UseEntityCardFieldContextAndVisibilityParams | no | (none) | unknown |

### Domain: admin/entityCardForm.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardForm.ts` | dedicated | UseEntityCardFormOptions, UseEntityCardFormReturn | no | (none) | unknown |

### Domain: admin/entityCardFormSetup.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardFormSetup.ts` | dedicated | UseEntityCardFormSetupParams, UseEntityCardFormSetupReturn | no | (none) | unknown |

### Domain: admin/entityCardLayout.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardLayout.ts` | dedicated | UseEntityCardLayoutOptions, UseEntityCardLayoutReturn | no | (none) | unknown |

### Domain: admin/entityCardMetadata.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardMetadata.ts` | dedicated | UseEntityMetadataReturn, UseEntityCardMetadataParams, UseEntityCardMetadataReturn | no | (none) | unknown |

### Domain: admin/entityCardSaveAndActions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardSaveAndActions.ts` | dedicated | UseEntityCardSaveAndActionsParams, UseEntityCardSaveAndActionsReturn | no | (none) | unknown |

### Domain: admin/entityCardSaveHandlers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardSaveHandlers.ts` | dedicated | UseEntityCardSaveHandlersParams | no | (none) | unknown |

### Domain: admin/entityCardStoreSync.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityCardStoreSync.ts` | dedicated | UseEntityCardStoreSyncOptions, UseEntityCardStoreSyncReturn | no | (none) | unknown |

### Domain: admin/entityDragHandlers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityDragHandlers.ts` | dedicated | PatchOrderIndex, UseEntityDragHandlersParams, UseEntityDragHandlersReturn | no | (none) | unknown |

### Domain: admin/entityFiltering.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityFiltering.ts` | dedicated | UseEntityFilteringReturn | no | (none) | unknown |

### Domain: admin/entityGrouping.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityGrouping.ts` | dedicated | UseEntityGroupingParams, UseEntityGroupingReturn | no | (none) | unknown |

### Domain: admin/entityInstanceFormBase.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityInstanceFormBase.ts` | dedicated | UseEntityInstanceFormReturn | no | (none) | unknown |

### Domain: admin/entityStatus.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityStatus.ts` | dedicated | UseEntityStatusOptions, UseEntityStatusReturn | no | (none) | unknown |

### Domain: admin/entityTabState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/entityTabState.ts` | dedicated | UseEntityTabStateReturn, UseEntityTabStateOptions | no | (none) | unknown |

### Domain: admin/expansionState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/expansionState.ts` | dedicated | UseExpansionStateReturn | no | (none) | unknown |

### Domain: admin/fieldComponent.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/fieldComponent.ts` | dedicated | UseFieldComponentOptions, UseFieldComponentReturn | no | (none) | unknown |

### Domain: admin/fieldContextManager.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/fieldContextManager.ts` | dedicated | UseFieldContextManagerOptions, UseFieldContextManagerReturn | no | (none) | unknown |

### Domain: admin/fieldInputHandlers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/fieldInputHandlers.ts` | dedicated | UseFieldInputHandlersParams | no | (none) | unknown |

### Domain: admin/fieldInputSetup.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/fieldInputSetup.ts` | dedicated | UseFieldInputSetupOptions | no | (none) | unknown |

### Domain: admin/fieldLocation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/fieldLocation.ts` | dedicated | UseFieldLocationOptions, UseFieldLocationReturn | no | (none) | unknown |

### Domain: admin/generic

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/components/admin/generic/fields/fieldTypes.ts` | colocated | FieldInputProps | no | (none) | unknown |

### Domain: admin/instanceComposableOptions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/instanceComposableOptions.ts` | dedicated | UseInstanceBlockInstancesByShapeOptions | no | (none) | unknown |

### Domain: admin/nestedComputedFactory.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/nestedComputedFactory.ts` | dedicated | CreateNestedComputedOptions | no | (none) | unknown |

### Domain: admin/partPricing.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/partPricing.ts` | dedicated | PartPricingFields | no | (none) | unknown |

### Domain: admin/selectFiltering.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/selectFiltering.ts` | dedicated | UseSelectFilteringOptions, UseSelectFilteringReturn | no | (none) | unknown |

### Domain: admin/selectTypeResolver.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/selectTypeResolver.ts` | dedicated | SelectConfigLike, OptionsSelectConfigLike | no | (none) | unknown |

### Domain: admin/tables

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/admin/tables/appointmentsTableHandlers.ts` | dedicated | UseAppointmentsTableHandlersReturn, UseAppointmentsTableHandlersParams | no | (none) | unknown |
| `client/src/types/admin/tables/crudDataTableModel.ts` | dedicated | CrudDataTableModelOptions, CrudDataTableModel, CrudDataTableModelGrouped | no | (none) | unknown |
| `client/src/types/admin/tables/tableModelHelpers.ts` | dedicated | TableModelFormatHelpers | no | (none) | unknown |

### Domain: annotations.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/annotations.ts` | dedicated | AnnotationShape, AnnotationInstance, AnnotationMetadata, AnnotationWithMetadata, AnnotationMap… | no | (none) | unknown |

### Domain: appointment.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/appointment.ts` | dedicated | TimeRange, PerspectiveKey, AppointmentSlots, EventFinal, SlotShape… | no | (none) | unknown |

### Domain: appointmentApi.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/appointmentApi.ts` | dedicated | AttendeeResponse, AppointmentRequest, AppointmentResponse | no | (none) | unknown |

### Domain: appointmentFeeTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/appointmentFeeTypes.ts` | dedicated | AppointmentFeeSummaryCreate, AppointmentFeeEntryCreate, AppointmentFeeSummary, FeeEntryBase, AppointmentFeeBreakdownPayload | no | (none) | unknown |

### Domain: appointmentStatus.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/appointmentStatus.ts` | dedicated | AppointmentStatus | no | (none) | unknown |

### Domain: appointmentTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/appointmentTypes.ts` | dedicated | AttendeeRequest | no | (none) | unknown |

### Domain: autocomplete.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/autocomplete.ts` | dedicated | AutocompleteValue | no | (none) | unknown |

### Domain: availability.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/availability.ts` | dedicated | PropertyDetails | no | (none) | unknown |

### Domain: availabilitySettingsParams.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/availabilitySettingsParams.ts` | dedicated | UseBufferSettingsParams, UseDefaultLocationParams, UseDifferentialPerspectivesParams, AvailabilitySettingsFormParams | no | (none) | unknown |

### Domain: availabilityStepParams.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/availabilityStepParams.ts` | dedicated | AvailabilityStepParamsBase | no | (none) | unknown |

### Domain: availabilityTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/availabilityTypes.ts` | dedicated | RFC3339DateTime, ConstraintEnforcement, RollingWeekDirection, ConstraintCategory, RangeConstraintType… | no | (none) | unknown |

### Domain: betaFeedback.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/betaFeedback.ts` | dedicated | FeedbackCategory, FeedbackSeverity, FeedbackStatus, BetaFeedbackFilters, BetaFeedback… | no | (none) | unknown |

### Domain: booking

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/apiCallStatus.ts` | dedicated | ApiCallStatus, ApiCallStatusState, UseApiCallStatusReturn | no | ApiCallStatus, ApiCallStatusState, UseApiCallStatusReturn. | shared |
| `client/src/types/booking/appointmentDataCollection.ts` | dedicated | UseAppointmentDataCollectionParams, UseAppointmentDataCollectionReturn | no | UseAppointmentDataCollectionParams, UseAppointmentDataCollectionReturn. | feature |
| `client/src/types/booking/blockFinal.ts` | dedicated | BlockFinal | no | BlockFinal type for booking flow. | shared |
| `client/src/types/booking/dateRangeDecider.ts` | dedicated | DisplayedMonth | no | DisplayedMonth type for date range decider. | shared |
| `client/src/types/booking/partFinal.ts` | dedicated | PartFinal | no | PartFinal type for booking flow. | shared |

### Domain: booking/appointmentDataBuilders.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/appointmentDataBuilders.ts` | dedicated | AppointmentAttendeeRoleLiteral, AttendeeSpecInput, CreateUserMutate, AvailabilityPayload, BlockQuantities | no | (none) | unknown |

### Domain: booking/appointmentDropdown.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/appointmentDropdown.ts` | dedicated | UseAppointmentDropdownOptions, UseAppointmentDropdownReturn | no | (none) | unknown |

### Domain: booking/appointmentDuration.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/appointmentDuration.ts` | dedicated | UseAppointmentDurationParams, UseAppointmentDurationReturn | no | (none) | unknown |

### Domain: booking/appointmentShape.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/appointmentShape.ts` | dedicated | UseAppointmentShapeParams, UseAppointmentShapeReturn | no | (none) | unknown |

### Domain: booking/appointmentSlots.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/appointmentSlots.ts` | dedicated | UseAppointmentSlotsParams, UseAppointmentSlotsReturn | no | (none) | unknown |

### Domain: booking/appointmentTimes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/appointmentTimes.ts` | dedicated | UseAppointmentTimesParams, UseAppointmentTimesReturn | no | (none) | unknown |

### Domain: booking/availabilityDefaults.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityDefaults.ts` | dedicated | UseAvailabilityDefaultsOptions, UseAvailabilityDefaultsReturn | no | (none) | unknown |

### Domain: booking/availabilityDevPanel.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityDevPanel.ts` | dedicated | UseAvailabilityDevPanelParams | no | (none) | unknown |

### Domain: booking/availabilityEmptyState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityEmptyState.ts` | dedicated | UseAvailabilityEmptyStateParams, UseAvailabilityEmptyStateReturn | no | (none) | unknown |

### Domain: booking/availabilityLogic.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityLogic.ts` | dedicated | TimeSlotsPerDay | no | (none) | unknown |

### Domain: booking/availabilityOrchestrator.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityOrchestrator.ts` | dedicated | UseAvailabilityOrchestratorReturn, UseAvailabilityOrchestratorParams | no | (none) | unknown |

### Domain: booking/availabilitySettings.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilitySettings.ts` | dedicated | UseBookingAvailabilitySettingsReturn | no | (none) | unknown |

### Domain: booking/availabilitySlotColor.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilitySlotColor.ts` | dedicated | UseAvailabilitySlotColorParams, UseAvailabilitySlotColorReturn | no | (none) | unknown |

### Domain: booking/availabilityStepData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityStepData.ts` | dedicated | SelectedTimeSlot, AvailabilityStepData, UseAvailabilityStepDataReturn | no | (none) | unknown |

### Domain: booking/availabilityStepHandlers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityStepHandlers.ts` | dedicated | UseAvailabilityStepHandlersParams, UseAvailabilityStepHandlersReturn | no | (none) | unknown |

### Domain: booking/availabilityUI.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityUI.ts` | dedicated | UseAvailabilityUIParams, UseAvailabilityUIReturn | no | (none) | unknown |

### Domain: booking/availabilityValidation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/availabilityValidation.ts` | dedicated | UseAvailabilityValidationParams, UseAvailabilityValidationReturn | no | (none) | unknown |

### Domain: booking/blockInstanceSelection.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/blockInstanceSelection.ts` | dedicated | SelectionMode, UseBlockInstanceSelectionParams, UseBlockInstanceSelectionReturnSingle, UseBlockInstanceSelectionReturnMultiple | no | (none) | unknown |

### Domain: booking/bookingFinalTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/utils/booking/bookingFinalTypes.ts` | colocated |  | no | (none) | unknown |

### Domain: booking/bookingWizardStepValidators.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/bookingWizardStepValidators.ts` | dedicated | BuildBookingWizardStepValidatorsOptions, UseBookingWizardStepValidatorsOptions, BookingWizardStepValidators | no | (none) | unknown |

### Domain: booking/cascadeFilterPipeline.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/cascadeFilterPipeline.ts` | dedicated | CascadeFilterParamsBase | no | (none) | unknown |

### Domain: booking/cascadeInstances.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/cascadeInstances.ts` | dedicated | UseCascadeInstancesOptions, UseCascadeInstancesReturn | no | (none) | unknown |

### Domain: booking/computedAvailability.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/computedAvailability.ts` | dedicated | UseComputedAvailabilityParams, UseComputedAvailabilityReturn | no | (none) | unknown |

### Domain: booking/confirmationStepData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/confirmationStepData.ts` | dedicated | UseConfirmationStepDataParams, UseConfirmationStepDataReturn | no | (none) | unknown |

### Domain: booking/contactsStepData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/contactsStepData.ts` | dedicated | ContactInfo, UseContactsStepDataOptions, UseContactsStepDataReturn | no | (none) | unknown |

### Domain: booking/contactsValidation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/contactsValidation.ts` | dedicated | UseContactsValidationReturn, UseContactsValidationParams | no | (none) | unknown |

### Domain: booking/dependentInstances.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/dependentInstances.ts` | dedicated | UseDependentInstancesOptions, UseDependentInstancesReturn | no | (none) | unknown |

### Domain: booking/dev

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/dev/panelPosition.ts` | dedicated | UsePanelPositionOptions, UsePanelPositionReturn | no | (none) | unknown |

### Domain: booking/devPanelButtonsContext.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/devPanelButtonsContext.ts` | dedicated | DevPanelButtonsContext | no | (none) | unknown |

### Domain: booking/devPanelsComputed.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/devPanelsComputed.ts` | dedicated | DevPanelsComputedData, UseDevPanelsComputedOptions, ServiceSummary, TimeSlotResults, UseDevPanelsComputedReturn | no | (none) | unknown |

### Domain: booking/durationRounding.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/durationRounding.ts` | dedicated | RoundingMethod, DurationRoundingConfig, UseDurationRoundingReturn | no | (none) | unknown |

### Domain: booking/dynamicGridConfig.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/dynamicGridConfig.ts` | dedicated | UseDynamicGridConfigOptions, UseDynamicGridConfigReturn | no | (none) | unknown |

### Domain: booking/elementDimensions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/elementDimensions.ts` | dedicated | UseElementDimensionsOptions, UseElementDimensionsReturn | no | (none) | unknown |

### Domain: booking/instanceComponents.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/instanceComponents.ts` | dedicated | UseInstanceComponentsOptions, UseInstanceComponentsReturn | no | (none) | unknown |

### Domain: booking/instanceComponentsList.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/instanceComponentsList.ts` | dedicated | UseInstanceComponentsListOptions, UseInstanceComponentsListReturn | no | (none) | unknown |

### Domain: booking/instanceDescriptions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/instanceDescriptions.ts` | dedicated | UseInstanceDescriptionsOptions, UseInstanceDescriptionsReturn | no | (none) | unknown |

### Domain: booking/instanceDisplay.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/instanceDisplay.ts` | dedicated | UseInstanceDisplayOptions, UseInstanceDisplayReturn | no | (none) | unknown |

### Domain: booking/instanceSelectionConfig.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/instanceSelectionConfig.ts` | dedicated | UseInstanceSelectionConfigOptions, UseInstanceSelectionConfigReturn | no | (none) | unknown |

### Domain: booking/instanceSelectionState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/instanceSelectionState.ts` | dedicated | GenericWizardInstance, UseInstanceSelectionStateParams, UseInstanceSelectionStateReturn | no | (none) | unknown |

### Domain: booking/mockCalendarRefresh.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/mockCalendarRefresh.ts` | dedicated | UseMockCalendarRefreshReturn | no | (none) | unknown |

### Domain: booking/moveablePartsScheduling.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/moveablePartsScheduling.ts` | dedicated | ComputeMoveableSlotsParams | no | (none) | unknown |

### Domain: booking/optionTypeBlockSelection.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/optionTypeBlockSelection.ts` | dedicated | UseOptionTypeBlockSelectionParams, UseOptionTypeBlockSelectionReturn | no | (none) | unknown |

### Domain: booking/perspectiveMapping.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/perspectiveMapping.ts` | dedicated | UsePerspectiveMappingParams, UsePerspectiveMappingReturn | no | (none) | unknown |

### Domain: booking/perspectiveResolver.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/perspectiveResolver.ts` | dedicated | ResolvedEventShapes | no | (none) | unknown |

### Domain: booking/pricingCascadeInstances.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/pricingCascadeInstances.ts` | dedicated | UsePricingCascadeInstancesOptions, UsePricingCascadeInstancesReturn | no | (none) | unknown |

### Domain: booking/propertyDetailsLogic.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/propertyDetailsLogic.ts` | dedicated | PropertyFormStateCore, UsePropertyDetailsLogicReturn | no | (none) | unknown |

### Domain: booking/propertyFormState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/propertyFormState.ts` | dedicated | UsePropertyFormStateReturn | no | (none) | unknown |

### Domain: booking/propertyFormWatchers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/propertyFormWatchers.ts` | dedicated | UsePropertyFormWatchersReturn | no | (none) | unknown |

### Domain: booking/propertyTypeBlockConfig.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/propertyTypeBlockConfig.ts` | dedicated | UsePropertyTypeBlockConfigParams, UsePropertyTypeBlockConfigReturn | no | (none) | unknown |

### Domain: booking/propertyTypeBlockSelection.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/propertyTypeBlockSelection.ts` | dedicated | UsePropertyTypeBlockSelectionParams, UsePropertyTypeBlockSelectionReturn | no | (none) | unknown |

### Domain: booking/propertyValidation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/propertyValidation.ts` | dedicated | UsePropertyValidationReturn, PropertyValidationData, UsePropertyValidationParams | no | (none) | unknown |

### Domain: booking/responsiveGrid.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/responsiveGrid.ts` | dedicated | UseResponsiveGridOptions, UseResponsiveGridReturn | no | (none) | unknown |

### Domain: booking/selectionCard

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/selectionCard/selectionCard.ts` | dedicated | UseSelectionCardOptions, UseSelectionCardReturn, UseSelectionCardGroupOptions, UseSelectionCardGroupReturn | no | (none) | unknown |
| `client/src/types/booking/selectionCard/selectionCardComponent.ts` | dedicated | UseSelectionCardComponentReturn | no | (none) | unknown |
| `client/src/types/booking/selectionCard/selectionCardConfig.ts` | dedicated | UseSelectionCardConfigParams, UseSelectionCardConfigReturn | no | (none) | unknown |
| `client/src/types/booking/selectionCard/selectionCardGroupState.ts` | dedicated | UseSelectionCardGroupStateParams, UseSelectionCardGroupStateReturn | no | (none) | unknown |
| `client/src/types/booking/selectionCard/selectionCardHandlers.ts` | dedicated | UseSelectionCardHandlersParams, UseSelectionCardHandlersReturn | no | (none) | unknown |
| `client/src/types/booking/selectionCard/selectionCardState.ts` | dedicated | UseSelectionCardStateParams, UseSelectionCardStateReturn | no | (none) | unknown |
| `client/src/types/booking/selectionCard/selectionCardStyles.ts` | dedicated | UseSelectionCardStylesParams, UseSelectionCardStylesParamsBase, UseSelectionCardStylesReturn | no | (none) | unknown |

### Domain: booking/selectionCardGroupConfig.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/selectionCardGroupConfig.ts` | dedicated | UseSelectionCardGroupConfigParams, UseSelectionCardGroupConfigReturn | no | (none) | unknown |

### Domain: booking/slotGenerationValidation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/slotGenerationValidation.ts` | dedicated | SlotGenerationParams, SlotGenerationParamsBase | no | (none) | unknown |

### Domain: booking/stepValidation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/stepValidation.ts` | dedicated | CustomValidator, UseStepValidationParams, UseStepValidationReturn | no | (none) | unknown |

### Domain: booking/timeSlotCalculations.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/timeSlotCalculations.ts` | dedicated | DifferentialTimeBlocks, UseTimeSlotCalculationsParams, UseTimeSlotCalculationsReturn | no | (none) | unknown |

### Domain: booking/timeSlotMatching.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/timeSlotMatching.ts` | dedicated | LoadedTimeSlot, MatchLoadedTimeSlotsResult | no | (none) | unknown |

### Domain: booking/types

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/components/booking/types/selectionCardTypes.ts` | colocated | ComponentItem, SelectionCardItem, GridColumns, StatePlugin, SelectionCardConfig | no | (none) | unknown |

### Domain: booking/wizardAppointmentManagement.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardAppointmentManagement.ts` | dedicated | UseWizardAppointmentManagementReturn | no | (none) | unknown |

### Domain: booking/wizardDateAvailability.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardDateAvailability.ts` | dedicated | UseWizardDateAvailabilityParams, UseWizardDateAvailabilityReturn | no | (none) | unknown |

### Domain: booking/wizardDevMode.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardDevMode.ts` | dedicated | UseWizardDevModeReturn | no | (none) | unknown |

### Domain: booking/wizardDisplay.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardDisplay.ts` | dedicated | UseWizardDisplayParams, UseWizardDisplayReturn | no | (none) | unknown |

### Domain: booking/wizardFilteredOptions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardFilteredOptions.ts` | dedicated | UseWizardFilteredOptionsParams, UseWizardFilteredOptionsReturn | no | (none) | unknown |

### Domain: booking/wizardNavigation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardNavigation.ts` | dedicated | UseWizardNavigationParams, UseWizardNavigationReturn | no | (none) | unknown |

### Domain: booking/wizardStateData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardStateData.ts` | dedicated | WizardStateData | no | (none) | unknown |

### Domain: booking/wizardStepContent.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardStepContent.ts` | dedicated | UseWizardStepContentReturn | no | (none) | unknown |

### Domain: booking/wizardStepDataRefs.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardStepDataRefs.ts` | dedicated | UseWizardStepDataRefsReturn | no | (none) | unknown |

### Domain: booking/wizardStepSync.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardStepSync.ts` | dedicated | UseWizardStepSyncParams | no | (none) | unknown |

### Domain: booking/wizardStepValidation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardStepValidation.ts` | dedicated | UseWizardStepValidationParams, UseWizardStepValidationReturn | no | (none) | unknown |

### Domain: booking/wizardSubmission.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardSubmission.ts` | dedicated | UseWizardSubmissionParams, UseWizardSubmissionReturn | no | (none) | unknown |

### Domain: booking/wizardValidation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardValidation.ts` | dedicated | StepValidator, UseWizardValidationReturn, UseWizardValidationParams | no | (none) | unknown |

### Domain: booking/wizardValidationErrors.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/booking/wizardValidationErrors.ts` | dedicated | UseWizardValidationErrorsOptions, UseWizardValidationErrorsReturn | no | (none) | unknown |

### Domain: business.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/business.ts` | dedicated | UseBusinessReturn | no | (none) | unknown |

### Domain: businessRulesTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/businessRulesTypes.ts` | dedicated | RuleConfig, RequiredFieldsRuleConfig, RequiresAgentRuleConfig, ConditionalValidationRuleConfig, ValidationMessageRuleConfig | no | (none) | unknown |

### Domain: calendarTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/calendarTypes.ts` | dedicated | CalendarProvider, CalendarEntry, CalendarConfig | no | (none) | unknown |

### Domain: collections/arrayDiff.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/collections/arrayDiff.ts` | dedicated | ArrayDiffResult | no | (none) | unknown |

### Domain: collections/resolveByIds.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/collections/resolveByIds.ts` | dedicated | ResolveByIdsResult | no | (none) | unknown |

### Domain: component.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/component.ts` | dedicated | ComponentStrategy, ComponentConfig, DistributionStrategy, FetchedInstanceComponent, Component… | no | (none) | unknown |

### Domain: componentDistribution.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/componentDistribution.ts` | dedicated | UseComponentDistributionOptions, UseComponentDistributionReturn | no | (none) | unknown |

### Domain: componentEntity/componentEntityActions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/componentEntity/componentEntityActions.ts` | dedicated | UseComponentEntityActionsReturn | no | (none) | unknown |

### Domain: componentEntity/componentEntityDomain.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/componentEntity/componentEntityDomain.ts` | dedicated | UseComponentEntityDomainParams, UseComponentEntityDomainReturn | no | (none) | unknown |

### Domain: componentEntity/componentEntityQuery.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/componentEntity/componentEntityQuery.ts` | dedicated | UseComponentEntityQueryReturn | no | (none) | unknown |

### Domain: componentTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/componentTypes.ts` | dedicated | ComponentStrategy, ComponentConfig | no | (none) | unknown |

### Domain: contactTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/contactTypes.ts` | dedicated | ContactInfoBase | no | (none) | unknown |

### Domain: coreEntityTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/coreEntityTypes.ts` | dedicated | CoreEntity | no | (none) | unknown |

### Domain: dataCollections/businessDataCollectionTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/dataCollections/businessDataCollectionTypes.ts` | dedicated | BusinessDataCollectionQueryResult, BusinessDataCollectionByIdQueryResult, BusinessDataCollectionSelector, BusinessDataCollectionUpdater, BusinessDataCollectionEndpoints… | no | (none) | unknown |

### Domain: dataCollections/dataCollectionActions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/dataCollections/dataCollectionActions.ts` | dedicated | DataCollectionCrudConfig, UseDataCollectionActionsReturn | no | (none) | unknown |

### Domain: dataCollections/globalDataCollectionTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/dataCollections/globalDataCollectionTypes.ts` | dedicated | GlobalDataCollectionQueryResult, GlobalDataCollectionByIdQueryResult, GlobalDataCollectionSelector, GlobalDataCollectionUpdater, GlobalDataCollectionEndpoints… | no | (none) | unknown |

### Domain: datetime.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/datetime.ts` | dedicated | DayOfWeek | no | (none) | unknown |

### Domain: dev/apiDevPanelData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/dev/apiDevPanelData.ts` | dedicated | OAuthStatusShape, RateLimitShape, DevPanelCacheEntry, DevPanelCacheStats, DevPanelCacheShape… | no | (none) | unknown |

### Domain: dev/devPanelTabs.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/dev/devPanelTabs.ts` | dedicated | DevPanelTab, UseDevPanelTabsReturn | no | (none) | unknown |

### Domain: entity

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entities.ts` | dedicated | AnnotationShapeEntity, GlobalEntity | no | Core entity type definitions (runtime helpers moved to utils/globalEntity.ts). | shared |
| `client/src/types/entity/formDataEnums.ts` | dedicated |  | no | Form data enums: field type, mode, primitive type, etc. | shared |
| `client/src/types/entity/formFields.ts` | dedicated | PrimitiveFormField, PrimitiveFieldType, DependencyImpactBase, RelationshipFieldType, VirtualFieldType… | no | Form field config types for entity forms. | shared |
| `client/src/types/entity/selectOptions.ts` | dedicated | SelectGroup | no | Select options types for entity fields. | shared |
| `client/src/types/relationships.ts` | dedicated | GlobalRelationship, CreateRelationshipPayload, FetchedRelationship, CreateRelationshipPayloadBase | no | Relationship type definitions for parent-child entity connections. | shared |

### Domain: entityCrud/entityCrudQuery.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entityCrud/entityCrudQuery.ts` | dedicated | UseEntityCrudQueryReturn | no | (none) | unknown |

### Domain: entityCrud/entityCrudState.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entityCrud/entityCrudState.ts` | dedicated | UseEntityCrudStateReturn, UseEntityCrudStateReturnBase | no | (none) | unknown |

### Domain: entityCrud/entityCrudTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entityCrud/entityCrudTypes.ts` | dedicated | OrderIndexUpdate, BulkUpdate, UseEntityCrudActionsReturn, EntityCrudMutationContext, UseEntityCrudMutationsReturnBase | no | (none) | unknown |

### Domain: entityCrud/sharedMutationHandlers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entityCrud/sharedMutationHandlers.ts` | dedicated | InvalidateEntityQueriesOptions, MutationContextWithPreviousData | no | (none) | unknown |

### Domain: entityForm.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/entityForm.ts` | dedicated | UseEntityFormReturn | no | (none) | unknown |

### Domain: errors/axiosErrorUtils.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/errors/axiosErrorUtils.ts` | dedicated | ExtractedErrorMessage | no | (none) | unknown |

### Domain: events.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/events.ts` | dedicated | EventShape, EventInstance | no | (none) | unknown |

### Domain: fieldContext

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/fieldContext/fieldContextState.ts` | dedicated | UseFieldContextStateOptions, UseFieldContextStateReturn, UseFieldContextStateReturnGrouped | no | UseFieldContextStateOptions and UseFieldContextStateReturn. | shared |
| `client/src/composables/fieldContext/types.ts` | colocated | FieldDisplayConfig, FieldValidationRules, FieldContextType, FieldContextTypeGrouped | no | Field context types for entity form fields. | shared |

### Domain: fieldContext/fieldContextActions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/fieldContext/fieldContextActions.ts` | dedicated | UseFieldContextActionsReturn | no | (none) | unknown |

### Domain: fieldContext/fieldContextSaveHelpers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/fieldContext/fieldContextSaveHelpers.ts` | dedicated | SaveComponentEntityParams, SaveRelationshipFieldParams, SaveRegularFieldParams | no | (none) | unknown |

### Domain: formFields

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/composables/formFields/types.ts` | colocated | UseFormFieldsContextOptions, UseFormFieldsOptionsBase, UseFormFieldsStandardLayoutReturn | no | Form fields types and layout config. | shared |

### Domain: formFields/formFieldsContext.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/formFields/formFieldsContext.ts` | dedicated | UseFormFieldsContextReturn | no | (none) | unknown |

### Domain: forms/fieldComponent.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/forms/fieldComponent.ts` | dedicated | FieldComponent | no | (none) | unknown |

### Domain: forms/fieldLocationDispatcher.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/forms/fieldLocationDispatcher.ts` | dedicated | FieldLocation, FieldLocationContext | no | (none) | unknown |

### Domain: forms/fieldSectionCategorization.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/forms/fieldSectionCategorization.ts` | dedicated | StatusButtonField | no | (none) | unknown |

### Domain: forms/getFieldKeys.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/forms/getFieldKeys.ts` | dedicated | GetFieldKeysOptions | no | (none) | unknown |

### Domain: forms/layoutFieldCategorization.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/forms/layoutFieldCategorization.ts` | dedicated | FieldsByLayout | no | (none) | unknown |

### Domain: forms/selectDomAssociation.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/forms/selectDomAssociation.ts` | dedicated | SelectDomTarget | no | (none) | unknown |

### Domain: googleCalendar.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/googleCalendar.ts` | dedicated | GoogleCalendarBusyPeriod, GoogleFreeBusyResponse | no | (none) | unknown |

### Domain: identifiable.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/identifiable.ts` | dedicated | IdentifiableById | no | (none) | unknown |

### Domain: layoutLoading.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/layoutLoading.ts` | dedicated | UseLayoutLoadingOptions, UseLayoutLoadingReturn | no | (none) | unknown |

### Domain: loadingIndicator.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/loadingIndicator.ts` | dedicated | LoadingIndicatorInstance, UseLoadingIndicatorReturn | no | (none) | unknown |

### Domain: loggerTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/loggerTypes.ts` | dedicated | LogLevel, AppLogger, Logger, LoggerEnvConfig | no | (none) | unknown |

### Domain: mapsTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/mapsTypes.ts` | dedicated | MapsApiErrorType, RouteLocation, RouteMatrixStatus, AutocompletePrediction, AddressComponents… | no | (none) | unknown |

### Domain: metadataEditorProps.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/metadataEditorProps.ts` | dedicated | MetadataEditorPropsBase | no | (none) | unknown |

### Domain: metadataEntryTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/metadataEntryTypes.ts` | dedicated | MetadataEntryBase | no | (none) | unknown |

### Domain: moveableScheduling.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/moveableScheduling.ts` | dedicated | ContingencyPeriod, MoveableSchedulingOptions | no | (none) | unknown |

### Domain: partInstanceData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/partInstanceData.ts` | dedicated | UsePartInstanceDataOptions, UsePartInstanceDataReturn | no | (none) | unknown |

### Domain: primitiveBrands.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/primitiveBrands.ts` | dedicated | ISO8601Date, GlobalEntityId | no | (none) | unknown |

### Domain: property.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/property.ts` | dedicated | PropertyVersionType, PropertyTypesRequest | no | (none) | unknown |

### Domain: propertyEnrichmentTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/propertyEnrichmentTypes.ts` | dedicated |  | no | (none) | unknown |

### Domain: propertyForm.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/propertyForm.ts` | dedicated | PropertySource, PropertyFormData | yes | (none) | unknown |

### Domain: propertyTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `shared/types/propertyTypes.ts` | dedicated | PropertyAddressBase, PropertyDetailsBase | no | (none) | unknown |

### Domain: root

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/collectionTypes.ts` | dedicated | WithId, UpdateByIdPayload, CollectionQueryResult, CollectionByIdQueryResult, CollectionEndpoints | no | Canonical collection types: WithId, UpdateByIdPayload, CollectionQueryResult, etc. | shared |
| `client/src/types/formValidation.ts` | dedicated | ValidationRule, ValidationResult | no | ValidationRule and ValidationResult for form validation. | shared |
| `client/src/types/logger.ts` | dedicated |  | no | Canonical logger types (LogLevel, AppLogger, Logger); re-exported from shared. | shared |

### Domain: selectOptions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/selectOptions.ts` | dedicated | SelectOptionBase, UseSelectOptionsOptions, UseSelectOptionsReturn | no | (none) | unknown |

### Domain: shapeFieldMetadata.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/shapeFieldMetadata.ts` | dedicated | ShapeFieldMetadata, ShapeLayoutConfig, ComposedFieldConfig | no | (none) | unknown |

### Domain: ternary.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/ternary.ts` | dedicated | TernaryBoolean | no | (none) | unknown |

### Domain: transformers/adminObject.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/transformers/adminObject.ts` | dedicated | AdminObject, AdminObjectMap | no | (none) | unknown |

### Domain: transformers/appointmentToWizardHelpers.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/transformers/appointmentToWizardHelpers.ts` | dedicated | VersionBlockInstance, AppointmentVersionsResponse | no | (none) | unknown |

### Domain: transformers/bookingData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/transformers/bookingData.ts` | dedicated | BookingPartInstance, BookingBlockShape, BookingBlockInstance, BookingData | no | (none) | unknown |

### Domain: transformers/businessData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/transformers/businessData.ts` | dedicated | BusinessData | no | (none) | unknown |

### Domain: transformers/fieldClassification.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/transformers/fieldClassification.ts` | dedicated | DehydrateFieldSets | no | (none) | unknown |

### Domain: transformers/globalData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/transformers/globalData.ts` | dedicated | GlobalData | no | (none) | unknown |

### Domain: user.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/user.ts` | dedicated |  | no | (none) | unknown |

### Domain: userTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/userTypes.ts` | dedicated | UserTypeBlock | no | (none) | unknown |

### Domain: vueRefTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/vueRefTypes.ts` | dedicated | ReadonlyVueRef | no | (none) | unknown |

### Domain: vuetifyTypes.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/vuetifyTypes.ts` | dedicated | VuetifyAnchor | no | (none) | unknown |

### Domain: wizard.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/wizard.ts` | dedicated | UseBookingWizardReturn, PropertyDetailsStepData, WizardState, WizardSelectionMethods, WizardComputedProperties… | no | (none) | unknown |

### Domain: wizardDevOptions.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/wizardDevOptions.ts` | dedicated | WizardDevOptionsBase | no | (none) | unknown |

### Domain: wizardStateFieldConfig.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/wizardStateFieldConfig.ts` | dedicated | WizardInstance, WizardStateField, WizardFieldConfig | no | (none) | unknown |

### Domain: wizardStepData.ts

| File | Location | Exports | Also runtime? | Purpose | Tier |
| --- | --- | --- | --- | --- | --- |
| `client/src/types/wizardStepData.ts` | dedicated | SummaryData, PriceData | no | (none) | unknown |

## Constants vs Configs Boundary

| Category | File | Const exports | Type exports | Factory fns |
| --- | --- | ---: | ---: | --- |
| constants | `client/src/constants/adminPrimitiveMetadataOptions.ts` | 4 | 0 | no |
| constants | `client/src/constants/apiStatus.ts` | 11 | 1 | no |
| constants | `client/src/constants/appointmentStatus.ts` | 2 | 0 | yes |
| constants | `client/src/constants/appointmentsTableConstants.ts` | 2 | 0 | no |
| constants | `client/src/constants/attendeeRoles.ts` | 0 | 0 | no |
| constants | `client/src/constants/availabilitySettings.ts` | 3 | 1 | no |
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
| configs | `client/src/configs/availabilitySettings/types.ts` | 2 | 3 | no |
| configs | `client/src/configs/businessControlsTabStrings.ts` | 1 | 0 | no |
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
| configs | `client/src/configs/wizardSteps.ts` | 1 | 1 | no |

## Inline Type Exports

### Unreviewed

- `client/src/composables/admin/injectionKeys.ts`: RuleFormDialogContext, InstancesTabContext (imported by 0 files)
- `client/src/composables/admin/useAdmin.ts`: UseAdminReturn (imported by 0 files)
- `client/src/composables/admin/useAdminMetadataMutations.ts`: UseAdminMetadataMutationsReturn (imported by 0 files)
- `client/src/composables/admin/useAdminPrimitiveMetadataMutations.ts`: UseAdminPrimitiveMetadataMutationsReturn (imported by 0 files)
- `client/src/composables/admin/useAdminRelationshipMetadataMutations.ts`: UseAdminRelationshipMetadataMutationsReturn (imported by 0 files)
- `client/src/composables/admin/useApiDevPanelVisibility.ts`: UseApiDevPanelVisibilityOptions (imported by 0 files)
- `client/src/composables/admin/useBaseCollectionField.ts`: UseBaseCollectionFieldReturn, CollectionFieldResolverContext, CollectionFieldConfig (imported by 0 files)
- `client/src/composables/admin/useBlockInstanceCreate.ts`: UseBlockInstanceCreateOptions (imported by 0 files)
- `client/src/composables/admin/useBooleanInputClick.ts`: UseBooleanInputClickParams (imported by 0 files)
- `client/src/composables/admin/useBusinessHoursFormState.ts`: UseBusinessHoursFormStateReturn (imported by 1 files)
- `client/src/composables/admin/useBusinessRuleForm.ts`: UseBusinessRuleFormReturn (imported by 0 files)
- `client/src/composables/admin/useBusinessRulesTab.ts`: UseBusinessRulesTabReturn (imported by 0 files)
- `client/src/composables/admin/useCalendarHoldFormState.ts`: UseCalendarHoldFormStateReturn (imported by 1 files)
- `client/src/composables/admin/useComponentDistributionConfirm.ts`: UseComponentDistributionConfirmOptions (imported by 0 files)
- `client/src/composables/admin/useEntityCardSubPanels.ts`: SubPanelFields, UseEntityCardSubPanelsOptions, UseEntityCardSubPanelsReturn (imported by 0 files)
- `client/src/composables/admin/useEntityMetadata.ts`: UseEntityMetadataReturn (imported by 0 files)
- `client/src/composables/admin/useFeePreview.ts`: UseFeePreviewOptions, UseFeePreviewReturn (imported by 0 files)
- `client/src/composables/admin/useFieldRendererErrorWatch.ts`: UseFieldRendererErrorWatchParams (imported by 0 files)
- `client/src/composables/admin/useFormFieldConfigs.ts`: UseFormFieldConfigsReturn (imported by 0 files)
- `client/src/composables/admin/useInstancesTabCreateModal.ts`: UseInstancesTabCreateModalReturn (imported by 0 files)
- `client/src/composables/admin/useMetadataEditModal.ts`: MetadataEditorSaveRef, UseMetadataEditModalOptions (imported by 0 files)
- `client/src/composables/admin/usePartsCollectionField.ts`: UsePartsCollectionFieldReturn (imported by 0 files)
- `client/src/composables/admin/usePrimitiveMetadataSave.ts`: UsePrimitiveMetadataSaveOptions (imported by 0 files)
- `client/src/composables/admin/usePropertyMappingsTab.ts`: PropertyFieldMappingRow, PropertyFeatureMappingRow (imported by 0 files)
- `client/src/composables/admin/useRelationshipCollectionField.ts`: UseRelationshipCollectionFieldReturn (imported by 0 files)
- `client/src/composables/admin/useSelectChipRender.ts`: UseSelectChipRenderReturn (imported by 0 files)
- `client/src/composables/admin/useSelectEnumOptions.ts`: UseSelectEnumOptionsReturn (imported by 0 files)
- `client/src/composables/admin/useShapeForm.ts`: ShapeFormEntityKey, ShapeFormData, BlockShapeFormData, PartShapeFormData (imported by 0 files)
- `client/src/composables/admin/useShapesTabModals.ts`: UseShapesTabModalsReturn (imported by 0 files)
- `client/src/composables/beta/useFeedbackSubmit.ts`: UseFeedbackSubmitOptions, UseFeedbackSubmitReturn (imported by 0 files)
- `client/src/composables/booking/injectionKeys.ts`: InstancesPanelContext, ContactsFormContext (imported by 0 files)
- `client/src/composables/booking/useAppointmentLoader.ts`: UseAppointmentLoaderReturn (imported by 0 files)
- `client/src/composables/booking/useSlotGridDisplay.ts`: UseSlotGridDisplayOptions (imported by 0 files)
- `client/src/composables/booking/useWizardNumberUpdate.ts`: UseWizardNumberUpdateReturn (imported by 0 files)
- `client/src/composables/entityCrud/useEntityCrud.ts`: UseEntityCrudReturn (imported by 0 files)
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
- `client/src/composables/useThemeMode.ts`: UseThemeModeReturn (imported by 0 files)
- `client/src/utils/admin/businessRulesApi.ts`: BusinessRulesQueryFilters (imported by 0 files)
- `client/src/utils/admin/calibrationChartTransforms.ts`:  (imported by 0 files)
- `client/src/utils/admin/entityCardTitleKeydown.ts`: EntityCardTitleKeydownReturn (imported by 0 files)
- `client/src/utils/admin/entityDisplay.ts`: EntityDisplayConfig, EntityDisplayReturn (imported by 0 files)
- `client/src/utils/admin/entityList.ts`: EntityListOptions, EntityListReturn (imported by 0 files)
- `client/src/utils/admin/entityListDelete.ts`: EntityListDeleteOptions (imported by 0 files)
- `client/src/utils/admin/inputConfigEditor.ts`: InputConfigFormData, InputConfigEditorOptions, InputConfigEditorReturn (imported by 0 files)
- `client/src/utils/admin/metadataFieldUpdates.ts`: MetadataFieldUpdatesOptions, MetadataFieldUpdatesReturn (imported by 0 files)
- `client/src/utils/admin/selectFilterStrategies.ts`: ValidChildrenKey (imported by 0 files)
- `client/src/utils/admin/selectOptionTransforms.ts`: GroupWithParent (imported by 0 files)
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
