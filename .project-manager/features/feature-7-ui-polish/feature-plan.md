# Feature 7: UI Polish

**Feature:** UI Polish  
**Status:** Planning  
**Created:** 2025-02-01  
**Last Updated:** 2025-02-01  
**Branch:** `feature/ui-polish`

---

## Overview

Polish admin panel and booking wizard UI to be "niceish". Fix flow/interactions, improve visual design, ensure consistent styling. Includes bulk updates as a small admin UI enhancement.

**Target:** Transform functional but unpolished UI into a polished, professional interface with improved user experience.

---

## Phase 7.1: Admin Panel UI Polish

**Status:** Not Started  
**Description:** Polish admin panel UI, improve visual design, ensure consistent styling.

### Objectives

- Improve visual design of admin panel
- Ensure consistent styling across all components
- Improve spacing and layout
- Enhance visual hierarchy
- Improve form layouts and dialogs

### Key Files

- `client/src/views/admin/AdminPanel.vue`
- `client/src/components/admin/`
- `client/src/components/admin/generic/`

### Success Criteria

- Admin panel has polished, professional appearance
- Consistent styling throughout
- Improved spacing and layout
- Clear visual hierarchy
- Forms and dialogs are well-designed

---

## Phase 7.2: Booking Wizard UI Polish

**Status:** Not Started  
**Description:** Polish booking wizard UI, improve visual design, ensure consistent styling. Comprehensive redesign based on vision notes.

### Objectives

- Redesign wizard navigation (top bar with icons)
- Implement quote/book toggle UI
- Update service selection UI (inline radio, component sub-selections)
- Update property details UI (big square cards, component sub-selections)
- Redesign availability page layout (calendar always visible, date range support)
- Polish summary page

### Tasks

**Wizard Navigation Redesign:**
- Move expandable nav bar from left side to top (slender bar across top)
- Replace step numbers with icons:
  - Step 1 (service selection): lens icon (Sherlock Holmes lens)
  - Step 2 (property details): house icon
  - Step 3 (appointment availability): calendar icon
  - Step 4 (personal information): person's upper body silhouette icon
  - Step 5 (summary): checkmark icon
- Show selected service name under icon when nav bar expands (from block instance)
- Change icon button color when step is completed

**Quote/Book Toggle UI:**
- Create slender card that stretches across whole wizard
- Position directly under nav bar
- Visible on all steps of wizard
- "Quote only" text on right side
- User type selection on left side
- Toggle controls color palette (different light/dark palettes)
- Quote mode: washed out or different secondary color

**Service Selection UI:**
- Hide ServiceType row and selections entirely until a usertype is picked
- Radio inline with service name (not separate)
- When unselected: description annotation indented one tab space from title
- When selected: show valid block instance components (non-top-line, optional) as mini sub-selections
- Components smaller and indented in card (not separate cards)
- Example: Buyer's inspection selected → show blue tape, radon as sub-selections

**Property Details UI:**
- Property type cards: big square cards extending side-to-side
- Cards shrink/grow to fill row (no wrap)
- When dwelling adjustment selected: show valid block instance components as mini sub-selections
- Components smaller and indented in card (not separate cards)
- Example: Foundation selected → show crawlspace, decks as sub-selections
- Show MLS API data in detail fields when populated (square footage, bedrooms, etc.)

**Availability Page Layout:**
- Calendar always visible on left side (replace select date field)
- Option to select exact date or date range
- Under calendar: database-driven availability options list
- List width matches calendar, extends left to right of calendar (fit column width)
- Availability options: radio, title, smaller indented description
- All data from schedulerData block instance cascade
- Descriptions wrapped in cardbutton
- Time slot buttons in right column
- Date at top left of time slot button set
- Time slot buttons in card with date as title
- If date range selected: show subsequent days with their own slot sets

**Summary Page:**
- Reference Jose's example modal design
- Polish summary page to match design

### Key Files

- `client/src/components/booking/BookingWizard.vue` (nav bar redesign)
- `client/src/components/booking/steps/ServiceSelectionStep.vue` (service UI updates)
- `client/src/components/booking/steps/PropertyDetailsStep.vue` (property UI updates)
- `client/src/components/booking/steps/AvailabilityStep.vue` (calendar layout)
- `client/src/components/booking/steps/ConfirmationStep.vue` (summary polish)
- `client/src/components/booking/QuoteModeToggle.vue` (new)
- `client/src/composables/useQuoteMode.ts` (new, for color palette)

### Success Criteria

- Nav bar redesigned to top with icons
- Quote mode toggle card functional and visible on all steps
- Service selection shows components as sub-selections
- Property details shows components as sub-selections
- Availability page has calendar always visible with date range support
- Summary page matches Jose's design
- All UI elements properly styled and responsive

---

## Phase 7.3: Responsive Design and Mobile Optimization

**Status:** Not Started  
**Description:** Optimize responsive design and mobile experience.

### Objectives

- Ensure responsive design works well on all screen sizes
- Optimize mobile experience
- Improve touch interactions
- Test on various devices

### Key Files

- All UI components
- `client/src/components/admin/`
- `client/src/components/booking/`

### Success Criteria

- Responsive design works well on all screen sizes
- Mobile experience is optimized
- Touch interactions are smooth
- Tested on various devices

---

## Phase 7.4: Bulk Updates Enhancement

**Status:** Not Started  
**Description:** Add bulk update functionality for composite/composable members as a small admin UI enhancement.

### Objectives

- Add template row showing shared values across members
- Enable bulk updates from template row
- Support distribution strategies (proportional, equal, manual)
- Add visual indicators for identical vs mixed field values

### Key Files

- `client/src/composables/useBulkUpdate.ts` (new)
- `client/src/components/admin/bulk/BulkUpdateTemplateRow.vue` (new)
- `client/src/components/admin/PartInstanceNestedList.vue`

### Key Deliverables

- `useBulkUpdate` composable with member comparison logic
- `BulkUpdateTemplateRow.vue` component
- Backend bulk update API endpoint (if needed)
- Integration into member list components
- Distribution preview modal

### Success Criteria

- Users can see shared values across all members in template row
- Users can bulk update all members from template row
- Users can select specific members for bulk updates
- System correctly identifies identical vs mixed fields
- Bulk updates apply correctly with proper validation
- UI is intuitive and follows existing design patterns

### Note

This is a **small admin UI enhancement**, not a separate feature. It's included here as part of UI polish work.

---

## Reference Documents

- **Vue Migration Phase 11**: `project-manager/PROJECT_PLAN.md` (Phase 11 - moved here)
- **Admin UI Overhaul**: `project-manager/features/admin-ui-overhaul/feature-plan.md` (for reference)
- **UI Polish Vision Notes**: User notes on UI polish requirements

---

## Dependencies

- Feature 0: Vue.js Migration (Core Complete)
- Feature 1: Data Flow Alignment (recommended but not required)
- Feature 2: Google APIs Integration (recommended but not required)

---

## Success Metrics

- Admin panel UI is polished and professional
- Booking wizard UI is polished and professional
- Responsive design works well on all devices
- Bulk updates functionality working correctly
- Consistent styling throughout application

---

**Last Updated:** 2025-02-01  
**Status:** Planning - Ready for Implementation
