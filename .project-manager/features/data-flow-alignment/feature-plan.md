# Feature 1: Data Flow Alignment

**Feature:** Data Flow Alignment  
**Status:** In Progress  
**Created:** 2025-02-01  
**Last Updated:** 2025-12-04  
**Branch:** `feature/data-flow-alignment`

---

## Overview

Fix data flow issues, broken interactions, and admin panel functionality. Ensure all admin panel features work correctly with unified data flow. This feature addresses remaining data flow issues identified after the Vue migration structural completion.

**Target:** Admin panel and booking wizard data flow fixes, interaction fixes, validation improvements, and foundational database setup for appointments, properties, and users.

---

## Phase 1.1: Database Setup & Appointment Structure

**Status:** ✅ Complete  
**Completed:** 2025-12-04  
**Last Session:** Session 1.1 (Complete)  
**Description:** Set up appointment, property, and user databases with mock data. API responses will contain mock data (similar to current block instances pattern), enabling data flow work in subsequent phases.

### Objectives

- Set up appointment database with known columns
- Set up separate property database (referenced by appointment via foreign key)
- Set up user database with agents and clients
- Create mock data for all three databases
- Set up API endpoints for booking-side data storage
- API responses contain mock data (similar to block instances pattern)

### Database Schemas

**1. Appointments Table:**
- `id` (primary key)
- `property_id` (foreign key to properties table)
- `user_type_id` (foreign key to block_instances - user type selection)
- `base_service_id` (foreign key to block_instances - base service selection)
- `dwelling_adjustment_id` (foreign key to block_instances - dwelling adjustment)
- `selected_availability_options` (JSON array of block instance IDs)
- `selected_date` (date or date range start)
- `selected_date_range_end` (nullable, for date ranges)
- `selected_time_slots` (JSON array of time slot data)
- `is_quote_mode` (boolean)
- `quote_pdf_url` (nullable, for quote sharing)
- `status` (enum: 'draft', 'quote', 'booked', 'completed', 'cancelled')
- `client_id` (foreign key to users table, nullable)
- `agent_id` (foreign key to users table, nullable)
- `additional_contacts` (JSON array of contact info)
- `property_details` (JSON object with square footage, bedrooms, etc.)
- `created_at`, `updated_at`

**2. Properties Table:**
- `id` (primary key)
- `address` (string)
- `unit` (string, nullable)
- `city` (string)
- `state` (string)
- `zip_code` (string)
- `mls_number` (string, nullable)
- `square_footage` (integer, nullable)
- `bedrooms` (integer, nullable)
- `bathrooms` (decimal, nullable)
- `basement_type` (enum: 'basement', 'crawlspace', 'slab', nullable)
- `additional_units` (integer, nullable)
- `created_at`, `updated_at`

**3. Users Table:**
- `id` (primary key)
- `first_name` (string)
- `last_name` (string)
- `email` (string, unique)
- `phone` (string, nullable)
- `user_role` (enum: 'client', 'agent', 'transaction_manager', 'seller')
- `login_id` (foreign key to logins table, nullable - for returning users)
- `created_at`, `updated_at`

### Key Files

- `server/src/db/models/booking/appointment.ts` (new)
- `server/src/db/models/booking/property.ts` (new)
- `server/src/db/models/participantModels/Users.ts` (update - uncomment and expand)
- `server/src/db/migrations/[timestamp]_create_appointments_table.mjs` (new)
- `server/src/db/migrations/[timestamp]_create_properties_table.mjs` (new)
- `server/src/db/migrations/[timestamp]_update_users_table.mjs` (new)
- `server/src/db/seedScripts/seedAppointments.ts` (new)
- `server/src/db/seedScripts/seedProperties.ts` (new)
- `server/src/db/seedScripts/seedUsers.ts` (new)
- `server/src/api/routes/appointments.ts` (new)
- `server/src/api/routes/properties.ts` (new)
- `server/src/api/routes/users.ts` (new)

