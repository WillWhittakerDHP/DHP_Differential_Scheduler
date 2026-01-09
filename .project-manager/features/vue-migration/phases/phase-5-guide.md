# Phase 5 Guide: React Cleanup and Removal

**Purpose:** Phase-level guide for planning and tracking React codebase removal

**Tier:** Phase (Tier 2 - High-Level)

---

## Phase Overview

**Phase Number:** 5  
**Phase Name:** React Cleanup and Removal  
**Description:** Remove React-related code, commands, and references after Vue migration is complete and verified in production. This is the final cleanup phase that removes all React dependencies and updates documentation.

**Duration:** Estimated 1-2 sessions  
**Status:** ✅ Ready to Start (All prerequisites verified: Phases 1-4 complete, production verification, team approval)

---

## Phase Objectives

- Remove React codebase (`client/` directory)
- Remove React support from slash commands
- Update documentation to remove React references
- Update workspace rules for Vue-only development
- Update build configuration and CI/CD for Vue-only
- Archive React codebase for historical reference
- Fork data flow for admin vs scheduler contexts
- Update routing to make booking wizard the landing page

---

## Prerequisites

**✅ All prerequisites verified and met:**

- ✅ All features ported to Vue (Phases 1-4 complete)
- ✅ All tests passing in Vue app (verified manually)
- ✅ Production deployment successful (verified manually)
- ✅ No dependencies on React codebase (verified manually)
- ✅ Migration verified stable for at least 2-4 weeks (verified manually)
- ✅ Team approval for React removal (verified manually)

---

## Key Deliverables

- React codebase archived (git tag or branch)
- React support removed from slash commands (`/lint`, `/test`, `/verify`)
- Documentation updated to remove React references
- React codebase and dependencies removed (`client/` directory)
- Build configuration and CI/CD updated for Vue-only
- Workspace rules updated to focus on Vue-only development
- Root `package.json` cleaned of React scripts
- Data flow forked: admin data only on admin page, scheduler data only on scheduler page
- Landing page updated to "/" (booking wizard)

---

## Key Activities

- **Archive React Codebase:** Create git tag or branch before deletion
- **Remove Slash Command Support:** Update commands to remove React targets
- **Update Documentation:** Remove React references from active docs (keep historical logs)
- **Remove React Codebase:** Delete `client/` directory
- **Update Build Config:** Remove React scripts from root `package.json`
- **Update Workspace Rules:** Remove React-related rules, add Vue-only rule
- **Update CI/CD:** Remove React build steps and tests
- **Fork Data Flow:** Separate admin and scheduler data contexts
- **Update Routing:** Make booking wizard the landing page

---

## Sessions Breakdown

- [ ] ### Session 5.1: Archive and Prepare
**Description:** Archive React codebase and verify prerequisites
**Tasks:**
- Create git tag or branch for React codebase archive
- Verify all prerequisites are met
- Document current state before removal
- Create backup checklist

**Files:**
- Git operations (tag/branch creation)
- Documentation updates

- [ ] ### Session 5.2: Remove React Codebase and Update Configuration
**Description:** Remove React codebase and update all configuration files
**Tasks:**
- Remove `client/` directory
- Remove React scripts from root `package.json`
- Update CI/CD configuration files
- Update deployment documentation
- Update workspace rules
- Remove React from slash commands

**Files (Naming Standardization):**
- `client-vue/src/composables/useBooking.ts` - Review/rename if needed
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Review/rename if needed
- `client-vue/src/types/` - Review/update scheduler data types if renamed
- All files with scheduler/booking references
- Documentation files

**Files (Data Flow Forking):**
- `client-vue/src/composables/useAdmin.ts` (MODIFY)
- `client-vue/src/composables/useBooking.ts` (MODIFY - or renamed version)
- `client-vue/src/router/index.ts` (MODIFY)
- `client-vue/src/views/booking/BookingWizardView.vue` (VERIFY)
- `client-vue/src/views/admin/AdminPanel.vue` (VERIFY)

