# Phase 5 Session 5.4 Guide: Fork Data Flow and Update Routing

**Feature:** Vue Migration  
**Purpose:** Session-level guide for separating admin and scheduler data contexts and updating landing page to booking wizard

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 5 - React Cleanup and Removal
**Session:** 5.4 - Fork Data Flow and Update Routing
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 5.4
**Session Name:** Fork Data Flow and Update Routing
**Description:** Separate admin and scheduler data contexts so each only loads/calculates data when needed, and update landing page to booking wizard. Standardize naming between scheduler/booking terminology.

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 5.3 complete (documentation cleanup)

---

## Session Objectives

- Standardize naming: scheduler vs booking terminology
- Fork admin data flow (only loads on admin page)
- Fork scheduler data flow (only loads on scheduler page)
- Update routing (make booking wizard the landing page)
- Ensure data contexts initialize correctly based on route

---

## Key Deliverables

- Naming standardized (scheduler vs booking terminology)
- Admin data only loads on admin page (`/admin`)
- Scheduler/Booking data only loads on booking wizard page (`/booking` or `/`)
- Landing page is `/` (booking wizard)
- Admin routes remain accessible at `/admin`
- Data contexts initialize correctly based on route
- No unnecessary data loading or calculations

---

## Detailed Task Breakdown

### Task 5.4.1: Standardize Naming - Scheduler vs Booking

**Purpose:** Review and standardize naming inconsistencies between "scheduler"/"booking"/"scheduling"

**Decision Point:** Determine if data layer should use "scheduler" (domain name) vs "booking" (user-facing term)

**Recommendation:** Keep "scheduler" for data layer (BookingData, SchedulerBlockProfile, useBooking, globalToBookingTransformer) as it's the domain/system name. Use "booking" for user-facing components (BookingWizard, BookingWizardView, useBookingWizard).

**Steps:**

1. **Grep and Replace Tasks:**
   - Search for all instances of "scheduler wizard" → replace with "booking wizard" (user-facing)
   - Search for all instances of "scheduling wizard" → replace with "booking wizard"
   - Review data layer naming (BookingData, SchedulerBlockProfile, useBooking, globalToBookingTransformer)
   - Decide if these should be renamed to BookingData, BookingBlockProfile, useBookingComp, globalToBookingTransformer
   - If renaming data layer: Update all imports, type references, and transformer names
   - Update documentation to reflect naming decisions
   - Ensure consistency: "scheduler" for system/domain, "booking" for user-facing wizard

