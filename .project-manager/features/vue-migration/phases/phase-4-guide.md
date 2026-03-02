# Phase 4 Guide

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 2 - High-Level)

---

## Phase Overview

**Phase Number:** 4
**Phase Name:** Vuexy Admin Panel Integration
**Description:** Build unified tabbed admin interface with Profiles tab (BlockProfile with nested PartProfiles grouped by BlockType) and Types tab (BlockType and PartType configuration). Integrate data layer and create CRUD interfaces using Vuexy components.

**Duration:** 6 Sessions (Session 4.7 extends Phase 4)
**Status:** ✅ COMPLETE (Session 4.7: Entity Pooling System - Next)

---

## Phase Objectives

- Build unified admin interface with tabbed navigation (Profiles | Types)
- Create Profiles tab with BlockProfile management grouped by BlockType
- Display nested PartProfiles within each BlockProfile using activeParts relationship
- Create Types tab with BlockType and PartType configuration
- Integrate existing data layer (composables, API clients) into Vuexy components
- Build CRUD interfaces using Vuexy form components and dialogs
- Apply Vuexy styling and layout patterns throughout

---

## Key Deliverables

- Main AdminPanel.vue component with VTabs navigation
- ProfilesTab.vue with BlockProfile grouping and nested PartProfiles
- TypesTab.vue with BlockType and PartType sections
- Form dialogs for all entity types using Vuexy components
- Full CRUD operations working with Vuexy UI
- Single /admin route replacing separate entity routes

---

## Key Activities

- **Main Structure:** Create tabbed interface using Vuexy VTabs
- **Profiles Tab:** Build BlockProfile management with grouping and nesting
- **Types Tab:** Build simple BlockType and PartType configuration
- **Form Dialogs:** Create create/edit dialogs using Vuexy form components
- **Data Integration:** Connect existing composables to Vuexy components
- **Router Update:** Replace separate routes with unified /admin route

---

## Sessions Breakdown

- [x] ### Session 4.1: Main Admin Panel Structure ✅ COMPLETED
**Description:** Create main admin page with tabbed interface structure
**Tasks:** Main page setup and tab navigation

**Task Breakdown:**
- **4.1.1:** Create AdminPanel.vue with VTabs for Profiles and Types tabs
- **4.1.2:** Set up basic tab structure and navigation
- **4.1.3:** Create placeholder tab components (ProfilesTab, TypesTab)
- **4.1.4:** Update router to use single /admin route
- **4.1.5:** Verify tab navigation works correctly

- [x] ### Session 4.2: Profiles Tab Implementation ✅ COMPLETED
**Description:** Build Profiles tab with BlockProfile grouping and nested PartProfiles
**Tasks:** Profiles tab components and data integration

**Task Breakdown:**
- [x] **4.2.1:** Create ProfilesTab.vue component structure
- [x] **4.2.2:** Implement BlockProfile grouping by BlockType using VExpansionPanels
- [x] **4.2.3:** Create BlockProfileCard.vue component for individual BlockProfiles
- [x] **4.2.4:** Create PartProfileNestedList.vue to show nested PartProfiles
- [x] **4.2.5:** Integrate useGlobal and useRelationshipCrud composables
- [x] **4.2.6:** Add search functionality for BlockProfiles
- [x] **4.2.7:** Test data loading and display

- [x] ### Session 4.3: Types Tab Implementation ✅ COMPLETED
**Description:** Build Types tab with BlockType and PartType configuration
**Tasks:** Types tab components and simple CRUD

**Task Breakdown:**
- **4.3.1:** Create TypesTab.vue component structure
- **4.3.2:** Create BlockTypeSection.vue component
- **4.3.3:** Create PartTypeSection.vue component
- **4.3.4:** Implement list/table views for both types
- **4.3.5:** Add create/edit/delete actions
- **4.3.6:** Integrate useGlobal composable
- **4.3.7:** Test Types tab functionality

- [x] ### Session 4.4: Form Dialogs and CRUD Operations ✅ COMPLETED
**Description:** Create form dialogs for all entity types and complete CRUD operations
**Tasks:** Form dialogs and CRUD integration

**Task Breakdown:**
- **4.4.1:** Create BlockProfileDialog.vue with Vuexy form components
- **4.4.2:** Create PartProfileDialog.vue with Vuexy form components
- **4.4.3:** Create BlockTypeDialog.vue with Vuexy form components
- **4.4.4:** Create PartTypeDialog.vue with Vuexy form components
- **4.4.5:** Integrate create/edit mutations for all entities
- **4.4.6:** Add relationship management (activeParts) in dialogs
- **4.4.7:** Test full CRUD operations for all entities
- **4.4.8:** Apply Vuexy styling and polish

- [x] ### Session 4.5: Admin Data Integration ✅ COMPLETED
**Description:** Connect admin composables and transformers to UI components, ensuring data flows correctly from backend to admin views
**Tasks:** Enhance composables and integrate data flow

**Task Breakdown:**
- **4.5.1:** Enhance useAdmin with singleton pattern
- **4.5.2:** Enhance useEntity composable with error handling
- **4.5.3:** Update BlockProfileCard to use generic components
- **4.5.4:** Integrate data flow verification