- [ ] ### Session 5.3: Documentation Cleanup
**Description:** Update all documentation to remove React references
**Tasks:**
- Remove React comparison sections from active docs (keep historical logs)
- Update migration handoff documents
- Update command documentation
- Update README files
- Preserve historical session logs for reference

**Files:**
- `VUE_MIGRATION_SESSION_GUIDE.md` (MODIFY - remove React comparisons, keep logs)
- `VUE_MIGRATION_HANDOFF.md` (MODIFY - remove React references from active sections)
- `.cursor/commands/README.md` (MODIFY)
- `.cursor/commands/USAGE.md` (MODIFY)
- Root `README.md` (MODIFY)

- [ ] ### Session 5.4: Fork Data Flow and Update Routing
**Description:** Separate admin and scheduler data contexts and update landing page
**Tasks:**

**Standardize Naming: Schedule/Booking/Scheduler/Booker:**
- Review and standardize all naming inconsistencies between "scheduler"/"booking"/"scheduling"/"booking"
- **Decision Point:** Determine if data layer should use "scheduler" (domain name) vs "booking" (user-facing term)
- **Recommendation:** Keep "scheduler" for data layer (BookingData, SchedulerBlockProfile, useBooking, globalToBookingTransformer) as it's the domain/system name. Use "booking" for user-facing components (BookingWizard, BookingWizardView, useBookingWizard).
- **Grep and Replace Tasks:**
  - Search for all instances of "scheduler wizard" → replace with "booking wizard" (user-facing)
  - Search for all instances of "scheduling wizard" → replace with "booking wizard"
  - Review data layer naming (BookingData, SchedulerBlockProfile, useBooking, globalToBookingTransformer) - decide if these should be renamed to BookingData, BookingBlockProfile, useBookingComp, globalToBookingTransformer
  - If renaming data layer: Update all imports, type references, and transformer names
  - Update documentation to reflect naming decisions
  - Ensure consistency: "scheduler" for system/domain, "booking" for user-facing wizard
