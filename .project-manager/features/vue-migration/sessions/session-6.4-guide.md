# Phase 6 Session 6.4 Guide: User-Specific Descriptions - Database Schema & Models

**Feature:** Vue Migration  
**Purpose:** Session-level guide for creating Description entity and BlockProfileDescription through-table

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.4 - User-Specific Descriptions - Database Schema & Models
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.4
**Session Name:** User-Specific Descriptions - Database Schema & Models
**Description:** Create Description entity and BlockProfileDescription through-table for shared, reusable descriptions. This enables descriptions to be updated once and affect all BlockProfiles using them.

**Duration:** Estimated 4-5 hours
**Dependencies:** Phase 1 complete (data layer foundation)

---

## Session Objectives

- Create Description model with id, text, userType (optional), createdAt/updatedAt
- Create BlockProfileDescription through-table model
- Add Sequelize associations
- Create migration for new tables
- Create seed data
- Update entity and relationship constants
- Test database changes

---

## Key Deliverables

- Description model
- BlockProfileDescription through-table model
- Database migration
- Seed data
- Updated constants
- Working associations

---

## Detailed Task Breakdown

### Task 6.4.1: Create Description Model

**File:** `server/src/db/models/scheduler/description.ts`

**Steps:**
1. Create model file following existing model patterns
2. Define fields: id (UUID), text (STRING), userType (STRING | null), createdAt/updatedAt
3. Add proper Sequelize configuration
4. Export model factory function

**Code Structure:**
```typescript
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export class Description extends Model<
  InferAttributes<Description>,
  InferCreationAttributes<Description>
> {
  declare id: CreationOptional<string>;
  declare text: string;
  declare userType: string | null; // 'buyer' | 'agent' | 'owner' | null
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function DescriptionFactory(sequelize: Sequelize) {
  Description.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'user_type',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'description',
      tableName: 'descriptions',
      freezeTableName: true,
    }
  );

  return Description;
}
```

---

### Task 6.4.2: Create BlockProfileDescription Through-Table Model

**File:** `server/src/db/models/scheduler/block_profile_description.ts`

**Steps:**
1. Create through-table model
2. Define fields: id, block_profile_id (FK), description_id (FK), userType (optional), orderIndex, isDefault (optional), createdAt/updatedAt
3. Add proper Sequelize configuration
4. Export model factory function

**Code Structure:**
```typescript
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

export class BlockProfileDescription extends Model<
  InferAttributes<BlockProfileDescription>,
  InferCreationAttributes<BlockProfileDescription>
> {
  declare id: CreationOptional<string>;
  declare blockProfileId: ForeignKey<string>;
  declare descriptionId: ForeignKey<string>;
  declare userType: string | null;
  declare orderIndex: number;
  declare isDefault: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function BlockProfileDescriptionFactory(sequelize: Sequelize) {
  BlockProfileDescription.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      blockProfileId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_profile_id',
        references: {
          model: 'block_profiles',
          key: 'id',
        },
      },
      descriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'description_id',
        references: {
          model: 'descriptions',
          key: 'id',
        },
      },
      userType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'user_type',
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order_index',
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_default',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'block_profile_description',
      tableName: 'block_profile_descriptions',
      indexes: [
        {
          unique: true,
          fields: ['block_profile_id', 'description_id', 'user_type'],
        },
      ],
      freezeTableName: true,
    }
  );

  return BlockProfileDescription;
}
```

---

### Task 6.4.3: Add Sequelize Associations

**File:** `server/src/db/models/index.ts`

**Steps:**
1. Import Description and BlockProfileDescription factories
2. Initialize models
3. Add belongsToMany association: `BlockProfile.belongsToMany(Description, { through: BlockProfileDescription, ... })`
4. Add reverse association if needed

**Code Update:**
```typescript
import { DescriptionFactory } from './scheduler/description';
import { BlockProfileDescriptionFactory } from './scheduler/block_profile_description';

// In initializeModels function:
const Description = DescriptionFactory(sequelize);
const BlockProfileDescription = BlockProfileDescriptionFactory(sequelize);

// Add associations
BlockProfile.belongsToMany(Description, {
  through: BlockProfileDescription,
  foreignKey: 'block_profile_id',
  otherKey: 'description_id',
  as: 'descriptions',
});

Description.belongsToMany(BlockProfile, {
  through: BlockProfileDescription,
  foreignKey: 'description_id',
  otherKey: 'block_profile_id',
  as: 'blockProfiles',
});
```

---

### Task 6.4.4: Create Migration

**File:** `server/src/db/migrations/XXXX-create-descriptions-system.ts`

**Steps:**
1. Create migration file
2. Create `descriptions` table
3. Create `block_profile_descriptions` table
4. Add indexes
5. Add foreign key constraints

---

### Task 6.4.5: Create Seed Data

**File:** `server/src/db/seedScripts/schedulerSeeds/description_seeds.json`

**Steps:**
1. Create seed file with example descriptions
2. Include descriptions for different user types
3. Include generic descriptions

---

### Task 6.4.6: Update Constants

**Files:**
- `client/src/global/constants/entityConstants.ts` - Add 'description' to entity keys
- `client/src/global/constants/relationshipConstants.ts` - Add descriptions relationship

---

## Success Criteria

- [ ] Description model created
- [ ] BlockProfileDescription through-table model created
- [ ] Associations added
- [ ] Migration created and runs successfully
- [ ] Seed data created
- [ ] Constants updated
- [ ] Database tables created correctly
- [ ] Associations work correctly
- [ ] Ready for Session 6.5 (API Types & Transformers)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`
- Reference: `server/src/db/models/scheduler/active_block.ts` (through-table pattern)



