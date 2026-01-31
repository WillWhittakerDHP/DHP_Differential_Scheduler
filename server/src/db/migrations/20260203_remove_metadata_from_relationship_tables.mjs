/**
 * Migration: Remove metadata columns from relationship tables
 * Date: 2026-02-03
 * Purpose: Remove metadata columns (ternaryValue, orderIndex, isDefault) from event_assignments and annotation_assignments tables
 * 
 * LEARNING: Metadata belongs in shape tables, not relationship tables
 * WHY: Relationships just indicate which shapes are active - metadata lives in shape tables
 * PATTERN: Keep only foreign keys in relationship tables, remove all metadata columns
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting remove metadata columns from relationship tables migration...');

    // Remove metadata columns from event_assignments table
    const eventAssignmentsExists = await queryInterface.tableExists('event_assignments');
    
    if (eventAssignmentsExists) {
      const columns = await queryInterface.describeTable('event_assignments');
      
      // Remove ternary_value column
      if ('ternary_value' in columns) {
        console.log('📝 Removing ternary_value column from event_assignments...');
        // First drop the enum type constraint if it exists
        await queryInterface.sequelize.query(`
          ALTER TABLE event_assignments DROP COLUMN IF EXISTS ternary_value CASCADE
        `);
        console.log('   ✅ ternary_value column removed');
      }

      // Remove order_index column
      if ('order_index' in columns) {
        console.log('📝 Removing order_index column from event_assignments...');
        await queryInterface.removeColumn('event_assignments', 'order_index');
        console.log('   ✅ order_index column removed');
      }
    } else {
      console.log('ℹ️  event_assignments table does not exist, skipping');
    }

    // Remove metadata columns from annotation_assignments table
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
    
    if (annotationAssignmentsExists) {
      const columns = await queryInterface.describeTable('annotation_assignments');
      
      // Remove order_index column
      if ('order_index' in columns) {
        console.log('📝 Removing order_index column from annotation_assignments...');
        await queryInterface.removeColumn('annotation_assignments', 'order_index');
        console.log('   ✅ order_index column removed');
      }

      // Remove is_default column
      if ('is_default' in columns) {
        console.log('📝 Removing is_default column from annotation_assignments...');
        await queryInterface.removeColumn('annotation_assignments', 'is_default');
        console.log('   ✅ is_default column removed');
      }

      // NOTE: user_type_block_instance_id stays - it's relationship-specific, not shape metadata
    } else {
      console.log('ℹ️  annotation_assignments table does not exist, skipping');
    }

    console.log('✅ Migration completed: metadata columns removed from relationship tables');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back remove metadata columns from relationship tables migration...');

    // Restore metadata columns to active_events table
    const activeEventsExists = await queryInterface.tableExists('active_events');
    if (activeEventsExists) {
      const columns = await queryInterface.describeTable('active_events');
      
      // Restore ternary_value column
      if (!('ternary_value' in columns)) {
        console.log('📝 Restoring ternary_value column to active_events...');
        await queryInterface.addColumn('active_events', 'ternary_value', {
          type: Sequelize.ENUM('true', 'false', 'override'),
          allowNull: true,
          field: 'ternary_value',
          comment: 'Ternary value for onSite/clientPresent (null defaults to true)',
        });
        console.log('   ✅ ternary_value column restored');
      }

      // Restore order_index column
      if (!('order_index' in columns)) {
        console.log(`📝 Restoring order_index column to ${eventsTableName}...`);
        await queryInterface.addColumn(eventsTableName, 'order_index', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'order_index',
          comment: 'Order in which events should be processed',
        });
        console.log('   ✅ order_index column restored');
      }
    }

    // Restore metadata columns to annotation_assignments table
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
    
    if (annotationAssignmentsExists) {
      const columns = await queryInterface.describeTable('annotation_assignments');
      
      // Restore order_index column
      if (!('order_index' in columns)) {
        console.log('📝 Restoring order_index column to annotation_assignments...');
        await queryInterface.addColumn('annotation_assignments', 'order_index', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'order_index',
          comment: 'Order in which annotation instances should be displayed for this block',
        });
        console.log('   ✅ order_index column restored');
      }

      // Restore is_default column
      if (!('is_default' in columns)) {
        console.log('📝 Restoring is_default column to annotation_assignments...');
        await queryInterface.addColumn('annotation_assignments', 'is_default', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_default',
          comment: 'Whether this annotation instance should be shown by default for this block',
        });
        console.log('   ✅ is_default column restored');
      }
    }

    console.log('✅ Rollback completed');
  }
};
