# Feature 3: Booking Calculations

**Status:** Planning  
**Description:** Extract and implement fee and time calculation logic from React codebase.

## Overview

This feature extracts the fee and time calculation logic that exists in the React codebase and implements it as a shared Vue.js composable. The calculation composable can be used by both the booking wizard and the admin preview panel.

## Key Objectives

1. Extract calculation logic from React codebase
2. Create shared calculation composable
3. Integrate into booking wizard
4. Add comprehensive tests

## Phases

- **Phase 3.1**: Extract Calculation Logic from React
- **Phase 3.2**: Create Shared Calculation Composable
- **Phase 3.3**: Integrate into Booking Wizard
- **Phase 3.4**: Add Calculation Tests

## Calculation Functions

- `calculatePrice(service, property, options)` → Price breakdown
- `calculateTime(service, property, options)` → Time breakdown
- `checkApplicability(service, property)` → Applicability result with reasons
- `getBusinessLogicIndicators(calculation)` → Warnings/suggestions

## Related Documents

- **Feature Plan**: `feature-plan.md`
- **Admin UI Overhaul**: `../admin-ui-overhaul/feature-plan.md` (Phase 2.1 reference)
- **React Calculation Utils**: `../../client/src/scheduler/utils/ProfileToFinalTimeUtils.ts`
- **React Fee Calculations**: `../../client/src/scheduler/dataTransformation/appointmentTransformer.ts`

---

**Last Updated:** 2025-02-01

