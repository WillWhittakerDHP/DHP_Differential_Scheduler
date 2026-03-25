# Phase 9 Session 9.4 Guide: Disambiguation Rename - Relationship Models

**Feature:** Vue Migration  
**Purpose:** Rename relationship models to clarify three-dimensional relationship model (Cascade, Constituent, Composition) and create ValidComposition model

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.4 - Disambiguation Rename - Relationship Models
**Status:** ✅ Complete (2025-11-28)

---

## Session Overview

**Session Number:** 9.4
**Session Name:** Disambiguation Rename - Relationship Models
**Description:** Rename relationship models throughout the codebase to clarify the three-dimensional relationship model:
- `ValidBlock` → `ValidCascade` (vertical hierarchy, different shapes)
- `ActiveBlock` → `ActiveCascade` (vertical hierarchy, different shapes)
- `ValidPart` → `ValidConstituent` (Block → Part relationships)
- `ActivePart` → `ActiveConstituent` (Block → Part relationships)
- `EntityAggregate` → `ActiveComposition` (lateral aggregation, same shape)
- Create new `ValidComposition` model (shape-level composition)

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 9.1 (Type → Shape), Session 9.2 (Profile → Instance), and Session 9.3 (Type → Kind) must be complete

---

## Session Objectives

- Rename `ValidBlock` to `ValidCascade` in all files, models, and references
- Rename `ActiveBlock` to `ActiveCascade` in all files, models, and references
- Rename `ValidPart` to `ValidConstituent` in all files, models, and references
- Rename `ActivePart` to `ActiveConstituent` in all files, models, and references
- Rename `EntityAggregate` to `ActiveComposition` in all files, models, and references
- Create new `ValidComposition` model for shape-level composition
- Update all model associations in `models/index.ts`
- Update relationship router with new model names
- Update relationship constants and types
- Ensure type safety is maintained throughout the rename

---

## Key Deliverables

- Database models renamed (ValidCascade, ActiveCascade, ValidConstituent, ActiveConstituent, ActiveComposition)
- ValidComposition model created
- Database table names updated (via model tableName options)
- All API routes updated to use new model names
- Frontend types updated with new relationship names
- All transformers updated to use new relationship names
- All composables updated to use new relationship names
- All UI components updated to use new relationship names
- Relationship constants updated
- Model associations updated
- All references updated throughout codebase

---

## Detailed Task Breakdown

### Task 9.4.1: Rename ValidBlock → ValidCascade

**Files:**
- `server/src/db/models/admin/valid_block.ts` → `server/src/db/models/admin/valid_cascade.ts`
- `server/src/db/models/index.ts` (update imports and associations)
- `server/src/routes/internal/relationships/relationshipRouter.ts` (update registry)
- `client-vue/src/constants/relationships.ts` (update constants)
- `client-vue/src/types/relationships.ts` (update types)
- All files referencing ValidBlock

**Steps:**
1. Rename model file: `valid_block.ts` → `valid_cascade.ts`
2. Update model class name: `ValidBlock` → `ValidCascade`
3. Update table name: `valid_blocks` → `valid_cascades`
4. Update all imports throughout codebase
5. Update model associations in `models/index.ts`
6. Update relationship router registry
7. Update frontend constants and types
8. Update all references (grep for `ValidBlock`, `validBlock`, `valid_block`, `valid_blocks`)

**Code Pattern:**
```typescript
// Before
export class ValidBlock extends Model<InferAttributes<ValidBlock>, InferCreationAttributes<ValidBlock>> {
  static tableName = 'valid_blocks';
}

// After
export class ValidCascade extends Model<InferAttributes<ValidCascade>, InferCreationAttributes<ValidCascade>> {
  static tableName = 'valid_cascades';
}
```

---

### Task 9.4.2: Rename ActiveBlock → ActiveCascade

**Files:**
- `server/src/db/models/scheduler/active_block.ts` → `server/src/db/models/scheduler/active_cascade.ts`
- `server/src/db/models/index.ts` (update imports and associations)
- `server/src/routes/internal/relationships/relationshipRouter.ts` (update registry)
- `client-vue/src/constants/relationships.ts` (update constants)
- `client-vue/src/types/relationships.ts` (update types)
- All files referencing ActiveBlock

