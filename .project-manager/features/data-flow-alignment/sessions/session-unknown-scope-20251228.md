# Scope and Summary

**Session:** Unknown
**Phase:** 1.3
**Created:** 2025-12-28
**Status:** pending

---

## Scope and Summary

**Tier:** Session
**Confidence:** High
**Recommended Command:** `/plan-session 1.3.5 "Availability Calendar Redesign"`

### Summary
Redesign the AvailabilityStep calendar component to replace the current VTextField date input with a permanent calendar widget similar to Calendly's booking interface. The calendar should be positioned on the left side of the screen (responsive: top on mobile), display the full month view permanently (always visible, not hidden in dropdown), show the current day with an outline/border, and highlight the selected day using the CSS theme's primary color. The calendar must be fully reactive, accessible, and maintain existing validation integration.

### Key Changes
1. Replace VTextField date input with permanent calendar widget (VDatePicker or VCalendar)
2. Reposition calendar to left side of screen (responsive: top on mobile)
3. Display full month view permanently (always visible)
4. Style current day with outline/border (neutral color)
5. Style selected day with primary color highlight
6. Ensure calendar is fully reactive with wizard state
7. Add proper ARIA labels and keyboard navigation
8. Maintain existing date validation integration
9. Update responsive layout for mobile-first approach
10. Ensure touch-friendly date selection (44x44px minimum)

### Scope Assessment
- **Duration:** 2-4 hours
- **Complexity:** Medium
- **Files Affected:** `client-vue/src/components/booking/steps/AvailabilityStep.vue`, potentially `client-vue/src/components/booking/steps/AvailabilityStep.vue` styles
- **Documentation Impact:** Yes
- **Research Needed:** Yes (Vuetify VDatePicker/VCalendar component capabilities, accessibility patterns)
- **Dependencies:** None

### Tier Reasoning
- **Session-level change:** Focused on single component redesign with clear scope
- **UI/UX improvement:** Enhances user experience without changing core functionality
- **Single component:** Primarily affects AvailabilityStep.vue component
- **Self-contained:** No dependencies on other sessions or phases
- **Medium complexity:** Requires component replacement, styling, accessibility work, but well-defined scope

### Ready for Change Request
Copy this description:
```
Redesign the AvailabilityStep calendar component with the following requirements:

VISUAL DESIGN:
- Replace the VTextField date input with a permanent calendar widget (similar to Calendly)
- Position calendar on left side of screen (responsive: top on mobile)
- Display full month view permanently (always visible, not hidden in dropdown)
- Current day: Show with outline/border (e.g., 2px solid border in neutral color)
- Selected day: Highlight using CSS theme primary color (background or border)
- Calendar should match Vuetify design system styling

FUNCTIONALITY:
- Calendar must be fully reactive - updates immediately when dates are selected
- Selected date state must sync with wizard state (selectedDate ref)
- Calendar should show available dates clearly (consider visual distinction for dates with available time slots)
- Time slot selection remains on right side (below on mobile) and updates when calendar date changes
- Maintain existing date validation (not in past, required)

ACCESSIBILITY:
- Proper ARIA labels for calendar navigation (month/year selectors, day buttons)
- Keyboard navigation: Arrow keys to navigate days, Enter/Space to select
- Screen reader support: Announce selected date, current date, available dates
- Focus management: Proper focus indicators and logical tab order
- Use Vuetify VDatePicker component if possible, or custom calendar with full accessibility

RESPONSIVENESS:
- Mobile-first approach: Calendar stacks above time slots on small screens
- Touch-friendly: Minimum 44x44px touch targets for date selection
- Responsive grid: Calendar takes appropriate width on different screen sizes

TECHNICAL:
- Use Vuetify components where possible (VDatePicker or custom VCalendar)
- Maintain existing validation integration (useFormValidation composable)
- Ensure state updates trigger proper reactivity (watch selectedDate changes)
- Preserve existing date range structure (selectedDate.start/end)
- Update AvailabilityStep.vue component
```

**Suggested command:**
```
/plan-session 1.3.5 "Availability Calendar Redesign"
```

---

## Execution
To execute this change: `/execute-scoped-change [session-id]`

