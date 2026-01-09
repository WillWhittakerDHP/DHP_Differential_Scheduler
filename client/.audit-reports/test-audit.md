# Test Audit Report (Generated)

Generated at: 2026-01-09T15:45:46.603Z

## Summary

- **Total source files**: 418
- **Total test files**: 114
- **Untested source files**: 313
- **Orphaned test files**: 8
- **Coverage**: 25%

## Untested Source Files (Priority: High)

These files export functions/classes/composables but have no corresponding test file.
Files are sorted by **Priority Score** (weighted: Reliability 40%, ROI 30%, Independence 20%, Cognitive Load 10%).

| File | Priority | Reliability | ROI | Independence | Cognitive Load | Exports |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `src/composables/admin/useSelectFiltering.ts` | **6.3** | 8 | 5 | 6 | 4 | 2 |
| `src/composables/admin/useSelectHandlers.ts` | **6.2** | 7 | 5 | 7 | 5 | 2 |
| `src/composables/admin/useFieldCategorization.ts` | **6.1** | 7 | 5 | 8 | 2 | 2 |
| `src/composables/admin/useAnnotationDialogState.ts` | **5.9** | 7 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useFieldVisibility.ts` | **5.9** | 7 | 5 | 7 | 2 | 2 |
| `src/utils/renderLogger.ts` | **5.6** | 6 | 4 | 10 | 0 | 1 |
| `src/composables/admin/annotationAssignments/useAnnotationAssignmentsState.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |
| `src/composables/admin/useAnnotationSelect.ts` | **5.5** | 7 | 5 | 4 | 4 | 2 |
| `src/composables/admin/useEntityList.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |
| `src/utils/blockInstanceUtils.ts` | **5.5** | 4 | 9 | 5 | 2 | 10 |
| `src/composables/admin/useAnnotationDisplay.ts` | **5.3** | 7 | 5 | 5 | 0 | 2 |
| `src/composables/admin/usePartInstanceBulkEdit.ts` | **5.3** | 7 | 5 | 5 | 0 | 2 |
| `src/composables/admin/useInstanceGrouping.ts` | **5.2** | 5 | 5 | 8 | 1 | 2 |
| `src/composables/admin/usePartInstancesNestedSectionModel.ts` | **5.2** | 7 | 5 | 4 | 1 | 2 |
| `src/configs/adminConfig.ts` | **5.2** | 4 | 5 | 10 | 1 | 6 |
| `src/composables/admin/useBlockInstanceForm.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useEntityCardLayout.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useEntityDisplay.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useExpansionState.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useFieldTypeDetermination.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useIconPickerState.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useInstanceBulkEdit.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useInstanceDragAndDrop.ts` | **5.1** | 5 | 5 | 6 | 4 | 2 |
| `src/composables/admin/usePartInstanceForm.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useSelectFormAssociation.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/admin/useShapeDisplayNames.ts` | **5.1** | 5 | 5 | 8 | 0 | 2 |
| `src/composables/useTimeFormatting.ts` | **5.1** | 4 | 5 | 10 | 0 | 2 |
| `src/@core/utils/helpers.ts` | **5.0** | 3 | 6 | 10 | 0 | 5 |
| `src/composables/admin/useAnnotationMetadata.ts` | **5.0** | 5 | 5 | 7 | 1 | 2 |
| `src/composables/admin/annotationAssignments/useAnnotationAssignmentsActions.ts` | **4.9** | 5 | 5 | 4 | 6 | 2 |
| `src/composables/admin/useEntityCardActions.ts` | **4.9** | 5 | 5 | 7 | 0 | 2 |
| `src/composables/admin/useSelectFieldValue.ts` | **4.9** | 5 | 5 | 7 | 0 | 2 |
| `src/utils/admin/entityDisplayText.ts` | **4.9** | 2 | 7 | 10 | 0 | 3 |
| `src/composables/admin/useDragAndDrop.ts` | **4.8** | 5 | 5 | 6 | 1 | 2 |
| `src/utils/entities/sanitizeEntityAdminValues.ts` | **4.8** | 4 | 4 | 10 | 0 | 1 |
| `src/utils/optimistic/annotationAssignmentsOptimistic.ts` | **4.8** | 4 | 7 | 5 | 1 | 4 |
| `src/composables/useComponentDistribution.ts` | **4.7** | 4 | 5 | 7 | 2 | 2 |
| `src/@core/utils/formatters.ts` | **4.6** | 3 | 6 | 8 | 0 | 5 |
| `src/composables/admin/tables/usePropertiesTableModel.ts` | **4.6** | 5 | 5 | 5 | 1 | 2 |
| `src/composables/admin/tables/useUsersTableModel.ts` | **4.6** | 5 | 5 | 5 | 1 | 2 |
| `src/utils/instanceComponentUtils.ts` | **4.6** | 2 | 6 | 10 | 0 | 2 |
| `src/composables/admin/annotationAssignments/useAnnotationAssignmentsQuery.ts` | **4.5** | 5 | 5 | 5 | 0 | 2 |
| `src/composables/admin/tables/useAppointmentsTableModel.ts` | **4.5** | 5 | 5 | 4 | 2 | 2 |
| `src/composables/admin/useAnnotationAssignments.ts` | **4.5** | 5 | 5 | 5 | 0 | 2 |
| `src/composables/admin/useEntityStatus.ts` | **4.5** | 5 | 5 | 5 | 0 | 2 |
| `src/composables/admin/useFormElementPatching.ts` | **4.5** | 5 | 5 | 5 | 0 | 2 |
| `src/composables/usePartInstanceData.ts` | **4.5** | 4 | 5 | 7 | 0 | 2 |
| `src/utils/forms/fieldSectionCategorization.ts` | **4.5** | 4 | 4 | 7 | 3 | 1 |
| `src/utils/logger.ts` | **4.5** | 4 | 4 | 8 | 1 | 1 |
| `src/@core/utils/colorConverter.ts` | **4.4** | 3 | 4 | 10 | 0 | 2 |

## Orphaned Test Files (Priority: Medium)

These test files may not have corresponding source files, or the mapping failed.

| Test File | Quality Score |
| --- | ---: |
| `src/utils/__tests__/factories/appointmentFactory.ts` | 1 |
| `src/utils/__tests__/factories/entityFactory.ts` | 3 |
| `src/utils/__tests__/factories/globalDataFactory.ts` | 2 |
| `src/utils/__tests__/factories/relationshipFactory.ts` | 1 |
| `src/utils/__tests__/mocks/apiHandlers.ts` | 3 |
| `src/utils/__tests__/mocks/mockApiResponses.ts` | 3 |
| `src/utils/__tests__/setup.ts` | 4 |
| `src/utils/__tests__/testHelpers.ts` | 5 |

## Coverage by Directory

| Directory | Sources | Tests | Untested | Coverage % |
| --- | ---: | ---: | ---: | ---: |
| `src/utils/booking` | 17 | 17 | 0 | 100% |
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
| `src/components/admin` | 1 | 0 | 1 | 0% |
| `src/components/admin/component` | 1 | 0 | 1 | 0% |
| `src/components/admin/generic/collections` | 1 | 0 | 1 | 0% |
| `src/components/booking/types` | 1 | 0 | 1 | 0% |
| `src/composables/booking/selectionCard` | 8 | 7 | 1 | 88% |
| `src/navigation/horizontal` | 1 | 0 | 1 | 0% |
| `src/navigation/vertical` | 1 | 0 | 1 | 0% |
| `src/router` | 1 | 0 | 1 | 0% |
| `src/shims` | 1 | 0 | 1 | 0% |
| `src/types/admin` | 1 | 0 | 1 | 0% |
| `src/utils/admin` | 1 | 0 | 1 | 0% |
| `src/utils/env` | 1 | 0 | 1 | 0% |

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