**Steps:**
1. Rename model file: `active_block.ts` → `active_cascade.ts`
2. Update model class name: `ActiveBlock` → `ActiveCascade`
3. Update table name: `active_blocks` → `active_cascades`
4. Update all imports throughout codebase
5. Update model associations in `models/index.ts`
6. Update relationship router registry
7. Update frontend constants and types
8. Update all references (grep for `ActiveBlock`, `activeBlock`, `active_block`, `active_blocks`)

---

### Task 9.4.3: Rename ValidPart → ValidConstituent

**Files:**
- `server/src/db/models/admin/valid_part.ts` → `server/src/db/models/admin/valid_constituent.ts`
- `server/src/db/models/index.ts` (update imports and associations)
- `server/src/routes/internal/relationships/relationshipRouter.ts` (update registry)
- `client-vue/src/constants/relationships.ts` (update constants)
- `client-vue/src/types/relationships.ts` (update types)
- All files referencing ValidPart

**Steps:**
1. Rename model file: `valid_part.ts` → `valid_constituent.ts`
2. Update model class name: `ValidPart` → `ValidConstituent`
3. Update table name: `valid_parts` → `valid_constituents`
4. Update all imports throughout codebase
5. Update model associations in `models/index.ts`
6. Update relationship router registry
7. Update frontend constants and types
8. Update all references (grep for `ValidPart`, `validPart`, `valid_part`, `valid_parts`)

---

### Task 9.4.4: Rename ActivePart → ActiveConstituent

**Files:**
- `server/src/db/models/scheduler/active_part.ts` → `server/src/db/models/scheduler/active_constituent.ts`
- `server/src/db/models/index.ts` (update imports and associations)
- `server/src/routes/internal/relationships/relationshipRouter.ts` (update registry)
- `client-vue/src/constants/relationships.ts` (update constants)
- `client-vue/src/types/relationships.ts` (update types)
- All files referencing ActivePart

**Steps:**
1. Rename model file: `active_part.ts` → `active_constituent.ts`
2. Update model class name: `ActivePart` → `ActiveConstituent`
3. Update table name: `active_parts` → `active_constituents`
4. Update all imports throughout codebase
5. Update model associations in `models/index.ts`
6. Update relationship router registry
7. Update frontend constants and types
8. Update all references (grep for `ActivePart`, `activePart`, `active_part`, `active_parts`)

---

### Task 9.4.5: Rename EntityAggregate → ActiveComposition

**Files:**
- `server/src/db/models/scheduler/entity_aggregate.ts` → `server/src/db/models/scheduler/active_composition.ts`
- `server/src/db/models/index.ts` (update imports and associations)
- `server/src/routes/internal/entityAggregates/entityAggregateRouter.ts` → `server/src/routes/internal/compositions/compositionRouter.ts` (rename router)
- `client-vue/src/constants/relationships.ts` (update constants)
- `client-vue/src/types/aggregation.ts` → `client-vue/src/types/composition.ts` (rename and update types)
- `client-vue/src/composables/useAggregatedEntity.ts` → `client-vue/src/composables/useCompositionEntity.ts` (rename composable)
- All files referencing EntityAggregate

**Steps:**
1. Rename model file: `entity_aggregate.ts` → `active_composition.ts`
2. Update model class name: `EntityAggregate` → `ActiveComposition`
3. Update table name: `entity_aggregates` → `active_compositions`
4. Rename router file: `entityAggregateRouter.ts` → `compositionRouter.ts`
5. Update router class name and route paths
6. Update all imports throughout codebase
7. Update model associations in `models/index.ts`
8. Update frontend constants and types
9. Rename composable: `useAggregatedEntity.ts` → `useCompositionEntity.ts`
10. Update all references (grep for `EntityAggregate`, `entityAggregate`, `entity_aggregate`, `entity_aggregates`)

