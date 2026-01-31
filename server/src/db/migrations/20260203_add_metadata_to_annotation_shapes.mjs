/**
 * Migration: Add metadata columns to annotation_shapes table
 * Date: 2026-02-03
 * Purpose: Add metadata columns (default_order_index, default_is_default) to annotation_shapes table
 * 
 * LEARNING: Shape tables store metadata as columns
 * WHY: Metadata (orderIndex, isDefault) belongs in shape tables, not in relationship tables
 * PATTERN: Shape columns are always metadata - relationships just indicate which shapes are active
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting add metadata columns to annotation_shapes migration...');

    const tableExists = await queryInterface.tableExists('annotation_shapes');
    
    if (!tableExists) {
      console.log('⚠️  annotation_shapes table does not exist. Run create annotation tables migration first.');
      return;
    }

    // Add default_order_index column
    const hasOrderIndex = await queryInterface.describeTable('annotation_shapes')
      .then(columns => 'default_order_index' in columns)
      .catch(() => false);

    if (!hasOrderIndex) {
      console.log('📝 Adding default_order_index column to annotation_shapes...');
      await queryInterface.addColumn('annotation_shapes', 'default_order_index', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Default order index for this annotation shape',
      });
      console.log('   ✅ default_order_index column added');
    } else {
      console.log('ℹ️  default_order_index column already exists, skipping');
    }

    // Add default_is_default column
    const hasIsDefault = await queryInterface.describeTable('annotation_shapes')
      .then(columns => 'default_is_default' in columns)
      .catch(() => false);

    if (!hasIsDefault) {
      console.log('📝 Adding default_is_default column to annotation_shapes...');
      await queryInterface.addColumn('annotation_shapes', 'default_is_default', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: 'Default isDefault flag for this annotation shape',
      });
      console.log('   ✅ default_is_default column added');
    } else {
      console.log('ℹ️  default_is_default column already exists, skipping');
    }

    console.log('✅ Migration completed: metadata columns added to annotation_shapes');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back add metadata columns to annotation_shapes migration...');

    const tableExists = await queryInterface.tableExists('annotation_shapes');
    if (!tableExists) {
      console.log('ℹ️  annotation_shapes table does not exist, nothing to rollback');
      return;
    }

    // Remove default_order_index column
    const hasOrderIndex = await queryInterface.describeTable('annotation_shapes')
      .then(columns => 'default_order_index' in columns)
      .catch(() => false);

    if (hasOrderIndex) {
      console.log('📝 Removing default_order_index column from annotation_shapes...');
      await queryInterface.removeColumn('annotation_shapes', 'default_order_index');
      console.log('   ✅ default_order_index column removed');
    }

    // Remove default_is_default column
    const hasIsDefault = await queryInterface.describeTable('annotation_shapes')
      .then(columns => 'default_is_default' in columns)
      .catch(() => false);

    if (hasIsDefault) {
      console.log('📝 Removing default_is_default column from annotation_shapes...');
      await queryInterface.removeColumn('annotation_shapes', 'default_is_default');
      console.log('   ✅ default_is_default column removed');
    }

    console.log('✅ Rollback completed');
  }
};
