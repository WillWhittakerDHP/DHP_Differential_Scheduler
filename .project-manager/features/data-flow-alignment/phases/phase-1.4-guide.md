# Phase 1.4 Guide: Admin Panel Data Flow Fixes

**Feature:** Data Flow Alignment  
**Phase:** 1.4 - Admin Panel Data Flow Fixes  
**Status:** ✅ Complete  
**Created:** 2026-01-06  
**Completed:** 2026-01-31  
**Dependencies:** Phase 1.3 (Interaction Fixes and Validation) ✅ Complete

---

## Phase Overview

**Phase Number:** 1.4  
**Phase Name:** Admin Panel Data Flow Fixes  
**Description:** Fix data flow issues in admin panel, ensure all CRUD operations work correctly with unified globalData cache. Create business controls infrastructure for admin-configurable settings. Rebuild database with comprehensive seed data and execute comprehensive user acceptance testing.

**Dependencies:** Phase 1.3 (Interaction Fixes and Validation) ✅ Complete

---

## Objectives

- Verify all admin panel CRUD operations use globalData cache
- Fix any direct API calls bypassing globalData
- Ensure proper invalidation on mutations
- Fix broken interactions in admin panel
- Create business controls infrastructure for admin-configurable settings
- Rebuild database with comprehensive seed data for testing
- Execute comprehensive user acceptance testing (phase gate)

---

## Sessions

### Session 1.4.1: Business Controls Admin Tab Infrastructure

**Status:** ✅ Complete  
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

**Key Tasks:**

1. **Database Migration and Model**
   - Create `business_settings` table migration
   - Fields: `id` (UUID, primary key), `setting_key` (string, unique), `setting_value` (JSONB), `created_at`, `updated_at`
   - Create Sequelize model with TypeScript types matching `AvailabilitySettings` interface
   - Add model to model registry (`server/src/db/models/index.ts`)
   - Export model if needed (`server/src/config/app.ts`)

2. **API Routes**
   - Create `businessSettingsRouter.ts` with CRUD endpoints
   - GET `/api/v1/internal/business-settings` - List all settings (or get by key)
   - GET `/api/v1/internal/business-settings/:key` - Get specific setting
   - POST `/api/v1/internal/business-settings` - Create new setting
   - PUT `/api/v1/internal/business-settings/:key` - Update setting
   - PATCH `/api/v1/internal/business-settings/:key` - Partial update
   - DELETE `/api/v1/internal/business-settings/:key` - Delete setting
   - Register routes in internal router (`server/src/routes/internal/index.ts`)
   - Handle single settings record pattern (one record with key "availability_settings")
   - GET endpoint returns current settings (or defaults if none exist)
   - POST/PUT endpoints validate `AvailabilitySettings` structure

3. **Type Definitions**
   - Ensure `AvailabilitySettings` interface consistency between client and server
   - Use existing types from `client-vue/src/configs/availabilitySettings.ts` or create shared types
   - Update types to match database schema

4. **Server-Side Settings Integration**
   - Update `availabilityRouter.ts` to use database settings
   - Replace hardcoded `adminSettings` with database query
   - Load settings from database before generating availabilities
   - Fallback to defaults if no settings exist
   - Cache settings in memory (with invalidation on update)

5. **Client-Side Settings Integration**
   - Update `availabilitySettings.ts` to fetch from API
   - Create `getAvailabilitySettings()` function that calls API
   - Fallback to defaults if API call fails or no settings exist
   - Cache settings appropriately (consider using globalData cache or Vue Query)
   - Update `useAvailability` composable to use fetched settings
   - Handle loading states and errors gracefully

6. **Admin Panel Tab Component**
   - Create `BusinessControlsTab.vue` component
   - Follow existing admin panel patterns (VTabs/VWindow, form validation)
   - Form for editing availability settings:
     - Business hours (per day of week: start time, end time) - 7 day inputs
     - Time increment (15, 30, 60 minutes) - number input
     - Lead time (minimum hours before appointment) - number input
   - Form validation (end time > start time, valid time format)
   - Save/cancel buttons
   - Success/error feedback
   - Integrate with API routes for loading/saving
   - Add tab to `AdminPanel.vue`

7. **Seed Data**
   - Create seed script for default business settings
   - Seed default availability hours (9 AM - 5 PM, Monday-Friday)
   - Seed default time increment (15 minutes)
   - Seed default lead time (24 hours)

**Key Files:**
- `server/src/db/migrations/[timestamp]_create_business_settings_table.mjs` (new)
- `server/src/db/models/admin/business_settings.ts` (new)
- `server/src/routes/internal/businessSettingsRouter.ts` (new)
- `client-vue/src/views/admin/tabs/BusinessControlsTab.vue` (new)
- `client-vue/src/configs/availabilitySettings.ts` (modify)
- `server/src/routes/internal/availabilityRouter.ts` (modify)
- `client-vue/src/views/admin/AdminPanel.vue` (modify)
- `server/src/db/seedScripts/seedBusinessSettings.ts` (new)
- `server/src/db/models/index.ts` (modify - register model)
- `server/src/routes/internal/index.ts` (modify - register router)
- `client-vue/src/composables/useAvailability.ts` (modify if settings loading needed)

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

**Related Documents:**
- **Feature Guide**: `../feature-data-flow-alignment-guide.md` (Phase 1.4 Session 1)
- **Detailed Plan**: `@business_controls_admin_tab_infrastructure_ade65402.plan.md`

---

### Session 1.4.2: Verify Admin Panel GlobalData Cache Usage

**Status:** ✅ Complete  
**Priority:** High (Foundation for data flow fixes)  
**Dependencies:** Session 1.4.1 (Business Controls Admin Tab Infrastructure) ✅ Complete

**Goal:** Audit all admin panel components to verify which operations currently use the globalData cache correctly and which bypass it with direct API calls. Document current state.

**Objectives:**
- Audit all admin panel components for API usage patterns
- Identify components using globalData cache correctly
- Identify components with direct API calls bypassing cache
- Document current state of cache usage across admin panel
- Create prioritized list of components needing fixes

**Key Tasks:**

1. **Audit Admin Panel Components**
   - Review `client-vue/src/views/admin/AdminPanel.vue`
   - Review all tab components in `client-vue/src/views/admin/tabs/`
   - Review generic admin components in `client-vue/src/components/admin/`
   - Check for direct `fetch()` or `axios` calls
   - Check for proper use of `useGlobal`, `useEntity`, `useRelationship` composables

2. **Document Current State**
   - List components using globalData cache correctly
   - List components with direct API calls
   - Identify CRUD operations (create, read, update, delete) for each component
   - Note which operations use cache vs direct calls
   - Create spreadsheet or document tracking findings

3. **Analyze Cache Usage Patterns**
   - Review `client-vue/src/composables/useGlobal.ts` implementation
   - Review `client-vue/src/composables/useEntity.ts` implementation
   - Review `client-vue/src/composables/useRelationship.ts` implementation
   - Understand cache invalidation mechanisms
   - Document expected usage patterns

4. **Prioritize Fixes**
   - Categorize findings by severity (critical data inconsistency vs nice-to-have)
   - Group related fixes (e.g., all ProfilesTab fixes together)
   - Create ordered list for Session 1.4.2

**Key Files:**
- `client-vue/src/views/admin/AdminPanel.vue` (audit)
- `client-vue/src/views/admin/tabs/ProfilesTab.vue` (audit)
- `client-vue/src/views/admin/tabs/ShapesTab.vue` (audit)
- `client-vue/src/views/admin/tabs/DataManagementTab.vue` (audit)
- `client-vue/src/components/admin/` (audit all components)
- `client-vue/src/composables/useGlobal.ts` (review)
- `client-vue/src/composables/useEntity.ts` (review)
- `client-vue/src/composables/useRelationship.ts` (review)

**Success Criteria:**
- ✅ All admin panel components audited
- ✅ Current cache usage documented
- ✅ Direct API calls identified and listed
- ✅ Expected cache usage patterns documented
- ✅ Prioritized fix list created for Session 1.4.3

**Deliverables:**
- Cache usage audit document: `project-manager/features/data-flow-alignment/sessions/session-1.4.2-cache-audit.md`

**Key Findings:**
- ✅ 2 components use globalData cache correctly (ProfilesTab, ShapesTab)
- ❌ 3 components bypass globalData cache (AppointmentsTable, PropertiesTable, UsersTable)
- ⚠️ 2 generic components need review (SelectInputs [formerly SelectFields], AnnotationsField)
- ❌ 3 composables bypass globalData cache (useAppointment, useProperty, useUser)

**Related Documents:**
- **Session Log**: `../sessions/session-1.4.2-log.md`
- **Cache Audit**: `../sessions/session-1.4.2-cache-audit.md`

---

### Session 1.4.3: Fix Direct API Calls Bypassing GlobalData

**Status:** ✅ Complete  
**Priority:** High (Data consistency critical)  
**Dependencies:** Session 1.4.2 (Verify Admin Panel GlobalData Cache Usage) ✅ Complete

**Goal:** Replace all direct API calls in admin panel with globalData cache operations. Ensure all CRUD operations go through unified cache layer.

**Objectives:**
- ✅ Replace direct API calls with cache operations
- ✅ Update composables to read from globalData cache
- ✅ Ensure all CRUD operations go through cache
- ✅ Maintain existing functionality while improving data flow
- ⏳ Test each fix to ensure no regressions (pending manual testing)

**Key Tasks:**

1. ✅ **Added Business Entities to GlobalData Transformer**
   - Extended GlobalData type to include appointments, properties, users
   - Updated transformer to fetch business entities in parallel
   - Included business entities in hydration process

2. ✅ **Updated useAppointment Composable**
   - Changed from useQuery to reading from globalData cache
   - Updated all mutations to invalidate ['globalData']
   - Added optimistic cache updates for create operations

3. ✅ **Updated useProperty Composable**
   - Changed from useQuery to reading from globalData cache
   - Updated all mutations to invalidate ['globalData']
   - Added optimistic cache updates for create operations

4. ✅ **Updated useUser Composable**
   - Changed from useQuery to reading from globalData cache
   - Updated all mutations to invalidate ['globalData']
   - Added optimistic cache updates for create operations

5. ✅ **Verified Component Compatibility**
   - Components work without changes (backward compatible)
   - All components automatically benefit from unified cache

