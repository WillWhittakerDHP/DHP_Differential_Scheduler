/**
 * Migration: Update event_assignments check constraint and add block_instance_id
 * Date: 2026-02-04
 * Purpose: 
 * - Add block_instance_id column to event_assignments table
 * - Update check constraint to only allow instance-level assignments (part_instance_id OR block_instance_id)
 * - Remove shape-level support (part_shape_id and block_shape_id should not be used)
 * 
 * LEARNING: Event assignments are instance-level only
 * WHY: EventInstances are native to part instances and block instances, not shapes
 * PATTERN: Add block_instance_id column, update constraint to only allow instance references
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding block_instance_id and updating event_assignments check constraint...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Check if block_instance_id column already exists
    const tableDescription = await queryInterface.describeTable('event_assignments');
    if (!tableDescription.block_instance_id) {
      console.log('📝 Adding block_instance_id column to event_assignments table...');
      
      await queryInterface.addColumn('event_assignments', 'block_instance_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Foreign key to block_instances table (instance-level event configuration)',
      });

      // Add foreign key constraint
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

      // Add index for performance
      await queryInterface.addIndex('event_assignments', ['block_instance_id'], {
        name: 'idx_event_assignments_block_instance_id',
      });

      console.log('✅ block_instance_id column added successfully');
    } else {
      console.log('ℹ️  Column block_instance_id already exists, skipping');
    }

    // Check if constraint exists (it might be named active_events_shape_check if table was renamed)
    // LEARNING: Query all CHECK constraints on event_assignments table
    // WHY: Need to find and drop the old constraint that requires shape-level assignments
    const [constraints] = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'event_assignments'
        AND constraint_type = 'CHECK'
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(`📋 Found ${constraints?.length || 0} CHECK constraints on event_assignments table`);

    // Drop all existing CHECK constraints (we'll add a new one)
    if (constraints && constraints.length > 0) {
      for (const constraint of constraints) {
        const constraintName = constraint.constraint_name;
        console.log(`📝 Dropping constraint: ${constraintName}...`);
        
        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE event_assignments
            DROP CONSTRAINT IF EXISTS "${constraintName}"
          `);
          console.log(`✅ Dropped constraint: ${constraintName}`);
        } catch (error) {
          console.log(`⚠️  Error dropping constraint ${constraintName}:`, error.message);
          // Continue - try to drop other constraints
        }
      }
    } else {
      console.log('ℹ️  No existing check constraints found, will create new one');
    }

    // Add new constraint that only allows instance-level assignments
    console.log('📝 Adding new check constraint that only allows instance-level assignments...');
    
    await queryInterface.sequelize.query(`
      ALTER TABLE event_assignments
      ADD CONSTRAINT event_assignments_instance_check
      CHECK (
        (part_instance_id IS NOT NULL AND block_instance_id IS NULL) OR
        (part_instance_id IS NULL AND block_instance_id IS NOT NULL)
      )
    `);

    console.log('✅ Updated check constraint to only allow instance-level assignments');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting event_assignments changes...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Drop new constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE event_assignments
      DROP CONSTRAINT IF EXISTS event_assignments_instance_check
    `);

    // Restore old constraint (only allows part_shape_id OR block_shape_id)
    await queryInterface.sequelize.query(`
      ALTER TABLE event_assignments
      ADD CONSTRAINT active_events_shape_check
      CHECK (
        (part_shape_id IS NOT NULL AND block_shape_id IS NULL) OR
        (part_shape_id IS NULL AND block_shape_id IS NOT NULL)
      )
    `);

    // Remove block_instance_id column if it exists
    const tableDescription = await queryInterface.describeTable('event_assignments');
    if (tableDescription.block_instance_id) {
      // Drop foreign key constraint first
      try {
        await queryInterface.removeConstraint('event_assignments', 'event_assignments_block_instance_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing block_instance_id constraint (may not exist):', error.message);
      }

      // Drop index
      try {
        await queryInterface.removeIndex('event_assignments', 'idx_event_assignments_block_instance_id');
      } catch (error) {
        console.log('ℹ️  Error removing block_instance_id index (may not exist):', error.message);
      }

      // Drop column
      await queryInterface.removeColumn('event_assignments', 'block_instance_id');
      console.log('✅ Removed block_instance_id column');
    }

    console.log('✅ Reverted check constraint and removed block_instance_id');
  }
};
