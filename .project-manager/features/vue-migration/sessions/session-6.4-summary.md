# Phase 6 Session 6.4 Summary: User-Specific Descriptions - Database Schema & Models

**Session:** 6.4 - User-Specific Descriptions - Database Schema & Models  
**Status:** ✅ Complete  
**Date:** 2025-02-01  
**Duration:** ~2 hours

---

## Session Overview

**Goal:** Create Description entity and BlockInstanceDescription through-table for shared, reusable descriptions. This enables descriptions to be updated once and affect all BlockInstances using them, with support for user-type-specific filtering.

**Completion:** All objectives completed successfully.

---

## Key Accomplishments

### ✅ Task 6.4.1: Created Description Model

**File:** `server/src/db/models/scheduler/description.ts`

**Features:**
- UUID primary key
- `text` field (TEXT) for description content
- `userType` field (STRING, nullable) for user-type filtering (buyer, agent, owner, or null for generic)
- Timestamps (created_at, updated_at)
- Index on `user_type` for efficient filtering

**Architecture Notes:**
- **LEARNING:** Separating descriptions into their own entity enables shared descriptions across multiple block instances
- **WHY:** Centralized description management - update once, affects all blocks using it
- **PATTERN:** Entity model with factory function pattern, following existing model structure

### ✅ Task 6.4.2: Created BlockInstanceDescription Through-Table Model

**File:** `server/src/db/models/scheduler/block_instance_description.ts`

**Features:**
- UUID primary key
- Foreign keys: `block_instance_id` → block_instances, `description_id` → descriptions
- `userType` field (optional override for relationship-level filtering)
- `orderIndex` for ordering multiple descriptions per block
- `isDefault` boolean flag for default description selection
- Unique constraint on (block_instance_id, description_id, user_type)
- Indexes on block_instance_id, description_id, and order_index

**Architecture Notes:**
- **LEARNING:** Through-table pattern enables many-to-many relationships with additional metadata
- **WHY:** Allows blocks to have multiple ordered descriptions with user-type filtering
- **PATTERN:** Through-table model following ActiveConstituent/ActiveCascade pattern

### ✅ Task 6.4.3: Added Sequelize Associations

**File:** `server/src/db/models/index.ts`

**Associations Added:**
- `BlockInstance.belongsToMany(Description)` via BlockInstanceDescription
- `Description.belongsToMany(BlockInstance)` via BlockInstanceDescription
- `BlockInstance.hasMany(BlockInstanceDescription)`
- `BlockInstanceDescription.belongsTo(BlockInstance)`
- `Description.hasMany(BlockInstanceDescription)`
- `BlockInstanceDescription.belongsTo(Description)`

**Also Updated:**
- `server/src/config/app.ts` - Exported Description and BlockInstanceDescription models

### ✅ Task 6.4.4: Created Database Migration

**Files:**
- `server/src/db/migrations/20250201_create_descriptions_system.mjs`
- `server/src/db/migrations/20250201_create_descriptions_system.sql`

**Migration Features:**
- Creates `descriptions` table with proper indexes
- Creates `block_instance_descriptions` through-table with foreign keys, unique constraints, and indexes
- Includes CASCADE options for referential integrity
- Idempotent (checks for existing tables before creating)
- Includes rollback (down) functionality

### ✅ Task 6.4.5: Created Seed Data

**Files:**
- `server/src/db/seedScripts/schedulerSeeds/description_seeds.json` - 8 example descriptions (buyer, agent, owner, and generic)
- Updated `server/src/db/seedScripts/seed.ts` - Added description seeding logic

**Seed Data Features:**
- 8 example descriptions covering different user types
- Seed script assigns descriptions to block instances (1-2 per block)
- Properly maps description IDs to user types
- Sets orderIndex and isDefault flags appropriately

### ✅ Task 6.4.6: Entity and Relationship Constants (Clarification)

**Files:**
- `client-vue/src/constants/entities.ts` - Added clarifying comment (descriptions NOT added to ENTITY_KEYS)
- `client-vue/src/constants/relationships.ts` - Added clarifying comment (descriptions NOT added to RELATIONSHIP_KEYS)

**Architectural Decision (Session 6.5):**
- Descriptions are intentionally NOT added to `ENTITY_KEYS` or `RELATIONSHIP_KEYS`
- Descriptions are fetched as Sequelize associations when fetching blockInstance
- Descriptions are transformed to a simple string property on blockInstance during entity transformation
- This keeps descriptions as supporting data, not core entities processed by transformers

---

## Implementation Details

### Database Schema

**descriptions table:**
- `id` (UUID, PK)
- `text` (TEXT, NOT NULL)
- `user_type` (VARCHAR, NULLABLE) - buyer, agent, owner, or null
- `created_at`, `updated_at` (TIMESTAMP)

