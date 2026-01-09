# Session 1.3.6 Guide: TimeSlotGrid Enhancement and AvailabilityStep Refactoring

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.6 - TimeSlotGrid Enhancement and AvailabilityStep Refactoring  
**Status:** Not Started  
**Priority:** High (Foundation for differential scheduling)  
**Created:** 2025-12-29

---

## Session Overview

**Session Number:** 1.3.6  
**Session Name:** TimeSlotGrid Enhancement and AvailabilityStep Refactoring  
**Description:** Enhance TimeSlotGrid component and refactor AvailabilityStep to support dynamic responsive layout with vertical scrolling, time range display, conditional Inspector/Client toggle based on differential property, Time On-Site Graph bars, and client-side availability calculations from part instances.

**Dependencies:** Session 1.3.5 (Availability Calendar Redesign) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand differential scheduling concept and requirements from USER_STORY.md
- Understand Time On-Site Graph requirements (two bars showing inspector and client times)
- Understand part instances structure and how baseTime is used for duration calculations
- Review existing TimeSlotGrid component and useAvailability composable
- Understand database migration patterns for adding columns

**During Session:**
- Learn how to implement dynamic responsive layouts with ResizeObserver
- Learn how to calculate time slots from part instances (client-side calculations)
- Learn how to implement Time On-Site Graph visualization
- Learn database migration patterns for adding boolean columns
- Learn how to conditionally display UI based on service properties

**After Session:**
- Understand how to create responsive grid layouts with scrolling fallbacks
- Understand how to calculate availability from part instances
- Understand how to implement differential scheduling UI
- Understand database migration and seeding patterns

---

## Objectives

- Add `differential` property to block_instances table (database migration)
- Update BlockInstance model and BookingBlockInstance type
- Enhance TimeSlotGrid to display time ranges instead of single times
- Implement vertical scrolling when space is limited
- Implement full-width row fallback when space is insufficient
- Conditionally display Inspector/Client toggle based on differential property
- Replace slider with Time On-Site Graph bars
- Refactor useAvailability to calculate from part instances (not API)

---

## Tasks

### Task 1.3.6.1: Database Migration and Model Updates

**Goal:** Add `differential` column to `block_instances` table and update models.

**Steps:**
1. **Create Database Migration:**
   - Create migration file: `server/src/db/migrations/[timestamp]_add_differential_to_block_instances.mjs`
   - Add `differential` boolean column with default `false`
   - Add NOT NULL constraint
   - Update existing records (set to false initially)

2. **Update BlockInstance Model:**
   - Add `differential: boolean` property declaration
   - Add field definition in model init
   - Ensure field maps correctly to database column

3. **Create Seeder for Differential Services:**
   - Create seeder file: `server/src/db/seeders/[timestamp]_seed_differential_services.mjs`
   - Find services by name ("Buyer's Inspection", "Investor's Inspection")
   - Update differential column to true for these services

**Key Files:**
- `server/src/db/migrations/[timestamp]_add_differential_to_block_instances.mjs` - New migration
- `server/src/db/models/booking/block_instance.ts` - Update model
- `server/src/db/seeders/[timestamp]_seed_differential_services.mjs` - New seeder

**Checkpoint:** Verify migration runs successfully and differential property appears in model.

---

### Task 1.3.6.2: Update BookingBlockInstance Type

**Goal:** Add differential property to BookingBlockInstance type so it's available in frontend.

**Steps:**
1. **Update Type Definition:**
   - Add `differential: boolean` to BookingBlockInstance type definition
   - Ensure type matches BlockInstance model structure

2. **Update Transformer:**
   - Ensure transformer includes differential property when transforming BlockInstance
   - Verify differential property flows through to booking data

**Key Files:**
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Update type and transformer

**Checkpoint:** Verify BookingBlockInstance includes differential property and it's accessible in components.

---

### Task 1.3.6.3: Enhance TimeSlotGrid with Time Range Display

**Goal:** Update TimeSlotGrid to display time ranges ("9:00 AM - 9:15 AM") instead of single times.

**Steps:**
1. **Update Component Props:**
   - Change props to accept `TimeSlot[]` instead of `string[]`
   - Update selectedSlot prop to be `TimeSlot | null` instead of `string | null`

2. **Create Time Range Formatting Function:**
   - Create `formatTimeRange()` function to format slotStart and slotEnd
   - Format as "9:00 AM - 9:15 AM" (12-hour format with AM/PM)
   - Handle edge cases (midnight, noon, etc.)

3. **Update Button Display:**
   - Update button display to show range format
   - Update selectedSlot comparison to work with TimeSlot objects

**Key Files:**
- `client-vue/src/components/booking/TimeSlotGrid.vue` - Update props and display

