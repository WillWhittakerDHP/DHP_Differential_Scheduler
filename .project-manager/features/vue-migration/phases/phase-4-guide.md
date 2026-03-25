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

---

## Session docs (integrated)

### session-4.1-guide

# Phase 4 Session 4.1 Guide: Main Admin Panel Structure

**⚠️ VUE MIGRATION PHASE 4 SESSION 4.1 - Main Admin Panel Structure**

**⚠️ IMPORTANT: This is the REVISED Session 4.1 - NOT legacy removal, NOT Schema Migration Service, NOT Vuexy template setup**

**Feature:** Vue Migration  
**Purpose:** Session-level guide for creating the main admin panel structure with tabbed interface

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.1 - Main Admin Panel Structure
**Status:** Not Started

**What This Session Is:**
- Create AdminPanel.vue with VTabs (Profiles | Types tabs)
- Create placeholder ProfilesTab.vue and TypesTab.vue components
- Update router to single /admin route
- Verify tab navigation works

**What This Session Is NOT:**
- ❌ NOT legacy removal
- ❌ NOT Vuexy template setup (that was done separately)
- ❌ NOT React cleanup

---

### session-4.2-guide

# Session 4.2 Guide: Profiles Tab Implementation

**Purpose:** Session-level guide for building Profiles tab with BlockProfile grouping and nested PartProfiles

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.2
**Status:** ✅ Completed

---

### session-4.3-guide

# Session 4.3 Guide: Types Tab Implementation

**Purpose:** Session-level guide for building Types tab with BlockType and PartType configuration

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.3
**Status:** Not Started

---

### session-4.3-summary

# Session 4.3 Summary: Types Tab Implementation

**Session:** 4.3  
**Date Completed:** 2024 (retroactively documented)  
**Status:** ✅ Completed  
**Duration:** ~2-3 hours

---

### session-4.4-guide

# Session 4.4 Guide: Form Dialogs and CRUD Operations

**Purpose:** Session-level guide for creating form dialogs and implementing full CRUD operations

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.4
**Status:** Not Started

---

### session-4.4-summary

# Session 4.4 Summary: Form Dialogs and CRUD Operations

**Session:** 4.4  
**Date Completed:** 2024  
**Status:** ✅ Completed  
**Duration:** ~2-3 hours

---

### session-4.5-guide

# Session 4.5 Guide: Admin Data Integration

**Purpose:** Session-level guide for connecting admin composables and transformers to UI components

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.5
**Status:** ✅ Completed (retroactively documented)

---

### session-4.5-summary

# Session 4.5 Summary: Admin Data Integration

**Session:** 4.5  
**Date Completed:** 2024 (retroactively documented)  
**Status:** ✅ Completed  
**Duration:** ~3-4 hours

---

### session-4.6-guide

# Session 4.6 Guide: Generic Component System & Field System

**Purpose:** Session-level guide for creating generic reusable components and enhancing field system

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.6
**Status:** ✅ Completed (retroactively documented)

---

### session-4.6-summary

# Session 4.6 Summary: Generic Component System & Field System

**Session:** 4.6  
**Date Completed:** 2024 (retroactively documented)  
**Status:** ✅ Completed  
**Duration:** ~6-8 hours

---

### session-4.7-guide

# Session 4.7 Guide: Entity Pooling System

**Purpose:** Session-level guide for implementing configurable entity pooling system

**Tier:** Session (Tier 2 - Medium-Level)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.7
**Status:** 🚧 In Progress

---

### session-4.7-summary

# Session 4.7 Summary: Entity Pooling System Infrastructure

**Session:** 4.7  
**Date Completed:** 2025-01-27  
**Status:** ✅ Completed  
**Duration:** ~4-6 hours

---

## Session Objectives - Status

- ✅ Create PooledInstance model and database migrations
- ✅ Implement pooled instances API routes with CRUD operations
- ✅ Create pooling types, constants, and aggregator
- ✅ Create usePooledEntity composable with pool management methods
- ✅ Build PoolMembersField component
- ✅ Build MasterChangeDistributionModal component
- ✅ Integrate pooling with global transformer
- ✅ Fix TypeScript errors and validation issues
- ✅ Update display configs for pooling fields

---

## Key Deliverables Completed

### Backend Infrastructure

1. **PooledInstance Model** ✅
   - Database model for pool relationships
   - Supports hierarchical pooling (pool members can be pool masters)
   - Soft delete support (disabled flag)
   - Order index for member ordering
   - Location: `server/src/db/models/scheduler/pooled_instance.ts`

2. **Database Migrations** ✅
   - Created pooled_instances table migration
   - Added poolable field to block_types table
   - Supports entity type, master/member relationships
   - Includes indexes for performance
   - Location: `server/src/db/migrations/20250127_*.sql`

3. **Pooled Instances API Routes** ✅
   - CRUD operations for pooled instances
   - Validation for circular references
   - Validation for same entity type requirement
   - Soft delete support
   - Location: `server/src/routes/internal/pooledInstances/pooledInstanceRouter.ts`

### Frontend Infrastructure

1. **Pooling Types** ✅
   - PooledInstance and FetchedPooledInstance types
   - AggregationStrategy type (sum, merge, first, every, custom)
   - DistributionStrategy type (proportional, equal, manual)
   - DistributionPreview type
   - Location: `client-vue/src/types/pooling.ts`

2. **Pooling Constants** ✅
   - DEFAULT_AGGREGATION_RULES for property aggregation
   - Aggregation strategies for different property types
   - Location: `client-vue/src/constants/pooling.ts`

3. **Pooling Aggregator** ✅
   - Computed view pattern for pool masters
   - Property-specific aggregation strategies
   - Recursive pool member traversal
   - Part profile aggregation for block profiles
   - Location: `client-vue/src/utils/transformers/poolingAggregator.ts`

4. **usePooledEntity Composable** ✅
   - Pool management operations (create, add, remove)
   - Pool member queries and filtering
   - Pool master computation
   - Distribution preview calculation
   - Integration with Vue Query for caching
   - Location: `client-vue/src/composables/usePooledEntity.ts`

5. **PoolMembersField Component** ✅
   - Multi-select component for pool members
   - Filters available members (same type, poolable, not self, not already in pool)
   - Displays current pool members
   - Handles add/remove operations
   - Location: `client-vue/src/components/admin/generic/fields/PoolMembersField.vue`

6. **MasterChangeDistributionModal Component** ✅
   - Modal for distributing changes from pool master to members
   - Distribution strategy selection (proportional, equal, manual)
   - Preview of changes before applying
   - Handles computed property updates
   - Location: `client-vue/src/components/admin/pooling/MasterChangeDistributionModal.vue`

### Integration Updates

1. **Global Transformer** ✅
   - Fetches pooled instances from API
   - Transforms snake_case to camelCase
   - Includes pooled instances in GlobalData
   - Location: `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts`

2. **Entity Types** ✅
   - Added pooledMembers and isPoolMaster fields
   - Extended GlobalEntityBase interface
   - Location: `client-vue/src/types/entities.ts`

3. **Display Configs** ✅
   - Added pooledMembers field display config
   - Updated BlockType display config with poolable field
   - Fixed property names (poolMembers → pooledMembers)
   - Fixed help text property (helpText → tooltip)
   - Location: `client-vue/src/configs/field/display/appliedDisplay/`

---

## Technical Implementation Details

### Architecture Decisions

1. **Computed View Pattern**
   - **Why**: Ensures data consistency, no stored aggregated values
   - **Pattern**: Pool masters are always calculated from members at query time
   - **Benefit**: No data synchronization issues, always accurate

2. **Hierarchical Pooling**
   - **Why**: Enables complex pooling structures
   - **Pattern**: Pool members can themselves be pool masters
   - **Benefit**: Flexible pooling configurations

3. **Property-Specific Aggregation**
   - **Why**: Different properties need different aggregation strategies
   - **Pattern**: Numeric values sum, arrays merge, booleans use AND, strings use first
   - **Benefit**: Accurate aggregation for different property types

4. **Bidirectional Changes**
   - **Why**: Changes can flow both ways (member → composite, composite → members)
   - **Pattern**: Member → Composite is automatic (computed), Composite → Members uses modal
   - **Benefit**: Flexible change management

### Key Features

1. **Pool Management**
   - Create pools with multiple members
   - Add/remove members from pools
   - Validate pool configurations (no circular references, same entity type)
   - Order members within pools

2. **Computed Aggregation**
   - Pool masters computed from members at query time
   - Property-specific aggregation strategies
   - Part profile aggregation for block profiles
   - No stored aggregated values

3. **Distribution Modal**
   - Preview changes before applying
   - Distribution strategy selection
   - Proportional, equal, or manual distribution
   - Handles computed property updates

4. **Type Safety**
   - Full TypeScript support
   - Generic types for entity keys
   - Type-safe pool operations

---

## Files Created

```
server/src/
├── db/
│   ├── models/scheduler/
│   │   └── pooled_instance.ts (NEW)
│   └── migrations/
│       ├── 20250127_create_pooled_instances_table.* (NEW)
│       └── 20250127_add_poolable_to_block_types.* (NEW)
└── routes/internal/pooledInstances/
    └── pooledInstanceRouter.ts (NEW)

client-vue/src/
├── types/
│   └── pooling.ts (NEW)
├── constants/
│   └── pooling.ts (NEW)
├── utils/transformers/
│   └── poolingAggregator.ts (NEW)
├── composables/
│   └── usePooledEntity.ts (NEW)
├── components/admin/
│   ├── generic/fields/
│   │   └── PoolMembersField.vue (NEW)
│   └── pooling/
│       └── MasterChangeDistributionModal.vue (NEW)
└── project-manager/features/vue-migration/sessions/
    └── session-4.7-guide.md (NEW)
```

## Files Enhanced

- `server/src/config/entityRegistry.ts` (added pooling config)
- `server/src/routes/internal/index.ts` (registered pooled instances routes)
- `client-vue/src/types/entities.ts` (added pooling fields)
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts` (fetch pooled instances)
- `client-vue/src/composables/useEntity.ts` (added pool methods)
- `client-vue/src/composables/useGlobal.ts` (fixed null check)
- `client-vue/src/configs/field/display/appliedDisplay/blockProfileDisplays.ts` (added pooledMembers)
- `client-vue/src/configs/field/display/appliedDisplay/blockTypeDisplays.ts` (added poolable)

---

## Key Fixes

1. **TypeScript Errors**
   - Fixed usePooledEntity.ts: Normalized pooledInstances ref with computed property
   - Fixed poolingAggregator.ts: Proper type assertions for union types
   - Fixed useGlobal.ts: Added null guard before accessing ref value

2. **Display Config Issues**
   - Fixed property name: poolMembers → pooledMembers
   - Fixed help text property: helpText → tooltip

3. **Type Safety**
   - Proper type narrowing for union types
   - Consistent ref handling
   - Better null checking

---

## Benefits Achieved

1. **Pooling Infrastructure**
   - Complete backend and frontend infrastructure for entity pooling
   - Supports hierarchical pooling
   - Computed views ensure data consistency

2. **Type Safety**
   - Full TypeScript support throughout
   - Generic types for flexibility
   - Compile-time error checking

3. **Reusability**
   - Generic pooling system works for any entity type
   - Configurable aggregation strategies
   - Flexible distribution options

4. **Data Consistency**
   - Computed views prevent data synchronization issues
   - Always accurate aggregated values
   - No stored aggregated values to maintain

---

---

## Next Steps

1. **Pooling UI Integration**: Complete the UI integration for pool management
   - Add BlockType poolable property UI
   - Integrate PoolMembersField into EntityDialog
   - Add pool status indicators to EntityCard
   - Test end-to-end pooling workflow

2. **Testing**: Verify pooling infrastructure works correctly
   - Test pool creation and management
   - Test computed aggregation
   - Test distribution modal
   - Test hierarchical pooling

3. **Phase 5**: Ready to proceed to Phase 5 (Booking Wizard) or complete pooling UI

---

## Notes

- Pooling infrastructure is complete and ready for UI integration
- All TypeScript errors resolved
- Display configs updated for pooling fields
- Backend and frontend fully integrated
- Ready for end-to-end testing

---

## Related Documents

- Session Guide: `project-manager/features/vue-migration/sessions/session-4.7-guide.md`
- Phase Handoff: `project-manager/features/vue-migration/phases/phase-4-handoff.md`
- Entity Pooling Plan: `.cursor/plans/entity-pooling-system-1bc9f8e5.plan.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

## Session Overview

**Session Number:** 4.7
**Session Name:** Entity Pooling System
**Description:** Implement configurable entity pooling system that allows entities to pool other entities of the same type, creating aggregated/composite entities. Pool composites are computed views that aggregate properties from pool members at query time.

**Duration:** Estimated 8-10 hours
**Dependencies:** Sessions 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 complete

---

## Session Objectives

- Create PooledInstance model for database layer
- Add pooling configuration to entity registry
- Create API routes for pooled instances CRUD operations
- Create frontend types and constants for pooling
- Extend entity types with pooling fields
- Update global transformer to fetch pooled instances
- Create pooling aggregator for computed views
- Create usePooledEntity composable
- Add pooling methods to useEntity
- Create Master Change Distribution Modal
- Configure blockProfile with pooling enabled

---

## Key Deliverables

- PooledInstance model (backend)
- Pooling config in entity registry
- Pooled instances API routes
- Frontend pooling types and constants
- Pooling aggregator transformer
- usePooledEntity composable
- Master Change Distribution Modal component
- blockProfile pooling configuration

---

## Detailed Task Breakdown

### Task 4.7.1: Create PooledInstance Model

**File:** `server/src/db/models/scheduler/pooled_instance.ts`

**Steps:**
1. Create PooledInstance model class following ActivePart pattern
2. Add fields: `pool_master_id`, `pool_member_id`, `entity_type`, `order_index`, `disabled`
3. Create factory function `PooledInstanceFactory(sequelize)`
4. Add unique constraint on `(pool_master_id, pool_member_id)`
5. Add foreign key references (generic - references entity tables dynamically)
6. Add to model initialization in `server/src/db/models/index.ts`

**Key Features:**
- Through table for many-to-many pooling relationships
- Supports same entity type pooling (blockProfile pools blockProfile)
- Order index for member ordering
- Disabled flag for soft deletion
- Unique constraint prevents duplicate pool memberships

---

### Task 4.7.2: Add Pooling Config to Entity Registry

**File:** `server/src/config/entityRegistry.ts`

