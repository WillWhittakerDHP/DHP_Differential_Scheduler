/**
 * Migration: Standardize event_assignments to parent_id/child_id pattern
 * Date: 2026-02-04
 * Purpose: 
 * - Add parent_id, parent_kind, child_id columns to match partAssignments pattern
 * - Migrate existing data from part_instance_id/block_instance_id/event_instance_id
 * - Drop old columns and constraints
 * - Add new constraints and indexes matching partAssignments pattern
 * 
 * LEARNING: Standardize on parent_id/child_id pattern for consistency
 * WHY: Matches partAssignments pattern exactly, eliminates special case handling
 * PATTERN: Use parent_id + parent_kind enum to handle multiple parent types
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Standardizing event_assignments to parent_id/child_id pattern...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Step 1: Create parent_kind enum type if it doesn't exist
    console.log('📝 Creating parent_kind enum type...');
    try {
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE enum_event_assignments_parent_kind AS ENUM ('partInstance', 'blockInstance');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log('✅ Created parent_kind enum type');
    } catch (error) {
      if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate_object'))) {
        console.log('ℹ️  parent_kind enum type already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Check which columns exist using raw SQL (more reliable than describeTable)
    const [columnCheck] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'event_assignments' 
        AND table_schema = 'public'
        AND column_name IN ('parent_id', 'parent_kind', 'child_id')
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });
    
    const existingColumns = new Set((columnCheck as Array<{ column_name: string }>).map((c: { column_name: string }) => c.column_name));
    
    // Step 3: Add new columns (nullable initially for migration)
    if (!existingColumns.has('parent_id')) {
      console.log('📝 Adding parent_id column...');
      await queryInterface.addColumn('event_assignments', 'parent_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Foreign key to parent instance (partInstance or blockInstance)',
      });
      console.log('✅ Added parent_id column');
    } else {
      console.log('ℹ️  Column parent_id already exists');
    }

    if (!existingColumns.has('parent_kind')) {
      console.log('📝 Adding parent_kind column...');
      // Use raw SQL to add column with enum type (Sequelize addColumn doesn't handle enum types well)
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        ADD COLUMN parent_kind enum_event_assignments_parent_kind
      `);
      console.log('✅ Added parent_kind column');
    } else {
      console.log('ℹ️  Column parent_kind already exists');
    }

    if (!existingColumns.has('child_id')) {
      console.log('📝 Adding child_id column...');
      await queryInterface.addColumn('event_assignments', 'child_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Foreign key to event_instances table',
      });
      console.log('✅ Added child_id column');
    } else {
      console.log('ℹ️  Column child_id already exists');
    }
    
    // Get table description for later steps
    const tableDescription = await queryInterface.describeTable('event_assignments');

    if (!tableDescription.child_id) {
      console.log('📝 Adding child_id column...');
      await queryInterface.addColumn('event_assignments', 'child_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Foreign key to event_instances table',
      });
      console.log('✅ Added child_id column');
    }

    // Step 3: Migrate existing data
    console.log('📝 Migrating existing data...');
    await queryInterface.sequelize.query(`
      UPDATE event_assignments
      SET 
        parent_id = COALESCE(part_instance_id, block_instance_id),
        parent_kind = CASE 
          WHEN part_instance_id IS NOT NULL THEN 'partInstance'::enum_event_assignments_parent_kind
          WHEN block_instance_id IS NOT NULL THEN 'blockInstance'::enum_event_assignments_parent_kind
          ELSE NULL
        END,
        child_id = event_instance_id
      WHERE parent_id IS NULL OR parent_kind IS NULL OR child_id IS NULL
    `);
    console.log('✅ Migrated existing data');

    // Step 4: Make columns NOT NULL
    console.log('📝 Making columns NOT NULL...');
    await queryInterface.changeColumn('event_assignments', 'parent_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    // Make parent_kind NOT NULL using raw SQL
    await queryInterface.sequelize.query(`
      ALTER TABLE event_assignments
      ALTER COLUMN parent_kind SET NOT NULL
    `);
    await queryInterface.changeColumn('event_assignments', 'child_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    console.log('✅ Made columns NOT NULL');

    // Step 5: Drop old foreign key constraints
    console.log('📝 Dropping old foreign key constraints...');
    const constraintsToDrop = [
      'event_assignments_part_instance_id_fkey',
      'event_assignments_block_instance_id_fkey',
      'event_assignments_event_instance_id_fkey',
    ];
    
    for (const constraintName of constraintsToDrop) {
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE event_assignments
          DROP CONSTRAINT IF EXISTS ${constraintName}
        `);
        console.log(`✅ Dropped constraint ${constraintName}`);
      } catch (error) {
        console.log(`ℹ️  Constraint ${constraintName} does not exist or already dropped`);
      }
    }

    // Step 6: Drop old indexes
    console.log('📝 Dropping old indexes...');
    const indexesToDrop = [
      'idx_event_assignments_part_instance_id',
      'idx_event_assignments_block_instance_id',
      'idx_event_assignments_event_instance_id',
    ];
    
    for (const indexName of indexesToDrop) {
      try {
        await queryInterface.removeIndex('event_assignments', indexName);
        console.log(`✅ Dropped index ${indexName}`);
      } catch (error) {
        console.log(`ℹ️  Index ${indexName} does not exist or already dropped`);
      }
    }

    // Step 7: Drop old CHECK constraint
    console.log('📝 Dropping old CHECK constraint...');
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        DROP CONSTRAINT IF EXISTS event_assignments_instance_check
      `);
      console.log('✅ Dropped old CHECK constraint');
    } catch (error) {
      console.log('ℹ️  Old CHECK constraint does not exist or already dropped');
    }

    // Step 8: Add new foreign key constraint on child_id
    console.log('📝 Adding foreign key constraint on child_id...');
    await queryInterface.addConstraint('event_assignments', {
      fields: ['child_id'],
      type: 'foreign key',
      name: 'event_assignments_child_id_fkey',
      references: {
        table: 'event_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    console.log('✅ Added foreign key constraint on child_id');

    // Step 9: Add new indexes
    console.log('📝 Adding new indexes...');
    await queryInterface.addIndex('event_assignments', ['parent_id'], {
      name: 'idx_event_assignments_parent_id',
    });
    await queryInterface.addIndex('event_assignments', ['child_id'], {
      name: 'idx_event_assignments_child_id',
    });
    console.log('✅ Added new indexes');

    // Step 10: Add unique constraint on [parent_id, child_id]
    console.log('📝 Adding unique constraint on [parent_id, child_id]...');
    await queryInterface.addConstraint('event_assignments', {
      fields: ['parent_id', 'child_id'],
      type: 'unique',
      name: 'unique_event_assignments_parent_child',
    });
    console.log('✅ Added unique constraint');

    // Step 11: Drop old columns
    console.log('📝 Dropping old columns...');
    if (tableDescription.part_instance_id) {
      await queryInterface.removeColumn('event_assignments', 'part_instance_id');
      console.log('✅ Dropped part_instance_id column');
    }
    if (tableDescription.block_instance_id) {
      await queryInterface.removeColumn('event_assignments', 'block_instance_id');
      console.log('✅ Dropped block_instance_id column');
    }
    if (tableDescription.event_instance_id) {
      await queryInterface.removeColumn('event_assignments', 'event_instance_id');
      console.log('✅ Dropped event_instance_id column');
    }

    console.log('✅ Standardized event_assignments to parent_id/child_id pattern');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting event_assignments standardization...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    const tableDescription = await queryInterface.describeTable('event_assignments');

    // Re-add old columns
    if (!tableDescription.part_instance_id) {
      await queryInterface.addColumn('event_assignments', 'part_instance_id', {
        type: Sequelize.UUID,
        allowNull: true,
      });
    }
    if (!tableDescription.block_instance_id) {
      await queryInterface.addColumn('event_assignments', 'block_instance_id', {
        type: Sequelize.UUID,
        allowNull: true,
      });
    }
    if (!tableDescription.event_instance_id) {
      await queryInterface.addColumn('event_assignments', 'event_instance_id', {
        type: Sequelize.UUID,
        allowNull: true,
      });
    }

    // Migrate data back
    await queryInterface.sequelize.query(`
      UPDATE event_assignments
      SET 
        part_instance_id = CASE WHEN parent_kind = 'partInstance' THEN parent_id ELSE NULL END,
        block_instance_id = CASE WHEN parent_kind = 'blockInstance' THEN parent_id ELSE NULL END,
        event_instance_id = child_id
    `);

    // Drop new constraints and indexes
    try {
      await queryInterface.removeConstraint('event_assignments', 'unique_event_assignments_parent_child');
    } catch (error) {
      console.log('ℹ️  Unique constraint does not exist');
    }
    
    try {
      await queryInterface.removeIndex('event_assignments', 'idx_event_assignments_parent_id');
      await queryInterface.removeIndex('event_assignments', 'idx_event_assignments_child_id');
    } catch (error) {
      console.log('ℹ️  Indexes do not exist');
    }

    try {
      await queryInterface.removeConstraint('event_assignments', 'event_assignments_child_id_fkey');
    } catch (error) {
      console.log('ℹ️  Foreign key constraint does not exist');
    }

    // Re-add old constraints and indexes
    await queryInterface.addConstraint('event_assignments', {
      fields: ['part_instance_id'],
      type: 'foreign key',
      name: 'event_assignments_part_instance_id_fkey',
      references: {
        table: 'part_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('event_assignments', {
      fields: ['block_instance_id'],
      type: 'foreign key',
      name: 'event_assignments_block_instance_id_fkey',
      references: {
        table: 'block_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('event_assignments', {
      fields: ['event_instance_id'],
      type: 'foreign key',
      name: 'event_assignments_event_instance_id_fkey',
      references: {
        table: 'event_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('event_assignments', ['part_instance_id'], {
      name: 'idx_event_assignments_part_instance_id',
    });
    await queryInterface.addIndex('event_assignments', ['block_instance_id'], {
      name: 'idx_event_assignments_block_instance_id',
    });
    await queryInterface.addIndex('event_assignments', ['event_instance_id'], {
      name: 'idx_event_assignments_event_instance_id',
    });

    // Drop new columns
    if (tableDescription.parent_id) {
      await queryInterface.removeColumn('event_assignments', 'parent_id');
    }
    if (tableDescription.parent_kind) {
      await queryInterface.removeColumn('event_assignments', 'parent_kind');
    }
    if (tableDescription.child_id) {
      await queryInterface.removeColumn('event_assignments', 'child_id');
    }

    console.log('✅ Reverted event_assignments standardization');
  }
};
