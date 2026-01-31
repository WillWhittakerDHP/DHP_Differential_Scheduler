# DHP Differential Scheduler - Project Plan

**Purpose:** Single source of truth for Vue migration project planning

**Last Updated:** 2025-02-01
**Status:** Active Planning Document

---

## Overview

This document serves as the master project plan for the Vue.js migration. All phase guides, todos, and planning documents should align with this plan.

**Structure:** Feature → Phase → Session → Task

---

## Feature 0: Vue.js Migration

**Status:** ✅ Core Complete
**Description:** Migrate entire application from React to Vue.js with full feature parity, improved type safety, and modern Vue 3 patterns

### Completion Summary

**Structural Migration Complete:** The Vue.js migration has achieved structural completion. All major systems are in place and functional:

- ✅ **Phases 1-6 Complete**: Data layer, state management, data flow foundation, admin panel structure, documentation cleanup, and booking wizard structure all complete
- ✅ **Phase 9 Mostly Complete**: Comprehensive naming refactoring (Type→Shape, Profile→Instance, Type→Kind) complete with database schema updates, model updates, API layer updates, transformer refactoring, and UI component updates
- ✅ **Core Infrastructure**: Admin panel structure, booking wizard structure, data layer, state management, annotation system, component system, and data flow foundation all established

**Remaining Work:** Remaining work is feature development, not migration work:
- Data flow fixes and polish (moved to Feature 1: Data Flow Alignment)
- UI polish and interactions (moved to Feature 2: UI Polish)
- Booking calculations (moved to Feature 3: Booking Calculations)
- Calendar and appointment availability (moved to Feature 4: Calendar & Appointment Availability)
- Google APIs integration (moved to Feature 5: Google APIs Integration)

**Note:** Phase 7 work was largely completed in Phase 6 sessions (15 sessions completed). Phase 8 deferred to UI Polish feature. Phase 10 cancelled (user preference). Phase 11 (Bulk Updates) moved to UI Polish as small enhancement.

### Phase 1: Data Layer Foundation ✅ COMPLETE

**Status:** Complete
**Description:** Port type definitions, constants, API clients, and transformers

**Sessions:**
- Session 1.1: Type Definitions
- Session 1.2: Constants and Configuration
- Session 1.3: API Clients
- Session 1.4: Transformers

**Success Criteria:**
- ✅ All types compile without errors
- ✅ API clients working with Vue Query
- ✅ Transformers ported and tested

### Phase 2: State Management ✅ COMPLETE

**Status:** Complete
**Description:** Implement Pinia stores, Vue Query integration, composables layer

**Sessions:**
- Session 2.1: Vue Query Setup
- Session 2.2: Pinia Stores
- Session 2.3: Composables Layer

**Success Criteria:**
- ✅ Pinia stores implemented
- ✅ Composables layer established
- ✅ Clear naming pattern (useXComp vs useXStore)

### Phase 3: Data Flow Foundation ✅ COMPLETE

**Status:** Complete
**Description:** Establish complete data flow in Vue app ready for Vuexy overlay. Focus on verifying API integration, state management, routing, and placeholder pages (no UI polish).

**Sessions:**
- Session 3.1: API Integration Verification
- Session 3.2: State Management Verification
- Session 3.3: Routing & Placeholder Pages
- Session 3.4: Data Flow Testing & Validation

**Phase Objectives:**
- Verify all API endpoints working (CRUD operations for all entities)
- Ensure state management complete (Pinia stores, Vue Query)
- Create minimal routing structure
- Build placeholder pages that demonstrate data flow (no UI polish)
- Verify data transformations working correctly
- Ensure all composables functional

**Key Deliverables:**
- All API calls working and tested
- State management layer complete and verified
- Basic routing structure in place
- Placeholder pages showing data flow (list views, basic forms)
- Data transformations verified and working
- Ready for Vuexy overlay in Phase 4

**Session Breakdown:**

**Session 3.1: API Integration Verification**
- Task 3.1.1: Verify BlockType CRUD operations
- Task 3.1.2: Verify BlockProfile CRUD operations
- Task 3.1.3: Verify PartType CRUD operations
- Task 3.1.4: Verify PartProfile CRUD operations
- Task 3.1.5: Verify relationship CRUD operations (validBlocks, validParts, activeBlocks, activeParts)
- Task 3.1.6: Verify error handling and edge cases

**Session 3.2: State Management Verification**
- Task 3.2.1: Verify Pinia stores functional
- Task 3.2.2: Verify Vue Query caching
- Task 3.2.3: Verify composables working correctly
- Task 3.2.4: Test reactive state updates

**Session 3.3: Routing & Placeholder Pages**
- Task 3.3.1: Set up basic routing structure
- Task 3.3.2: Create placeholder list pages (no UI polish)
- Task 3.3.3: Create placeholder form pages (no UI polish)
- Task 3.3.4: Verify data displays correctly on pages

**Session 3.4: Data Flow Testing & Validation**
- Task 3.4.1: Test complete data flow (API → State → Components)
- Task 3.4.2: Verify data transformations working
- Task 3.4.3: Test all composables functional
- Task 3.4.4: Validate ready for Phase 4 (Vuexy integration)

**Success Criteria:**
- All API endpoints verified and working
- State management layer complete and tested
- Routing structure in place
- Placeholder pages demonstrate data flow
- Data transformations verified
- All composables functional
- Ready for Vuexy overlay in Phase 4

**Dependencies:**
- Phase 1 complete (data layer)
- Phase 2 complete (state management)

**Note:** Property keys are now derived from `GlobalEntity` type (API-driven), not hard-coded. The `GlobalPropertyKey<GE>` type is defined as `keyof GlobalEntity<GE>`, making property keys automatically available from the API response types.

### Phase 4: Vuexy Admin Panel Integration ✅ COMPLETE