**Key Files:**
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts` (modified)
- `client-vue/src/composables/useAppointment.ts` (modified)
- `client-vue/src/composables/useProperty.ts` (modified)
- `client-vue/src/composables/useUser.ts` (modified)
- `client-vue/src/views/admin/tabs/components/AppointmentsTable.vue` (verified - no changes needed)
- `client-vue/src/views/admin/tabs/components/PropertiesTable.vue` (verified - no changes needed)
- `client-vue/src/views/admin/tabs/components/UsersTable.vue` (verified - no changes needed)

**Success Criteria:**
- ✅ All direct API calls replaced with cache operations
- ✅ All composables read from globalData cache
- ✅ All CRUD operations go through cache
- ✅ UI updates reactively with cache changes (via computed properties)
- ✅ No regressions in existing functionality (backward compatibility maintained)
- ✅ All test files updated and passing (55/55 tests passing)
- ⏳ Manual testing confirms all operations work correctly (pending)

**Related Documents:**
- **Session Log**: `../sessions/session-1.4.3-log.md`

---

### Session 1.4.4: Ensure Proper Cache Invalidation on Mutations

**Status:** Not Started  
**Priority:** High (Data consistency critical)  
**Dependencies:** Session 1.4.3 (Fix Direct API Calls Bypassing GlobalData) ⏳ Not Started

**Goal:** Verify and fix cache invalidation logic after all create/update/delete operations. Ensure cache updates trigger UI refreshes correctly.

**Objectives:**
- Verify invalidation logic after create operations
- Verify invalidation logic after update operations
- Verify invalidation logic after delete operations
- Add missing invalidation calls where needed
- Test cache updates trigger UI refreshes
- Ensure related caches invalidated (e.g., deleting service invalidates related parts)

**Key Tasks:**

1. **Audit Invalidation in Create Operations**
   - Review create operations in all admin components
   - Verify cache invalidation called after successful create
   - Verify related caches invalidated (e.g., creating block instance invalidates block shape cache)
   - Add missing invalidation calls

2. **Audit Invalidation in Update Operations**
   - Review update operations in all admin components
   - Verify cache invalidation called after successful update
   - Verify related caches invalidated
   - Add missing invalidation calls

3. **Audit Invalidation in Delete Operations**
   - Review delete operations in all admin components
   - Verify cache invalidation called after successful delete
   - Verify related caches invalidated (cascading deletes)
   - Verify cascade warnings shown to users before destructive operations
   - Add missing invalidation calls

4. **Test Cache Invalidation**
   - Test create operation invalidates cache and UI updates
   - Test update operation invalidates cache and UI updates
   - Test delete operation invalidates cache and UI updates
   - Test related cache invalidation (e.g., service update invalidates parts cache)
   - Verify no stale data displayed after mutations

5. **Review useGlobal Invalidation Logic**
   - Review `useGlobal.ts` invalidation implementation
   - Verify invalidation keys are correct
   - Verify related cache invalidation logic
   - Add improvements if needed

**Key Files:**
- `client-vue/src/composables/useGlobal.ts` (review and modify)
- `client-vue/src/composables/useEntity.ts` (review and modify)
- `client-vue/src/composables/useRelationship.ts` (review and modify)
- `client-vue/src/views/admin/tabs/` (modify as needed)
- `client-vue/src/components/admin/` (modify as needed)

**Success Criteria:**
- ✅ All create operations invalidate cache correctly
- ✅ All update operations invalidate cache correctly
- ✅ All delete operations invalidate cache correctly
- ✅ Related caches invalidated appropriately
- ✅ UI updates immediately after mutations
- ✅ No stale data displayed after cache operations
- ✅ Manual testing confirms cache invalidation works

---

### Session 1.4.5: Fix Broken Admin Panel Interactions

**Status:** Not Started  
**Priority:** Medium (User experience improvement)  
**Dependencies:** Session 1.4.4 (Ensure Proper Cache Invalidation on Mutations) ⏳ Not Started

**Goal:** Audit admin panel for broken interactions and fix any form field issues, button handlers, navigation issues, or other UX problems.

**Objectives:**
- Audit all admin panel interactions
- Fix broken form fields
- Fix broken button handlers
- Fix navigation issues
- Ensure all admin panel features work correctly
- Improve user feedback and error handling

**Key Tasks:**

1. **Audit ProfilesTab Interactions**
   - Test user type creation, editing, deletion
   - Verify form validation
   - Verify button handlers (save, cancel, delete)
   - Verify cascading relationship display
   - Fix any broken interactions

2. **Audit ShapesTab Interactions**
   - Test block shape creation, editing, deletion
   - Test part shape creation, editing, deletion
   - Verify form validation
   - Verify button handlers
   - Verify usage warnings on delete
   - Fix any broken interactions

3. **Audit DataManagementTab Interactions**
   - Test appointment CRUD operations
   - Test property CRUD operations
   - Test user CRUD operations
   - Verify pagination, sorting, filtering
   - Verify table interactions
   - Fix any broken interactions

4. **Improve User Feedback**
   - Add success messages after operations
   - Add error messages for failures
   - Add loading states during operations
   - Add confirmation dialogs for destructive actions
   - Improve validation error messages

5. **Test Navigation**
   - Verify tab switching works correctly
   - Verify data persists when switching tabs
   - Verify back navigation works
   - Fix any navigation issues

**Key Files:**
- `client-vue/src/views/admin/tabs/ProfilesTab.vue` (modify)
- `client-vue/src/views/admin/tabs/ShapesTab.vue` (modify)
- `client-vue/src/views/admin/tabs/DataManagementTab.vue` (modify)
- `client-vue/src/views/admin/tabs/components/` (modify as needed)
- `client-vue/src/components/admin/generic/` (modify as needed)

**Success Criteria:**
- ✅ All form fields working correctly
- ✅ All button handlers working correctly
- ✅ All validation working correctly
- ✅ Navigation working correctly
- ✅ User feedback improved (success/error messages, loading states)
- ✅ Confirmation dialogs for destructive actions
- ✅ No broken interactions in admin panel
- ✅ Manual testing confirms all features work

---

### Session 1.4.6: Add Annotations to GlobalData and Create useAnnotations Composable

**Status:** Not Started  
**Priority:** Medium (Architectural consistency improvement)  
**Dependencies:** Session 1.4.5 (Fix Broken Admin Panel Interactions) ✅ Complete

**Goal:** Add annotations to globalData cache and create a `useAnnotations` composable following the same pattern as `useAppointment`, `useProperty`, and `useUser`. This ensures consistent cache management and CRUD operations for annotations.

**Architecture Decision:** Option A - Add annotations to globalData (unified cache approach)
- WHY: Consistent with Session 1.4.3 pattern where business entities (appointments, properties, users) were added to globalData
- PATTERN: Follows same architecture as useAppointment/useProperty/useUser composables
- BENEFIT: Unified cache ensures all CRUD operations go through same cache layer

**Key Tasks:**

1. **Extend GlobalData Type**
   - Add `annotations?: Annotation[]` to `GlobalData` type in `fetchToGlobalTransformer.ts`
   - Maintain backward compatibility (optional field)

2. **Update GlobalData Transformer**
   - Update `stageForHydration()` to fetch annotations in parallel with other data
   - Update `hydrate()` to include annotations in returned GlobalData
   - Add error handling with `.catch()` to gracefully handle missing endpoints
   - Update logging to include annotation counts

3. **Create useAnnotations Composable**
   - Create `client-vue/src/composables/useAnnotations.ts`
   - Follow pattern from `useAppointment.ts`, `useProperty.ts`, `useUser.ts`
   - Read annotations from `globalData.annotations` (computed property)
   - Provide CRUD operations: `create`, `update`, `patch`, `remove`
   - All mutations should invalidate `['globalData']` using `refetchQueries` (consistent with Session 1.4.4)
   - Include optimistic cache updates for create operations
   - Provide `fetchAll` and `fetchById` helpers for backward compatibility

4. **Update Components Using Direct Annotation Mutations**
   - Update `AnnotationsField.vue` to use `useAnnotations` composable
   - Update `SelectInputs.vue` (formerly SelectFields.vue) to use `useAnnotations` composable
   - Replace direct `useMutation` calls with composable methods
   - Remove duplicate mutation logic from components

5. **Update Cache Invalidation**
   - Remove separate cache keys (`['annotations']`, `['allBlockInstanceAnnotations']`)
   - Standardize on `['globalData']` invalidation
   - Update annotation relationship mutations to also invalidate `['globalData']`

6. **Create Tests**
   - Create `client-vue/src/composables/__tests__/useAnnotations.test.ts`
   - Test CRUD operations
   - Test cache invalidation (verify `refetchQueries` calls)
   - Test reading from globalData cache
   - Follow test patterns from `useAppointment.test.ts`, `useProperty.test.ts`, `useUser.test.ts`

**Key Files:**

**To Modify:**
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts` (add annotations to GlobalData)
- `client-vue/src/components/admin/generic/fields/AnnotationsField.vue` (use useAnnotations composable)
- `client-vue/src/components/admin/generic/fields/SelectInputs.vue` (use useAnnotations composable)

**Note:** Component names updated in Session 1.4.4 - `SelectFields` → `SelectInputs`, `FieldRenderer` → `InputRenderer`, etc. See NAMING_CONVENTIONS.md for details.

**To Create:**
- `client-vue/src/composables/useAnnotations.ts` (new composable)
- `client-vue/src/composables/__tests__/useAnnotations.test.ts` (new test file)

**Success Criteria:**
- ⏳ Annotations added to GlobalData type (optional field for backward compatibility)
- ⏳ Transformer fetches annotations in parallel with other data
- ⏳ `useAnnotations` composable created following useAppointment/useProperty/useUser pattern
- ⏳ All annotation CRUD operations use `useAnnotations` composable
- ⏳ All mutations invalidate `['globalData']` using `refetchQueries`
- ⏳ Components updated to use composable instead of direct mutations
- ⏳ Separate cache keys removed (unified cache approach)
- ⏳ Tests created and passing
- ⏳ No linting errors
- ⏳ Type safety maintained
- ⏳ Backward compatibility maintained

**Pattern Reference:**
- Follow `useAppointment.ts` pattern for structure and methods
- Follow `useProperty.ts` pattern for cache reading (computed from globalData)
- Follow `useUser.ts` pattern for CRUD operations
- Follow Session 1.4.4 pattern for cache invalidation (`refetchQueries` for `['globalData']`)

**Related Documents:**
- **Session 1.4.3 Log**: `../sessions/session-1.4.3-log.md` (pattern for adding business entities to globalData)
- **Session 1.4.4 Log**: `../sessions/session-1.4.4-log.md` (cache invalidation standardization)
- **Audit Document**: `../sessions/session-1.4.4-invalidation-audit.md` (invalidation patterns)

---

## Admin Panel Field Improvements (Session 1.4.8)

### Session 1.4.8: Admin Panel Field Rendering and Value Sync Improvements

**Status:** ✅ Complete  
**Priority:** High (Admin panel reliability)  
**Dependencies:** Session 1.4.7 (Data Flow Consolidation - BusinessData Cache Architecture) ✅ Complete

**Goal:** Fix admin panel field metadata rendering issues, replace toggle switches with status buttons, and refactor field value synchronization to use vee-validate's setValue API.

**Key Accomplishments:**

1. **Field Metadata Rendering Fixes**
   - ✅ Fixed EntityCard template bug (removed `.value` from computed refs)
   - ✅ Fixed "Unknown input type" warnings
   - ✅ Updated AdminPrimitiveMetadataEditor (removed obsolete 'toggle', added 'iconSelect')

2. **Status Button Implementation**
   - ✅ Replaced BooleanInput toggle switches with StatusButton chips
   - ✅ Added disabled prop support for read-only scenarios
   - ✅ Better visual feedback with text labels (Active/Inactive)

3. **Field Value Sync Refactoring**
   - ✅ Updated `useFieldContextState` to use vee-validate `setValue` API
   - ✅ Changed watch to use `setValue` instead of `handleChange` for store sync
   - ✅ Updated EntityCard watch with `immediate: true` and `setValues` after `resetForm`

