# Session 1.3.7 Guide: Client-Side Availability Calculations

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.7 - Client-Side Availability Calculations  
**Status:** Not Started  
**Priority:** High (Architectural foundation for differential scheduling)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.7  
**Session Name:** Client-Side Availability Calculations  
**Description:** Refactor useAvailability composable to calculate time slots from part instances client-side instead of querying the backend API. Implement differential scheduling calculations for inspector and client arrival times.

**Dependencies:** Session 1.3.6 (TimeSlotGrid Enhancement and AvailabilityStep Refactoring) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand current useAvailability API query implementation
- Understand part instances structure and baseTime calculations
- Understand differential scheduling requirements from USER_STORY.md
- Review calendar availability integration patterns (currently dummy data)

**During Session:**
- Learn how to implement client-side time slot calculations
- Learn how to calculate durations from part instances
- Learn how to implement differential scheduling algorithms
- Learn how to integrate calendar availability (dummy data for now)

**After Session:**
- Understand client-side availability calculation patterns
- Understand differential scheduling calculation logic
- Understand how to refactor API-dependent composables to client-side calculations

---

## Objectives

- Remove API query logic from useAvailability composable
- Create time slot calculation utilities from part instances
- Implement differential scheduling calculations
- Refactor useAvailability to use client-side calculations
- Update AvailabilityStep integration
- Add comprehensive testing

---

## Tasks

### Task 1.3.7.1: Remove API Query Logic from useAvailability

**Goal:** Remove backend API dependency from useAvailability composable.

**Steps:**
1. **Remove useQuery Import:**
   - Remove `useQuery` import from `@tanstack/vue-query`
   - Remove API client imports if no longer needed

2. **Remove Query Logic:**
   - Remove `queryKey` computed property
   - Remove `queryFn` async function
   - Remove `enabled` computed property (no longer needed for query)
   - Remove `isLoading`, `isError`, `error`, `refetch` from return

3. **Update Function Signature:**
   - Change parameters to accept `service: BookingBlockInstance | null` instead of `serviceId: string | null`
   - Add `propertyDetails?: PropertyDetails` parameter for differential calculations
   - Keep `dateRange` and `duration` parameters (duration may be calculated from service)

**Key Files:**
- `client-vue/src/composables/useAvailability.ts` - Remove API query logic

**Checkpoint:** Verify useAvailability no longer makes API calls.

---

### Task 1.3.7.2: Create Time Slot Calculation Utilities

**Goal:** Create utility functions for calculating time slots from part instances.

**Steps:**
1. **Create Duration Calculation Function:**
   - Create `calculateDurationFromPartInstances()` function
   - Sum all `baseTime` values from service's `partInstances`
   - Return total duration in minutes

2. **Create Calendar Availability Integration:**
   - Create `getCalendarAvailability()` function (currently returns dummy data)
   - Structure for future Google Calendar integration
   - Return busy times or available time ranges

3. **Create Time Slot Generation Function:**
   - Create `generateTimeSlots()` function
   - Generate slots based on date range and duration
   - Filter out busy times from calendar
   - Return `TimeSlot[]` array with `slotStart` and `slotEnd`

**Key Files:**
- `client-vue/src/composables/useAvailability.ts` - Add calculation utilities
- `client-vue/src/utils/timeSlotCalculations.ts` - New utility file (optional, can be inline)

**Checkpoint:** Verify time slot generation works with dummy calendar data.

---

### Task 1.3.7.3: Implement Differential Scheduling Calculations

**Goal:** Create differential scheduling calculation logic for inspector and client arrival times.

**Steps:**
1. **Create Differential Scheduling Utility File:**
   - Create `client-vue/src/utils/differentialScheduling.ts`
   - Export calculation functions

2. **Implement Inspector Start Time Calculation:**
   - Create `calculateInspectorStartTime()` function
   - Calculate: `inspectorStart = clientStartTime - onSiteTotal`
   - Handle edge cases (midnight rollover, etc.)

3. **Implement Client Start Time Calculation:**
   - Create `calculateClientStartTime()` function
   - For differential services: Use selected slot as client start
   - For non-differential: Use selected slot as inspector start