**Status:** Complete
**Description:** Build unified tabbed admin interface with Profiles tab (BlockProfile with nested PartProfiles grouped by BlockType) and Types tab (BlockType and PartType configuration). Integrate data layer and create CRUD interfaces using Vuexy components.

**⚠️ NOTE: Phase 4 has been REVISED. Old Session 4.1 (Vuexy Template Setup) was completed separately. New Session 4.1 focuses on building the admin UI.**

**Sessions:**
- Session 4.1: Main Admin Panel Structure (REVISED - create AdminPanel.vue with tabs, NOT legacy removal)
- Session 4.2: Profiles Tab Implementation
- Session 4.3: Types Tab Implementation
- Session 4.4: Form Dialogs and CRUD Operations

**Phase Objectives:**
- Build unified admin interface with tabbed navigation (Profiles | Types)
- Create Profiles tab with BlockProfile management grouped by BlockType
- Display nested PartProfiles within each BlockProfile using activeParts relationship
- Create Types tab with BlockType and PartType configuration
- Integrate existing data layer (composables, API clients) into Vuexy components
- Build CRUD interfaces using Vuexy form components and dialogs
- Apply Vuexy styling and layout patterns throughout

**Key Deliverables:**
- Main AdminPanel.vue component with VTabs navigation
- ProfilesTab.vue with BlockProfile grouping and nested PartProfiles
- TypesTab.vue with BlockType and PartType sections
- Form dialogs for all entity types using Vuexy components
- Full CRUD operations working with Vuexy UI
- Single /admin route replacing separate entity routes

**Success Criteria:**
- Single /admin route with tabbed interface functional
- Profiles tab shows BlockProfiles grouped by BlockType
- Each BlockProfile displays nested PartProfiles correctly
- Types tab shows BlockType and PartType configuration
- Full CRUD operations working for all entities
- Uses Vuexy components and styling throughout
- Data loads from existing composables correctly
- Relationships managed via useRelationshipCrud
- Ready for Phase 5 (Scheduler Wizard)

**Dependencies:**
- Phase 3 complete (verified data flow)
- Vuexy already integrated (from plugin setup)

### Phase 5: Documentation Cleanup and Data Flow Optimization ✅ COMPLETE

**Status:** Complete
**Description:** Clean up documentation and optimize data flow architecture. This phase focuses on updating documentation to reflect Vue-only development and forking data flow for admin vs scheduler contexts to improve performance. Also includes updating routing to set booking wizard as the landing page.

**Sessions:**
- Session 5.1: Archive and Prepare
- Session 5.2: Remove React Codebase and Update Configuration
- Session 5.3: Documentation Cleanup
- Session 5.4: Fork Data Flow and Update Routing

**Phase Objectives:**
- Archive legacy React codebase
- Remove React codebase and update configuration
- Update documentation to reflect Vue-only development
- Fork admin and scheduler data flows for performance
- Update landing page to booking wizard

**Key Deliverables:**
- React codebase archived (git tag `react-codebase-archive-2025-11-26`)
- Legacy codebase removed
- Documentation updated (Vue-only)
- Admin data only loads on `/admin` route
- Scheduler data only loads on `/` and `/booking` routes
- Landing page is booking wizard

**Success Criteria:**
- ✅ Legacy codebase archived
- ✅ All prerequisites verified and documented
- ✅ `client/` directory removed
- ✅ Legacy scripts removed from root `package.json`
- ✅ Documentation updated (legacy references removed)
- ✅ Workspace rules updated (Vue-only development)
- ✅ Admin data only loads/calculates on admin page (`/admin`)
- ✅ Scheduler data only loads/calculates on scheduler page (`/booking` or `/`)
- ✅ Landing page is `/` (booking wizard)

**Dependencies:**
- Phase 4 complete (Vuexy admin integration)

### Phase 6: Booking Wizard Logic Integration ✅ COMPLETE

**Status:** Complete
**Description:** Connect the static UI shell to real data and integrate scheduler logic. Replace hardcoded data with real backend data, add state management, integrate cascading selections, user-specific descriptions, icon display, annotation system, component system, and data flow unification.

**Sessions:**
- Session 6.1: Booking Wizard State Management ✅ Complete
- Session 6.2: Cascading Selection Logic ✅ Complete
- Session 6.3: Icon Integration ✅ Complete
- Session 6.4: User-Specific Descriptions - Database Schema & Models ✅ Complete
- Session 6.5: User-Specific Descriptions - API Types & Transformers ✅ Complete
- Session 6.6: User-Specific Descriptions - Admin Portal ✅ Complete
- Session 6.7: User-Specific Descriptions - Wizard Display ✅ Complete
- Session 6.8: Page Layout & Responsive Design ✅ Complete
- Session 6.9: Availability Options Integration ✅ Complete
- Session 6.10: Entity Composition System ✅ Complete (replaced by Component System)
- Session 6.11: Align Component Management ✅ Complete
- Session 6.12: Refactor Annotations ✅ Complete
- Session 6.13: User Types Migration and Relationship Router Enhancement ✅ Complete
- Session 6.14: Data Flow Unification and Field Config Updates ✅ Complete
- Session 6.15: UI Updates, Migration Fixes, and Admin Config Updates ✅ Complete

**Phase Objectives:**
- Create composable for booking wizard state management
- Implement cascading selection system (User Type → Base Service → Availability Options)
- Connect to real backend data
- Integrate scheduler transformers and utilities
- Implement annotation system (replaced descriptions)
- Implement component system (replaced composition)
- Display icons from database with admin portal editing
- Display user-specific annotations based on selected user type
- Ensure responsive layout and proper element arrangement
- Unify data flow through globalData cache

**Key Deliverables:**
- useBookingWizard composable with proper state management
- Cascading selection logic working (user → base service → availability)
- Icon integration from database with admin portal editing
- Annotation system with shape-instance pattern
- Component system with unified relationship pattern
- User-specific annotation display in wizard
- Real data connections for all wizard steps
- Responsive layout and proper element arrangement
- Unified data flow through globalData cache