**Checkpoint:** Verify time ranges display correctly on buttons.

---

### Task 1.3.6.4: Implement Vertical Scrolling

**Goal:** Add vertical scrolling when space is limited (single column mode).

**Steps:**
1. **Update Column Calculation:**
   - Update buttonGridColumns computed to return 1 when < 2 columns can fit
   - Add logic to detect when single column is needed

2. **Add CSS for Single-Column Layout:**
   - Add CSS class for single-column mode
   - Add `max-height` and `overflow-y: auto` for vertical scrolling
   - Ensure buttons maintain proper spacing

3. **Update Grid CSS:**
   - Add conditional class binding for single-column mode
   - Ensure scrolling works smoothly

**Key Files:**
- `client-vue/src/components/booking/TimeSlotGrid.vue` - Update column calculation and CSS

**Checkpoint:** Verify vertical scrolling works in single-column mode.

---

### Task 1.3.6.5: Implement Full-Width Row Fallback

**Goal:** Move grid below calendar when space is insufficient.

**Steps:**
1. **Add Space Detection:**
   - Add computed property to detect when space is too narrow
   - Use ResizeObserver or viewport width to determine layout

2. **Conditional Layout Rendering:**
   - Conditionally render TimeSlotGrid in different VRow/VCol layout
   - When very narrow, render grid in new row below calendar (full width)
   - Update AvailabilityStep template structure

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Update layout logic

**Checkpoint:** Verify grid moves to new row when space is insufficient.

---

### Task 1.3.6.6: Conditional Inspector/Client Toggle

**Goal:** Only show toggle when service.differential === true.

**Steps:**
1. **Add Computed Property:**
   - Create `isDifferentialService` computed property
   - Check `wizard.selectedBaseService.value?.differential === true`

2. **Conditional Rendering:**
   - Conditionally render toggle buttons based on isDifferentialService
   - Default to 'inspector' mode when differential is false
   - Update time slot display logic

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Add conditional rendering

**Checkpoint:** Verify toggle only shows for differential services.

---

### Task 1.3.6.7: Replace Slider with Time On-Site Graph

**Goal:** Implement Time On-Site Graph bars as specified in USER_STORY.md.

**Steps:**
1. **Remove Slider Component:**
   - Remove VSlider component from template
   - Remove sliderValue ref and related logic

2. **Calculate Durations from Part Instances:**
   - Create computed properties for `onSiteTotal` and `presentationDuration`
   - Calculate from part instances where `onSite === true` and `clientPresent === true`
   - Sum baseTime values for each

3. **Create Time On-Site Graph Component:**
   - Create TimeOnSiteGraph component or inline implementation
   - Display two stacked horizontal bars when differential is true
   - Display single bar when differential is false
   - Update bar text based on selected time slot

4. **Style Bars:**
   - Top bar: Full width, Inspector color, displays "Inspector: {onSiteTotal hh:mm}"
   - Bottom bar: Right-justified, half width, Client color, displays "Client Formal Presentation: {presentationDuration hh:mm}"
   - When time selected: Update to show time blocks

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Remove slider, add Time On-Site Graph
- `client-vue/src/components/booking/TimeOnSiteGraph.vue` - New component (optional, can be inline)

**Checkpoint:** Verify Time On-Site Graph displays correctly for both differential and non-differential services.

---

### Task 1.3.6.8: Update AvailabilityStep Integration

**Goal:** Integrate all changes into AvailabilityStep component.

**Steps:**
1. **Update TimeSlotGrid Usage:**
   - Verify TimeSlotGrid props accept slots: TimeSlot[]
   - Verify selectedSlot is TimeSlot instead of string
   - Verify handleTimeSlotClick works with TimeSlot objects

2. **Update Time Formatting:**
   - Verify formatTimeRange function works with TimeSlot objects
   - Verify timeSlotsPerDay uses correct TimeSlot format

3. **Verify Integration:**
   - Test time slot selection and display
   - Test conditional Inspector/Client toggle
   - Test Time On-Site Graph display
   - Test responsive layout behavior

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Verify all changes integrated correctly

**Checkpoint:** Verify all components work together correctly.

**Note:** Client-side availability calculations will be handled in Session 1.3.7 (separate session due to complexity).

---

## Key Files

### Backend
- `server/src/db/migrations/[timestamp]_add_differential_to_block_instances.mjs` - New migration
- `server/src/db/models/booking/block_instance.ts` - Update model
- `server/src/db/seeders/[timestamp]_seed_differential_services.mjs` - New seeder

### Frontend
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Update BookingBlockInstance type
- `client-vue/src/components/booking/TimeSlotGrid.vue` - Enhance component
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Refactor component

**Note:** Client-side availability calculations moved to Session 1.3.7

---

## Success Criteria

