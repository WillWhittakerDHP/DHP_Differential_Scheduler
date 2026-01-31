/**
 * Migration: Rename active_events_shape_check constraint to event_assignments_instance_check
 * Date: 2026-02-04
 * Purpose: 
 * - Rename the CHECK constraint from active_events_shape_check to event_assignments_instance_check
 * - This ensures constraint names match the table name (event_assignments) and terminology (instance, not shape)
 * - WHY: We've moved away from "active_events" terminology and shape-level assignments
 * 
 * LEARNING: PostgreSQL doesn't automatically rename constraints when tables are renamed
 * PATTERN: Explicitly rename constraints to match new table names and terminology
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Renaming active_events_shape_check constraint...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Check if the old constraint exists
    const [constraints] = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'event_assignments'
        AND constraint_type = 'CHECK'
        AND constraint_name = 'active_events_shape_check'
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (constraints && constraints.length > 0) {
      console.log('📝 Renaming constraint active_events_shape_check → event_assignments_instance_check...');
      
      // Drop the old constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        DROP CONSTRAINT IF EXISTS active_events_shape_check
      `);
      console.log('✅ Dropped constraint active_events_shape_check');

      // Add the new constraint with the correct name
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        ADD CONSTRAINT event_assignments_instance_check
        CHECK (
          (part_instance_id IS NOT NULL AND block_instance_id IS NULL) OR
          (part_instance_id IS NULL AND block_instance_id IS NOT NULL)
        )
      `);
      console.log('✅ Added constraint event_assignments_instance_check');
    } else {
      console.log('ℹ️  Constraint active_events_shape_check does not exist (may have already been renamed or dropped)');
      
      // Verify the correct constraint exists
      const [newConstraints] = await queryInterface.sequelize.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'event_assignments'
          AND constraint_type = 'CHECK'
          AND constraint_name = 'event_assignments_instance_check'
      `, {
        type: Sequelize.QueryTypes.SELECT,
      });

      if (newConstraints && newConstraints.length > 0) {
        console.log('✅ Constraint event_assignments_instance_check already exists with correct name');
      } else {
        console.log('⚠️  No CHECK constraint found - may need to be created');
      }
    }

    console.log('✅ Constraint rename completed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting constraint rename...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Drop the new constraint
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        DROP CONSTRAINT IF EXISTS event_assignments_instance_check
      `);
      console.log('✅ Dropped constraint event_assignments_instance_check');
    } catch (error) {
      console.log('ℹ️  Error dropping constraint:', error.message);
    }

    // Restore the old constraint name (for rollback purposes only)
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE event_assignments
        ADD CONSTRAINT active_events_shape_check
        CHECK (
          (part_instance_id IS NOT NULL AND block_instance_id IS NULL) OR
          (part_instance_id IS NULL AND block_instance_id IS NOT NULL)
        )
      `);
      console.log('✅ Restored constraint active_events_shape_check');
    } catch (error) {
      console.log('ℹ️  Error restoring constraint:', error.message);
    }

    console.log('✅ Constraint rename reverted');
  }
};