**Success Criteria:**
- ✅ Booking wizard state management working
- ✅ Cascading selections work correctly (each selection filters next level)
- ✅ Icons display correctly from database
- ✅ Icons are editable in admin portal
- ✅ Annotations change based on selected user type
- ✅ User-specific annotations are editable in admin portal
- ✅ Page layout is responsive and properly arranged
- ✅ Elements show/hide appropriately based on selections
- ✅ All hardcoded data replaced with real data
- ✅ All wizard steps functional with real data
- ✅ Data flow unified through globalData cache

**Dependencies:**
- Phase 5 complete (Documentation cleanup and data flow optimization)

### Phase 7: Booking Wizard Logic Integration

**Status:** ✅ Archived (Work Completed in Phase 6)
**Description:** ~~Connect the static UI shell to real data and integrate scheduler logic from React codebase.~~ **Note:** This work was largely completed in Phase 6 sessions. Remaining work (booking calculations, calendar integration) moved to new features.

**Sessions:**
- Session 7.1: Booking Wizard State Management
- Session 7.2: Cascading Selection Logic
- Session 7.3: Icon Integration
- Session 7.4: User-Specific Descriptions - Database Schema & Models
- Session 7.5: User-Specific Descriptions - API Types & Transformers
- Session 7.6: User-Specific Descriptions - Admin Portal
- Session 7.7: User-Specific Descriptions - Wizard Display
- Session 7.8: Page Layout & Responsive Design
- Session 7.9: Availability Options Integration
- Session 7.10: Entity Pooling System

**Phase Objectives:**
- Create composable for booking wizard state management
- Implement cascading selection system (User Type → Base Service → Additional Services → Availability Options)
- Connect to React scheduler logic
- Replace hardcoded data with real backend data
- Integrate scheduler transformers and utilities
- Implement shared/reusable Description entity with through-table pattern
- Display icons from database with admin portal editing
- Display user-specific descriptions based on selected user type
- Ensure responsive layout and proper element arrangement
- Add form validation and error handling

**Key Deliverables:**
- useBookingWizard composable with proper state management
- Cascading selection logic working (user → base service → additional services → availability)
- Icon integration from database with admin portal editing
- Description entity and BlockProfileDescription through-table for shared descriptions
- Description CRUD in admin portal with relationship management
- User-specific description display in wizard
- Real data connections for all wizard steps
- Responsive layout and proper element arrangement
- Form validation and error handling
- API integration for service types, property types, availability

**Success Criteria:**
- Booking wizard state management working
- Cascading selections work correctly (each selection filters next level)
- Icons display correctly from database
- Icons are editable in admin portal
- Descriptions change based on selected user type
- User-specific descriptions are editable in admin portal (shared/reusable)
- Page layout is responsive and properly arranged
- Elements show/hide appropriately based on selections
- All hardcoded data replaced with real data
- Scheduler logic integrated from React codebase
- All wizard steps functional with real data
- Form validation working
- API connections established
- All selections persist in wizard state
- Entity pooling system functional with computed masters

**Dependencies:**
- Phase 6 complete (Booking Wizard UI Shell)

### Phase 8: UI Component Updates and Polish

**Status:** ✅ Deferred (Moved to Feature 2: UI Polish)
**Description:** ~~Update and polish UI components across the application~~ **Note:** This work has been moved to Feature 2: UI Polish as part of the post-migration feature development.

**Sessions:**
- Session 8.1: Service Selection Component Updates
- Session 8.2: Entity Card Component Updates
- Session 8.3: Select Fields and Form Config Updates
- Session 8.4: Styling Consistency and Polish

**Phase Objectives:**
- Update service selection components with improved UX
- Enhance entity cards with better information display
- Improve select fields and form configurations
- Ensure consistent styling across all components
- Prepare components for Phase 9 refactoring (naming conventions and relationship model updates)

**Key Deliverables:**
- Updated ServiceSelectionStep.vue with improved UX
- Enhanced EntityCard.vue components with better information display
- Improved SelectFields.vue with better filtering and display logic
- Updated form field configurations
- Consistent styling across all components
- Components ready for Phase 9 refactoring

**Success Criteria:**
- Service selection components updated with improved UX
- Entity cards enhanced with better information display
- Select fields improved with better filtering and display
- Form configurations updated and improved
- Consistent styling across all components
- Components ready for Phase 9 refactoring
- All components tested and working correctly

**Dependencies:**
- Phase 7 complete (Booking Wizard Logic Integration)

**Note:** Phase 9 will update Phase 8 components with new naming conventions (Shape/Instance/Kind) and relationship model structure (Cascade/Constituent/Composition). Phase 9 session 9.18 specifically handles realigning Phase 8 with new naming and model structure. Phase 9 session 9.19 (final session) handles branch alignment and merging of Phase 6 work with Phase 9 changes to prevent merge conflicts when continuing Phase 6 unfinished sessions.

### Phase 9: Three-Dimensional Relationship Model Refactoring

**Status:** In Progress
**Description:** Implement a three-dimensional relationship model with clear naming conventions: Cascade (vertical hierarchy, different shapes), Constituent (Block → Part relationships), and Composition (lateral aggregation, same shape). Includes comprehensive renaming (Type → Shape, Profile → Instance, Type → Kind), database schema changes, model updates, API layer changes, transformer refactoring, and UI component updates.

