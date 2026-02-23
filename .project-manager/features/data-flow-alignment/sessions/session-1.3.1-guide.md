# Session 1.3.1 Guide: Wizard State Management Refactoring

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.1 - Wizard State Management Refactoring  
**Status:** Not Started  
**Priority:** High (Foundation for other sessions)  
**Created:** 2025-12-28

---

## Session Overview

**Session Number:** 1.3.1  
**Session Name:** Wizard State Management Refactoring  
**Description:** Refactor wizard state management to move user type and quote mode to wizard-level state, improving data access and state consistency.

**Dependencies:** Phase 1.2 (Booking Wizard Data Flow Fixes) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand current wizard state architecture
- Understand Vue 3 Composition API state management patterns
- Understand provide/inject pattern for sharing state
- Understand form vs state architecture trade-offs

**During Session:**
- Learn how to refactor state management in Vue 3
- Learn best practices for wizard state management
- Learn how to make state accessible across components

**After Session:**
- Understand wizard-level vs step-level state patterns
- Understand when to use wizard-level vs step-level state
- Understand form vs state architecture decision rationale

---

## Objectives

- Move user type selection to wizard-level state (currently step-level)
- Add wizard-level `isQuoteMode` state (connected to "I only want a quote" button)
- Evaluate form vs state architecture patterns
- Ensure state persists across all wizard steps
- Improve annotation set access with wizard-level user type

---

## Tasks

### Task 1: Evaluate Current State Architecture

**Goal:** Understand current wizard state management structure and identify what needs to change.

**Steps:**
1. Read `client-vue/src/composables/useBookingWizard.ts` to understand current state structure
2. Read `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` to see how user type is currently stored
3. Read `client-vue/src/components/booking/BookingWizard.vue` to see how state is accessed
4. Document current state flow:
   - Where is user type currently stored?
   - Where is quote mode currently stored?
   - How is state accessed across components?
   - What are the current data access patterns?

**Key Files:**
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/BookingWizard.vue`

**Checkpoint:** Document current state architecture in session notes.

---

### Task 2: Research Form vs State Architecture

**Goal:** Research best practices and make informed decision about form vs state architecture.

**Steps:**
1. Research how other schedulers handle appointment data before booking
   - Look at common scheduling/booking patterns
   - Consider multi-step form patterns
2. Evaluate form parallel to UI vs context/state vs both patterns:
   - **Form parallel to UI:** Form data mirrors UI state exactly
   - **Context/State:** Centralized state, UI reads from state
   - **Both:** Hybrid approach
3. Consider Vue.js best practices:
   - Composition API patterns
   - Provide/inject for sharing state
   - Pinia store for complex state
4. Document decision and rationale:
   - Which pattern chosen?
   - Why this pattern?
   - Trade-offs considered?

**Checkpoint:** Document form vs state architecture decision in session notes.

---

### Task 3: Refactor User Type to Wizard-Level State

**Goal:** Move user type selection from step-level to wizard-level state.

**Steps:**
1. **Update `useBookingWizard.ts`:**
   - Add `selectedUserType` to wizard-level state (reactive ref)
   - Add `setSelectedUserType(userTypeId)` method
   - Ensure state is exported and accessible

2. **Update `ServiceSelectionStep.vue`:**
   - Remove local user type state (if exists)
   - Use wizard-level user type from `useBookingWizard`
   - Update user type selection handler to use wizard-level setter
   - Ensure user type selection updates wizard-level state

3. **Update `BookingWizard.vue`:**
   - Ensure wizard-level state is provided to child components
   - Update any components that access user type to use wizard-level state
   - Ensure user type persists across navigation

4. **Update Annotation Set Access:**
   - Review where annotation sets are accessed
   - Update to use wizard-level user type
   - Ensure annotation sets update when user type changes

5. **Add TypeScript Types:**
   - Create or update `client-vue/src/types/wizard.ts`
   - Add type for `selectedUserType`
   - Ensure types are used throughout

**Key Files:**
- `client-vue/src/composables/useBookingWizard.ts` - Add wizard-level user type
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` - Use wizard-level user type
- `client-vue/src/components/booking/BookingWizard.vue` - Provide wizard-level state
- `client-vue/src/types/wizard.ts` - Add TypeScript types (create if needed)

**Checkpoint:** Verify user type is stored at wizard level and accessible from all steps.

---

### Task 4: Add Wizard-Level Quote Mode State

**Goal:** Add wizard-level `isQuoteMode` state connected to "I only want a quote" button.

**Steps:**
1. **Update `useBookingWizard.ts`:**
   - Add `isQuoteMode` to wizard-level state (reactive ref)
   - Add `setQuoteMode(isQuote: boolean)` method
   - Ensure state is exported and accessible

