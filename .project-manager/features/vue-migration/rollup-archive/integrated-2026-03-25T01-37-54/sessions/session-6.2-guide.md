# Phase 6 Session 6.2 Guide: Cascading Selection Logic

**Feature:** Vue Migration  
**Purpose:** Session-level guide for implementing cascading selection logic in ServiceSelectionStep

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.2 - Cascading Selection Logic
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.2
**Session Name:** Cascading Selection Logic
**Description:** Update ServiceSelectionStep to use useBookingWizard and implement cascading filter logic where User Type selection filters Base Services, Base Service selection filters Additional Services, etc.

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 6.1 complete (useBookingWizard composable)

---

## Session Objectives

- Update ServiceSelectionStep to use useBookingWizard
- Implement User Type selection → filter Base Services via activeBlockIds
- Implement Base Service selection → filter Additional Services via activeBlockIds
- Implement Additional Services multi-select
- Add visual feedback for disabled/empty states
- Test cascading behavior

---

## Key Deliverables

- Updated ServiceSelectionStep.vue with real data
- Cascading selection logic working
- Visual feedback for empty/disabled states
- User Type → Base Service → Additional Services flow working

---

## Detailed Task Breakdown

### Task 6.2.1: Update ServiceSelectionStep to Use useBookingWizard

**File:** `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Steps:**
1. Import `useBookingWizard` composable
2. Remove hardcoded data (userTypes, serviceTypes, allAdditionalServices)
3. Replace with computed properties from composable:
   - `availableUserTypes` from wizard
   - `availableBaseServices` from wizard
   - `availableAdditionalServices` from wizard
4. Update template to use wizard state and methods
5. Replace hardcoded refs with wizard state

**Code Changes:**
```vue
<script setup lang="ts">
import { useBookingWizard } from '@/composables/useBookingWizard'

const wizard = useBookingWizard()

// Use wizard state instead of local refs
// Remove: const selectedUserType = ref('buyer')
// Use: wizard.selectedUserType

// Use wizard computed properties
// Remove: const userTypes = [...]
// Use: wizard.availableUserTypes
</script>
```

---

### Task 6.2.2: Implement User Type Selection

**Steps:**
1. Update User Type radio group to use `wizard.availableUserTypes`
2. Bind selection to `wizard.selectUserType`
3. Display icons from `SchedulerBlockProfile.icon` (will be mapped in Session 6.3)
4. Display descriptions from `SchedulerBlockProfile.description`
5. Show visual feedback when selected
6. Test that Base Services populate after selection

**Template Update:**
```vue
<VRadioGroup 
  :model-value="wizard.selectedUserType?.id"
  @update:model-value="(id) => {
    const userType = wizard.availableUserTypes.value.find(ut => ut.id === id)
    wizard.selectUserType(userType || null)
  }"
>
  <VRow>
    <VCol
      v-for="userType in wizard.availableUserTypes"
      :key="userType.id"
      cols="12"
      sm="4"
    >
      <VLabel
        class="custom-radio-icon rounded cursor-pointer pa-6"
        :class="{ 'active': wizard.selectedUserType?.id === userType.id }"
      >
        <!-- Icon will be added in Session 6.3 -->
        <VIcon
          :icon="userType.icon || 'tabler-user'"
          size="40"
          class="text-medium-emphasis mb-2"
        />
        
        <h6 class="text-h6 mb-2">
          {{ userType.name }}
        </h6>
        
        <p class="text-body-2 mb-0 text-medium-emphasis">
          {{ userType.description }}
        </p>
        
        <div class="mt-4">
          <VRadio :value="userType.id" />
        </div>
      </VLabel>
    </VCol>
  </VRow>