**Code Pattern:**
```typescript
// Before
export class EntityAggregate extends Model<InferAttributes<EntityAggregate>, InferCreationAttributes<EntityAggregate>> {
  static tableName = 'entity_aggregates';
}

// After
export class ActiveComposition extends Model<InferAttributes<ActiveComposition>, InferCreationAttributes<ActiveComposition>> {
  static tableName = 'active_compositions';
}
```

---

### Task 9.4.6: Create ValidComposition Model

**Files:**
- `server/src/db/models/admin/valid_composition.ts` (new file)
- `server/src/db/models/index.ts` (add import and associations)
- `server/src/routes/internal/relationships/relationshipRouter.ts` (add to registry)
- `client-vue/src/constants/relationships.ts` (add constants)
- `client-vue/src/types/relationships.ts` (add types)

**Steps:**
1. Create new model file: `valid_composition.ts`
2. Define model structure (similar to ActiveComposition but for shapes)
3. Define table name: `valid_compositions`
4. Add associations to BlockShape and PartShape
5. Add to model index imports and associations
6. Add to relationship router registry
7. Add to frontend constants and types
8. Add comments explaining shape-level composition purpose

**Model Structure:**
```typescript
export class ValidComposition extends Model<InferAttributes<ValidComposition>, InferCreationAttributes<ValidComposition>> {
  declare id: CreationOptional<number>;
  declare parent_shape_id: ForeignKey<number>;
  declare child_shape_id: ForeignKey<number>;
  // ... other fields similar to ActiveComposition but for shapes
  static tableName = 'valid_compositions';
}
```

---

### Task 9.4.7: Update Model Associations

**Files:**
- `server/src/db/models/index.ts`

**Steps:**
1. Update all imports to use new model names
2. Update association definitions (belongsTo, hasMany, etc.)
3. Update association aliases if needed
4. Add ValidComposition associations
5. Verify all associations compile correctly

---

### Task 9.4.8: Update Relationship Router

**Files:**
- `server/src/routes/internal/relationships/relationshipRouter.ts`

**Steps:**
1. Update RELATIONSHIP_REGISTRY with new model names
2. Update relationship type constants
3. Update route handlers to use new model names
4. Add validCompositions and activeCompositions to registry
5. Update comments to clarify relationship purposes (cascade, constituent, composition)
6. Update error messages to use new names

---

### Task 9.4.9: Update Relationship Constants

**Files:**
- `client-vue/src/constants/relationships.ts`

**Steps:**
1. Update relationship key constants (validBlock → validCascade, etc.)
2. Add validComposition and activeComposition constants
3. Update relationship type definitions
4. Add comments clarifying relationship purposes
5. Update all relationship key references

**Code Pattern:**
```typescript
// Before
export const RELATIONSHIP_KEYS = {
  validBlock: 'validBlock',
  activeBlock: 'activeBlock',
  validPart: 'validPart',
  activePart: 'activePart',
  entityAggregate: 'entityAggregate',
} as const;

// After
export const RELATIONSHIP_KEYS = {
  validCascade: 'validCascade',
  activeCascade: 'activeCascade',
  validConstituent: 'validConstituent',
  activeConstituent: 'activeConstituent',
  validComposition: 'validComposition',
  activeComposition: 'activeComposition',
} as const;
```

---

### Task 9.4.10: Update Frontend Types

**Files:**
- `client-vue/src/types/relationships.ts`
- `client-vue/src/types/aggregation.ts` → `client-vue/src/types/composition.ts` (rename)

**Steps:**
1. Update relationship type definitions
2. Rename aggregation types to composition types
3. Update type references throughout frontend
4. Add ValidComposition and ActiveComposition types
5. Update GlobalRelationship type to include new relationship keys

---

### Task 9.4.11: Update Transformers