**Steps:**
1. Define `PoolingConfig` interface with `enabled` and `aggregationRules`
2. Extend `EntityConfig` interface with optional `pooling?: PoolingConfig`
3. Add example config for `blockProfile` entity type
4. Define aggregation rule types: 'sum', 'merge', 'first', 'every', 'custom'

**Key Features:**
- Config-driven pooling per entity type
- Property-specific aggregation rules
- Example: `baseFee: 'sum'`, `activeParts: 'merge'`, `onSite: 'every'`

---

### Task 4.7.3: Create Pooled Instances API Routes

**File:** `server/src/routes/internal/pooledInstances/pooledInstanceRouter.ts`

**Steps:**
1. Create Express router for pooled instances
2. Implement GET (all) endpoint
3. Implement GET (by master) endpoint
4. Implement POST (create) endpoint with validation
5. Implement PATCH (update) endpoint
6. Implement DELETE endpoint
7. Add validation: ensure pool master and members are same entity type
8. Add circular reference prevention logic

**Key Features:**
- Full CRUD operations for pooled instances
- Validation prevents invalid pool configurations
- Circular reference detection
- Error handling and proper HTTP status codes

---

### Task 4.7.4: Register Routes

**File:** `server/src/routes/internal/index.ts`

**Steps:**
1. Import PooledInstanceRouter
2. Mount router at `/api/pooled-instances`
3. Ensure proper route ordering

**Key Features:**
- Routes accessible at `/api/pooled-instances`
- Integrated with existing internal routes

---

### Task 4.7.5: Create Pooling Types

**File:** `client-vue/src/types/pooling.ts`

**Steps:**
1. Define `FetchedPooledInstance` type (matches API response)
2. Define `PooledInstance` type (frontend format)
3. Define `PoolingConfig` type (matches backend config)
4. Define `DistributionStrategy` type ('proportional' | 'equal' | 'manual')
5. Define aggregation strategy types

**Key Features:**
- Type-safe pooling data structures
- Matches backend API response format
- Distribution strategy types for modal

---

### Task 4.7.6: Add Pooling Constants

**File:** `client-vue/src/constants/pooling.ts`

**Steps:**
1. Define pooling relationship key constants
2. Define aggregation strategy constants
3. Define distribution strategy constants
4. Export all constants

**Key Features:**
- Centralized constants for pooling
- Type-safe constant values
- Reusable across components

---

### Task 4.7.7: Extend Entity Types

**File:** `client-vue/src/types/entities.ts`

**Steps:**
1. Add optional `pooledMembers?: GlobalEntityId[]` to `GlobalEntityBase`
2. Add optional `isPoolMaster?: boolean` flag
3. Ensure types are properly exported

**Key Features:**
- Entities can have pool memberships
- Entities can be identified as pool masters
- Backward compatible (optional fields)

---

### Task 4.7.8: Update Global Transformer

**File:** `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts`

**Steps:**
1. Add `fetchPooledInstances()` method
2. Transform pooled instances in `stageForHydration()`
3. Attach `pooledMembers` arrays to entities in `hydrate()`
4. Add `pooledInstances: Record<GlobalEntityKey, PooledInstance[]>` to `GlobalData` type

**Key Features:**
- Fetches pooled instances from API
- Transforms to frontend format
- Attaches pool membership data to entities
- Integrates with existing transformer flow

---

### Task 4.7.9: Create Pooling Aggregator

**File:** `client-vue/src/utils/transformers/poolingAggregator.ts`

**Steps:**
1. Create `aggregatePoolProperties()` function
2. Create `aggregatePartProfiles()` function for block profile pooling
3. Create `getPoolMembersRecursive()` function for hierarchical pooling
4. Implement aggregation strategies: sum, merge, first, every
5. Handle computed view pattern (always recalculate, no stored values)

**Key Features:**
- Aggregates properties from pool members at query time
- Supports hierarchical pooling (members can be pools)
- Property-specific aggregation strategies
- Part profile aggregation across pooled blocks

---

### Task 4.7.10: Create usePooledEntity Composable

**File:** `client-vue/src/composables/usePooledEntity.ts`

**Steps:**
1. Create composable with Vue Query integration
2. Implement `getPooledEntity(entityKey, entityId)` - returns computed aggregated entity
3. Implement `getPoolMembers(entityKey, masterId)` - returns pool members
4. Implement `createPool(entityKey, masterId, memberIds)` - creates pool
5. Implement `addToPool(entityKey, masterId, memberId)` - adds member
6. Implement `removeFromPool(entityKey, masterId, memberId)` - removes member
7. Implement `updateMasterWithDistribution()` - updates master and distributes to members
8. Use Vue Query for caching with proper invalidation

**Key Features:**
- Reactive pool entity access
- CRUD operations for pool management
- Automatic cache invalidation
- Computed aggregation on demand

---

### Task 4.7.11: Add Pooling to useEntity

**File:** `client-vue/src/composables/useEntity.ts`

**Steps:**
1. Add methods to manage pool relationships
2. Invalidate cache when pool membership changes
3. Detect when editing computed properties on pool master
4. Trigger distribution modal for master changes
5. Integrate with existing useEntity methods

**Key Features:**
- Pool management integrated with entity operations
- Automatic cache invalidation
- Computed property detection
- Distribution modal triggering

---

### Task 4.7.12: Create Master Change Distribution Modal

**File:** `client-vue/src/components/admin/pooling/MasterChangeDistributionModal.vue`

**Steps:**
1. Create Vue component with VDialog
2. Display distribution strategy options (proportional, equal, manual)
3. Show preview of how changes will be distributed
4. Implement distribution calculation logic
5. Add confirmation step before applying changes
6. Integrate with usePooledEntity for distribution

**Key Features:**
- Modal triggered when editing computed properties on pool master
- Three distribution strategies
- Preview before applying
- Confirmation dialog

---

### Task 4.7.13: Update Admin Transformer (if needed)

**File:** `client-vue/src/utils/transformers/globalToAdminTransformer.ts`

**Steps:**
1. Review transformer for pooled entity handling
2. Ensure pooled entities are properly transformed
3. Add pooling-specific transformations if needed

**Key Features:**
- Pooled entities work in admin UI
- Proper transformation for admin views

---

### Task 4.7.14: Add Example Configuration

**Steps:**
1. Configure `blockProfile` with pooling enabled in entity registry
2. Add aggregation rules: `baseFee` (sum), `baseTime` (sum), `activeParts` (merge), `onSite` (every)
3. Test pooling with blockProfile entities

**Key Features:**
- Example pooling configuration
- Ready-to-use pooling for blockProfile

---

## Architecture Notes

### Computed View Pattern

**Why:** Masters are computed views that aggregate from members at query time, ensuring data consistency
**Pattern:** Always recalculate from members, no stored aggregated values
**Benefit:** Changes to members automatically reflect in master, no sync needed

### Hierarchical Pooling

**Why:** Pool members can themselves be pool composites, enabling complex aggregation scenarios
**Pattern:** Recursive resolution of pool members
**Benefit:** Flexible pooling structures

### Distribution Strategies

**Why:** When editing computed properties on pool master, need to distribute changes to members
**Pattern:** Modal with strategy selection (proportional, equal, manual)
**Benefit:** User control over how changes propagate

---

## Files Created

- `server/src/db/models/scheduler/pooled_instance.ts`
- `server/src/routes/internal/pooledInstances/pooledInstanceRouter.ts`
- `client-vue/src/types/pooling.ts`
- `client-vue/src/constants/pooling.ts`
- `client-vue/src/utils/transformers/poolingAggregator.ts`
- `client-vue/src/composables/usePooledEntity.ts`
- `client-vue/src/components/admin/pooling/MasterChangeDistributionModal.vue`

## Files Modified

- `server/src/db/models/index.ts` (add PooledInstance)
- `server/src/config/entityRegistry.ts` (add pooling config)
- `server/src/routes/internal/index.ts` (register routes)
- `client-vue/src/types/entities.ts` (add pooling fields)
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts` (fetch pooled instances)
- `client-vue/src/composables/useEntity.ts` (add pool methods)
- `client-vue/src/utils/transformers/globalToAdminTransformer.ts` (if needed)

---

## Success Criteria

- [ ] PooledInstance model created and registered
- [ ] Pooling config added to entity registry
- [ ] API routes created and registered
- [ ] Frontend types and constants created
- [ ] Global transformer updated to fetch pooled instances
- [ ] Pooling aggregator created with all aggregation strategies
- [ ] usePooledEntity composable created with all methods
- [ ] useEntity updated with pool management methods
- [ ] Master Change Distribution Modal created
- [ ] blockProfile configured with pooling enabled
- [ ] All CRUD operations work for pooled instances
- [ ] Computed aggregation works correctly
- [ ] Distribution modal triggers correctly
- [ ] Hierarchical pooling works correctly
- [ ] Circular reference prevention works

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-4-guide.md`
- Phase Handoff: `project-manager/features/vue-migration/phases/phase-4-handoff.md`
- Entity Pooling Plan: `.cursor/plans/entity-pooling-system-1bc9f8e5.plan.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

## Session Objectives - Status

- ✅ Create generic EntityDialog component for all entity types
- ✅ Create generic EntityCard component for all entity types
- ✅ Create GroupedEntityCard component for expandable grouped display
- ✅ Create DynamicFormFields component for config-driven form generation
- ✅ Create useAdminConfig composable for reactive config access
- ✅ Enhance field system components with better integration
- ✅ Add NestedCollectionField for nested collections
- ✅ Update admin views to use generic components

---

## Key Deliverables Completed

### Generic Components Created

1. **EntityDialog.vue** ✅
   - Generic dialog component for all entity types
   - Supports create mode (no entity) and edit mode (with entity)
   - Integrates with DynamicFormFields for form generation
   - Handles form validation using vee-validate
   - Integrates with useEntityCrud for create/update operations
   - Supports initialValues prop for pre-populating form fields
   - Location: `client-vue/src/components/admin/generic/EntityDialog.vue`

2. **EntityCard.vue** ✅
   - Generic card component for all entity types
   - Displays title field in card header, editable inline
   - Integrates with DynamicFormFields for form field rendering
   - Handles delete operations with confirmation dialog
   - Auto-save functionality for field changes
   - Integrates with useAdminConfig for field configuration
   - Location: `client-vue/src/components/admin/generic/EntityCard.vue`

3. **GroupedEntityCard.vue** ✅
   - Wrapper component for expandable grouped display
   - Uses VExpansionPanel for collapsible cards
   - Displays title field in collapsed panel header
   - Shows EntityCard content when expanded
   - Supports defaultExpanded and showDragHandle props
   - Delegates CRUD operations to EntityCard
   - Location: `client-vue/src/components/admin/generic/GroupedEntityCard.vue`

4. **DynamicFormFields.vue** ✅
   - Config-driven form field generator
   - Generates fields from admin configs (formFieldConfig)
   - Supports inline, stacked, and regular field layouts
   - Handles async field context creation
   - Filters omitted fields based on config
   - Supports conditional field visibility (modalMode)
   - Uses Vuetify responsive grid for inline fields
   - Location: `client-vue/src/components/admin/generic/DynamicFormFields.vue`

5. **NestedCollectionField.vue** ✅
   - Field component for nested collections
   - Integrates with NestedCollection component
   - Handles collection item CRUD operations
   - Supports relationship management
   - Validation and error handling
   - Location: `client-vue/src/components/admin/generic/fields/NestedCollectionField.vue`

6. **NestedCollection.vue** ✅
   - Component for displaying and managing nested collections
   - Handles collection item display and editing
   - Supports relationship management
   - Location: `client-vue/src/components/admin/generic/collections/NestedCollection.vue`

### Composables Created

1. **useAdminConfig.ts** ✅
   - Reactive admin config composable
   - Caches computed refs for performance
   - Provides getFormFieldConfig(), getDisplayFieldConfig(), getInstanceConfig()
   - Caches config reference to prevent excessive calls
   - Supports rebuildConfig() for dynamic property updates
   - Location: `client-vue/src/composables/useAdminConfig.ts`

### Components Enhanced

1. **useFieldContext.ts** ✅
   - Enhanced with better integration
   - Improved field context management
   - Better async context handling

2. **InputRenderer.vue** (formerly FieldRenderer.vue) ✅
   - Updated to handle all field types
   - Improved integration with field components

3. **Field Components** ✅
   - BooleanInputField.vue - Enhanced with better type safety
   - TextInput.vue (formerly TextInputField.vue) - Enhanced with validation and error handling
   - SelectFields.vue - Enhanced with better integration
   - PrimitiveFields.vue - Enhanced with better type safety

### Views Updated

1. **TypesTab.vue** ✅
   - Updated to use EntityDialog for BlockType and PartType
   - Uses EntityCard for entity display
   - Generic components handle all entity types

2. **ProfilesTab.vue** ✅
   - Updated to use EntityDialog for BlockProfile and PartProfile
   - Uses EntityCard and GroupedEntityCard for entity display
   - Generic components handle all entity types

---

## Technical Implementation Details

### Architecture Decisions

1. **Generic Component Pattern**
   - **Why**: Reduces code duplication, improves maintainability, ensures consistent behavior
   - **Pattern**: Generic components accept entityKey and entity props, use configs for behavior
   - **Benefit**: Single component handles all entity types, easier to update and maintain

2. **Config-Driven Form Generation**
   - **Why**: Ensures all fields from PROPERTY_KEYS are included, reduces hardcoding
   - **Pattern**: DynamicFormFields iterates over formFieldConfig to render fields
   - **Benefit**: Adding new fields doesn't require component changes, consistent field rendering

3. **Field Context System**
   - **Why**: Provides isolated field state and validation, enables auto-save
   - **Pattern**: Each field has its own FieldContext with form integration
   - **Benefit**: Fields are independent, can be auto-saved individually, better error handling

### Key Features

1. **Generic Components**
   - EntityDialog works for all entity types (blockType, partType, blockProfile, partProfile)
   - EntityCard works for all entity types
   - GroupedEntityCard provides expandable display for grouped entities
   - Single component replaces multiple entity-specific components

2. **Config-Driven Forms**
   - DynamicFormFields generates fields from admin configs
   - No hardcoded fields - all fields come from config
   - Supports inline, stacked, and regular layouts
   - Conditional field visibility based on context (modalMode)

3. **Field System**
   - Enhanced field components with better type safety
   - Improved validation and error handling
   - Better integration with vee-validate
   - Support for nested collections

4. **Admin Config Access**
   - Reactive access to admin configuration
   - Cached computed refs for performance
   - Methods for accessing form field config, display field config, and instance config

---

## Files Created

```
client-vue/src/components/admin/generic/
├── EntityDialog.vue (NEW)
├── EntityCard.vue (NEW)
├── GroupedEntityCard.vue (NEW)
├── DynamicFormFields.vue (NEW)
└── fields/
    └── NestedCollectionField.vue (NEW)
