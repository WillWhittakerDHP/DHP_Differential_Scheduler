# Phase 1.2 Guide: Booking Wizard Data Flow Fixes

**Feature:** Data Flow Alignment  
**Phase:** 1.2 - Booking Wizard Data Flow Fixes  
**Status:** Complete  
**Created:** 2025-12-04  
**Completed:** 2025-12-28

---

## Phase Overview

**Phase Number:** 1.2  
**Phase Name:** Booking Wizard Data Flow Fixes  
**Description:** Fix data flow issues in booking wizard, ensure all data connections work correctly. Hook up data flow using API endpoints from Phase 1.1.

**Dependencies:** Phase 1.1 (Database Setup & Appointment Structure) ✅ Complete

---

## Objectives

- Improve card button component to handle selections with and without components
- Verify booking wizard uses globalData cache correctly
- Fix any data connection issues
- Ensure proper data flow through transformers
- Fix broken interactions in wizard steps
- Fix broken data connections (icons, property types)
- Pull all options from bookingData/block instances (no hardcoding)
- Set up MLS API data structure (mock data for now)
- Design and hook up availability page logical structure

---

## Sessions

### Session 1.2.1: Expandable Card Buttons with Component Options

**Status:** ✅ Complete  
**Priority:** High (Complete before data alignment tasks)  
**Completed:** 2025-12-28

**Goal:** Enhance `SelectionCardGroup` component to support expandable cards that show nested component options when a selection has visible components.

**Objectives:**
- Add expandable card functionality to `SelectionCardGroup`
- Cards with `isComposite: true` and visible components expand when selected
- Cards without visible components remain normal (non-expandable)
- Support both selections with components and without components

**Tasks:**
1. Update `SelectionCardGroup` component interface to support component data props
2. Add expansion state management (expandedCardIds, toggleCardExpansion, auto-expand/collapse)
3. Add expansion UI (chevron indicator, nested SelectionCardGroup, transitions)
4. Integrate component data in ServiceSelectionStep and PropertyDetailsStep
5. Add CSS for expansion animations and nested card styling
6. Handle nested component selection state management