**Files:**
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts`
- `client-vue/src/utils/transformers/aggregationAggregator.ts` → `client-vue/src/utils/transformers/compositionAggregator.ts` (rename)

**Steps:**
1. Update transformer functions to use new relationship names
2. Rename aggregation transformer to composition transformer
3. Update property mappings
4. Update type references
5. Update all references to old relationship names

---

### Task 9.4.12: Update Composables

**Files:**
- `client-vue/src/composables/useAggregatedEntity.ts` → `client-vue/src/composables/useCompositionEntity.ts` (rename)
- `client-vue/src/composables/useAdmin.ts` (update references)

**Steps:**
1. Rename composable file and function name
2. Update API calls to use new relationship names
3. Update type references
4. Update all references to old composable name

---

### Task 9.4.13: Update UI Components

**Files:**
- All components referencing old relationship names
- Search for: `validBlock`, `activeBlock`, `validPart`, `activePart`, `entityAggregate`

**Steps:**
1. Update component props and emits
2. Update event handlers
3. Update display logic
4. Update relationship filtering logic
5. Update all references to old relationship names

---

### Task 9.4.14: Update Seed Scripts

**Files:**
- `server/src/db/seedScripts/seed.ts`

**Steps:**
1. Update seed data to use new model names
2. Update relationship creation to use new model names
3. Add ValidComposition seed data if needed
4. Update all references to old model names

---

### Task 9.4.15: Verify All References Updated

**Steps:**
1. Run grep searches for all old names:
   - `ValidBlock`, `validBlock`, `valid_block`, `valid_blocks`
   - `ActiveBlock`, `activeBlock`, `active_block`, `active_blocks`
   - `ValidPart`, `validPart`, `valid_part`, `valid_parts`
   - `ActivePart`, `activePart`, `active_part`, `active_parts`
   - `EntityAggregate`, `entityAggregate`, `entity_aggregate`, `entity_aggregates`
2. Verify no old references remain (except in comments explaining the rename)
3. Verify TypeScript compilation passes
4. Verify all imports resolve correctly

---

## Success Criteria

- [ ] All database models renamed (ValidCascade, ActiveCascade, ValidConstituent, ActiveConstituent, ActiveComposition)
- [ ] ValidComposition model created
- [ ] Database table names updated (via model tableName options)
- [ ] All API routes updated to use new model names
- [ ] All frontend types updated with new relationship names
- [ ] All transformers updated to use new relationship names
- [ ] All composables updated to use new relationship names
- [ ] All UI components updated to use new relationship names
- [ ] Relationship constants updated
- [ ] Model associations updated
- [ ] All references updated throughout codebase
- [ ] Type safety maintained throughout rename
- [ ] Application compiles without errors
- [ ] No old references remain (except in comments)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md`
- Phase Handoff: `project-manager/features/vue-migration/phases/phase-9-handoff.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Session 9.1: Disambiguation Rename - Type → Shape
- Session 9.2: Disambiguation Rename - Profile → Instance
- Session 9.3: Disambiguation Rename - Type → Kind (Discriminators)

---

## Notes

- This rename clarifies the three-dimensional relationship model:
  - **Cascade**: Vertical hierarchy (different shapes, e.g., `user_shape → service`)
  - **Constituent**: Block → Part relationships (math dimension)
  - **Composition**: Lateral aggregation (same shape, e.g., `service → service`)
- Database table renames will be handled in later sessions (9.5-9.6), so this session focuses on code-level renames only
- Model `tableName` options will be updated to point to new table names, but actual database migrations come later
- All renames should maintain type safety - use TypeScript's type system to catch any missed references
- Test thoroughly after each major section to ensure nothing breaks
- ValidComposition is new - it represents shape-level composition (which shapes can compose), while ActiveComposition represents instance-level composition (which instances are composed)

---

### Why These Patterns Matter
- Clear naming prevents confusion between relationship types
- Cascade vs Constituent vs Composition clarifies relationship purposes
- Type safety ensures compile-time error detection
- Consistent naming across codebase improves maintainability

### How This Relates to Existing Code
- Builds on Session 9.1 (Type → Shape), Session 9.2 (Profile → Instance), and Session 9.3 (Type → Kind)
- Prepares for database migrations (Sessions 9.5-9.6) and model updates (Session 9.7)
