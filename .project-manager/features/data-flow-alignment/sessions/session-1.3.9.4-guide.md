# Session 1.3.9.4 Guide: Component Architecture Refactor (NestedSelectionCard)

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9.4 - Component Architecture Refactor (NestedSelectionCard)  
**Status:** Not Started  
**Priority:** High (Foundation for UI components)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.9.4  
**Session Name:** Component Architecture Refactor (NestedSelectionCard)  
**Description:** Separate SelectionCard component into two focused components: SelectionCard (parent cards only) and NestedSelectionCard (child cards only). This eliminates the `isParent` conditional logic, simplifies state management, and resolves context update issues.

**Dependencies:** Session 1.3.9.3 (Frontend Type and Wizard State Updates) ✅ Complete

---

---

## Objectives

- Create NestedSelectionCard component (new)
- Simplify SelectionCard (remove isParent logic)
- Update SelectionCardGroup to use NestedSelectionCard
- Update SelectionCardGroup props to support arrays

---

## Tasks

### Task 1.3.9.4.1: Create NestedSelectionCard Component

**Goal:** Create new component for nested child cards only.

**Steps:**
1. **Create Component File:**
   - Create `client-vue/src/components/booking/NestedSelectionCard.vue`
   - Set up basic Vue 3 Composition API structure

2. **Define Props Interface:**
   ```typescript
   interface Props {
     item: SelectionCardItem
     config: SelectionCardConfig
     modelValue: boolean // Selected state (for checkbox)
     appearance?: Partial<SelectionCardConfig['appearance']>
   }
   ```

3. **Implement Checkbox Selection:**
   - Use VCheckbox component (not VRadio)
   - Bind to `modelValue` prop
   - Emit `update:modelValue` with boolean value

4. **Add Styling:**
   - Apply nested card styling (left-aligned, indented)
   - Share styling with SelectionCard (via shared CSS or mixins)
   - Ensure visual consistency

5. **Handle Click Events:**
   - Handle card click to toggle selection
   - Emit update event with new boolean value

**Key Files:**
- `client-vue/src/components/booking/NestedSelectionCard.vue` (new)

**Checkpoint:** Verify NestedSelectionCard component renders correctly.

---

### Task 1.3.9.4.2: Simplify SelectionCard Component

**Goal:** Remove isParent logic and nested child rendering from SelectionCard.

**Steps:**
1. **Remove isParent Prop:**
   - Remove `isParent` prop from Props interface
   - Remove all `if (!props.isParent)` conditional logic
   - Remove nested card rendering path (lines 467-510 if they exist)

2. **Remove Nested Child Rendering:**
   - Remove direct VLabel/VRadio rendering for nested children (lines 526-572 if they exist)
   - Replace with `NestedSelectionCard` component usage
   - Remove `selectedChildren` prop
   - Remove `toggleChildSelection` function
   - Remove `isChildSelected` function

3. **Update Props Interface:**
   ```typescript
   interface Props {
     item: SelectionCardItem
     config: SelectionCardConfig
     modelValue?: string | null | string[] // Support both radio and checkbox
     isExpanded?: boolean
     // Remove: isParent, selectedChildren, nestedConfig
   }
   ```

4. **Update Nested Children Rendering:**
   - Import NestedSelectionCard component
   - Replace direct VLabel/VRadio rendering with `NestedSelectionCard` components
   - Use `v-for` to render multiple `NestedSelectionCard` instances
   - Pass `item`, `config`, and `modelValue` props to `NestedSelectionCard`
   - Handle `update:modelValue` events from `NestedSelectionCard`

5. **Update Emits:**
   - Remove `update:nestedSelection` emit
   - Keep `update:modelValue` and `toggle-expansion` emits

**Key Files:**
- `client-vue/src/components/booking/SelectionCard.vue`

**Checkpoint:** Verify SelectionCard simplified and works correctly.

---

### Task 1.3.9.4.3: Update SelectionCardGroup Component

**Goal:** Update SelectionCardGroup to use NestedSelectionCard and support arrays.

**Steps:**
1. **Import NestedSelectionCard:**
   ```typescript
   import NestedSelectionCard from './NestedSelectionCard.vue'
   ```

2. **Update Props Interface:**
   - Update `modelValue` to support `string | null | string[]` (for checkbox mode)
   - Keep backward compatibility with radio mode

3. **Update internalValue Computed:**
   - Handle array values for checkbox mode
   - Keep single value for radio mode (backward compatibility)

4. **Update Nested Selection Handling:**
   - Remove `nestedSelections` ref (no longer needed)
   - Remove `handleNestedSelection` function
   - Update nested children rendering to use `NestedSelectionCard`

5. **Update SelectionCard Usage:**
   - Remove `selectedChildren` prop from SelectionCard
   - Remove `update:nested-selection` event handler
   - Pass `isExpanded` state to SelectionCard

6. **Update Nested Selection State:**
   - Track nested selections at SelectionCardGroup level
   - Update state when `NestedSelectionCard` emits `update:modelValue`
   - Pass selected state to `NestedSelectionCard` via `modelValue` prop

7. **Update Emit Logic:**
   - `update:modelValue` should emit `string[]` for checkbox, `string | null` for radio
   - Handle array updates correctly

**Key Files:**
- `client-vue/src/components/booking/SelectionCardGroup.vue`

**Checkpoint:** Verify SelectionCardGroup works with NestedSelectionCard and arrays.

---

### Task 1.3.9.4.4: Update Component Registration

**Goal:** Ensure NestedSelectionCard is properly registered and available.

**Steps:**
1. **Check Component Registration:**
   - Verify NestedSelectionCard is imported where needed
   - Ensure it's available in component tree

2. **Update Any Component Exports:**
   - If components are exported, add NestedSelectionCard
   - Update any index files if needed

**Key Files:**
- Component files that import/use SelectionCardGroup

**Checkpoint:** Verify components are properly registered.

---

## Key Files

### Frontend
- `client-vue/src/components/booking/NestedSelectionCard.vue` (new)
- `client-vue/src/components/booking/SelectionCard.vue`
- `client-vue/src/components/booking/SelectionCardGroup.vue`

---

## Success Criteria

- ✅ NestedSelectionCard component created and working
- ✅ SelectionCard simplified (removed isParent logic)
- ✅ SelectionCardGroup updated to use NestedSelectionCard
- ✅ SelectionCardGroup supports arrays (checkbox mode)
- ✅ Nested children render correctly with NestedSelectionCard
- ✅ State management simplified (no props drilling)
- ✅ Context update issues resolved
- ✅ All components compile and render correctly

---

## Implementation Notes

- **Component Separation:** Clear separation of concerns - SelectionCard for parents, NestedSelectionCard for children
- **Checkbox Pattern:** Use VCheckbox for multi-select, boolean modelValue
- **State Management:** NestedSelectionCard manages its own state, communicates via emits
- **Styling:** Share styling between components for consistency
- **Backward Compatibility:** Keep radio mode support in SelectionCardGroup for existing uses

---

## Related Documents

- **Parent Session Guide**: `session-1.3.9-guide.md`
- **Previous Sub-Session**: `session-1.3.9.3-guide.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Original Plan**: `../../../../.cursor/plans/multi-select_services_refactor_83ca41e7.plan.md` (Component Architecture section)

---

**Next Sub-Session:** Session 1.3.9.5 - UI Component Updates and Integration
