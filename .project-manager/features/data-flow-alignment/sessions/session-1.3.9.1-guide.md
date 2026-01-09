# Session 1.3.9.1 Guide: Database Migration

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9.1 - Database Migration  
**Status:** Not Started  
**Priority:** High (Foundation for all other changes)  
**Created:** 2026-01-03

---

## Session Overview

**Session Number:** 1.3.9.1  
**Session Name:** Database Migration  
**Description:** Create and execute database migration to convert single FK columns (`base_service_id`, `dwelling_adjustment_id`) to JSONB arrays (`selected_service_ids`, `selected_dwelling_adjustment_ids`). Migrate existing data and add appropriate indexes.

**Dependencies:** Session 1.3.8 (Property and Address Table Separation Migration Plan) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand current appointment table schema with FK columns
- Understand JSONB array storage in PostgreSQL
- Understand GIN indexes for JSONB array queries
- Review existing migration patterns in the codebase

**During Session:**
- Learn how to create database migrations with data transformation
- Learn how to migrate FK columns to JSONB arrays
- Learn how to add GIN indexes for JSONB array queries
- Learn how to verify data migration integrity

**After Session:**
- Understand JSONB array migration patterns
- Understand data preservation during schema changes
- Understand index strategies for JSONB arrays

---

## Objectives

- Create migration file to convert FK columns to JSONB arrays
- Migrate existing data (single values → arrays)
- Drop old FK columns and indexes
- Add GIN indexes on JSONB columns
- Verify data migration integrity

---

## Tasks

### Task 1.3.9.1.1: Create Migration File

**Goal:** Create migration file with proper timestamp and structure.

**Steps:**
1. **Generate Timestamp:**
   - Use format: `YYYYMMDD_HHMMSS_convert_single_fks_to_arrays.mjs`
   - Example: `20260103_120000_convert_single_fks_to_arrays.mjs`

2. **Create Migration Structure:**
   - Import Sequelize migration utilities
   - Export `up` and `down` functions
   - Add transaction handling

**Key Files:**
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs` (new)

**Checkpoint:** Verify migration file structure matches existing patterns.

---

### Task 1.3.9.1.2: Add New JSONB Columns

**Goal:** Add new JSONB array columns to appointments table.

**Steps:**
1. **Add selected_service_ids Column:**
   - Type: `DataTypes.JSONB`
   - Nullable: `true` (to match existing FK nullability)
   - Default: `null`

2. **Add selected_dwelling_adjustment_ids Column:**
   - Type: `DataTypes.JSONB`
   - Nullable: `true` (to match existing FK nullability)
   - Default: `null`

3. **Add Column Comments:**
   - Document that these are arrays of block instance IDs
   - Note that they replace the old FK columns

**Key Files:**
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs`

**Checkpoint:** Verify columns added successfully with correct types.

---

### Task 1.3.9.1.3: Migrate Existing Data

**Goal:** Convert existing single FK values to single-item arrays.

**Steps:**
1. **Migrate base_service_id → selected_service_ids:**
   - Update rows where `base_service_id IS NOT NULL`
   - Set `selected_service_ids = [base_service_id]`
   - Set `selected_service_ids = null` where `base_service_id IS NULL`

2. **Migrate dwelling_adjustment_id → selected_dwelling_adjustment_ids:**
   - Update rows where `dwelling_adjustment_id IS NOT NULL`
   - Set `selected_dwelling_adjustment_ids = [dwelling_adjustment_id]`
   - Set `selected_dwelling_adjustment_ids = null` where `dwelling_adjustment_id IS NULL`

3. **Verify Data Integrity:**
   - Count rows before and after migration
   - Verify all non-null FK values converted to arrays
   - Verify all null FK values remain null

**Key Files:**
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs`

**Checkpoint:** Verify all existing data migrated correctly (no data loss).

---

### Task 1.3.9.1.4: Drop Old FK Columns and Indexes

**Goal:** Remove old FK columns and their indexes after data migration.

**Steps:**
1. **Drop Indexes on FK Columns:**
   - Drop index on `base_service_id` if exists
   - Drop index on `dwelling_adjustment_id` if exists

2. **Drop Foreign Key Constraints:**
   - Drop FK constraint on `base_service_id`
   - Drop FK constraint on `dwelling_adjustment_id`

3. **Drop FK Columns:**
   - Drop `base_service_id` column
   - Drop `dwelling_adjustment_id` column

**Key Files:**
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs`