**Sessions:**
- Session 9.1: Disambiguation Rename - Type → Shape ✅ Complete
- Session 9.2: Disambiguation Rename - Profile → Instance
- Session 9.3: Disambiguation Rename - Type → Kind (Discriminators)
- Session 9.4: Disambiguation Rename - Relationship Models
- Session 9.5: Database Schema Changes - Boolean Fields & Service Unification
- Session 9.6: Database Schema Changes - Composition Extension & ValidComposition
- Session 9.7: Model Layer Updates
- Session 9.8: API Layer Updates
- Session 9.9: Frontend Type System Updates ✅ Complete
- Session 9.10: Transformer Refactoring - DRY Pattern ✅ Complete (Partial - Core Architectural Change)
- Session 9.11: Transformer Updates - Scheduler & Admin ✅ Complete
- Session 9.12: Composable Updates ✅ Complete
- Session 9.13: UI Component Updates - Service Selection & Entity Cards ✅ Complete
- Session 9.14: UI Component Updates - Select Fields & Form Configs ✅ Complete
- Session 9.15: Configuration Updates ✅ Complete
- Session 9.16: Data Migration - Seed Data & Scripts ✅ Complete
- Session 9.17: Testing & Validation 🔄 In Progress
- Session 9.18: Documentation & Cleanup ✅ Complete
- Session 9.19: Branch Alignment & Merge - Phase 6 Work with Phase 9 Changes ✅ Complete

**Phase Objectives:**
- Rename entity structure definitions (block_type → block_shape, part_type → part_shape)
- Rename runtime instances (block_profile → block_instance, part_profile → part_instance)
- Rename discriminators (entity_type → entity_kind, relationshipType → relationshipKind)
- Rename relationship models (ValidBlock → ValidCascade, ActiveBlock → ActiveCascade, ValidPart → ValidConstituent, ActivePart → ActiveConstituent, EntityAggregate → ActiveComposition)
- Create ValidComposition model for shape-level composition
- Add boolean fields (active, dependent, visible) to entity tables
- Unify base_service and additional_service into service
- Extend composition to support parts (entity_kind = 'partInstance')
- Update all Sequelize models with new names and fields
- Update API layer (relationship router, entity endpoints, composition router)
- Update frontend type system (entity types, relationship types, constants)
- Refactor transformers to DRY pattern with generic relationship transformation
- Update composables (booking wizard, entity, composition) with unified services
- Update UI components (service selection, entity cards, select fields, form configs)
- Update configuration files (entity registry, relationship configs)
- Update seed data and create migration scripts
- Realign phases 6, 7, and 8 with new naming conventions and relationship model structure

**Key Deliverables:**
- All entity structure renamed (Type → Shape)
- All runtime instances renamed (Profile → Instance)
- All discriminators renamed (Type → Kind)
- All relationship models renamed and clarified (Cascade/Constituent/Composition)
- Database schema updated with boolean fields and unified services
- ValidComposition table created
- All Sequelize models updated
- API layer updated with new relationship names
- Frontend type system updated
- Transformers refactored to DRY pattern
- All composables updated
- All UI components updated
- Configuration files updated
- Seed data updated
- Migration scripts created
- Phases 6, 7, and 8 realigned with new naming and model structure

**Success Criteria:**
- All entity structure renamed (Type → Shape)
- All runtime instances renamed (Profile → Instance)
- All discriminators renamed (Type → Kind)
- All relationship models renamed and clarified (Cascade/Constituent/Composition)
- Database schema updated with boolean fields and unified services
- ValidComposition table created
- All Sequelize models updated
- API layer updated with new relationship names
- Frontend type system updated
- Transformers refactored to DRY pattern
- All composables updated
- All UI components updated
- Configuration files updated
- Seed data updated
- Migration scripts created
- All tests passing
- Data validation complete
- Phases 6, 7, and 8 realigned with new naming and model structure
- Ready for production use

**Dependencies:**
- Phase 5 complete (Scheduler Wizard structure)

**Critical Implementation Order:**
- **Rename sessions (9.1-9.4) MUST complete before migration sessions (9.5-9.6)**
- This ensures code references are updated before database changes execute

### Phase 10: Property Management System

**Status:** ✅ Cancelled
**Description:** ~~Build a simple, integrated property management system~~ **Note:** This phase has been cancelled per user preference. Property management functionality is not needed.

**Sessions:**
- Session 10.1: Database Models & Schema
- Session 10.2: API Endpoints
- Session 10.3: Frontend Types & Composables
- Session 10.4: UI Components - Property Management in ShapesTab
- Session 10.5: Integration & Testing

**Phase Objectives:**
- Create database models for PropertyDefinition and EntityPropertyMapping
- Build API endpoints for property CRUD operations
- Create frontend types and composables for property management
- Integrate property management UI into ShapesTab
- Enable dynamic property assignment to BlockShapes and PartShapes
- Support property ordering and configuration per entity type
- Keep the system simple and intuitive (avoid complexity of previous system)

**Key Deliverables:**
- PropertyDefinition database model and migrations
- EntityPropertyMapping database model and migrations
- Property CRUD API endpoints
- Frontend property types and composables
- Property management UI integrated into ShapesTab
- Property assignment interface for shapes
- Simple property creation dialog
- Property ordering and configuration system

**Success Criteria:**
- PropertyDefinition model created and seeded
- EntityPropertyMapping model created and seeded
- All API endpoints working (CRUD operations)
- Property management UI integrated into ShapesTab
- Properties can be assigned to BlockShapes
- Properties can be assigned to PartShapes
- Property ordering works via drag-and-drop
- Properties can be created from shapes tab
- Properties can be edited and deleted (non-system properties)
- Property assignments affect entity forms
- System properties are protected from deletion
- End-to-end workflow tested and working

**Dependencies:**
- Phase 6 complete (admin panel structure - ShapesTab exists)
- Existing property seed data available

### Phase 11: Bulk Update for Composite/Composable Members

**Status:** ✅ Moved to Feature 2: UI Polish
**Description:** ~~Enable bulk update functionality~~ **Note:** This work has been moved to Feature 2: UI Polish as a small admin UI enhancement (not a separate feature).

