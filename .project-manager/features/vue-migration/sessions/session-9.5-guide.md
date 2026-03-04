# Phase 9 Session 9.5 Guide: Database Schema Changes - Boolean Fields & Service Unification

**Feature:** Vue Migration  
**Purpose:** Add boolean fields to entity tables and unify service entities

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.5 - Database Schema Changes - Boolean Fields & Service Unification
**Status:** ✅ Complete (2025-11-28)

---

## Session Overview

**Session Number:** 9.5
**Session Name:** Database Schema Changes - Boolean Fields & Service Unification
**Description:** 
- Add boolean fields (`active`, `dependent`, `visible`) to entity tables (block_shapes, block_instances, part_shapes, part_instances)
- Unify `base_service` and `additional_service` entity kinds into unified `service` entity kind
- Update ValidCascade relationships to reflect service unification
- Update ActiveComposition relationships to reflect service unification

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 9.4 (Disambiguation Rename - Relationship Models) must be complete

---

## Session Objectives

- Add `active` boolean field to all entity tables (block_shapes, block_instances, part_shapes, part_instances)
- Add `dependent` boolean field to all entity tables
- Add `visible` boolean field to all entity tables (or map existing `visibility` field)
- Create database migration for boolean field additions
- Update Sequelize models with new boolean fields
- Unify `base_service` and `additional_service` entity kinds into `service`
- Update entity registry to reflect service unification
- Update ValidCascade relationships to use unified service
- Update ActiveComposition relationships to use unified service
- Update seed scripts to use unified service
- Update frontend types and constants to reflect changes
- Ensure type safety is maintained throughout changes

---

## Key Deliverables

- Database migration adding boolean fields (`active`, `dependent`, `visible`)
- Sequelize models updated with new boolean fields
- Entity registry updated for service unification
- ValidCascade relationships updated
- ActiveComposition relationships updated
- Seed scripts updated
- Frontend types updated
- Frontend constants updated
- All references to `base_service` and `additional_service` updated to `service`

---

## Detailed Task Breakdown

### Task 9.5.1: Add Boolean Fields to Database Schema

**Files:**
- `server/src/db/migrations/[timestamp]_add_boolean_fields_to_entities.js` (new migration)

**Steps:**
1. Create migration file to add boolean fields to entity tables:
   - `block_shapes`: Add `active`, `dependent`, `visible` (default: true for active, false for dependent, true for visible)
   - `block_instances`: Add `active`, `dependent` (check if `visibility` exists, may need to rename or add `visible`)
   - `part_shapes`: Add `active`, `dependent`, `visible`
   - `part_instances`: Add `active`, `dependent`, `visible`
2. Add appropriate default values
3. Add indexes if needed for filtering
4. Test migration up and down

**Migration Pattern:**
```javascript
// Add boolean fields to block_shapes
await queryInterface.addColumn('block_shapes', 'active', {
  type: Sequelize.BOOLEAN,
  allowNull: false,
  defaultValue: true,
});

await queryInterface.addColumn('block_shapes', 'dependent', {
  type: Sequelize.BOOLEAN,
  allowNull: false,
  defaultValue: false,
});

await queryInterface.addColumn('block_shapes', 'visible', {
  type: Sequelize.BOOLEAN,
  allowNull: false,
  defaultValue: true,
});

// Repeat for other entity tables...
```

---

### Task 9.5.2: Update BlockShape Model

**Files:**
- `server/src/db/models/admin/block_shape.ts`

**Steps:**
1. Add `active`, `dependent`, `visible` fields to model declaration
2. Add field definitions in `init()` method
3. Update TypeScript types
4. Ensure field mappings are correct (snake_case in DB, camelCase in model)

**Code Pattern:**
```typescript
export class BlockShape extends Model<...> {
  declare id: CreationOptional<string>;
  declare order_index: CreationOptional<number>;
  declare name: string;
  declare allow_multiple_parts: boolean;
  declare allow_multiple_blocks: boolean;
  declare poolable: boolean;
  declare disabled: boolean;
  declare active: boolean; // NEW
  declare dependent: boolean; // NEW
  declare visible: boolean; // NEW
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // ...
}
```

---

### Task 9.5.3: Update BlockInstance Model