### Success Criteria

- ✅ All three tables created with proper relationships
- ✅ Foreign keys properly set up (appointment → property, appointment → users)
- ✅ Mock data seeded for testing
- ✅ API endpoints return mock data for booking-side use (similar to block instances pattern)
- ✅ Nullability properly handled (users can be nullable for quote-only appointments)
- ✅ Structure supports future login functionality for returning users
- ✅ Data flow can be hooked up in Phase 1.2 using these API endpoints

### Completion Summary

**Completed:** 2025-12-04

**Deliverables:**
- Created 3 database migrations (properties, users, appointments tables)
- Created 3 Sequelize models with proper TypeScript types and relationships
- Created 3 seed scripts with realistic mock data (8 properties, 12 users, 7 appointments)
- Created 3 API routers with full CRUD operations
- All migrations run successfully
- All seed data populated successfully
- All API endpoints tested and verified working

**Key Features:**
- PostgreSQL ENUM types for `foundation_access`, `user_role`, and `appointment_status`
- JSONB fields for flexible data storage (availability options, time slots, contacts, property details)
- Proper foreign key relationships with cascade/set null behaviors
- Appointment endpoints include relationships (property, client, agent) in responses
- All endpoints follow existing codebase patterns

**Files Created:**
- 3 migration files (`20251203_01_create_properties_table.mjs`, `20251203_02_create_users_table.mjs`, `20251203_03_create_appointments_table.mjs`)
- 2 new model files (`property.ts`, `appointment.ts`)
- 1 updated model file (`Users.ts` - uncommented and expanded)
- 3 seed script files (`seedProperties.ts`, `seedUsers.ts`, `seedAppointments.ts`)
- 3 router files (`propertyRouter.ts`, `userRouter.ts`, `appointmentRouter.ts`)

**Files Modified:**
- `server/src/db/models/index.ts` (registered new models)
- `server/src/config/app.ts` (exported new models)
- `server/src/db/seedScripts/seed.ts` (added seed calls)
- `server/src/routes/internal/index.ts` (registered new routes)

**API Endpoints:**
- `GET/POST/PUT/PATCH/DELETE /api/v1/internal/properties`
- `GET/POST/PUT/PATCH/DELETE /api/v1/internal/users`
- `GET/POST/PUT/PATCH/DELETE /api/v1/internal/appointments` (with relationship includes)

**Ready for:** Phase 1.2 - Booking Wizard Data Flow Fixes

**Session Documentation:**
- Session 1.1 Summary: `sessions/session-1.1-summary.md`
- Phase 1.1 Handoff: `phases/phase-1.1-handoff.md`

---

## Phase 1.2: Booking Wizard Data Flow Fixes

**Status:** ✅ Complete  
**Started:** 2025-12-04  
**Completed:** 2025-12-28  
**Description:** Fix data flow issues in booking wizard, ensure all data connections work correctly. Hook up data flow using API endpoints from Phase 1.1.

### Objectives

- Improve card button component to handle selections with and without components
- Verify booking wizard uses globalData cache correctly
- Fix any data connection issues
- Ensure proper data flow through transformers
- Fix broken interactions in wizard steps
- Fix broken data connections (icons, property types)
- Pull all options from bookingData/block instances (no hardcoding)
- Set up MLS API data structure (mock data for now)
- Design and hook up availability page logical structure

### Sessions

**Session 1.2.1: Expandable Card Buttons with Component Options** ✅ Complete
- Enhance `SelectionCardGroup` component to support expandable cards
- Cards with `isComposite: true` and visible components expand when selected
- Cards without visible components remain normal (non-expandable)
- Support both selections with components and without components
- **Related Plan:** `@/Users/districthomepro/.cursor/plans/expandable_card_buttons_with_component_options_ff8d8f2c.plan.md`