**Sessions:**
- Session 11.1: Core Comparison Logic
- Session 11.2: Template Row Component
- Session 11.3: Bulk Update API
- Session 11.4: UI Integration
- Session 11.5: Distribution & Preview
- Session 11.6: Nested Support

**Phase Objectives:**
- Create `useBulkUpdate` composable with member comparison logic
- Build template row component showing shared values across members
- Implement backend API endpoint for bulk updates
- Integrate template row into existing member list components
- Add distribution strategies (proportional, equal, manual) for bulk updates
- Support nested member bulk updates with recursive comparison

**Key Deliverables:**
- `useBulkUpdate` composable with comparison logic
- `BulkUpdateTemplateRow.vue` component
- Backend bulk update API endpoint
- Integration into `PartInstanceNestedList` and composition views
- Distribution preview modal for bulk updates
- Nested member bulk update support

**Success Criteria:**
- Users can see shared values across all members in a template row
- Users can bulk update all members from the template row
- Users can select specific members for bulk updates
- System correctly identifies identical vs mixed fields
- Bulk updates apply correctly with proper validation
- UI is intuitive and follows existing design patterns
- Performance is acceptable for large member sets (50+ members)
- Nested member bulk updates work correctly

**Dependencies:**
- Phase 6 complete (Composition System must be complete)

---

## Feature 1: Data Flow Alignment

**Status:** Planning
**Description:** Fix data flow issues, broken interactions, and admin panel functionality. Ensure all admin panel features work correctly with unified data flow.

**Branch:** `feature/data-flow-alignment`

### Phase 1.1: Admin Panel Data Flow Fixes

**Status:** Not Started
**Description:** Fix data flow issues in admin panel, ensure all CRUD operations work correctly with unified globalData cache.

**Key Objectives:**
- Verify all admin panel CRUD operations use globalData cache
- Fix any direct API calls bypassing globalData
- Ensure proper invalidation on mutations
- Fix broken interactions in admin panel

**Key Files:**
- `client-vue/src/composables/useGlobalComp.ts`
- `client-vue/src/composables/useEntity.ts`
- `client-vue/src/composables/useRelationship.ts`
- `client-vue/src/views/admin/AdminPanel.vue`

**Success Criteria:**
- All admin panel CRUD operations use globalData cache
- No direct API calls bypassing globalData
- Mutations properly invalidate globalData
- All admin panel interactions working correctly

### Phase 1.2: Booking Wizard Data Flow Fixes

**Status:** Not Started
**Description:** Fix data flow issues in booking wizard, ensure all data connections work correctly.

**Key Objectives:**
- Verify booking wizard uses globalData cache correctly
- Fix any data connection issues
- Ensure proper data flow through transformers
- Fix broken interactions in wizard steps

