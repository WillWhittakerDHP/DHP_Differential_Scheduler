# Test Audit Report (Generated)

Generated at: 2026-01-29T17:02:06.956Z

## Summary

- **Total source files**: 551
- **Total test files**: 122
- **Untested source files**: 441
- **Orphaned test files**: 11
- **Coverage**: 20%

## Untested Source Files (Priority: High)

These files export functions/classes/composables but have no corresponding test file.
Files are sorted by **Priority Score** (weighted: Reliability 40%, ROI 30%, Independence 20%, Cognitive Load 10%).

| File | Priority | Reliability | ROI | Independence | Cognitive Load | Exports |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `src/composables/booking/useAppointmentSlots.ts` | **7.8** | 10 | 7 | 8 | 1 | 2 |
| `src/composables/booking/useAppointmentDuration.ts` | **7.7** | 10 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useAvailabilityEmptyState.ts` | **7.7** | 10 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useAvailabilityStepHandlers.ts` | **7.7** | 10 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useTimeBasisHandler.ts` | **7.7** | 9 | 7 | 10 | 0 | 2 |
| `src/utils/booking/appointmentTimeCalculations.ts` | **7.7** | 7 | 9 | 10 | 2 | 3 |
| `src/composables/booking/useAppointmentTimes.ts` | **7.5** | 9 | 7 | 8 | 2 | 2 |
| `src/composables/booking/useAvailabilityDevPanel.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useBusyTimes.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useMockCalendarRefresh.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useTimeSlotDurations.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useWizardStepDataRefs.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useAvailableStartTimes.ts` | **7.1** | 10 | 7 | 4 | 2 | 2 |
| `src/composables/admin/useAvailabilitySettings.ts` | **7.0** | 10 | 6 | 5 | 2 | 3 |
| `src/composables/booking/dev/usePanelPosition.ts` | **7.0** | 9 | 7 | 6 | 1 | 2 |
| `src/composables/booking/useWizardDevMode.ts` | **6.7** | 9 | 7 | 5 | 0 | 2 |
| `src/composables/booking/useAvailabilitySlotColor.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `src/composables/booking/useDynamicGridConfig.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `src/composables/booking/usePerspectiveMapping.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `src/composables/admin/annotationAssignments/useAnnotationAssignmentsState.ts` | **6.3** | 7 | 5 | 10 | 0 | 2 |
| `src/composables/admin/tables/useAppointmentHelpers.ts` | **6.3** | 7 | 5 | 10 | 0 | 2 |
| `src/composables/admin/useInstanceFiltering.ts` | **6.3** | 8 | 5 | 8 | 0 | 2 |
| `src/composables/admin/usePartInstanceCollection.ts` | **6.3** | 10 | 5 | 4 | 0 | 2 |
| `src/composables/admin/useSelectFiltering.ts` | **6.3** | 8 | 5 | 6 | 4 | 2 |
| `src/composables/admin/useSelectHandlers.ts` | **6.2** | 7 | 5 | 7 | 5 | 2 |
| `src/utils/blockInstanceUtils.ts` | **6.2** | 5 | 9 | 5 | 5 | 11 |
| `src/composables/booking/useElementDimensions.ts` | **6.1** | 7 | 7 | 6 | 0 | 2 |
| `src/composables/admin/useAnnotationDialogState.ts` | **5.9** | 7 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useEntityCardSaveState.ts` | **5.9** | 7 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useSelectDomTargets.ts` | **5.9** | 7 | 5 | 8 | 0 | 2 |
| `src/composables/booking/useAppointmentDropdown.ts` | **5.9** | 7 | 7 | 5 | 0 | 2 |
| `src/composables/booking/useAppointmentLoader.ts` | **5.9** | 7 | 7 | 5 | 0 | 2 |
| `src/composables/admin/useMetadataCache.ts` | **5.8** | 7 | 6 | 5 | 2 | 3 |
| `src/composables/admin/annotationAssignments/useAnnotationAssignmentsOrchestration.ts` | **5.7** | 7 | 5 | 5 | 4 | 2 |
| `src/composables/admin/useAdminRelationshipMetadataMutations.ts` | **5.7** | 7 | 5 | 7 | 0 | 2 |
| `src/composables/admin/annotationAssignments/useAnnotationAssignmentsMutations.ts` | **5.6** | 7 | 5 | 4 | 5 | 2 |
| `src/composables/admin/useAdminPrimitiveMetadataMutations.ts` | **5.6** | 7 | 5 | 6 | 1 | 2 |
| `src/composables/admin/useFieldMetadataUpdate.ts` | **5.6** | 5 | 5 | 10 | 1 | 2 |
| `src/utils/booking/dateRangeValidation.ts` | **5.6** | 3 | 8 | 10 | 0 | 2 |
| `src/composables/admin/useEntityList.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |
| `src/composables/admin/useInstanceSaveHandlers.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |
| `src/composables/admin/useInstanceTabHandlers.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |
| `src/composables/admin/useShapeSaveHandlers.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |
| `src/utils/booking/partShapeTimeSlotMapping.ts` | **5.5** | 2 | 9 | 10 | 0 | 3 |
| `src/composables/admin/usePartInstanceBulkEdit.ts` | **5.4** | 7 | 5 | 5 | 1 | 2 |
| `src/composables/admin/useAnnotationDisplay.ts` | **5.3** | 7 | 5 | 5 | 0 | 2 |
| `src/composables/admin/useAnnotationSelect.ts` | **5.3** | 7 | 5 | 3 | 4 | 2 |
| `src/composables/admin/useDragAndDropHelpers.ts` | **5.3** | 5 | 7 | 6 | 0 | 5 |
| `src/composables/admin/useFieldInputSetup.ts` | **5.3** | 5 | 5 | 9 | 0 | 2 |
| `src/composables/admin/useInputConfigEditor.ts` | **5.2** | 5 | 5 | 8 | 1 | 2 |