**Checkpoint:** Verify old columns and indexes removed successfully.

---

### Task 1.3.9.1.5: Add GIN Indexes on JSONB Columns

**Goal:** Add GIN indexes for efficient JSONB array queries.

**Steps:**
1. **Create GIN Index on selected_service_ids:**
   - Index name: `idx_appointments_selected_service_ids`
   - Type: `GIN`
   - Column: `selected_service_ids`

2. **Create GIN Index on selected_dwelling_adjustment_ids:**
   - Index name: `idx_appointments_selected_dwelling_adjustment_ids`
   - Type: `GIN`
   - Column: `selected_dwelling_adjustment_ids`

3. **Verify Indexes Created:**
   - Check index creation succeeded
   - Verify index types are GIN

**Key Files:**
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs`

**Checkpoint:** Verify GIN indexes created successfully.

---

### Task 1.3.9.1.6: Implement Rollback (Down Migration)

**Goal:** Create rollback logic to restore old schema if needed.

**Steps:**
1. **Restore FK Columns:**
   - Add `base_service_id` column (FK, nullable)
   - Add `dwelling_adjustment_id` column (FK, nullable)

2. **Restore FK Constraints:**
   - Add FK constraint on `base_service_id`
   - Add FK constraint on `dwelling_adjustment_id`

3. **Restore Data:**
   - Extract first element from arrays: `base_service_id = selected_service_ids[0]`
   - Handle null arrays: `base_service_id = null` where array is null
   - Same for `dwelling_adjustment_id`

4. **Drop New Columns:**
   - Drop `selected_service_ids` column
   - Drop `selected_dwelling_adjustment_ids` column
   - Drop GIN indexes

**Key Files:**
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs`

**Checkpoint:** Verify rollback logic works correctly (test if needed).

---

### Task 1.3.9.1.7: Test Migration

**Goal:** Test migration execution and verify data integrity.

**Steps:**
1. **Run Migration:**
   - Execute migration on development database
   - Verify no errors during execution

2. **Verify Data:**
   - Check that all appointments have valid array values
   - Verify single FK values converted to single-item arrays
   - Verify null FK values remain null
   - Count total appointments (should match before migration)

3. **Test Queries:**
   - Test querying appointments by service ID in array
   - Test querying appointments by dwelling adjustment ID in array
   - Verify GIN indexes are used in query plans

4. **Test Rollback:**
   - Test rollback (down migration) if needed
   - Verify data restored correctly

**Key Files:**
- Migration file
- Test queries/scripts

**Checkpoint:** Verify migration works correctly and data integrity maintained.

---

## Key Files

### Backend
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs` (new)

---

## Success Criteria

- ✅ Migration file created with proper structure
- ✅ New JSONB columns added to appointments table
- ✅ All existing data migrated successfully (single values → arrays)
- ✅ Old FK columns and indexes dropped
- ✅ GIN indexes added on JSONB columns
- ✅ Rollback logic implemented and tested
- ✅ No data loss during migration
- ✅ Migration tested and verified

---

## Implementation Notes

- **Data Preservation:** Always convert single FK values to single-item arrays `[id]`, not just `id`
- **Null Handling:** Preserve null values (null FK → null array)
- **Transaction Safety:** Use transactions to ensure atomic migration
- **Index Strategy:** GIN indexes enable efficient queries like `WHERE 'id' = ANY(selected_service_ids)`
- **Rollback Safety:** Implement rollback to extract first array element back to FK

---

## Related Documents

- **Parent Session Guide**: `session-1.3.9-guide.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Original Plan**: `../../../../.cursor/plans/multi-select_services_refactor_83ca41e7.plan.md`

---

**Next Sub-Session:** Session 1.3.9.2 - Backend Model and API Updates

