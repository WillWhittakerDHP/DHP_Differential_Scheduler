# Phase 6 Session 6.11 Guide: Align Component Management

**Feature:** Vue Migration  
**Purpose:** Session-level guide for replacing composition system with component system using relationships pattern

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.11 - Align Component Management
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 6.11
**Session Name:** Align Component Management
**Description:** Replace entity composition system with component system that uses unified relationship pattern. Components are now managed through the relationship router, consistent with other relationship types (validCascades, activeCascades, etc.).

**Duration:** Completed retroactively
**Dependencies:** Session 6.10 (Entity Composition System - replaced)

---

## Session Objectives

- Remove ActiveComposition model and router
- Create ActiveComponent model and migration
- Replace composition logic with component relationship logic
- Update transformers to use component relationships
- Enhance relationship router with component-specific validation
- Update entity registry with component configuration

---

## Key Deliverables

- ActiveComponent model and database migration
- useComponentEntity composable
- Component constants, types, and aggregator
- ComponentDistributionModal component
- Enhanced relationship router with component support
- Updated transformers for component relationships

---

## Technical Approach

### Database Layer

**Removed:**
- `active_compositions` table (replaced by `active_components`)
- ActiveComposition model

**Added:**
- `active_components` table with `composer_id`, `particle_id`, `order_index`, `disabled`
- ActiveComponent model

### Backend Changes

**Removed:**
- CompositionRouter (`/api/compositions` endpoints)
- CompositionConfig from EntityConfig

**Added:**
- Component relationship support in RelationshipRouter
- Component-specific validation (circular refs, composable checks)
- Component endpoints via `/api/relationships/activeComponents`

### Frontend Changes

**Removed:**
- useCompositionEntity composable
- Composition constants, types, aggregator
- CompositionDistributionModal (replaced)

**Added:**
- useComponentEntity composable
- Component constants, types, aggregator
- ComponentDistributionModal component
- Component relationship handling in transformers

---

## Files Modified

### Backend
- `server/src/db/models/scheduler/active_component.ts` (new)
- `server/src/db/models/scheduler/active_composition.ts` (deleted)
- `server/src/db/migrations/20251130_create_active_components_table.js` (new)
- `server/src/db/migrations/20251203_add_order_index_to_active_components.mjs` (new)
- `server/src/db/models/index.ts` (updated)
- `server/src/config/entityRegistry.ts` (updated)
- `server/src/routes/internal/index.ts` (updated)
- `server/src/routes/internal/relationships/relationshipRouter.ts` (enhanced)

### Frontend
- `client-vue/src/composables/useComponentEntity.ts` (new)
- `client-vue/src/composables/useCompositionEntity.ts` (deleted)
- `client-vue/src/constants/component.ts` (new)
- `client-vue/src/constants/composition.ts` (deleted)
- `client-vue/src/types/component.ts` (new)
- `client-vue/src/types/composition.ts` (deleted)
- `client-vue/src/utils/transformers/componentAggregator.ts` (new)
- `client-vue/src/utils/transformers/compositionAggregator.ts` (deleted)
- `client-vue/src/components/admin/component/ComponentDistributionModal.vue` (new)
- `client-vue/src/components/admin/composition/CompositionDistributionModal.vue` (deleted)
- `client-vue/src/types/entities.ts` (updated)
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts` (updated)
- `client-vue/src/utils/transformers/relationshipTransformers.ts` (updated)

---

## Architecture Decisions

### Why Replace Composition with Components?

1. **Unified Pattern:** Components use the same relationship pattern as other relationship types, making the codebase more consistent
2. **Simplified Architecture:** No need for separate composition router - components flow through unified relationship router
3. **Better Integration:** Components integrate seamlessly with existing relationship infrastructure

### Component vs Composition

- **Composition:** Separate system with its own router and data flow
- **Components:** Unified relationship type that flows through relationship router like other relationships

---

## Learning Objectives

- Understand relationship-based architecture patterns
- Learn how to migrate from separate system to unified pattern
- Understand component-specific validation in relationship router
- Learn component aggregation strategies (sum, merge, first, every)

---

## Success Criteria

- ✅ ActiveComposition model and router removed
- ✅ ActiveComponent model and migration created
- ✅ useComponentEntity composable created
- ✅ Component relationships flow through relationship router
- ✅ Component-specific validation in relationship router
- ✅ Transformers updated for component relationships
- ✅ Entity registry updated with component config

---

## Related Documents

- Phase 6 Handoff: `project-manager/features/vue-migration/phases/phase-6-handoff.md`
- Session 6.10 Summary: `project-manager/features/vue-migration/sessions/session-6.10-summary.md`
- UNIFY_COMPONENT_DATAFLOW_TODO.md