**Session 1.2.2: Complete Appointment Data Collection** ✅ Complete
- Complete `collectAppointmentData()` function implemented
- Property and user creation before appointment creation
- All wizard step data collected via provide/inject pattern
- Navigation to confirmation step after successful creation

**Session 1.2.3: Mock Data Loading for Testing** ✅ Complete
- `loadAppointment()` method added to useBookingWizard
- `appointmentToWizardTransformer.ts` created
- Dev mode UI controls for loading appointments
- Auto-load functionality in dev mode

### Tasks

**Fix Broken Data Connections:**
- Fix icons not showing on user type card buttons (pull from block instance)
- Fix property types (dwelling adjustments) not showing up
- Ensure all data comes from `bookingData`/block instances, not hardcoded

**Pull All Options from bookingData (No Hardcoding):**
- Show selected service name under nav icon (from block instance, not hardcoded)
- Show valid block instance components for services (e.g., blue tape, radon) from bookingData
- Show valid block instance components for dwelling adjustments (e.g., foundation crawlspace, decks) from bookingData
- Pull availability options from block instance cascade, not hardcoded

**MLS API Data Structure:**
- Set up structure for MLS API data population (mock data for now)
- Property details fields: square footage, bedroom/bathroom count, basement/crawlspace/slab, additional units
- Display MLS data in property details fields when available

**Availability Page Logical Structure:**
- Design and hook up data structure for availability page
- Support date range selection with time slots per day

### Key Files

- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/composables/useBooking.ts`
- `client-vue/src/components/booking/steps/`
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts`
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`

### Success Criteria

- ✅ Expandable card buttons work correctly (Session 1.2.1)
- ✅ Cards with components expand to show nested options
- ✅ Cards without components remain normal
- ✅ Booking wizard uses globalData cache correctly
- ✅ All wizard steps have correct data connections
- ✅ Data flows correctly through transformers
- ✅ All wizard interactions working correctly
- ✅ Icons display correctly on user type cards
- ✅ Property types display correctly
- ✅ All options pulled from bookingData (no hardcoding)
- ✅ MLS API data structure ready (mock data working)
- ✅ Availability page logical structure designed and hooked up

### Completion Summary

**Completed:** 2025-12-28

**Deliverables:**
- All three sessions completed successfully
- Expandable card functionality with nested component display
- Complete appointment creation flow (property → users → appointment)
- Mock data loading for testing convenience
- All hardcoded data removed, pulling from bookingData
- MLS API data structure ready
- Availability API integration complete

**Key Features:**
- Duration calculated dynamically from service part instances
- Service name displayed in stepper subtitle
- Part instances displayed for services and dwelling adjustments
- Dev mode controls for loading test appointments
- Auto-load random appointment in dev mode

**Files Modified:**
- `client-vue/src/components/booking/BookingWizard.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/SelectionCardGroup.vue`
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts` (new)

**Known Limitations:**
- Inspector/client time slots use same slots for now (Feature 4 will implement differential scheduling)
- Duration calculation uses sum of part instance baseTime (may need business rule refinement)

---

## Phase 1.3: Interaction Fixes and Validation

**Status:** In Progress  
**Started:** 2025-12-28  
**Current Session:** 1.3.7 (Not Started)  
**Description:** Fix broken interactions and add proper validation throughout admin panel and booking wizard. Refactor wizard state management. Enhance TimeSlotGrid and AvailabilityStep for differential scheduling support.

### Objectives

- Fix broken form interactions
- Add proper form validation
- Fix broken navigation flows
- Add error handling and user feedback
- Refactor wizard state management (user type, quote mode)
- Decide on form vs state architecture

### Tasks

**Wizard State Management Refactoring:**
- Consider refactoring user type selection to wizard-level state (not just step-level)
- Evaluate if wizard-level state makes accessing annotation sets easier/best practice
- Decide on form vs state architecture: form parallel to UI vs context/state vs both
- Research how other schedulers handle appointment data before booking