4. **Database and API Updates**
   - ✅ Created migrations for `differential_override` columns
   - ✅ Enhanced admin metadata routers
   - ✅ Updated part_instance model

**Key Files Modified:**
- `client/src/components/admin/generic/EntityCard.vue`
- `client/src/components/admin/AdminPrimitiveMetadataEditor.vue`
- `client/src/composables/fieldContext/useFieldContextState.ts`
- `client/src/utils/forms/fieldComponentDispatcher.ts`
- `server/src/db/migrations/20260115_add_differential_override_*.mjs`
- `server/src/routes/internal/admin-*-metadata/*.ts`

**Success Criteria:**
- ✅ EntityCard template rendering fixed (no .value in templates)
- ✅ "Unknown input type" warnings eliminated
- ✅ Toggle switches replaced with StatusButton chips
- ✅ Field value sync using setValue API
- ✅ Database migrations created for new fields
- ✅ All modified components working correctly

**Related Documents:**
- **Session Log**: `../sessions/session-1.4.8-log.md`

---

## Initial UI Setup Phase (Sessions 1.4.9-1.4.11)

### Session 1.4.9: Card Functionality and Button Connections

**Status:** Not Started  
**Priority:** High (Foundation for wizard functionality)  
**Dependencies:** Session 1.4.8 (Admin Panel Field Rendering and Value Sync Improvements) ✅ Complete

**Goal:** Ensure all selection cards work correctly and all buttons are connected to their proper data sources. Verify composables and components are functional in draft state.

**Objectives:**
- Audit and verify all selection cards work in all wizard steps
- Connect all buttons to correct data sources and handlers
- Verify composable connections work correctly
- Ensure wizard state flows correctly through all steps

**Key Tasks:**

1. **Audit Selection Cards**
   - Verify `SelectionCardGroup` components work in all steps
   - Check `ServiceSelectionStep` cards (user type, services)
   - Check `PropertyDetailsStep` cards (property types, dwelling adjustments, availability options)
   - Verify cards update wizard state correctly via `wizardStatePlugin`
   - Test card selection/deselection functionality
   - Verify multi-select cards work correctly

2. **Connect Buttons to Data**
   - Verify "Previous" and "Next" buttons in `BookingWizard.vue` call correct handlers
   - Check "Submit" button on ConfirmationStep connects to submission logic
   - Verify quote mode toggle button updates wizard state correctly
   - Test all form submission buttons in ContactsStep
   - Verify all button handlers update wizard state appropriately

3. **Verify Composable Connections**
   - Ensure `useBookingWizard` provides correct state to all steps
   - Verify `useWizardNavigation` handles step transitions correctly
   - Check `useWizardValidation` validates steps properly
   - Test `useWizardSubmission` collects and submits data correctly
   - Verify all composables maintain reactivity

**Key Files:**
- `client/src/components/booking/SelectionCardGroup.vue` (review/verify)
- `client/src/components/booking/plugins/wizardStatePlugin.ts` (review/verify)
- `client/src/components/booking/BookingWizard.vue` (review/verify)
- `client/src/composables/useBookingWizard.ts` (review/verify)
- `client/src/composables/booking/useWizardNavigation.ts` (review/verify)
- `client/src/composables/booking/useWizardValidation.ts` (review/verify)
- `client/src/composables/booking/useWizardSubmission.ts` (review/verify)

**Success Criteria:**
- ✅ All selection cards work correctly in all wizard steps
- ✅ All buttons connected to correct data sources and handlers
- ✅ All composables provide correct state and functionality
- ✅ Wizard state flows correctly through all steps
- ✅ No broken card selections or button handlers

**Related Documents:**
- **Session Log**: `../sessions/session-1.4.9-log.md`

---

- [x] ### Session 1.4.10: Complete ContactsStep and Add Property Confirmation Modal

**Status:** ✅ Complete  
**Priority:** High (Complete wizard step functionality)  
**Dependencies:** Session 1.4.9 (Card Functionality and Button Connections) ✅ Complete

**Goal:** Finish ContactsStep setup and add property details confirmation modal. Enable navigation to step 3 (ContactsStep).

**Objectives:**
- Complete ContactsStep functionality
- Add property confirmation modal to PropertyDetailsStep
- Enable wizard navigation to step 3
- Test step transitions and validation

**Key Tasks:**

1. **Complete ContactsStep Functionality**
   - Verify all contact form fields work correctly
   - Ensure optional sections (Another Client, Transaction Manager, Seller) toggle properly
   - Verify form validation works for all fields
   - Test loading contact data from appointments
   - Ensure step data is properly saved to `contactsStepData` ref
   - Verify all contact fields update wizard state

2. **Add Property Confirmation Modal**
   - Create modal component for property details confirmation
   - Add modal trigger in `PropertyDetailsStep.vue` (e.g., after address selection or before proceeding)
   - Display property details summary in modal
   - Add "Confirm" and "Edit" buttons
   - "Confirm" should allow proceeding to next step
   - "Edit" should close modal and allow editing
   - Style modal to match existing design patterns

3. **Test Wizard Navigation**
   - Verify wizard can navigate from step 0 → 1 → 2 → 3
   - Test validation prevents skipping incomplete steps
   - Ensure step completion tracking works correctly
   - Verify step data persists when navigating back and forth

**Key Files:**

**To Create:**
- `client/src/components/booking/modals/PropertyConfirmationModal.vue` (new)

**To Modify:**
- `client/src/components/booking/steps/ContactsStep.vue` (complete functionality)
- `client/src/components/booking/steps/PropertyDetailsStep.vue` (add modal integration)
- `client/src/composables/booking/useContactsStepData.ts` (verify functionality)
- `client/src/composables/booking/useContactsValidation.ts` (verify validation)

**Success Criteria:**
- ✅ All ContactsStep form fields work correctly
- ✅ Optional sections toggle properly
- ✅ Form validation works for all fields
- ✅ Property confirmation modal created and integrated
- ✅ Modal displays correct property details
- ✅ Wizard can navigate to step 3 (ContactsStep)
- ✅ Step validation prevents skipping incomplete steps
- ✅ Step data persists correctly

**Key Accomplishments:**
- ✅ Removed hardcoded default values from `useContactsStepData`
- ✅ Created `PropertyConfirmationModal.vue` component
- ✅ Integrated modal into PropertyDetailsStep with "Review & Continue" button
- ✅ Verified wizard navigation to step 3 works correctly

**Related Documents:**
- **Session Log**: `../sessions/session-1.4.10-log.md`

---

### Session 1.4.11: Complete ConfirmationStep and Enable Navigation to Step 4

**Status:** Not Started  
**Priority:** High (Complete wizard flow)  
**Dependencies:** Session 1.4.10 (Complete ContactsStep and Add Property Confirmation Modal) ⏳ Not Started

**Goal:** Remove hardcoded values from ConfirmationStep and enable navigation to final step. Test end-to-end wizard flow.

**Objectives:**
- Remove hardcoded values from ConfirmationStep
- Enable navigation to step 4 (ConfirmationStep)
- Test complete end-to-end wizard flow
- Verify all wizard selections display correctly in summary

**Key Tasks:**

1. **Remove Hardcoded Values from ConfirmationStep**
   - Review `buildConfirmationPriceData` in `confirmationStepData.ts`
   - Remove hardcoded `deliveryCharges = 5.0` (should come from business settings or calculations)
   - Remove hardcoded `deliveryFree = true` (should be based on business rules)
   - Remove hardcoded `couponDiscount = 0` (should come from coupon system when implemented)
   - Ensure all price calculations use actual wizard selections
   - Update price calculation logic to use real data

2. **Complete ConfirmationStep Display**
   - Verify summary table displays all correct data from wizard
   - Ensure price breakdown reflects actual selections
   - Test that changes in previous steps update ConfirmationStep reactively
   - Verify all summary fields populate correctly (service type, property type, address, square footage)
   - Ensure contact information displays correctly

3. **Enable Navigation to Step 4**
   - Ensure wizard can navigate to step 4 (ConfirmationStep)
   - Verify step 3 (ContactsStep) validation allows proceeding when valid
   - Test that "Submit" button on step 4 triggers appointment creation
   - Verify submission success/error handling works
   - Test appointment creation with all selections

4. **Test End-to-End Flow**
   - Test complete wizard flow: step 0 → 1 → 2 → 3 → 4
   - Verify all data flows correctly through each step
   - Test appointment creation with all selections
   - Verify ConfirmationStep displays correct final summary
   - Test navigation back and forth between steps
   - Verify data persists correctly

**Key Files:**

**To Modify:**
- `client/src/utils/booking/confirmationStepData.ts` (remove hardcoded values)
- `client/src/components/booking/steps/ConfirmationStep.vue` (verify display)
- `client/src/composables/booking/useConfirmationStepData.ts` (verify data flow)
- `client/src/components/booking/BookingWizard.vue` (verify navigation to step 4)
- `client/src/composables/booking/useWizardNavigation.ts` (verify step 3 → 4 transition)

**Success Criteria:**
- ✅ All hardcoded values removed from ConfirmationStep
- ✅ Price calculations use actual wizard selections
- ✅ Summary table displays all correct data
- ✅ Price breakdown reflects actual selections
- ✅ Wizard can navigate to step 4 (ConfirmationStep)
- ✅ Step 3 validation allows proceeding when valid
- ✅ Submit button triggers appointment creation
- ✅ End-to-end wizard flow works correctly
- ✅ All wizard selections display correctly in summary

**Related Documents:**
- **Session Log**: `../sessions/session-1.4.11-log.md`

---

### Session 1.4.7: Data Flow Consolidation - BusinessData Cache Architecture

**Status:** ✅ Complete  
**Priority:** High (Architectural improvement)  
**Dependencies:** Session 1.4.6 (Add Annotations to GlobalData and Create useAnnotations Composable) ✅ Complete

**Goal:** Consolidate data caching architecture by separating business data (appointments, properties, users) from configuration data (entities, relationships, annotations). Create unified BusinessData cache with optimistic + refetchQueries invalidation pattern.

**Note:** This session was originally numbered 1.4.9 and has been renumbered to 1.4.7 to reflect actual completion order.

**Architectural Decision:**
- **WHY:** Business data changes frequently (booking operations), configuration data changes rarely (admin operations)
- **PROBLEM:** Having all data in globalData caused unnecessary refetches when business data changed
- **SOLUTION:** Separate caches for granular invalidation

**Key Tasks:**

1. ✅ **Move AnnotationType to GlobalData**
   - Added `annotationTypes` to GlobalData type
   - Updated transformer to fetch annotation types in parallel
   - Updated useAnnotationType to read from globalData.annotationTypes
   - Mutations use `refetchQueries(['globalData'])`

2. ✅ **Create BusinessData Cache Architecture**
   - Created `fetchToBusinessTransformer.ts` (parallel fetch for appointments, properties, users)
   - Created `useBusiness.ts` composable
   - Created `businessDataCollections/` pattern (mirrors globalDataCollections):
     - `types.ts`
     - `useBusinessDataCollectionQuery.ts`
     - `useBusinessDataCollectionActions.ts`
     - `useBusinessDataCollectionCrud.ts`
     - `index.ts`

