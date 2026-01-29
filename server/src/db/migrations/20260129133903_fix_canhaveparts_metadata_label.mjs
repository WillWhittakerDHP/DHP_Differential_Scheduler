/**
 * Migration: Fix canHaveParts metadata label
 * Date: 2026-01-29
 * Purpose: Update existing metadata records for canHaveParts field to have correct label "Can Have Parts"
 *          instead of "State Control" (which is now the label for isStateControl)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing canHaveParts metadata label...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping metadata label update');
      return;
    }

    // Update metadata records where field_key = 'canHaveParts' and label is 'State Control' to 'Can Have Parts'
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'Can Have Parts'
      WHERE field_key = 'canHaveParts'
        AND label = 'State Control'
      RETURNING id, entity_type, entity_id, field_key, label;
    `);

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0;
    console.log(`✅ Updated ${updatedCount} metadata record(s) with field_key='canHaveParts' from 'State Control' to 'Can Have Parts'`);

    if (updatedCount > 0) {
      console.log('📋 Updated records:');
      updateResult.forEach((record) => {
        console.log(`   - ${record.entity_type}.${record.entity_id} (field_key: ${record.field_key}, old label: State Control, new label: Can Have Parts)`);
      });
    }

    // Also check and update admin_primitive_metadata table (for older databases that might still have it)
    const primitiveTableExists = await queryInterface.tableExists('admin_primitive_metadata');
    if (primitiveTableExists) {
      const [primitiveUpdateResult] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET label = 'Can Have Parts'
        WHERE field_key = 'canHaveParts'
          AND label = 'State Control'
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount = Array.isArray(primitiveUpdateResult) ? primitiveUpdateResult.length : 0;
      if (primitiveUpdatedCount > 0) {
        console.log(`✅ Updated ${primitiveUpdatedCount} record(s) in admin_primitive_metadata table`);
      }
    }

    // Also ensure canHaveParts metadata exists for blockShape if it's missing
    // This handles cases where the field exists in the database but metadata wasn't seeded
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    
    const [existingMetadata] = await queryInterface.sequelize.query(`
      SELECT id FROM admin_metadata
      WHERE entity_type = 'blockShape'
        AND entity_id = :entityId
        AND field_key = 'canHaveParts'
      LIMIT 1
    `, {
      replacements: { entityId: BLOCK_SHAPE_GLOBAL_CONFIG_ID },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (!existingMetadata || (Array.isArray(existingMetadata) && existingMetadata.length === 0)) {
      console.log('ℹ️  canHaveParts metadata not found for blockShape, creating it...');
      
      const { v4: uuidv4 } = await import('uuid');
      
      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id, metadata_type, entity_type, entity_id, field_key, data_type, label, is_required,
          visibility, layout, display_order, section, render_as, status_button_color,
          panel, bulk_edit, input_config, inherits_from_entity_type, inherits_from_entity_id,
          block_shape_ref, created_at, updated_at
        ) VALUES (
          :id, 'primitive', 'blockShape', :entityId, 'canHaveParts', 'boolean', 'Can Have Parts', false,
          'notConfigured', 'stacked', 3, null, 'text', null,
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
      
      console.log('✅ Created canHaveParts metadata for blockShape');
    }

    // Also ensure isStateControl metadata exists for blockShape if it's missing
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
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back canHaveParts metadata label fix...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    // Update metadata records where field_key = 'canHaveParts' and label is 'Can Have Parts' back to 'State Control'
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'State Control'
      WHERE field_key = 'canHaveParts'
        AND label = 'Can Have Parts'
      RETURNING id, entity_type, entity_id;
    `);

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0;
    console.log(`✅ Rolled back ${updatedCount} metadata record(s) from 'Can Have Parts' to 'State Control'`);

    // Also check and update admin_primitive_metadata table
    const primitiveTableExists = await queryInterface.tableExists('admin_primitive_metadata');
    if (primitiveTableExists) {
      const [primitiveUpdateResult] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET label = 'State Control'
        WHERE field_key = 'canHaveParts'
          AND label = 'Can Have Parts'
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount = Array.isArray(primitiveUpdateResult) ? primitiveUpdateResult.length : 0;
      if (primitiveUpdatedCount > 0) {
        console.log(`✅ Rolled back ${primitiveUpdatedCount} record(s) in admin_primitive_metadata table`);
      }
    }
  }
};