</VRadioGroup>
```

---

### Task 6.2.3: Implement Base Service Selection

**Steps:**
1. Update Base Service radio group to use `wizard.availableBaseServices`
2. Only show Base Services when User Type is selected
3. Bind selection to `wizard.selectBaseService`
4. Display service name and description
5. Show empty state when no User Type selected
6. Test cascading filter works

**Template Update:**
```vue
<VRow v-if="wizard.selectedUserType" class="mt-10">
  <VCol cols="12">
    <h5 class="text-h5 mb-4">Service Type</h5>
    
    <div v-if="wizard.availableBaseServices.length === 0" class="text-body-2 text-medium-emphasis">
      No services available for selected user type.
    </div>
    
    <VRadioGroup
      v-else
      :model-value="wizard.selectedBaseService?.id"
      @update:model-value="(id) => {
        const service = wizard.availableBaseServices.value.find(s => s.id === id)
        wizard.selectBaseService(service || null)
      }"
    >
      <div
        v-for="service in wizard.availableBaseServices"
        :key="service.id"
        class="mt-5"
      >
        <VRadio :value="service.id">
          <template #label>
            <div>
              <span class="text-body-1">{{ service.name }}</span>
              <p class="text-body-2 mb-0">{{ service.description }}</p>
            </div>
          </template>
        </VRadio>
      </div>
    </VRadioGroup>
  </VCol>
</VRow>
```

---

### Task 6.2.4: Implement Additional Services Multi-Select

**Steps:**
1. Update Additional Services list to use `wizard.availableAdditionalServices`
2. Only show Additional Services when Base Service is selected
3. Bind selection to `wizard.toggleAdditionalService`
4. Display selected services in chips
5. Show empty state when no Base Service selected
6. Test multi-select toggling works

**Template Update:**
```vue
<VRow v-if="wizard.selectedBaseService" class="mt-10">
  <VCol cols="12" md="6">
    <VLabel class="text-h5 mb-4">Additional Services</VLabel>
    
    <div v-if="wizard.availableAdditionalServices.length === 0" class="text-body-2 text-medium-emphasis">
      No additional services available for selected service.
    </div>
    
    <VList v-else class="additional-services-list">
      <VListItem
        v-for="service in wizard.availableAdditionalServices"
        :key="service.id"
        class="px-0 additional-service-item cursor-pointer"
        :class="{ 'selected': wizard.selectedAdditionalServices.some(s => s.id === service.id) }"
        @click="wizard.toggleAdditionalService(service)"
      >
        <VListItemTitle>{{ service.name }}</VListItemTitle>
        <VListItemSubtitle>{{ service.description }}</VListItemSubtitle>
        <template #append>
          <VBtn
            icon
            variant="text"
            size="small"
            @click.stop="wizard.toggleAdditionalService(service)"
          >
            <VIcon :icon="wizard.selectedAdditionalServices.some(s => s.id === service.id) ? 'tabler-check' : 'tabler-plus'" />
          </VBtn>
        </template>
      </VListItem>
    </VList>
  </VCol>
  
  <VCol cols="12" md="6">
    <div class="d-flex flex-wrap gap-2">
      <VChip
        v-for="service in wizard.selectedAdditionalServices"
        :key="service.id"
        color="primary"
        variant="outlined"
        closable
        @click:close="wizard.toggleAdditionalService(service)"
      >
        {{ service.name }}
      </VChip>
    </div>
  </VCol>
</VRow>
```

---

### Task 6.2.5: Add Visual Feedback for Empty States

**Steps:**
1. Add conditional rendering for empty states
2. Show helpful messages when selections are required
3. Disable sections when parent selection not made
4. Add loading states if needed
5. Test all empty state scenarios

---

## Success Criteria

- [ ] ServiceSelectionStep uses useBookingWizard
- [ ] User Type selection filters Base Services correctly
- [ ] Base Service selection filters Additional Services correctly
- [ ] Additional Services multi-select works
- [ ] Empty states display correctly
- [ ] Visual feedback works (selected states, disabled states)
- [ ] Cascading clears work when parent selection changes
- [ ] No console errors
- [ ] Ready for Session 6.3 (Icon Integration)

---

## Notes

- Cascading logic uses `activeBlockIds` from `SchedulerBlockProfile`
- Empty states are important for UX - users need to know why options aren't showing
- Multi-select uses toggle pattern - clicking again deselects
- Visual feedback helps users understand current state

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`
- React Reference: `client/src/scheduler/components/listMaker.tsx`