3. ✅ **Refactor Business Composables**
   - Updated `useAppointment.ts` to use BusinessData cache
   - Updated `useProperty.ts` to use BusinessData cache
   - Updated `useUser.ts` to use BusinessData cache
   - All use optimistic + refetchQueries pattern

4. ✅ **Update Tests**
   - Updated `useAnnotationType.test.ts` for globalData pattern
   - Updated `useAppointment.test.ts` for businessData pattern
   - Updated `useProperty.test.ts` for businessData pattern
   - Updated `useUser.test.ts` for businessData pattern

5. ✅ **Create Documentation**
   - Created `CACHE_ARCHITECTURE.md` architecture decision record
   - Updated phase handoff document

**Key Files:**

**Created:**
- `client/src/utils/transformers/fetchToBusinessTransformer.ts`
- `client/src/composables/useBusiness.ts`
- `client/src/composables/businessDataCollections/types.ts`
- `client/src/composables/businessDataCollections/useBusinessDataCollectionQuery.ts`
- `client/src/composables/businessDataCollections/useBusinessDataCollectionActions.ts`
- `client/src/composables/businessDataCollections/useBusinessDataCollectionCrud.ts`
- `client/src/composables/businessDataCollections/index.ts`
- `.project-manager/features/data-flow-alignment/docs/CACHE_ARCHITECTURE.md`

**Modified:**
- `client/src/utils/transformers/fetchToGlobalTransformer.ts` (added annotationTypes)
- `client/src/composables/useGlobal.ts` (exposed isLoading, error)
- `client/src/composables/useAnnotationType.ts` (reads from globalData)
- `client/src/composables/useAppointment.ts` (uses BusinessData)
- `client/src/composables/useProperty.ts` (uses BusinessData)
- `client/src/composables/useUser.ts` (uses BusinessData)
- `client/src/composables/__tests__/useAnnotationType.test.ts`
- `client/src/composables/__tests__/useAppointment.test.ts`
- `client/src/composables/__tests__/useProperty.test.ts`
- `client/src/composables/__tests__/useUser.test.ts`

**Success Criteria:**
- ✅ AnnotationType reads from globalData.annotationTypes
- ✅ Appointments, properties, users read from businessData cache
- ✅ All mutations use optimistic updates + refetchQueries pattern
- ✅ All tests updated for new pattern
- ✅ No regressions in admin panel or booking wizard functionality
- ✅ Documentation reflects current architecture

**Cache Architecture Summary:**
```
┌─────────────────────────────────┬───────────────────────────────────────┐
│ GlobalData ['globalData']       │ BusinessData ['businessData']         │
├─────────────────────────────────┼───────────────────────────────────────┤
│ • entities (4 types)            │ • appointments                        │
│ • relationships (6 types)       │ • properties                          │
│ • annotations                   │ • users                               │
│ • annotationTypes               │                                       │
├─────────────────────────────────┼───────────────────────────────────────┤
│ Pattern: refetchQueries         │ Pattern: optimistic + refetchQueries  │
│ Change Frequency: Low           │ Change Frequency: High                │
└─────────────────────────────────┴───────────────────────────────────────┘
```

**Related Documents:**
- **Architecture Decision Record**: `../docs/CACHE_ARCHITECTURE.md`
- **Session Log**: `../sessions/session-1.4.7-log.md` (renumbered from session-1.4.9-log.md)
- **Session 1.4.3 Log**: `../sessions/session-1.4.3-log.md` (original integration)
- **Session 1.4.4 Log**: `../sessions/session-1.4.4-log.md` (invalidation standardization)

---

### Session 1.4.12: Database Rebuild with Comprehensive Seed Data

**Status:** Not Started  
**Priority:** High (Required for UAT)  
**Dependencies:** Session 1.4.11 (Complete ConfirmationStep and Enable Navigation to Step 4) ⏳ Not Started

**Goal:** Rebuild database with proper seed data for all Phase 1.3 and 1.4 changes. Manually populate database via admin panel and booking wizard, then regenerate all seed scripts based on the actual database state.

**Status:** Not Started  
**Priority:** High (Required for UAT)  
**Dependencies:** Session 1.4.6 (Add Annotations to GlobalData and Create useAnnotations Composable) ⏳ Not Started

**Goal:** Rebuild database with proper seed data for all Phase 1.3 and 1.4 changes. Manually populate database via admin panel and booking wizard, then regenerate all seed scripts based on the actual database state.

**Rationale:** Database schema has changed significantly during Phase 1.3 (JSONB arrays for multi-select, property/address separation) and Phase 1.4 (business_settings table). Old dummy data is incompatible with new frontend behaviors. By manually populating the database first, then regenerating seed scripts from the actual database state, we ensure seed scripts accurately reflect the real data structure, relationships, and edge cases.

**Objectives:**
- Review all schema changes from Phase 1.3 and 1.4
- Manually populate database with comprehensive test data via admin panel and booking wizard
- Export all data from populated database
- Delete old seed scripts
- Rewrite seed scripts based on exported database data
- Verify seed scripts can recreate the database state
- Verify all relationships and foreign keys work correctly
- Verify data supports all wizard and admin panel features

**Key Tasks:**

**Phase 1: Manual Database Population**

1. **Review Schema Changes**
   - Review Phase 1.3 changes: JSONB arrays (accServices, accDwelling, accAvailability), property/address separation, differential column
   - Review Phase 1.4 changes: business_settings table
   - Document all foreign keys and relationships
   - Document all JSONB field structures

2. **Clear/Reset Database**
   - Run database reset/migration to ensure clean slate
   - Verify all migrations applied successfully

3. **Manually Create Block Shapes and Instances**
   - Create all block shapes via admin panel (user types, services, dwelling adjustments, availability options)
   - Create block instances for each shape via admin panel
   - Ensure differential services have differential=true
   - Create cascading relationships (user type → services → dwelling adjustments → availability options)
   - Include edge cases (composite services, services with no parts)

4. **Manually Create Part Shapes and Instances**
   - Create all part shapes via admin panel (service parts, dwelling parts, availability parts)
   - Create part instances with baseTime values via admin panel
   - Link part instances to block instances correctly
   - Include edge cases (zero duration, very long duration)

5. **Manually Create Properties and Addresses**
   - Create addresses via booking wizard or admin panel (deduplicated)
   - Create property_versions linking addresses to properties
   - Create property_details with realistic data
   - Include edge cases (multiple properties same address, properties without addresses)

6. **Manually Create Users**
   - Create users with different roles via admin panel (client, agent, transaction_manager, seller)
   - Include realistic contact information
   - Include edge cases (users with no appointments, users with many appointments)

7. **Manually Create Appointments**
   - Create appointments via booking wizard demonstrating single-select (legacy compatibility)
   - Create appointments via booking wizard demonstrating multi-select (multiple services, dwelling adjustments, availability options)
   - Create appointments with differential services
   - Create appointments in different statuses (draft, quote, booked, completed, cancelled)
   - Include edge cases (appointments with all options, appointments with minimal data)

8. **Manually Configure Business Settings**
   - Configure default availability hours via admin panel (9 AM - 5 PM, Monday-Friday)
   - Configure default time increment (15 minutes)
   - Configure default lead time (24 hours)

9. **Verify Manually Populated Data**
   - Verify all foreign keys satisfied
   - Verify JSONB arrays populated correctly
   - Query database to verify data integrity
   - Test loading data in booking wizard
   - Test loading data in admin panel
   - Document any relationships or edge cases discovered

**Phase 2: Seed Script Regeneration**

10. **Export Block Shapes Data**
    - Export all block shapes from database to JSON format
    - Save to `server/src/db/seedScripts/adminSeeds/block_shape_seeds.json`
    - Ensure all fields exported (id, name, kind, etc.)

11. **Export Block Instances Data**
    - Export all block instances from database to JSON format
    - Save to `server/src/db/seedScripts/schedulerSeeds/block_instance_seeds.json`
    - Ensure all fields exported (id, name, blockShapeRef, visible, description, icon, baseSqFt, differential, disabled, etc.)

12. **Export Part Shapes Data**
    - Export all part shapes from database to JSON format
    - Save to `server/src/db/seedScripts/adminSeeds/part_shape_seeds.json`
    - Ensure all fields exported (id, name, kind, etc.)

13. **Export Part Instances Data**
    - Export all part instances from database to JSON format
    - Save to `server/src/db/seedScripts/schedulerSeeds/part_instance_seeds.json`
    - Ensure all fields exported (id, partShapeRef, onSite, clientPresent, moveable, baseFee, rateOverBaseFee, baseTime, rateOverBaseTime, disabled, etc.)

14. **Export Annotation Data**
    - Export annotation shapes to `server/src/db/seedScripts/schedulerSeeds/annotation_type_seeds.json`
    - Export annotation instances to `server/src/db/seedScripts/schedulerSeeds/description_seeds.json`
    - Ensure userType field exported correctly

15. **Export Properties and Addresses Data**
    - Export addresses, property_versions, and property_details from database
    - Update `server/src/db/seedScripts/seedProperties.ts` to use exported data
    - Ensure address separation properly handled

16. **Export Users Data**
    - Export all users from database
    - Update `server/src/db/seedScripts/seedUsers.ts` to use exported data
    - Ensure all roles and contact information exported

17. **Export Appointments Data**
    - Export all appointments from database (including JSONB arrays)
    - Update `server/src/db/seedScripts/seedAppointments.ts` to use exported data
    - Ensure JSONB arrays (accServices, accDwelling, accAvailability) properly formatted

18. **Export Business Settings Data**
    - Export business settings from database
    - Update `server/src/db/seedScripts/seedBusinessSettings.ts` to use exported data

19. **Export Relationship Data**
    - Export validConstituent relationships
    - Export validCascade relationships
    - Export activeConstituent relationships
    - Export activeCascade relationships
    - Export activeAnnotation relationships
    - Update relationship generation logic in `server/src/db/seedScripts/seed.ts` to match exported relationships

20. **Delete Old Seed Scripts**
    - Delete old seed script files (do not archive)
    - Delete or update any outdated seed data files
    - Ensure only new seed scripts based on exported data remain

21. **Rewrite Seed Scripts Based on Exported Data**
    - Update `server/src/db/seedScripts/seed.ts` to use exported JSON files
    - Update all seed script functions to use exported data structure
    - Ensure seed scripts match actual database structure
    - Update relationship generation to match exported relationships
    - Ensure proper order of operations (shapes before instances, etc.)

**Phase 3: Verification**

22. **Clear Database and Run New Seed Scripts**
    - Clear database completely
    - Run all migrations
    - Run new seed scripts
    - Verify no errors during seeding

23. **Verify Seeded Data Matches Manually Populated Database**
    - Compare seeded data with manually populated database
    - Verify all entities created correctly
    - Verify all relationships match
    - Verify JSONB arrays populated correctly
    - Document any differences

24. **Final Verification**
    - Verify all foreign keys satisfied
    - Verify JSONB arrays populated correctly
    - Verify differential services configured correctly
    - Verify property/address separation working
    - Verify business settings seeded
    - Test loading data in booking wizard
    - Test loading data in admin panel
    - Verify data supports all features for UAT