2. **Update `ServiceSelectionStep.vue`:**
   - Connect "I only want a quote" checkbox to wizard-level `isQuoteMode`
   - Remove local quote mode state (if exists)
   - Update checkbox handler to use wizard-level setter

3. **Update `BookingWizard.vue`:**
   - Ensure wizard-level quote mode is provided to child components
   - Update `collectAppointmentData()` to use wizard-level quote mode
   - Ensure quote mode persists across navigation

4. **Update Appointment Creation:**
   - Review `collectAppointmentData()` function
   - Ensure it uses wizard-level `isQuoteMode`
   - Update appointment status logic to use wizard-level quote mode

5. **Add TypeScript Types:**
   - Update `client-vue/src/types/wizard.ts`
   - Add type for `isQuoteMode`
   - Ensure types are used throughout

**Key Files:**
- `client-vue/src/composables/useBookingWizard.ts` - Add wizard-level quote mode
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` - Connect quote mode checkbox
- `client-vue/src/components/booking/BookingWizard.vue` - Use wizard-level quote mode
- `client-vue/src/types/wizard.ts` - Add TypeScript types

**Checkpoint:** Verify quote mode is stored at wizard level and persists across navigation.

---

### Task 5: Update Wizard State Access Patterns

**Goal:** Ensure all components access wizard-level state correctly and state updates trigger UI updates.

**Steps:**
1. **Review All Wizard Steps:**
   - Check each wizard step component
   - Ensure they access wizard-level state correctly
   - Update any components using old state access patterns

2. **Ensure State is Reactive:**
   - Verify state updates trigger UI updates
   - Test state changes in different wizard steps
   - Ensure computed properties update correctly

3. **Update Components That Depend on User Type or Quote Mode:**
   - Find all components that use user type or quote mode
   - Update to use wizard-level state
   - Test that changes work correctly

4. **Add TypeScript Types:**
   - Ensure all state access uses proper types
   - Add type guards if needed
   - Ensure type safety throughout

**Key Files:**
- All wizard step components
- Any components that access user type or quote mode
- `client-vue/src/types/wizard.ts` - TypeScript types

**Checkpoint:** Verify all components access wizard-level state correctly and state updates work.

---

## Key Files

### Composables
- `client-vue/src/composables/useBookingWizard.ts` - Wizard state management refactoring

### Components
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` - Update to use wizard-level state
- `client-vue/src/components/booking/BookingWizard.vue` - Update state access patterns
- Other wizard step components (may need updates)

### Types
- `client-vue/src/types/wizard.ts` - TypeScript types for wizard state (create if needed)

---

## Success Criteria

- ✅ User type stored at wizard level, accessible from all steps
- ✅ Quote mode stored at wizard level, persists across navigation
- ✅ Form vs state architecture decision documented
- ✅ Annotation set access improved with wizard-level user type
- ✅ State updates correctly when user type or quote mode changes
- ✅ TypeScript types defined for wizard-level state
- ✅ All components access wizard-level state correctly
- ✅ State updates trigger UI updates correctly

---

## Implementation Notes

### State Management Pattern
- Use Vue 3 Composition API `ref()` for reactive state
- Use `provide/inject` or composable pattern for sharing state
- Consider using Pinia store if state becomes complex (evaluate need)

### State Access Pattern
- Components access wizard-level state via `useBookingWizard()` composable
- State is reactive, so UI updates automatically when state changes
- Use computed properties for derived state

### TypeScript Types
- Define types for wizard-level state
- Use types throughout to ensure type safety
- Add type guards if needed for runtime checks

### Testing Considerations
- Test state persistence across navigation
- Test state updates trigger UI updates
- Test state access from different components
- Test edge cases (e.g., resetting wizard state)

---

## Learning Checkpoints

**After Task 1 (Evaluate Current State Architecture):**
- What is the current state architecture?
- Where is user type currently stored?
- Where is quote mode currently stored?
- What are the current data access patterns?

**After Task 2 (Research Form vs State Architecture):**
- What form vs state architecture pattern was chosen?
- Why was this pattern chosen?
- What trade-offs were considered?

**After Task 3 (Refactor User Type):**
- How is user type now stored?
- How is user type accessed from different components?
- Does user type persist across navigation?

**After Task 4 (Add Quote Mode State):**
- How is quote mode now stored?
- How is quote mode accessed from different components?
- Does quote mode persist across navigation?

**After Task 5 (Update State Access Patterns):**
- Are all components accessing wizard-level state correctly?
- Do state updates trigger UI updates correctly?
- Are TypeScript types defined and used correctly?

---

## Related Documents

- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Phase Handoff**: `../phases/phase-1.3-handoff.md`
- **Feature Guide**: `../feature-data-flow-alignment-guide.md`

---

**Session Status:** Not Started  
**Next Session:** Session 1.3.2 - Form Validation Implementation

