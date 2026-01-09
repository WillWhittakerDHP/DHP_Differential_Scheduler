# Phase 9 Session 9.16 Guide: Data Migration - Seed Data & Scripts

**Feature:** Vue Migration  
**Purpose:** Update seed data to use new naming conventions (Shape/Instance/Kind) and verify migration scripts are complete and correct

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 9 - Three-Dimensional Relationship Model Refactoring
**Session:** 9.16 - Data Migration - Seed Data & Scripts
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 9.16
**Session Name:** Data Migration - Seed Data & Scripts
**Description:** 
- Review all seed data files for consistency with new naming conventions
- Verify seed data JSON files use correct naming
- Review seed script (seed.ts) for correct model references
- Verify migration scripts are complete and correct
- Test seed data execution with updated naming
- Ensure seed data works correctly with updated models
- Document seed data patterns and migration workflow

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 9.15 (Configuration Updates) must be complete

---

## Session Objectives

- Review all seed data files for naming consistency
- Verify seed JSON files use new naming conventions
- Review seed script for correct model references
- Verify migration scripts are complete and correct
- Test seed data execution
- Ensure seed data works correctly with updated models
- Document seed data patterns and migration workflow

---

## Key Deliverables

- Seed data files reviewed and updated if needed
- Seed script verified to use correct model references
- Migration scripts verified complete and correct
- Seed data tested and working correctly
- Seed data patterns documented
- Migration workflow documented

---

## Detailed Task Breakdown

### Task 9.16.1: Review Seed Data JSON Files

**Files:**
- `server/src/db/seedScripts/adminSeeds/block_type_seeds.json` (should be renamed to `block_shape_seeds.json` if needed)
- `server/src/db/seedScripts/adminSeeds/part_type_seeds.json` (should be renamed to `part_shape_seeds.json` if needed)
- `server/src/db/seedScripts/schedulerSeeds/block_instance_seeds.json`
- `server/src/db/seedScripts/schedulerSeeds/part_instance_seeds.json`
- `server/src/db/seedScripts/adminSeeds/property_definition_seeds.json`
- `server/src/db/seedScripts/adminSeeds/entity_property_mapping_seeds.json`

**Steps:**
1. **Review file names:**
   - Check if seed file names use new naming (block_shape_seeds.json vs block_type_seeds.json)
   - Check if seed file names use new naming (part_shape_seeds.json vs part_type_seeds.json)
   - Verify file names match new naming conventions

2. **Review seed data content:**
   - Check if seed data uses new column names (blockShapeRef vs blockTypeRef)
   - Check if seed data uses new column names (partShapeRef vs partTypeRef)
   - Verify all field names match new naming conventions

3. **Review seed data structure:**
   - Verify seed data structure matches model structure
   - Check for any references to old naming in seed data
   - Verify boolean fields (active, dependent, visible) are present if needed

**Output:**
- List of seed files that need renaming
- List of seed data that needs updating
- Verification that seed data uses new naming

---

### Task 9.16.2: Review Seed Script (seed.ts)

**Files:**
- `server/src/db/seedScripts/seed.ts`

**Steps:**
1. **Review model imports:**
   - Verify imports use new model names (PartShape, PartInstance, BlockShape, BlockInstance)
   - Verify imports use new relationship models (ValidConstituent, ValidCascade, ActiveConstituent, ActiveCascade)
   - Check for any references to old model names

2. **Review seed data loading:**
   - Verify seed data file imports use correct file names
   - Check if seed data loading uses correct field names
   - Verify seed data mapping is correct

3. **Review relationship generation:**
   - Verify generateRelationships function uses new relationship types
   - Check parentType and childType values use new naming
   - Verify relationshipType values use new naming (validConstituents, validCascades, etc.)

4. **Review seed execution:**
   - Verify seedEntity calls use correct model names
   - Check entity names in console logs use new naming
   - Verify seed order is correct

