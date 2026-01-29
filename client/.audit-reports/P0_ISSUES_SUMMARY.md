# P0 Issues Summary

Generated from full audit run on 2026-01-28

## Overview

This document summarizes all **P0 (Priority 0 - Critical)** issues found across all audit categories. P0 issues represent the highest priority items that should be addressed first.

---

## 1. Typecheck Audit (35 errors requiring review)

**Status**: All errors are P1 (not P0), but still critical for type safety

### Top Files with Type Errors:
- `src/composables/booking/useAvailabilityStepHandlers.ts` - **4 errors**
- `src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` - **3 errors**
- `src/utils/entityDefaults.ts` - **3 errors**
- `src/views/admin/tabs/InstancesTab.vue` - **3 errors**

**Key Error Types**:
- Type assignment mismatches (TS2322)
- Property access on wrong types (TS2339)
- Argument type mismatches (TS2345)
- Type conversion issues (TS2352, TS2353)

**Action**: Review detailed errors in `.audit-reports/typecheck/typecheck-audit.md`

---

## 2. Loop Mutations Audit (936 findings requiring review)

**Top P0 Files** (highest mutation scores):

| File | Score | forEach | for-loops | mutators | assigns |
|------|-------|---------|-----------|----------|---------|
| `src/utils/booking/timeAvailabilityManager.ts` | **70** | 4 | 12 | 7 | 21 |
| `src/utils/transformers/fetchToGlobalTransformer.ts` | **62** | 0 | 14 | 1 | 23 |
| `src/views/admin/tabs/ShapesTab.vue` | **48** | 0 | 0 | 0 | 24 |
| `src/utils/transformers/relationshipTransformers.ts` | **46** | 4 | 4 | 2 | 17 |
| `src/main.ts` | **44** | 4 | 0 | 0 | 4 |

**Critical Pattern**: `main.ts` has 4 `forEach→mutation` hits - these should be converted to functional patterns (map/reduce/filter).

**Action**: Refactor loops to use functional approaches (map, reduce, filter) instead of mutations. See workspace rule: `functional-mutations.mdc`

---

## 3. Hardcoding Audit (579 findings requiring review)

**Top P0 Files** (most hardcoded entity keys):

| File | Score | switch(entityKey) | case | field===string |
|------|-------|-------------------|------|----------------|
| `src/utils/forms/fieldLocationDispatcher.ts` | **44** | 0 | **11** | 0 |
| `src/views/admin/tabs/BusinessControlsTab.vue` | **42** | 0 | 0 | 0 |
| `src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` | **31** | 0 | 0 | 0 |
| `src/utils/booking/timeAvailabilityManager.ts` | **25** | 0 | **6** | 0 |

**Critical Issue**: `fieldLocationDispatcher.ts` has 11 hardcoded `case` statements for entity keys. These should use dynamic/config-driven approaches.

**Action**: Replace hardcoded entity keys with runtime configuration from `ENTITY_CONFIGS`. See workspace rule: `generic-type-guidance.mdc`

---

## 4. Duplication Audit (24 groups)

**P0 Duplication Groups** - All involve code duplication between 2 files:

### Critical Duplications:

1. **Annotation Assignments** (13 groups):
   - `useAnnotationAssignmentsActions.ts` ↔ `useAnnotationAssignmentsOrchestration.ts`
   - **Pattern**: Multiple duplicated function implementations

2. **Availability Settings** (5 groups):
   - `useAvailabilitySettings.ts` ↔ `availabilitySettings.ts`
   - **Pattern**: Config logic duplicated in composable

3. **Wizard Management** (1 group):
   - `useWizardAppointmentManagement.ts` ↔ `useWizardStepDataRefs.ts`

**Action**: Extract shared logic into reusable utilities. See workspace rule: `component-and-logic-reusability.mdc`

---

## 5. Test Coverage Audit (19% coverage)

**P0 Untested Files** (highest priority for testing):