**Quote/Book State Management:**
- Add wizard-level `isQuoteMode` state (connected to "I only want a quote" button)
- State should persist across all wizard steps
- State affects color palette (UI implementation in Feature 2, but state management here)

### Key Files

- `client-vue/src/components/admin/generic/fields/`
- `client-vue/src/components/booking/steps/`
- `client-vue/src/composables/useFormValidation.ts` (if exists)
- `client-vue/src/composables/useBookingWizard.ts` (state refactoring)
- `client-vue/src/composables/useQuoteMode.ts` (new)

### Success Criteria

- All form interactions working correctly
- Proper validation on all forms
- Navigation flows working correctly
- Error handling and user feedback in place
- Wizard state management refactored (user type at wizard level)
- Quote mode state management working
- Form vs state architecture decision made and implemented

---

## Phase 1.4: Admin Panel Data Flow Fixes

**Status:** Not Started  
**Description:** Fix data flow issues in admin panel, ensure all CRUD operations work correctly with unified globalData cache.

### Objectives

- Verify all admin panel CRUD operations use globalData cache
- Fix any direct API calls bypassing globalData
- Ensure proper invalidation on mutations
- Fix broken interactions in admin panel
- Create business controls infrastructure for admin-configurable settings

### Tasks

- **Database Migration and Model** - Create business_settings table and Sequelize model for storing availability settings
- **API Routes** - Create CRUD endpoints for business settings (GET, POST, PUT, PATCH, DELETE)
- **Admin Panel Tab Component** - Create Business Controls tab with form for editing availability settings (business hours, time increments, lead time)
- **Client-Side Settings Integration** - Update availabilitySettings.ts to fetch from API instead of hardcoded defaults
- **Server-Side Settings Integration** - Update availabilityRouter.ts to use database settings instead of hardcoded adminSettings
- **Type Definitions** - Ensure AvailabilitySettings interface consistency between client and server

### Key Files

- `client-vue/src/composables/useGlobal.ts`
- `client-vue/src/composables/useEntity.ts`
- `client-vue/src/composables/useRelationship.ts`
- `client-vue/src/views/admin/AdminPanel.vue`
- `client-vue/src/components/admin/`

### Success Criteria

- All admin panel CRUD operations use globalData cache
- No direct API calls bypassing globalData
- Mutations properly invalidate globalData
- All admin panel interactions working correctly
- Business controls admin tab created and functional
- Database rebuilt with comprehensive seed data for testing
- Comprehensive UAT completed with all test cases documented
- No critical findings remaining unresolved
- Phase gate criteria met before advancing to Phase 1.5

### Sessions

Phase 1.4 consists of **two sessions**:
1. **Session 1**: Business Controls Admin Tab Infrastructure
2. **Session 2**: Database Rebuild and Comprehensive User Acceptance Testing (Phase Gate)

**Session 1: Business Controls Admin Tab Infrastructure** (First Session)

**Status:** Not Started  
**Priority:** High (Foundation for admin-configurable business logic)  
**Dependencies:** Phase 1.3.7 (Client-Side Availability Calculations) ✅ Complete

**Goal:** Create database, API, and admin panel infrastructure for business logic controls (availability settings). Replace hardcoded settings with database-backed configuration accessible through a new admin tab.

**Objectives:**
- Create database table and model for business settings
- Create API routes for CRUD operations on business settings
- Create admin panel tab component for managing settings
- Update client-side config to fetch from API instead of hardcoded defaults
- Update server-side availability router to use database settings
- Integrate settings loading into existing availability calculations