**Files:**
- `server/src/db/models/scheduler/block_instance.ts`

**Steps:**
1. Check if `visibility` field exists - decide whether to rename to `visible` or keep both
2. Add `active`, `dependent` fields to model declaration
3. Add `visible` field if not already present (or map `visibility` to `visible`)
4. Update field definitions in `init()` method
5. Update TypeScript types

**Note:** BlockInstance already has `visibility` field. Consider:
- Option A: Rename `visibility` → `visible` (more consistent)
- Option B: Keep `visibility` and add `visible` as alias
- Option C: Keep `visibility` and use it as the `visible` field

---

### Task 9.5.4: Update PartShape Model

**Files:**
- `server/src/db/models/admin/part_shape.ts`

**Steps:**
1. Add `active`, `dependent`, `visible` fields to model declaration
2. Add field definitions in `init()` method
3. Update TypeScript types

---

### Task 9.5.5: Update PartInstance Model

**Files:**
- `server/src/db/models/scheduler/part_instance.ts`

**Steps:**
1. Add `active`, `dependent`, `visible` fields to model declaration
2. Add field definitions in `init()` method
3. Update TypeScript types

---

### Task 9.5.6: Unify Service Entity Kinds

**Files:**
- `server/src/config/entityRegistry.ts`
- Seed scripts referencing `base_service` or `additional_service`
- Any code that distinguishes between base_service and additional_service

**Steps:**
1. Search codebase for references to `base_service` and `additional_service`
2. Identify where these entity kinds are used
3. Update entity registry to use unified `service` entity kind
4. Update seed scripts to use `service` instead of `base_service`/`additional_service`
5. Update any conditional logic that distinguishes between base and additional services
6. Consider adding a discriminator field if needed (e.g., `service_type` enum: 'base' | 'additional')

**Code Pattern:**
```typescript
// Before
if (entityKind === 'base_service' || entityKind === 'additional_service') {
  // ...
}

// After
if (entityKind === 'service') {
  // Check service_type if distinction needed
  // ...
}
```

---

### Task 9.5.7: Update ValidCascade Relationships

**Files:**
- `server/src/db/models/admin/valid_cascade.ts`
- Seed scripts creating ValidCascade relationships
- Any code that creates or queries ValidCascade with service entities

**Steps:**
1. Update ValidCascade seed data to use unified `service` entity kind
2. Update any queries filtering by `base_service` or `additional_service`
3. Update relationship creation logic
4. Ensure cascade relationships work with unified service

---

### Task 9.5.8: Update ActiveComposition Relationships

**Files:**
- `server/src/db/models/scheduler/active_composition.ts`
- Seed scripts creating ActiveComposition relationships
- Any code that creates or queries ActiveComposition with service entities

**Steps:**
1. Update ActiveComposition seed data to use unified `service` entity kind
2. Update any queries filtering by `base_service` or `additional_service`
3. Update composition creation logic
4. Ensure composition relationships work with unified service

---

### Task 9.5.9: Update Frontend Types

**Files:**
- `client-vue/src/types/entities.ts`
- `client-vue/src/types/relationships.ts`

**Steps:**
1. Add `active`, `dependent`, `visible` fields to entity type interfaces
2. Update GlobalEntity type definitions
3. Update relationship types if needed
4. Ensure type safety is maintained

**Code Pattern:**
```typescript
export interface BlockInstanceEntity extends GlobalEntityBase<"blockInstance"> {
  // ... existing fields
  active: boolean; // NEW
  dependent: boolean; // NEW
  visible: boolean; // NEW (or map from visibility)
}
```

---

### Task 9.5.10: Update Frontend Constants

**Files:**
- `client-vue/src/constants/entities.ts` (if exists)
- `client-vue/src/constants/relationships.ts`

**Steps:**
1. Update entity kind constants to use unified `service`
2. Remove `base_service` and `additional_service` constants
3. Add `service` constant if not exists
4. Update any references to old constants

---

### Task 9.5.11: Update Seed Scripts

**Files:**
- `server/src/db/seedScripts/**/*.ts` and `**/*.json`

**Steps:**
1. Search for references to `base_service` and `additional_service` in seed scripts
2. Update to use unified `service` entity kind
3. Add `active`, `dependent`, `visible` values to seed data
4. Ensure seed data is consistent with new schema