- ✅ Database migration adds differential column to block_instances table
- ✅ BlockInstance model includes differential property
- ✅ BookingBlockInstance type includes differential property
- ✅ Seeder sets differential=true for Buyer's Inspection and Investor's Inspection
- ✅ TimeSlotGrid displays time ranges on buttons (not single times)
- ✅ Buttons ordered vertically (top to bottom, left to right)
- ✅ Component dynamically calculates columns based on available space
- ✅ Switches to single-column with vertical scrolling when 2 columns cannot fit
- ✅ Moves to full-width new row below calendar when space is insufficient
- ✅ Inspector/Client toggle only visible when service.differential === true
- ✅ Time On-Site Graph (bars) replaces slider, only visible when differential is true
- ✅ Time On-Site Graph displays correct inspector and client time blocks
- ✅ All responsive breakpoints work correctly
- ✅ Component maintains touch-friendly button sizing (44px minimum)

**Note:** Client-side availability calculations will be completed in Session 1.3.7

---

## Implementation Notes

### Database Migration
- Use Sequelize migration pattern with up/down functions
- Set default value to false for existing records
- Add NOT NULL constraint

### Time Range Formatting
- Parse TimeSlot.slotStart and slotEnd ISO strings
- Format as "9:00 AM - 9:15 AM" (12-hour format with AM/PM)
- Handle edge cases (midnight, noon, etc.)

### Vertical Scrolling
- When calculated columns < 2, switch to single column layout
- Add `overflow-y: auto` and `max-height` to enable vertical scrolling
- Maintain button ordering: top to bottom, then wrap to next column if multiple columns

### Time On-Site Graph Calculation
- Calculate `onSiteTotal`: Sum of all part instances' baseTime where onSite = true
- Calculate `presentationDuration`: Sum of part instances' baseTime where clientPresent = true
- Calculate `onSiteTimeBlock`: Inspector start time to inspector end time (based on selected slot)
- Calculate `presentationTimeBlock`: Client start time to client end time (based on selected slot and differential calculation)

### Availability Calculation Logic
- Get selected service's partInstances
- Calculate total duration from partInstances.baseTime
- For differential: Calculate inspector start time (client time - onSiteTotal) and client start time (selected slot)
- Generate available slots based on calendar availability and calculated durations
- Filter slots based on availability options and property constraints

---

## Learning Checkpoints

**After Task 1.3.6.1 (Database Migration):**
- How is the differential column added to the database?
- How is the BlockInstance model updated?
- How are services seeded with differential=true?

**After Task 1.3.6.2 (Update BookingBlockInstance Type):**
- How is the differential property added to the type?
- How does it flow through the transformer?

**After Task 1.3.6.3 (Time Range Display):**
- How are time ranges formatted from TimeSlot objects?
- How are buttons updated to display ranges?

**After Task 1.3.6.4 (Vertical Scrolling):**
- How is single-column mode detected?
- How is vertical scrolling implemented?

**After Task 1.3.6.5 (Full-Width Row Fallback):**
- How is insufficient space detected?
- How is the layout conditionally rendered?

**After Task 1.3.6.6 (Conditional Toggle):**
- How is differential service detected?
- How is the toggle conditionally rendered?

**After Task 1.3.6.7 (Time On-Site Graph):**
- How are durations calculated from part instances?
- How are the bars displayed and styled?

**After Task 1.3.6.8 (Integration):**
- How do all components work together?
- Are there any integration issues?

**Note:** Client-side availability calculations will be covered in Session 1.3.7

---

## Related Documents

- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Phase Handoff**: `../phases/phase-1.3-handoff.md`
- **Feature Plan**: `../feature-plan.md`
- **USER_STORY.md**: `../../../../USER_STORY.md`
- **Scope Plan**: `../../../../.cursor/plans/timeslot-grid-enhancement-and-availability-refactor.plan.md`

---

---

## End of Session Workflow

**IMPORTANT: Catch-Up Test Workflow**

This session is configured to automatically run catch-up tests when ending. When you run `/session-end 1.3.6`, the workflow will:

1. Execute normal session-end workflow
2. **Automatically trigger catch-up test execution** for all previous phases/sessions that haven't had tests run yet
3. Report catch-up test results

**RUN_CATCHUP_TESTS**

This marker enables the automatic catch-up test workflow. The catch-up will run tests for:
- All completed phases up to Phase 1.3
- All completed sessions up to Session 1.3.6
- Only for phases/sessions that don't have test execution records

**Note:** This catch-up workflow only triggers for session 1.3.6. Other sessions will not run catch-up tests unless explicitly called with `/test-catchup`.

---

**Session Status:** In Progress  
**Next Session:** Session 1.3.7 - Client-Side Availability Calculations