**Key Files:**
- `server/src/db/migrations/[timestamp]_create_business_settings_table.mjs` (new)
- `server/src/db/models/admin/business_settings.ts` (new)
- `server/src/api/routes/businessSettingsRouter.ts` (new)
- `client-vue/src/views/admin/tabs/BusinessControlsTab.vue` (new)
- `client-vue/src/configs/availabilitySettings.ts` (modify)
- `server/src/routes/internal/availabilityRouter.ts` (modify)
- `client-vue/src/views/admin/AdminPanel.vue` (modify)

**Success Criteria:**
- ✅ Database table created with proper schema
- ✅ Sequelize model created with TypeScript types
- ✅ API routes functional (GET, POST, PUT, PATCH, DELETE)
- ✅ Admin tab created and integrated into AdminPanel
- ✅ Settings form allows editing all availability settings
- ✅ Client-side `getAvailabilitySettings()` fetches from API
- ✅ Server-side `availabilityRouter.ts` uses database settings
- ✅ Default settings seeded in database
- ✅ Fallback to defaults if no settings exist
- ✅ Settings changes reflect immediately in availability calculations
- ✅ No hardcoded settings remain in codebase

**Detailed Plan:** See `@business_controls_admin_tab_infrastructure_ade65402.plan.md`

---

**Session 2: Database Rebuild and Comprehensive User Acceptance Testing** (Final Session - Phase Gate)

**Status:** Not Started  
**Priority:** Critical (Gate to Phase 1.5 - Must pass before proceeding)  
**Dependencies:** Session 1 (Business Controls Admin Tab Infrastructure) ✅ Complete

**Goal:** Rebuild database with proper seed data for all Phase 1.3 and 1.4 changes, execute comprehensive user acceptance testing covering all booking wizard features, document all findings, and ensure system is production-ready before advancing to Phase 1.5.

**Rationale:** Database schema has changed significantly (JSONB arrays, property/address separation, new settings infrastructure). Old dummy data is incompatible with new frontend behaviors. Admin panel must be functional to properly seed data. Comprehensive testing required to validate all changes before moving forward.

**Objectives:**

**Database Rebuild:**
- Review all schema changes from Phase 1.3 (multi-select arrays, property/address tables)
- Review all schema changes from Phase 1.4 (business_settings table)
- Create comprehensive seed scripts with realistic test data
- Seed data covering all block shapes, block instances, part instances
- Seed data covering all user types with appropriate cascading relationships
- Seed appointments demonstrating multi-select (multiple services, dwelling adjustments, availability options)
- Seed differential services (Buyers Inspection, Investors Inspection)
- Seed properties with addresses (separated tables)
- Seed business settings (availability hours, increments, lead time)
- Verify all relationships and foreign keys work correctly
- Verify data supports all wizard features

**Comprehensive User Acceptance Testing - Booking Wizard:**

*Service Selection Step:*
- [ ] Single service selection (legacy behavior)
- [ ] Multiple service selection (checkbox multi-select)
- [ ] Service filtering by user type
- [ ] Service cascading (selecting service filters dwelling adjustments)
- [ ] Service descriptions display correctly
- [ ] Service icons display correctly
- [ ] Differential service indicators (if applicable)
- [ ] Edge case: No services available for user type
- [ ] Edge case: All services disabled
- [ ] Edge case: Service with no parts
- [ ] Edge case: Composite service with components

*Property Details Step:*
- [ ] Property creation (new property)
- [ ] Property selection (existing property)
- [ ] Address creation (new address)
- [ ] Address selection (existing address)
- [ ] Property/address relationship saved correctly
- [ ] Single dwelling adjustment selection
- [ ] Multiple dwelling adjustment selection (checkbox multi-select)
- [ ] Dwelling adjustment filtering based on selected services
- [ ] Dwelling adjustment descriptions display correctly
- [ ] Required field validation
- [ ] Edge case: No dwelling adjustments available
- [ ] Edge case: Property without address
- [ ] Edge case: Multiple properties with same address

