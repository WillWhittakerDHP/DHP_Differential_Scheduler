# Phase 9 Session 9.7 Guide: Model Layer Updates - Field Mapping Cleanup & Schema Alignment

**Feature:** Vue Migration  
**Purpose:** Clean up Sequelize model field mappings and ensure all models align with database schema

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.7 - Model Layer Updates - Field Mapping Cleanup & Schema Alignment
**Status:** ✅ Complete (2025-11-29)

---

## Session Overview

**Session Number:** 9.7
**Session Name:** Model Layer Updates - Field Mapping Cleanup & Schema Alignment
**Description:** 
- Remove unnecessary field mappings from Sequelize models (when `underscored: true` handles conversion)
- Ensure all models align with database schema after migrations
- Update Relationship model to use `kind` instead of `type` (if migration exists)
- Clean up field mapping comments and ensure consistency
- Verify all models compile correctly and match database schema

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 9.6 (Database Schema Changes - Composition Extension & ValidComposition) must be complete

---

## Session Objectives

- Review all Sequelize models for unnecessary field mappings
- Remove redundant `field:` mappings when `underscored: true` handles conversion automatically
- Update Relationship model if migration exists for `type` → `kind` rename
- Ensure all models match database schema after recent migrations
- Clean up field mapping comments
- Verify TypeScript compilation passes
- Verify all models work correctly with database

---

## Key Deliverables

- Cleaned up field mappings in all Sequelize models
- Relationship model updated (if migration exists)
- All models verified to match database schema
- Consistent field mapping patterns across all models
- TypeScript compilation passes
- All models tested and working correctly

---

## Detailed Task Breakdown

### Task 9.7.1: Review All Models for Field Mapping Patterns

**Files:**
- All files in `server/src/db/models/`

**Steps:**
1. List all models and their field mappings
2. Identify patterns:
   - Models with `underscored: true` that have explicit `field:` mappings for snake_case columns
   - Models with unnecessary field mappings (Sequelize handles conversion automatically)
   - Models with field mappings that are actually needed (camelCase properties → snake_case columns)
3. Document which field mappings are necessary vs unnecessary

**Note:** When `underscored: true` is set, Sequelize automatically converts camelCase properties to snake_case columns. Explicit `field:` mappings are only needed when:
- The property name doesn't match the column name (e.g., `createdAt` → `created_at` is automatic, but `entity_kind` → `entityKind` would need mapping)
- The column name is different from the automatic conversion

---

### Task 9.7.2: Remove Unnecessary Field Mappings

**Files:**
- `server/src/db/models/scheduler/active_cascade.ts`
- `server/src/db/models/scheduler/active_constituent.ts`
- `server/src/db/models/admin/valid_cascade.ts`
- `server/src/db/models/admin/valid_constituent.ts`
- `server/src/db/models/admin/block_shape.ts`
- `server/src/db/models/admin/part_shape.ts`
- Other models with unnecessary field mappings

**Steps:**
1. Remove `field: 'disabled'` mappings when property is `disabled` (automatic conversion handles `disabled` → `disabled`)
2. Remove field mappings for standard fields that match automatic conversion
3. Keep field mappings only when necessary (e.g., `createdAt` → `created_at` is automatic, but verify)
4. Update comments to remove outdated field mapping notes

**Pattern to Remove:**
```typescript
disabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  field: 'disabled', // if snake_case in DB - REMOVE THIS, underscored handles it
},
```

**Pattern to Keep:**
```typescript
entity_kind: {
  type: DataTypes.STRING,
  allowNull: false,
  field: 'entity_kind', // Keep if property name is camelCase but column is snake_case
},
```

---

### Task 9.7.3: Update Relationship Model (if needed)

**Files:**
- `server/src/db/models/scheduler/relationships.ts`

**Steps:**
1. Check if migration exists to rename `type` → `kind`, `parent_type` → `parent_kind`, `child_type` → `child_kind` in `relationships` table
2. If migration exists:
   - Update field mappings from `field: 'type'` → `field: 'kind'`
   - Update field mappings from `field: 'parent_type'` → `field: 'parent_kind'`
   - Update field mappings from `field: 'child_type'` → `field: 'child_kind'`
   - Update comments to remove "until migration" notes
3. If migration doesn't exist:
   - Document that Relationship model still uses old column names
   - Note that this will be handled in a future session

**Current Pattern (if migration exists):**
```typescript
kind: {
  type: DataTypes.STRING,
  allowNull: false,
  field: 'kind', // Changed from 'type' after migration
},
```

---

### Task 9.7.4: Verify ActiveComposition Field Mappings

**Files:**
- `server/src/db/models/scheduler/active_composition.ts`

**Steps:**
1. Review field mappings after Session 9.6 changes
2. Verify `entity_kind` field mapping is correct
3. Verify `aggregate_id` and `particle_id` field mappings are correct
4. Verify `created_at` and `updated_at` field mappings (should be automatic with `underscored: true`)
5. Remove unnecessary field mappings if any

**Note:** ActiveComposition was updated in Session 9.6, but we should verify field mappings are optimal.

---

### Task 9.7.5: Verify All Models Match Database Schema

**Files:**
- All model files in `server/src/db/models/`

**Steps:**
1. For each model, verify:
   - Field names match database columns (after automatic conversion)
   - Field types match database column types
   - Indexes match database indexes
   - Foreign key references are correct
   - Table names match database tables
2. Compare model definitions with actual database schema
3. Document any discrepancies