**Key Files:**

**Phase 1 - Manual Population:**
- Admin panel and booking wizard (used to manually create data)

**Phase 2 - Export and Regeneration:**
- `server/src/db/seedScripts/adminSeeds/block_shape_seeds.json` (export and rewrite)
- `server/src/db/seedScripts/adminSeeds/part_shape_seeds.json` (export and rewrite)
- `server/src/db/seedScripts/schedulerSeeds/block_instance_seeds.json` (export and rewrite)
- `server/src/db/seedScripts/schedulerSeeds/part_instance_seeds.json` (export and rewrite)
- `server/src/db/seedScripts/schedulerSeeds/annotation_type_seeds.json` (export and rewrite)
- `server/src/db/seedScripts/schedulerSeeds/description_seeds.json` (export and rewrite)
- `server/src/db/seedScripts/seedProperties.ts` (rewrite based on exported data)
- `server/src/db/seedScripts/seedUsers.ts` (rewrite based on exported data)
- `server/src/db/seedScripts/seedAppointments.ts` (rewrite based on exported data)
- `server/src/db/seedScripts/seedDifferentialServices.ts` (rewrite based on exported data)
- `server/src/db/seedScripts/seedBusinessSettings.ts` (rewrite based on exported data)
- `server/src/db/seedScripts/seed.ts` (rewrite relationship generation logic)

**Success Criteria:**
- ✅ All schema changes reviewed and documented
- ✅ Database manually populated with comprehensive test data via admin panel and booking wizard
- ✅ All data exported from populated database
- ✅ Old seed scripts deleted
- ✅ New seed scripts rewritten based on exported database data
- ✅ Seed scripts can recreate the database state
- ✅ All migrations run successfully
- ✅ All seed scripts run without errors
- ✅ Seeded data matches manually populated database
- ✅ All foreign keys satisfied
- ✅ JSONB arrays populated correctly
- ✅ Differential services configured correctly
- ✅ Property/address separation working
- ✅ Business settings seeded
- ✅ Data loads correctly in booking wizard
- ✅ Data loads correctly in admin panel
- ✅ Data supports all features for UAT

---

### Session 1.4.13: Comprehensive User Acceptance Testing (Phase Gate)

**Status:** Not Started  
**Priority:** Critical (Gate to Phase 1.5 - Must pass before proceeding)  
**Dependencies:** Session 1.4.12 (Database Rebuild with Comprehensive Seed Data) ⏳ Not Started

**Goal:** Execute comprehensive user acceptance testing covering all booking wizard and admin panel features. Document all findings with severity ratings. Ensure system is production-ready and gate criteria are met before advancing to Phase 1.5.

**Rationale:** All Phase 1.3 and 1.4 code changes are complete. Database has been rebuilt with comprehensive seed data. Now we need systematic testing to validate all features work correctly and identify any critical issues before moving to Phase 1.5.

**Objectives:**
- Execute UAT for all booking wizard features
- Execute UAT for all admin panel features
- Document all findings with severity ratings
- Fix critical and high-priority findings
- Verify gate criteria met
- Ensure system production-ready for Phase 1.5

**Test Coverage:**

The comprehensive test checklist in the feature guide Phase 1.4 Session 2 covers:
- **Booking Wizard - Service Selection Step:** Single/multiple selection, filtering, cascading, icons, differential indicators
- **Booking Wizard - Property Details Step:** Property/address creation, dwelling adjustments (single/multiple), validation
- **Booking Wizard - Availability Step:** Calendar, time slots, differential scheduling (inspector/client toggle, Time On-Site Graph), duration calculation
- **Booking Wizard - Appointment Summary Step:** All selections displayed correctly
- **Booking Wizard - Appointment Creation:** Single/multiple selections, JSONB arrays saved correctly
- **Booking Wizard - Appointment Loading/Editing:** Pre-selection from arrays, updates
- **Booking Wizard - Navigation:** Validation, step completion tracking, navigation guards
- **Booking Wizard - Form Validation:** Required fields, error messages, blur/submit validation
- **Booking Wizard - State Management:** Persistence across steps, cascading clears, reactive updates
- **Admin Panel - Profiles Tab:** User type CRUD using globalData cache
- **Admin Panel - Shapes Tab:** Block/part shape CRUD using globalData cache
- **Admin Panel - Data Management Tab:** Appointment/property/user CRUD using globalData cache
- **Admin Panel - Business Controls Tab:** Settings CRUD, availability settings form
- **Performance Testing:** Load times, responsiveness, memory usage
- **Cross-Browser Testing:** Chrome, Firefox, Safari (desktop and mobile)
- **Responsive Testing:** Desktop, laptop, tablet, mobile viewports

**Key Tasks:**

1. **Execute Booking Wizard UAT**
   - Follow test checklist from the feature guide Phase 1.4 Session 2
   - Test each wizard step systematically
   - Test navigation and validation
   - Test appointment creation and loading
   - Test multi-select features (services, dwelling, availability)
   - Test differential scheduling features
   - Document all findings with screenshots/videos

2. **Execute Admin Panel UAT**
   - Test all admin tabs (Profiles, Shapes, Data Management, Business Controls)
   - Test CRUD operations on each tab
   - Verify globalData cache usage (no direct API calls)
   - Verify cache invalidation (UI updates immediately)
   - Test pagination, sorting, filtering
   - Document all findings

3. **Execute Performance Testing**
   - Measure initial page load time (target: < 3s)
   - Measure wizard step transitions (target: < 500ms)
   - Measure time slot generation (target: < 1s)
   - Measure admin CRUD operations (target: < 2s)
   - Check browser console for errors/warnings
   - Monitor browser memory usage for leaks
   - Document performance metrics

4. **Execute Cross-Browser Testing**
   - Test on Chrome (latest, desktop)
   - Test on Firefox (latest, desktop)
   - Test on Safari (latest, desktop)
   - Test on Chrome (mobile)
   - Test on Safari (mobile)
   - Document browser-specific issues

5. **Execute Responsive Testing**
   - Test on desktop (1920x1080)
   - Test on laptop (1366x768)
   - Test on tablet portrait (768x1024)
   - Test on tablet landscape (1024x768)
   - Test on mobile (375x667)
   - Test on mobile minimum (320x568)
   - Document responsive issues

6. **Document Findings**
   - For each issue: test case reference, steps to reproduce, expected/actual behavior, severity, screenshots
   - Categorize by severity: Critical, High, Medium, Low
   - Create findings report: `phase-1.4-uat-findings.md`
   - Update findings as issues are fixed and retested

7. **Fix Critical and High Findings**
   - Fix all critical findings immediately (blocking functionality)
   - Fix all high findings if time permits (significant usability impact)
   - Document medium/low findings as known issues (can defer to future phases)
   - Retest after each fix
   - Update findings report with fix status

8. **Verify Gate Criteria**
   - No critical findings remain unresolved
   - All high findings resolved or have documented workarounds
   - At least 90% of test cases pass
   - Database seed scripts working correctly
   - All CRUD operations functional
   - Performance metrics meet targets
   - System deemed production-ready

**Findings Management:**

**During Testing:**
- Document each issue with: test case reference, steps to reproduce, expected behavior, actual behavior, severity, screenshots/videos
- Use severity ratings:
  - **Critical:** Blocks basic functionality, must fix before Phase 1.5
  - **High:** Significant usability impact, should fix before Phase 1.5
  - **Medium:** Moderate impact, can defer to Phase 1.5+
  - **Low:** Polish/enhancement, can defer to future phases
- Use slash commands:
  - `/bug-report <description>` - Create bug report with details
  - `/finding-critical <description>` - Flag critical issue
  - `/finding-high <description>` - Flag high-priority issue
  - `/finding-medium <description>` - Flag medium-priority issue
  - `/finding-low <description>` - Flag low-priority issue
  - `/retest <test-case-id>` - Mark for re-testing after fix
  - `/finding-resolved <finding-id>` - Mark as resolved after verification

**Gate Criteria:**
- ✅ No critical findings remain unresolved
- ✅ All high-priority findings resolved or documented with workarounds
- ✅ At least 90% of test cases pass
- ✅ Database seed scripts working correctly
- ✅ All CRUD operations functional
- ✅ Performance metrics meet targets
- ✅ Cross-browser testing complete with no major issues
- ✅ Responsive testing complete with acceptable behavior
- ✅ All findings documented and prioritized
- ✅ System deemed production-ready for Phase 1.5

**Key Files:**