*Availability Step:*
- [ ] Calendar displays correct month/year
- [ ] Calendar navigation (prev/next month)
- [ ] Date selection enables time slot grid
- [ ] Time slots generated correctly (business hours)
- [ ] Time slots respect time increment setting (15 min default)
- [ ] Time slot duration calculated from all selections (service + dwelling + availability)
- [ ] Differential scheduling: Inspector/Client toggle appears for differential services
- [ ] Differential scheduling: Time On-Site Graph shows two bars (inspector full-width, client half-width right-justified)
- [ ] Differential scheduling: Inspector start time calculated correctly (client time - onSiteTotal)
- [ ] Non-differential: Toggle hidden, single bar in graph
- [ ] Time slot selection
- [ ] Availability options selection (if applicable)
- [ ] Multiple availability options selection
- [ ] Edge case: No available slots
- [ ] Edge case: Very short duration (< 15 min)
- [ ] Edge case: Very long duration (> business hours)
- [ ] Edge case: Midnight boundary
- [ ] Edge case: Date range spanning multiple days
- [ ] Responsive: Calendar and grid side-by-side on wide screens
- [ ] Responsive: Grid moves below calendar on narrow screens
- [ ] Responsive: Vertical scrolling in single-column mode

*Appointment Summary Step:*
- [ ] All selected services displayed
- [ ] All selected dwelling adjustments displayed
- [ ] All selected availability options displayed
- [ ] Property details displayed correctly
- [ ] Address displayed correctly
- [ ] Selected date/time displayed correctly
- [ ] Total duration displayed correctly
- [ ] Contact information displayed
- [ ] Edge case: Summary with multiple selections

*Appointment Creation:*
- [ ] Appointment created with single service
- [ ] Appointment created with multiple services
- [ ] Appointment created with multiple dwelling adjustments
- [ ] Appointment created with multiple availability options
- [ ] Appointment created with differential service
- [ ] Appointment saved to database with correct array fields
- [ ] Appointment includes property and address IDs
- [ ] Success message displayed
- [ ] Redirect to appropriate page after creation

*Appointment Loading/Editing:*
- [ ] Load existing appointment
- [ ] Services pre-selected (array values)
- [ ] Dwelling adjustments pre-selected (array values)
- [ ] Availability options pre-selected (array values)
- [ ] Property/address pre-populated
- [ ] Date/time pre-selected
- [ ] Edit appointment (change selections)
- [ ] Update appointment successfully
- [ ] Verify updated appointment in database

*Wizard Navigation:*
- [ ] Next button enabled when step valid
- [ ] Next button disabled when step invalid
- [ ] Back button returns to previous step with data preserved
- [ ] Step indicators show current step
- [ ] Step indicators show completed steps
- [ ] Direct step navigation (click step indicator)
- [ ] Validation prevents advancing with incomplete data
- [ ] Edge case: Rapid clicking next/back

*Form Validation:*
- [ ] Required fields marked visually
- [ ] Validation messages display on blur
- [ ] Validation messages display on submit attempt
- [ ] Form cannot advance with invalid data
- [ ] Valid data clears validation messages
- [ ] Edge case: Empty string vs null
- [ ] Edge case: Whitespace-only input

*State Management:*
- [ ] State persists across wizard steps
- [ ] Cascading clears work correctly (service change clears dwelling/availability)
- [ ] User type change clears all selections
- [ ] No memory leaks (check browser dev tools)
- [ ] Reactive updates when selections change

**Comprehensive User Acceptance Testing - Admin Panel:**

*Profiles Tab:*
- [ ] User types list loads correctly
- [ ] Create new user type
- [ ] Edit existing user type
- [ ] Delete user type (with cascade warning)
- [ ] User type cascading relationships displayed
- [ ] CRUD operations use globalData cache
- [ ] globalData invalidated after mutations

*Shapes Tab:*
- [ ] Block shapes list loads correctly
- [ ] Part shapes list loads correctly
- [ ] Create new block shape
- [ ] Create new part shape
- [ ] Edit block shape
- [ ] Edit part shape
- [ ] Delete shape (with usage warning)
- [ ] CRUD operations use globalData cache

