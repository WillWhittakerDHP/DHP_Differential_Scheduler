# Scope Analysis: Task 1.3.6.8 - Refactor useAvailability for Client-Side Calculations

**Task:** 1.3.6.8  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Feature:** Data Flow Alignment  
**Created:** 2026-01-03  
**Status:** Pending Scoping Decision

---

## Current Task Description

**Goal:** Calculate time slots from part instances instead of querying backend API.

**Key Requirements:**
1. Remove API Query Logic from useAvailability
2. Create Calculation Function for time slots from part instances
3. Handle Differential Scheduling calculations
4. Update useAvailability Composable to use calculations instead of queries

---

## Scope Assessment

### Complexity Analysis

**Architectural Impact:** HIGH
- Removes backend API dependency for availability calculations
- Introduces client-side calculation logic
- Changes data flow from server-driven to client-driven
- Requires new utility functions and algorithms

**Files Affected:**
- `client-vue/src/composables/useAvailability.ts` - Complete refactor
- `client-vue/src/utils/differentialScheduling.ts` - NEW file (complex calculations)
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Integration updates
- Potentially: Calendar availability integration utilities

**Technical Complexity:**
- **Algorithm Development:** Need to create time slot generation algorithms
- **Differential Scheduling Logic:** Complex calculations for inspector/client arrival times
- **Calendar Integration:** Need to integrate with calendar availability (currently dummy data)
- **Part Instance Calculations:** Calculate durations from partInstances.baseTime
- **Date/Time Manipulation:** Complex date/time calculations for slot generation

**Testing Requirements:**
- Unit tests for calculation functions
- Integration tests for useAvailability composable
- Validation of differential scheduling calculations
- Edge case handling (timezone, date boundaries, etc.)

**Dependencies:**
- Part instances structure and baseTime values
- Calendar availability data (currently dummy, future: Google Calendar)
- Property details for differential calculations (sqft, type, etc.)

---

## Comparison with Other Sessions

### Session 1.3.5 (Availability Calendar Redesign)
- **Scope:** Single component redesign
- **Tasks:** 7 tasks
- **Complexity:** Medium
- **Duration:** 2-4 hours
- **Files:** Primarily AvailabilityStep.vue

### Session 1.3.6 (Current Session)
- **Scope:** Multiple component enhancements + database changes
- **Tasks:** 9 tasks (including 1.3.6.8)
- **Complexity:** High
- **Duration:** 4-8 hours estimated
- **Files:** Multiple components, database migrations, transformers

### Task 1.3.6.8 Analysis
- **Scope:** Architectural refactoring of availability system
- **Estimated Tasks:** 4-6 subtasks
- **Complexity:** High
- **Estimated Duration:** 3-5 hours
- **Files:** Multiple files, new utility file, significant refactoring

---

## Recommended Scope: **SESSION**

### Tier Reasoning

**Session-Level Change:**
- **Focused Scope:** Single architectural change (API → client-side calculations)
- **Multiple Subtasks:** Requires 4-6 distinct tasks to complete properly
- **Significant Complexity:** Algorithm development, differential scheduling logic, calendar integration
- **New Utility File:** Creates new `differentialScheduling.ts` utility file
- **Testing Requirements:** Requires comprehensive testing of calculation logic
- **Documentation Impact:** Significant - new calculation patterns need documentation

**Why Not a Task:**
- Too complex for a single task (requires multiple subtasks)
- Creates new utility file (indicates larger scope)
- Significant algorithm development required
- Requires comprehensive testing

**Why Not a Phase:**
- Focused on single feature (availability calculations)
- Doesn't span multiple features or major architectural changes
- Can be completed in one focused session
- Self-contained scope (availability system only)

---

## Recommended Session Structure

**Session:** 1.3.7 - Client-Side Availability Calculations

**Tasks:**
1. **Task 1.3.7.1:** Remove API Query Logic from useAvailability
   - Remove useQuery and API client calls
   - Remove queryKey and queryFn
   - Update function signature to accept service and property details

2. **Task 1.3.7.2:** Create Time Slot Calculation Utilities
   - Create `calculateAvailableTimeSlots()` function
   - Create duration calculation from part instances
   - Create calendar availability integration (dummy data for now)

3. **Task 1.3.7.3:** Implement Differential Scheduling Calculations
   - Create `differentialScheduling.ts` utility file
   - Implement inspector start time calculation
   - Implement client start time calculation
   - Handle property-based time adjustments

4. **Task 1.3.7.4:** Refactor useAvailability Composable
   - Replace query logic with calculation logic
   - Integrate calculation functions
   - Update return types and error handling
   - Remove loading states (calculations are synchronous)

5. **Task 1.3.7.5:** Update AvailabilityStep Integration
   - Update useAvailability call to pass service and property details
   - Handle synchronous calculations (remove loading states)
   - Update error handling

6. **Task 1.3.7.6:** Testing and Validation
   - Unit tests for calculation functions
   - Integration tests for useAvailability
   - Validate differential scheduling calculations
   - Test edge cases

---

## Estimated Duration

**Total:** 3-5 hours
- Task 1.3.7.1: 30 minutes
- Task 1.3.7.2: 1 hour
- Task 1.3.7.3: 1.5 hours
- Task 1.3.7.4: 1 hour
- Task 1.3.7.5: 30 minutes
- Task 1.3.7.6: 1 hour

---

## Dependencies

**Prerequisites:**
- Session 1.3.6 (TimeSlotGrid Enhancement) - Must be complete
- Part instances structure must be available
- Property details structure must be available

**Future Work:**
- Google Calendar integration (currently using dummy data)
- Property-based differential calculations (sqft, type adjustments)

---

## Recommendation

**Move Task 1.3.6.8 to Session 1.3.7**

This refactoring is complex enough to warrant its own focused session with proper task breakdown, testing, and documentation. It represents a significant architectural change that should be handled carefully with proper planning and validation.

---

## Next Steps

1. Update Session 1.3.6 guide to remove Task 1.3.6.8
2. Create Session 1.3.7 guide with detailed task breakdown
3. Update planning documents to reflect new session structure
4. Update handoff documents

