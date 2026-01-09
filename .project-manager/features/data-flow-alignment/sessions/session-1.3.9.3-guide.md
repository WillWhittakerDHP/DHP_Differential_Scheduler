# Session 1.3.9.3 Guide: Frontend Type and Wizard State Updates

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9.3 - Frontend Type and Wizard State Updates  
**Status:** Not Started  
**Priority:** High (Foundation for UI changes)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.9.3  
**Session Name:** Frontend Type and Wizard State Updates  
**Description:** Update TypeScript types and wizard composable to use arrays instead of single values. Add accumulation computed properties and update wizard state plugin.

**Dependencies:** Session 1.3.9.2 (Backend Model and API Updates) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand current wizard state structure (`selectedBaseService`, `selectedDwellingAdjustment`)
- Understand Vue 3 Composition API ref patterns
- Understand computed properties and reactivity
- Review wizard state plugin architecture

**During Session:**
- Learn how to refactor refs from single values to arrays
- Learn how to update selection methods for arrays
- Learn how to add accumulation computed properties
- Learn how to update state plugins for array handling

**After Session:**
- Understand array-based state management patterns in Vue
- Understand accumulation naming for clarity
- Understand state plugin updates for multi-select

---

## Objectives

- Update Appointment types (Request/Response)
- Update wizard state refs (selectedServices, selectedDwellingAdjustments)
- Update selection methods (toggleService, toggleDwellingAdjustment)
- Add accumulation computed properties (accServices, accDwelling, accAvailability)
- Update wizard state plugin

---

## Tasks

### Task 1.3.9.3.1: Update Appointment Types

**Goal:** Update TypeScript types to reflect array fields.

**Steps:**
1. **Update AppointmentRequest Interface:**
   - Change `baseServiceId: string | null` → `selectedServiceIds: string[] | null`
   - Change `dwellingAdjustmentId: string | null` → `selectedDwellingAdjustmentIds: string[] | null`

2. **Update AppointmentResponse Interface:**
   - Change `baseServiceId: string | null` → `selectedServiceIds: string[] | null`
   - Change `dwellingAdjustmentId: string | null` → `selectedDwellingAdjustmentIds: string[] | null`

3. **Update Any Related Types:**
   - Check for other types that reference these fields
   - Update to use arrays consistently

**Key Files:**
- `client-vue/src/types/appointment.ts`

**Checkpoint:** Verify types compile and match backend schema.

---

### Task 1.3.9.3.2: Update Wizard State Refs

**Goal:** Change wizard state from single values to arrays.

**Steps:**
1. **Rename and Update selectedBaseService:**
   - Rename to `selectedServices`
   - Change type from `ref<BookingBlockInstance | null>` to `ref<BookingBlockInstance[]>`
   - Initialize as empty array: `ref<BookingBlockInstance[]>([])`

2. **Rename and Update selectedDwellingAdjustment:**
   - Rename to `selectedDwellingAdjustments`
   - Change type from `ref<BookingBlockInstance | null>` to `ref<BookingBlockInstance[]>`
   - Initialize as empty array: `ref<BookingBlockInstance[]>([])`

3. **Keep selectedAvailabilityOptions:**
   - Already an array, no changes needed
   - Verify type is correct: `ref<BookingBlockInstance[]>`

**Key Files:**
- `client-vue/src/composables/useBookingWizard.ts`

**Checkpoint:** Verify state refs updated correctly.

---

### Task 1.3.9.3.3: Update Selection Methods

**Goal:** Update selection methods to work with arrays (toggle/add/remove).

**Steps:**
1. **Update selectBaseService → toggleService:**
   - Rename method to `toggleService`
   - Change signature: `toggleService(block: BookingBlockInstance)`
   - Implement toggle logic:
     - If block.id in array, remove it
     - If block.id not in array, add it
   - Keep `skipCascade` parameter if needed

2. **Update selectDwellingAdjustment → toggleDwellingAdjustment:**
   - Rename method to `toggleDwellingAdjustment`
   - Change signature: `toggleDwellingAdjustment(block: BookingBlockInstance)`
   - Implement toggle logic (same as services)

3. **Update Cascading Logic:**
   - When services change, clear dwelling adjustments and availability options
   - When user type changes, clear services, dwelling adjustments, and availability options
   - Update clear logic to reset arrays to `[]`

4. **Update availableBaseServices → availableServices:**
   - Rename computed property
   - Filtering logic unchanged (still filters by user type, etc.)

**Key Files:**
- `client-vue/src/composables/useBookingWizard.ts`

**Checkpoint:** Verify selection methods work correctly with arrays.

---

### Task 1.3.9.3.4: Add Accumulation Computed Properties