*Data Management Tab:*
- [ ] Appointments table loads correctly
- [ ] Properties table loads correctly
- [ ] Users table loads correctly
- [ ] Create new appointment
- [ ] Edit appointment
- [ ] Delete appointment
- [ ] Create new property
- [ ] Edit property
- [ ] Delete property
- [ ] Create new user
- [ ] Edit user
- [ ] Delete user
- [ ] Pagination works correctly
- [ ] Sorting works correctly
- [ ] Filtering works correctly
- [ ] CRUD operations use globalData cache

*Business Controls Tab:*
- [ ] Business settings load from database
- [ ] Edit business hours (per day of week)
- [ ] Edit time increment (15, 30, 60 minutes)
- [ ] Edit lead time
- [ ] Save settings to database
- [ ] Settings changes reflect immediately in booking wizard
- [ ] Fallback to defaults if no settings exist
- [ ] Validation prevents invalid values (e.g., end time before start time)

**Performance Testing:**
- [ ] Initial page load time reasonable (< 3s)
- [ ] Wizard step transitions smooth (< 500ms)
- [ ] Time slot generation fast (< 1s)
- [ ] Admin panel CRUD operations responsive (< 2s)
- [ ] No console errors
- [ ] No console warnings (excluding expected dev warnings)
- [ ] Browser memory usage stable (no leaks)

**Cross-Browser Testing:**
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile)

**Responsive Testing:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet portrait (768x1024)
- [ ] Tablet landscape (1024x768)
- [ ] Mobile (375x667)
- [ ] Mobile (320x568) - minimum supported size

**Findings Management:**

**During Testing:**
1. Document each issue found with:
   - Test case reference (checkbox from above)
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Severity (Critical, High, Medium, Low)
   - Screenshots/videos if applicable

2. Use slash commands to manage findings:
   - `/bug-report <description>` - Create bug report with details
   - `/finding-critical <description>` - Flag critical issue blocking progression
   - `/finding-high <description>` - Flag high-priority issue
   - `/finding-medium <description>` - Flag medium-priority issue
   - `/finding-low <description>` - Flag low-priority issue (polish/nice-to-have)
   - `/retest <test-case-id>` - Mark test case for re-testing after fix
   - `/finding-resolved <finding-id>` - Mark finding as resolved after verification

3. Prioritize fixes:
   - **Critical**: Must fix before Phase 1.5 (blocks basic functionality)
   - **High**: Should fix before Phase 1.5 (significant usability impact)
   - **Medium**: Can defer to Phase 1.5+ (moderate impact)
   - **Low**: Can defer to future phases (polish/enhancement)

4. Gate criteria:
   - **No critical findings remain unresolved**
   - **All high-priority findings resolved or documented as known issues with workarounds**
   - **At least 90% of test cases pass**
   - **Database seed scripts working correctly**
   - **All CRUD operations functional**

**Key Files:**
- `server/src/db/seeders/` (all seed scripts - update/create)
- `server/src/db/migrations/` (verify all migrations applied)
- `server/src/config/database.ts` (database configuration)
- `client-vue/src/components/booking/BookingWizard.vue` (main wizard component)
- `client-vue/src/components/booking/steps/` (all wizard steps)
- `client-vue/src/views/admin/AdminPanel.vue` (admin panel)
- `client-vue/src/views/admin/tabs/` (all admin tabs)
- Test documentation: `project-manager/features/data-flow-alignment/phases/phase-1.4-uat-findings.md` (created during testing)

