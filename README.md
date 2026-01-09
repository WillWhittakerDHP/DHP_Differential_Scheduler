# Nodejs Express + TypeScript Starter 🚀

🛠 Developer friendly nodejs express typescript setup with test setup.

## Installation 🏁

```bash
yarn
```

## Database Management

This project uses Sequelize migrations for database schema management.

### Initial Setup

1. **Create the database:**
   ```bash
   psql -U postgres
   CREATE DATABASE scheduler_db;
   \q
   ```
   
   **Note:** The database name `scheduler_db` is historical. The codebase now uses "booking" terminology for user-facing features, but the database name remains unchanged to avoid migration complexity.

2. **Run migrations:**
   ```bash
   cd server
   npm run migrate
   ```

3. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

### Migration Commands

- **Run pending migrations:**
  ```bash
  npm run migrate
  ```

- **Create a new migration:**
  ```bash
  npm run db:migrate:generate -- migration-name
  ```

- **Undo last migration:**
  ```bash
  npm run db:migrate:undo
  ```

### Migration Workflow

When making schema changes:
1. Generate a new migration: `npm run db:migrate:generate -- descriptive-name`
2. Edit the generated file in `server/src/db/migrations/`
3. Run the migration: `npm run migrate`
4. Commit both the migration file and any model changes

**Important:** Never use `sequelize.sync()` or modify the database schema manually. Always use migrations.

## Dev Server 🕵️‍♂️

```bash
yarn dev
```

## Run Tests 🧪

```bash
yarn test
```

## Run Prod 🧘‍♂️

```bash
yarn start
```
# DHP_Differential_Scheduler

## Dynamic Property Management

The system supports dynamic property management, allowing administrators to:

- Define custom properties with various data types (string, number, boolean, array, reference)
- Assign properties to entities (Block Instances, Block Shapes, Part Instances, Part Shapes)
- Configure NULL handling and foreign key constraints
- Automatically create/remove database columns
- System properties are protected from modification/deletion

**Note:** As of Phase 9 (through Session 9.18), the naming conventions have been updated:
- **Type → Shape**: Entity structure definitions (e.g., `blockType` → `blockShape`, `partType` → `partShape`)
- **Profile → Instance**: Runtime instances (e.g., `blockProfile` → `blockInstance`, `partProfile` → `partInstance`)
- **Type → Kind**: Discriminators (e.g., `entityType` → `entityKind`)
- **Relationships**: Updated to Cascade (vertical hierarchy), Constituent (Block → Part), and Composition (lateral aggregation)

### Quick Start

1. Navigate to Admin → Property Management
2. Create a new property definition
3. Assign the property to one or more entities
4. Choose NULL constraint handling (nullable, not null with default, or update existing)
5. For reference types, optionally configure foreign key constraints

### Technical Details

- Database schema changes are transactional (atomic operations)
- Sequelize models are automatically refreshed with dynamic attributes
- All changes are logged in `property_change_log` table for audit trail
- System properties cannot be deleted or unassigned

For detailed API documentation, see `server/src/api/PROPERTY_API_DOCUMENTATION.md`
