# Phase 6 Session 6.7 Guide: User-Specific Descriptions - Wizard Display

**Feature:** Vue Migration  
**Purpose:** Session-level guide for displaying user-specific descriptions in wizard based on selected user type

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.7 - User-Specific Descriptions - Wizard Display
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.7
**Session Name:** User-Specific Descriptions - Wizard Display
**Description:** Update ServiceSelectionStep to read descriptions from SchedulerBlockProfile.descriptions array and filter by selected user type.

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 6.6 complete (Admin Portal), Session 6.2 complete (Cascading Selection Logic)

---

## Session Objectives

- Update ServiceSelectionStep to read descriptions from SchedulerBlockProfile.descriptions array
- Implement logic to filter descriptions by selected user type
- Handle multiple descriptions per BlockProfile (display all matching user type)
- Add fallback to generic description field if no descriptions in relationship
- Test description display for all user types (buyer, agent, owner)
- Test description display when multiple descriptions exist

---

## Key Deliverables

- Updated ServiceSelectionStep with description display
- User-type filtering logic
- Fallback handling
- Multiple description support

---

## Detailed Task Breakdown

### Task 6.7.1: Update ServiceSelectionStep to Read Descriptions

**File:** `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Steps:**
1. Access descriptions from SchedulerBlockProfile.descriptions
2. Create computed property to get descriptions for selected block
3. Filter descriptions by userType
4. Display descriptions in template

**Code:**
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useBookingWizard } from '@/composables/useBookingWizard'

const wizard = useBookingWizard()

// Get descriptions for selected base service, filtered by user type
const displayedDescription = computed(() => {
  if (!wizard.selectedBaseService.value) return null
  
  const block = wizard.selectedBaseService.value
  const userType = wizard.selectedUserType.value?.name.toLowerCase() // 'buyer', 'agent', 'owner'
  
  // Get descriptions from relationship (will be populated by transformer)
  const descriptions = block.descriptions || []
  
  // Filter by userType
  const matchingDescriptions = descriptions.filter(desc => 
    desc.userType === userType || desc.userType === null
  )
  
  // Return first matching description, or fallback to generic description
  return matchingDescriptions[0]?.text || block.description || ''
})
</script>

<template>
  <!-- Display description -->
  <p v-if="displayedDescription" class="text-body-2 mb-0 text-medium-emphasis">
    {{ displayedDescription }}
  </p>
</template>
```

---

### Task 6.7.2: Handle Multiple Descriptions

**Steps:**
1. Update logic to display all matching descriptions
2. Format multiple descriptions appropriately
3. Test with multiple descriptions

---

### Task 6.7.3: Add Fallback Logic

**Steps:**
1. Check if descriptions array exists and has items
2. Fallback to generic `description` field if no descriptions
3. Test fallback works

---

### Task 6.7.4: Test All User Types

**Steps:**
1. Test with buyer user type
2. Test with agent user type
3. Test with owner user type
4. Verify correct descriptions display for each

---

## Success Criteria

- [ ] Descriptions read from SchedulerBlockProfile.descriptions
- [ ] Descriptions filtered by selected user type
- [ ] Multiple descriptions handled correctly
- [ ] Fallback to generic description works
- [ ] All user types tested
- [ ] Descriptions display correctly
- [ ] Ready for Session 6.8 (Page Layout & Responsive Design)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`