**Success Criteria:**
- ✅ Database rebuilt with comprehensive seed data
- ✅ All seed scripts execute without errors
- ✅ All schema changes verified and working
- ✅ All booking wizard test cases pass (100% or documented exceptions)
- ✅ All admin panel test cases pass (100% or documented exceptions)
- ✅ No critical findings remain unresolved
- ✅ All high-priority findings resolved or have documented workarounds
- ✅ Performance metrics meet targets
- ✅ Cross-browser testing complete with no major issues
- ✅ Responsive testing complete with acceptable behavior
- ✅ All findings documented and prioritized
- ✅ Phase gate criteria met
- ✅ System deemed production-ready for Phase 1.5

**Deliverables:**
1. Updated seed scripts in `server/src/db/seeders/`
2. UAT findings report: `project-manager/features/data-flow-alignment/phases/phase-1.4-uat-findings.md`
3. Test execution report (checkboxes above with results)
4. Known issues document (if any medium/low findings deferred)
5. Sign-off document confirming gate criteria met

**Next Phase:** Phase 1.5 can only begin after this session is complete and gate criteria are met.

---

## Phase 1.5: Business Rules & Validation

**Status:** Not Started  
**Description:** Set up business logic admin tab structure, configure required fields, set up validation messages, and implement "requires agent" logic.

### Objectives

- Set up business logic admin tab structure
- Configure required fields per service/dwelling adjustment
- Set up validation message annotations
- Implement "requires agent" logic
- Set up confirmation modal validation logic

### Tasks

**Business Logic Admin Tab Setup:**
- Create admin tab for business rules configuration
- Database table or configuration system for business rules
- UI for managing required fields per block instance
- UI for managing validation messages (annotation sets)

**Required Fields Configuration:**
- System to define required property details per dwelling adjustment
- System to define required contact info per service (e.g., "requires agent")
- Store in database or config (to be determined)

**Validation Logic:**
- Confirmation modal on dirty property details (when navigating away)
- Modal shows required fields that need verification
- Message comes from annotation set connected to dwelling adjustment
- Required fields list comes from business rules config

**"Requires Agent" Logic:**
- Check if selected service has "requires agent" property
- If agent/client details missing, show modal on next/submit
- Modal shows annotation set explaining why agent/client required
- Modal shows unfilled contact information fields
- Modal fields share same composable as wizard step (shared data)

### Key Files

- `server/src/db/models/admin/business_rule.ts` (new, if using database)
- `server/src/db/migrations/[timestamp]_create_business_rules_table.mjs` (new, if using database)
- `client-vue/src/views/admin/tabs/BusinessRulesTab.vue` (new)
- `client-vue/src/composables/useBusinessRules.ts` (new)
- `client-vue/src/components/booking/modals/RequiredFieldsModal.vue` (new)
- `client-vue/src/components/booking/modals/RequiresAgentModal.vue` (new)

### Success Criteria

- Business rules admin tab functional
- Required fields configurable per service/dwelling adjustment
- Validation messages come from annotation sets
- "Requires agent" logic working
- Modals properly integrated with wizard form data
- Confirmation modal shows required fields verification

---

## Reference Documents

- **Data Flow Plan**: `align-data-flows.plan.md` (mostly complete, needs verification)
- **Vue Migration Completion**: `project-manager/features/vue-migration/vue-migration-completion-summary.md`
- **UI Polish Vision Notes**: User notes on UI polish requirements

---

## Dependencies

- Feature 0: Vue.js Migration (Core Complete)

---

## Success Metrics

- All admin panel CRUD operations working correctly
- All booking wizard data connections working correctly
- No broken interactions in admin panel or wizard
- Proper validation and error handling throughout
- Database structure supports appointment, property, and user data
- Business rules configurable through admin interface

---

**Last Updated:** 2025-12-29  
**Status:** In Progress - Phase 1.2 Complete, Phase 1.3 In Progress (Current Session: 1.3.6)

**Note:** Naming conventions updated 2025-12-28. See `docs/NAMING_CONVENTIONS.md` for details on composable naming (`useXxx` pattern) and "booking" vs "scheduler" terminology.