4. **Implement Property-Based Adjustments:**
   - Create `calculatePropertyAdjustments()` function (future enhancement)
   - Calculate time adjustments based on property sqft, type, etc.
   - Return adjustment in minutes

5. **Generate Differential Time Slots:**
   - Create `generateDifferentialTimeSlots()` function
   - Generate separate slots for inspector and client when differential
   - Ensure slots don't overlap and respect calendar availability

**Key Files:**
- `client-vue/src/utils/differentialScheduling.ts` - New utility file

**Checkpoint:** Verify differential scheduling calculations work correctly.

---

### Task 1.3.7.4: Refactor useAvailability Composable

**Goal:** Replace query logic with calculation logic in useAvailability.

**Steps:**
1. **Update Function Implementation:**
   - Replace query logic with calculation logic
   - Call `calculateAvailableTimeSlots()` function
   - Handle differential vs non-differential services

2. **Update Return Type:**
   - Return `computed<TimeSlot[]>` instead of query result
   - Remove `isLoading`, `isError`, `error`, `refetch` from return
   - Keep `timeSlots` computed property

3. **Add Error Handling:**
   - Add try-catch for calculation errors
   - Return empty array on error (or handle gracefully)

4. **Update Reactive Dependencies:**
   - Make calculations reactive to service, dateRange, propertyDetails changes
   - Use computed properties for reactive calculations

**Key Files:**
- `client-vue/src/composables/useAvailability.ts` - Complete refactor

**Checkpoint:** Verify useAvailability calculates slots without API calls.

---

### Task 1.3.7.5: Update AvailabilityStep Integration

**Goal:** Update AvailabilityStep to work with refactored useAvailability.

**Steps:**
1. **Update useAvailability Call:**
   - Change from passing `serviceId` to passing `wizard.selectedBaseService.value`
   - Add `propertyDetails` parameter (get from wizard state or step data)
   - Remove handling of `isLoading` state (calculations are synchronous)

2. **Update Time Slot Handling:**
   - Verify `timeSlots` computed property works correctly
   - Update `timeSlotsPerDay` transformation if needed
   - Ensure TimeSlot objects are properly formatted

3. **Update Error Handling:**
   - Remove API error handling (no longer needed)
   - Add calculation error handling if needed

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Update integration

**Checkpoint:** Verify AvailabilityStep works with client-side calculations.

---

### Task 1.3.7.6: Testing and Validation

**Goal:** Add comprehensive tests for calculation logic.

**Steps:**
1. **Unit Tests for Calculation Functions:**
   - Test `calculateDurationFromPartInstances()`
   - Test `generateTimeSlots()`
   - Test `calculateInspectorStartTime()`
   - Test `calculateClientStartTime()`
   - Test edge cases (midnight, date boundaries, etc.)

2. **Integration Tests:**
   - Test useAvailability composable with various services
   - Test differential vs non-differential services
   - Test with different date ranges
   - Test with different property details

3. **Manual Testing:**
   - Test in browser with real services
   - Verify time slots display correctly
   - Verify differential scheduling works
   - Verify calendar integration (dummy data)

**Key Files:**
- `client-vue/src/composables/__tests__/useAvailability.test.ts` - New test file
- `client-vue/src/utils/__tests__/differentialScheduling.test.ts` - New test file

**Checkpoint:** Verify all tests pass and calculations work correctly.

---

## Key Files

### Frontend
- `client-vue/src/composables/useAvailability.ts` - Complete refactor
- `client-vue/src/utils/differentialScheduling.ts` - New utility file
- `client-vue/src/utils/timeSlotCalculations.ts` - New utility file (optional)
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Update integration
- `client-vue/src/composables/__tests__/useAvailability.test.ts` - New test file
- `client-vue/src/utils/__tests__/differentialScheduling.test.ts` - New test file

---

## Success Criteria

- ✅ useAvailability no longer makes API calls
- ✅ Time slots calculated from part instances' baseTime
- ✅ Duration calculated correctly from part instances
- ✅ Differential scheduling calculations work correctly
- ✅ Inspector start time calculated correctly (client time - onSiteTotal)
- ✅ Client start time calculated correctly
- ✅ Time slots generated correctly for date range
- ✅ Calendar availability integrated (dummy data for now)
- ✅ AvailabilityStep works with client-side calculations
- ✅ All tests pass
- ✅ Edge cases handled (midnight, date boundaries, etc.)