**block_instance_descriptions table:**
- `id` (UUID, PK)
- `block_instance_id` (UUID, FK → block_instances)
- `description_id` (UUID, FK → descriptions)
- `user_type` (VARCHAR, NULLABLE) - Optional override
- `order_index` (INTEGER, DEFAULT 0)
- `is_default` (BOOLEAN, DEFAULT false)
- `created_at`, `updated_at` (TIMESTAMP)
- Unique constraint: (block_instance_id, description_id, user_type)

### Model Structure

Both models follow the existing pattern:
- TypeScript classes with proper type inference
- Factory functions for Sequelize initialization
- Proper field mappings (camelCase → snake_case)
- Indexes and constraints defined in model options

---

## Testing & Verification

### ✅ Code Quality
- No linting errors
- TypeScript compilation passes
- Proper type safety maintained
- Models follow existing patterns

### ⏳ Database Testing Needed
- [ ] Run migration: `cd server && npm run migrate`
- [ ] Verify tables created correctly
- [ ] Test associations work (e.g., `blockInstance.getDescriptions()`)
- [ ] Run seed script: `cd server && npm run seed`
- [ ] Verify seed data inserted correctly
- [ ] Test user-type filtering queries

---

## Success Criteria Status

- [x] Description model created
- [x] BlockInstanceDescription through-table model created
- [x] Associations added
- [x] Migration created (both .mjs and .sql versions)
- [x] Seed data created
- [x] Constants clarified (descriptions NOT added to entity/relationship constants)
- [x] TypeScript compilation passes
- [x] No linting errors
- [ ] Database migration tested (needs manual verification)
- [ ] Associations tested (needs manual verification)
- [x] Ready for Session 6.5 (API Types & Transformers)

---

## Architecture Notes

### Pattern: Shared Entity with Through-Table

**Why:** Separating descriptions into their own entity enables:
- **Reusability:** Same description text can be used by multiple blocks
- **Maintainability:** Update description once, all blocks using it get the update
- **Flexibility:** Blocks can have multiple descriptions (ordered, with user-type filtering)
- **User-Type Filtering:** Descriptions can be filtered by user type at both Description and relationship level

**How:** Many-to-many relationship via BlockInstanceDescription through-table with additional metadata (orderIndex, isDefault, userType override)

**Benefits:**
- Centralized description management
- Support for user-type-specific descriptions
- Multiple descriptions per block with ordering
- Relationship-level user-type overrides

### Integration Pattern

- Models follow existing patterns (factory functions, proper types)
- Associations use Sequelize belongsToMany pattern
- Migration follows existing migration structure
- Seed data integrates with existing seed script

---

## Files Created/Modified

### Created:
1. `server/src/db/models/scheduler/description.ts` - Description model
2. `server/src/db/models/scheduler/block_instance_description.ts` - Through-table model
3. `server/src/db/migrations/20250201_create_descriptions_system.mjs` - Migration (ES modules)
4. `server/src/db/migrations/20250201_create_descriptions_system.sql` - Migration (SQL)
5. `server/src/db/seedScripts/schedulerSeeds/description_seeds.json` - Seed data

### Modified:
1. `server/src/db/models/index.ts` - Added Description and BlockInstanceDescription factories and associations
2. `server/src/config/app.ts` - Exported Description and BlockInstanceDescription models
3. `server/src/db/seedScripts/seed.ts` - Added description seeding logic
4. `client-vue/src/constants/entities.ts` - Added clarifying comment (descriptions NOT added to ENTITY_KEYS)
5. `client-vue/src/constants/relationships.ts` - Added clarifying comment (descriptions NOT added to RELATIONSHIP_KEYS)

---

## Next Steps

**Session 6.5: User-Specific Descriptions - API Types & Transformers**

### Tasks
- Create API types for Description and BlockInstanceDescription
- Create transformers for fetching and transforming description data
- Integrate descriptions into scheduler transformer
- Add description filtering by user type

### Notes
- API endpoints will be created in Session 6.6 (Admin Portal)
- Transformers will need to handle user-type filtering logic
- Frontend will use descriptions in Session 6.7 (Wizard Display)

---

## Related Documents

- Session Guide: `project-manager/features/vue-migration/sessions/session-6.4-guide.md`
- Phase Handoff: `project-manager/features/vue-migration/phases/phase-6-handoff.md`
- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`

---

## Learning Checkpoint

**What:** Created database schema and models for user-specific descriptions system.

**Why:** Enables shared, reusable descriptions with user-type filtering, allowing different text for the same block based on user type (buyer, agent, owner).

**How:** 
- Description entity stores reusable description text with optional user-type filter
- BlockInstanceDescription through-table links blocks to descriptions with ordering and default flags
- Many-to-many relationship enables one description to be used by multiple blocks

**When:** Descriptions will be fetched and displayed in the booking wizard based on selected user type (Session 6.7).

**Where:** Database layer (models, migrations, seeds) and constants (entity/relationship definitions).

