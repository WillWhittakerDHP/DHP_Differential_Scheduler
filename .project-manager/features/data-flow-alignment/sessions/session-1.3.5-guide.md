# Session 1.3.5 Guide: Availability Calendar Redesign

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.5 - Availability Calendar Redesign  
**Status:** Not Started  
**Priority:** Medium (User experience improvement)  
**Created:** 2025-12-28

---

## Session Overview

**Session Number:** 1.3.5  
**Session Name:** Availability Calendar Redesign  
**Description:** Redesign the AvailabilityStep calendar component to replace the VTextField date input with a permanent calendar widget similar to Calendly's booking interface. The calendar should be positioned on the left side of the screen, display the full month view permanently, show the current day with an outline/border, and highlight the selected day using the CSS theme's primary color.

**Dependencies:** Session 1.3.4 (Form Interaction Fixes) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand Vuetify calendar components (VDatePicker, VCalendar)
- Understand Vue 3 reactivity patterns for calendar state management
- Understand accessibility requirements for calendar components (ARIA labels, keyboard navigation)
- Review Calendly's calendar design patterns for inspiration

**During Session:**
- Learn how to implement permanent calendar widgets in Vue/Vuetify
- Learn how to style calendar components with custom CSS
- Learn how to ensure calendar accessibility (keyboard navigation, screen readers)
- Learn responsive design patterns for calendar components

**After Session:**
- Understand how to create permanent calendar widgets in Vuetify
- Understand accessibility patterns for calendar components
- Understand responsive design for calendar components
- Understand how to integrate calendar state with wizard state

---

## Objectives

- Replace VTextField date input with permanent calendar widget
- Position calendar on left side of screen (responsive: top on mobile)
- Display full month view permanently (always visible)
- Style current day with outline/border
- Style selected day with primary color highlight
- Ensure calendar is fully reactive with wizard state
- Add proper ARIA labels and keyboard navigation
- Maintain existing date validation integration
- Update responsive layout for mobile-first approach
- Ensure touch-friendly date selection

---

## Tasks

### Task 1.3.5.1: Research Vuetify Calendar Components

**Goal:** Research Vuetify calendar components and determine the best approach for implementing a permanent calendar widget.

**Steps:**
1. Research Vuetify VDatePicker component capabilities
2. Research Vuetify VCalendar component capabilities
3. Compare VDatePicker vs VCalendar for permanent display use case
4. Research accessibility features of Vuetify calendar components
5. Research styling options for customizing calendar appearance
6. Document findings and decision on which component to use

**Key Files:**
- Vuetify documentation (external)
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Current implementation

**Checkpoint:** Document component choice and rationale.

---

### Task 1.3.5.2: Replace Date Input with Calendar Widget

**Goal:** Replace the VTextField date input with a permanent calendar widget component.

**Steps:**
1. **Import Calendar Component:**
   - Import VDatePicker or VCalendar component
   - Set up component in template

2. **Configure Calendar Display:**
   - Set calendar to display full month view
   - Configure calendar to be always visible (not in dropdown)
   - Set up calendar positioning (left side on desktop, top on mobile)

3. **Bind Calendar to State:**
   - Connect calendar v-model to selectedDate ref
   - Ensure calendar updates when selectedDate changes
   - Ensure selectedDate updates when calendar date is selected

4. **Remove Old Date Input:**
   - Remove VTextField date input component
   - Clean up any unused computed properties or handlers

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Replace date input with calendar

**Checkpoint:** Verify calendar displays correctly and state binding works.

---

### Task 1.3.5.3: Style Calendar with Current Day and Selected Day Highlighting

**Goal:** Style the calendar to show the current day with an outline/border and the selected day with primary color highlight.

**Steps:**
1. **Style Current Day:**
   - Add CSS to outline/border current day (2px solid border in neutral color)
   - Ensure current day styling is visible and clear
   - Test current day styling across different months

2. **Style Selected Day:**
   - Add CSS to highlight selected day with primary color
   - Use CSS theme primary color (background or border)
   - Ensure selected day styling is distinct from current day styling
   - Test selected day styling

3. **Style Calendar Container:**
   - Position calendar on left side (desktop) or top (mobile)
   - Ensure calendar matches Vuetify design system styling
   - Add appropriate spacing and padding

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Add calendar styling

**Checkpoint:** Verify calendar styling matches requirements (current day outline, selected day highlight).

---

### Task 1.3.5.4: Ensure Calendar Reactivity and State Synchronization

**Goal:** Ensure the calendar is fully reactive and properly synchronized with wizard state.

**Steps:**
1. **Verify State Binding:**
   - Test that calendar selection updates selectedDate ref
   - Test that selectedDate changes update calendar display
   - Verify state synchronization works correctly

2. **Update Time Slot Display:**
   - Ensure time slot selection updates when calendar date changes
   - Verify time slots are fetched for newly selected date
   - Test reactive updates when date is changed

3. **Handle State Updates:**
   - Ensure watch handlers work correctly with calendar
   - Verify computed properties update when calendar date changes
   - Test edge cases (loading appointments, resetting wizard)

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Verify reactivity

**Checkpoint:** Verify calendar reactivity and state synchronization work correctly.

---

### Task 1.3.5.5: Add Accessibility Features

**Goal:** Add proper ARIA labels, keyboard navigation, and screen reader support to the calendar.

**Steps:**
1. **Add ARIA Labels:**
   - Add aria-label to calendar navigation controls (month/year selectors)
   - Add aria-label to day buttons
   - Add aria-describedby for selected date announcement
   - Add aria-live region for date selection announcements

2. **Implement Keyboard Navigation:**
   - Ensure arrow keys navigate between days
   - Ensure Enter/Space keys select date
   - Ensure Tab key navigates through calendar controls
   - Ensure Escape key closes any open calendar menus

