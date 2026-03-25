# Session 1.2.1 Guide: Expandable Card Buttons with Component Options

**Feature:** Data Flow Alignment  
**Phase:** 1.2 - Booking Wizard Data Flow Fixes  
**Session:** 1.2.1 - Expandable Card Buttons with Component Options  
**Status:** Not Started  
**Created:** 2025-12-04

---

## Session Overview

**Goal:** Enhance `SelectionCardGroup` component to support expandable cards that show nested component options when a selection has visible components. Cards with `isComposite: true` and visible components expand when selected. Cards without visible components remain normal (non-expandable).

**Priority:** High - Complete before data alignment tasks begin

**Dependencies:** Phase 1.1 (Database Setup & Appointment Structure) ✅ Complete

---

## Objectives

1. Add expandable card functionality to `SelectionCardGroup`
2. Cards with `isComposite: true` and visible components expand when selected
3. Cards without visible components remain normal (non-expandable)
4. Support both selections with components and without components
5. Handle nested component selection state independently from parent selection

---

## Tasks

### Task 1: Update SelectionCardGroup Component Interface

**File**: `client-vue/src/components/booking/SelectionCardGroup.vue`

**Changes**:
- Add props to support component data:
  - `componentData?: (item: SelectionCardItem) => { isComposite: boolean; visibleComponents: SelectionCardItem[] } | null` - Function to get component data for an item
  - `showNestedComponents?: boolean` - Flag to enable nested component display (default: true)
- Update `SelectionCardItem` interface to include optional `isComposite` and `activeComponents` properties
- Add computed property to determine if an item should be expandable:
  - Check if item has `isComposite: true`
  - Check if item has visible components (filter `activeComponents` by `visible: true`)

### Task 2: Add Expansion State Management

**File**: `client-vue/src/components/booking/SelectionCardGroup.vue`

**Changes**:
- Add reactive state to track expanded cards:
  - `expandedCardIds: Set<string>` - Track which cards are currently expanded
- Add method to toggle expansion: `toggleCardExpansion(itemId: string)`
- Auto-expand when card is selected (if it has visible components)
- Auto-collapse when card is deselected

### Task 3: Add Expansion UI

**File**: `client-vue/src/components/booking/SelectionCardGroup.vue`

**Changes**:
- Add expansion indicator (chevron icon) to expandable cards
- Add transition/animation for expansion/collapse
- Add nested `SelectionCardGroup` component inside expanded card:
  - Render nested cards for visible components only
  - Use appropriate layout (likely stack layout for nested cards)
  - Support both radio and checkbox modes for nested components
  - Handle nested component selection state

### Task 4: Component Data Integration

**Files**:
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`

**Changes**:
- Update `SelectionCardGroup` usage to pass component data:
  - Create computed property that maps items to component data
  - Use `useComponentEntity` to get `activeComponents` for each item
  - Filter components by `visible: true` property
  - Transform components to `SelectionCardItem[]` format
  - Pass `componentData` function to `SelectionCardGroup`

### Task 5: Styling and Animation

**File**: `client-vue/src/components/booking/SelectionCardGroup.vue`

**Changes**:
- Add CSS for expansion animation:
  - Smooth height transition for expansion/collapse
  - Nested card container styling (indentation, background)
  - Expansion indicator styling (chevron rotation)
- Ensure nested cards are visually distinct but consistent with parent card style
- Add proper spacing and padding for nested content

### Task 6: Selection State Management

**File**: `client-vue/src/components/booking/SelectionCardGroup.vue`

**Changes**:
- Handle nested component selections:
  - Support separate selection state for nested components
  - Emit nested component selections via new event: `update:nestedSelection`
  - Maintain parent selection state independently
- Ensure parent card selection doesn't interfere with nested component selections
- Handle deselection: collapse nested components when parent is deselected

---

## Key Files

### Components
- `client-vue/src/components/booking/SelectionCardGroup.vue` - Main component to update
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` - Usage example
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue` - Usage example

### Composables
- `client-vue/src/composables/useComponentEntity.ts` - Component data access

### Types
- `client-vue/src/types/entities.ts` - Type definitions

---

## Architecture Notes

### Component Detection Logic

```typescript
function shouldExpand(item: SelectionCardItem): boolean {
  // Check if item is composite
  if (!item.isComposite) return false
  
  // Check if item has visible components
  const visibleComponents = item.activeComponents?.filter(
    comp => comp.visible === true
  ) || []
  
  return visibleComponents.length > 0
}
```

### Data Flow

1. Parent component passes items with `isComposite` and `activeComponents` properties
2. `SelectionCardGroup` detects expandable cards
3. When card is selected and expandable, it expands automatically
4. Nested `SelectionCardGroup` renders visible components
5. Nested component selections are handled separately from parent selection

### Component Data Structure

```typescript
interface SelectionCardItem {
  id: string
  name: string
  description?: string
  icon?: string
  isComposite?: boolean  // New: indicates if card has components
  activeComponents?: Array<{  // New: component items
    id: string
    name: string
    description?: string
    icon?: string
    visible: boolean
  }>
}
```

---

## Success Criteria

- [ ] Cards with `isComposite: true` and visible components expand when selected
- [ ] Cards without visible components do not expand (remain normal)
- [ ] Nested component cards display correctly with proper styling
- [ ] Expansion/collapse animations work smoothly
- [ ] Nested component selections work independently from parent selection
- [ ] Works with both radio and checkbox selection modes
- [ ] Expansion state persists correctly during selection changes
- [ ] No visual glitches or layout issues during expansion

---

## Testing Checklist

- [ ] Test card expansion with composite items that have visible components
- [ ] Test card behavior with composite items that have no visible components
- [ ] Test card behavior with non-composite items
- [ ] Test nested component selection (radio mode)
- [ ] Test nested component selection (checkbox mode)
- [ ] Test expansion/collapse animations
- [ ] Test expansion state when parent card is deselected
- [ ] Test multiple expanded cards simultaneously
- [ ] Test responsive behavior on mobile devices
- [ ] Verify no layout shifts or visual glitches

---

## Related Documents

- **Plan**: `@/Users/districthomepro/.cursor/plans/expandable_card_buttons_with_component_options_ff8d8f2c.plan.md`
- **Phase Guide**: `../phases/phase-1.2-guide.md`
- **Phase Handoff**: `../phases/phase-1.2-handoff.md`
- **Feature Guide**: `../feature-data-flow-alignment-guide.md`

---

**Session Status:** Not Started  
**Ready to begin:** Yes



















