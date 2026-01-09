# Session 4.7 Guide: Entity Pooling System

**Purpose:** Session-level guide for implementing configurable entity pooling system

**Tier:** Session (Tier 2 - Medium-Level)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.7
**Status:** 🚧 In Progress

---

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

**Learning Points:**
- Sequelize model patterns
- Through table relationships
- Generic foreign key references

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

**Learning Points:**
- Configuration patterns
- Type-safe config interfaces

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

**Learning Points:**
- Express router patterns
- Validation middleware
- Circular reference detection algorithms

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

**Learning Points:**
- TypeScript type definitions
- API response type matching

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
1. Add optional `pooledMembers?: GlobalEntityId[]` to `BaseGlobalEntity`
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

**Learning Points:**
- Data transformation patterns
- API integration
- Type updates

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

**Learning Points:**
- Aggregation algorithms
- Recursive data processing
- Computed view patterns

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

**Learning Points:**
- Vue composables
- Vue Query integration
- Cache invalidation strategies

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

**Learning Points:**
- Vue component patterns
- Modal dialogs
- Distribution algorithms
- User interaction patterns

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

