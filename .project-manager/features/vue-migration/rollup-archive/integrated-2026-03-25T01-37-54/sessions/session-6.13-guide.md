# Phase 6 Session 6.13 Guide: User Types Migration and Relationship Router Enhancement

**Feature:** Vue Migration  
**Purpose:** Session-level guide for migrating user types to BlockInstance entities and enhancing relationship router

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.13 - User Types Migration and Relationship Router Enhancement
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 6.13
**Session Name:** User Types Migration and Relationship Router Enhancement
**Description:** Migrate user types from hardcoded string constants to BlockInstance entities, and enhance relationship router with component-specific validation and endpoints.

**Duration:** Completed retroactively
**Dependencies:** Session 6.12 (Refactor Annotations)

---

## Session Objectives

- Migrate user types from hardcoded strings to BlockInstance entities
- Create userTypes constants and userTypeUtils
- Update annotation system to use BlockInstance IDs for user types
- Enhance relationship router with component-specific validation
- Add component-specific endpoints (PATCH, DELETE with ID)
- Update useRelationship composable for enhanced router features

---

## Key Deliverables

- userTypes constants and userTypeUtils
- Updated annotation transformers for BlockInstance IDs
- Enhanced relationship router with component validation
- Component-specific endpoints in relationship router
- Updated useRelationship composable
- Updated API utilities

---

## Technical Approach

### User Types Migration

**Before:**
- Hardcoded string constants: `['buyer', 'agent', 'owner']`
- User type stored as varchar in database
- String-based filtering and validation

**After:**
- User types are BlockInstance entities
- User type stored as BlockInstance ID (UUID)
- BlockInstance-based filtering and validation
- Dynamic user type fetching from GlobalData

### Relationship Router Enhancement

**Added Features:**
- Component-specific validation (circular refs, composable checks)
- Component-specific endpoints (PATCH, DELETE with ID)
- Enhanced GET endpoint with parent_id filtering
- Order_index sorting for activeComponents
- Visible flag management for components

---

## Files Modified

### Frontend
- `client-vue/src/constants/userTypes.ts` (new)
- `client-vue/src/utils/userTypeUtils.ts` (new)
- `client-vue/src/composables/useBookingWizard.ts` (updated)
- `client-vue/src/utils/transformers/annotationTransformers.ts` (updated)
- `client-vue/src/composables/useRelationship.ts` (updated)
- `client-vue/src/utils/api.ts` (updated)

### Backend
- `server/src/routes/internal/relationships/relationshipRouter.ts` (enhanced)

---

## Architecture Decisions

### Why Migrate User Types to BlockInstance Entities?

1. **Consistency:** User types follow same pattern as other entities
2. **Flexibility:** Easy to add new user types without code changes
3. **Relationships:** User types can have relationships like other entities
4. **Admin Portal:** User types manageable through admin portal

### Relationship Router Enhancement

**Why Enhance Router?**
- Component-specific validation needed
- Component-specific endpoints needed (order_index, visible flags)
- Consistent pattern for all relationship types
- Better integration with component system

---

## Success Criteria

- ✅ User types migrated to BlockInstance entities
- ✅ userTypes constants and utilities created
- ✅ Annotation system uses BlockInstance IDs
- ✅ Relationship router enhanced with component validation
- ✅ Component-specific endpoints added
- ✅ useRelationship composable updated

---

## Related Documents

- Phase 6 Handoff: `project-manager/features/vue-migration/phases/phase-6-handoff.md`
- Session 6.12: Refactor Annotations
- `.cursor/plans/user-types-annotations-migration-log.md`

