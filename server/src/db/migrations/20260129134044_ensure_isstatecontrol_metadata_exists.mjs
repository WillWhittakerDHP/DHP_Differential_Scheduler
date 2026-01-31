/**
 * Migration: Ensure isStateControl metadata exists
 * Date: 2026-01-29
 * Purpose: Ensure isStateControl metadata exists for blockShape if it's missing
 *          This ensures both canHaveParts and isStateControl have metadata entries
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Ensuring isStateControl metadata exists...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping metadata creation');
      return;
    }

    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    
    // Check if isStateControl metadata exists for blockShape
    const [existingIsStateControlMetadata] = await queryInterface.sequelize.query(`
      SELECT id FROM admin_metadata
      WHERE entity_type = 'blockShape'
        AND entity_id = :entityId
        AND field_key = 'isStateControl'
      LIMIT 1
    `, {
      replacements: { entityId: BLOCK_SHAPE_GLOBAL_CONFIG_ID },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (!existingIsStateControlMetadata || (Array.isArray(existingIsStateControlMetadata) && existingIsStateControlMetadata.length === 0)) {
      console.log('ℹ️  isStateControl metadata not found for blockShape, creating it...');
      
      const { v4: uuidv4 } = await import('uuid');
      
      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id, metadata_type, entity_type, entity_id, field_key, data_type, label, is_required,
          visibility, layout, display_order, section, render_as, status_button_color,
          panel, bulk_edit, input_config, inherits_from_entity_type, inherits_from_entity_id,
          block_shape_ref, created_at, updated_at
        ) VALUES (
          :id, 'primitive', 'blockShape', :entityId, 'isStateControl', 'boolean', 'State Control', false,
          'notConfigured', 'stacked', 4, null, 'text', null,
          'none', false, null, null, null,
          null, :createdAt, :updatedAt
        ) ON CONFLICT DO NOTHING
      `, {
        replacements: {
          id: uuidv4(),
          entityId: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        type: Sequelize.QueryTypes.INSERT,
      });
      
      console.log('✅ Created isStateControl metadata for blockShape');
    } else {
      console.log('ℹ️  isStateControl metadata already exists for blockShape');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back isStateControl metadata creation...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    
    // Remove isStateControl metadata if it was created by this migration
    // Note: We can't easily determine if it was created by this migration, so we'll just log
    console.log('ℹ️  Note: This migration does not remove isStateControl metadata on rollback');
    console.log('ℹ️  If you need to remove it, do so manually or restore from backup');
  }
};