**Verification Checklist:**
- [ ] BlockShape model matches `block_shapes` table
- [ ] BlockInstance model matches `block_instances` table
- [ ] PartShape model matches `part_shapes` table
- [ ] PartInstance model matches `part_instances` table
- [ ] ActiveCascade model matches `active_cascades` table
- [ ] ActiveConstituent model matches `active_constituents` table
- [ ] ActiveComposition model matches `active_compositions` table
- [ ] ValidCascade model matches `valid_cascades` table
- [ ] ValidConstituent model matches `valid_constituents` table
- [ ] ValidComposition model matches `valid_compositions` table
- [ ] Relationship model matches `relationships` table (if still exists)

---

### Task 9.7.6: Clean Up Comments and Documentation

**Files:**
- All model files

**Steps:**
1. Remove outdated comments about field mappings
2. Update comments to reflect current state
3. Remove "if snake_case in DB" comments (no longer needed)
4. Ensure comments are accurate and helpful
5. Add LEARNING/WHY/PATTERN comments where appropriate (following codebase patterns)

---

### Task 9.7.7: Verify TypeScript Compilation

**Steps:**
1. Run TypeScript compilation: `cd server && npm run build` or `npx tsc --noEmit`
2. Fix any type errors
3. Verify all models compile without errors
4. Verify no type assertions are needed

---

### Task 9.7.8: Test Model Functionality

**Steps:**
1. Verify application starts successfully
2. Test basic CRUD operations for each model
3. Verify relationships work correctly
4. Verify queries return expected data
5. Document any issues found

---

## Success Criteria

- [ ] All unnecessary field mappings removed
- [ ] All models verified to match database schema
- [ ] Relationship model updated (if migration exists)
- [ ] Field mapping comments cleaned up
- [ ] TypeScript compilation passes without errors
- [ ] All models tested and working correctly
- [ ] Consistent field mapping patterns across all models
- [ ] Application starts successfully
- [ ] No type assertions needed

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md` (if exists)
- Session 9.6 Summary: `project-manager/features/vue-migration/sessions/session-9.6-summary.md`
- Session 9.5 Summary: `project-manager/features/vue-migration/sessions/session-9.5-summary.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

---

## Notes

- **Field Mapping Strategy:**
  - When `underscored: true` is set, Sequelize automatically converts camelCase properties to snake_case columns
  - Explicit `field:` mappings are only needed when the property name doesn't match the automatic conversion
  - Example: `createdAt` → `created_at` is automatic, so `field: 'created_at'` is unnecessary
  - Example: `entity_kind` (property) → `entity_kind` (column) matches, so `field:` mapping may be unnecessary if property is already snake_case

- **Model Alignment:**
  - After multiple migrations, models should be verified to match database schema
  - This session ensures consistency between models and database
  - Helps prevent runtime errors from mismatched field names

- **Relationship Model:**
  - The `relationships` table may still use `type` columns (not migrated yet)
  - If migration exists, update model accordingly
  - If migration doesn't exist, document for future session

---

### Why These Patterns Matter
- Unnecessary field mappings add complexity without benefit
- Consistent patterns improve code maintainability
- Proper alignment prevents runtime errors
- Clean models are easier to understand and maintain

### How This Relates to Existing Code
- Builds on Session 9.6 (database schema changes)
- Completes model layer refactoring started in Phase 9
- Prepares for future model enhancements
- Ensures consistency across all models

---

## Potential Issues and Solutions

### Issue 1: Field Mappings May Be Needed for Backward Compatibility
**Solution:** Verify database schema first. If columns are snake_case and properties are camelCase, keep mappings. If both are snake_case, remove mappings.

### Issue 2: Some Models May Have Custom Field Names
**Solution:** Keep field mappings for custom names. Only remove mappings for standard conversions handled by `underscored: true`.

### Issue 3: Relationship Model May Not Have Migration Yet
**Solution:** Document current state. If migration doesn't exist, leave model as-is and note for future session.

### Issue 4: Removing Field Mappings May Break Existing Code
**Solution:** Test thoroughly after changes. Verify queries and associations still work correctly.

---

## Session Start Checklist

Before starting this session, verify:
- [ ] Session 9.6 is complete (Database Schema Changes - Composition Extension & ValidComposition)
- [ ] Database migrations from 9.6 are applied
- [ ] TypeScript compilation passes
- [ ] Application starts successfully
- [ ] All models exist and are accessible

---

## Next Session

**Session 9.8:** [To be determined based on phase plan]

---

## Field Mapping Analysis

### Models with `underscored: true`:
- ActiveCascade
- ActiveConstituent
- ActiveComposition
- ValidCascade
- ValidConstituent
- ValidComposition
- BlockShape
- BlockInstance
- PartShape
- PartInstance
- Relationship

### Field Mapping Rules:
1. **Automatic conversion** (no `field:` needed):
   - `createdAt` → `created_at` ✓
   - `updatedAt` → `updated_at` ✓
   - `parentId` → `parent_id` ✓
   - `childId` → `child_id` ✓
   - `disabled` → `disabled` ✓ (same name)

2. **May need `field:` mapping**:
   - `entity_kind` (property) → `entity_kind` (column) - check if property is camelCase or snake_case
   - `aggregate_id` (property) → `aggregate_id` (column) - check if property is camelCase or snake_case
   - `particle_id` (property) → `particle_id` (column) - check if property is camelCase or snake_case

3. **Definitely need `field:` mapping**:
   - `kind` (property) → `type` (column) - if migration hasn't happened yet
   - `parent_kind` (property) → `parent_type` (column) - if migration hasn't happened yet
   - `child_kind` (property) → `child_type` (column) - if migration hasn't happened yet
