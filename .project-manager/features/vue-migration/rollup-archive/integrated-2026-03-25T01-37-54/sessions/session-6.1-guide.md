# Phase 6 Session 6.1 Guide: Booking Wizard State Management

**Feature:** Vue Migration  
**Purpose:** Session-level guide for creating booking wizard state management composable

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.1 - Booking Wizard State Management
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 6.1
**Session Name:** Booking Wizard State Management
**Description:** Create `useBookingWizard` composable for managing wizard state and integrate scheduler data. This composable will handle all selections (user type, base service, additional services, availability options) and provide computed properties for filtered options.

**Duration:** Estimated 2-3 hours
**Dependencies:** Phase 5 complete (static UI shell), `useBooking` composable working

---

## Session Objectives

- Create `useBookingWizard.ts` composable with state for all wizard selections
- Integrate `useBooking` to get scheduler entities
- Add computed properties for filtered options based on selections
- Implement selection/deselection methods
- Test state management independently

---

## Key Deliverables

- `useBookingWizard.ts` composable
- State management for user type, base service, additional services, availability options
- Computed properties for filtered options
- Selection/deselection methods
- Integration with scheduler data

---

## Detailed Task Breakdown

### Task 6.1.1: Create useBookingWizard Composable Structure

**File:** `client-vue/src/composables/useBookingWizard.ts`

**Steps:**
1. Create composable file in `client-vue/src/composables/`
2. Import Vue Composition API (`ref`, `computed`)
3. Import `useBooking` to get scheduler data
4. Import scheduler types (`SchedulerBlockProfile`)
5. Define reactive state for selections:
   - `selectedUserType: Ref<SchedulerBlockProfile | null>`
   - `selectedBaseService: Ref<SchedulerBlockProfile | null>`
   - `selectedAdditionalServices: Ref<SchedulerBlockProfile[]>`
   - `selectedAvailabilityOptions: Ref<SchedulerBlockProfile[]>`
6. Create selection methods:
   - `selectUserType(block: SchedulerBlockProfile | null)`
   - `selectBaseService(block: SchedulerBlockProfile | null)`
   - `toggleAdditionalService(block: SchedulerBlockProfile)`
   - `toggleAvailabilityOption(block: SchedulerBlockProfile)`
7. Create computed properties for filtered options

