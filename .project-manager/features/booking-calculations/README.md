# Feature 3: Booking Calculations

**Status:** Planning - Needs Audit  
**Description:** Audit, improve, and potentially extract calculation logic for booking wizard.

## ⚠️ PRE-PLANNING AUDIT REQUIRED

Before starting this feature, we need to audit what calculation logic already exists in Vue.js and determine what needs to be added, fixed, or simplified. See `feature-plan.md` Phase 3.0 for details.

## Overview

This feature may involve:
- Auditing existing Vue.js calculation utilities
- Fixing known issues (e.g., moveable scheduling calendar pass)
- Simplifying complex logic where possible
- Adding new features (e.g., soft hold warnings for availability)
- Extracting any remaining React calculation logic (if needed)

## Key Objectives

1. **Audit existing code** — Determine what's working, broken, or missing
2. **Fix known issues** — Moveable scheduling, edge cases
3. **Simplify where possible** — Reduce complexity
4. **Add enhancements** — Soft hold warnings, improved availability
5. **Create/improve shared composable** — For booking wizard and admin preview
6. **Add comprehensive tests**

## Phases

- **Phase 3.0**: Calculation & Availability Audit ⚠️ **START HERE**
- **Phase 3.1**: Extract Calculation Logic (if needed)
- **Phase 3.2**: Create/Improve Shared Calculation Composable
- **Phase 3.3**: Integrate into Booking Wizard
- **Phase 3.4**: Add Calculation Tests
- **Phase 3.5**: Moveable Scheduling Fix (POTENTIAL)
- **Phase 3.6**: Soft Hold Warning System (POTENTIAL)

## Potential Enhancements

### Soft Hold Warning System
When someone is actively booking a time slot, other users should see a warning. Uses existing `started`/`held` appointment statuses.

### Moveable Scheduling Fix
Known issues with calendar pass logic that may need simplification or fixing.

## Calculation Functions

- `calculatePrice(service, property, options)` → Price breakdown
- `calculateTime(service, property, options)` → Time breakdown
- `checkApplicability(service, property)` → Applicability result with reasons
- `getBusinessLogicIndicators(calculation)` → Warnings/suggestions

## Key Files to Audit

- `client/src/utils/booking/appointmentTimeCalculations.ts`
- `client/src/utils/booking/partFinalizer.ts`
- `client/src/utils/booking/timeSlotMatching.ts`
- `client/src/utils/booking/timeAvailabilityManager.ts`
- `client/src/composables/booking/useMoveablePartsScheduling.ts`
- `client/src/composables/booking/useAppointmentSlots.ts`
- `server/src/utils/availabilities/availabiltiesDbUtils.ts`

## Related Documents

- **Feature Plan**: `feature-plan.md`
- **Appointment Status Types**: `client/src/types/appointment.ts`
- **Availability DB Utils**: `server/src/utils/availabilities/availabiltiesDbUtils.ts`

---

**Last Updated:** 2026-01-31