**Test Subjects:**
- `client-vue/src/components/booking/BookingWizard.vue` (main wizard component)
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` (service selection)
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue` (property/dwelling)
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` (calendar/time slots/differential)
- `client-vue/src/components/booking/TimeSlotGrid.vue` (time slot display)
- `client-vue/src/views/admin/AdminPanel.vue` (admin panel main)
- `client-vue/src/views/admin/tabs/ProfilesTab.vue` (profiles tab)
- `client-vue/src/views/admin/tabs/ShapesTab.vue` (shapes tab)
- `client-vue/src/views/admin/tabs/DataManagementTab.vue` (data management tab)
- `client-vue/src/views/admin/tabs/BusinessControlsTab.vue` (business controls tab)

**Test Documentation:**
- `project-manager/features/data-flow-alignment/phases/phase-1.4-uat-findings.md` (created during testing)
- `project-manager/features/data-flow-alignment/phases/phase-1.4-uat-execution-report.md` (test results)

**Success Criteria:**
- ✅ All booking wizard test cases executed and documented
- ✅ All admin panel test cases executed and documented
- ✅ At least 90% of test cases pass
- ✅ No critical findings remain unresolved
- ✅ All high-priority findings resolved or documented with workarounds
- ✅ Performance metrics meet targets (page load < 3s, transitions < 500ms, time slot gen < 1s, CRUD < 2s)
- ✅ Cross-browser testing complete with no major issues
- ✅ Responsive testing complete with acceptable behavior on all viewports
- ✅ All findings documented with severity ratings and reproduction steps
- ✅ Gate criteria met
- ✅ System deemed production-ready for Phase 1.5

**Deliverables:**
1. UAT findings report: `project-manager/features/data-flow-alignment/phases/phase-1.4-uat-findings.md`
2. UAT execution report: `project-manager/features/data-flow-alignment/phases/phase-1.4-uat-execution-report.md`
3. Known issues document (if medium/low findings deferred): `project-manager/features/data-flow-alignment/phases/phase-1.4-known-issues.md`
4. Sign-off document confirming gate criteria met: `project-manager/features/data-flow-alignment/phases/phase-1.4-gate-signoff.md`

**Related Documents:**
- **Feature Guide**: `../feature-data-flow-alignment-guide.md` (Phase 1.4 Session 2 - comprehensive test checklist)
- **Phase 1.3 Handoff**: `phase-1.3-handoff.md` (schema changes reference)
- **Phase 1.4 Session 1.4.12 Log**: `../sessions/session-1.4.12-log.md` (seed data created)

---

## Key Files

### Composables
- `client-vue/src/composables/useGlobal.ts` - Global data cache
- `client-vue/src/composables/useEntity.ts` - Entity CRUD operations
- `client-vue/src/composables/useRelationship.ts` - Relationship operations

### Admin Panel Components
- `client-vue/src/views/admin/AdminPanel.vue` - Main admin panel
- `client-vue/src/views/admin/tabs/BusinessControlsTab.vue` - Business controls tab (new)
- `client-vue/src/components/admin/` - Admin components

### Backend
- `server/src/db/models/admin/business_settings.ts` - Business settings model (new)
- `server/src/routes/internal/businessSettingsRouter.ts` - Business settings API (new)
- `server/src/routes/internal/availabilityRouter.ts` - Availability router (modify)
- `server/src/db/seedScripts/seedBusinessSettings.ts` - Seed script (new)

### Configuration
- `client-vue/src/configs/availabilitySettings.ts` - Availability settings config (modify)

---

## Success Criteria

- ✅ All admin panel CRUD operations use globalData cache
- ✅ No direct API calls bypassing globalData
- ✅ Mutations properly invalidate globalData
- ✅ All admin panel interactions working correctly
- ✅ Business controls admin tab created and functional
- ✅ Database rebuilt with comprehensive seed data for testing
- ✅ Comprehensive UAT completed with all test cases documented
- ✅ No critical findings remaining unresolved
- ✅ Phase gate criteria met before advancing to Phase 1.5

---

## Architecture Notes

### GlobalData Cache Pattern
- All CRUD operations should use `useGlobal` composable
- Mutations should invalidate relevant cache entries
- No direct API calls from components (use composables)

### Business Settings Pattern
- Settings stored in database with JSONB for flexibility
- Client-side fetches settings on initialization
- Server-side caches settings in memory
- Fallback to defaults if settings don't exist

### Testing Strategy
- Comprehensive UAT covering all wizard features
- Document all findings with severity and reproduction steps
- Gate criteria must be met before Phase 1.5
- Critical findings block progression

---

## Next Phase

**Ready for:** Phase 1.5 - Business Rules & Validation (only after Phase 1.4 Session 1.4.13 gate criteria met)

---

**Phase Status:** In Progress  
**Current Session:** 1.4.10 ✅ Complete  
**Next Session:** Session 1.4.11 - Complete ConfirmationStep and Enable Navigation to Step 4  
**Last Updated:** 2026-01-31

---

## Session docs (integrated)

### session-1.4.2-booking-wizard-cache-audit

# Booking Wizard Cache Usage Audit

**Feature:** Data Flow Alignment  
**Phase:** 1.4 - Admin Panel Data Flow Fixes  
**Session:** 1.4.2 - Verify Admin Panel GlobalData Cache Usage  
**Date:** 2026-01-07

---

### session-1.4.2-cache-audit

# Session 1.4.2 Cache Audit: Admin Panel GlobalData Cache Usage

**Feature:** Data Flow Alignment  
**Phase:** 1.4 - Admin Panel Data Flow Fixes  
**Session:** 1.4.2 - Verify Admin Panel GlobalData Cache Usage  
**Status:** ✅ Complete  
**Date:** 2026-01-07

---

### session-1.4.4-invalidation-audit

# Cache Invalidation Audit - Session 1.4.4

**Date:** 2026-01-07  
**Session:** 1.4.4 - Ensure Proper Cache Invalidation on Mutations

---

## Executive Summary

This audit examines cache invalidation patterns across all composables to ensure consistent and correct cache invalidation after mutations.

**Key Findings:**
- ✅ Most composables invalidate `['globalData']` correctly
- ⚠️ Inconsistency: Some use `refetchQueries`, others use `invalidateQueries`
- ⚠️ `useAnnotationType` uses separate cache key `['annotationTypes']` (expected - not part of globalData)
- ✅ All entity CRUD operations invalidate cache
- ✅ All relationship operations invalidate cache

---

## Invalidation Pattern Analysis

### Pattern 1: `refetchQueries` (Waits for fresh data)

**Composables using this pattern:**
- `useEntity.ts` - All mutations (create, update, delete, patchOrderIndex)
- `useRelationship.ts` - All mutations (create, delete)
- `useComponentEntity.ts` - All mutations (add, remove, reorder)
- `usePrimitiveMutation` (in useEntity.ts) - Field updates

**Advantages:**
- ✅ Immediately fetches fresh data
- ✅ Ensures UI has latest data before next operation
- ✅ Better for operations that need immediate feedback

**Disadvantages:**
- ⚠️ Slightly slower (waits for API call)
- ⚠️ May cause unnecessary refetches if multiple mutations happen quickly

**Example:**
```typescript
onSuccess: async () => {
  await queryClient.refetchQueries({ queryKey: ['globalData'] })
}
```

---

### Pattern 2: `invalidateQueries` (Marks as stale, refetches on next access)

**Composables using this pattern:**
- `useAppointment.ts` - All mutations (create, update, delete, patch)
- `useProperty.ts` - All mutations (create, update, delete, patch)
- `useUser.ts` - All mutations (create, update, delete, patch)
- `useAnnotationType.ts` - All mutations (create, update, delete) - Uses `['annotationTypes']` key

**Advantages:**
- ✅ Faster (doesn't wait for API call)
- ✅ Better for performance when multiple mutations happen
- ✅ Data refetches when next accessed

**Disadvantages:**
- ⚠️ UI may show stale data briefly
- ⚠️ Requires component to access data to trigger refetch

**Example:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['globalData'] })
}
```

---

### Pattern 3: Mixed (Both patterns used)

**Composables using this pattern:**
- `useFieldContext.ts` - Uses both `invalidateQueries` and `refetchQueries` in different contexts

**Analysis:**
- Uses `invalidateQueries` for some operations
- Uses `refetchQueries` for others
- Comment indicates awareness: "Mutations use refetchQueries in onSuccess, so no need to invalidate here"

---

## Detailed Composable Analysis

### ✅ useEntity.ts

**Status:** ✅ Correct

**Invalidation:**
- `usePrimitiveMutation`: `refetchQueries(['globalData'])` + conditional `invalidateQueries(['schedulerAdmin'])`
- `createMutation`: `refetchQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `refetchQueries(['globalData'])`
- `deleteMutation`: `refetchQueries(['globalData'])` (twice - before and after normalization)
- `patchOrderIndexMutation`: `refetchQueries(['globalData'])` + conditional `invalidateQueries(['schedulerAdmin'])`

**Notes:**
- Uses `refetchQueries` consistently
- Includes optimistic cache update for create operations
- Normalizes order indices after delete

---

### ✅ useRelationship.ts

**Status:** ✅ Correct

**Invalidation:**
- `createMutation`: `refetchQueries(['globalData'])`
- `deleteMutation`: `refetchQueries(['globalData'])`

**Notes:**
- Uses `refetchQueries` consistently
- Simple and correct

---

### ⚠️ useAppointment.ts

**Status:** ⚠️ Uses `invalidateQueries` instead of `refetchQueries`

**Invalidation:**
- `createMutation`: `invalidateQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `invalidateQueries(['globalData'])`
- `deleteMutation`: `invalidateQueries(['globalData'])`
- `patchMutation`: `invalidateQueries(['globalData'])`

**Recommendation:**
- Consider changing to `refetchQueries` for consistency with `useEntity`
- Or document why `invalidateQueries` is preferred

---

### ⚠️ useProperty.ts

**Status:** ⚠️ Uses `invalidateQueries` instead of `refetchQueries`

**Invalidation:**
- `createMutation`: `invalidateQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `invalidateQueries(['globalData'])`
- `deleteMutation`: `invalidateQueries(['globalData'])`
- `patchMutation`: `invalidateQueries(['globalData'])`

**Recommendation:**
- Consider changing to `refetchQueries` for consistency with `useEntity`
- Or document why `invalidateQueries` is preferred

---

### ⚠️ useUser.ts

**Status:** ⚠️ Uses `invalidateQueries` instead of `refetchQueries`

**Invalidation:**
- `createMutation`: `invalidateQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `invalidateQueries(['globalData'])`
- `deleteMutation`: `invalidateQueries(['globalData'])`
- `patchMutation`: `invalidateQueries(['globalData'])`

**Recommendation:**
- Consider changing to `refetchQueries` for consistency with `useEntity`
- Or document why `invalidateQueries` is preferred

---

### ✅ useComponentEntity.ts

**Status:** ✅ Correct

**Invalidation:**
- `reorderComponentsMutation`: `refetchQueries(['globalData'])`
- `addToComponentMutation`: `refetchQueries(['globalData'])`
- `removeFromComponentMutation`: `refetchQueries(['globalData'])`
- `distributeComputedPropertyMutation`: `refetchQueries(['globalData'])`

**Notes:**
- Uses `refetchQueries` consistently
- All component operations properly invalidate cache

---

### ✅ useAnnotationType.ts

**Status:** ✅ Correct (Uses separate cache key - expected)

**Invalidation:**
- `useCreateAnnotationType`: `invalidateQueries(['annotationTypes'])`
- `useUpdateAnnotationType`: `invalidateQueries(['annotationTypes'])`
- `useDeleteAnnotationType`: `invalidateQueries(['annotationTypes'])`

**Notes:**
- Uses separate cache key `['annotationTypes']` (not part of globalData)
- This is correct - annotation types are not entities in ENTITY_KEYS
- Uses `invalidateQueries` which is appropriate for this use case

---

### ⚠️ useFieldContext.ts

**Status:** ⚠️ Mixed patterns

**Invalidation:**
- Some operations use `invalidateQueries([entityKey])` + `invalidateQueries(['globalData'])`
- Some operations use `refetchQueries` (via mutations)
- Comment indicates awareness: "Mutations use refetchQueries in onSuccess, so no need to invalidate here"

**Recommendation:**
- Review and standardize invalidation pattern
- Ensure all operations properly invalidate cache

---

## Recommendations

### 1. Standardize Invalidation Pattern

**Option A: Use `refetchQueries` everywhere (Recommended)**
- ✅ Ensures immediate fresh data
- ✅ Better user experience (no stale data)
- ✅ Consistent with `useEntity` pattern
- ⚠️ Slightly slower (waits for API call)

