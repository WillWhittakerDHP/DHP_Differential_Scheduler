# Session 2.2.6 Handoff: Constraint Attribution & Admin Performance

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.6 - Constraint Attribution & Admin Performance  
**Status:** ⏳ Not Started  
**Created:** 2026-02-02

---

## Session Overview

**Session Number:** 2.2.6  
**Session Name:** Constraint Attribution & Admin Performance  
**Description:** Fix how violations are attributed and displayed in the constraint overlay, ensuring direct conflicts are always attributed to "appointment" (blue) and drive time constraints are always "buffer" violations. Also optimize admin panel performance by loading settings only when the Business Controls tab is active.

**Goal:** Fix violation attribution so constraint overlay displays correct colors and information, and optimize admin panel by preventing unnecessary API calls until user navigates to Business Controls tab.

**Architecture Decision:** Violation Attribution Rules
- Direct overlap conflicts are ALWAYS appointment conflicts (fundamental can't-double-book)
- Drive time constraints can ONLY be buffer violations (they can never be "direct" conflicts)
- Collect ALL violations with proper attribution for debugging overlay
- Include buffer minutes in violation string for tooltip display

---

## Objectives

1. Fix violation attribution in `timeAvailabilityManager` - direct conflicts = appointment, drive times = buffer only
2. Update violation collection to include ALL violations with proper attribution
3. Include buffer minutes in violation strings (e.g., `overlap.driveTimeTo.buffer:20`)
4. Update `SlotConstraintOverlay` to handle buffer:minutes format in violations
5. Display buffer minutes in tooltip text (e.g., "DriveTimeTo buffer (20 min)")
6. Add conditional loading to `useAvailabilitySettings` composable
7. Update `AdminPanel` to provide currentTab state via inject
8. Update `BusinessControlsTab` to inject tab state and load settings only when active

---

## Prerequisites

- ✅ Session 2.2.5 Complete (API Prefetching & Data Source Semantics)
- ✅ Session 2.2.3 Complete (Drive Time ApplyTo Logic Refactor)
- ✅ SlotConstraintOverlay component exists and displays violations

---

## Implementation Summary

### Part A: Violation Attribution Fix

#### 1. Fix Violation Attribution Logic

**File:** `client/src/utils/booking/timeAvailabilityManager.ts`

- **Key Change:** Direct overlap is ALWAYS an appointment conflict
- **Key Change:** Drive time constraints can ONLY be buffer violations
- Refactor `checkSlotAvailability` to:
  - Check direct overlap first (always appointment.direct)
  - Collect ALL violations (not just first hard failure)
  - For appointment constraint: record buffer if extends beyond direct overlap
  - For drive time constraints: only record buffer-only overlaps
  - Include buffer minutes in violation string: `overlap.{type}.buffer:{minutes}`
- Return ALL violations (not just first) for debugging overlay

#### 2. Update Violation String Format

**File:** `client/src/utils/booking/timeAvailabilityManager.ts`

- Include buffer minutes in violation strings:
  - Format: `overlap.driveTimeTo.buffer:20` (includes minutes)
  - Format: `overlap.appointment.direct` (no minutes for direct)
  - Format: `overlap.appointment.buffer:15` (includes minutes for buffer)

### Part B: Constraint Overlay Display

#### 3. Update SlotConstraintOverlay for Buffer Minutes

**File:** `client/src/components/booking/dev/SlotConstraintOverlay.vue`

- Add `getColorForViolation` helper function:
  - Try exact match first
  - Strip minutes suffix if present (e.g., `buffer:20` → `buffer`)
  - Default gray for unknown types
- Update `formatConstraintTooltip` to:
  - Parse buffer minutes from violation string (format: `buffer:20`)
  - Display buffer value in tooltip: "DriveTimeTo buffer (20 min)"
  - Handle both old format (no minutes) and new format (with minutes)

### Part C: Admin Performance Optimization

#### 4. Add Conditional Loading to useAvailabilitySettings

**File:** `client/src/composables/admin/useAvailabilitySettings.ts`

- Add optional `enabled` parameter to `UseAvailabilitySettingsOptions` interface
- Watch `enabled` ref and only load settings when `enabled === true`
- Fallback: Load immediately if no `enabled` option provided (backward compatibility)
- Update `onMounted` logic to conditional loading based on `enabled` state

#### 5. Provide CurrentTab in AdminPanel

**File:** `client/src/views/admin/AdminPanel.vue`

- Provide `currentTab` ref via inject
- Allows child tabs to know if they're active

#### 6. Update BusinessControlsTab for Conditional Loading

**File:** `client/src/views/admin/tabs/BusinessControlsTab.vue`

- Inject `adminCurrentTab` from parent
- Compute `isTabActive` based on currentTab value
- Pass `enabled: isTabActive` to `useAvailabilitySettings`
- Settings only load when tab is active (prevents API call on initial page load)

---

## Files Modified

### Client (Frontend)

| File | Changes |
|------|---------|
| `client/src/utils/booking/timeAvailabilityManager.ts` | Fix violation attribution, collect ALL violations, include buffer minutes |
| `client/src/components/booking/dev/SlotConstraintOverlay.vue` | Handle buffer:minutes format, display buffer value in tooltips |
| `client/src/composables/admin/useAvailabilitySettings.ts` | Add conditional loading based on enabled option |
| `client/src/views/admin/AdminPanel.vue` | Provide currentTab via inject |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | Inject tab state, load settings only when active |

---

## Violation Attribution Rules

```
Direct Overlap (appointment conflict)
    │
    └─ Always attributed to: 'overlap.appointment.direct' (blue)
    └─ Fundamental can't-double-book rule

Buffer-Only Overlap (due to buffer minutes)
    │
    ├─ Appointment buffer extends beyond direct overlap
    │   └─ Attributed to: 'overlap.appointment.buffer:{minutes}' (blue)
    │
    └─ Drive time buffer (no direct overlap)
        ├─ driveTimeTo: 'overlap.driveTimeTo.buffer:{minutes}' (orange)
        └─ driveTimeFrom: 'overlap.driveTimeFrom.buffer:{minutes}' (red)
```

---

## Testing Checklist

- [ ] Test violation attribution: direct conflicts show as appointment.direct (blue)
- [ ] Test violation attribution: drive times show as buffer violations only (orange/red)
- [ ] Test violation collection: ALL violations collected (not just first)
- [ ] Test buffer minutes display: tooltip shows "DriveTimeTo buffer (20 min)"
- [ ] Test constraint overlay: correct colors for each violation type
- [ ] Test admin performance: settings NOT loaded on initial page load
- [ ] Test admin performance: settings load when Business Controls tab becomes active
- [ ] Test backward compatibility: useAvailabilitySettings works without enabled option
- [ ] Test multiple violations: overlay shows all constraint types correctly

---

## Success Criteria

**Violation Attribution:**
- ✅ Direct conflicts always attributed to appointment (blue)
- ✅ Drive time constraints always buffer violations (orange/red)
- ✅ ALL violations collected (not just first hard failure)
- ✅ Buffer minutes included in violation strings

**Constraint Overlay:**
- ✅ Correct colors for each violation type
- ✅ Buffer minutes displayed in tooltips
- ✅ Handles both old format (no minutes) and new format (with minutes)

**Admin Performance:**
- ✅ Settings NOT loaded on initial page load
- ✅ Settings load when Business Controls tab becomes active
- ✅ Backward compatibility maintained (works without enabled option)
- ✅ No unnecessary API calls until tab is active

**Code Quality:**
- ✅ All files compile without errors
- ✅ TypeScript types correct
- ✅ No linting errors
- ✅ Violation attribution logic clear and maintainable

---

## Next Session

**Session TBD:** Error Handling & Fallbacks (if needed)
- Comprehensive error handling for Places API failures
- Retry logic for transient errors
- User-friendly error messages

---

## Notes

- Violation attribution fix ensures constraint overlay displays correct information for debugging
- Direct conflicts are fundamental (can't double-book), so they're always appointment type
- Drive times are always buffer-only because they represent travel time, not actual conflicts
- Admin performance optimization prevents unnecessary API calls on initial page load
- Conditional loading pattern can be reused for other admin tabs if needed

---

**Session Status:** ⏳ Not Started  
**Created:** 2026-02-02