**Key Files:**
- `client-vue/src/components/booking/SelectionCardGroup.vue`
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/composables/useComponentEntity.ts`

**Success Criteria:**
- ✅ Cards with `isComposite: true` and visible components expand when selected
- ✅ Cards without visible components do not expand (remain normal)
- ✅ Nested component cards display correctly with proper styling
- ✅ Expansion/collapse animations work smoothly
- ✅ Nested component selections work independently from parent selection
- ✅ Works with both radio and checkbox selection modes

**Implementation Notes:**
- Expansion state managed via `expandedCardIds` Set in SelectionCardGroup
- Auto-expansion when card is selected (if it has visible components)
- Component data provided via `expansion.componentData` function in config
- Integrated in ServiceSelectionStep and PropertyDetailsStep with proper component data mapping
- Uses `isComposableBlock()` helper to check if block instance is composable
- Filters components to only show those with composable blockShapes

**Related Plan:** `@/Users/districthomepro/.cursor/plans/expandable_card_buttons_with_component_options_ff8d8f2c.plan.md`

---

### Session 1.2.2: Complete Appointment Data Collection

**Status:** ✅ Complete  
**Priority:** High (Complete after Session 1.2.1)  
**Completed:** 2025-12-28

**Goal:** Wire up data collection from all wizard steps into `collectAppointmentData()` function to enable full appointment creation flow.

**Objectives:**
- Collect date/time slots from AvailabilityStep
- Collect property form data from PropertyDetailsStep
- Collect contact information from ContactsStep
- Collect quote mode state from ServiceSelectionStep
- Transform all collected data into appointment API format
- Create property and users before creating appointment

**Tasks:**
1. **Get selected date/time slots from AvailabilityStep**
   - Expose `selectedDate` (start and end) from AvailabilityStep
   - Expose `selectedTimeSlots` (inspector and client time slots) from AvailabilityStep
   - Transform time slot selections into appointment API format
   - Pass date/time data to appointment creation handler

2. **Create property from PropertyDetailsStep form data**
   - Collect property form data (address, city, state, zipCode, unit, dwellingSize, numberOfUnits)
   - Create property via Property API before creating appointment
   - Use created property ID in appointment creation
   - Handle property lookup for existing addresses (optional enhancement)

3. **Create users from ContactsStep form data**
   - Collect client and agent contact information from ContactsStep
   - Create user records via User API before creating appointment
   - Use created user IDs (clientId, agentId) in appointment creation
   - Handle additional contacts (anotherClient, transactionManager, seller) if provided
   - Map user roles correctly (client, agent, transaction_manager, seller)

4. **Handle "I only want a quote" checkbox state**
   - Collect quote mode state from ServiceSelectionStep
   - Set `isQuoteMode` in appointment request
   - Set appointment `status` to 'quote' if quote mode, 'draft' otherwise

5. **Update collectAppointmentData() function**
   - Replace all TODO placeholders with actual data collection
   - Ensure proper data transformation and validation
   - Handle error cases (missing required data, API failures)

**Key Files:**
- `client-vue/src/components/booking/BookingWizard.vue` - Update `collectAppointmentData()` function
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Expose date/time slot data
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue` - Expose property form data
- `client-vue/src/components/booking/steps/ContactsStep.vue` - Expose contact form data
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` - Expose quote mode state
- `client-vue/src/composables/useProperty.ts` - Create if needed for property creation
- `client-vue/src/composables/useAppointment.ts` - Already created, may need updates

**Success Criteria:**
- ✅ All wizard step data collected correctly
- ✅ Property created before appointment creation
- ✅ Users created before appointment creation
- ✅ Appointment created with all collected data
- ✅ Error handling for missing data or API failures
- ✅ Quote mode state properly set in appointment

**Implementation Notes:**
- `collectAppointmentData()` function implemented in BookingWizard.vue
- All wizard steps expose data via `provide('stepData', computed(...))` pattern
- BookingWizard injects step data using `inject<Ref<StepData>>('stepData', null)`
- Property creation uses `useProperty().create` mutation
- User creation uses `useUser().create` mutation for client, agent, and additional contacts
- Duration calculated dynamically from service part instances (sum of baseTime)
- Navigation to confirmation step (index 4) after successful appointment creation
- Error handling includes validation for required fields and API error messages

**Related Phases:**
- Phase 1.3: Quote mode state management (wizard-level state)
- Feature 4: Differential scheduling calculations (inspector vs client times)

---

### Session 1.2.3: Mock Data Loading for Testing

**Status:** ✅ Complete  
**Priority:** Medium (Testing convenience feature)  
**Completed:** 2025-12-28

**Goal:** Add ability to load a random appointment from the database into the wizard for testing, eliminating need to click through wizard repeatedly.

**Objectives:**
- Fetch random appointment from appointments API
- Transform appointment data to wizard state
- Pre-populate all wizard steps with appointment data
- Support loading by appointment ID or random selection
- Handle missing or incomplete appointment data gracefully

**Tasks:**
1. **Add appointment fetching to useAppointment composable**
   - Add `fetchAll()` query to get list of appointments
   - Add `fetchById(id)` query to get specific appointment
   - Add `fetchRandom()` helper to get random appointment

2. **Create appointment-to-wizard transformer**
   - Transform appointment response to wizard state format
   - Map appointment fields to wizard selections:
     - `userTypeId` → `wizard.selectedUserType`
     - `baseServiceId` → `wizard.selectedBaseService`
     - `dwellingAdjustmentId` → `wizard.selectedDwellingAdjustment`
     - `selectedAvailabilityOptions` → `wizard.selectedAvailabilityOptions`
   - Map property data to PropertyDetailsStep form fields
   - Map user data to ContactsStep form fields
   - Map date/time slots to AvailabilityStep state
   - Map quote mode to ServiceSelectionStep state

3. **Add loadAppointment method to useBookingWizard**
   - Accept appointment ID or appointment response
   - Transform and populate wizard state
   - Populate step form fields
   - Handle partial data (some fields may be null)

4. **Add UI controls for loading mock data**
   - Add "Load Random Appointment" button in BookingWizard (dev mode only)
   - Add "Load Appointment by ID" input field (dev mode only)
   - Show loading state while fetching
   - Show success/error messages

5. **Handle relationships in appointment data**
   - Fetch related property data if propertyId exists
   - Fetch related user data if clientId/agentId exist
   - Map relationship data to appropriate wizard steps

**Key Files:**
- `client-vue/src/composables/useAppointment.ts` - Add fetch queries
- `client-vue/src/composables/useBookingWizard.ts` - Add `loadAppointment()` method
- `client-vue/src/components/booking/BookingWizard.vue` - Add UI controls for loading
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts` - New transformer file
- `client-vue/src/composables/useProperty.ts` - May need fetch method
- `client-vue/src/composables/useUser.ts` - May need fetch method

**Success Criteria:**
- ✅ Can load random appointment from database
- ✅ Can load appointment by ID
- ✅ All wizard steps pre-populated with appointment data
- ✅ Wizard state matches loaded appointment
- ✅ Handles missing/null data gracefully
- ✅ Works in dev mode only (can be feature-flagged)

**Implementation Notes:**
- `loadAppointment()` method added to useBookingWizard composable
- `appointmentToWizardTransformer.ts` created to transform appointment response to wizard state
- Dev mode controls use `import.meta.env.DEV` flag
- Auto-loads random appointment on mount in dev mode (navigates to availability step)
- "Reset Wizard" button implemented to clear all wizard state
- Transformer handles partial data with safe fallbacks
- Relationships (property, users) handled via appointment API response includes
- All wizard steps watch `loadedWizardState` and populate form fields accordingly
- Block instance lookup validates blockShape to ensure correct types (e.g., userType vs baseService)

---

## Tasks Breakdown

### Task 1: Fix Broken Data Connections

**Goal:** Ensure all data comes from `bookingData`/block instances, not hardcoded

**Sub-tasks:**
- Fix icons not showing on user type card buttons (pull from block instance)
- Fix property types (dwelling adjustments) not showing up
- Verify all data sources use bookingData/block instances

