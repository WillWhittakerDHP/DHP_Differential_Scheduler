# Feature 3: Booking Calculations

**Feature:** Booking Calculations  
**Status:** Planning  
**Created:** 2025-02-01  
**Branch:** `feature/booking-calculations`

---

## Overview

Extract and implement fee and time calculation logic from React codebase. Create shared calculation composable for booking wizard and admin preview. This feature extracts the calculation logic that exists in the React codebase and implements it in Vue.js.

**Target:** Shared calculation composable that can be used by both booking wizard and admin preview panel.

---

## Phase 3.1: Extract Calculation Logic from React

**Status:** Not Started  
**Description:** Extract fee and time calculation logic from React codebase, understand the calculation formulas and edge cases.

### Objectives

- Review React calculation utilities
- Extract calculation logic and formulas
- Document calculation rules
- Identify edge cases and special handling

### Key Files

- `client/src/scheduler/utils/ProfileToFinalTimeUtils.ts` (React - extract)
- `client/src/scheduler/dataTransformation/appointmentTransformer.ts` (React - fee calculations commented)
- `client/src/scheduler/` (other calculation-related files)

### Success Criteria

- Calculation logic extracted and documented
- Calculation formulas documented
- Edge cases identified
- Special handling documented

---

## Phase 3.2: Create Shared Calculation Composable

**Status:** Not Started  
**Description:** Create shared calculation composable in Vue.js that implements the extracted calculation logic.

### Objectives

- Create `useBookingCalculator.ts` composable
- Implement price calculation (Base fees + Rate × sqft)
- Implement time calculation (Base time + Rate × sqft, rounded to nearest :15)
- Implement service applicability checking
- Return detailed breakdowns

### Key Files

- `client-vue/src/composables/useBookingCalculator.ts` (new)

### Calculation Functions

- `calculatePrice(service, property, options)` → Price breakdown
- `calculateTime(service, property, options)` → Time breakdown
- `checkApplicability(service, property)` → Applicability result with reasons
- `getBusinessLogicIndicators(calculation)` → Warnings/suggestions

### Success Criteria

- `useBookingCalculator` composable created
- Price calculation working correctly
- Time calculation working correctly
- Applicability checking working correctly
- Detailed breakdowns returned
- Performance: < 50ms per calculation

---

## Phase 3.3: Integrate into Booking Wizard

**Status:** Not Started  
**Description:** Integrate calculation composable into booking wizard to show pricing and time estimates.

### Objectives

- Integrate `useBookingCalculator` into booking wizard
- Display price breakdown in wizard steps
- Display time breakdown in wizard steps
- Show applicability warnings
- Update calculations reactively as selections change

### Key Files

- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/components/booking/steps/ConfirmationStep.vue`
- `client-vue/src/composables/useBookingWizard.ts`

### Success Criteria

- Price breakdown displayed in wizard
- Time breakdown displayed in wizard
- Applicability warnings shown
- Calculations update reactively
- All edge cases handled correctly

---

## Phase 3.4: Add Calculation Tests

**Status:** Not Started  
**Description:** Add comprehensive unit tests for calculation logic to ensure accuracy.

### Objectives

- Create unit tests for price calculation
- Create unit tests for time calculation
- Create unit tests for applicability checking
- Test edge cases and special handling
- Ensure calculations match React version exactly

### Key Files

- `client-vue/src/composables/__tests__/useBookingCalculator.test.ts` (new)

### Success Criteria

- Unit tests for all calculation functions
- Edge cases tested
- Special handling tested
- Calculations match React version exactly
- Test coverage > 80%

---

## Reference Documents

- **Admin UI Overhaul**: `project-manager/features/admin-ui-overhaul/feature-plan.md` (Phase 2.1: Booking Calculation Engine)
- **React Calculation Utils**: `client/src/scheduler/utils/ProfileToFinalTimeUtils.ts`
- **React Fee Calculations**: `client/src/scheduler/dataTransformation/appointmentTransformer.ts`

---

## Dependencies

- Feature 0: Vue.js Migration (Core Complete)
- Feature 1: Data Flow Alignment (recommended for proper data flow)

---

## Success Metrics

- Calculation logic extracted and documented
- Shared calculation composable created and working
- Calculations integrated into booking wizard
- Comprehensive test coverage
- Performance: < 50ms per calculation
- Calculations match React version exactly

---

**Last Updated:** 2025-02-01  
**Status:** Planning - Ready for Implementation