5. **Review comments and documentation:**
   - Update any comments referencing old naming
   - Ensure comments reflect new naming conventions
   - Verify LEARNING/WHY/PATTERN comments are accurate

**Output:**
- List of any references to update in seed.ts
- Verification that seed script uses new naming
- Confirmation that seed execution order is correct

---

### Task 9.16.3: Verify Migration Scripts Are Complete

**Files:**
- `server/src/db/migrations/20250130_rename_type_to_shape.js`
- `server/src/db/migrations/20250130_rename_profile_to_instance.js`
- `server/src/db/migrations/20251128_rename_relationship_tables.js`
- Other migration files as needed

**Steps:**
1. **Review Type → Shape migration:**
   - Verify migration renames tables correctly (block_types → block_shapes, part_types → part_shapes)
   - Check migration renames columns correctly (block_type_ref → block_shape_ref, part_type_ref → part_shape_ref)
   - Verify migration updates foreign key constraints correctly
   - Check migration handles edge cases (tables don't exist, columns don't exist)

2. **Review Profile → Instance migration:**
   - Verify migration renames tables correctly (block_profiles → block_instances, part_profiles → part_instances)
   - Check migration updates foreign key constraints correctly
   - Verify migration handles edge cases

3. **Review Relationship Tables migration:**
   - Verify migration renames tables correctly (valid_blocks → valid_cascades, etc.)
   - Check migration creates valid_compositions table correctly
   - Verify migration updates foreign key constraints correctly
   - Check migration handles edge cases

4. **Review migration down methods:**
   - Verify down methods reverse changes correctly
   - Check down methods handle edge cases
   - Verify down methods are complete

5. **Check for missing migrations:**
   - Verify all schema changes have corresponding migrations
   - Check if any migrations are missing
   - Document any missing migrations

**Output:**
- Verification that migration scripts are complete
- List of any missing migrations
- Confirmation that migrations handle edge cases

---

### Task 9.16.4: Update Seed Data Files If Needed

**Files:**
- Seed JSON files identified in Task 9.16.1

**Steps:**
1. **Rename seed files if needed:**
   - Rename block_type_seeds.json → block_shape_seeds.json (if needed)
   - Rename part_type_seeds.json → part_shape_seeds.json (if needed)
   - Update seed.ts imports if files are renamed

2. **Update seed data content if needed:**
   - Update field names to use new naming (blockTypeRef → blockShapeRef, etc.)
   - Verify all field names match model structure
   - Ensure boolean fields are present if needed

3. **Verify seed data structure:**
   - Ensure seed data structure matches model structure
   - Check for any missing required fields
   - Verify data types are correct

**Key Changes:**
- Rename seed files to use new naming
- Update field names in seed data
- Ensure seed data structure matches models

---

### Task 9.16.5: Update Seed Script If Needed

**Files:**
- `server/src/db/seedScripts/seed.ts`

**Steps:**
1. **Update model imports if needed:**
   - Replace any old model names with new names
   - Verify all imports use new naming

2. **Update seed data loading if needed:**
   - Update file imports if files were renamed
   - Update field mappings if needed
   - Verify seed data loading is correct

3. **Update relationship generation if needed:**
   - Update parentType and childType values if needed
   - Update relationshipType values if needed
   - Verify relationship generation is correct

4. **Update comments:**
   - Update any comments referencing old naming
   - Ensure comments reflect new naming conventions
   - Update LEARNING/WHY/PATTERN comments if needed

**Key Changes:**
- Update model imports to use new naming
- Update seed data loading if files were renamed
- Update relationship generation to use new naming
- Update comments to reflect new naming

---

### Task 9.16.6: Test Seed Data Execution

**Files:**
- All seed data files
- `server/src/db/seedScripts/seed.ts`

**Steps:**
1. **Test seed script execution:**
   - Run seed script: `cd server && npm run seed`
   - Verify seed script executes without errors
   - Check console output for correct entity names
   - Verify seed data is created correctly