2. **Files to Review:**
   - `client-vue/src/composables/useBooking.ts` - Consider renaming to `useBookingComp.ts`?
   - `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Consider renaming to `globalToBookingTransformer.ts`?
   - `client-vue/src/types/` - Review BookingData, SchedulerBlockProfile, SchedulerPartProfile types
   - All component files referencing scheduler/booking terminology
   - All documentation files

**Deliverables:**
- Naming standardized: Clear decision on scheduler vs booking terminology
- All "scheduler wizard" references updated to "booking wizard" (user-facing)
- Data layer naming decision made and implemented (if renaming)
- All imports and type references updated (if data layer renamed)
- Documentation updated with naming decisions

---

### Task 5.4.2: Fork Admin Data Flow

**Purpose:** Ensure admin data only loads/calculates when on admin page

**Files to Modify:**
- `client-vue/src/composables/useAdmin.ts` - Add route-based initialization check
- `client-vue/src/views/admin/AdminPanel.vue` - Verify admin data only loads here

**Steps:**

1. **Update useAdmin.ts:**
   - Add route check: Only initialize admin data when on `/admin` route
   - Use Vue Router's `useRoute()` to check current route
   - Return early or skip initialization if not on admin route
   - Ensure admin transformer only runs when admin page is active

2. **Update AdminPanel.vue:**
   - Verify `useAdmin` is only called in AdminPanel component
   - Ensure admin data context initializes on component mount
   - Add route guard if needed to ensure admin data only loads here

3. **Create Admin Data Provider (if needed):**
   - Create admin-specific data context/provider that only initializes on `/admin` route
   - Use route guards or route component lifecycle to initialize admin data context

**Key Considerations:**
- Admin data should not be fetched/calculated on scheduler pages
- Admin transformer should only run when admin page is active
- Use route guards or route component lifecycle to initialize admin data context

**Deliverables:**
- Admin data only loads on admin page (`/admin`)
- Admin data context isolated from scheduler pages

---

### Task 5.4.3: Fork Scheduler Data Flow

**Purpose:** Ensure scheduler data only loads/calculates when on scheduler page

**Files to Modify:**
- `client-vue/src/composables/useBooking.ts` (or `useBookingComp.ts` if renamed) - Add route-based initialization check
- `client-vue/src/views/booking/BookingWizardView.vue` - Verify scheduler data only loads here

**Steps:**

1. **Update useBooking.ts (or useBookingComp.ts):**
   - Add route check: Only initialize scheduler data when on `/booking` or `/` route
   - Use Vue Router's `useRoute()` to check current route
   - Return early or skip initialization if not on scheduler route
   - Ensure scheduler transformer only runs when scheduler page is active

2. **Update BookingWizardView.vue:**
   - Verify `useBooking` is only called in BookingWizardView component
   - Ensure scheduler data context initializes on component mount
   - Add route guard if needed to ensure scheduler data only loads here

3. **Create Scheduler Data Provider (if needed):**
   - Create scheduler-specific data context/provider that only initializes on scheduler routes
   - Use route guards or route component lifecycle to initialize scheduler data context

**Key Considerations:**
- Scheduler data should not be fetched/calculated on admin pages
- Scheduler transformer should only run when scheduler page is active
- Use route guards or route component lifecycle to initialize scheduler data context

**Deliverables:**
- Scheduler/Booking data only loads on booking wizard page (`/booking` or `/`)
- Scheduler data context isolated from admin pages

---

### Task 5.4.4: Update Routing

**Purpose:** Make booking wizard the landing page and ensure proper route configuration

**File:** `client-vue/src/router/index.ts`

**Steps:**

1. **Update Default Route:**
   - Change landing page route from current route to `/` (booking wizard)
   - Update router configuration to set `/` as the default route pointing to BookingWizardView
   - Ensure admin routes remain accessible at `/admin`

2. **Add Route Guards (if needed):**
   - Add route guards to initialize appropriate data contexts
   - Use Vue Router navigation guards to initialize data contexts
   - Ensure data contexts initialize correctly based on route

3. **Test Routing:**
   - Test routing and ensure data contexts initialize correctly based on route
   - Verify no unnecessary data loading when navigating between pages
   - Test that admin routes still work
   - Test that booking wizard is accessible at `/`

**Key Considerations:**
- Default route should point to BookingWizardView (booking wizard)
- Admin route should remain at `/admin`
- Route guards should initialize appropriate data contexts
- Consider lazy loading route components for better performance

**Deliverables:**
- Landing page is `/` (booking wizard)
- Admin routes remain accessible at `/admin`
- Data contexts initialize correctly based on route
- No unnecessary data loading or calculations

---

## Success Criteria

- [x] Naming standardized: Clear decision on scheduler vs booking terminology (verified - already consistent)
- [x] All "scheduler wizard" references updated to "booking wizard" (user-facing) (verified - code already uses "booking wizard")
- [x] Data layer naming decision made and implemented (kept "scheduler" for data layer)
- [x] All imports and type references updated (no renaming needed)
- [x] Documentation updated with naming decisions
- [x] Admin data only loads on admin page
- [x] Scheduler/Booking data only loads on booking wizard page
- [x] Landing page is `/` (booking wizard)
- [x] Admin routes remain accessible at `/admin`
- [x] Data contexts initialize correctly based on route
- [x] No unnecessary data loading or calculations
- [x] All changes tested and verified
- [x] Ready to complete Phase 5

---

## Important Notes

**⚠️ CRITICAL CONSIDERATIONS:**

1. **Performance:** Only load/calculate data needed for current page
2. **Memory:** Avoid loading unnecessary data in memory
3. **Initialization:** Data contexts should initialize based on route, not globally
4. **Lazy Loading:** Consider lazy loading data contexts when routes are accessed
5. **Error Handling:** Handle cases where data is accessed outside its context
6. **Route Guards:** Use Vue Router navigation guards to initialize data contexts
7. **Component Lifecycle:** Use component lifecycle hooks (onMounted) to initialize data

**Data Flow Forking Strategy:**
- **Route-Based Loading:** Use Vue Router navigation guards or route components to initialize data contexts
- **Lazy Initialization:** Only initialize data contexts when routes are accessed
- **Context Isolation:** Ensure admin and scheduler data contexts are completely separate
- **Performance:** Avoid loading both admin and scheduler data simultaneously
- **Memory Management:** Clean up data contexts when navigating away from pages

**Routing Strategy:**
- **Default Route:** Set `/` to point to BookingWizardView (booking wizard)
- **Admin Route:** Keep `/admin` for admin panel
- **Route Guards:** Use route guards to initialize appropriate data contexts
- **Lazy Loading:** Consider lazy loading route components for better performance

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-5-guide.md`
- Phase Handoff: `project-manager/features/vue-migration/phases/phase-5-handoff.md`
- Previous Session: `project-manager/features/vue-migration/sessions/session-5.3-guide-phase5.md`

---

## Next Steps

After completing this session:
1. Verify all deliverables are complete
2. Test data flow forking (admin vs scheduler)
3. Test routing and data context initialization
4. Run `/phase-end 5` to complete Phase 5

