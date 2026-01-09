# Database Migrations

**Purpose:** Manage database schema changes using Sequelize migrations

**Last Updated:** 2025-12-02 (Migration Detection Fix)

---

## Overview

Migrations handle all database schema changes. **Never use `sequelize.sync()` or modify the database schema manually.** Always use migrations for schema changes.

**Migration Runner:** We use a custom migration runner (`server/src/scripts/run-migrations.mjs`) instead of Sequelize CLI because:
- Sequelize CLI doesn't properly detect `.mjs` (ES module) migration files
- Our project uses ES modules (`"type": "module"` in package.json)
- The custom runner automatically detects all pending migrations (both `.js` and `.mjs` files)
- The custom runner runs migrations in alphabetical order and tracks execution in `SequelizeMeta` table

---

## Migration Commands

### Run Pending Migrations
```bash
cd server
npm run migrate
```

This uses the custom migration runner which:
- Automatically detects all pending migrations (`.js` and `.mjs` files)
- Runs migrations in alphabetical order by filename
- Skips migrations that have already been executed (tracked in `SequelizeMeta` table)
- Provides clear logging of migration progress

### Check Migration Status
```bash
cd server
npm run migrate:status
```

**Note:** The `migrate:status` command still uses Sequelize CLI and may not show all migrations if they're `.mjs` files. To check migration status, you can:
1. Query the `SequelizeMeta` table directly in your database
2. Run `npm run migrate` - it will show which migrations are pending and which have already run

### Undo Last Migration
```bash
cd server
npm run migrate:undo
```

### Undo All Migrations
```bash
cd server
npm run migrate:undo:all
```

### Create New Migration
```bash
cd server
npm run db:migrate:generate -- migration-name
```

---

## Phase 9 Naming Migration Files

### 1. Rename Type to Shape (`20250130_rename_type_to_shape.js`)
**Purpose:** Rename `block_types`/`part_types` tables and columns to use "shape" terminology

**Changes:**
- Renames `block_types` → `block_shapes`
- Renames `part_types` → `part_shapes`
- Renames `block_type_ref` → `block_shape_ref` in `block_profiles` table
- Renames `part_type_ref` → `part_shape_ref` in `part_profiles` table
- Updates foreign key constraints to reference new table names

**Execution Order:** Must run before Profile → Instance migration

---

### 2. Rename Profile to Instance (`20250130_rename_profile_to_instance.js`)
**Purpose:** Rename `block_profiles`/`part_profiles` tables to `block_instances`/`part_instances`

**Changes:**
- Renames `block_profiles` → `block_instances`
- Renames `part_profiles` → `part_instances`
- Updates foreign key constraints in `active_blocks` and `active_parts` tables
- Updates foreign key constraints for `block_shape_ref` and `part_shape_ref`

**Execution Order:** Must run after Type → Shape migration

---

### 3. Rename Relationship Tables (`20251128_rename_relationship_tables.js`)
**Purpose:** Rename relationship tables to clarify three-dimensional relationship model

**Changes:**
- Renames `valid_blocks` → `valid_cascades` (vertical hierarchy, different shapes)
- Renames `active_blocks` → `active_cascades` (vertical hierarchy, different shapes)
- Renames `valid_parts` → `valid_constituents` (Block → Part relationships)
- Renames `active_parts` → `active_constituents` (Block → Part relationships)
- Renames `entity_aggregates` → `active_compositions` (lateral aggregation, same shape)
- Creates `valid_compositions` table (shape-level composition)

**Execution Order:** Must run after Profile → Instance migration

---

## Migration Best Practices

### 1. Always Check Table Existence
```javascript
const tableExists = await queryInterface.tableExists('table_name');
if (tableExists) {
  // Perform operation
} else {
  console.log('ℹ️  Table does not exist, skipping');
}
```

### 2. Handle Foreign Key Constraints
When renaming tables, always:
1. Remove old foreign key constraints
2. Rename the table
3. Add new foreign key constraints with updated names

```javascript
// Remove old constraints
await queryInterface.removeConstraint('table', 'old_constraint_name');

// Rename table
await queryInterface.renameTable('old_table', 'new_table');

// Add new constraints
await queryInterface.addConstraint('new_table', {
  fields: ['field'],
  type: 'foreign key',
  references: { table: 'referenced_table', field: 'id' },
  name: 'new_constraint_name',
});
```