**Key Files:**
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/composables/useSchedulerComp.ts`
- `client-vue/src/components/scheduler/steps/`

**Success Criteria:**
- Booking wizard uses globalData cache correctly
- All wizard steps have correct data connections
- Data flows correctly through transformers
- All wizard interactions working correctly

### Phase 1.3: Interaction Fixes and Validation

**Status:** Not Started
**Description:** Fix broken interactions and add proper validation throughout admin panel and booking wizard.

**Key Objectives:**
- Fix broken form interactions
- Add proper form validation
- Fix broken navigation flows
- Add error handling and user feedback

**Success Criteria:**
- All form interactions working correctly
- Proper validation on all forms
- Navigation flows working correctly
- Error handling and user feedback in place

**Related Documents:**
- **Feature Plan:** `project-manager/features/data-flow-alignment/feature-plan.md`
- **Data Flow Plan:** `align-data-flows.plan.md`

---

## Feature 2: UI Polish

**Status:** Planning
**Description:** Polish admin panel and booking wizard UI to be "niceish". Fix flow/interactions, improve visual design, ensure consistent styling. Includes bulk updates as a small admin UI enhancement.

**Branch:** `feature/ui-polish`

### Phase 7.1: Admin Panel UI Polish

**Status:** Not Started
**Description:** Polish admin panel UI, improve visual design, ensure consistent styling.

**Key Objectives:**
- Improve visual design of admin panel
- Ensure consistent styling across all components
- Improve spacing and layout
- Enhance visual hierarchy
- Improve form layouts and dialogs

**Success Criteria:**
- Admin panel has polished, professional appearance
- Consistent styling throughout
- Improved spacing and layout
- Clear visual hierarchy
- Forms and dialogs are well-designed

### Phase 7.2: Booking Wizard UI Polish

**Status:** Not Started
**Description:** Polish booking wizard UI, improve visual design, ensure consistent styling.

**Key Objectives:**
- Improve visual design of booking wizard
- Ensure consistent styling across all steps
- Improve spacing and layout
- Enhance visual hierarchy
- Improve step navigation and transitions

**Success Criteria:**
- Booking wizard has polished, professional appearance
- Consistent styling throughout
- Improved spacing and layout
- Clear visual hierarchy
- Smooth step navigation and transitions

### Phase 7.3: Responsive Design and Mobile Optimization

**Status:** Not Started
**Description:** Optimize responsive design and mobile experience.

**Key Objectives:**
- Ensure responsive design works well on all screen sizes
- Optimize mobile experience
- Improve touch interactions
- Test on various devices

**Success Criteria:**
- Responsive design works well on all screen sizes
- Mobile experience is optimized
- Touch interactions are smooth
- Tested on various devices

### Phase 7.4: Bulk Updates Enhancement

**Status:** Not Started
**Description:** Add bulk update functionality for composite/composable members as a small admin UI enhancement.

**Key Objectives:**
- Add template row showing shared values across members
- Enable bulk updates from template row
- Support distribution strategies (proportional, equal, manual)
- Add visual indicators for identical vs mixed field values

**Key Deliverables:**
- `useBulkUpdate` composable with member comparison logic
- `BulkUpdateTemplateRow.vue` component
- Backend bulk update API endpoint (if needed)
- Integration into member list components

**Success Criteria:**
- Users can see shared values across all members in template row
- Users can bulk update all members from template row
- Users can select specific members for bulk updates
- System correctly identifies identical vs mixed fields
- Bulk updates apply correctly with proper validation

**Note:** This is a **small admin UI enhancement**, not a separate feature. It was originally planned as Phase 11 but has been moved here.

**Related Documents:**
- **Feature Plan:** `project-manager/features/ui-polish/feature-plan.md`

---

## Feature 3: Booking Calculations

**Status:** Planning
**Description:** Extract and implement fee and time calculation logic from React codebase. Create shared calculation composable for booking wizard and admin preview.

**Branch:** `feature/booking-calculations`

### Phase 3.1: Extract Calculation Logic from React

**Status:** Not Started
**Description:** Extract fee and time calculation logic from React codebase, understand the calculation formulas and edge cases.

**Key Files:**
- `client/src/scheduler/utils/ProfileToFinalTimeUtils.ts` (React - extract)
- `client/src/scheduler/dataTransformation/appointmentTransformer.ts` (React - fee calculations commented)

**Success Criteria:**
- Calculation logic extracted and documented
- Calculation formulas documented
- Edge cases identified
- Special handling documented

### Phase 3.2: Create Shared Calculation Composable

**Status:** Not Started
**Description:** Create shared calculation composable in Vue.js that implements the extracted calculation logic.

**Key Files:**
- `client-vue/src/composables/useBookingCalculator.ts` (new)

**Calculation Functions:**
- `calculatePrice(service, property, options)` → Price breakdown
- `calculateTime(service, property, options)` → Time breakdown
- `checkApplicability(service, property)` → Applicability result with reasons
- `getBusinessLogicIndicators(calculation)` → Warnings/suggestions

**Success Criteria:**
- `useBookingCalculator` composable created
- Price calculation working correctly
- Time calculation working correctly
- Applicability checking working correctly
- Performance: < 50ms per calculation

### Phase 3.3: Integrate into Booking Wizard

**Status:** Not Started
**Description:** Integrate calculation composable into booking wizard to show pricing and time estimates.

**Success Criteria:**
- Price breakdown displayed in wizard
- Time breakdown displayed in wizard
- Applicability warnings shown
- Calculations update reactively
- All edge cases handled correctly

### Phase 3.4: Add Calculation Tests

**Status:** Not Started
**Description:** Add comprehensive unit tests for calculation logic to ensure accuracy.

**Success Criteria:**
- Unit tests for all calculation functions
- Edge cases tested
- Calculations match React version exactly
- Test coverage > 80%

**Related Documents:**
- **Feature Plan:** `project-manager/features/booking-calculations/feature-plan.md`
- **Admin UI Overhaul:** `project-manager/features/admin-ui-overhaul/feature-plan.md` (Phase 2.1 reference)

---

## Feature 4: Calendar & Appointment Availability

**Status:** Planning
**Description:** Build calendar component for appointment availability, time slot selection, and differential scheduling logic.

**Branch:** `feature/calendar-appointment-availability`

### Phase 4.1: Calendar Component UI

**Status:** Not Started
**Description:** Build calendar component UI for displaying available appointment times.

**Key Files:**
- `client-vue/src/components/scheduler/Calendar.vue` (new)
- `client-vue/src/components/scheduler/TimeSlotGrid.vue` (new)

**Success Criteria:**
- Calendar component displays available dates
- Time slots displayed in user-friendly format
- Date navigation working
- Time slot selection working
- Responsive design for mobile and desktop

### Phase 4.2: Time Slot Selection Logic

**Status:** Not Started
**Description:** Implement time slot selection logic and state management.

**Key Files:**
- `client-vue/src/composables/useAvailability.ts` (new)
- `client-vue/src/composables/useBookingWizard.ts` (update)

**Success Criteria:**
- Time slot selection state management working
- Single and multiple selection supported
- Validation working correctly
- Selected time slots stored in wizard state

### Phase 4.3: Differential Scheduling Calculations

**Status:** Not Started
**Description:** Implement differential scheduling calculations where inspector and client arrive at different times.

**Key Files:**
- `client-vue/src/utils/differentialScheduling.ts` (new)

**Success Criteria:**
- Inspector arrival time calculated correctly
- Client arrival time displayed correctly
- Time difference calculated and displayed
- Both times clearly shown to user
- Edge cases handled correctly

### Phase 4.4: Availability Step Integration

**Status:** Not Started
**Description:** Integrate calendar component and availability logic into booking wizard availability step.

**Success Criteria:**
- Calendar component integrated into AvailabilityStep
- Availability logic connected to wizard state
- Selected time slots displayed in confirmation
- Navigation working correctly
- Validation working before proceeding

**Related Documents:**
- **Feature Plan:** `project-manager/features/calendar-appointment-availability/feature-plan.md`
- **USER_STORY.md**: User story requirements for appointment availability

---

## Feature 2: Google APIs Integration

**Status:** Planning
**Description:** Integrate Google Calendar API (availability fetching, event creation), Google Maps API (address autocomplete, drive time), and MLS API (property data - deferrable).

**Branch:** `feature/google-apis-integration`

### Phase 2.0: Calendar Configuration UI (Prerequisite)

**Status:** Planning
**Description:** Build admin interface for configuring which calendars to check for free-busy calculations.

**Related Documents:**
- **Feature Plan:** `project-manager/features/feature-2-google-apis-integration/feature-plan.md`

### Phase 2.1: Google Calendar API Integration

**Status:** Not Started
**Description:** Integrate Google Calendar API for fetching availability and creating events.

**Key Files:**
- `client/src/scheduler/externalAPI/calendarCalls.ts` (React - reference)
- `client-vue/src/api/external/googleCalendar.ts` (new)
- `client-vue/src/composables/useGoogleCalendar.ts` (new)

**Sessions:**
- Session 2.1.1: Calendar Availability Fetching
- Session 2.1.2: Event Creation & Invitations
- Session 2.1.3: Error Handling & Fallbacks

**Success Criteria:**
- Calendar availability fetched correctly
- Date ranges handled correctly (1st-21st vs 22nd-end)
- Events created correctly with invitations
- Error handling working with fallbacks
- Performance: API response times <2s

### Phase 2.2: Google Maps API Integration

**Status:** Not Started
**Description:** Integrate Google Maps API for address autocomplete and drive time calculations.

**Key Files:**
- `client-vue/src/api/external/googleMaps.ts` (new)
- `client-vue/src/composables/useGoogleMaps.ts` (new)

**Sessions:**
- Session 2.2.1: Address Autocomplete
- Session 2.2.2: Drive Time Calculations
- Session 2.2.3: Error Handling & Fallbacks

**Success Criteria:**
- Address autocomplete working correctly
- Drive times calculated correctly
- Drive times integrated into availability calculations
- Error handling working with fallbacks
- Performance: API response times <2s

### Phase 2.3: MLS API Integration

**Status:** Not Started (Deferrable)
**Description:** Integrate MLS API to retrieve property data and auto-populate property details form.

**Key Files:**
- `client-vue/src/api/external/mls.ts` (new)
- `client-vue/src/composables/useMLS.ts` (new)

**Success Criteria:**
- MLS API client functional
- Property data retrieved and mapped correctly
- Property details form auto-populated
- Error handling working with fallbacks
- User prompted for manual input on failure

**Note:** This phase is **deferrable** - MLS API integration can be deferred with manual entry fallback. It's not critical for MVP.

**Fallback Plans:**
- Google Calendar API fails → Manual availability entry mode
- Google Maps API fails → Manual address entry (no autocomplete)
- MLS API fails → Manual property details entry

**Related Documents:**
- **Feature Plan:** `project-manager/features/feature-2-google-apis-integration/feature-plan.md`
- **Old Project Plan:** `project-manager/archive/project-plan.md.old` (Feature 4 reference)

---

## Feature 6: GPT-Powered Admin Panel Automation

**Status:** Planning
**Description:** Add GPT-powered natural language automation to the admin panel, allowing administrators to create and configure entities (part types, profiles, composites, relationships) using natural language commands instead of manual form filling. Automates complex setups like "infrared scan part type/profile composite" with conditional rules (e.g., "condos not having attics").

**Branch:** `feature/gpt-admin-automation`

### Phase 1: Foundation & GPT Integration

**Status:** Not Started
**Description:** Set up GPT service client and basic tool definitions for entity creation.

**Sessions:**
- Session 1.1: Setup GPT Service Client
- Session 1.2: Create Domain Knowledge Base
- Session 1.3: Create Basic Tool Definitions
- Session 1.4: Create AI Router
- Session 1.5: Integration & Testing

**Phase Objectives:**
- Install OpenAI SDK and configure GPT service client
- Create domain knowledge base with entity schemas
- Implement basic tool wrappers for entity CRUD operations
- Create AI router with `/ai/execute` endpoint
- Test basic entity creation via natural language

**Key Deliverables:**
- GPT service client functional
- Domain knowledge base with entity schemas
- Basic tool wrappers (`createEntity`, `queryEntities`)
- AI router endpoint operational
- Can create partShape via natural language

**Success Criteria:**
- ✅ GPT service client functional
- ✅ Can create partShape via: "Create a part type called 'Test'"
- ✅ Can create blockShape via natural language
- ✅ API endpoint `/api/internal/ai/execute` operational
- ✅ Basic error handling working
- ✅ Unit tests passing

**Dependencies:**
- Phase 6 complete (admin panel structure exists)
- OpenAI API key available

### Phase 2: Relationship & Composition Management

**Status:** Not Started
**Description:** Add tools for creating relationships, cascades, constituents, and compositions.

**Sessions:**
- Session 2.1: Relationship Tools
- Session 2.2: Composition Tools
- Session 2.3: Query & Validation Tools
- Session 2.4: Enhanced Domain Knowledge
- Session 2.5: Testing

**Phase Objectives:**
- Implement relationship creation tools (validCascades, validConstituents, etc.)
- Implement composition creation with validation
- Add query and validation tools
- Enhance domain knowledge with relationship constraints

**Key Deliverables:**
- All relationship types can be created via GPT
- Compositions can be created with proper validation
- Query tools functional for entity discovery

**Success Criteria:**
- ✅ Can create validCascade relationship via natural language
- ✅ Can create composition with proper validation
- ✅ GPT correctly handles entity lookups before creating relationships

**Dependencies:**
- Phase 1 complete (Foundation & GPT Integration)

### Phase 3: Conditional Rules Engine

**Status:** Not Started
**Description:** Implement conditional rule system for business logic (e.g., "condos don't have attics").

**Sessions:**
- Session 3.1: Rule Engine Foundation
- Session 3.2: Rule Storage
- Session 3.3: Rule Application
- Session 3.4: Rule Examples
- Session 3.5: Testing

**Phase Objectives:**
- Build rule engine for conditional logic
- Implement rule storage (database or config)
- Apply rules during composition/relationship creation
- Add example rules (e.g., "condos don't have attics")

**Key Deliverables:**
- Rule engine functional
- Rules can be stored and evaluated
- Rules applied during entity/relationship creation

**Success Criteria:**
- ✅ "Create infrared scan composite for condos, but condos shouldn't have attics" works correctly
- ✅ Attic part is excluded when creating compositions for condo profiles
- ✅ Rules can be added/modified without code changes

**Dependencies:**
- Phase 2 complete (Relationship & Composition Management)

### Phase 4: Frontend Integration

**Status:** Not Started
**Description:** Build Vue.js UI components for AI assistant integration into admin panel.

**Sessions:**
- Session 4.1: AI Assistant Composable
- Session 4.2: AI Assistant View
- Session 4.3: Command Input Component
- Session 4.4: Execution Preview Component
- Session 4.5: Admin Panel Integration
- Session 4.6: UI Polish

**Phase Objectives:**
- Create Vue composable for AI assistant
- Build chat interface UI
- Create command input component
- Build execution preview component
- Integrate into admin panel

**Key Deliverables:**
- AI Assistant UI integrated into admin panel
- Chat interface functional
- Execution preview working

**Success Criteria:**
- ✅ Can access AI Assistant from admin panel
- ✅ Natural language input works
- ✅ Preview shows proposed changes before execution
- ✅ Results display correctly

**Dependencies:**
- Phase 3 complete (Conditional Rules Engine)

### Phase 5: Polish, Security & Testing

**Status:** Not Started
**Description:** Add security, audit logging, comprehensive testing, and documentation.

**Sessions:**
- Session 5.1: Security Enhancements
- Session 5.2: Audit Logging
- Session 5.3: Error Handling & Rollback
- Session 5.4: Comprehensive Testing
- Session 5.5: Documentation
- Session 5.6: Performance Optimization

**Phase Objectives:**
- Add authentication and rate limiting
- Implement audit logging for all AI changes
- Improve error handling and rollback
- Add comprehensive test coverage
- Create documentation

**Key Deliverables:**
- Secure, production-ready AI integration
- Comprehensive test coverage
- Complete documentation

**Success Criteria:**
- ✅ All security measures in place
- ✅ Audit logging functional
- ✅ Test coverage > 80%
- ✅ Documentation complete

**Dependencies:**
- Phase 4 complete (Frontend Integration)

**Related Documents:**
- **Feature Plan:** `project-manager/features/gpt-admin-automation/feature-plan.md`
- **Phase 1 Tasks:** `project-manager/features/gpt-admin-automation/phase-1-tasks.md`
- **Phase 1 Todos:** `project-manager/features/gpt-admin-automation/todos/phase-1-todos.json`
- **Implementation Summary:** `project-manager/features/gpt-admin-automation/IMPLEMENTATION_SUMMARY.md`
- **README:** `project-manager/features/gpt-admin-automation/README.md`

---

## Future Features Catalog

See `.cursor/project-manager/future-features-catalog.md` for comprehensive catalog of future features identified in USER_STORY.md and common commercial scheduler features for evaluation and prioritization.

---

## Related Documents

### Vue Migration Feature (Core Complete)
- **Completion Summary:** `project-manager/features/vue-migration/vue-migration-completion-summary.md`
- **Feature Guide:** `project-manager/features/vue-migration/feature-vue-migration-guide.md`
- **Phase Guides:** `project-manager/features/vue-migration/phases/phase-[N]-guide.md`
- **Session Guides:** `project-manager/features/vue-migration/sessions/session-[X.Y]-guide.md`

### Feature 1: Data Flow Alignment
- **Feature Plan:** `project-manager/features/data-flow-alignment/feature-plan.md`
- **README:** `project-manager/features/data-flow-alignment/README.md`
- **Data Flow Plan:** `align-data-flows.plan.md`

### Feature 2: UI Polish
- **Feature Plan:** `project-manager/features/ui-polish/feature-plan.md`
- **README:** `project-manager/features/ui-polish/README.md`

### Feature 3: Booking Calculations
- **Feature Plan:** `project-manager/features/booking-calculations/feature-plan.md`
- **README:** `project-manager/features/booking-calculations/README.md`

### Feature 4: Calendar & Appointment Availability
- **Feature Plan:** `project-manager/features/calendar-appointment-availability/feature-plan.md`
- **README:** `project-manager/features/calendar-appointment-availability/README.md`

### Feature 5: Google APIs Integration
- **Feature Plan:** `project-manager/features/google-apis-integration/feature-plan.md`
- **README:** `project-manager/features/google-apis-integration/README.md`

### Feature 6: GPT-Powered Admin Panel Automation
- **Feature Plan:** `project-manager/features/gpt-admin-automation/feature-plan.md`
- **Implementation Summary:** `project-manager/features/gpt-admin-automation/IMPLEMENTATION_SUMMARY.md`
- **Phase 1 Tasks:** `project-manager/features/gpt-admin-automation/phase-1-tasks.md`
- **Phase 1 Todos:** `project-manager/features/gpt-admin-automation/todos/phase-1-todos.json`
- **README:** `project-manager/features/gpt-admin-automation/README.md`

### General
- **Future Features:** `project-manager/future-features-catalog.md`

---

## Notes

- This is the single source of truth for project planning
- All phase guides and todos should align with this document
- **Vue Migration (Feature 0) is Core Complete** - Structural migration achieved. Remaining work is feature development, not migration work.
- **Phase Status:**
  - Phases 1-6: Complete (structural foundation)
  - Phase 7: Archived (work completed in Phase 6)
  - Phase 8: Deferred (moved to Feature 2: UI Polish)
  - Phase 9: Mostly Complete (naming refactoring done)
  - Phase 10: Cancelled (user preference)
  - Phase 11: Moved to Feature 2: UI Polish (small enhancement)
- **New Features Created:**
  - Feature 1: Data Flow Alignment - Fix data flow issues and interactions
  - Feature 2: Google APIs Integration - Integrate external APIs
  - Feature 3: Booking Calculations - Extract and implement calculation logic
  - Feature 4: Calendar & Appointment Availability - Build calendar and availability features
  - Feature 6: GPT-Powered Admin Panel Automation - Natural language automation (separate feature, not part of migration)
  - Feature 7: UI Polish - Polish admin panel and wizard UI (includes bulk updates)
