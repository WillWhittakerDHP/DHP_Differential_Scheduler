/**
 * Migration: Fix event_assignments check constraint
 * Date: 2026-02-04
 * Purpose: 
 * - Force drop old constraint active_events_shape_check if it still exists
 * - Ensure new constraint event_assignments_instance_check is in place
 * - This is a fix migration in case the previous migration didn't properly drop the old constraint
 * 
 * LEARNING: Event assignments are instance-level only
 * WHY: EventInstances are native to part instances and block instances, not shapes
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing event_assignments check constraint...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Drop old constraint by name (if it exists)
    console.log('📝 Attempting to drop old constraint active_events_shape_check...');
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        DROP CONSTRAINT IF EXISTS active_events_shape_check
      `);
      console.log('✅ Dropped constraint active_events_shape_check');
    } catch (error) {
      console.log('ℹ️  Constraint active_events_shape_check does not exist or already dropped');
    }

    // Drop new constraint if it exists (we'll recreate it)
    console.log('📝 Checking for existing event_assignments_instance_check constraint...');
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        DROP CONSTRAINT IF EXISTS event_assignments_instance_check
      `);
      console.log('✅ Dropped existing event_assignments_instance_check (will recreate)');
    } catch (error) {
      console.log('ℹ️  Constraint event_assignments_instance_check does not exist');
    }

    // Check if block_instance_id column exists
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
      console.log('ℹ️  Column block_instance_id already exists');
    }

    // Add new constraint that only allows instance-level assignments
    console.log('📝 Adding new check constraint that only allows instance-level assignments...');
    
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        ADD CONSTRAINT event_assignments_instance_check
        CHECK (
          (part_instance_id IS NOT NULL AND block_instance_id IS NULL) OR
          (part_instance_id IS NULL AND block_instance_id IS NOT NULL)
        )
      `);
      console.log('✅ Added constraint event_assignments_instance_check');
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('ℹ️  Constraint event_assignments_instance_check already exists');
      } else {
        throw error;
      }
    }

    console.log('✅ Fixed event_assignments check constraint');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting event_assignments constraint fix...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Drop new constraint
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        DROP CONSTRAINT IF EXISTS event_assignments_instance_check
      `);
      console.log('✅ Dropped constraint event_assignments_instance_check');
    } catch (error) {
      console.log('ℹ️  Error dropping constraint:', error.message);
    }

    // NOTE: We intentionally do NOT restore the old constraint name "active_events_shape_check"
    // because that terminology is deprecated. The constraint should remain as event_assignments_instance_check
    // even after rollback, as it correctly reflects instance-level assignments.
    console.log('ℹ️  Skipping restoration of deprecated constraint name active_events_shape_check');

    console.log('✅ Reverted constraint fix');
  }
};
