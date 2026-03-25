# Phase 6 Session 6.9 Guide: Availability Options Integration

**Feature:** Vue Migration  
**Purpose:** Session-level guide for connecting availability options to cascading selection system

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.9 - Availability Options Integration
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.9
**Session Name:** Availability Options Integration
**Description:** Update AvailabilityStep to use useBookingWizard for availability options and filter based on selected services.

**Duration:** Estimated 2-3 hours
**Dependencies:** Sessions 6.1-6.8 complete (all previous sessions)

---

## Session Objectives

- Update AvailabilityStep to use useBookingWizard for availability options
- Filter availability options based on selected services
- Display availability options with proper layout
- Test availability selection flow

---

## Key Deliverables

- Updated AvailabilityStep with real data
- Availability options filtered correctly
- Selection working
- Proper layout

---

## Detailed Task Breakdown

### Task 6.9.1: Update AvailabilityStep to Use useBookingWizard

**File:** `client-vue/src/components/booking/steps/AvailabilityStep.vue`

**Steps:**
1. Import useBookingWizard composable
2. Replace hardcoded availability options with wizard.availableAvailabilityOptions
3. Update selection logic to use wizard.toggleAvailabilityOption
4. Display availability options from real data

**Code:**
```vue
<script setup lang="ts">
import { useBookingWizard } from '@/composables/useBookingWizard'

const wizard = useBookingWizard()

// Use wizard computed properties
const availabilityOptions = wizard.availableAvailabilityOptions
</script>
```

---

### Task 6.9.2: Filter Availability Options

**Steps:**
1. Verify filtering works (options filtered by selected services)
2. Test empty state when no services selected
3. Test options appear when services selected

---

### Task 6.9.3: Display Availability Options

**Steps:**
1. Create UI for displaying availability options
2. Match existing design patterns
3. Ensure proper layout
4. Add selection UI (checkboxes or similar)

---

### Task 6.9.4: Test Availability Selection Flow

**Steps:**
1. Test complete flow: User Type → Base Service → Additional Services → Availability Options
2. Verify selections persist
3. Verify filtering works correctly
4. Test all edge cases

---

## Success Criteria

- [ ] AvailabilityStep uses useBookingWizard
- [ ] Availability options filtered correctly
- [ ] Options display with proper layout
- [ ] Selection works correctly
- [ ] Complete flow tested
- [ ] All Phase 6 objectives met
- [ ] Ready for next phase

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`



