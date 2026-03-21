# Database Migrations

**Purpose:** Manage database schema changes using Sequelize migrations

**Last Updated:** 2026-03-20 (Baseline Squash)

---

## Overview

Migrations handle all database schema changes. **Never use `sequelize.sync()` or modify the database schema manually.** Always use migrations for schema changes.

**Baseline Squash (2026-03-20):** All previous migrations were squashed into a single baseline generated from `pg_dump` against the known-good `scheduler_db` (PostgreSQL 17.2). The baseline consists of:

- `20260320_000001_baseline_from_dump.mjs` — migration runner that applies the two SQL files below
- `20260320_000001_baseline_schema.sql` — full schema (types, tables, indexes, constraints, triggers, functions)
- `20260320_000001_baseline_data.sql` — reference/seed data for all tables

Historical migration files remain in git history for reference. The previous squash (2026-02-10, 224 files) and all incremental migrations through 2026-03-15 are superseded by this single baseline.

**Migration Runner:** We use a custom migration runner (`server/src/scripts/run-migrations.mjs`) instead of Sequelize CLI because:
- Sequelize CLI doesn't properly detect `.mjs` (ES module) migration files
- Our project uses ES modules (`"type": "module"` in package.json)
- The custom runner automatically detects all pending migrations (both `.js` and `.mjs` files)
- The custom runner creates `SequelizeMeta` if it doesn't exist, runs migrations in alphabetical order, and tracks execution

---

## Fresh Install

From repo root, with env pointing at a new database:

```bash
dropdb scheduler_db || true
createdb scheduler_db
npm run migrate
```

That's it — the baseline creates everything needed.

---

## Migration Commands

### Run Pending Migrations
```bash
npm run migrate          # from repo root
# or
cd server && npm run migrate
```

### Check Migration Status
Query `SequelizeMeta` directly or run `npm run migrate` — it reports which migrations are pending.

---

## Creating New Migrations

After the baseline, add incremental migrations as before:

1. Create a file: `server/src/db/migrations/YYYYMMDD_NNNNNN_description.mjs`
2. Export a default object with `up(queryInterface, Sequelize)` and `down(queryInterface, Sequelize)`
3. Test: `npm run migrate`

Migrations are executed in alphabetical filename order.

---

## Regenerating the Baseline

If you need to re-squash (e.g. after many incremental migrations accumulate):

```bash
# 1. Export from your known-good database
pg_dump --schema-only --no-owner --no-privileges -h 127.0.0.1 -U postgres -d scheduler_db -f baseline_schema.sql
pg_dump --data-only  --no-owner --no-privileges -h 127.0.0.1 -U postgres -d scheduler_db -f baseline_data.sql

# 2. Edit the SQL: remove SequelizeMeta table/data (the runner manages it)
# 3. Replace the .sql files in this directory
# 4. Delete old .mjs migrations, keep only the baseline .mjs
# 5. Verify: dropdb/createdb/npm run migrate on a throwaway DB
```

**PostgreSQL version:** 17.2 (match for dump compatibility)

---

## Troubleshooting

### Migration Fails on Fresh DB
The runner creates `SequelizeMeta` automatically via `CREATE TABLE IF NOT EXISTS`. If the schema SQL still references it, remove those lines from the `.sql` file.

### Migration Detection Issues
Ensure the file is in `server/src/db/migrations/`, has a `.js` or `.mjs` extension, and exports a default object with `up()` and `down()`.

### Rollback
The baseline migration's `down()` throws an error (irreversible). To reset, drop and recreate the database.

---

## Related Documentation

- **Seed Scripts:** See `server/src/db/seedScripts/README.md`
- **Models:** See model definitions in `server/src/db/models/`

---

## Notes

- **Never use `sequelize.sync()`** — Always use migrations
- **Never modify schema manually** — Always use migrations
- **Always implement down() methods** on incremental migrations
- **Use `npm run migrate`** — This uses the custom runner that properly detects `.mjs` files