---

### Task 9.5.12: Update Transformers

**Files:**
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts`
- `client-vue/src/utils/transformers/globalToAdminTransformer.ts`
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts`

**Steps:**
1. Update transformers to include new boolean fields
2. Map `visibility` to `visible` if needed
3. Ensure transformers handle unified `service` entity kind
4. Update type mappings

---

### Task 9.5.13: Update Composables

**Files:**
- `client-vue/src/composables/useEntity.ts`
- `client-vue/src/composables/useRelationship.ts`
- `client-vue/src/composables/useCompositionEntity.ts`

**Steps:**
1. Update composables to use new boolean fields
2. Update filtering logic to use `active`, `dependent`, `visible`
3. Update entity kind references to use unified `service`
4. Ensure composables work with updated types

---

### Task 9.5.14: Update UI Components

**Files:**
- Components that display or filter by entity active/dependent/visible status
- Components that reference `base_service` or `additional_service`

**Steps:**
1. Search for components using old entity kinds
2. Update to use unified `service`
3. Add UI controls for `active`, `dependent`, `visible` if needed
4. Update filtering logic to use new boolean fields

---

### Task 9.5.15: Verify All Changes

**Steps:**
1. Run database migration and verify schema changes
2. Verify Sequelize models compile correctly
3. Verify TypeScript compilation passes
4. Verify seed scripts run successfully
5. Verify API endpoints return new fields
6. Verify frontend types are correct
7. Test entity creation/update with new fields
8. Test service unification works correctly
9. Verify ValidCascade relationships work
10. Verify ActiveComposition relationships work

---

## Success Criteria

- [ ] Database migration created and executed successfully
- [ ] All entity models updated with `active`, `dependent`, `visible` fields
- [ ] `base_service` and `additional_service` unified into `service`
- [ ] Entity registry updated
- [ ] ValidCascade relationships updated
- [ ] ActiveComposition relationships updated
- [ ] Seed scripts updated
- [ ] Frontend types updated
- [ ] Frontend constants updated
- [ ] Transformers updated
- [ ] Composables updated
- [ ] UI components updated (if needed)
- [ ] Type safety maintained throughout
- [ ] Application compiles without errors
- [ ] Database schema matches model definitions
- [ ] All tests pass (if applicable)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md` (if exists)
- Session 9.4 Summary: `project-manager/features/vue-migration/sessions/session-9.4-summary.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

---

## Notes

- **Boolean Fields Purpose:**
  - `active`: Whether the entity is currently active/enabled
  - `dependent`: Whether the entity depends on another entity (e.g., additional service depends on base service)
  - `visible`: Whether the entity should be shown in selection lists/UI

- **Service Unification:**
  - `base_service` and `additional_service` are being unified into a single `service` entity kind
  - May need to add a discriminator field (e.g., `service_type`) if distinction is still needed
  - Consider backward compatibility during migration

- **BlockInstance Visibility:**
  - BlockInstance already has `visibility` field
  - Need to decide: rename to `visible` for consistency, or keep both
  - Recommendation: Rename `visibility` → `visible` for consistency across all entities

- **Migration Strategy:**
  - Add new fields with safe defaults
  - Update code to use new fields
  - Migrate existing data if needed
  - Remove old fields/entity kinds after verification

---

### Why These Patterns Matter
- Boolean fields provide flexible filtering and display control
- Unified entity kinds simplify codebase and reduce complexity
- Consistent field naming improves maintainability
- Proper migrations ensure data integrity

### How This Relates to Existing Code
- Builds on Session 9.4 (relationship model renames)
- Prepares for future relationship model enhancements
- Establishes foundation for entity state management

---

## Potential Issues and Solutions

### Issue 1: BlockInstance Already Has `visibility` Field
**Solution:** Rename `visibility` → `visible` for consistency, or map `visibility` to `visible` in transformers

### Issue 2: Existing Data Needs Migration
**Solution:** Create data migration script to set default values for new boolean fields based on existing data

### Issue 3: Service Unification May Break Existing Logic
**Solution:** Add discriminator field (`service_type`) if distinction is needed, update logic gradually

### Issue 4: Foreign Key Constraints
**Solution:** Ensure foreign key constraints are updated if table structures change significantly
