/**
 * Migration: Add field_visibility_config JSONB column to part_shapes table
 * Date: 2026-01-14
 * Purpose: Add field_visibility_config JSONB column to store per-PartShape field visibility settings
 *          This allows configuring which partInstance fields are visible/hidden per PartShape
 * 
 * LEARNING: JSONB column for flexible per-entity configuration
 * WHY: Allows storing field visibility config directly on PartShape without separate table
 * PATTERN: JSONB column storing PartShapeFieldVisibility object with hiddenFields and expandedOnlyFields arrays
 * 
 * Example data structure:
 * field_visibility_config: {
 *   hiddenFields: ['onSite', 'clientPresent'],
 *   expandedOnlyFields: ['baseFee', 'rateOverBaseFee']
 * }
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting field_visibility_config migration for part_shapes...');

    const tableExists = await queryInterface.tableExists('part_shapes');
    
    if (!tableExists) {
      console.log('ℹ️  part_shapes table does not exist, skipping migration');
      return;
    }

    // Check if column already exists
    const [columnExists] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'part_shapes' AND column_name = 'field_visibility_config'
      ) as exists;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (columnExists?.exists) {
      console.log('ℹ️  field_visibility_config column already exists, skipping');
      return;
    }

    // Add field_visibility_config JSONB column
    await queryInterface.addColumn('part_shapes', 'field_visibility_config', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Field visibility configuration for partInstance fields (hiddenFields, expandedOnlyFields)',
    });

    console.log('✅ Added field_visibility_config column to part_shapes table');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting field_visibility_config migration for part_shapes...');

    const tableExists = await queryInterface.tableExists('part_shapes');
    
    if (!tableExists) {
      console.log('ℹ️  part_shapes table does not exist, skipping rollback');
      return;
    }

    // Check if column exists before dropping
    const [columnExists] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'part_shapes' AND column_name = 'field_visibility_config'
      ) as exists;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (columnExists?.exists) {
      await queryInterface.removeColumn('part_shapes', 'field_visibility_config');
      console.log('✅ Removed field_visibility_config column from part_shapes table');
    } else {
      console.log('ℹ️  field_visibility_config column does not exist, skipping rollback');
    }
  }
};
