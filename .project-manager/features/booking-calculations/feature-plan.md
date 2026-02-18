# Feature 3: Booking Calculations

**Feature:** Booking Calculations  
**Status:** Planning - Needs Audit  
**Created:** 2025-02-01  
**Branch:** `feature/booking-calculations`

---

## ⚠️ PRE-PLANNING AUDIT REQUIRED

**Before starting Feature 3, conduct an audit to determine:**

1. **What calculation logic already exists in Vue.js?**
   - Check `client/src/utils/booking/` for existing calculation utilities
   - Check `client/src/composables/booking/` for existing composables
   - Review what was migrated from React vs. what needs to be added

2. **What can be simplified or improved?**
   - Moveable scheduling calendar pass logic (known issue)
   - Time slot calculation complexity
   - Fee calculation edge cases

3. **What new features should be added?**
   - Soft hold warning system (show warnings when someone else is considering a time slot)
   - Appointment status-based availability (use `started`/`held` statuses)
   - Real-time availability updates (WebSocket consideration for future)

4. **File path corrections:**
   - Vue codebase is now at `client/` (not `client/`)
   - React codebase was archived

**Action:** Run Phase 3.0 (Audit) before proceeding with Phase 3.1.

---

## Overview

Extract and implement fee and time calculation logic. Create shared calculation composable for booking wizard and admin preview. This feature may involve extracting logic from React codebase OR improving/fixing existing Vue.js implementations.

**Target:** Shared calculation composable that can be used by both booking wizard and admin preview panel.

---

## Phase 3.0: Calculation & Availability Audit (NEW)

**Status:** Not Started  
**Description:** Audit existing calculation and availability logic before implementing changes.

### Objectives

- Review existing Vue.js calculation utilities in `client/src/utils/booking/`
- Review existing composables in `client/src/composables/booking/`
- Identify what's working, what's broken, what's missing
- Document moveable scheduling issues
- Identify simplification opportunities
- Determine scope of remaining work

### Key Files to Audit

- `client/src/utils/booking/appointmentTimeCalculations.ts`
- `client/src/utils/booking/partFinalizer.ts`
- `client/src/utils/booking/timeSlotMatching.ts`
- `client/src/utils/booking/timeAvailabilityManager.ts`
- `client/src/composables/booking/useMoveablePartsScheduling.ts`
- `client/src/composables/booking/useAppointmentSlots.ts`
- `client/src/composables/booking/useAppointmentTimes.ts`

### Success Criteria

- Audit document created with findings
- Scope of Feature 3 refined based on audit
- Known issues documented (moveable scheduling, etc.)
- Decision on what to fix vs. simplify vs. add

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

- `client/src/composables/booking/useBookingCalculator.ts` (new or existing)

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

- `client/src/components/booking/steps/ServiceSelectionStep.vue`
- `client/src/components/booking/steps/PropertyDetailsStep.vue`
- `client/src/components/booking/steps/ConfirmationStep.vue`
- `client/src/composables/booking/useBookingWizard.ts`

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

- `client/src/composables/booking/__tests__/useBookingCalculator.test.ts` (new)

### Success Criteria

- Unit tests for all calculation functions
- Edge cases tested
- Special handling tested
- Calculations match React version exactly
- Test coverage > 80%

---

## Phase 3.5: Moveable Scheduling Fix (POTENTIAL)

**Status:** Pending Audit  
**Description:** Fix known issues with moveable scheduling calendar pass logic.

### Known Issues

- Moveable scheduling calendar pass logic needs review
- Time slot allocation complexity
- Edge cases in part scheduling

### Objectives (to be refined after audit)

- Review `useMoveablePartsScheduling.ts` logic
- Identify and document issues
- Simplify or fix calendar pass logic
- Ensure moveable parts schedule correctly

### Key Files

- `client/src/composables/booking/useMoveablePartsScheduling.ts`
- `client/src/utils/booking/partFinalizer.ts`
- `client/src/utils/booking/timeSlotMatching.ts`

### Success Criteria

- Moveable scheduling works correctly
- Calendar pass logic is simplified (if possible)
- Edge cases handled

---

## Phase 3.6: Soft Hold Warning System (POTENTIAL)

**Status:** Pending Audit  
**Description:** Implement warnings when someone else is considering the same time slot.

### Overview

When User A is actively booking a time slot (status: `started` or `held`), User B should see a warning that someone else is considering that time. This prevents frustration when a slot becomes unavailable during booking.

### Approach Options

**Option A: Soft Hold (Simpler, No Real-Time)**
- Include `started`/`held` appointments in availability checks
- Return them separately so UI can show warnings
- Add timeout logic (e.g., `started` expires after 15 min inactivity)
- Limitation: User B sees warning only after refresh

**Option B: Real-Time Warnings (More Complex)**
- WebSocket server for real-time communication
- Session tracking for who's viewing which slots
- Broadcast events when slots are being considered
- Heartbeat/timeout for releasing soft holds

### Objectives (if implemented)

- Modify `availabiltiesDbUtils.ts` to query `started`/`held` appointments
- Return soft holds separately from hard blocks
- Add UI indicators for "Someone is considering this time"
- Implement timeout logic for stale `started` appointments
- (Future) Add WebSocket for real-time updates

### Key Files

- `server/src/utils/availabilities/availabiltiesDbUtils.ts`
- `client/src/types/appointment.ts` (status definitions)
- `client/src/composables/booking/useAvailabilityLogic.ts`
- `client/src/components/booking/steps/AvailabilityStep.vue`

### Success Criteria

- Soft holds visible in availability UI
- Clear distinction between "unavailable" and "being considered"
- Timeout logic prevents stale holds
- User experience improved (fewer "slot just taken" surprises)

---

## Reference Documents

- **Admin UI Overhaul**: `project-manager/features/admin-ui-overhaul/feature-plan.md` (Phase 2.1: Booking Calculation Engine)
- **React Calculation Utils**: `client/src/scheduler/utils/ProfileToFinalTimeUtils.ts` (archived)
- **React Fee Calculations**: `client/src/scheduler/dataTransformation/appointmentTransformer.ts` (archived)
- **Appointment Status Types**: `client/src/types/appointment.ts`
- **Availability DB Utils**: `server/src/utils/availabilities/availabiltiesDbUtils.ts`

---

## Dependencies

- Feature 0: Vue.js Migration (Core Complete) ✅
- Feature 1: Data Flow Alignment (recommended for proper data flow) ✅ (mostly complete)
- Feature 2: Google APIs Integration (for real calendar data) 🔄 In Progress

---

## Success Metrics

- Audit complete with clear scope definition
- Calculation logic working correctly (extracted or improved)
- Shared calculation composable created and working
- Calculations integrated into booking wizard
- Comprehensive test coverage
- Performance: < 50ms per calculation
- (If applicable) Moveable scheduling fixed
- (If applicable) Soft hold warnings implemented

---

**Last Updated:** 2026-01-31  
**Status:** Planning - Needs Audit (Phase 3.0) Before Implementation