**Code Structure:**
```typescript
import { ref, computed, type Ref } from 'vue'
import { useBooking } from './useBooking'
import type { SchedulerBlockProfile } from '@/utils/transformers/globalToBookingTransformer'

export function useBookingWizard() {
  const { bookingData } = useBooking()
  
  // State
  const selectedUserType = ref<SchedulerBlockProfile | null>(null)
  const selectedBaseService = ref<SchedulerBlockProfile | null>(null)
  const selectedAdditionalServices = ref<SchedulerBlockProfile[]>([])
  const selectedAvailabilityOptions = ref<SchedulerBlockProfile[]>([])
  
  // Selection methods
  const selectUserType = (block: SchedulerBlockProfile | null) => {
    selectedUserType.value = block
    // Clear dependent selections when user type changes
    selectedBaseService.value = null
    selectedAdditionalServices.value = []
    selectedAvailabilityOptions.value = []
  }
  
  const selectBaseService = (block: SchedulerBlockProfile | null) => {
    selectedBaseService.value = block
    // Clear dependent selections when base service changes
    selectedAdditionalServices.value = []
    selectedAvailabilityOptions.value = []
  }
  
  const toggleAdditionalService = (block: SchedulerBlockProfile) => {
    const index = selectedAdditionalServices.value.findIndex(b => b.id === block.id)
    if (index >= 0) {
      selectedAdditionalServices.value.splice(index, 1)
    } else {
      selectedAdditionalServices.value.push(block)
    }
  }
  
  const toggleAvailabilityOption = (block: SchedulerBlockProfile) => {
    const index = selectedAvailabilityOptions.value.findIndex(b => b.id === block.id)
    if (index >= 0) {
      selectedAvailabilityOptions.value.splice(index, 1)
    } else {
      selectedAvailabilityOptions.value.push(block)
    }
  }
  
  // Computed properties for filtered options
  const availableBaseServices = computed(() => {
    if (!selectedUserType.value || !bookingData.value) return []
    // Filter base services using activeBlockIds from selected user type
    const allowedIds = new Set(selectedUserType.value.activeBlockIds)
    return bookingData.value.blockProfiles.filter(
      bp => bp.blockType === 'Base Service' && allowedIds.has(bp.id)
    )
  })
  
  const availableAdditionalServices = computed(() => {
    if (!selectedBaseService.value || !bookingData.value) return []
    // Filter additional services using activeBlockIds from selected base service
    const allowedIds = new Set(selectedBaseService.value.activeBlockIds)
    return bookingData.value.blockProfiles.filter(
      bp => bp.blockType === 'Additional Service' && allowedIds.has(bp.id)
    )
  })
  
  const availableAvailabilityOptions = computed(() => {
    if (!selectedBaseService.value || !bookingData.value) return []
    // Filter availability options using activeBlockIds from selected base service
    const allowedIds = new Set(selectedBaseService.value.activeBlockIds)
    return bookingData.value.blockProfiles.filter(
      bp => bp.blockType === 'Availability Option' && allowedIds.has(bp.id)
    )
  })
  
  const availableUserTypes = computed(() => {
    if (!bookingData.value) return []
    return bookingData.value.blockProfiles.filter(
      bp => bp.blockType === 'User Type' && bp.visibility
    )
  })
  
  return {
    // State
    selectedUserType,
    selectedBaseService,
    selectedAdditionalServices,
    selectedAvailabilityOptions,
    // Methods
    selectUserType,
    selectBaseService,
    toggleAdditionalService,
    toggleAvailabilityOption,
    // Computed
    availableUserTypes,
    availableBaseServices,
    availableAdditionalServices,
    availableAvailabilityOptions,
  }
}
```

---

### Task 6.1.2: Integrate Scheduler Data

**Steps:**
1. Verify `useBooking` is working and returns scheduler data
2. Check that `bookingData.value.blockProfiles` contains expected data
3. Verify `activeBlockIds` is populated on `SchedulerBlockProfile`
4. Test that filtering logic works correctly
5. Add error handling for missing data

**Testing:**
```typescript
// In component using the composable
const wizard = useBookingWizard()
console.log('Available user types:', wizard.availableUserTypes.value)
console.log('Scheduler data:', bookingData.value)
```

---

### Task 6.1.3: Test State Management

**Steps:**
1. Create simple test component to use composable
2. Test selection methods
3. Test computed properties update correctly
4. Verify cascading clears work (selecting user type clears base service, etc.)
5. Test multi-select toggling
6. Check console for errors

**Test Component:**
```vue
<script setup lang="ts">
import { useBookingWizard } from '@/composables/useBookingWizard'

const wizard = useBookingWizard()

// Test selections
wizard.selectUserType(wizard.availableUserTypes.value[0])
console.log('Base services after user type selection:', wizard.availableBaseServices.value)
</script>
```

---

## Success Criteria

- [ ] `useBookingWizard.ts` composable created
- [ ] All state variables defined (user type, base service, additional services, availability options)
- [ ] Selection methods implemented
- [ ] Computed properties for filtered options working
- [ ] Integration with `useBooking` working
- [ ] Cascading clears work correctly
- [ ] Multi-select toggling works
- [ ] No console errors
- [ ] Ready for Session 6.2 (Cascading Selection Logic)

---

## Notes

- This composable provides the foundation for all wizard steps
- State is reactive and will update UI automatically
- Computed properties ensure filtered options are always up-to-date
- Cascading clears ensure data consistency when parent selections change

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`
- React Reference: `client/src/scheduler/contexts/schedulerContext.tsx`