2. **Verify seed data in database:**
   - Check that Part Shapes are seeded correctly
   - Check that Part Instances are seeded correctly
   - Check that Block Shapes are seeded correctly
   - Check that Block Instances are seeded correctly
   - Check that relationships are seeded correctly (ValidConstituent, ValidCascade, ActiveConstituent, ActiveCascade)

3. **Test seed script with existing data:**
   - Verify skipIfExists option works correctly
   - Verify clearFirst option works correctly
   - Test seed script behavior with existing data

4. **Document any issues:**
   - List any errors encountered
   - Fix issues immediately
   - Verify fixes work correctly

**Output:**
- Test results showing seed script works correctly
- Verification that seed data is created correctly
- Confirmation that seed script handles existing data correctly

---

### Task 9.16.7: Verify Migration Scripts Work Correctly

**Files:**
- All migration files

**Steps:**
1. **Test migrations on clean database:**
   - Create fresh database
   - Run migrations in order
   - Verify migrations execute without errors
   - Check database schema matches expected structure

2. **Test migration down methods:**
   - Test down methods reverse changes correctly
   - Verify down methods execute without errors
   - Check database schema after down migration

3. **Test migrations on existing database:**
   - Test migrations on database with existing data
   - Verify migrations handle existing data correctly
   - Check that no data is lost during migration

4. **Document any issues:**
   - List any errors encountered
   - Fix issues immediately
   - Verify fixes work correctly

**Output:**
- Test results showing migrations work correctly
- Verification that migrations handle existing data correctly
- Confirmation that down methods work correctly

---

### Task 9.16.8: Document Seed Data Patterns and Migration Workflow

**Files:**
- Create or update documentation files

**Steps:**
1. **Document seed data patterns:**
   - Document seed file naming conventions
   - Document seed data structure patterns
   - Document seed script execution patterns
   - Document relationship generation patterns

2. **Document migration workflow:**
   - Document migration execution order
   - Document migration testing procedures
   - Document migration rollback procedures
   - Document migration best practices

3. **Update README if needed:**
   - Update database management section
   - Update seed data section
   - Update migration workflow section

**Output:**
- Documentation of seed data patterns
- Documentation of migration workflow
- Updated README with seed and migration information

---

## Success Criteria

- [ ] Seed data files reviewed and updated if needed
- [ ] Seed script verified to use correct model references
- [ ] Migration scripts verified complete and correct
- [ ] Seed data tested and working correctly
- [ ] Migration scripts tested and working correctly
- [ ] Seed data patterns documented
- [ ] Migration workflow documented
- [ ] No functionality lost during updates
- [ ] Type safety preserved

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-9-guide.md` (if exists)
- Session 9.15 Summary: `project-manager/features/vue-migration/sessions/session-9.15-summary.md`
- Session 9.15 Guide: `project-manager/features/vue-migration/sessions/session-9.15-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

---

## Notes

- **Naming Conventions:**
  - Use `partInstance`, `blockInstance`, `partShape`, `blockShape` (not `partProfile`, `blockProfile`, `partType`, `blockType`)
  - Use `validCascades`, `validConstituents`, `activeCascades`, `activeConstituents`, `validCompositions`, `activeCompositions` (not `validBlocks`, `validParts`, `activeBlocks`, `activeParts`, `entityAggregates`)

- **Seed Data Files:**
  - Admin seeds: `server/src/db/seedScripts/adminSeeds/`
  - Scheduler seeds: `server/src/db/seedScripts/schedulerSeeds/`
  - Seed script: `server/src/db/seedScripts/seed.ts`

- **Migration Files:**
  - Type → Shape: `server/src/db/migrations/20250130_rename_type_to_shape.js`
  - Profile → Instance: `server/src/db/migrations/20250130_rename_profile_to_instance.js`
  - Relationship Tables: `server/src/db/migrations/20251128_rename_relationship_tables.js`

- **Testing:**
  - Test seed script execution: `cd server && npm run seed`
  - Test migrations: `cd server && npm run migrate`
  - Verify seed data in database after seeding
  - Verify database schema after migrations

