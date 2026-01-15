/**
 * Migration: Refactor field_visibility_config to use fieldMetadata structure
 * Date: 2026-01-14
 * Purpose: Update field_visibility_config JSONB column structure from old format
 *          (hiddenFields/expandedOnlyFields) to new unified fieldMetadata format
 * 
 * LEARNING: Unified fieldMetadata structure replaces split configuration
 * WHY: Single source of truth for all field display properties (visibility, layout, order, renderAs, color, panel)
 * PATTERN: fieldMetadata object with FieldMetadataEntry for each field
 * 
 * OLD structure:
 * field_visibility_config: {
 *   hiddenFields: ['field1', 'field2'],
 *   expandedOnlyFields: ['field3', 'field4']
 * }
 * 
 * NEW structure:
 * field_visibility_config: {
 *   fieldMetadata: {
 *     'field1': {
 *       visibility: 'titleRow' | 'expandedDirect' | 'expandedPanel' | 'hidden',
 *       layout: 'inline' | 'stacked',
 *       order: 1,
 *       renderAs: 'field' | 'statusButton',
 *       statusButtonColor: 'success',
 *       panel: 'parts' | 'relationships' | 'annotations' | 'none'
 *     },
 *     'field2': { ... }
 *   }
 * }
 * 
 * NOTE: This migration does NOT automatically convert existing data.
 * Users must configure fieldMetadata via UI (BlockShapeEditModal/PartShapeEditModal).
 * Old data structure will be ignored by new code.
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting field_visibility_config refactor migration...');

    // Update block_shapes table comment
    const blockShapesTableExists = await queryInterface.tableExists('block_shapes');
    
    if (blockShapesTableExists) {
      // Check if column exists
      const [blockShapesColumnExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'block_shapes' AND column_name = 'field_visibility_config'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (blockShapesColumnExists?.exists) {
        // Update column comment to reflect new structure
        await queryInterface.sequelize.query(`
          COMMENT ON COLUMN block_shapes.field_visibility_config IS 
          'Field visibility configuration for blockInstance fields. Structure: { fieldMetadata: { [fieldKey]: { visibility, layout, order, renderAs, statusButtonColor, panel } } }';
        `);
        console.log('✅ Updated field_visibility_config column comment on block_shapes table');
      } else {
        console.log('ℹ️  field_visibility_config column does not exist on block_shapes, skipping');
      }
    } else {
      console.log('ℹ️  block_shapes table does not exist, skipping');
    }

    // Update part_shapes table comment
    const partShapesTableExists = await queryInterface.tableExists('part_shapes');
    
    if (partShapesTableExists) {
      // Check if column exists
      const [partShapesColumnExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'part_shapes' AND column_name = 'field_visibility_config'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (partShapesColumnExists?.exists) {
        // Update column comment to reflect new structure
        await queryInterface.sequelize.query(`
          COMMENT ON COLUMN part_shapes.field_visibility_config IS 
          'Field visibility configuration for partInstance fields. Structure: { fieldMetadata: { [fieldKey]: { visibility, layout, order, renderAs, statusButtonColor, panel } } }';
        `);
        console.log('✅ Updated field_visibility_config column comment on part_shapes table');
      } else {
        console.log('ℹ️  field_visibility_config column does not exist on part_shapes, skipping');
      }
    } else {
      console.log('ℹ️  part_shapes table does not exist, skipping');
    }

    console.log('✅ Field visibility config refactor migration complete');
    console.log('ℹ️  NOTE: Existing data will NOT be automatically converted.');
    console.log('ℹ️  Users must configure fieldMetadata via UI (BlockShapeEditModal/PartShapeEditModal).');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting field_visibility_config refactor migration...');

    // Revert block_shapes table comment
    const blockShapesTableExists = await queryInterface.tableExists('block_shapes');
    
    if (blockShapesTableExists) {
      const [blockShapesColumnExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'block_shapes' AND column_name = 'field_visibility_config'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (blockShapesColumnExists?.exists) {
        await queryInterface.sequelize.query(`
          COMMENT ON COLUMN block_shapes.field_visibility_config IS 
          'Field visibility configuration for blockInstance fields (hiddenFields, expandedOnlyFields)';
        `);
        console.log('✅ Reverted field_visibility_config column comment on block_shapes table');
      }
    }

    // Revert part_shapes table comment
    const partShapesTableExists = await queryInterface.tableExists('part_shapes');
    
    if (partShapesTableExists) {
      const [partShapesColumnExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'part_shapes' AND column_name = 'field_visibility_config'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (partShapesColumnExists?.exists) {
        await queryInterface.sequelize.query(`
          COMMENT ON COLUMN part_shapes.field_visibility_config IS 
          'Field visibility configuration for partInstance fields (hiddenFields, expandedOnlyFields)';
        `);
        console.log('✅ Reverted field_visibility_config column comment on part_shapes table');
      }
    }

    console.log('✅ Field visibility config refactor migration rollback complete');
  }
};