**Goal:** Add computed properties with accumulation naming for clarity.

**Steps:**
1. **Add accServices Computed:**
   - Create `const accServices = computed(() => selectedServices.value)`
   - This provides clear naming for duration calculations

2. **Add accDwelling Computed:**
   - Create `const accDwelling = computed(() => selectedDwellingAdjustments.value)`
   - Provides clear naming for accumulation

3. **Add accAvailability Computed:**
   - Create `const accAvailability = computed(() => selectedAvailabilityOptions.value)`
   - Provides consistent naming pattern

4. **Export Accumulation Properties:**
   - Add to composable return type
   - Export for use in components

**Key Files:**
- `client-vue/src/composables/useBookingWizard.ts`

**Checkpoint:** Verify accumulation computed properties work correctly.

---

### Task 1.3.9.3.5: Update Wizard Types

**Goal:** Update wizard TypeScript types to reflect new state structure.

**Steps:**
1. **Update UseBookingWizardReturn Interface:**
   - Change `selectedBaseService` → `selectedServices: ComputedRef<BookingBlockInstance[]>`
   - Change `selectedDwellingAdjustment` → `selectedDwellingAdjustments: ComputedRef<BookingBlockInstance[]>`
   - Change `selectBaseService` → `toggleService: (block: BookingBlockInstance) => void`
   - Change `selectDwellingAdjustment` → `toggleDwellingAdjustment: (block: BookingBlockInstance) => void`
   - Change `availableBaseServices` → `availableServices: ComputedRef<BookingBlockInstance[]>`
   - Add `accServices: ComputedRef<BookingBlockInstance[]>`
   - Add `accDwelling: ComputedRef<BookingBlockInstance[]>`
   - Add `accAvailability: ComputedRef<BookingBlockInstance[]>`

2. **Update Any Related Types:**
   - Check for types that reference old property names
   - Update to use new names

**Key Files:**
- `client-vue/src/types/wizard.ts`

**Checkpoint:** Verify types compile and match composable implementation.

---

### Task 1.3.9.3.6: Update Wizard State Plugin

**Goal:** Update wizard state plugin to handle arrays.

**Steps:**
1. **Update WizardStateField Type:**
   - Change `'baseService'` → `'services'`
   - Change `'dwellingAdjustment'` → `'dwellingAdjustments'`
   - Add `'availabilityOptions'` (for consistency)

2. **Update WizardInstance Type:**
   - Change `selectedBaseService` → `selectedServices: ComputedRef<BookingBlockInstance[]>`
   - Change `selectedDwellingAdjustment` → `selectedDwellingAdjustments: ComputedRef<BookingBlockInstance[]>`
   - Change `selectBaseService` → `toggleService` or array-based method

3. **Update getValue() Method:**
   - Return `boolean` (true if item.id is in array)
   - Check: `selectedServices.value.some(s => s.id === item.id)`
   - Handle all three field types (services, dwellingAdjustments, availabilityOptions)

4. **Update setValue() Method:**
   - Toggle item in array (add if not present, remove if present)
   - Use array mutation methods or create new array
   - Handle all three field types

5. **Update watchSource() Method:**
   - Return array ref for reactivity
   - Ensure reactivity works correctly

**Key Files:**
- `client-vue/src/components/booking/plugins/wizardStatePlugin.ts`

**Checkpoint:** Verify state plugin works correctly with arrays.

---

## Key Files

### Frontend
- `client-vue/src/types/appointment.ts`
- `client-vue/src/types/wizard.ts`
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/components/booking/plugins/wizardStatePlugin.ts`

---

## Success Criteria

- ✅ Appointment types updated to use arrays
- ✅ Wizard state refs updated to arrays
- ✅ Selection methods updated to toggle arrays
- ✅ Accumulation computed properties added
- ✅ Wizard types updated to reflect new structure
- ✅ Wizard state plugin updated for array handling
- ✅ All TypeScript types compile correctly
- ✅ State reactivity works correctly

---

## Implementation Notes

- **Array Mutations:** Prefer creating new arrays over mutating (Vue reactivity best practice)
- **Toggle Logic:** Check if item exists, add if not, remove if exists
- **Accumulation Naming:** Use `accServices`, `accDwelling`, `accAvailability` for clarity in calculations
- **State Plugin:** Update to handle boolean selection state (item in array = true)
- **Type Safety:** Ensure all types reflect array structure correctly

---

## Related Documents

- **Parent Session Guide**: `session-1.3.9-guide.md`
- **Previous Sub-Session**: `session-1.3.9.2-guide.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`

---

**Next Sub-Session:** Session 1.3.9.4 - Component Architecture Refactor (NestedSelectionCard)

