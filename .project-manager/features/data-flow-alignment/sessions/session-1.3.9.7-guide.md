# Session 1.3.9.7 Guide: Testing and Validation

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9.7 - Testing and Validation  
**Status:** Not Started  
**Priority:** High (Final validation)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.9.7  
**Session Name:** Testing and Validation  
**Description:** Comprehensive testing and validation of multi-select functionality. Test data migration, multi-select UI, duration calculations, appointment creation/loading, and end-to-end workflows.

**Dependencies:** Session 1.3.9.6 (Transformer and Duration Calculation Updates) ✅ Complete

---

---

## Objectives

- Test data migration (existing appointments)
- Test multi-select UI (services, dwelling adjustments)
- Test duration calculation (multiple selections)
- Test appointment creation/loading (arrays)
- End-to-end testing

---

## Tasks

### Task 1.3.9.7.1: Test Data Migration

**Goal:** Verify data migration worked correctly and no data was lost.

**Steps:**
1. **Verify Migration Execution:**
   - Check that migration ran successfully
   - Verify no errors during migration
   - Check database schema updated correctly

2. **Verify Data Integrity:**
   - Count total appointments before and after migration
   - Verify all appointments have valid array values
   - Check that single FK values converted to single-item arrays
   - Verify null FK values remain null

3. **Test Sample Data:**
   - Query sample appointments
   - Verify `selected_service_ids` contains arrays
   - Verify `selected_dwelling_adjustment_ids` contains arrays
   - Verify arrays contain correct IDs

4. **Test Edge Cases:**
   - Test appointments with null values
   - Test appointments with single selections
   - Verify backward compatibility if needed

**Key Files:**
- Migration verification scripts
- Database query tools

**Checkpoint:** Verify data migration integrity maintained.

---

### Task 1.3.9.7.2: Test Multi-Select UI

**Goal:** Test multi-select functionality in wizard steps.

**Steps:**
1. **Test Service Selection:**
   - Select multiple services
   - Deselect services
   - Verify checkboxes work correctly
   - Verify state updates correctly
   - Verify cascading clears work (when services change, clear dwelling adjustments)

2. **Test Dwelling Adjustment Selection:**
   - Select multiple dwelling adjustments
   - Deselect dwelling adjustments
   - Verify checkboxes work correctly
   - Verify state updates correctly

3. **Test Availability Options:**
   - Verify availability options still work (already multi-select)
   - Test selecting/deselecting multiple options

4. **Test Nested Component Selection:**
   - Test nested component selection with NestedSelectionCard
   - Verify nested children render correctly
   - Verify nested selection state works

**Key Files:**
- Browser testing
- Component test files (if any)

**Checkpoint:** Verify multi-select UI works correctly.

---

### Task 1.3.9.7.3: Test Duration Calculation

**Goal:** Verify duration calculations work with multiple selections.

**Steps:**
1. **Test Multiple Services:**
   - Select multiple services
   - Verify duration sums correctly from all services
   - Verify time slots reflect combined duration

2. **Test Multiple Dwelling Adjustments:**
   - Select multiple dwelling adjustments
   - Verify duration includes all adjustments
   - Verify time slots reflect combined duration

3. **Test Combined Selections:**
   - Select multiple services + multiple dwelling adjustments + availability options
   - Verify duration accumulates from all selections
   - Verify time slots reflect total duration

4. **Test Differential Services:**
   - Select differential services
   - Verify inspector/client time slots work correctly
   - Verify Time On-Site Graph displays correctly

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/utils/timeSlotCalculations.ts`

**Checkpoint:** Verify duration calculations work correctly with multiple selections.

---

### Task 1.3.9.7.4: Test Appointment Creation/Loading

**Goal:** Verify appointment creation and loading work with arrays.

**Steps:**
1. **Test Appointment Creation:**
   - Create appointment with multiple services
   - Create appointment with multiple dwelling adjustments
   - Create appointment with multiple selections
   - Verify arrays saved correctly in database
   - Verify API request contains correct array format

2. **Test Appointment Loading:**
   - Load existing appointment (migrated data)
   - Load new appointment (created with arrays)
   - Verify arrays load correctly
   - Verify wizard state populated correctly
   - Verify UI displays multiple selections correctly

3. **Test Empty Arrays:**
   - Create appointment with no services selected
   - Create appointment with no dwelling adjustments
   - Verify empty arrays handled correctly (null or empty array?)

4. **Test Backward Compatibility (if applicable):**
   - If old format still exists, test loading old appointments
   - Verify transformer handles both formats correctly

**Key Files:**
- `client-vue/src/components/booking/BookingWizard.vue`
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts`
- API endpoints

**Checkpoint:** Verify appointment creation/loading works correctly with arrays.

---

### Task 1.3.9.7.5: End-to-End Testing

**Goal:** Test complete wizard flow with multi-select.

**Steps:**
1. **Test Complete Wizard Flow:**
   - Start new appointment
   - Select multiple services
   - Select multiple dwelling adjustments
   - Fill property details
   - Fill contact information
   - Select availability (date/time)
   - Create appointment
   - Verify appointment created correctly

2. **Test Wizard Navigation:**
   - Navigate between steps
   - Verify selections persist
   - Verify validation works
   - Verify stepper subtitles update correctly

3. **Test Edit Flow:**
   - Load existing appointment
   - Modify selections (add/remove services)
   - Update appointment
   - Verify changes saved correctly

4. **Test Edge Cases:**
   - Test with no selections
   - Test with maximum selections
   - Test rapid selection/deselection
   - Test navigation with invalid state

**Key Files:**
- Full wizard flow testing
- Browser testing

**Checkpoint:** Verify end-to-end flow works correctly.

---

### Task 1.3.9.7.6: Performance Testing

**Goal:** Verify performance is acceptable with multiple selections.

**Steps:**
1. **Test with Many Selections:**
   - Select many services (10+)
   - Select many dwelling adjustments (10+)
   - Verify UI remains responsive
   - Verify calculations perform well

2. **Test Duration Calculation Performance:**
   - Measure duration calculation time
   - Verify calculations complete quickly (< 100ms)
   - Check for any performance regressions

3. **Test State Updates:**
   - Verify state updates are reactive
   - Verify no unnecessary re-renders
   - Check Vue DevTools for reactivity

**Key Files:**
- Performance profiling tools
- Vue DevTools

**Checkpoint:** Verify performance is acceptable.

---

## Key Files

### Testing
- Test files (to be created as needed)
- Migration verification scripts
- Browser testing tools

---

## Success Criteria

- ✅ Data migration verified (no data loss)
- ✅ Multi-select UI works correctly
- ✅ Duration calculations work with multiple selections
- ✅ Appointment creation works with arrays
- ✅ Appointment loading works with arrays
- ✅ End-to-end flow works correctly
- ✅ Performance is acceptable
- ✅ All tests pass
- ✅ No regressions introduced

---

## Implementation Notes

- **Data Migration:** Verify integrity by comparing counts and sample data
- **UI Testing:** Test all selection scenarios (select, deselect, multiple, none)
- **Duration Testing:** Test with various combinations of selections
- **E2E Testing:** Test complete user workflows
- **Performance:** Monitor for any performance regressions

---

## Related Documents

- **Parent Session Guide**: `session-1.3.9-guide.md`
- **Previous Sub-Session**: `session-1.3.9.6-guide.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`

---

**Session Complete:** After this session, Session 1.3.9 is complete. Ready for Phase 1.4 - Admin Panel Data Flow Fixes.
