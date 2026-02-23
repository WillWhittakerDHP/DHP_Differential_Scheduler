# Database Migrations

**Purpose:** Manage database schema changes using Sequelize migrations

**Last Updated:** 2026-02-10 (Migration Squash)

---

## Overview

Migrations handle all database schema changes. **Never use `sequelize.sync()` or modify the database schema manually.** Always use migrations for schema changes.

**Migration Squash (2026-02-10):** Previous migrations (224 files) were squashed into two baseline migrations:
- `20260210_000001_baseline_schema.mjs` – full schema (types, tables, indexes, constraints)
- `20260210_000002_baseline_seed_data.mjs` – configuration/seed data

Historical migration files remain in git history for reference.

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
2. Run `npm run migrate` – it will show which migrations are pending and which have already run

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

## Migration Best Practices

### 1. Always Check Table Existence
```javascript
const tableExists = await queryInterface.tableExists('table_name');
if (tableExists) {
} else {
  console.log('ℹ️  Table does not exist, skipping');
}
```

### 2. Handle Foreign Key Constraints
When renaming tables, always:
1. Remove old foreign key constraints
2. Rename the table
3. Add new foreign key constraints with updated names

### 3. Use Try-Catch for Error Handling
```javascript
try {
  await queryInterface.removeConstraint('table', 'constraint');
} catch (error) {
  console.log('ℹ️  Error removing constraint (may not exist):', error.message);
}
```

### 4. Implement Down Methods
Always implement `down()` methods to reverse migrations.

### 5. Use Descriptive Console Logs
```javascript
console.log('✅ Renamed table_name table to new_table_name');
console.log('ℹ️  Table does not exist, skipping');
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
   - Add table existence checks where appropriate
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
20260210_000001_baseline_schema.mjs
20260210_000002_baseline_seed_data.mjs
20260215_add_new_feature.mjs
```

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

---

## Related Documentation

- **Seed Scripts:** See `server/src/db/seedScripts/README.md`
- **Models:** See model definitions in `server/src/db/models/`

---

## Notes

- **Never use `sequelize.sync()`** – Always use migrations
- **Never modify schema manually** – Always use migrations
- **Always implement down() methods** – For rollback capability
- **Test migrations before committing** – Verify both up() and down()
- **Use date prefixes** – Ensure correct execution order
- **Use `npm run migrate`** – This uses the custom runner that properly detects `.mjs` files
- **Migration file formats** – Both `.js` and `.mjs` files are supported and will be detected automatically