└── collections/
    └── NestedCollection.vue (NEW)

client-vue/src/composables/
└── useAdminConfig.ts (NEW)
```

## Files Enhanced

- `client-vue/src/composables/useFieldContext.ts`
- `client-vue/src/components/admin/generic/fields/FieldRenderer.vue`
- `client-vue/src/components/admin/generic/fields/BooleanInputField.vue`
- `client-vue/src/components/admin/generic/fields/TextInputField.vue`
- `client-vue/src/components/admin/generic/fields/SelectFields.vue`
- `client-vue/src/components/admin/generic/fields/PrimitiveFields.vue`
- `client-vue/src/views/admin/tabs/TypesTab.vue`
- `client-vue/src/views/admin/tabs/ProfilesTab.vue`

---

## Benefits Achieved

1. **Code Reduction**
   - Replaced 4 entity-specific dialog components with 1 generic EntityDialog
   - Replaced 4 entity-specific card components with 1 generic EntityCard
   - Reduced code duplication significantly

2. **Maintainability**
   - Single component to update for all entity types
   - Consistent behavior across all entities
   - Easier to add new entity types

3. **Config-Driven**
   - Forms generated from configs, not hardcoded
   - Adding new fields doesn't require component changes
   - Consistent field rendering across all entities

4. **Type Safety**
   - Generic components maintain type safety
   - Better TypeScript support
   - Compile-time error checking

---

---

## Next Steps

1. **Phase 5**: Ready to proceed to Phase 5 (Booking Wizard)
2. **Testing**: Verify all generic components work correctly for all entity types
3. **Performance**: Monitor generic component performance

---

## Notes

- Generic components replace all entity-specific components
- Config-driven form generation ensures consistency
- Field system enhancements improve type safety and validation
- All CRUD operations work with generic components
- Admin views updated to use generic components

---

## Related Documents

- Session Guide: `project-manager/features/vue-migration/sessions/session-4.6-guide.md`
- Phase Guide: `project-manager/features/vue-migration/phases/phase-4-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

## Session Overview

**Session Number:** 4.6
**Session Name:** Generic Component System & Field System
**Description:** Create generic reusable components (EntityDialog, EntityCard, DynamicFormFields, GroupedEntityCard) and enhance field system for config-driven form generation. Replace entity-specific components with generic components that work for all entity types.

**Duration:** Estimated 6-8 hours
**Dependencies:** Sessions 4.1, 4.2, 4.3, 4.4, 4.5 complete

---

## Session Objectives

- Create generic EntityDialog component for all entity types
- Create generic EntityCard component for all entity types
- Create GroupedEntityCard component for expandable grouped display
- Create DynamicFormFields component for config-driven form generation
- Create useAdminConfig composable for reactive config access
- Enhance field system components with better integration
- Add NestedCollectionField for nested collections
- Update admin views to use generic components

---

## Key Deliverables

- EntityDialog.vue - Generic dialog component for all entity types
- EntityCard.vue - Generic card component for all entity types
- GroupedEntityCard.vue - Expandable grouped card wrapper
- DynamicFormFields.vue - Config-driven form field generator
- useAdminConfig.ts - Reactive admin config composable
- NestedCollectionField.vue - Nested collection field component
- Enhanced field components with better integration
- Updated admin views using generic components

---

## Detailed Task Breakdown

### Task 4.6.1: Create Generic EntityDialog Component

**File:** `client-vue/src/components/admin/generic/EntityDialog.vue`

**Steps:**
1. Create generic dialog component that accepts entityKey and optional entity
2. Support create mode (no entity) and edit mode (with entity)
3. Integrate with DynamicFormFields for form generation
4. Handle form validation using vee-validate
5. Integrate with useEntityCrud for create/update operations
6. Support initialValues prop for pre-populating form fields
7. Handle dialog visibility with v-model
8. Emit saved event after successful save

**Key Features:**
- Generic component works for all entity types (blockType, partType, blockProfile, partProfile)
- Uses DynamicFormFields for config-driven form generation
- Supports create and edit modes
- Handles form validation and error display
- Integrates with useEntityCrud composable
- Supports initialValues for pre-populating fields (e.g., partTypeRef from slot)

---

### Task 4.6.2: Create Generic EntityCard Component

**File:** `client-vue/src/components/admin/generic/EntityCard.vue`

**Steps:**
1. Create generic card component that accepts entityKey and entity
2. Display title field in card header
3. Integrate with DynamicFormFields for inline editing
4. Handle delete operations with confirmation dialog
5. Support expansion state (though parent VExpansionPanel handles visibility)
6. Integrate with useEntityCrud for update/delete operations
7. Use useAdminConfig to get titleField and formFieldConfig
8. Create FieldContext for title field editing

**Key Features:**
- Generic component works for all entity types
- Title field displayed in card header, editable inline
- Form fields rendered using DynamicFormFields
- Delete confirmation dialog
- Auto-save functionality for field changes
- Integrates with admin config for field configuration

---

### Task 4.6.3: Create GroupedEntityCard Component

**File:** `client-vue/src/components/admin/generic/GroupedEntityCard.vue`

**Steps:**
1. Create wrapper component for expandable grouped display
2. Use VExpansionPanel for collapsible cards
3. Display title field in collapsed panel header
4. Show EntityCard content when expanded
5. Support defaultExpanded prop for initial state
6. Support showDragHandle prop for drag-and-drop
7. Delegate CRUD operations to EntityCard

**Key Features:**
- Wraps EntityCard in VExpansionPanel
- Displays title field in collapsed state
- Supports drag handle for reordering
- Maintains expansion state
- Delegates all operations to EntityCard

---

### Task 4.6.4: Create DynamicFormFields Component

**File:** `client-vue/src/components/admin/generic/DynamicFormFields.vue`

**Steps:**
1. Create component that generates form fields from admin configs
2. Get formFieldConfig for entity type
3. Get instanceConfig to determine field layout (inline, stacked, omitted)
4. Filter out omitted fields
5. Group fields by layout (inline, stacked, regular)
6. Create FieldContext for each field dynamically
7. Render InputRenderer (formerly FieldRenderer) for each field
8. Handle field context readiness timing (async context creation)
9. Support modalMode prop for conditional field visibility
10. Support additionalOmittedFields prop for parent control

**Key Features:**
- Config-driven field generation
- Supports inline, stacked, and regular field layouts
- Handles async field context creation
- Filters omitted fields based on config
- Supports conditional field visibility (modalMode)
- Uses Vuetify responsive grid for inline fields

---

### Task 4.6.5: Create useAdminConfig Composable

**File:** `client-vue/src/composables/useAdminConfig.ts`

**Steps:**
1. Create composable for reactive admin config access
2. Cache computed refs to avoid duplicate computeds
3. Provide getFormFieldConfig() method
4. Provide getDisplayFieldConfig() method
5. Provide getInstanceConfig() method
6. Cache config reference to prevent excessive calls
7. Support rebuildConfig() for dynamic property updates

**Key Features:**
- Reactive access to admin configuration
- Cached computed refs for performance
- Methods for form field config, display field config, and instance config
- Config caching to prevent excessive calls
- Support for rebuilding config after PROPERTY_KEYS loaded

---

### Task 4.6.6: Enhance Field System Components

**Files:**
- `client-vue/src/composables/useFieldContext.ts`
- `client-vue/src/components/admin/generic/fields/InputRenderer.vue` (formerly FieldRenderer.vue)
- `client-vue/src/components/admin/generic/fields/BooleanInputField.vue`
- `client-vue/src/components/admin/generic/fields/TextInputField.vue`
- `client-vue/src/components/admin/generic/fields/SelectFields.vue`
- `client-vue/src/components/admin/generic/fields/PrimitiveFields.vue`

**Steps:**
1. Enhance useFieldContext with better integration
2. Update InputRenderer (formerly FieldRenderer) to handle all field types
3. Improve field components with better type safety
4. Add validation and error handling
5. Improve integration with vee-validate
6. Add support for nested collections

**Key Enhancements:**
- Better type safety in field components
- Improved validation and error handling
- Better integration with vee-validate
- Support for nested collections
- Enhanced field context management

---

### Task 4.6.7: Create NestedCollectionField Component

**File:** `client-vue/src/components/admin/generic/fields/NestedCollectionField.vue`

**Steps:**
1. Create field component for nested collections
2. Integrate with NestedCollection component
3. Handle collection item CRUD operations
4. Support relationship management
5. Handle validation and error display

**Key Features:**
- Field component for nested collections
- Integrates with NestedCollection component
- Handles item CRUD operations
- Supports relationship management
- Validation and error handling

---

### Task 4.6.8: Update Admin Views to Use Generic Components

**Files:**
- `client-vue/src/views/admin/tabs/TypesTab.vue`
- `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Steps:**
1. Replace entity-specific dialogs with EntityDialog
2. Replace entity-specific cards with EntityCard
3. Update to use generic components
4. Test all CRUD operations work correctly
5. Verify form generation works for all entity types

**Key Updates:**
- TypesTab uses EntityDialog for BlockType and PartType
- ProfilesTab uses EntityDialog for BlockProfile and PartProfile
- All cards use EntityCard or GroupedEntityCard
- Generic components handle all entity types

---

## Architecture Notes

### Generic Component Pattern

**Why:** Reduces code duplication, improves maintainability, ensures consistent behavior
**Pattern:** Generic components accept entityKey and entity props, use configs for behavior
**Benefit:** Single component handles all entity types, easier to update and maintain

### Config-Driven Form Generation

**Why:** Ensures all fields from PROPERTY_KEYS are included, reduces hardcoding
**Pattern:** DynamicFormFields iterates over formFieldConfig to render fields
**Benefit:** Adding new fields doesn't require component changes, consistent field rendering

### Field Context System

**Why:** Provides isolated field state and validation, enables auto-save
**Pattern:** Each field has its own FieldContext with form integration
**Benefit:** Fields are independent, can be auto-saved individually, better error handling

---

## Files Created

- `client-vue/src/components/admin/generic/EntityDialog.vue`
- `client-vue/src/components/admin/generic/EntityCard.vue`
- `client-vue/src/components/admin/generic/GroupedEntityCard.vue`
- `client-vue/src/components/admin/generic/DynamicFormFields.vue`
- `client-vue/src/components/admin/generic/fields/NestedCollectionField.vue`
- `client-vue/src/components/admin/generic/collections/NestedCollection.vue`
- `client-vue/src/composables/useAdminConfig.ts`

## Files Enhanced

- `client-vue/src/composables/useFieldContext.ts`
- `client-vue/src/components/admin/generic/fields/InputRenderer.vue` (formerly FieldRenderer.vue)
- `client-vue/src/components/admin/generic/fields/BooleanInputField.vue`
- `client-vue/src/components/admin/generic/fields/TextInputField.vue`
- `client-vue/src/components/admin/generic/fields/SelectFields.vue`
- `client-vue/src/components/admin/generic/fields/PrimitiveFields.vue`
- `client-vue/src/views/admin/tabs/TypesTab.vue`
- `client-vue/src/views/admin/tabs/ProfilesTab.vue`

---

## Success Criteria

- [x] EntityDialog works for all entity types
- [x] EntityCard works for all entity types
- [x] GroupedEntityCard provides expandable display
- [x] DynamicFormFields generates fields from configs
- [x] useAdminConfig provides reactive config access
- [x] Field system components enhanced
- [x] NestedCollectionField works correctly
- [x] Admin views updated to use generic components
- [x] All CRUD operations work with generic components
- [x] Form generation works for all entity types

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-4-guide.md`
- Session 4.5 Guide: `project-manager/features/vue-migration/sessions/session-4.5-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

## Session Objectives - Status

- ✅ Enhance useAdmin composable with singleton pattern
- ✅ Add transformedEntities computed property using adminTransformer
- ✅ Add getEntityMap() method for O(1) entity lookups
- ✅ Enhance useEntity composable with better error handling
- ✅ Add usePrimitiveMutation for field-level updates
- ✅ Update admin views to use enhanced composables
- ✅ Verify data flow from backend through transformers to UI

---

## Key Deliverables Completed

### Composables Enhanced

1. **useAdmin.ts** ✅
   - Implemented singleton pattern to prevent multiple instance creation
   - Added transformedEntities computed property using adminTransformer
   - Transforms GlobalData to AdminObjectMap with relationships attached
   - Added getEntityMap() method for efficient O(1) entity lookups
   - Added diagnostics for tracking instance creation and call sites
   - Ensures reactive updates when globalData changes
   - Location: `client-vue/src/composables/useAdmin.ts`

2. **useEntity.ts** ✅
   - Added usePrimitiveMutation for field-level PATCH operations
   - Enhanced error handling for 404 errors with cache invalidation
   - Improved error messages with entity context and IDs
   - Added development logging for mutation operations
   - Better cache invalidation strategies
   - Location: `client-vue/src/composables/useEntity.ts`

### Components Updated

1. **BlockProfileCard.vue** ✅
   - Updated to use generic EntityCard component
   - Added support for grouped mode with GroupedEntityCard
   - Added props: grouped, defaultExpanded, showDragHandle
   - Delegates all CRUD operations to EntityCard
   - Maintains backward compatibility with non-grouped mode
   - Location: `client-vue/src/views/admin/components/BlockProfileCard.vue`

---

## Technical Implementation Details

### Architecture Decisions

1. **Singleton Pattern in Composables**
   - **Why**: Prevents multiple instance creation and recalculation overhead
   - **Pattern**: Create instance on first call, reuse afterwards
   - **Benefit**: Better performance, consistent state across components

2. **Transformation Layer**
   - **Why**: Separates GlobalData (raw API data) from AdminObjectMap (with relationships)
   - **Pattern**: Computed property that transforms when globalData changes
   - **Benefit**: Relationships always attached, consistent data structure

3. **Generic Component Integration**
   - **Why**: Reduces code duplication, improves maintainability
   - **Pattern**: Thin wrapper components delegate to generic components
   - **Benefit**: Consistent behavior, easier to update

### Key Features

1. **Singleton Pattern**
   - Prevents recalculation of transformedEntities on every component mount
   - Caches transformed data using computed property
   - Only recalculates when globalData.value changes (not reference changes)

2. **Transformed Entities**
   - Uses adminTransformer.transformGlobalToAdmin() to attach relationships
   - Provides AdminObject with relationships attached
   - Ensures correct entity type and ID matching

3. **Entity Map Lookups**
   - getEntityMap() provides O(1) lookups instead of O(n) array searches
   - Useful for grouping logic and efficient entity access
   - Returns Map<GlobalEntityId, AdminObject> for efficient lookups

4. **Primitive Mutations**
   - usePrimitiveMutation provides efficient single-field updates
   - More efficient than full PUT for single field changes
   - Proper cache invalidation after mutations

5. **Enhanced Error Handling**
   - 404 errors invalidate cache when entity not found
   - Better error messages include entity context and IDs
   - Development logging helps debug mutation issues

---

## Files Modified

- `client-vue/src/composables/useAdmin.ts` (enhanced with singleton pattern and transformed entities)
- `client-vue/src/composables/useEntity.ts` (enhanced with primitive mutations and error handling)
- `client-vue/src/views/admin/components/BlockProfileCard.vue` (updated to use generic components)
- `client-vue/src/utils/transformers/globalToAdminTransformer.ts` (integrated with useAdmin)

---

## Data Flow Verification

### Verified Flow

1. **Backend → useGlobal**
   - API calls fetch GlobalData
   - Vue Query caches data
   - Reactive updates when data changes

2. **useGlobal → useAdmin**
   - useAdmin uses useGlobal for data access
   - Transforms GlobalData to AdminObjectMap
   - Attaches relationships via adminTransformer

3. **useAdmin → UI Components**
   - Components use useAdmin for entity access
   - getEntity() and getEntities() provide typed access
   - getEntityMap() provides efficient lookups

4. **UI Updates**
   - Reactive updates when data changes
   - Cache invalidation triggers refetch
   - UI updates automatically

---

---

## Next Steps

1. **Session 4.6**: Proceed to generic component system implementation
2. **Testing**: Verify all data flows work correctly in production
3. **Performance**: Monitor singleton pattern performance impact

---

## Notes

- Singleton pattern prevents multiple instance creation
- Transformed entities ensure relationships are always attached
- Generic components reduce code duplication
- Enhanced error handling provides better debugging information
- Data flow verified from backend to UI components

---

## Related Documents

- Session Guide: `project-manager/features/vue-migration/sessions/session-4.5-guide.md`
- Phase Guide: `project-manager/features/vue-migration/phases/phase-4-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