- [x] ### Session 4.6: Generic Component System & Field System ✅ COMPLETED
**Description:** Create generic reusable components and enhance field system for config-driven form generation
**Tasks:** Create generic components and enhance field system

**Task Breakdown:**
- **4.6.1:** Create generic EntityDialog component
- **4.6.2:** Create generic EntityCard component
- **4.6.3:** Create GroupedEntityCard component
- **4.6.4:** Create DynamicFormFields component
- **4.6.5:** Create useAdminConfig composable
- **4.6.6:** Enhance field system components
- **4.6.7:** Create NestedCollectionField component
- **4.6.8:** Update admin views to use generic components

- [ ] ### Session 4.7: Entity Pooling System ⏭️ NEXT
**Description:** Implement configurable entity pooling system for creating aggregated/composite entities
**Tasks:** Backend model, API routes, frontend types, aggregator, composable, UI components

**Task Breakdown:**
- **4.7.1:** Create PooledInstance model and database table
- **4.7.2:** Add pooling config to entity registry
- **4.7.3:** Create pooled instances API routes
- **4.7.4:** Create frontend pooling types and constants
- **4.7.5:** Update global transformer to fetch pooled instances
- **4.7.6:** Create pooling aggregator for computed views
- **4.7.7:** Create usePooledEntity composable
- **4.7.8:** Add pooling methods to useEntityCrud
- **4.7.9:** Create composite change distribution modal
- **4.7.10:** Integrate pooling into admin UI

**Related Plan:** `.cursor/plans/entity-pooling-system-1bc9f8e5.plan.md`

---

## Architecture

### Component Structure
```
AdminPanel.vue (main page with VTabs)
├── ProfilesTab.vue
│   ├── VExpansionPanels (BlockType groups)
│   │   └── BlockProfileCard.vue
│   │       └── PartProfileNestedList.vue
│   └── Search functionality
└── TypesTab.vue
    ├── BlockTypeSection.vue
    └── PartTypeSection.vue
```

### Form Dialogs
- BlockProfileDialog.vue (entity-specific, Session 4.4)
- PartProfileDialog.vue (entity-specific, Session 4.4)
- BlockTypeDialog.vue (entity-specific, Session 4.4)
- PartTypeDialog.vue (entity-specific, Session 4.4)
- EntityDialog.vue (generic, Session 4.6)

### Generic Components (Session 4.6)
- EntityDialog.vue - Generic dialog for all entity types
- EntityCard.vue - Generic card for all entity types
- GroupedEntityCard.vue - Expandable grouped card wrapper
- DynamicFormFields.vue - Config-driven form field generator
- NestedCollectionField.vue - Nested collection field component

### Data Flow
- **Backend → useGlobal:** API calls fetch GlobalData, Vue Query caches data
- **useGlobal → useAdmin:** Transforms GlobalData to AdminObjectMap with relationships
- **useAdmin → UI Components:** Components use useAdmin for entity access
- **Profiles Tab:** useAdmin() → group by BlockType → show nested PartProfiles via activeParts relationship
- **Types Tab:** useAdmin() → display BlockTypes and PartTypes in simple lists
- **CRUD:** Generic components → API mutations → Vue Query cache updates → reactive UI updates

---

## Dependencies

**Prerequisites:**
- Phase 1 complete (data layer, transformers)
- Phase 2 complete (state management)
- Phase 3 complete (data flow foundation verified)
- Vuexy already integrated (from plugin setup)

**Downstream Impact:**
- Provides admin interface for managing entities
- Establishes patterns for Phase 6 (Booking Wizard UI Shell)

---

## Success Criteria

- [x] Single /admin route with tabbed interface functional
- [x] Profiles tab shows BlockProfiles grouped by BlockType
- [x] Each BlockProfile displays nested PartProfiles correctly
- [x] Types tab shows BlockType and PartType configuration
- [x] Full CRUD operations working for all entities
- [x] Uses Vuexy components and styling throughout
- [x] Data loads from existing composables correctly
- [x] Relationships managed via useRelationshipCrud
- [x] Ready for Phase 6 (Booking Wizard UI Shell)

---

## Notes

This phase builds a unified admin interface using Vuexy components. The Profiles tab is the main work area with BlockProfiles and their nested PartProfiles. The Types tab provides supporting configuration for BlockTypes and PartTypes. 

Sessions 4.1-4.4 created the initial admin interface with entity-specific components. Sessions 4.5-4.6 (retroactively documented) enhanced the system with:
- Generic components that work for all entity types (replacing entity-specific components)
- Config-driven form generation (DynamicFormFields)
- Enhanced composables with singleton patterns and better error handling
- Improved data flow from backend through transformers to UI

All components use existing composables (useGlobal, useAdmin, useEntityCrud, useRelationshipCrud) and Vuexy's component library.

---

## Related Documents

- Phase Log: `.cursor/project-manager/features/vue-migration/phases/phase-4-log.md`
- Phase Handoff: `.cursor/project-manager/features/vue-migration/phases/phase-4-handoff.md`
- Session Guides: `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-guide.md`