---

## Implementation Notes

### Duration Calculation
- Sum all `partInstances.baseTime` values for total duration
- Handle missing or zero baseTime values gracefully
- Default to 90 minutes if no part instances or sum is zero

### Differential Scheduling
- Inspector arrives earlier: `inspectorStart = clientStart - onSiteTotal`
- Client arrives at selected slot time
- Generate separate TimeSlot objects for inspector and client when differential
- Ensure slots don't overlap

### Calendar Availability
- Currently using dummy data (9 AM - 7 PM, 15-minute intervals)
- Structure ready for Google Calendar integration
- Filter out busy times when generating slots

### Error Handling
- Return empty array on calculation errors
- Log errors for debugging
- Handle missing service or dateRange gracefully

---

## Learning Checkpoints

**After Task 1.3.7.1 (Remove API Logic):**
- How is API query logic removed?
- What parameters does useAvailability now accept?

**After Task 1.3.7.2 (Calculation Utilities):**
- How are durations calculated from part instances?
- How are time slots generated?

**After Task 1.3.7.3 (Differential Calculations):**
- How is inspector start time calculated?
- How is client start time calculated?
- How are differential time slots generated?

**After Task 1.3.7.4 (Refactor Composable):**
- How does useAvailability now work?
- How are calculations made reactive?

**After Task 1.3.7.5 (Integration):**
- How does AvailabilityStep use the refactored useAvailability?
- Are there any integration issues?

**After Task 1.3.7.6 (Testing):**
- Do all tests pass?
- Are edge cases handled correctly?

---

### Task 1.3.7.7: Complete Session 1.3.6 Testing and Verification

**Goal:** Complete testing and verification for Session 1.3.6 features before closing Session 1.3.7.

**Steps:**
1. **Test TimeSlotGrid Enhancements:**
   - Verify time ranges display correctly on buttons (e.g., "9:00 AM - 9:15 AM")
   - Verify buttons are ordered vertically (top to bottom, left to right)
   - Test responsive layout: resize window to narrow width
   - Verify vertical scrolling works in single-column mode
   - Verify grid moves below calendar when space is insufficient

2. **Test Differential Scheduling UI:**
   - Select "Buyers Inspection" or "Investors Inspection" service
     - Verify Inspector/Client toggle appears
     - Verify Time On-Site Graph shows two bars (Inspector and Client)
     - Verify inspector bar is full-width
     - Verify client bar is right-justified and half-width
   - Select a non-differential service
     - Verify toggle is hidden
     - Verify Time On-Site Graph shows single bar

3. **Test Google Calendar Integration:**
   - Test calendar import scripts
   - Verify appointment creation from calendar events
   - Verify client and property data extraction

4. **Test Data Management Tab:**
   - Test AppointmentsTable functionality
   - Test PropertiesTable functionality
   - Test UsersTable functionality
   - Verify CRUD operations work correctly

5. **Update Session 1.3.6 Log:**
   - Mark testing as complete
   - Document any issues found and fixes applied
   - Update session status to "✅ Complete"

**Key Files:**
- `client-vue/src/components/booking/TimeSlotGrid.vue` - Test time range display and responsive behavior
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Test differential scheduling UI
- `server/src/scripts/importCalendarData.ts` - Test calendar import
- `client-vue/src/views/admin/tabs/DataManagementTab.vue` - Test data management tab
- `project-manager/features/data-flow-alignment/sessions/session-1.3.6-log.md` - Update with testing results

**Checkpoint:** Verify all Session 1.3.6 features work correctly before marking Session 1.3.7 complete.

---

## Related Documents

- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Phase Handoff**: `../phases/phase-1.3-handoff.md`
- **Feature Guide**: `../feature-data-flow-alignment-guide.md`
- **USER_STORY.md**: `../../../../USER_STORY.md`
- **Scope Analysis**: `task-1.3.6.8-scope-analysis.md`
- **Previous Session**: `session-1.3.6-guide.md`

---

**Session Status:** Not Started  
**Next Session:** Phase 1.4 - Admin Panel Data Flow Fixes (after Phase 1.3 completion)

