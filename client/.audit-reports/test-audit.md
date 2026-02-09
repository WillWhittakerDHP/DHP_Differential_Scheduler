# Test Audit Report (Generated)

Generated at: 2026-02-08T23:31:49.217Z

## Summary

- **Total source files**: 701
- **Total test files**: 127
- **Untested source files**: 585
- **Orphaned test files**: 10
- **Coverage**: 17%

## Untested Source Files (Priority: High)

These files export functions/classes/composables but have no corresponding test file.
Files are sorted by **Priority Score** (weighted: Reliability 40%, ROI 30%, Independence 20%, Cognitive Load 10%).

| File | Priority | Reliability | ROI | Independence | Cognitive Load | Exports |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `client/src/composables/booking/useAvailabilityStepHandlers.ts` | **8.1** | 10 | 7 | 10 | 0 | 2 |
| `client/src/composables/booking/useAvailabilityDevPanel.ts` | **8.0** | 10 | 8 | 8 | 0 | 4 |
| `client/src/composables/booking/useAvailabilityEmptyState.ts` | **7.7** | 10 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/useTimeBasisHandler.ts` | **7.7** | 9 | 7 | 10 | 0 | 2 |
| `client/src/utils/booking/partFinalizer.ts` | **7.7** | 9 | 9 | 5 | 4 | 4 |
| `client/src/composables/booking/useAppointmentSlots.ts` | **7.5** | 10 | 7 | 6 | 2 | 2 |
| `client/src/composables/booking/useAppointmentTimes.ts` | **7.5** | 10 | 7 | 7 | 0 | 2 |
| `client/src/composables/booking/useDevPanelsComputed.ts` | **7.5** | 10 | 7 | 7 | 0 | 2 |
| `client/src/utils/booking/partShapeAggregator.ts` | **7.4** | 7 | 10 | 8 | 0 | 5 |
| `client/src/composables/booking/useDurationRounding.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/useTimeSlotDurations.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/useWizardStepDataRefs.ts` | **7.3** | 9 | 7 | 8 | 0 | 2 |
| `client/src/composables/admin/useAvailabilitySettings.ts` | **7.1** | 10 | 6 | 5 | 3 | 3 |
| `client/src/composables/booking/useAppointmentDuration.ts` | **7.1** | 9 | 7 | 7 | 0 | 2 |
| `client/src/composables/booking/useAvailableStartTimes.ts` | **7.1** | 10 | 7 | 3 | 4 | 2 |
| `client/src/composables/admin/useCalendarEntries.ts` | **6.9** | 9 | 5 | 8 | 2 | 2 |
| `client/src/composables/booking/dev/usePanelPosition.ts` | **6.9** | 9 | 7 | 6 | 0 | 2 |
| `client/src/composables/booking/useComputedAvailability.ts` | **6.9** | 10 | 7 | 4 | 0 | 2 |
| `client/src/utils/booking/appointmentTimeCalculations.ts` | **6.9** | 7 | 9 | 7 | 0 | 3 |
| `client/src/composables/booking/useWizardDevMode.ts` | **6.7** | 9 | 7 | 5 | 0 | 2 |
| `client/src/composables/booking/useApiCallStatus.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/useAvailabilitySlotColor.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/useDateRangeDecider.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/useDynamicGridConfig.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/useMockCalendarRefresh.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `client/src/composables/booking/usePerspectiveMapping.ts` | **6.5** | 7 | 7 | 8 | 0 | 2 |
| `client/src/utils/booking/blockFinalizer.ts` | **6.4** | 5 | 8 | 10 | 0 | 2 |
| `client/src/composables/admin/tables/useAppointmentHelpers.ts` | **6.3** | 7 | 5 | 10 | 0 | 2 |
| `client/src/composables/admin/useInstanceFiltering.ts` | **6.3** | 8 | 5 | 8 | 0 | 2 |
| `client/src/composables/admin/usePartInstanceCollection.ts` | **6.3** | 10 | 5 | 4 | 0 | 2 |
| `client/src/composables/admin/useSelectFiltering.ts` | **6.3** | 8 | 5 | 6 | 4 | 2 |
| `client/src/composables/admin/useAttendeeQuickSelect.ts` | **6.1** | 9 | 5 | 5 | 0 | 2 |
| `client/src/composables/booking/useElementDimensions.ts` | **6.1** | 7 | 7 | 6 | 0 | 2 |
| `client/src/composables/admin/usePartInstanceBulkEdit.ts` | **6.0** | 7 | 5 | 8 | 1 | 2 |
| `client/src/composables/admin/useEntityCardSaveState.ts` | **5.9** | 7 | 5 | 8 | 0 | 2 |
| `client/src/composables/admin/useSelectDomTargets.ts` | **5.9** | 7 | 5 | 8 | 0 | 2 |
| `client/src/composables/booking/useAppointmentDropdown.ts` | **5.9** | 7 | 7 | 5 | 0 | 2 |
| `client/src/composables/booking/useAppointmentLoader.ts` | **5.9** | 7 | 7 | 5 | 0 | 2 |
| `client/src/utils/booking/BlockFinal.ts` | **5.8** | 6 | 6 | 8 | 0 | 1 |
| `client/src/utils/booking/PartFinal.ts` | **5.8** | 6 | 6 | 8 | 0 | 1 |
| `client/src/utils/booking/partsTotals.ts` | **5.8** | 5 | 6 | 10 | 0 | 1 |
| `client/src/composables/admin/useAdminRelationshipMetadataMutations.ts` | **5.7** | 7 | 5 | 7 | 0 | 2 |
| `client/src/composables/admin/useBusinessRules.ts` | **5.7** | 7 | 5 | 5 | 4 | 2 |
| `client/src/composables/admin/useMetadataCache.ts` | **5.7** | 7 | 6 | 5 | 1 | 3 |
| `client/src/utils/ternary/ternaryUtils.ts` | **5.7** | 4 | 7 | 10 | 0 | 3 |
| `client/src/utils/booking/dateRangeValidation.ts` | **5.6** | 3 | 8 | 10 | 0 | 2 |
| `server/src/utils/propertyTransformers.ts` | **5.6** | 6 | 4 | 10 | 0 | 1 |
| `client/src/composables/admin/useAdminPrimitiveMetadataMutations.ts` | **5.5** | 7 | 5 | 6 | 0 | 2 |
| `client/src/composables/admin/useEntityList.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |
| `client/src/composables/admin/useFieldMetadataUpdate.ts` | **5.5** | 5 | 5 | 10 | 0 | 2 |

## Orphaned Test Files (Priority: Medium)

These test files may not have corresponding source files, or the mapping failed.

| Test File | Quality Score |
| --- | ---: |
| `client/src/composables/__tests__/useFieldMetadata.test.ts` | 6 |
| `client/src/utils/__tests__/factories/appointmentFactory.ts` | 0 |
| `client/src/utils/__tests__/factories/entityFactory.ts` | 2 |
| `client/src/utils/__tests__/factories/globalDataFactory.ts` | 2 |
| `client/src/utils/__tests__/factories/relationshipFactory.ts` | 0 |
| `client/src/utils/__tests__/mocks/apiHandlers.ts` | 2 |
| `client/src/utils/__tests__/mocks/mockApiResponses.ts` | 2 |
| `client/src/utils/__tests__/setup.ts` | 4 |
| `client/src/utils/__tests__/testHelpers.ts` | 5 |
| `client/src/utils/booking/__tests__/testDateHelpers.ts` | 3 |

## Coverage by Directory

| Directory | Sources | Tests | Untested | Coverage % |
| --- | ---: | ---: | ---: | ---: |
| `client/src/utils/time` | 1 | 1 | 0 | 100% |
| `server/src/routes/internal/appointments` | 1 | 1 | 0 | 100% |
| `server/src/routes/internal/entities` | 1 | 1 | 0 | 100% |
| `server/src/routes/internal/properties` | 1 | 1 | 0 | 100% |
| `server/src/routes/internal/relationships` | 1 | 1 | 0 | 100% |
| `server/src/routes/internal/users` | 1 | 1 | 0 | 100% |
| `client/src/@core/utils/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/composables/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/composables/booking/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/composables/booking/selectionCard/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/utils/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/utils/__tests__/factories` | 0 | 0 | 0 | 100% |
| `client/src/utils/__tests__/mocks` | 0 | 0 | 0 | 100% |
| `client/src/utils/booking/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/utils/forms/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/utils/time/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/utils/transformers/__tests__` | 0 | 0 | 0 | 100% |
| `server/src/middlewares/__tests__` | 0 | 0 | 0 | 100% |
| `server/src/routes/internal/appointments/__tests__` | 0 | 0 | 0 | 100% |
| `server/src/routes/internal/entities/__tests__` | 0 | 0 | 0 | 100% |
| `server/src/routes/internal/properties/__tests__` | 0 | 0 | 0 | 100% |
| `server/src/routes/internal/relationships/__tests__` | 0 | 0 | 0 | 100% |
| `server/src/routes/internal/users/__tests__` | 0 | 0 | 0 | 100% |
| `server/src/services/__tests__` | 0 | 0 | 0 | 100% |
| `client/src/@core/libs/apex-chart` | 1 | 0 | 1 | 0% |
| `client/src/@core/libs/chartjs` | 1 | 0 | 1 | 0% |
| `client/src/@core/stores` | 1 | 0 | 1 | 0% |
| `client/src/@layouts/plugins` | 1 | 0 | 1 | 0% |
| `client/src/@layouts/stores` | 1 | 0 | 1 | 0% |
| `client/src/components/admin/component` | 1 | 0 | 1 | 0% |

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