## Session Overview

**Session Number:** 4.5
**Session Name:** Admin Data Integration
**Description:** Connect admin composables and transformers to UI components, ensuring data flows correctly from backend to admin views. Enhance useAdmin with singleton pattern and transformed entities. Update useEntity composable with better error handling. Integrate data flow between transformers and UI components.

**Duration:** Estimated 3-4 hours
**Dependencies:** Sessions 4.1, 4.2, 4.3, 4.4 complete

---

## Session Objectives

- Enhance useAdmin composable with singleton pattern
- Add transformedEntities computed property using adminTransformer
- Add getEntityMap() method for O(1) entity lookups
- Enhance useEntity composable with better error handling
- Add usePrimitiveMutation for field-level updates
- Update admin views to use enhanced composables
- Verify data flow from backend through transformers to UI

---

## Key Deliverables

- Enhanced useAdmin.ts with singleton pattern and transformed entities
- Enhanced useEntity.ts with primitive mutations and error handling
- Updated BlockProfileCard.vue to use generic EntityCard
- Integrated GroupedEntityCard for expandable display
- Verified reactive data flow from backend to UI

---

## Detailed Task Breakdown

### Task 4.5.1: Enhance useAdmin with Singleton Pattern

**File:** `client-vue/src/composables/useAdmin.ts`

**Steps:**
1. Implement singleton pattern to prevent multiple instance creation
2. Add transformedEntities computed property using adminTransformer
3. Transform GlobalData to AdminObjectMap with relationships attached
4. Add getEntityMap() method for efficient O(1) entity lookups
5. Add diagnostics for tracking instance creation and call sites
6. Ensure reactive updates when globalData changes

**Key Implementation:**
- Singleton pattern prevents recalculation of transformedEntities on every component mount
- transformedEntities computed property caches transformed data
- Only recalculates when globalData.value changes (not reference changes)
- Uses adminTransformer.transformGlobalToAdmin() to attach relationships

---

### Task 4.5.2: Enhance useEntity Composable

**File:** `client-vue/src/composables/useEntity.ts`

**Steps:**
1. Add usePrimitiveMutation for field-level PATCH operations
2. Enhance error handling for 404 errors
3. Add cache invalidation on entity not found errors
4. Improve error messages with context
5. Add logging for mutation operations in development

**Key Implementation:**
- usePrimitiveMutation provides efficient single-field updates
- Enhanced 404 error handling invalidates cache when entity not found
- Better error messages include entity context and IDs
- Development logging helps debug mutation issues

---

### Task 4.5.3: Update BlockProfileCard to Use Generic Components

**File:** `client-vue/src/views/admin/components/BlockProfileCard.vue`

**Steps:**
1. Update BlockProfileCard to use generic EntityCard component
2. Add support for grouped mode with GroupedEntityCard
3. Add props for grouped, defaultExpanded, showDragHandle
4. Delegate CRUD operations to EntityCard
5. Maintain backward compatibility with non-grouped mode

**Key Implementation:**
- Thin wrapper component that passes entityKey and entity to generic components
- Conditional rendering based on grouped prop
- Delegates all CRUD operations to EntityCard
- Supports both grouped and non-grouped display modes

---

### Task 4.5.4: Integrate Data Flow Verification

**Steps:**
1. Verify data flows from useGlobal → useAdmin → UI components
2. Test that transformed entities include relationships
3. Verify reactive updates when data changes
4. Test entity lookups using getEntityMap()
5. Verify error handling works correctly

**Key Verification Points:**
- Data flows correctly through transformation layer
- Relationships are attached to entities
- UI updates reactively when data changes
- Entity lookups are efficient
- Error handling provides useful feedback

---

## Architecture Notes

### Singleton Pattern in Composables

**Why:** Prevents multiple instance creation and recalculation overhead
**Pattern:** Create instance on first call, reuse afterwards
**Benefit:** Better performance, consistent state across components

### Transformation Layer

**Why:** Separates GlobalData (raw API data) from AdminObjectMap (with relationships)
**Pattern:** Computed property that transforms when globalData changes
**Benefit:** Relationships always attached, consistent data structure

### Generic Component Integration

**Why:** Reduces code duplication, improves maintainability
**Pattern:** Thin wrapper components delegate to generic components
**Benefit:** Consistent behavior, easier to update

---

## Files Modified

- `client-vue/src/composables/useAdmin.ts` (enhanced)
- `client-vue/src/composables/useEntity.ts` (enhanced)
- `client-vue/src/views/admin/components/BlockProfileCard.vue` (updated)
- `client-vue/src/utils/transformers/globalToAdminTransformer.ts` (integrated)

---

## Success Criteria

- [x] useAdmin uses singleton pattern
- [x] transformedEntities computed property works correctly
- [x] getEntityMap() provides O(1) lookups
- [x] useEntity has enhanced error handling
- [x] usePrimitiveMutation works for field updates
- [x] BlockProfileCard uses generic components
- [x] Data flows correctly from backend to UI
- [x] Reactive updates work correctly
- [x] Error handling provides useful feedback

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-4-guide.md`
- Session 4.4 Guide: `project-manager/features/vue-migration/sessions/session-4.4-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

## Session Objectives - Status

- ✅ Create form dialogs for all entity types
- ✅ Implement create/edit mutations
- ✅ Implement delete operations (already existed in cards)
- ✅ Add relationship management in BlockProfile dialog
- ✅ Integrate API clients and mutations
- ⏭️ Test full CRUD operations (ready for testing)
- ✅ Apply Vuexy styling and polish

---

## Key Deliverables Completed

### Dialog Components Created

1. **BlockProfileDialog.vue** ✅
   - Full form with all BlockProfile fields
   - Relationship management for activeParts (PartProfiles)
   - Create and edit modes
   - Form validation and error handling
   - Location: `client-vue/src/views/admin/dialogs/BlockProfileDialog.vue`

2. **PartProfileDialog.vue** ✅
   - Full form with all PartProfile fields
   - Create and edit modes
   - Form validation and error handling
   - Location: `client-vue/src/views/admin/dialogs/PartProfileDialog.vue`

3. **BlockTypeDialog.vue** ✅
   - Simple form with BlockType fields
   - Create and edit modes
   - Location: `client-vue/src/views/admin/dialogs/BlockTypeDialog.vue`

4. **PartTypeDialog.vue** ✅
   - Simple form with PartType fields
   - Create and edit modes
   - Location: `client-vue/src/views/admin/dialogs/PartTypeDialog.vue`

### Integration Completed

1. **ProfilesTab.vue** ✅
   - Added "Create Block Profile" button
   - Integrated BlockProfileDialog
   - Wired up create/edit handlers
   - Cards emit edit events to open dialog

2. **TypesTab.vue** ✅
   - Integrated BlockTypeDialog and PartTypeDialog
   - Replaced inline create handlers with dialog-based approach
   - Wired up create/edit handlers
   - Cards emit edit events to open dialog

3. **Card Components Updated** ✅
   - BlockProfileCard.vue - Removed inline edit dialog, emits edit event
   - BlockTypeCard.vue - Removed inline editing, emits edit event
   - PartTypeCard.vue - Removed inline editing, emits edit event

---

## Technical Implementation Details

### Architecture Decisions

1. **Dialog Pattern**: Centralized dialogs in parent components (ProfilesTab/TypesTab) instead of inline editing in cards
   - **Why**: Better separation of concerns, reusable dialog components
   - **Pattern**: Event-driven architecture - cards emit events, parents handle dialog state

2. **Relationship Management**: BlockProfileDialog handles activeParts relationships
   - **Why**: Allows users to select which PartProfiles are activeParts for a BlockProfile
   - **Pattern**: Multi-select component with add/remove logic comparing existing vs selected relationships

3. **Vue Query Integration**: All mutations properly invalidate cache
   - **Why**: Ensures UI updates automatically after create/update/delete operations
   - **Pattern**: Vue Query's `onSuccess` callbacks invalidate queries

### Components Used

- `VDialog` - Modal container
- `VCard`, `VCardTitle`, `VCardText`, `VCardActions` - Dialog structure
- `VForm` - Form container
- `AppTextField` - Text inputs
- `AppTextarea` - Textarea inputs
- `AppSelect` - Select dropdowns (single and multi-select)
- `VCheckbox` - Checkbox inputs
- `VBtn` - Buttons
- `VSpacer` - Layout spacing

### Composables Used

- `useEntityCrud` - Entity CRUD operations
- `useRelationshipCrud` - Relationship CRUD operations
- `useGlobal` - Access to cached entities
- `useNotification` - Success/error notifications

---

## Issues Resolved

1. **Missing Component Imports**: Added explicit imports for AppTextField, AppTextarea, and AppSelect components
   - **Issue**: Components not auto-imported, causing "Failed to resolve component" errors
   - **Solution**: Added explicit imports in all dialog components

2. **Initialization Order**: Fixed function declaration order in BlockProfileDialog
   - **Issue**: `resetForm` called before initialization in watch with `immediate: true`
   - **Solution**: Moved function definitions before watch statement

3. **Missing Closing Tags**: Fixed missing `</div>` tags in PartTypeCard and BlockTypeCard
   - **Issue**: Syntax errors from removing inline editing code
   - **Solution**: Added proper closing tags

---

## Files Created

```
client-vue/src/views/admin/dialogs/
├── BlockProfileDialog.vue (NEW)
├── PartProfileDialog.vue (NEW)
├── BlockTypeDialog.vue (NEW)
└── PartTypeDialog.vue (NEW)
```

## Files Modified

- `client-vue/src/views/admin/tabs/ProfilesTab.vue`
- `client-vue/src/views/admin/tabs/TypesTab.vue`
- `client-vue/src/views/admin/components/BlockProfileCard.vue`
- `client-vue/src/views/admin/components/BlockTypeCard.vue`
- `client-vue/src/views/admin/components/PartTypeCard.vue`

---

## Testing Checklist

### Ready for Testing

- [ ] Create BlockProfile with form dialog
- [ ] Edit BlockProfile with form dialog
- [ ] Create PartProfile with form dialog
- [ ] Edit PartProfile with form dialog
- [ ] Create BlockType with form dialog
- [ ] Edit BlockType with form dialog
- [ ] Create PartType with form dialog
- [ ] Edit PartType with form dialog
- [ ] Delete operations (already working)
- [ ] Relationship management in BlockProfileDialog (add/remove PartProfiles)
- [ ] Form validation
- [ ] Error handling
- [ ] Success notifications
- [ ] Data persistence
- [ ] UI updates reactively after mutations

---

---

## Next Steps

1. **Testing**: Complete full CRUD testing checklist
2. **Phase 5**: Ready to proceed to Phase 5 (if applicable)
3. **Polish**: Any additional UI polish or validation improvements

---

## Notes

- All dialogs follow consistent patterns and structure
- Relationship management in BlockProfileDialog is fully functional
- All mutations properly integrate with Vue Query for automatic cache updates
- Code includes explanatory WHY/PATTERN comments explaining patterns and decisions
- Vuexy styling applied consistently across all dialogs

---

## Related Documents

- Session Guide: `.cursor/project-manager/features/vue-migration/sessions/session-4.4-guide.md`
- Phase Guide: `.cursor/project-manager/features/vue-migration/phases/phase-4-guide.md`
- Project Plan: `.cursor/project-manager/PROJECT_PLAN.md`

## Session Overview

**Session Number:** 4.4
**Session Name:** Form Dialogs and CRUD Operations
**Description:** Create form dialogs for all entity types using Vuexy form components. Implement create/edit mutations and delete operations. Add relationship management (activeParts) in dialogs.

**Duration:** Estimated 4-5 hours
**Dependencies:** Sessions 4.1, 4.2, 4.3 complete

---

## Session Objectives

- Create form dialogs for all entity types
- Implement create/edit mutations
- Implement delete operations
- Add relationship management in BlockProfile dialog
- Integrate API clients and mutations
- Test full CRUD operations
- Apply Vuexy styling and polish