### 3. Use Try-Catch for Error Handling
```javascript
try {
  await queryInterface.removeConstraint('table', 'constraint');
} catch (error) {
  console.log('ℹ️  Error removing constraint (may not exist):', error.message);
}
```

### 4. Implement Down Methods
Always implement `down()` methods to reverse migrations:

```javascript
async down(queryInterface, Sequelize) {
  // Reverse operations in opposite order
  await queryInterface.renameTable('new_table', 'old_table');
}
```

### 5. Use Descriptive Console Logs
```javascript
console.log('✅ Renamed table_name table to new_table_name');
console.log('ℹ️  Table does not exist, skipping rename');
console.log('❌ Error:', error.message);
```

---

## Migration Workflow

### Creating a New Migration

1. **Generate migration file:**
   ```bash
   npm run db:migrate:generate -- descriptive-migration-name
   ```

2. **Edit the generated file:**
   - Implement `up()` method for forward migration
   - Implement `down()` method for rollback
   - Add table existence checks
   - Add error handling

3. **Test the migration:**
   ```bash
   npm run migrate        # Run migration
   npm run migrate:undo   # Test rollback
   npm run migrate        # Run again to verify
   ```

4. **Commit both migration file and model changes**

---

## Migration Execution Order

Migrations are executed in alphabetical order by filename. Use date prefixes to ensure correct order:

```
20250130_rename_type_to_shape.js          # Runs first
20250130_rename_profile_to_instance.js    # Runs second
20251128_rename_relationship_tables.js    # Runs third
```

---

## Phase 9 Migration Sequence

1. **Type → Shape Migration**
   - Renames type tables and columns
   - Updates foreign keys to reference shape tables

2. **Profile → Instance Migration**
   - Renames profile tables to instance tables
   - Updates foreign keys to reference instance tables
   - Updates foreign keys for shape references

3. **Relationship Tables Migration**
   - Renames relationship tables
   - Creates new valid_compositions table
   - Updates all foreign key constraints

---

## Troubleshooting

### Migration Detection Issues

**Problem:** Migrations not being detected

**Solution:** The custom migration runner automatically detects all `.js` and `.mjs` files in the migrations directory. If a migration isn't being detected:
1. Ensure the file is in `server/src/db/migrations/`
2. Ensure the file has a `.js` or `.mjs` extension
3. Ensure the file exports a default object with `up()` and `down()` methods
4. Check that the filename follows the naming convention (e.g., `YYYYMMDD_description.mjs`)

**Note:** Sequelize CLI (`npx sequelize-cli`) may not detect `.mjs` files. Always use `npm run migrate` which uses the custom runner.

### Migration Fails
1. **Check migration status:** Run `npm run migrate` to see which migrations are pending
2. **Review error messages:** Check console output for specific errors
3. **Verify table existence:** Ensure referenced tables exist
4. **Check foreign key constraints:** Verify constraint names are correct
5. **Check SequelizeMeta table:** Verify which migrations have been recorded as executed

### Rollback Issues
1. **Verify down() method:** Ensure down() properly reverses up() operations
2. **Check execution order:** Down methods must reverse in opposite order
3. **Test rollback:** Always test `migrate:undo` before committing

### Foreign Key Errors
1. **Remove constraints first:** Always remove constraints before renaming tables
2. **Update constraint names:** Use new table names in constraint names
3. **Verify references:** Ensure referenced tables exist before creating constraints

---

## Related Documentation

- **Seed Scripts:** See `server/src/db/seedScripts/README.md`
- **Models:** See model definitions in `server/src/models/`
- **Phase 9 Naming:** See `project-manager/features/vue-migration/phases/phase-9-guide.md`

---

## Notes

- **Never use `sequelize.sync()`** - Always use migrations
- **Never modify schema manually** - Always use migrations
- **Always implement down() methods** - For rollback capability
- **Test migrations before committing** - Verify both up() and down()
- **Use date prefixes** - Ensure correct execution order
- **Use `npm run migrate`** - This uses the custom runner that properly detects `.mjs` files
- **Sequelize CLI limitations** - Sequelize CLI may not detect `.mjs` migration files, so we use a custom runner
- **Migration file formats** - Both `.js` and `.mjs` files are supported and will be detected automatically