## Orphaned Test Files (Priority: Medium)

These test files may not have corresponding source files, or the mapping failed.

| Test File | Quality Score |
| --- | ---: |
| `src/composables/__tests__/useAnnotationType.test.ts` | 6 |
| `src/composables/__tests__/useFieldMetadata.test.ts` | 6 |
| `src/utils/__tests__/factories/appointmentFactory.ts` | 1 |
| `src/utils/__tests__/factories/entityFactory.ts` | 3 |
| `src/utils/__tests__/factories/globalDataFactory.ts` | 2 |
| `src/utils/__tests__/factories/relationshipFactory.ts` | 1 |
| `src/utils/__tests__/mocks/apiHandlers.ts` | 3 |
| `src/utils/__tests__/mocks/mockApiResponses.ts` | 3 |
| `src/utils/__tests__/setup.ts` | 4 |
| `src/utils/__tests__/testHelpers.ts` | 5 |
| `src/utils/booking/__tests__/testDateHelpers.ts` | 3 |

## Coverage by Directory

| Directory | Sources | Tests | Untested | Coverage % |
| --- | ---: | ---: | ---: | ---: |
| `src/utils/time` | 1 | 1 | 0 | 100% |
| `src/@core/utils/__tests__` | 0 | 0 | 0 | 100% |
| `src/composables/__tests__` | 0 | 0 | 0 | 100% |
| `src/composables/booking/__tests__` | 0 | 0 | 0 | 100% |
| `src/composables/booking/selectionCard/__tests__` | 0 | 0 | 0 | 100% |
| `src/utils/__tests__` | 0 | 0 | 0 | 100% |
| `src/utils/__tests__/factories` | 0 | 0 | 0 | 100% |
| `src/utils/__tests__/mocks` | 0 | 0 | 0 | 100% |
| `src/utils/booking/__tests__` | 0 | 0 | 0 | 100% |
| `src/utils/forms/__tests__` | 0 | 0 | 0 | 100% |
| `src/utils/time/__tests__` | 0 | 0 | 0 | 100% |
| `src/utils/transformers/__tests__` | 0 | 0 | 0 | 100% |
| `src/@core/libs/apex-chart` | 1 | 0 | 1 | 0% |
| `src/@core/libs/chartjs` | 1 | 0 | 1 | 0% |
| `src/@core/stores` | 1 | 0 | 1 | 0% |
| `src/@layouts/plugins` | 1 | 0 | 1 | 0% |
| `src/@layouts/stores` | 1 | 0 | 1 | 0% |
| `src/components/admin/component` | 1 | 0 | 1 | 0% |
| `src/components/admin/generic/collections` | 1 | 0 | 1 | 0% |
| `src/components/admin/metadata` | 1 | 0 | 1 | 0% |
| `src/components/booking/types` | 1 | 0 | 1 | 0% |
| `src/composables/_archived` | 1 | 0 | 1 | 0% |
| `src/composables/booking/dev` | 1 | 0 | 1 | 0% |
| `src/composables/booking/selectionCard` | 8 | 7 | 1 | 88% |
| `src/composables/dataCollections` | 1 | 0 | 1 | 0% |
| `src/configs/field/form` | 1 | 0 | 1 | 0% |
| `src/navigation/horizontal` | 1 | 0 | 1 | 0% |
| `src/navigation/vertical` | 1 | 0 | 1 | 0% |
| `src/plugins/4.layouts` | 1 | 0 | 1 | 0% |
| `src/router` | 1 | 0 | 1 | 0% |

## Recommendations

### 1. High Priority: Test Critical Business Logic

Focus on testing files with high **Priority Scores** (sorted above).

**Priority Scoring Breakdown:**
- **Reliability** (0-10): Criticality for system stability. Higher = more critical.
  - Booking logic, transformers, calculations, validators score highest
- **ROI** (0-10): Return on investment from testing. Higher = more value.
  - More exports, reusable utilities, business logic score higher
- **Independence** (0-10): How isolated/testable the code is. Higher = easier to test.
  - Pure functions, fewer dependencies score higher
- **Cognitive Load** (0-10): Code complexity. Higher = more complex, needs tests.
  - More lines, more complexity indicators, less documentation = higher

**Overall Priority** = (Reliability × 0.4) + (ROI × 0.3) + (Independence × 0.2) + (Cognitive Load × 0.1)

Focus on testing:
- Transformers (data transformation logic) - High Reliability + ROI
- Composables with complex state management - High Cognitive Load
- Utility functions used across the codebase - High ROI
- Booking/scheduling logic - High Reliability

### 2. Test Quality Guidelines

When writing/updating tests, ensure they:
- Test **behaviors**, not just existence
- Include edge cases (null, undefined, empty, invalid inputs)
- Test error handling and error states
- Use proper setup/teardown (beforeEach, afterEach)
- Mock external dependencies appropriately

### 3. Test Structure

Follow this pattern:
```typescript
describe("FunctionName", () => {
  describe("behavior description", () => {
    it("should do X when Y", () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```
