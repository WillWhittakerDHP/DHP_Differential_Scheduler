/**
 * Migration: Add orderIndex and active fields to event/annotation tables
 * Date: 2026-01-31
 * Purpose: Add orderIndex (for UI drag-and-drop ordering) and active (for enable/disable) fields
 *          to event_instances, annotation_instances, event_shapes, and annotation_shapes tables
 * 
 * LEARNING: These are configuration data tables, not entity tables
 * WHY: Events and annotations need ordering and active status for admin UI management
 * PATTERN: Add fields with defaults, update existing records
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding orderIndex and active fields to event/annotation tables...');

    // Add orderIndex and active to event_instances
    await queryInterface.addColumn('event_instances', 'order_index', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order index for UI drag-and-drop ordering',
    });

    await queryInterface.addColumn('event_instances', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this event instance is active/enabled',
    });

    // Add orderIndex and active to annotation_instances
    await queryInterface.addColumn('annotation_instances', 'order_index', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order index for UI drag-and-drop ordering',
    });

    await queryInterface.addColumn('annotation_instances', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this annotation instance is active/enabled',
    });

    // Add orderIndex and active to event_shapes
    await queryInterface.addColumn('event_shapes', 'order_index', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order index for UI drag-and-drop ordering',
    });

    await queryInterface.addColumn('event_shapes', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this event shape is active/enabled',
    });

    // Add orderIndex and active to annotation_shapes
    await queryInterface.addColumn('annotation_shapes', 'order_index', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order index for UI drag-and-drop ordering',
    });

    await queryInterface.addColumn('annotation_shapes', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this annotation shape is active/enabled',
    });

    // Update existing records: set orderIndex based on current order (using ROW_NUMBER)
    // LEARNING: Use ROW_NUMBER() to assign sequential orderIndex values
    // WHY: Ensures existing records have proper ordering
    // PATTERN: Update each table separately with ROW_NUMBER() window function
    
    await queryInterface.sequelize.query(`
      UPDATE event_instances
      SET order_index = sub.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as row_num
        FROM event_instances
      ) AS sub
      WHERE event_instances.id = sub.id;
    `);

    await queryInterface.sequelize.query(`
      UPDATE annotation_instances
      SET order_index = sub.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as row_num
        FROM annotation_instances
      ) AS sub
      WHERE annotation_instances.id = sub.id;
    `);

    await queryInterface.sequelize.query(`
      UPDATE event_shapes
      SET order_index = sub.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as row_num
        FROM event_shapes
      ) AS sub
      WHERE event_shapes.id = sub.id;
    `);

    await queryInterface.sequelize.query(`
      UPDATE annotation_shapes
      SET order_index = sub.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as row_num
        FROM annotation_shapes
      ) AS sub
      WHERE annotation_shapes.id = sub.id;
    `);

    console.log('✅ Added orderIndex and active fields to event/annotation tables');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing orderIndex and active fields from event/annotation tables...');

    await queryInterface.removeColumn('event_instances', 'order_index');
    await queryInterface.removeColumn('event_instances', 'active');
    await queryInterface.removeColumn('annotation_instances', 'order_index');
    await queryInterface.removeColumn('annotation_instances', 'active');
    await queryInterface.removeColumn('event_shapes', 'order_index');
    await queryInterface.removeColumn('event_shapes', 'active');
    await queryInterface.removeColumn('annotation_shapes', 'order_index');
    await queryInterface.removeColumn('annotation_shapes', 'active');

    console.log('✅ Removed orderIndex and active fields from event/annotation tables');
  },
};