| File | Priority Score | Reliability | ROI | Exports |
|------|----------------|-------------|-----|---------|
| `src/utils/booking/appointmentSlotBuilder.ts` | **8.2** | 8 | 10 | 10 |
| `src/utils/booking/constraintExtractors.ts` | **8.1** | 7 | 10 | 6 |
| `src/composables/booking/useAppointmentSlots.ts` | **7.8** | 10 | 7 | 2 |
| `src/composables/booking/useWizardValidationErrors.ts` | **7.8** | 9 | 7 | 2 |
| `src/utils/transformers/fetchToBusinessTransformer.ts` | **7.8** | 10 | 8 | 1 |

**Critical Gap**: 430 files are untested. Focus on utilities and composables with high export counts and reliability scores.

**Action**: Add unit tests for pure functions and integration tests for composables. See workspace rule: `testing-size.mdc`

---

## 6. Composables Logic Audit

**P0 File**:

| File | Score | vue-query | async | await |
|------|-------|-----------|-------|-------|
| `src/composables/entityCrud/useEntityCrudMutations.ts` | **38** | 7 | 15 | 10 |

**Issue**: High async/await usage suggests complex mutation logic that may need refactoring.

**Action**: Review for potential simplification and error handling improvements.

---

## 7. Component Logic Audit

**P0 File**:

| File | Score | computed | ref | watch |
|------|-------|----------|-----|-------|
| `src/components/admin/generic/EntityCard.vue` | **25** | **19** | 0 | 1 |

**Issue**: 19 computed properties in a single component suggests potential for extraction into composables.

**Action**: Consider extracting computed logic into composables for better reusability and testability.

---

## 8. Unused Code Audit (456 issues)

**Top P0 Files** (highest unused code scores):

| File | Score | Issues |
|------|-------|--------|
| `src/configs/availabilitySettings.ts` | **21** | 7 |
| `src/configs/adminConfig.ts` | **18** | 6 |
| `src/composables/booking/useAvailabilityLogic.ts` | **15** | 5 |
| `src/composables/booking/useBlockInstanceSelection.ts` | **15** | 5 |
| `src/types/appointment.ts` | **15** | 5 |

**Action**: Review and remove unused exports, functions, and commented-out code. Clean up abandoned code.

---

## 9. Fallback Audit (13 issues)

**P0 File**:
- `.cursor/commands/tiers/session/composite/session-end.ts` - **score: 6**

**Issue**: Contains fallback patterns that should be replaced with explicit error handling.

**Action**: Replace silent fallbacks with explicit error handling. See workspace rule: `explicit-error-handling.mdc`

---

## Recommended Action Plan

### Phase 1: Critical Type Safety (Week 1)
1. Fix typecheck errors in top 4 files
2. Focus on `useAvailabilityStepHandlers.ts` (4 errors)

### Phase 2: Functional Refactoring (Week 2)
1. Refactor `timeAvailabilityManager.ts` (70 mutation score)
2. Refactor `fetchToGlobalTransformer.ts` (62 mutation score)
3. Fix `main.ts` forEach→mutation patterns

### Phase 3: Hardcoding Removal (Week 3)
1. Replace hardcoded cases in `fieldLocationDispatcher.ts` (11 cases)
2. Refactor `BusinessControlsTab.vue` (42 hardcoding score)

### Phase 4: Duplication Elimination (Week 4)
1. Extract shared logic from annotation assignments files
2. Consolidate availability settings logic

### Phase 5: Test Coverage (Ongoing)
1. Add tests for top 5 untested files
2. Target 30% coverage by end of month

---

## Files to Review First

1. `src/composables/booking/useAvailabilityStepHandlers.ts` - Type errors
2. `src/utils/booking/timeAvailabilityManager.ts` - Loop mutations + hardcoding
3. `src/utils/forms/fieldLocationDispatcher.ts` - Hardcoding
4. `src/composables/admin/annotationAssignments/useAnnotationAssignmentsActions.ts` - Duplication
5. `src/utils/booking/appointmentSlotBuilder.ts` - Missing tests

---

## Notes

- All audit reports are available in `.audit-reports/` directory
- Detailed line-level issues are in the `.md` files for each audit
- JSON files contain machine-readable data for tooling
- Summary files provide quick overviews by priority

**Last Updated**: 2026-01-28