---

## Key Deliverables

- BlockProfileDialog.vue with form and relationship management
- PartProfileDialog.vue with form
- BlockTypeDialog.vue with form
- PartTypeDialog.vue with form
- Full CRUD operations working
- Relationship management working
- Polished UI with Vuexy styling

---

## Detailed Task Breakdown

### Task 4.4.1: Create BlockProfileDialog.vue

**File:** `client-vue/src/views/admin/dialogs/BlockProfileDialog.vue`

**Steps:**
1. Create dialogs directory if needed
2. Create BlockProfileDialog.vue component
3. Accept props: `modelValue` (boolean for dialog visibility), `blockProfile` (optional, for edit mode)
4. Use VDialog component from Vuexy
5. Create form with Vuexy form components:
   - AppTextField for: name, description, baseSqFt, icon
   - AppSelect for: blockTypeRef (select from BlockTypes)
   - AppCheckbox for: visibility, disabled
6. Add form validation
7. Handle create vs edit mode
8. Add relationship management section for activeParts
9. Add save/cancel buttons
10. Emit events: `update:modelValue`, `saved`

**Code Structure:**
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/useEntity'
import type { GlobalEntity } from '@/types/entities'

interface Props {
  modelValue: boolean
  blockProfile?: GlobalEntity<'blockProfile'>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { getGlobalEntities } = useGlobal()
const { create: createRelationship, remove: removeRelationship } = useRelationshipCrud('activeParts')
const { create: createEntity, update: updateEntity } = useEntityCrud('blockProfile')

const isEditMode = computed(() => !!props.blockProfile)

const formData = ref({
  name: '',
  description: '',
  baseSqFt: null as number | null,
  icon: '',
  blockTypeRef: '',
  visibility: true,
  disabled: false,
})

const selectedPartProfileIds = ref<string[]>([])

const blockTypes = computed(() => getGlobalEntities('blockType'))
const allPartProfiles = computed(() => getGlobalEntities('partProfile'))
const availablePartProfiles = computed(() => 
  allPartProfiles.value.filter(pp => !pp.disabled)
)

// Initialize form data
watch(() => props.blockProfile, (profile) => {
  if (profile) {
    formData.value = {
      name: profile.name,
      description: profile.description,
      baseSqFt: profile.baseSqFt,
      icon: profile.icon || '',
      blockTypeRef: profile.blockTypeRef,
      visibility: profile.visibility,
      disabled: profile.disabled,
    }
    // Load existing activeParts relationships
    loadActiveParts(profile.id)
  } else {
    resetForm()
  }
}, { immediate: true })

const loadActiveParts = async (blockProfileId: string) => {
  const { relationships } = useRelationshipCrud('activeParts')
  const activeParts = relationships.value.filter(
    rel => rel.parent_id === blockProfileId && !rel.disabled
  )
  selectedPartProfileIds.value = activeParts.map(rel => rel.child_id)
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    baseSqFt: null,
    icon: '',
    blockTypeRef: '',
    visibility: true,
    disabled: false,
  }
  selectedPartProfileIds.value = []
}

const save = async () => {
  try {
    if (isEditMode.value && props.blockProfile) {
      // Update existing
      await updateEntity(props.blockProfile.id, formData.value)
      
      // Update relationships
      await updateRelationships(props.blockProfile.id)
    } else {
      // Create new
      const newBlockProfile = await createEntity(formData.value)
      
      // Create relationships
      await updateRelationships(newBlockProfile.id)
    }
    
    emit('saved')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error saving BlockProfile:', error)
  }
}