3. **Screen Reader Support:**
   - Ensure selected date is announced to screen readers
   - Ensure current date is announced to screen readers
   - Ensure available dates are clearly indicated
   - Test with screen reader (if possible)

4. **Focus Management:**
   - Ensure proper focus indicators are visible
   - Ensure logical tab order through calendar
   - Ensure focus returns to calendar after date selection

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Add accessibility features

**Checkpoint:** Verify accessibility features work correctly (keyboard navigation, screen reader support).

---

### Task 1.3.5.6: Implement Responsive Layout

**Goal:** Ensure the calendar layout is responsive and works well on mobile devices.

**Steps:**
1. **Mobile-First Layout:**
   - Ensure calendar stacks above time slots on small screens
   - Adjust calendar width for mobile devices
   - Ensure calendar is readable on small screens

2. **Touch-Friendly Design:**
   - Ensure date selection buttons are minimum 44x44px
   - Ensure adequate spacing between date buttons
   - Test touch interactions on mobile devices (if possible)

3. **Responsive Grid:**
   - Adjust calendar column width for different screen sizes
   - Ensure calendar and time slots layout correctly on all breakpoints
   - Test responsive layout across breakpoints

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Update responsive layout

**Checkpoint:** Verify responsive layout works correctly on all screen sizes.

---

### Task 1.3.5.7: Maintain Validation Integration

**Goal:** Ensure existing date validation continues to work with the new calendar component.

**Steps:**
1. **Verify Validation Rules:**
   - Ensure date validation rules still apply to calendar selection
   - Test that past dates cannot be selected
   - Test that required validation works correctly

2. **Update Error Display:**
   - Ensure validation errors display correctly with calendar
   - Ensure error messages are accessible
   - Test error state handling

3. **Test Validation Flow:**
   - Test validation prevents invalid date selection
   - Test validation allows valid date selection
   - Test validation error clearing when valid date is selected

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Verify validation integration
- `client-vue/src/composables/useFormValidation.ts` - Validation rules

**Checkpoint:** Verify validation integration works correctly with calendar component.

---

## Key Files

### Components
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Main component to update

### Composables
- `client-vue/src/composables/useFormValidation.ts` - Validation rules (verify integration)

### Styles
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Component styles (scoped)

---

## Success Criteria

- ✅ Calendar widget replaces VTextField date input
- ✅ Calendar displays full month view permanently (always visible)
- ✅ Calendar positioned on left side (desktop) or top (mobile)
- ✅ Current day shown with outline/border (neutral color)
- ✅ Selected day highlighted with primary color
- ✅ Calendar is fully reactive with wizard state
- ✅ Calendar has proper ARIA labels and keyboard navigation
- ✅ Calendar is responsive and touch-friendly
- ✅ Date validation integration maintained
- ✅ Calendar matches Vuetify design system styling

---

## Implementation Notes

### Component Choice
- **VDatePicker vs VCalendar:** Research which component better supports permanent display
- **VDatePicker:** Typically used for date input fields, may need configuration for permanent display
- **VCalendar:** Designed for calendar display, may be better suited for permanent calendar widget
- **Decision:** Research both and choose based on accessibility, styling options, and permanent display support

### Styling Approach
- Use Vuetify's theming system for primary color
- Use CSS custom properties for current day outline
- Ensure styles are scoped to avoid conflicts
- Test styles across different themes

### State Management
- Maintain existing selectedDate ref structure (start/end)
- Ensure calendar selection updates selectedDate.start
- Ensure selectedDate changes update calendar display
- Use watch handlers for reactive updates

### Accessibility Considerations
- Vuetify calendar components may have built-in accessibility features
- Verify and enhance accessibility as needed
- Test with keyboard navigation
- Test with screen reader (if possible)

### Responsive Design
- Use Vuetify's grid system (VRow/VCol) for layout
- Use responsive breakpoints (sm, md, lg, xl)
- Ensure calendar stacks above time slots on mobile
- Test on multiple screen sizes

---

## Learning Checkpoints

**After Task 1.3.5.1 (Research Vuetify Calendar Components):**
- Which Vuetify component was chosen for the calendar?
- Why was this component chosen over alternatives?
- What accessibility features does the component provide?

**After Task 1.3.5.2 (Replace Date Input with Calendar Widget):**
- How is the calendar component configured for permanent display?
- How is the calendar bound to selectedDate state?
- Does the calendar update correctly when state changes?

**After Task 1.3.5.3 (Style Calendar):**
- How is the current day styled (outline/border)?
- How is the selected day styled (primary color)?
- Does the calendar match Vuetify design system styling?

**After Task 1.3.5.4 (Ensure Reactivity):**
- How does the calendar stay synchronized with wizard state?
- How do time slots update when calendar date changes?
- Are there any edge cases that need special handling?

**After Task 1.3.5.5 (Add Accessibility):**
- What ARIA labels were added to the calendar?
- How does keyboard navigation work?
- How is screen reader support implemented?

**After Task 1.3.5.6 (Implement Responsive Layout):**
- How does the calendar layout change on mobile devices?
- Are date selection buttons touch-friendly?
- Does the responsive layout work correctly across breakpoints?

**After Task 1.3.5.7 (Maintain Validation):**
- How does date validation work with the calendar?
- Are validation errors displayed correctly?
- Does validation prevent invalid date selection?

---

## Related Documents

- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Phase Handoff**: `../phases/phase-1.3-handoff.md`
- **Feature Plan**: `../feature-plan.md`
- **Scope Document**: `session-unknown-scope-20251228.md`

---

**Session Status:** Not Started  
**Next Session:** Phase 1.4 - Admin Panel Data Flow Fixes (after Phase 1.3 completion)

