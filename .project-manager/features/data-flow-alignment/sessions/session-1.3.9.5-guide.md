# Session 1.3.9.5 Guide: UI Component Updates and Integration

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9.5 - UI Component Updates and Integration  
**Status:** Not Started  
**Priority:** High (User-facing changes)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.9.5  
**Session Name:** UI Component Updates and Integration  
**Description:** Update all wizard step components to use multi-select arrays. Update ServiceSelectionStep, PropertyDetailsStep, AvailabilityStep, and BookingWizard to work with new array-based state and component architecture.

**Dependencies:** Session 1.3.9.4 (Component Architecture Refactor) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand current wizard step components and their state usage
- Understand SelectionCardGroup config patterns
- Understand wizard state plugin usage
- Review checkbox vs radio selection patterns

**During Session:**
- Learn how to update component configs for checkbox mode
- Learn how to update modelValue bindings for arrays
- Learn how to update validation for arrays
- Learn how to update computed properties for arrays

**After Session:**
- Understand multi-select UI patterns in wizard steps
- Understand array-based validation patterns
- Understand stepper subtitle updates for multiple selections

---

## Objectives

- Update ServiceSelectionStep (checkbox config, array modelValue)
- Update PropertyDetailsStep (dwelling adjustment multi-select)
- Update AvailabilityStep (array references, differential service checks)
- Update BookingWizard (validation, stepper subtitles, appointment creation)

---

## Tasks

### Task 1.3.9.5.1: Update ServiceSelectionStep

**Goal:** Update service selection to use multi-select checkboxes.

**Steps:**
1. **Update Base Service Config:**
   ```typescript
   const baseServiceConfig = computed(() => ({
     selectionType: 'checkbox', // Changed from 'radio'
     selectionComponent: 'VCheckbox', // Changed from 'VRadio'
     selectionGroup: 'VCheckboxGroup', // Changed from 'VRadioGroup'
     // ... rest of config
   }))
   ```

2. **Update State Plugin:**
   - Change `createWizardStatePlugin('baseService')` → `createWizardStatePlugin('services')`
   - Verify plugin works with array state

3. **Update ModelValue Binding:**
   - Change from `string | null` to `string[]` (array of selected IDs)
   - Update v-model binding to handle array
   - Bind to `selectedServiceIds` computed property

4. **Update Computed Properties:**
   - Change `selectedBaseServiceId` → `selectedServiceIds: computed<string[]>()`
   - Update getter/setter to work with arrays
   - Getter: return array of IDs from `wizard.selectedServices.value`
   - Setter: update wizard state with array of block instances

5. **Update Template:**
   - Change VRadioGroup to VCheckboxGroup (via config)
   - Update v-model to handle array
   - Verify checkbox selection works

6. **Update References:**
   - Change `wizard.selectedBaseService` → `wizard.selectedServices`
   - Change `wizard.availableBaseServices` → `wizard.availableServices`
   - Change `wizard.selectBaseService` → `wizard.toggleService`

**Key Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Checkpoint:** Verify service selection works with multi-select checkboxes.

---

### Task 1.3.9.5.2: Update PropertyDetailsStep

**Goal:** Update dwelling adjustment selection to use multi-select.

**Steps:**
1. **Update Dwelling Adjustment Config:**
   ```typescript
   selectionType: 'checkbox', // Changed from 'radio'
   selectionComponent: 'VCheckbox',
   selectionGroup: 'VCheckboxGroup',
   ```

2. **Update State Plugin:**
   - Change `createWizardStatePlugin('dwellingAdjustment')` → `createWizardStatePlugin('dwellingAdjustments')`
   - Verify plugin works with array state

3. **Update ModelValue to Array:**
   - Change from `string | null` to `string[]`
   - Update computed property for selected IDs
   - Update getter/setter for arrays

4. **Update References:**
   - Change `wizard.selectedDwellingAdjustment` → `wizard.selectedDwellingAdjustments`
   - Change `wizard.selectDwellingAdjustment` → `wizard.toggleDwellingAdjustment`