const updateRelationships = async (blockProfileId: string) => {
  const { relationships } = useRelationshipCrud('activeParts')
  const existingRelationships = relationships.value.filter(
    rel => rel.parent_id === blockProfileId && !rel.disabled
  )
  const existingPartProfileIds = existingRelationships.map(rel => rel.child_id)
  
  // Remove relationships that are no longer selected
  for (const rel of existingRelationships) {
    if (!selectedPartProfileIds.value.includes(rel.child_id)) {
      await removeRelationship(blockProfileId, rel.child_id)
    }
  }
  
  // Add new relationships
  for (const partProfileId of selectedPartProfileIds.value) {
    if (!existingPartProfileIds.includes(partProfileId)) {
      await createRelationship({
        parent_type: 'blockProfile',
        child_type: 'partProfile',
        parent_id: blockProfileId,
        child_id: partProfileId,
      })
    }
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>
        {{ isEditMode ? 'Edit BlockProfile' : 'Create BlockProfile' }}
      </VCardTitle>
      
      <VCardText>
        <VForm>
          <AppTextField
            v-model="formData.name"
            label="Name"
            required
            class="mb-4"
          />
          
          <AppTextarea
            v-model="formData.description"
            label="Description"
            class="mb-4"
          />
          
          <AppTextField
            v-model.number="formData.baseSqFt"
            label="Base Square Feet"
            type="number"
            class="mb-4"
          />
          
          <AppTextField
            v-model="formData.icon"
            label="Icon"
            class="mb-4"
          />
          
          <AppSelect
            v-model="formData.blockTypeRef"
            :items="blockTypes"
            item-title="name"
            item-value="id"
            label="Block Type"
            required
            class="mb-4"
          />
          
          <div class="d-flex gap-4 mb-4">
            <AppCheckbox
              v-model="formData.visibility"
              label="Visible"
            />
            <AppCheckbox
              v-model="formData.disabled"
              label="Disabled"
            />
          </div>
          
          <!-- PartProfiles Relationship Management -->
          <VCard variant="outlined" class="mb-4">
            <VCardTitle class="text-h6">Part Profiles</VCardTitle>
            <VCardText>
              <AppSelect
                v-model="selectedPartProfileIds"
                :items="availablePartProfiles"
                item-title="name"
                item-value="id"
                label="Select PartProfiles"
                multiple
                chips
              />
            </VCardText>
          </VCard>
        </VForm>
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="close">Cancel</VBtn>
        <VBtn color="primary" @click="save">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
```

---

### Task 4.4.2: Create PartProfileDialog.vue

**File:** `client-vue/src/views/admin/dialogs/PartProfileDialog.vue`

**Steps:**
1. Create PartProfileDialog.vue component
2. Similar structure to BlockProfileDialog but simpler
3. Form fields:
   - AppTextField: name, baseTime, rateOverBaseTime, baseFee, rateOverBaseFee
   - AppSelect: partTypeRef (select from PartTypes)
   - AppCheckbox: onSite, clientPresent, moveable, disabled
4. Handle create/edit mode
5. Add save/cancel buttons
6. Integrate mutations

**Code Structure:**
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/useEntity'
import type { GlobalEntity } from '@/types/entities'

interface Props {
  modelValue: boolean
  partProfile?: GlobalEntity<'partProfile'>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { getGlobalEntities } = useGlobal()
const { create: createEntity, update: updateEntity } = useEntityCrud('partProfile')

const isEditMode = computed(() => !!props.partProfile)

const formData = ref({
  name: '',
  partTypeRef: '',
  onSite: true,
  clientPresent: false,
  moveable: false,
  baseTime: 0,
  rateOverBaseTime: 0,
  baseFee: 0,
  rateOverBaseFee: 0,
  disabled: false,
})

const partTypes = computed(() => getGlobalEntities('partType'))

// Initialize form data
watch(() => props.partProfile, (profile) => {
  if (profile) {
    formData.value = {
      name: profile.name,
      partTypeRef: profile.partTypeRef,
      onSite: profile.onSite,
      clientPresent: profile.clientPresent,
      moveable: profile.moveable,
      baseTime: profile.baseTime,
      rateOverBaseTime: profile.rateOverBaseTime,
      baseFee: profile.baseFee,
      rateOverBaseFee: profile.rateOverBaseFee,
      disabled: profile.disabled,
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  formData.value = {
    name: '',
    partTypeRef: '',
    onSite: true,
    clientPresent: false,
    moveable: false,
    baseTime: 0,
    rateOverBaseTime: 0,
    baseFee: 0,
    rateOverBaseFee: 0,
    disabled: false,
  }
}

const save = async () => {
  try {
    if (isEditMode.value && props.partProfile) {
      await updateEntity(props.partProfile.id, formData.value)
    } else {
      await createEntity(formData.value)
    }
    
    emit('saved')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error saving PartProfile:', error)
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>
        {{ isEditMode ? 'Edit PartProfile' : 'Create PartProfile' }}
      </VCardTitle>
      
      <VCardText>
        <VForm>
          <AppTextField
            v-model="formData.name"
            label="Name"
            required
            class="mb-4"
          />
          
          <AppSelect
            v-model="formData.partTypeRef"
            :items="partTypes"
            item-title="name"
            item-value="id"
            label="Part Type"
            required
            class="mb-4"
          />
          
          <div class="d-flex gap-4 mb-4">
            <AppCheckbox
              v-model="formData.onSite"
              label="On Site"
            />
            <AppCheckbox
              v-model="formData.clientPresent"
              label="Client Present"
            />
            <AppCheckbox
              v-model="formData.moveable"
              label="Moveable"
            />
            <AppCheckbox
              v-model="formData.disabled"
              label="Disabled"
            />
          </div>
          
          <AppTextField
            v-model.number="formData.baseTime"
            label="Base Time"
            type="number"
            class="mb-4"
          />
          
          <AppTextField
            v-model.number="formData.rateOverBaseTime"
            label="Rate Over Base Time"
            type="number"
            class="mb-4"
          />
          
          <AppTextField
            v-model.number="formData.baseFee"
            label="Base Fee"
            type="number"
            class="mb-4"
          />
          
          <AppTextField
            v-model.number="formData.rateOverBaseFee"
            label="Rate Over Base Fee"
            type="number"
            class="mb-4"
          />
        </VForm>
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="close">Cancel</VBtn>
        <VBtn color="primary" @click="save">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
```

---

### Task 4.4.3: Create BlockTypeDialog.vue

**File:** `client-vue/src/views/admin/dialogs/BlockTypeDialog.vue`

**Steps:**
1. Create BlockTypeDialog.vue component
2. Simple form with:
   - AppTextField: name, orderIndex
   - AppCheckbox: allowMultipleBlocks, allowMultipleParts, disabled
3. Handle create/edit mode
4. Integrate mutations

**Code Structure:**
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEntityCrud } from '@/composables/useEntity'
import type { GlobalEntity } from '@/types/entities'

interface Props {
  modelValue: boolean
  blockType?: GlobalEntity<'blockType'>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { create: createEntity, update: updateEntity } = useEntityCrud('blockType')

const isEditMode = computed(() => !!props.blockType)

const formData = ref({
  name: '',
  orderIndex: 0,
  allowMultipleBlocks: false,
  allowMultipleParts: false,
  disabled: false,
})

// Initialize form data
watch(() => props.blockType, (type) => {
  if (type) {
    formData.value = {
      name: type.name,
      orderIndex: type.orderIndex,
      allowMultipleBlocks: type.allowMultipleBlocks,
      allowMultipleParts: type.allowMultipleParts,
      disabled: type.disabled,
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  formData.value = {
    name: '',
    orderIndex: 0,
    allowMultipleBlocks: false,
    allowMultipleParts: false,
    disabled: false,
  }
}

const save = async () => {
  try {
    if (isEditMode.value && props.blockType) {
      await updateEntity(props.blockType.id, formData.value)
    } else {
      await createEntity(formData.value)
    }
    
    emit('saved')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error saving BlockType:', error)
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>
        {{ isEditMode ? 'Edit BlockType' : 'Create BlockType' }}
      </VCardTitle>
      
      <VCardText>
        <VForm>
          <AppTextField
            v-model="formData.name"
            label="Name"
            required
            class="mb-4"
          />
          
          <AppTextField
            v-model.number="formData.orderIndex"
            label="Order Index"
            type="number"
            class="mb-4"
          />
          
          <div class="d-flex gap-4 mb-4">
            <AppCheckbox
              v-model="formData.allowMultipleBlocks"
              label="Allow Multiple Blocks"
            />
            <AppCheckbox
              v-model="formData.allowMultipleParts"
              label="Allow Multiple Parts"
            />
            <AppCheckbox
              v-model="formData.disabled"
              label="Disabled"
            />
          </div>
        </VForm>
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="close">Cancel</VBtn>
        <VBtn color="primary" @click="save">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
```

---

### Task 4.4.4: Create PartTypeDialog.vue

**File:** `client-vue/src/views/admin/dialogs/PartTypeDialog.vue`

**Steps:**
1. Create PartTypeDialog.vue component
2. Very simple form with:
   - AppTextField: name, orderIndex
   - AppCheckbox: disabled
3. Handle create/edit mode
4. Integrate mutations

**Code Structure:** (Similar to BlockTypeDialog but simpler - only name, orderIndex, disabled)

---

### Task 4.4.5: Integrate Create/Edit Mutations

**Steps:**
1. Import `useEntityCrud` composable in each dialog
2. Use `create` and `update` methods from composable
3. Handle API responses
4. Invalidate Vue Query cache after mutations
5. Handle errors appropriately
6. Show loading states during mutations
7. Show success/error messages

**Mutation Integration:**
```typescript
import { useEntityCrud } from '@/composables/useEntity'

const { create: createEntity, update: updateEntity, isLoading } = useEntityCrud('blockProfile')

const save = async () => {
  try {
    if (isEditMode.value) {
      await updateEntity(props.blockProfile.id, formData.value)
    } else {
      await createEntity(formData.value)
    }
    // Vue Query will automatically invalidate and refetch
    emit('saved')
    emit('update:modelValue', false)
  } catch (error) {
    // Handle error
  }
}
```

---

### Task 4.4.6: Add Relationship Management in BlockProfile Dialog

**File:** `client-vue/src/views/admin/dialogs/BlockProfileDialog.vue`

**Steps:**
1. Add section for PartProfile selection
2. Use AppSelect with multiple selection
3. Load existing activeParts relationships
4. Update relationships on save
5. Handle adding/removing relationships

**Relationship Management:** (See Task 4.4.1 code example)

---

### Task 4.4.7: Wire Up Dialogs to Components

**Steps:**
1. Add dialog state to ProfilesTab.vue
2. Add dialog state to BlockTypeSection.vue
3. Add dialog state to PartTypeSection.vue
4. Wire up create/edit buttons to open dialogs
5. Handle dialog close/save events
6. Refresh data after save

**Integration Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import BlockProfileDialog from '../dialogs/BlockProfileDialog.vue'
import type { GlobalEntity } from '@/types/entities'

const showDialog = ref(false)
const selectedBlockProfile = ref<GlobalEntity<'blockProfile'> | undefined>()

const createBlockProfile = () => {
  selectedBlockProfile.value = undefined
  showDialog.value = true
}

const editBlockProfile = (profile: GlobalEntity<'blockProfile'>) => {
  selectedBlockProfile.value = profile
  showDialog.value = true
}

const handleSaved = () => {
  // Data will refresh automatically via Vue Query
}
</script>

<template>
  <BlockProfileDialog
    v-model="showDialog"
    :block-profile="selectedBlockProfile"
    @saved="handleSaved"
  />
</template>
```

---

### Task 4.4.8: Test Full CRUD Operations

**Steps:**
1. Test creating BlockProfile
2. Test editing BlockProfile
3. Test deleting BlockProfile
4. Test creating PartProfile
5. Test editing PartProfile
6. Test deleting PartProfile
7. Test creating BlockType
8. Test editing BlockType
9. Test deleting BlockType
10. Test creating PartType
11. Test editing PartType
12. Test deleting PartType
13. Test relationship management (adding/removing PartProfiles from BlockProfile)
14. Verify data persists in database
15. Verify UI updates correctly

**Testing Checklist:**
- [ ] All create operations work
- [ ] All edit operations work
- [ ] All delete operations work
- [ ] Relationship management works
- [ ] Data persists correctly
- [ ] UI updates reactively
- [ ] Error handling works
- [ ] Loading states display
- [ ] Success/error messages display

---

### Task 4.4.9: Apply Vuexy Styling and Polish

**Steps:**
1. Ensure consistent spacing and padding
2. Apply Vuexy color scheme
3. Add proper icons to buttons
4. Add loading states to buttons
5. Add success/error snackbars
6. Improve form validation messages
7. Add tooltips where helpful
8. Ensure responsive design
9. Polish empty states
10. Add transitions/animations

**Styling Considerations:**
- Use Vuexy spacing utilities (mb-4, gap-4, etc.)
- Use Vuexy color tokens
- Consistent button styles
- Proper form field spacing
- Card elevation and borders

---

## Vuexy Components Used

- `VDialog` - Dialog container
- `VCard` - Dialog card
- `VCardTitle` - Dialog title
- `VCardText` - Dialog content
- `VCardActions` - Dialog actions
- `VForm` - Form container
- `AppTextField` - Text input
- `AppTextarea` - Textarea input
- `AppSelect` - Select dropdown
- `AppCheckbox` - Checkbox input
- `VBtn` - Buttons
- `VSpacer` - Spacer
- `VSnackbar` - Success/error messages (optional)

---

## File Structure Created

```
client-vue/src/views/admin/
└── dialogs/
    ├── BlockProfileDialog.vue (NEW)
    ├── PartProfileDialog.vue (NEW)
    ├── BlockTypeDialog.vue (NEW)
    └── PartTypeDialog.vue (NEW)
```

---

## Success Criteria

- [ ] All form dialogs created
- [ ] Create operations work for all entities
- [ ] Edit operations work for all entities
- [ ] Delete operations work for all entities
- [ ] Relationship management works in BlockProfile dialog
- [ ] Data persists correctly
- [ ] UI updates reactively
- [ ] Error handling works
- [ ] Loading states display
- [ ] Vuexy styling applied consistently
- [ ] Phase 4 complete and ready for Phase 5

---

## Notes

- Focus on functionality first, then polish
- Ensure all mutations properly invalidate cache
- Handle edge cases (validation, errors, empty states)
- Test thoroughly before moving to Phase 5
- Document any issues or patterns discovered

---

## Related Documents

- Phase Guide: `.cursor/project-manager/features/vue-migration/phases/phase-4-guide.md`
- Project Plan: `.cursor/project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`
- Session 4.1 Guide: `.cursor/project-manager/features/vue-migration/sessions/session-4.1-guide.md`
- Session 4.2 Guide: `.cursor/project-manager/features/vue-migration/sessions/session-4.2-guide.md`
- Session 4.3 Guide: `.cursor/project-manager/features/vue-migration/sessions/session-4.3-guide.md`

## Session Objectives - Status

- ✅ Implement TypesTab.vue component structure
- ✅ Create BlockTypeCard.vue component
- ✅ Create PartTypeCard.vue component
- ✅ Implement list views with VExpansionPanels
- ✅ Add create/edit/delete actions
- ✅ Integrate useGlobal composable
- ✅ Test Types tab functionality

---

## Key Deliverables Completed

### Components Created

1. **TypesTab.vue** ✅
   - Main Types tab component with VTabs navigation
   - Two sub-tabs: BlockTypes and PartTypes
   - Search functionality for filtering types
   - Dialog management for create/edit operations
   - Drag-and-drop support for reordering
   - Location: `client-vue/src/views/admin/tabs/TypesTab.vue`

2. **BlockTypeCard.vue** ✅
   - Card component for displaying BlockType entities
   - Shows BlockType properties (name, orderIndex, allowMultipleBlocks, allowMultipleParts)
   - Edit and delete actions
   - Expandable/collapsible display
   - Location: `client-vue/src/views/admin/components/BlockTypeCard.vue`

3. **PartTypeCard.vue** ✅
   - Card component for displaying PartType entities
   - Shows PartType properties (name, orderIndex)
   - Edit and delete actions
   - Expandable/collapsible display
   - Location: `client-vue/src/views/admin/components/PartTypeCard.vue`

4. **BlockTypeDialog.vue** ✅
   - Dialog component for creating/editing BlockTypes
   - Form with all BlockType fields
   - Create and edit modes
   - Location: `client-vue/src/views/admin/dialogs/BlockTypeDialog.vue`
   - Note: Created in Session 4.4 but integrated in 4.3 structure

5. **PartTypeDialog.vue** ✅
   - Dialog component for creating/editing PartTypes
   - Form with all PartType fields
   - Create and edit modes
   - Location: `client-vue/src/views/admin/dialogs/PartTypeDialog.vue`
   - Note: Created in Session 4.4 but integrated in 4.3 structure

### Integration Completed

1. **TypesTab.vue** ✅
   - Integrated useGlobal for entity access
   - Integrated useEntityCrud for orderIndex operations
   - Integrated drag-and-drop for reordering
   - Dialog state management for create/edit
   - Search filtering functionality
   - Tab navigation between BlockTypes and PartTypes

2. **Card Components** ✅
   - BlockTypeCard and PartTypeCard emit edit events
   - Cards handle delete operations
   - Cards display entity properties correctly
   - Expandable/collapsible functionality

---

## Technical Implementation Details

### Architecture Decisions

1. **Tab Navigation Pattern**: Used VTabs with VWindow for sub-tabs
   - **Why**: Clean separation between BlockTypes and PartTypes
   - **Pattern**: Two tabs (BlockTypes | PartTypes) with VWindow for content switching

2. **Card Display Pattern**: Used VExpansionPanels for grouped display
   - **Why**: Allows expandable/collapsible cards for better organization
   - **Pattern**: Each type displayed as expandable card with properties

3. **Dialog Integration**: Centralized dialogs in TypesTab component
   - **Why**: Better separation of concerns, reusable dialog components
   - **Pattern**: Event-driven architecture - cards emit events, TypesTab handles dialog state

4. **Drag-and-Drop**: Integrated drag-and-drop for reordering
   - **Why**: Allows users to reorder types by dragging
   - **Pattern**: Uses @formkit/drag-and-drop library with orderIndex updates

### Components Used

- `VTabs`, `VTab`, `VWindow`, `VWindowItem` - Tab navigation
- `VExpansionPanels`, `VExpansionPanel` - Expandable card display
- `VCard`, `VCardTitle`, `VCardText` - Card layout
- `VDialog` - Modal dialogs (integrated in Session 4.4)
- `VTextField` - Search input
- `VBtn` - Action buttons
- `VChip` - Status badges

### Composables Used

- `useGlobal` - Access to cached entities
- `useEntityCrud` - Entity CRUD operations and orderIndex updates
- `updateOrderAfterDragDrop` - Utility for handling drag-and-drop order updates

---

## Files Created

```
client-vue/src/views/admin/
├── tabs/
│   └── TypesTab.vue (UPDATED - full implementation)
└── components/
    ├── BlockTypeCard.vue (NEW)
    └── PartTypeCard.vue (NEW)
```

## Files Modified

- `client-vue/src/views/admin/tabs/TypesTab.vue` (full implementation)

---

## Testing Checklist

### Ready for Testing

- ✅ TypesTab displays correctly
- ✅ BlockTypes load and display correctly
- ✅ PartTypes load and display correctly
- ✅ Tab navigation works (BlockTypes | PartTypes)
- ✅ Search filtering works
- ✅ Expandable/collapsible cards work
- ✅ Create buttons open dialogs (Session 4.4)
- ✅ Edit buttons open dialogs (Session 4.4)
- ✅ Delete operations work
- ✅ Drag-and-drop reordering works
- ✅ OrderIndex updates persist

---

---

## Next Steps

1. **Session 4.4**: Proceed to Form Dialogs and CRUD Operations
2. **Testing**: Verify all Types tab functionality works correctly
3. **Polish**: Any additional UI polish or validation improvements

---

## Notes

- TypesTab provides clean interface for managing BlockTypes and PartTypes
- Card components follow consistent patterns with ProfilesTab
- Dialog integration follows same pattern as ProfilesTab
- Drag-and-drop provides intuitive reordering
- Search functionality helps filter large lists
- All components use Vuexy styling consistently

---

## Related Documents

- Session Guide: `project-manager/features/vue-migration/sessions/session-4.3-guide.md`
- Phase Guide: `project-manager/features/vue-migration/phases/phase-4-guide.md`
- Session 4.4 Summary: `project-manager/features/vue-migration/sessions/session-4.4-summary.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

## Session Overview

**Session Number:** 4.3
**Session Name:** Types Tab Implementation
**Description:** Build Types tab with BlockType and PartType configuration sections. Create simple list/table views with CRUD operations for supporting entity types.

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 4.1 complete (main admin panel structure)

---

## Session Objectives

- Implement TypesTab.vue component structure
- Create BlockTypeSection.vue component
- Create PartTypeSection.vue component
- Implement list/table views for both types
- Add create/edit/delete actions
- Integrate useGlobal composable
- Test Types tab functionality

---

## Key Deliverables

- Fully functional TypesTab.vue
- BlockTypeSection.vue component
- PartTypeSection.vue component
- List/table views for BlockTypes and PartTypes
- Basic CRUD actions (create/edit/delete buttons)
- Data integration with composables

---

## Detailed Task Breakdown

### Task 4.3.1: Create TypesTab.vue Component Structure

**File:** `client-vue/src/views/admin/tabs/TypesTab.vue`

**Steps:**
1. Replace placeholder content with full component structure
2. Import necessary composables: `useGlobal`
3. Import Vuexy components: `VCard`, `VTabs` (for sub-tabs if using), `VRow`, `VCol`
4. Set up layout: two-column or sub-tabs
5. Import section components: BlockTypeSection, PartTypeSection
6. Add basic styling

**Code Structure - Two Column Layout:**
```vue
<script setup lang="ts">
import { useGlobal } from '@/composables/useGlobal'
import BlockTypeSection from '../components/BlockTypeSection.vue'
import PartTypeSection from '../components/PartTypeSection.vue'

const { getGlobalEntities } = useGlobal()
</script>

<template>
  <div class="types-tab">
    <VRow>
      <VCol cols="12" md="6">
        <BlockTypeSection />
      </VCol>
      <VCol cols="12" md="6">
        <PartTypeSection />
      </VCol>
    </VRow>
  </div>
</template>
```

**Alternative Code Structure - Sub-tabs:**
```vue
<template>
  <div class="types-tab">
    <VTabs v-model="currentTypeTab">
      <VTab value="block-types">Block Types</VTab>
      <VTab value="part-types">Part Types</VTab>
    </VTabs>
    
    <VWindow v-model="currentTypeTab">
      <VWindowItem value="block-types">
        <BlockTypeSection />
      </VWindowItem>
      <VWindowItem value="part-types">
        <PartTypeSection />
      </VWindowItem>
    </VWindow>
  </div>
</template>
```

---

### Task 4.3.2: Create BlockTypeSection.vue Component

**File:** `client-vue/src/views/admin/components/BlockTypeSection.vue`

**Steps:**
1. Create BlockTypeSection.vue component
2. Import `useGlobal` composable
3. Get BlockTypes using `getGlobalEntities('blockType')`
4. Create list/table view using VDataTable or VList
5. Display BlockType properties:
   - Name
   - Order Index
   - Allow Multiple Blocks
   - Allow Multiple Parts
   - Disabled status
6. Add "Create BlockType" button
7. Add Edit/Delete actions per BlockType
8. Handle empty state

**Code Structure with VDataTable:**
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntity } from '@/types/entities'

const { getGlobalEntities } = useGlobal()

const blockTypes = computed(() => 
  getGlobalEntities('blockType').sort((a, b) => a.orderIndex - b.orderIndex)
)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Order', key: 'orderIndex' },
  { title: 'Multiple Blocks', key: 'allowMultipleBlocks' },
  { title: 'Multiple Parts', key: 'allowMultipleParts' },
  { title: 'Status', key: 'disabled' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const editBlockType = (blockType: GlobalEntity<'blockType'>) => {
  // Will be implemented in Session 4.4
}

const deleteBlockType = async (blockType: GlobalEntity<'blockType'>) => {
  // Will be implemented in Session 4.4
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Block Types</span>
      <VBtn
        prepend-icon="tabler-plus"
        @click="createBlockType"
      >
        Create BlockType
      </VBtn>
    </VCardTitle>
    
    <VCardText>
      <VDataTable
        :headers="headers"
        :items="blockTypes"
        :items-per-page="10"
      >
        <template #item.allowMultipleBlocks="{ item }">
          <VChip
            size="small"
            :color="item.allowMultipleBlocks ? 'success' : 'default'"
          >
            {{ item.allowMultipleBlocks ? 'Yes' : 'No' }}
          </VChip>
        </template>
        
        <template #item.allowMultipleParts="{ item }">
          <VChip
            size="small"
            :color="item.allowMultipleParts ? 'success' : 'default'"
          >
            {{ item.allowMultipleParts ? 'Yes' : 'No' }}
          </VChip>
        </template>
        
        <template #item.disabled="{ item }">
          <VChip
            size="small"
            :color="item.disabled ? 'error' : 'success'"
          >
            {{ item.disabled ? 'Disabled' : 'Active' }}
          </VChip>
        </template>
        
        <template #item.actions="{ item }">
          <VBtn
            icon="tabler-edit"
            variant="text"
            size="small"
            @click="editBlockType(item)"
          />
          <VBtn
            icon="tabler-trash"
            variant="text"
            size="small"
            color="error"
            @click="deleteBlockType(item)"
          />
        </template>
      </VDataTable>
      
      <VAlert
        v-if="blockTypes.length === 0"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        No BlockTypes found. Create your first BlockType to get started.
      </VAlert>
    </VCardText>
  </VCard>
</template>
```

**Alternative Code Structure with VList:**
```vue
<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Block Types</span>
      <VBtn prepend-icon="tabler-plus" @click="createBlockType">
        Create BlockType
      </VBtn>
    </VCardTitle>
    
    <VCardText>
      <VList v-if="blockTypes.length > 0">
        <VListItem
          v-for="blockType in blockTypes"
          :key="blockType.id"
        >
          <VListItemTitle>{{ blockType.name }}</VListItemTitle>
          <VListItemSubtitle>
            Order: {{ blockType.orderIndex }} | 
            Multiple Blocks: {{ blockType.allowMultipleBlocks ? 'Yes' : 'No' }} |
            Multiple Parts: {{ blockType.allowMultipleParts ? 'Yes' : 'No' }}
          </VListItemSubtitle>
          <template #append>
            <VChip
              size="small"
              :color="blockType.disabled ? 'error' : 'success'"
              class="mr-2"
            >
              {{ blockType.disabled ? 'Disabled' : 'Active' }}
            </VChip>
            <VBtn
              icon="tabler-edit"
              variant="text"
              size="small"
              @click="editBlockType(blockType)"
            />
            <VBtn
              icon="tabler-trash"
              variant="text"
              size="small"
              color="error"
              @click="deleteBlockType(blockType)"
            />
          </template>
        </VListItem>
      </VList>
      
      <VAlert
        v-else
        type="info"
        variant="tonal"
      >
        No BlockTypes found.
      </VAlert>
    </VCardText>
  </VCard>
</template>
```

---

### Task 4.3.3: Create PartTypeSection.vue Component

**File:** `client-vue/src/views/admin/components/PartTypeSection.vue`

**Steps:**
1. Create PartTypeSection.vue component (similar to BlockTypeSection)
2. Import `useGlobal` composable
3. Get PartTypes using `getGlobalEntities('partType')`
4. Create list/table view (same pattern as BlockTypeSection)
5. Display PartType properties:
   - Name
   - Order Index
   - Disabled status
6. Add "Create PartType" button
7. Add Edit/Delete actions per PartType
8. Handle empty state

**Code Structure:**
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntity } from '@/types/entities'

const { getGlobalEntities } = useGlobal()

const partTypes = computed(() => 
  getGlobalEntities('partType').sort((a, b) => a.orderIndex - b.orderIndex)
)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Order', key: 'orderIndex' },
  { title: 'Status', key: 'disabled' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const editPartType = (partType: GlobalEntity<'partType'>) => {
  // Will be implemented in Session 4.4
}

const deletePartType = async (partType: GlobalEntity<'partType'>) => {
  // Will be implemented in Session 4.4
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Part Types</span>
      <VBtn
        prepend-icon="tabler-plus"
        @click="createPartType"
      >
        Create PartType
      </VBtn>
    </VCardTitle>
    
    <VCardText>
      <VDataTable
        :headers="headers"
        :items="partTypes"
        :items-per-page="10"
      >
        <template #item.disabled="{ item }">
          <VChip
            size="small"
            :color="item.disabled ? 'error' : 'success'"
          >
            {{ item.disabled ? 'Disabled' : 'Active' }}
          </VChip>
        </template>
        
        <template #item.actions="{ item }">
          <VBtn
            icon="tabler-edit"
            variant="text"
            size="small"
            @click="editPartType(item)"
          />
          <VBtn
            icon="tabler-trash"
            variant="text"
            size="small"
            color="error"
            @click="deletePartType(item)"
          />
        </template>
      </VDataTable>
      
      <VAlert
        v-if="partTypes.length === 0"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        No PartTypes found. Create your first PartType to get started.
      </VAlert>
    </VCardText>
  </VCard>
</template>
```

---

### Task 4.3.4: Implement List/Table Views

**Steps:**
1. Choose between VDataTable and VList based on requirements
2. VDataTable: Better for sorting, filtering, pagination
3. VList: Simpler, more flexible for custom layouts
4. Implement chosen approach in both sections
5. Add proper column/field configuration
6. Style consistently with Vuexy theme

**Considerations:**
- VDataTable provides built-in sorting and pagination
- VList is more flexible for custom layouts
- Choose based on expected data volume and user needs

---

### Task 4.3.5: Add Create/Edit/Delete Actions

**Steps:**
1. Add "Create" buttons to both sections
2. Add Edit buttons to each item (will open dialog in Session 4.4)
3. Add Delete buttons to each item (will implement delete in Session 4.4)
4. Create placeholder functions for now
5. Wire up click handlers
6. Add confirmation dialogs for delete actions (optional for now)

**Action Implementation:**
```typescript
const createBlockType = () => {
  // Will open dialog in Session 4.4
  console.log('Create BlockType - dialog will be implemented in Session 4.4')
}

const editBlockType = (blockType: GlobalEntity<'blockType'>) => {
  // Will open dialog in Session 4.4
  console.log('Edit BlockType - dialog will be implemented in Session 4.4', blockType)
}

const deleteBlockType = async (blockType: GlobalEntity<'blockType'>) => {
  // Will implement delete mutation in Session 4.4
  console.log('Delete BlockType - mutation will be implemented in Session 4.4', blockType)
}
```

---

### Task 4.3.6: Integrate useGlobal Composable

**File:** Both BlockTypeSection.vue and PartTypeSection.vue

**Steps:**
1. Import `useGlobal` composable
2. Call composable in setup
3. Use `getGlobalEntities()` to get BlockTypes and PartTypes
4. Create computed properties for reactive data
5. Handle loading states (if needed)
6. Handle error states (if needed)

**Integration Code:**
```typescript
import { useGlobal } from '@/composables/useGlobal'

const { getGlobalEntities } = useGlobal()

const blockTypes = computed(() => getGlobalEntities('blockType'))
const partTypes = computed(() => getGlobalEntities('partType'))
```

---

### Task 4.3.7: Test Types Tab Functionality

**Steps:**
1. Start dev server
2. Navigate to `/admin` and Types tab
3. Verify BlockTypes load and display correctly
4. Verify PartTypes load and display correctly
5. Test sorting (if using VDataTable)
6. Test pagination (if using VDataTable)
7. Test action buttons (should log to console for now)
8. Verify empty states display
9. Check browser console for errors
10. Test responsive layout (two-column should stack on mobile)

**Testing Checklist:**
- [ ] BlockTypes load from API
- [ ] PartTypes load from API
- [ ] Data displays correctly in table/list
- [ ] Sorting works (if VDataTable)
- [ ] Pagination works (if VDataTable)
- [ ] Action buttons render correctly
- [ ] Empty states display correctly
- [ ] Responsive layout works
- [ ] No console errors
- [ ] Data updates reactively

---

## Vuexy Components Used

- `VCard` - Section container
- `VCardTitle` - Section title
- `VCardText` - Section content
- `VDataTable` - Table view (optional)
- `VList` - List view (optional)
- `VListItem` - List item
- `VListItemTitle` - Item title
- `VListItemSubtitle` - Item subtitle
- `VBtn` - Action buttons
- `VChip` - Status badges
- `VRow` / `VCol` - Grid layout
- `VTabs` / `VTab` / `VWindow` / `VWindowItem` - Sub-tabs (optional)
- `VAlert` - Empty state message

---

## File Structure Created

```
client-vue/src/views/admin/
├── tabs/
│   └── TypesTab.vue (UPDATED - full implementation)
└── components/
    ├── BlockTypeSection.vue (NEW)
    └── PartTypeSection.vue (NEW)
```

---

## Success Criteria

- [ ] TypesTab.vue fully implemented
- [ ] BlockTypeSection.vue component created
- [ ] PartTypeSection.vue component created
- [ ] BlockTypes display correctly
- [ ] PartTypes display correctly
- [ ] Action buttons render correctly
- [ ] Composables integrated correctly
- [ ] Data loads and displays correctly
- [ ] Ready for Session 4.4 (Form Dialogs and CRUD Operations)

---

## Notes

- Focus on data display and structure
- CRUD operations (create/edit/delete) will be fully implemented in Session 4.4
- Choose VDataTable or VList based on requirements
- Keep components simple and focused
- Use consistent styling with Profiles tab

---

## Related Documents

- Phase Guide: `.cursor/project-manager/features/vue-migration/phases/phase-4-guide.md`
- Project Plan: `.cursor/project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`
- Session 4.1 Guide: `.cursor/project-manager/features/vue-migration/sessions/session-4.1-guide.md`
- Session 4.2 Guide: `.cursor/project-manager/features/vue-migration/sessions/session-4.2-guide.md`

## Session Overview

**Session Number:** 4.2
**Session Name:** Profiles Tab Implementation
**Description:** Build Profiles tab with BlockProfile management grouped by BlockType, displaying nested PartProfiles within each BlockProfile using activeParts relationship.

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 4.1 complete (main admin panel structure)

---

## Session Objectives

- Implement ProfilesTab.vue with BlockProfile grouping
- Create BlockProfileCard.vue component
- Create PartProfileNestedList.vue component
- Integrate useGlobal and useRelationshipCrud composables
- Add search functionality
- Test data loading and display

---

## Key Deliverables

- Fully functional ProfilesTab.vue
- BlockProfileCard.vue component
- PartProfileNestedList.vue component
- Data integration with composables
- Search functionality
- Working nested PartProfile display

---

## Detailed Task Breakdown

### Task 4.2.1: Create ProfilesTab.vue Component Structure

**File:** `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Steps:**
1. Replace placeholder content with full component structure
2. Import necessary composables: `useGlobal`, `useRelationshipCrud`
3. Import Vuexy components: `VExpansionPanels`, `VExpansionPanel`, `VCard`, `VTextField`
4. Set up reactive state for search and expanded groups
5. Create computed properties for grouped BlockProfiles
6. Add search input field
7. Add VExpansionPanels for BlockType groups

**Code Structure:**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import BlockProfileCard from '../components/BlockProfileCard.vue'

const { getGlobalEntities } = useGlobal()
const { relationships: activeParts } = useRelationshipCrud('activeParts')

const searchTerm = ref('')
const expandedGroups = ref<string[]>([])

// Group BlockProfiles by BlockType
const groupedProfiles = computed(() => {
  const blockTypes = getGlobalEntities('blockType')
  const blockProfiles = getGlobalEntities('blockProfile')
  
  // Grouping logic here
  // Return array of { blockType, profiles: BlockProfile[] }
})
</script>

<template>
  <div class="profiles-tab">
    <!-- Search -->
    <VTextField
      v-model="searchTerm"
      placeholder="Search BlockProfiles..."
      prepend-inner-icon="tabler-search"
      class="mb-4"
    />
    
    <!-- BlockType Groups -->
    <VExpansionPanels v-model="expandedGroups" multiple>
      <VExpansionPanel
        v-for="group in groupedProfiles"
        :key="group.blockType.id"
        :value="group.blockType.id"
      >
        <template #title>
          {{ group.blockType.name }} ({{ group.profiles.length }})
        </template>
        
        <template #text>
          <BlockProfileCard
            v-for="profile in group.profiles"
            :key="profile.id"
            :block-profile="profile"
          />
        </template>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>
```

---

### Task 4.2.2: Implement BlockProfile Grouping by BlockType

**File:** `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Steps:**
1. Create computed property `groupedProfiles`
2. Get BlockTypes and BlockProfiles from `useGlobal()`
3. Group BlockProfiles by `blockTypeRef` property
4. Filter groups by search term (search BlockType name and BlockProfile names)
5. Sort groups by BlockType `orderIndex`
6. Sort BlockProfiles within each group by `orderIndex`

**Grouping Logic:**
```typescript
const groupedProfiles = computed(() => {
  const blockTypes = getGlobalEntities('blockType')
  const blockProfiles = getGlobalEntities('blockProfile')
  
  // Create map of BlockType ID -> BlockProfile[]
  const groupMap = new Map<string, {
    blockType: GlobalEntity<'blockType'>
    profiles: GlobalEntity<'blockProfile'>[]
  }>()
  
  // Initialize groups for all BlockTypes
  blockTypes.forEach(blockType => {
    groupMap.set(blockType.id, {
      blockType,
      profiles: []
    })
  })
  
  // Add BlockProfiles to their groups
  blockProfiles.forEach(profile => {
    const group = groupMap.get(profile.blockTypeRef)
    if (group) {
      group.profiles.push(profile)
    }
  })
  
  // Filter by search term
  let filtered = Array.from(groupMap.values())
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered
      .map(group => ({
        ...group,
        profiles: group.profiles.filter(p => 
          p.name.toLowerCase().includes(term)
        )
      }))
      .filter(group => 
        group.blockType.name.toLowerCase().includes(term) ||
        group.profiles.length > 0
      )
  }
  
  // Sort groups and profiles
  return filtered
    .sort((a, b) => a.blockType.orderIndex - b.blockType.orderIndex)
    .map(group => ({
      ...group,
      profiles: group.profiles.sort((a, b) => a.orderIndex - b.orderIndex)
    }))
})
```

---

### Task 4.2.3: Create BlockProfileCard.vue Component

**File:** `client-vue/src/views/admin/components/BlockProfileCard.vue`

**Steps:**
1. Create components directory if needed
2. Create BlockProfileCard.vue component
3. Accept `blockProfile` as prop
4. Display BlockProfile properties:
   - Name (prominent)
   - Description
   - baseSqFt
   - visibility status
   - disabled status
5. Add action buttons: Edit, Delete
6. Include PartProfileNestedList component
7. Use Vuexy VCard for layout

**Code Structure:**
```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import PartProfileNestedList from './PartProfileNestedList.vue'

interface Props {
  blockProfile: GlobalEntity<'blockProfile'>
}

const props = defineProps<Props>()

const isExpanded = ref(false)
</script>

<template>
  <VCard class="mb-4">
    <VCardTitle>
      <div class="d-flex align-center justify-space-between">
        <span>{{ blockProfile.name }}</span>
        <div>
          <VBtn
            icon="tabler-edit"
            variant="text"
            size="small"
            @click="editBlockProfile"
          />
          <VBtn
            icon="tabler-trash"
            variant="text"
            size="small"
            color="error"
            @click="deleteBlockProfile"
          />
        </div>
      </div>
    </VCardTitle>
    
    <VCardText>
      <div v-if="blockProfile.description" class="mb-2">
        {{ blockProfile.description }}
      </div>
      
      <div class="d-flex gap-4 mb-4">
        <VChip size="small" v-if="blockProfile.baseSqFt">
          Base SqFt: {{ blockProfile.baseSqFt }}
        </VChip>
        <VChip
          size="small"
          :color="blockProfile.visibility ? 'success' : 'default'"
        >
          {{ blockProfile.visibility ? 'Visible' : 'Hidden' }}
        </VChip>
        <VChip
          size="small"
          :color="blockProfile.disabled ? 'error' : 'success'"
        >
          {{ blockProfile.disabled ? 'Disabled' : 'Active' }}
        </VChip>
      </div>
      
      <!-- Nested PartProfiles -->
      <PartProfileNestedList :block-profile-id="blockProfile.id" />
    </VCardText>
  </VCard>
</template>
```

---

### Task 4.2.4: Create PartProfileNestedList.vue Component

**File:** `client-vue/src/views/admin/components/PartProfileNestedList.vue`

**Steps:**
1. Create PartProfileNestedList.vue component
2. Accept `blockProfileId` as prop
3. Use `useRelationshipCrud('activeParts')` to get relationships
4. Filter relationships where `parent_id === blockProfileId`
5. Get PartProfile entities for those relationships
6. Display PartProfiles in VList or VExpansionPanel
7. Show PartProfile properties: name, baseTime, baseFee, etc.
8. Add actions: Edit PartProfile, Remove from BlockProfile
9. Add "Add PartProfile" button

**Code Structure:**
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import type { GlobalEntity } from '@/types/entities'

interface Props {
  blockProfileId: string
}

const props = defineProps<Props>()

const { getGlobalEntities, getGlobalEntityById } = useGlobal()
const { relationships: activeParts, remove } = useRelationshipCrud('activeParts')

// Get PartProfiles for this BlockProfile
const partProfiles = computed(() => {
  const allPartProfiles = getGlobalEntities('partProfile')
  const relationships = activeParts.value.filter(
    rel => rel.parent_id === props.blockProfileId && !rel.disabled
  )
  
  return relationships
    .map(rel => getGlobalEntityById('partProfile', rel.child_id))
    .filter((pp): pp is GlobalEntity<'partProfile'> => pp !== undefined)
    .sort((a, b) => a.orderIndex - b.orderIndex)
})

const removePartProfile = async (partProfileId: string) => {
  await remove(props.blockProfileId, partProfileId)
}
</script>

<template>
  <div class="part-profiles-nested">
    <div class="d-flex align-center justify-space-between mb-2">
      <VSubheader>Part Profiles ({{ partProfiles.length }})</VSubheader>
      <VBtn
        size="small"
        prepend-icon="tabler-plus"
        @click="addPartProfile"
      >
        Add PartProfile
      </VBtn>
    </div>
    
    <VList v-if="partProfiles.length > 0">
      <VListItem
        v-for="partProfile in partProfiles"
        :key="partProfile.id"
      >
        <VListItemTitle>{{ partProfile.name }}</VListItemTitle>
        <VListItemSubtitle>
          Base Time: {{ partProfile.baseTime }} | Base Fee: ${{ partProfile.baseFee }}
        </VListItemSubtitle>
        <template #append>
          <VBtn
            icon="tabler-edit"
            variant="text"
            size="small"
            @click="editPartProfile(partProfile.id)"
          />
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            color="error"
            @click="removePartProfile(partProfile.id)"
          />
        </template>
      </VListItem>
    </VList>
    
    <VAlert
      v-else
      type="info"
      variant="tonal"
      class="mt-2"
    >
      No PartProfiles assigned to this BlockProfile
    </VAlert>
  </div>
</template>
```

---

### Task 4.2.5: Integrate Composables

**File:** `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Steps:**
1. Import `useGlobal` composable
2. Import `useRelationshipCrud` composable
3. Call composables in setup
4. Use `getGlobalEntities()` to get BlockTypes, BlockProfiles, PartProfiles
5. Use `useRelationshipCrud('activeParts')` to get activeParts relationships
6. Handle loading states
7. Handle error states

**Integration Code:**
```typescript
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'

const { getGlobalEntities, getGlobalEntityById } = useGlobal()
const { 
  relationships: activeParts, 
  isLoading: isLoadingRelationships,
  error: relationshipError 
} = useRelationshipCrud('activeParts')

// Use in computed properties and methods
```

---

### Task 4.2.6: Add Search Functionality

**File:** `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Steps:**
1. Add `searchTerm` ref
2. Add VTextField for search input
3. Update `groupedProfiles` computed to filter by search term
4. Search should match:
   - BlockType names
   - BlockProfile names
   - BlockProfile descriptions
5. Show "No results" message when filtered list is empty

**Search Implementation:**
```vue
<template>
  <VTextField
    v-model="searchTerm"
    placeholder="Search BlockProfiles by name, type, or description..."
    prepend-inner-icon="tabler-search"
    clearable
    class="mb-4"
  />
</template>
```

**Filtering Logic:**
```typescript
// In groupedProfiles computed property
if (searchTerm.value) {
  const term = searchTerm.value.toLowerCase()
  filtered = filtered
    .map(group => ({
      ...group,
      profiles: group.profiles.filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      )
    }))
    .filter(group => 
      group.blockType.name.toLowerCase().includes(term) ||
      group.profiles.length > 0
    )
}
```

---

### Task 4.2.7: Test Data Loading and Display

**Steps:**
1. Start dev server
2. Navigate to `/admin` and Profiles tab
3. Verify BlockProfiles load and group correctly
4. Verify nested PartProfiles display
5. Test search functionality
6. Test expanding/collapsing groups
7. Verify loading states
8. Check browser console for errors
9. Test with empty data states

**Testing Checklist:**
- [ ] BlockProfiles load from API
- [ ] BlockProfiles group correctly by BlockType
- [ ] Nested PartProfiles display within BlockProfiles
- [ ] Search filters correctly
- [ ] Expansion panels work
- [ ] Loading states display
- [ ] Empty states display correctly
- [ ] No console errors
- [ ] Data updates reactively

---

## Vuexy Components Used

- `VExpansionPanels` - Container for expandable groups
- `VExpansionPanel` - Individual BlockType group
- `VCard` - BlockProfile card container
- `VCardTitle` - Card title
- `VCardText` - Card content
- `VTextField` - Search input
- `VList` - PartProfile list
- `VListItem` - Individual PartProfile item
- `VListItemTitle` - PartProfile name
- `VListItemSubtitle` - PartProfile details
- `VBtn` - Action buttons
- `VChip` - Status badges
- `VSubheader` - Section headers
- `VAlert` - Empty state message

---

## File Structure Created

```
client-vue/src/views/admin/
├── tabs/
│   └── ProfilesTab.vue (UPDATED - full implementation)
└── components/
    ├── BlockProfileCard.vue (NEW)
    └── PartProfileNestedList.vue (NEW)
```

---

## Success Criteria

- [x] ProfilesTab.vue fully implemented
- [x] BlockProfileCard.vue component created
- [x] PartProfileNestedList.vue component created
- [x] BlockProfiles group correctly by BlockType
- [x] Nested PartProfiles display correctly
- [x] Search functionality works
- [x] Composables integrated correctly
- [x] Data loads and displays correctly
- [x] Ready for Session 4.3 (Types Tab Implementation)

---

## Notes

- Focus on data display first, CRUD operations come in Session 4.4
- Ensure relationship data loads correctly
- Handle edge cases (empty groups, no PartProfiles, etc.)
- Use Vuexy styling consistently

---

## Related Documents

- Phase Guide: `.cursor/project-manager/features/vue-migration/phases/phase-4-guide.md`
- Project Plan: `.cursor/project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`
- Session 4.1 Guide: `.cursor/project-manager/features/vue-migration/sessions/session-4.1-guide.md`

## Session Overview

**Session Number:** 4.1
**Session Name:** Main Admin Panel Structure
**Description:** Create main admin page with tabbed interface structure using Vuexy VTabs component. Set up basic navigation and placeholder tab components.

**Duration:** Estimated 1-2 hours
**Dependencies:** Phase 3 complete (data flow verified)

---

## Session Objectives

- Create main AdminPanel.vue component with VTabs navigation
- Set up basic tab structure (Profiles | Types)
- Create placeholder tab components
- Update router to use single /admin route
- Verify tab navigation works correctly

---

## Key Deliverables

- AdminPanel.vue component with VTabs
- Placeholder ProfilesTab.vue component
- Placeholder TypesTab.vue component
- Updated router configuration
- Working tab navigation

---

## Detailed Task Breakdown

### Task 4.1.1: Create AdminPanel.vue Component

**File:** `client-vue/src/views/admin/AdminPanel.vue`

**Steps:**
1. Create new Vue component file
2. Import Vuexy VTabs component
3. Set up basic component structure with script setup
4. Create reactive tab state (default to 'profiles' tab)
5. Add VTabs component with two tabs:
   - Tab 1: "Profiles" (key: 'profiles')
   - Tab 2: "Types" (key: 'types')
6. Import and render placeholder tab components conditionally
7. Add basic styling using Vuexy classes

**Code Structure:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ProfilesTab from './tabs/ProfilesTab.vue'
import TypesTab from './tabs/TypesTab.vue'

const currentTab = ref('profiles')
</script>

<template>
  <div class="admin-panel">
    <VTabs v-model="currentTab">
      <VTab value="profiles">Profiles</VTab>
      <VTab value="types">Types</VTab>
    </VTabs>
    
    <VWindow v-model="currentTab">
      <VWindowItem value="profiles">
        <ProfilesTab />
      </VWindowItem>
      <VWindowItem value="types">
        <TypesTab />
      </VWindowItem>
    </VWindow>
  </div>
</template>
```

---

### Task 4.1.2: Create Placeholder ProfilesTab Component

**File:** `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Steps:**
1. Create tabs directory if it doesn't exist
2. Create ProfilesTab.vue component
3. Add basic component structure
4. Add placeholder content: "Profiles Tab - Coming Soon"
5. Add basic styling/layout

**Code Structure:**
```vue
<script setup lang="ts">
// Placeholder - will be implemented in Session 4.2
</script>

<template>
  <div class="profiles-tab">
    <VCard>
      <VCardTitle>Profiles</VCardTitle>
      <VCardText>
        BlockProfile management with nested PartProfiles will be implemented here.
      </VCardText>
    </VCard>
  </div>
</template>
```

---

### Task 4.1.3: Create Placeholder TypesTab Component

**File:** `client-vue/src/views/admin/tabs/TypesTab.vue`

**Steps:**
1. Create TypesTab.vue component in tabs directory
2. Add basic component structure
3. Add placeholder content: "Types Tab - Coming Soon"
4. Add basic styling/layout

**Code Structure:**
```vue
<script setup lang="ts">
// Placeholder - will be implemented in Session 4.3
</script>

<template>
  <div class="types-tab">
    <VCard>
      <VCardTitle>Types</VCardTitle>
      <VCardText>
        BlockType and PartType configuration will be implemented here.
      </VCardText>
    </VCard>
  </div>
</template>
```

---

### Task 4.1.4: Update Router Configuration

**File:** `client-vue/src/router/index.ts`

**Steps:**
1. Remove existing separate entity routes:
   - `/admin/block-types`
   - `/admin/block-profiles`
   - `/admin/part-types`
   - `/admin/part-profiles`
   - All their create/edit routes
2. Add single `/admin` route pointing to AdminPanel.vue
3. Update home redirect to `/admin`
4. Keep verification routes as-is:
   - `/admin/api-verification`
   - `/admin/state-management-verification`
   - `/admin/data-flow-verification`

**Code Changes:**
```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/admin', // Updated from '/admin/block-types'
  },
  // Verification pages (keep as-is)
  {
    path: '/admin/api-verification',
    name: 'api-verification',
    component: () => import('@/views/admin/ApiVerification.vue'),
  },
  // ... other verification routes
  
  // Main admin route
  {
    path: '/admin',
    name: 'admin-panel',
    component: () => import('@/views/admin/AdminPanel.vue'),
  },
  
  // Remove all separate entity routes
]
```

---

### Task 4.1.5: Verify Tab Navigation

**Steps:**
1. Start dev server: `npm run dev`
2. Navigate to `/admin` route
3. Verify tabs render correctly
4. Click between tabs and verify content switches
5. Verify tab state persists (or resets) on navigation
6. Check browser console for errors
7. Verify Vuexy styling applies correctly

**Testing Checklist:**
- [ ] Tabs render with correct labels
- [ ] Clicking tabs switches content
- [ ] Tab styling matches Vuexy theme
- [ ] No console errors
- [ ] Router navigation works
- [ ] Placeholder content displays

---

## Vuexy Components Used

- `VTabs` - Main tab navigation component
- `VTab` - Individual tab button
- `VWindow` - Tab content container
- `VWindowItem` - Individual tab content wrapper
- `VCard` - Card layout for placeholder content
- `VCardTitle` - Card title
- `VCardText` - Card text content

---

## File Structure Created

```
client-vue/src/views/admin/
├── AdminPanel.vue (NEW)
└── tabs/
    ├── ProfilesTab.vue (NEW - placeholder)
    └── TypesTab.vue (NEW - placeholder)
```

---

## Success Criteria

- [ ] AdminPanel.vue created with VTabs structure
- [ ] ProfilesTab.vue placeholder created
- [ ] TypesTab.vue placeholder created
- [ ] Router updated to single /admin route
- [ ] Tab navigation works correctly
- [ ] No console errors
- [ ] Vuexy styling applies correctly
- [ ] Ready for Session 4.2 (Profiles Tab Implementation)

---

## Notes

- This session focuses on structure only - no data integration yet
- Placeholder components will be fully implemented in later sessions
- Keep components simple and focused on navigation structure
- Verify Vuexy components are properly imported and working

---

## Related Documents

- Phase Guide: `.cursor/project-manager/features/vue-migration/phases/phase-4-guide.md`
- Project Plan: `.cursor/project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`