**Option B: Use `invalidateQueries` everywhere**
- ✅ Faster (doesn't wait)
- ✅ Better for performance
- ⚠️ May show stale data briefly
- ⚠️ Requires components to access data to trigger refetch

**Recommendation:** Use `refetchQueries` for `['globalData']` mutations to ensure immediate UI updates. Use `invalidateQueries` only for non-critical caches or when performance is a concern.

---

### 2. Update useAppointment, useProperty, useUser

**Action:** Change from `invalidateQueries` to `refetchQueries` for consistency with `useEntity`

**Rationale:**
- Consistency across all entity CRUD operations
- Ensures immediate UI updates
- Better user experience

---

### 3. Review useFieldContext

**Action:** Audit all invalidation calls in `useFieldContext.ts` and standardize pattern

**Rationale:**
- Currently uses mixed patterns
- Should be consistent with other composables

---

### 4. Document Invalidation Strategy

**Action:** Add documentation explaining when to use `refetchQueries` vs `invalidateQueries`

**Guidelines:**
- Use `refetchQueries` for `['globalData']` mutations (ensures immediate updates)
- Use `invalidateQueries` for separate cache keys (like `['annotationTypes']`)
- Use `refetchQueries` when operation needs immediate feedback
- Use `invalidateQueries` when performance is critical and stale data is acceptable

---

## Test Coverage

### Current Test Coverage

**Tests verify invalidation:**
- ✅ `useEntity.test.ts` - Tests invalidation (but may need updates)
- ✅ `useAppointment.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useProperty.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useUser.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useRelationship.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useComponentEntity.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useAnnotationType.test.ts` - Tests invalidation with `['annotationTypes']`

**Test Updates Needed:**
- ⏳ Update tests to verify `refetchQueries` instead of `invalidateQueries` (if we standardize)
- ⏳ Add tests for missing invalidation scenarios

---

## Action Items

1. ⏳ **Standardize invalidation pattern** - Decide on `refetchQueries` vs `invalidateQueries`
2. ⏳ **Update useAppointment, useProperty, useUser** - Change to `refetchQueries` if standardizing
3. ⏳ **Review useFieldContext** - Audit and standardize invalidation
4. ⏳ **Update tests** - Verify invalidation calls match chosen pattern
5. ⏳ **Document strategy** - Add comments/docs explaining invalidation approach

---

## Conclusion

Most composables correctly invalidate `['globalData']` after mutations. The main issue is inconsistency between `refetchQueries` and `invalidateQueries`. Standardizing on `refetchQueries` for `['globalData']` mutations will ensure immediate UI updates and better user experience.

## Executive Summary

This audit identifies which admin panel components correctly use the globalData cache and which bypass it with direct API calls. The audit covers all admin panel tabs and generic admin components.

**Key Findings:**
- ✅ **2 components** use globalData cache correctly (ProfilesTab, ShapesTab)
- ❌ **3 components** bypass globalData cache (AppointmentsTable, PropertiesTable, UsersTable)
- ⚠️ **2 generic components** use direct API calls (SelectInputs [formerly SelectFields], AnnotationsField)
- ✅ **1 component** uses direct API calls (BusinessControlsTab) - **Expected/acceptable** for business settings

**Priority:** High - Data consistency requires all CRUD operations to use unified globalData cache.

---

## Expected Cache Usage Pattern

### Correct Pattern (using globalData cache)

**Read Operations:**
- Use `useGlobal()` composable to read from `globalData` cache
- Access entities via `getGlobalEntities(entityKey)` or `getGlobalEntityById(entityKey, id)`
- Access relationships via `useRelationshipCrud(relationshipKey).relationships`

**Write Operations:**
- Use `useEntityCrud(entityKey)` for entity CRUD operations
- Use `useRelationshipCrud(relationshipKey)` for relationship CRUD operations
- Mutations automatically invalidate `['globalData']` cache on success

**Cache Invalidation:**
- All mutations invalidate `['globalData']` query key
- Cache refetch triggers automatically via Vue Query

### Incorrect Pattern (bypassing globalData cache)

**Direct API Calls:**
- Direct `apiClient.get/post/put/patch/delete()` calls
- `useQuery` with custom query keys (e.g., `['appointments']`, `['properties']`, `['users']`)
- Separate cache keys that don't sync with `['globalData']`

**Problems:**
- Data inconsistency between components
- Stale data displayed after mutations
- Multiple cache sources causing confusion
- No unified data flow

---

## Component Audit Results

### ✅ ProfilesTab.vue - **CORRECT**

**File:** `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and BlockInstances
- ✅ Uses `useEntityCrud('blockInstance')` for orderIndex mutations
- ✅ Reads from `globalData` cache via `getGlobalEntities()`

**Code Pattern:**
```typescript
const { getGlobalEntities } = useGlobal()
const { patchOrderIndex: patchBlockInstanceOrderIndex } = useEntityCrud('blockInstance')

const groupedProfiles = computed(() => {
  const blockShapes = getGlobalEntities('blockShape')
  const blockInstances = getGlobalEntities('blockInstance')
  // ... grouping logic
})
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ ShapesTab.vue - **CORRECT**

**File:** `client-vue/src/views/admin/tabs/ShapesTab.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and PartShapes
- ✅ Uses `useEntityCrud('blockShape')` and `useEntityCrud('partShape')` for CRUD operations
- ✅ Reads from `globalData` cache via `getGlobalEntities()`

**Code Pattern:**
```typescript
const { getGlobalEntities } = useGlobal()
const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')
const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')

const blockShapes = computed(() => getGlobalEntities('blockShape'))
const partShapes = computed(() => getGlobalEntities('partShape'))
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

**Note:** Uses `useAnnotationTypes()` composable for annotation types - needs verification if this uses globalData or direct API calls.

---

### ❌ AppointmentsTable.vue - **NEEDS FIX**

**File:** `client-vue/src/views/admin/tabs/components/AppointmentsTable.vue`

**Cache Usage:**
- ❌ Uses `useAppointment()` composable which bypasses globalData cache
- ❌ `useAppointment().fetchAll` uses `useQuery` with `['appointments']` key (not `['globalData']`)
- ❌ Mutations invalidate `['appointments']` instead of `['globalData']`
- ❌ Also uses `useProperty()` and `useUser()` which bypass globalData cache

**Code Pattern:**
```typescript
const { fetchAll, create, update, remove } = useAppointment()
const { fetchAll: fetchProperties } = useProperty()
const { fetchAll: fetchUsers } = useUser()

const appointments = computed(() => fetchAll.data.value || [])
const properties = computed(() => fetchProperties.data.value || [])
const users = computed(() => fetchUsers.data.value || [])
```

**Problem:**
- `useAppointment()`, `useProperty()`, and `useUser()` composables use direct `useQuery` with separate cache keys
- These queries don't sync with `['globalData']` cache
- Mutations invalidate separate cache keys, not `['globalData']`

**Required Changes:**
1. **Option A (Recommended):** Add appointment/property/user entities to globalData cache
   - Update `fetchToGlobalTransformer` to include appointments, properties, users
   - Update `useAppointment()`, `useProperty()`, `useUser()` to read from globalData cache
   - Update mutations to invalidate `['globalData']` instead of separate keys

2. **Option B:** Create `useEntityCrud` wrappers for appointments/properties/users
   - Use `useEntityCrud('appointment')`, `useEntityCrud('property')`, `useEntityCrud('user')`
   - Requires adding these entity types to globalData cache

**Priority:** High - Data consistency critical for appointments, properties, and users

---

### ❌ PropertiesTable.vue - **NEEDS FIX**

**File:** `client-vue/src/views/admin/tabs/components/PropertiesTable.vue`

**Cache Usage:**
- ❌ Uses `useProperty()` composable which bypasses globalData cache
- ❌ `useProperty().fetchAll` uses `useQuery` with `['properties']` key (not `['globalData']`)
- ❌ Mutations invalidate `['properties']` instead of `['globalData']`

**Code Pattern:**
```typescript
const { fetchAll, create, update, remove } = useProperty()

const properties = computed(() => fetchAll.data.value || [])
```

**Problem:**
- Same issue as AppointmentsTable - uses separate cache key instead of globalData

**Required Changes:**
- Same as AppointmentsTable (add properties to globalData cache or use useEntityCrud wrapper)

**Priority:** High - Data consistency critical for properties

---

### ❌ UsersTable.vue - **NEEDS FIX**

**File:** `client-vue/src/views/admin/tabs/components/UsersTable.vue`

**Cache Usage:**
- ❌ Uses `useUser()` composable which bypasses globalData cache
- ❌ `useUser().fetchAll` uses `useQuery` with `['users']` key (not `['globalData']`)
- ❌ Mutations invalidate `['users']` instead of `['globalData']`

**Code Pattern:**
```typescript
const { fetchAll, create, update, remove } = useUser()

const users = computed(() => fetchAll.data.value || [])
```

**Problem:**
- Same issue as AppointmentsTable - uses separate cache key instead of globalData

**Required Changes:**
- Same as AppointmentsTable (add users to globalData cache or use useEntityCrud wrapper)

**Priority:** High - Data consistency critical for users

---

### ⚠️ BusinessControlsTab.vue - **EXPECTED/ACCEPTABLE**

**File:** `client-vue/src/views/admin/tabs/BusinessControlsTab.vue`

**Cache Usage:**
- ⚠️ Uses direct `apiClient.get()` and `apiClient.put()` calls
- ⚠️ Manages its own cache via `clearAvailabilitySettingsCache()`

**Code Pattern:**
```typescript
const response = await apiClient.get('/business-settings/availability_settings')
await apiClient.put('/business-settings/availability_settings', settings)
```

**Rationale:**
- Business settings are not part of the global entity system
- Settings are stored in separate `business_settings` table
- Settings are not entities (no CRUD via useEntityCrud)
- Direct API calls are acceptable for non-entity data

**Status:** ✅ **No changes needed** - Direct API calls are acceptable for business settings

---

## Generic Component Audit Results

### ⚠️ SelectInputs.vue - **NEEDS REVIEW**

**File:** `client-vue/src/components/admin/generic/fields/SelectInputs.vue` (formerly SelectFields.vue)

**Cache Usage:**
- ⚠️ Uses direct `apiClient.get()` for annotations
- ⚠️ Uses direct `apiClient.get()` for block instance annotations
- ⚠️ Uses direct `apiClient.post()` and `apiClient.delete()` for annotation assignments

**Code Pattern:**
```typescript
const response = await apiClient.get(getAnnotationEndpoint())
const response = await apiClient.get(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value))
await apiClient.post(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value), payload)
await apiClient.delete(getBlockInstanceAnnotationEndpoint(blockInstanceId.value, annotationId))
```

**Problem:**
- Annotations are fetched directly instead of from globalData cache
- Block instance annotations (relationships) are fetched directly
- These should use `useGlobal()` and `useRelationshipCrud()` if annotations are in globalData

**Required Investigation:**
1. Check if annotations are included in globalData cache
2. Check if annotation assignments are included in globalData relationships
3. If yes, update to use globalData cache
4. If no, determine if annotations should be added to globalData cache

**Priority:** Medium - Annotations are used in admin forms, but may not be critical for data consistency

---

### ⚠️ AnnotationsField.vue - **NEEDS REVIEW**

**File:** `client-vue/src/components/admin/generic/fields/AnnotationsField.vue`

**Cache Usage:**
- ⚠️ Uses direct `apiClient.get()` for annotations
- ⚠️ Uses direct `apiClient.get()` for block instance annotations
- ⚠️ Uses direct `apiClient.post()`, `apiClient.patch()`, `apiClient.delete()` for annotation CRUD

**Code Pattern:**
```typescript
const response = await apiClient.get(getAnnotationEndpoint())
const response = await apiClient.get(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value))
await apiClient.post(getAnnotationEndpoint(), data)
await apiClient.post(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value), payload)
await apiClient.patch(getAnnotationEndpoint() + `/${ann.id}`, data)
await apiClient.delete(getAnnotationEndpoint() + `/${ann.id}`)
```

**Problem:**
- Same as SelectInputs (formerly SelectFields) - annotations fetched directly instead of from globalData cache

**Required Investigation:**
- Same as SelectInputs (formerly SelectFields) - check if annotations should be in globalData cache

**Priority:** Medium - Annotations are used in admin forms, but may not be critical for data consistency

---

## Composables Audit Results

### ❌ useAppointment.ts - **NEEDS FIX**

**File:** `client-vue/src/composables/useAppointment.ts`

**Cache Usage:**
- ❌ Uses `useQuery` with `['appointments']` key (not `['globalData']`)
- ❌ Mutations invalidate `['appointments']` instead of `['globalData']`
- ❌ Direct `apiClient` calls bypass globalData cache

**Required Changes:**
1. Add appointments to globalData cache (update `fetchToGlobalTransformer`)
2. Update `fetchAll` to read from `useGlobal().getGlobalEntities('appointment')`
3. Update mutations to invalidate `['globalData']` instead of `['appointments']`
4. Or create wrapper using `useEntityCrud('appointment')` if appointments are added to globalData

**Priority:** High

---

### ❌ useProperty.ts - **NEEDS FIX**

**File:** `client-vue/src/composables/useProperty.ts`

**Cache Usage:**
- ❌ Uses `useQuery` with `['properties']` key (not `['globalData']`)
- ❌ Mutations invalidate `['properties']` instead of `['globalData']`
- ❌ Direct `apiClient` calls bypass globalData cache

**Required Changes:**
1. Add properties to globalData cache (update `fetchToGlobalTransformer`)
2. Update `fetchAll` to read from `useGlobal().getGlobalEntities('property')`
3. Update mutations to invalidate `['globalData']` instead of `['properties']`
4. Or create wrapper using `useEntityCrud('property')` if properties are added to globalData

**Priority:** High

---

### ❌ useUser.ts - **NEEDS FIX**

**File:** `client-vue/src/composables/useUser.ts`

**Cache Usage:**
- ❌ Uses `useQuery` with `['users']` key (not `['globalData']`)
- ❌ Mutations invalidate `['users']` instead of `['globalData']`
- ❌ Direct `apiClient` calls bypass globalData cache

**Required Changes:**
1. Add users to globalData cache (update `fetchToGlobalTransformer`)
2. Update `fetchAll` to read from `useGlobal().getGlobalEntities('user')`
3. Update mutations to invalidate `['globalData']` instead of `['users']`
4. Or create wrapper using `useEntityCrud('user')` if users are added to globalData

**Priority:** High

---

## Prioritized Fix List

### Priority 1: Critical Data Consistency (High Priority)

**Components:**
1. **AppointmentsTable.vue** - Uses separate cache for appointments
2. **PropertiesTable.vue** - Uses separate cache for properties
3. **UsersTable.vue** - Uses separate cache for users

**Composables:**
1. **useAppointment.ts** - Separate cache key `['appointments']`
2. **useProperty.ts** - Separate cache key `['properties']`
3. **useUser.ts** - Separate cache key `['users']`

**Fix Strategy:**
- Add appointments, properties, and users to globalData cache
- Update composables to read from globalData cache
- Update mutations to invalidate `['globalData']` instead of separate keys

**Estimated Effort:** Medium (requires updating transformer and composables)

---

### Priority 2: Annotation Components (Medium Priority)

**Components:**
1. **SelectInputs.vue** (formerly SelectFields.vue) - Direct API calls for annotations
2. **AnnotationsField.vue** - Direct API calls for annotations

**Fix Strategy:**
- Investigate if annotations should be in globalData cache
- If yes, add annotations to globalData cache and update components
- If no, document why annotations use direct API calls

**Estimated Effort:** Low (investigation) to Medium (if adding to cache)

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Components using globalData correctly | 2 | ✅ ProfilesTab, ShapesTab |
| Components bypassing globalData | 3 | ❌ AppointmentsTable, PropertiesTable, UsersTable |
| Components with acceptable direct API calls | 1 | ✅ BusinessControlsTab |
| Generic components needing review | 2 | ⚠️ SelectFields, AnnotationsField |
| Composables bypassing globalData | 3 | ❌ useAppointment, useProperty, useUser |

---

## Next Steps

**Session 1.4.3:** Fix Direct API Calls Bypassing GlobalData
- Fix Priority 1 components (AppointmentsTable, PropertiesTable, UsersTable)
- Fix Priority 1 composables (useAppointment, useProperty, useUser)
- Investigate Priority 2 components (SelectFields, AnnotationsField)

**Architecture Decision Needed:**
- Should appointments, properties, and users be added to globalData cache?
- Should annotations be added to globalData cache?
- Or should these use separate cache keys with proper invalidation?

---

**Audit Status:** ✅ Complete  
**Ready for:** Session 1.4.3 - Fix Direct API Calls Bypassing GlobalData  
**Last Updated:** 2026-01-07

## Executive Summary

Quick audit of booking wizard components to verify cache usage patterns. **Good news:** Booking wizard components correctly use globalData cache for reading data. **Issue:** Uses same problematic composables for mutations that bypass cache (same as admin panel).

**Key Findings:**
- ✅ **5 components** read from globalData cache correctly
- ✅ **2 composables** read from globalData cache correctly
- ❌ **1 component** uses composables that bypass cache for mutations (same issue as admin panel)

**Priority:** Same as admin panel - fix useAppointment, useProperty, useUser composables

---

## Component Audit Results

### ✅ ServiceSelectionStep.vue - **CORRECT**

**File:** `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and BlockInstances
- ✅ Uses `getGlobalEntityById()` to look up entities
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()`

**Code Pattern:**
```typescript
const { getGlobalEntityById, getGlobalData } = useGlobal()
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
// wizard uses useBooking() which uses useGlobal()
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ PropertyDetailsStep.vue - **CORRECT**

**File:** `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and BlockInstances
- ✅ Uses `getGlobalEntityById()` to look up entities
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()`

**Code Pattern:**
```typescript
const { getGlobalEntityById, getGlobalData } = useGlobal()
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ AvailabilityStep.vue - **CORRECT**

**File:** `client-vue/src/components/booking/steps/AvailabilityStep.vue`

**Cache Usage:**
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()`
- ✅ Uses `useAvailability()` composable (needs verification if it uses globalData or direct API)

**Code Pattern:**
```typescript
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
const { timeSlots, isLoading, error } = useAvailability(...)
```

**Note:** `useAvailability()` composable may use direct API calls for availability generation - needs verification, but likely acceptable since availability is computed/derived data, not entity data.

**Status:** ✅ **Likely correct** - Uses wizard state (which uses globalData), availability may use direct API (acceptable for computed data)

---

### ✅ ContactsStep.vue - **NO API CALLS**

**File:** `client-vue/src/components/booking/steps/ContactsStep.vue`

**Cache Usage:**
- ✅ No API calls - only form state management
- ✅ Reads from `loadedWizardState` (provided by BookingWizard parent)

**Status:** ✅ **No changes needed** - No API calls, only form state

---

### ✅ ConfirmationStep.vue - **NO API CALLS**

**File:** `client-vue/src/components/booking/steps/ConfirmationStep.vue`

**Cache Usage:**
- ✅ No API calls - static display component
- ✅ Hardcoded summary data (Phase 5 placeholder)

**Status:** ✅ **No changes needed** - No API calls, static display

---

### ⚠️ BookingWizard.vue - **MUTATIONS BYPASS CACHE**

**File:** `client-vue/src/components/booking/BookingWizard.vue`

**Cache Usage:**
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()` for reading
- ❌ Uses `useAppointment()`, `useProperty()`, `useUser()` for mutations (bypasses cache)

**Code Pattern:**
```typescript
const { create, fetchRandom } = useAppointment()
const { create: createProperty } = useProperty()
const { create: createUser } = useUser()
```

**Problem:**
- Same issue as admin panel - uses composables that bypass globalData cache
- Mutations invalidate separate cache keys instead of `['globalData']`
- `fetchRandom()` uses direct API call (acceptable for dev/testing)

**Required Changes:**
- Same as admin panel - fix `useAppointment()`, `useProperty()`, `useUser()` composables
- Update mutations to invalidate `['globalData']` instead of separate keys
- Or add appointments/properties/users to globalData cache

**Priority:** High - Same priority as admin panel fixes

---

## Composables Audit Results

### ✅ useBooking.ts - **CORRECT**

**File:** `client-vue/src/composables/useBooking.ts`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read from globalData cache
- ✅ Transforms globalData to bookingData format
- ✅ No direct API calls

**Code Pattern:**
```typescript
const { globalData } = useGlobal()
const bookingData = computed(() => {
  const data = globalData?.value
  if (!data) return null
  return bookingTransformer.transformGlobalToBooking(data)
})
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ useBookingWizard.ts - **CORRECT**

**File:** `client-vue/src/composables/useBookingWizard.ts`

**Cache Usage:**
- ✅ Uses `useBooking()` which uses `useGlobal()` to read from globalData cache
- ✅ No direct API calls
- ✅ Only manages wizard state (selections, cascading logic)

**Code Pattern:**
```typescript
const { bookingData } = useBooking()
// bookingData comes from useGlobal() via useBooking()
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Components using globalData correctly | 5 | ✅ ServiceSelectionStep, PropertyDetailsStep, AvailabilityStep, ContactsStep, ConfirmationStep |
| Components bypassing cache for mutations | 1 | ⚠️ BookingWizard (uses useAppointment/useProperty/useUser) |
| Composables using globalData correctly | 2 | ✅ useBooking, useBookingWizard |
| Composables bypassing cache | 0 | (Same composables as admin panel: useAppointment, useProperty, useUser) |

---

## Key Findings

### ✅ What's Working Well

1. **All step components** read from globalData cache correctly via `useGlobal()` or `useBookingWizard()` → `useBooking()` → `useGlobal()`
2. **useBooking composable** correctly uses `useGlobal()` to read from cache
3. **useBookingWizard composable** correctly uses `useBooking()` → `useGlobal()`
4. **No direct API calls** in step components for reading data

### ⚠️ Same Issue as Admin Panel

1. **BookingWizard.vue** uses `useAppointment()`, `useProperty()`, `useUser()` for mutations
2. These composables bypass globalData cache (same issue found in admin panel audit)
3. Mutations invalidate separate cache keys instead of `['globalData']`

---

## Recommendations

### Priority 1: Fix Mutations (Same as Admin Panel)

**Components:**
- BookingWizard.vue - Uses useAppointment, useProperty, useUser for mutations

**Composables:**
- useAppointment.ts - Update to invalidate `['globalData']` instead of `['appointments']`
- useProperty.ts - Update to invalidate `['globalData']` instead of `['properties']`
- useUser.ts - Update to invalidate `['globalData']` instead of `['users']`

**Fix Strategy:**
- Same as admin panel - add appointments, properties, and users to globalData cache
- Update composables to read from globalData cache
- Update mutations to invalidate `['globalData']` instead of separate keys

**Estimated Effort:** Medium (same fix as admin panel)

---

## Conclusion

**Booking wizard is in good shape!** All components correctly read from globalData cache. The only issue is the same one found in the admin panel - mutations use composables that bypass the cache.

**Action Items:**
- Fix useAppointment, useProperty, useUser composables (same fix as admin panel)
- This will fix both admin panel and booking wizard mutations

**No separate booking wizard fixes needed** - fixing the composables will fix both areas.

---

**Audit Status:** ✅ Complete  
**Priority:** Same as admin panel (High)  
**Last Updated:** 2026-01-07

