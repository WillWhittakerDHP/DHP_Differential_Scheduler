# Phase 9 Session 9.3 Guide: Disambiguation Rename - Type → Kind (Discriminators)

**Feature:** Vue Migration  
**Purpose:** Rename discriminator fields from "type" to "kind" to disambiguate from entity structure definitions (Shape) and runtime instances (Instance)

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.3 - Disambiguation Rename - Type → Kind (Discriminators)
**Status:** Complete

---

## Session Overview

**Session Number:** 9.3
**Session Name:** Disambiguation Rename - Type → Kind (Discriminators)
**Description:** Rename discriminator fields throughout the codebase to use "kind" instead of "type" to avoid confusion with entity structure definitions (Shape) and runtime instances (Instance). This includes:
- `entity_type` → `entity_kind` (in entity_aggregate table and related code)
- `relationshipType` → `relationshipKind` (in relationship types and related code)
- `parent_type` and `child_type` → `parent_kind` and `child_kind` (in relationship models)

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 9.1 (Type → Shape) and Session 9.2 (Profile → Instance) must be complete

---

## Session Objectives

- Rename `entity_type` to `entity_kind` in database models, API routes, and frontend types
- Rename `relationshipType` to `relationshipKind` in types, constants, and components
- Rename `parent_type` and `child_type` to `parent_kind` and `child_kind` in relationship models
- Update all references throughout the codebase
- Ensure type safety is maintained throughout the rename

---

## Key Deliverables

- Database models updated with new field names
- API routes updated to use new field names
- Frontend types updated with new field names
- All transformers updated to use new field names
- All composables updated to use new field names
- All UI components updated to use new field names
- Seed scripts updated with new field names
- All references updated throughout codebase

---

## Detailed Task Breakdown

### Task 9.3.1: Database Model Updates

**Files:**
- `server/src/db/models/scheduler/entity_aggregate.ts`
- `server/src/db/models/scheduler/relationships.ts`
- `server/src/db/models/admin/valid_block.ts`
- `server/src/db/models/admin/valid_part.ts`
- `server/src/db/models/scheduler/active_block.ts`
- `server/src/db/models/scheduler/active_part.ts`

**Steps:**
1. Rename `entity_type` field to `entity_kind` in EntityAggregate model
2. Rename `type` field to `kind` in Relationship model
3. Rename `parent_type` to `parent_kind` in all relationship models
4. Rename `child_type` to `child_kind` in all relationship models
5. Update field definitions in model init methods
6. Update database field mappings if needed

**Code Pattern:**
```typescript
// Before
declare entity_type: CreationOptional<string>;
declare parent_type: CreationOptional<string>;
declare child_type: CreationOptional<string>;

// After
declare entity_kind: CreationOptional<string>;
declare parent_kind: CreationOptional<string>;
declare child_kind: CreationOptional<string>;
```

---

### Task 9.3.2: API Route Updates

**Files:**
- `server/src/routes/internal/entityAggregates/entityAggregateRouter.ts`
- `server/src/routes/internal/relationships/relationshipRouter.ts`

**Steps:**
1. Update query parameter names from `entity_type` to `entity_kind`
2. Update route parameter names from `relationshipType` to `relationshipKind`
3. Update request body field names
4. Update response field names
5. Update error messages to use new field names

**Code Pattern:**
```typescript
// Before
const { entity_type } = req.query;
where.entity_type = entity_type;

// After
const { entity_kind } = req.query;
where.entity_kind = entity_kind;
```

---

### Task 9.3.3: Frontend Type Updates

**Files:**
- `client-vue/src/types/relationships.ts`
- `client-vue/src/types/aggregation.ts`

**Steps:**
1. Update `FetchedRelationship` interface: `parent_type` → `parent_kind`, `child_type` → `child_kind`
2. Update `GlobalRelationship` type: `relationshipType` → `relationshipKind`
3. Update aggregation types: `entity_type` → `entity_kind`
4. Update all type references throughout frontend

**Code Pattern:**
```typescript
// Before
export interface FetchedRelationship {
  parent_type: P
  child_type: C
}
export type GlobalRelationship = {
  relationshipType: GlobalRelationshipKey
}

// After
export interface FetchedRelationship {
  parent_kind: P
  child_kind: C
}
export type GlobalRelationship = {
  relationshipKind: GlobalRelationshipKey
}
```

---

### Task 9.3.4: Transformer Updates

**Files:**
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts`
- `client-vue/src/utils/transformers/aggregationAggregator.ts`

**Steps:**
1. Update transformer functions to use new field names
2. Update property mappings
3. Update type assertions
4. Update all references to old field names

---

### Task 9.3.5: Composable Updates

**Files:**
- `client-vue/src/composables/useAggregatedEntity.ts`

**Steps:**
1. Update composable to use `entity_kind` instead of `entity_type`
2. Update API calls to use new field names
3. Update type references

---

### Task 9.3.6: UI Component Updates

**Files:**
- `client-vue/src/components/admin/generic/fields/NestedCollectionField.vue`
- `client-vue/src/components/admin/generic/collections/NestedCollection.vue`
- `client-vue/src/views/admin/ApiVerification.vue`

**Steps:**
1. Update component props and emits to use `relationshipKind` instead of `relationshipType`
2. Update event handlers
3. Update display logic

---

### Task 9.3.7: Configuration and Constants Updates

**Files:**
- `server/src/config/entityRegistry.ts`
- `client-vue/src/constants/relationships.ts`

**Steps:**
1. Update function parameter names if needed
2. Update type definitions
3. Update constant references

---

### Task 9.3.8: Seed Script Updates

**Files:**
- `server/src/db/seedScripts/seed.ts`

**Steps:**
1. Update seed data to use new field names
2. Update relationship creation to use `parent_kind` and `child_kind`
3. Update entity aggregate creation to use `entity_kind`

---

## Success Criteria

- [x] All database models updated with new field names
- [x] All API routes updated to use new field names
- [x] All frontend types updated with new field names
- [x] All transformers updated to use new field names
- [x] All composables updated to use new field names
- [x] All UI components updated to use new field names
- [x] Seed scripts updated with new field names
- [x] All references updated throughout codebase
- [x] Type safety maintained throughout rename
- [x] Application compiles without errors
- [x] Bug fixes applied for undefined handling
- [x] Naming conventions aligned (block-profile → block-instance, etc.)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md` (to be created)
- Phase Handoff: `project-manager/features/vue-migration/phases/phase-9-handoff.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Session 9.1: Disambiguation Rename - Type → Shape
- Session 9.2: Disambiguation Rename - Profile → Instance

---

## Notes

- This rename is critical for disambiguation - "kind" refers to discriminators (what kind of entity/relationship), while "shape" refers to structure definitions and "instance" refers to runtime instances
- Database migrations will be handled in later sessions (9.5-9.6), so this session focuses on code-level renames only
- All renames should maintain type safety - use TypeScript's type system to catch any missed references
- Test thoroughly after each major section to ensure nothing breaks

