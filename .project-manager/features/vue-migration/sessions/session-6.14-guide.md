# Phase 6 Session 6.14 Guide: Data Flow Unification and Field Config Updates

**Feature:** Vue Migration  
**Purpose:** Session-level guide for unifying data flows through globalData and updating field configurations

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.14 - Data Flow Unification and Field Config Updates
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 6.14
**Session Name:** Data Flow Unification and Field Config Updates
**Description:** Refactor composables to read from globalData instead of direct API calls, ensuring consistent data flow pattern across all data types. Update field configurations for new annotation and component systems.

**Duration:** Completed retroactively
**Dependencies:** Sessions 6.11-6.13 (Component and Annotation systems)

---

## Session Objectives

- Refactor useComponentEntity to read from globalData
- Refactor useRelationship to read from globalData
- Refactor useEntity to read from globalData
- Update useFieldContext for unified data flow
- Update field configurations for annotations and components
- Ensure consistent data flow pattern across all data types

---

## Key Deliverables

- Unified data flow through globalData cache
- Updated composables (useComponentEntity, useRelationship, useEntity)
- Updated field configurations
- Consistent invalidation pattern

---

## Technical Approach

### Data Flow Unification

**Before:**
- Each composable made direct API calls via useQuery
- Duplicate API calls for same data
- Individual query keys for each composable

**After:**
- All composables read from globalData cache
- Single source of truth (globalData)
- Mutations invalidate globalData to trigger refetch
- Consistent pattern: fetch → transform → hydrate → globalData

### Field Config Updates

**Updated Configs:**
- selectableFieldConfig - Added annotation and component fields
- selectableDisplayConfig - Added annotation and component displays
- blockInstancePrimitiveFields - Updated for new field types
- blockInstanceDisplays - Updated for new display types
- formFields and formDataEnums - Updated type definitions

---

## Files Modified

### Frontend
- `client-vue/src/composables/useComponentEntity.ts` (updated)
- `client-vue/src/composables/useRelationship.ts` (updated)
- `client-vue/src/composables/useEntity.ts` (updated)
- `client-vue/src/composables/useFieldContext.ts` (updated)
- `client-vue/src/configs/field/form/selectableFieldConfig.ts` (updated)
- `client-vue/src/configs/field/display/selectableDisplayConfig.ts` (updated)
- `client-vue/src/configs/field/form/appliedForm/blockInstancePrimitiveFields.ts` (updated)
- `client-vue/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` (updated)
- `client-vue/src/types/entity/formFields.ts` (updated)
- `client-vue/src/types/entity/formDataEnums.ts` (updated)

---

## Architecture Decisions

### Why Unify Data Flow?

1. **Performance:** Eliminates duplicate API calls
2. **Consistency:** Single source of truth for all data
3. **Simplicity:** Easier to manage and debug
4. **Cache Efficiency:** Better cache utilization

### Data Flow Pattern

1. **Fetch:** `fetchToGlobalTransformer.stageForHydration()` fetches all data in parallel
2. **Transform:** Transformers convert API data to global format
3. **Hydrate:** `hydrate()` attaches data to entities
4. **Cache:** All data stored in globalData cache
5. **Read:** Composables read from globalData (no direct API calls)
6. **Invalidate:** Mutations invalidate globalData to trigger refetch

---

## Learning Objectives

- Understand centralized data flow patterns
- Learn globalData cache management
- Understand query invalidation strategies
- Learn field configuration patterns

---

## Success Criteria

- ✅ All composables read from globalData
- ✅ No duplicate API calls for reads
- ✅ Mutations invalidate globalData
- ✅ Field configs updated for annotations and components
- ✅ Consistent data flow pattern

---

## Related Documents

- Phase 6 Handoff: `project-manager/features/vue-migration/phases/phase-6-handoff.md`
- align-data-flows.plan.md
- UNIFY_COMPONENT_DATAFLOW_TODO.md