**Key Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/composables/useBooking.ts`

### Task 2: Pull All Options from bookingData (No Hardcoding)

**Goal:** Remove all hardcoded data and pull from bookingData/block instances

**Sub-tasks:**
- Show selected service name under nav icon (from block instance, not hardcoded)
- Show valid block instance components for services (e.g., blue tape, radon) from bookingData
- Show valid block instance components for dwelling adjustments (e.g., foundation crawlspace, decks) from bookingData
- Pull availability options from block instance cascade, not hardcoded

**Key Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/components/booking/BookingWizard.vue`
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts`

### Task 3: MLS API Data Structure

**Goal:** Set up structure for MLS API data population (mock data for now)

**Sub-tasks:**
- Set up structure for MLS API data population (mock data for now)
- Property details fields: square footage, bedroom/bathroom count, basement/crawlspace/slab, additional units
- Display MLS data in property details fields when available

**Key Files:**
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/composables/usePropertyDetails.ts` (if exists or needs creation)

### Task 4: Availability Page Logical Structure

**Goal:** Design and hook up data structure for availability page

**Sub-tasks:**
- Design and hook up data structure for availability page
- Support date range selection with time slots per day
- Integrate with appointment API endpoints from Phase 1.1

**Key Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/composables/useBookingWizard.ts`

---

## Key Files

### Composables
- `client-vue/src/composables/useBookingWizard.ts` - Wizard state management
- `client-vue/src/composables/useBooking.ts` - Scheduler data access

### Components
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` - Service selection UI
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue` - Property details form
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` - Availability selection
- `client-vue/src/components/booking/BookingWizard.vue` - Main wizard component

### Transformers
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Data transformation

---

## Success Criteria

- ✅ Booking wizard uses globalData cache correctly
- ✅ All wizard steps have correct data connections
- ✅ Data flows correctly through transformers
- ✅ All wizard interactions working correctly
- ✅ Icons display correctly on user type cards
- ✅ Property types display correctly
- ✅ All options pulled from bookingData (no hardcoding)
- ✅ MLS API data structure ready (mock data working)
- ✅ Availability page logical structure designed and hooked up

---

## Architecture Notes

### Data Flow Pattern
- All data should flow through `globalData` cache via `useGlobal()`
- Use `useBooking()` to access scheduler-specific data
- Transformers should handle data conversion from global to scheduler format

### No Hardcoding Rule
- All options must come from `bookingData`/block instances
- Service names, icons, components, availability options - all from data
- Use `activeBlockIds` and relationships to filter options

### MLS API Integration
- Structure ready for future MLS API integration
- Mock data for now, but structure supports real API calls
- Property details fields map to MLS data structure

### Availability Structure
- Support date ranges (start and end dates)
- Time slots per day (JSON array structure)
- Integrate with appointment API for saving selections

---

## Testing Checklist

- [x] Verify icons display on user type cards (implemented with icon mapping)
- [x] Verify property types (dwelling adjustments) display correctly (pulled from bookingData)
- [x] Verify service names come from block instances (shown in stepper subtitle)
- [x] Verify components for services display correctly (part instances shown as chips)
- [x] Verify components for dwelling adjustments display correctly (part instances shown as chips)
- [x] Verify availability options come from block instance cascade (pulled from wizard.availableAvailabilityOptions)
- [x] Verify MLS data structure works with mock data (structure ready, fields displayed when available)
- [x] Verify availability page supports date ranges (date range structure implemented)
- [x] Verify availability page supports time slots per day (timeSlotsPerDay structure implemented)
- [x] Verify all data flows through globalData cache (via useBooking and useGlobal)
- [x] Verify no hardcoded data remains (all hardcoded values removed, defaults to empty/null)

**Note:** Some items may need manual verification in the UI, but code implementation is complete.

---

## Related Documents

- **Feature Plan**: `../feature-plan.md`
- **Phase 1.1 Handoff**: `phase-1.1-handoff.md`
- **Phase 1.2 Handoff**: `phase-1.2-handoff.md` (to be created)

---

**Phase Status:** Complete  
**Next Phase:** Phase 1.3 - Interaction Fixes and Validation

**Session Order:**
1. ✅ Session 1.2.1 - Expandable Card Buttons with Component Options (Complete)
2. ✅ Session 1.2.2 - Complete Appointment Data Collection (Complete)
3. ✅ Session 1.2.3 - Mock Data Loading for Testing (Complete)

## Phase Completion Summary

**Completed:** 2025-12-28

All three sessions completed successfully. Key deliverables:
- Expandable card functionality with nested component display
- Complete appointment creation flow with property and user creation
- Mock data loading for testing convenience
- All hardcoded data removed, pulling from bookingData
- MLS API data structure ready
- Availability API integration complete
- Duration calculation from service part instances
- Service name display in stepper subtitle
- Part instances displayed for services and dwelling adjustments

**Known Limitations:**
- Inspector/client time slots currently use same slots (Feature 4 will implement differential scheduling)
- Duration calculation uses sum of part instance baseTime (may need business rule refinement)