- **Files to Review:**
  - `client-vue/src/composables/useBooking.ts` - Consider renaming to `useBookingComp.ts`?
  - `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Consider renaming to `globalToBookingTransformer.ts`?
  - `client-vue/src/types/` - Review BookingData, SchedulerBlockProfile, SchedulerPartProfile types
  - All component files referencing scheduler/booking terminology
  - All documentation files

- **Fork Admin Data Flow:**
  - Ensure `useAdmin` only loads/calculates admin data when on admin page
  - Create admin-specific data context/provider that only initializes on `/admin` route
  - Admin data should not be fetched/calculated on scheduler pages
  - Admin transformer should only run when admin page is active
  
- **Fork Scheduler Data Flow:**
  - Ensure `useBooking` only loads/calculates scheduler data when on scheduler page
  - Create scheduler-specific data context/provider that only initializes on `/booking` route
  - Scheduler data should not be fetched/calculated on admin pages
  - Scheduler transformer should only run when scheduler page is active
  
- **Update Routing:**
  - Change landing page route from current route to `/` (booking wizard)
  - Update router configuration to set `/` as the default route pointing to BookingWizardView
  - Ensure admin routes remain accessible at `/admin`
  - Test routing and ensure data contexts initialize correctly based on route

**Files (Naming Standardization):**
- `client-vue/src/composables/useBooking.ts` - Review naming, consider renaming to `useBookingComp.ts` if data layer renamed
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Review naming, consider renaming to `globalToBookingTransformer.ts` if data layer renamed
- `client-vue/src/types/` - Review and update BookingData, SchedulerBlockProfile, SchedulerPartProfile types if renamed
- All files importing/using scheduler data types and transformers
- Documentation files with scheduler/booking references

**Files (Data Flow Forking):**
- `client-vue/src/composables/useAdmin.ts` (MODIFY - add route-based initialization)
- `client-vue/src/composables/useBooking.ts` (MODIFY - add route-based initialization, or renamed version)
- `client-vue/src/router/index.ts` (MODIFY - update default route to `/`)
- `client-vue/src/views/booking/BookingWizardView.vue` (VERIFY - ensure it's the landing page)
- `client-vue/src/views/admin/AdminPanel.vue` (VERIFY - ensure admin data only loads here)
- Create admin data provider/context if needed
- Create scheduler/booking data provider/context if needed

**Key Considerations:**
- **Performance:** Only load/calculate data needed for current page
- **Memory:** Avoid loading unnecessary data in memory
- **Initialization:** Data contexts should initialize based on route, not globally
- **Lazy Loading:** Consider lazy loading data contexts when routes are accessed
- **Error Handling:** Handle cases where data is accessed outside its context

---

## Dependencies

**Prerequisites:**
- ✅ Phase 1 complete (data layer, transformers)
- ✅ Phase 2 complete (state management)
- ✅ Phase 3 complete (data flow foundation verified)
- ✅ Phase 4 complete (Vuexy admin integration)
- ✅ Production deployment successful
- ✅ Migration stable for 2-4 weeks

**Downstream Impact:**
- Finalizes Vue migration
- Removes React codebase permanently
- Updates all documentation to Vue-only
- Simplifies development workflow
- Optimizes data loading (only load what's needed)
- Improves performance (no unnecessary data calculations)

---

## Success Criteria

- [ ] React codebase archived (git tag or branch)
- [ ] All prerequisites verified and documented
- [ ] `client/` directory removed
- [ ] React scripts removed from root `package.json`
- [ ] Slash commands updated (no React target)
- [ ] Documentation updated (React references removed from active docs)
- [ ] Workspace rules updated (Vue-only development)
- [ ] CI/CD updated (no React build steps)
- [ ] Historical logs preserved for reference
- [ ] Team notified of React removal
- [ ] Admin data only loads/calculates on admin page (`/admin`)
- [ ] Naming standardized (scheduler vs booking terminology decided and implemented)
- [ ] Scheduler/Booking data only loads/calculates on booking wizard page (`/booking` or `/`)
- [ ] Landing page is `/` (booking wizard)
- [ ] Admin routes remain accessible at `/admin`
- [ ] Data contexts initialize correctly based on route
- [ ] No unnecessary data loading or calculations

---

## Notes

**⚠️ CRITICAL WARNINGS:**

1. **Irreversible Action:** Removing React codebase is permanent. Ensure all prerequisites are met.
2. **Archive First:** Always create git tag or branch before deletion.
3. **Production Verification:** Only proceed after production deployment is stable.
4. **Team Approval:** Get team approval before removing React codebase.
5. **Historical Preservation:** Keep migration logs and session logs for reference.

**Key Principles:**
- **Archive Before Delete:** Always create git tag/branch before removing codebase
- **Preserve History:** Keep migration logs and session logs for historical reference
- **Verify Prerequisites:** Double-check all prerequisites before starting
- **Team Communication:** Notify team before and after React removal
- **Rollback Plan:** Ensure Vue app is fully functional before removal
- **Performance Optimization:** Only load data needed for current page
- **Route-Based Initialization:** Data contexts should initialize based on route

**Archival Strategy:**
- Create git tag: `react-codebase-archive-YYYY-MM-DD`
- Or create branch: `archive/react-codebase-YYYY-MM-DD`
- Document archive location in migration logs

**Documentation Strategy:**
- Remove React references from active/current documentation
- Keep historical session logs and migration logs intact
- Mark historical logs as "archived" or "historical reference only"
- Update active documentation to focus on Vue-only development

**Workspace Rules Update:**
- Remove React-related workspace rules
- Add Vue-only development rule
- Update deprecation rule or remove it entirely

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

- Phase Handoff: `project-manager/features/vue-migration/phases/phase-5-handoff.md`
- Session Guides: `project-manager/features/vue-migration/sessions/session-5.[X]-guide.md`
- Archived Plan: `project-manager/archive/project-plan.md.old` (Phase 0.6 reference)
- Migration Logs: Historical session logs preserved for reference

