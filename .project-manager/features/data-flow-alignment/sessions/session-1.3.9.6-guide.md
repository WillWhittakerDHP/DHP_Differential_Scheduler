# Session 1.3.9.6 Guide: Transformer and Duration Calculation Updates

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9.6 - Transformer and Duration Calculation Updates  
**Status:** Not Started  
**Priority:** High (Data flow consistency)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.9.6  
**Session Name:** Transformer and Duration Calculation Updates  
**Description:** Update transformers and duration calculations to work with arrays. Update appointmentToWizardTransformer, collectAppointmentData, accumulatedBlockInstances, and timeSlotCalculations references.

**Dependencies:** Session 1.3.9.5 (UI Component Updates and Integration) ✅ Complete

---

---

## Objectives

- Update appointmentToWizardTransformer (array mappings)
- Update collectAppointmentData (array ID extraction)
- Update accumulatedBlockInstances computed (simplify accumulation)
- Update timeSlotCalculations references

---

## Tasks

### Task 1.3.9.6.1: Update appointmentToWizardTransformer

**Goal:** Update transformer to map array fields from appointment to wizard state.

**Steps:**
1. **Update WizardStateData Interface:**
   - Change `baseService: BookingBlockInstance | null` → `services: BookingBlockInstance[]`
   - Change `dwellingAdjustment: BookingBlockInstance | null` → `dwellingAdjustments: BookingBlockInstance[]`
   - Keep `availabilityOptions: BookingBlockInstance[]` (already array)

2. **Update Transformation Logic:**
   - Map `appointment.selectedServiceIds` → array of `BookingBlockInstance`
   - Map `appointment.selectedDwellingAdjustmentIds` → array of `BookingBlockInstance`
   - Handle null/empty arrays gracefully (return empty array `[]`)

3. **Update findBlockInstanceByIdAndShape Calls:**
   - Change to `findBlockInstancesByIdsAndShape` (plural) if helper exists
   - Or create helper function to find multiple block instances by IDs
   - Return arrays of `BookingBlockInstance`

4. **Handle Backward Compatibility (if needed):**
   - Check if old format exists (single FK values)
   - Convert single values to arrays during transition
   - Or handle both formats during migration period

**Key Files:**
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts`

**Checkpoint:** Verify transformer maps arrays correctly.

---

### Task 1.3.9.6.2: Update collectAppointmentData

**Goal:** Update appointment data collection to extract IDs from arrays.

**Steps:**
1. **Update collectAppointmentData Function:**
   - Change `baseServiceId: wizard.selectedBaseService.value?.id` → `selectedServiceIds: wizard.selectedServices.value.map(s => s.id)`
   - Change `dwellingAdjustmentId: wizard.selectedDwellingAdjustment.value?.id` → `selectedDwellingAdjustmentIds: wizard.selectedDwellingAdjustments.value.map(d => d.id)`

2. **Handle Empty Arrays:**
   - Decide: convert empty arrays to `null` or keep as empty arrays `[]`
   - Update logic accordingly
   - Ensure API accepts the chosen format

3. **Update Validation:**
   - Check `wizard.selectedServices.value.length > 0` instead of `wizard.selectedBaseService.value`
   - Check `wizard.selectedDwellingAdjustments.value.length > 0` instead of `wizard.selectedDwellingAdjustment.value`

**Key Files:**
- `client-vue/src/components/booking/BookingWizard.vue`

**Checkpoint:** Verify appointment data collection extracts IDs correctly.

---

### Task 1.3.9.6.3: Update accumulatedBlockInstances Computed

**Goal:** Simplify accumulation now that all selections are arrays.

**Steps:**
1. **Update Computed Property:**
   ```typescript
   const accumulatedBlockInstances = computed(() => {
     return [
       ...wizard.selectedServices.value,
       ...wizard.selectedDwellingAdjustments.value,
       ...wizard.selectedAvailabilityOptions.value
     ]
   })
   ```

2. **Remove Old References:**
   - Remove `wizard.selectedBaseService.value` checks
   - Use `wizard.selectedServices.value` instead
   - Simplify any conditional logic

3. **Update Any Dependencies:**
   - Check what uses `accumulatedBlockInstances`
   - Verify it works correctly with simplified accumulation
   - Update any related computed properties

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`

**Checkpoint:** Verify accumulation works correctly with arrays.

---

### Task 1.3.9.6.4: Update timeSlotCalculations References

**Goal:** Update any references to time slot calculations for array-based selections.

**Steps:**
1. **Review timeSlotCalculations Usage:**
   - Find all places that use time slot calculations
   - Check if they reference old single-value selections
   - Update to use array-based selections

2. **Update Duration Calculations:**
   - Ensure duration calculation sums from all selected services
   - Ensure duration includes dwelling adjustments
   - Ensure duration includes availability options
   - Verify calculation logic works with arrays

3. **Update Differential Service Checks:**
   - Check if any service is differential: `wizard.selectedServices.value.some(s => s.differential)`
   - Update conditional logic based on array check

**Key Files:**
- `client-vue/src/utils/timeSlotCalculations.ts`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- Any other files that reference time slot calculations

**Checkpoint:** Verify time slot calculations work with arrays.

---

### Task 1.3.9.6.5: Update Any Other Transformers

**Goal:** Check for other transformers that might need updates.

**Steps:**
1. **Search for Transformers:**
   - Find other transformer files
   - Check if they reference old field names
   - Update if needed

2. **Update Type Definitions:**
   - Check for type definitions that reference old fields
   - Update to use new array fields
   - Ensure type consistency

**Key Files:**
- Any other transformer files
- Type definition files

**Checkpoint:** Verify all transformers updated correctly.

---

## Key Files

### Frontend
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts`
- `client-vue/src/components/booking/BookingWizard.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/utils/timeSlotCalculations.ts`

---

## Success Criteria

- ✅ appointmentToWizardTransformer maps arrays correctly
- ✅ collectAppointmentData extracts IDs from arrays
- ✅ accumulatedBlockInstances simplified and works correctly
- ✅ timeSlotCalculations updated for arrays
- ✅ Duration calculations work with multiple selections
- ✅ All transformers updated consistently
- ✅ Data flow works correctly end-to-end

---

## Implementation Notes

- **Array Mapping:** Use `.map()` to transform arrays, handle null/empty arrays gracefully
- **ID Extraction:** Use `.map(s => s.id)` to extract IDs from block instances
- **Accumulation:** Use spread operator `...` to combine arrays
- **Backward Compatibility:** Consider if needed during transition period
- **Type Safety:** Ensure all types reflect array structure

---

## Related Documents

- **Parent Session Guide**: `session-1.3.9-guide.md`
- **Previous Sub-Session**: `session-1.3.9.5-guide.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`

---

**Next Sub-Session:** Session 1.3.9.7 - Testing and Validation