**Key Files:**
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`

**Checkpoint:** Verify dwelling adjustment selection works with multi-select.

---

### Task 1.3.9.5.3: Update AvailabilityStep

**Goal:** Update availability step to use array references and check differential services.

**Steps:**
1. **Update Array References:**
   - Change `wizard.selectedBaseService` → `wizard.selectedServices`
   - Update checks to use array methods (`.some()`, `.length > 0`)
   - Update any single-value checks to array checks

2. **Update Differential Service Logic:**
   - Check if any service is differential: `wizard.selectedServices.value.some(s => s.differential)`
   - Update conditional rendering based on array check
   - Update Time On-Site Graph to show combined duration

3. **Update accumulatedBlockInstances Computed:**
   - Simplify accumulation:
   ```typescript
   const accumulatedBlockInstances = computed(() => {
     return [
       ...wizard.selectedServices.value,
       ...wizard.selectedDwellingAdjustments.value,
       ...wizard.selectedAvailabilityOptions.value
     ]
   })
   ```

4. **Update Duration Calculation:**
   - Calculate from all selected services (sum durations)
   - Show combined duration or per-service breakdown
   - Update time slot calculations

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`

**Checkpoint:** Verify availability step works with array references.

---

### Task 1.3.9.5.4: Update BookingWizard

**Goal:** Update main wizard component for validation, subtitles, and appointment creation.

**Steps:**
1. **Update Step Validation:**
   - Change `wizard.selectedBaseService.value` → `wizard.selectedServices.value.length > 0`
   - Change `wizard.selectedDwellingAdjustment.value` → `wizard.selectedDwellingAdjustments.value.length > 0`
   - Update validation logic for arrays

2. **Update Stepper Subtitles:**
   - Show first service name or count: `wizard.selectedServices.value[0]?.name || '${wizard.selectedServices.value.length} services'`
   - Update dwelling adjustment subtitle similarly
   - Handle empty arrays gracefully

3. **Update Appointment Creation:**
   - Update `collectAppointmentData()`:
     - Change `baseServiceId: wizard.selectedBaseService.value?.id` → `selectedServiceIds: wizard.selectedServices.value.map(s => s.id)`
     - Change `dwellingAdjustmentId: wizard.selectedDwellingAdjustment.value?.id` → `selectedDwellingAdjustmentIds: wizard.selectedDwellingAdjustments.value.map(d => d.id)`
   - Handle empty arrays (convert to null or empty array?)

4. **Update Navigation Logic:**
   - Update step completion checks for arrays
   - Update any conditional logic based on selections

**Key Files:**
- `client-vue/src/components/booking/BookingWizard.vue`

**Checkpoint:** Verify wizard validation, subtitles, and appointment creation work with arrays.

---

## Key Files

### Frontend
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/components/booking/BookingWizard.vue`

---

## Success Criteria

- ✅ ServiceSelectionStep uses checkboxes and arrays
- ✅ PropertyDetailsStep uses checkboxes and arrays
- ✅ AvailabilityStep uses array references correctly
- ✅ BookingWizard validation works with arrays
- ✅ Stepper subtitles show multiple selections correctly
- ✅ Appointment creation maps arrays to IDs correctly
- ✅ All wizard steps work correctly with multi-select
- ✅ UI displays multiple selections correctly

---

## Implementation Notes

- **Config Updates:** Change selectionType, selectionComponent, selectionGroup in configs
- **State Plugin:** Update field names in createWizardStatePlugin calls
- **Array Checks:** Use `.length > 0` for validation, `.some()` for conditional checks
- **Stepper Subtitles:** Show first item name or count for multiple selections
- **ID Extraction:** Use `.map(s => s.id)` to extract IDs from block instances

---

## Related Documents

- **Parent Session Guide**: `session-1.3.9-guide.md`
- **Previous Sub-Session**: `session-1.3.9.4-guide.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`

---

**Next Sub-Session:** Session 1.3.9.6 - Transformer and Duration Calculation Updates