---

## Learning Checkpoints

### What We'll Learn
- Reviewing seed data files for naming consistency
- Verifying seed scripts use correct model references
- Verifying migration scripts are complete and correct
- Testing seed data and migration execution
- Documenting seed data patterns and migration workflow

### Why These Patterns Matter
- Consistent naming improves code maintainability
- Updated seed data ensures system works correctly
- Proper migration scripts ensure database schema is correct
- Clear documentation helps future developers

### How This Relates to Existing Code
- Builds on Session 9.15 (Configuration Updates)
- Uses updated naming conventions from Phase 9
- Prepares for Session 9.17 (Testing & Validation)
- Completes data migration for Phase 9

---

## Potential Issues and Solutions

### Issue 1: Seed Files Use Old Naming
**Solution:** Review seed file names and content. Rename files and update content to use new naming conventions.

### Issue 2: Seed Script Uses Old Model Names
**Solution:** Review seed.ts and update model imports and references to use new naming.

### Issue 3: Migration Scripts Incomplete
**Solution:** Review migration scripts and verify they handle all schema changes. Add missing migrations if needed.

### Issue 4: Seed Data Doesn't Match Models
**Solution:** Review seed data structure and update to match model structure. Verify field names and data types.

### Issue 5: Seed Script Fails
**Solution:** Check error messages, verify model imports are correct, verify seed data structure matches models, fix issues immediately.

---

## Session Start Checklist

Before starting this session, verify:
- [ ] Session 9.15 is complete (Configuration Updates)
- [ ] Configuration files are updated and working
- [ ] TypeScript compilation passes
- [ ] Application starts successfully

---

## Next Session

**Session 9.17:** Testing & Validation
- Comprehensive testing of all Phase 9 changes
- Validation of naming conventions across codebase
- End-to-end testing of updated functionality

---

## Files to Review and Update

### Seed Data Files:
- `server/src/db/seedScripts/adminSeeds/block_type_seeds.json` (check if needs renaming)
- `server/src/db/seedScripts/adminSeeds/part_type_seeds.json` (check if needs renaming)
- `server/src/db/seedScripts/schedulerSeeds/block_instance_seeds.json` (verify content)
- `server/src/db/seedScripts/schedulerSeeds/part_instance_seeds.json` (verify content)
- `server/src/db/seedScripts/adminSeeds/property_definition_seeds.json` (verify content)
- `server/src/db/seedScripts/adminSeeds/entity_property_mapping_seeds.json` (verify content)

### Seed Script:
- `server/src/db/seedScripts/seed.ts` (review model imports, seed data loading, relationship generation)

### Migration Files:
- `server/src/db/migrations/20250130_rename_type_to_shape.js` (verify completeness)
- `server/src/db/migrations/20250130_rename_profile_to_instance.js` (verify completeness)
- `server/src/db/migrations/20251128_rename_relationship_tables.js` (verify completeness)

### Patterns to Check:

**File Names:**
- `block_type_seeds.json` → `block_shape_seeds.json` (if needed)
- `part_type_seeds.json` → `part_shape_seeds.json` (if needed)

**Field Names in Seed Data:**
- `blockTypeRef` → `blockShapeRef`
- `partTypeRef` → `partShapeRef`

**Model Names in Seed Script:**
- `PartType` → `PartShape`
- `BlockType` → `BlockShape`
- `PartProfile` → `PartInstance`
- `BlockProfile` → `BlockInstance`
- `ValidBlock` → `ValidCascade`
- `ValidPart` → `ValidConstituent`
- `ActiveBlock` → `ActiveCascade`
- `ActivePart` → `ActiveConstituent`
- `EntityAggregate` → `ActiveComposition`

**Relationship Types:**
- `validBlocks` → `validCascades`
- `validParts` → `validConstituents`
- `activeBlocks` → `activeCascades`
- `activeParts` → `activeConstituents`
- `entityAggregates` → `activeCompositions`

