/**
 * Migration: Add BlockShape-specific bookingMode metadata copies
 * Date: 2026-01-25
 * Purpose: Ensure BlockShape-specific copies of bookingMode metadata exist for each BlockShape
 * 
 * LEARNING: BlockShape-specific metadata allows per-BlockShape configuration
 * WHY: Each BlockShape's instances can have their own metadata configuration
 * PATTERN: Create copies of global metadata with block_shape_ref set to BlockShape ID
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding BlockShape-specific bookingMode metadata...')

    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    // Get all BlockShapes
    const [blockShapesRows] = await queryInterface.sequelize.query(`
      SELECT id FROM block_shapes ORDER BY id;
    `)
    const blockShapes = Array.isArray(blockShapesRows) ? blockShapesRows : []

    if (blockShapes.length === 0) {
      console.log('ℹ️  No BlockShapes found, skipping BlockShape-specific metadata creation')
      return
    }

    console.log(`📋 Found ${blockShapes.length} BlockShapes`)

    // Check if global bookingMode metadata exists
    const [globalMetadataRows] = await queryInterface.sequelize.query(`
      SELECT * FROM admin_metadata
      WHERE entity_type = 'blockInstance'
        AND entity_id = :globalConfigId
        AND field_key = 'bookingMode'
        AND block_shape_ref IS NULL;
    `, {
      replacements: { globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID }
    })

    const globalMetadata = Array.isArray(globalMetadataRows) ? globalMetadataRows : []

    if (globalMetadata.length === 0) {
      console.log('⚠️  Global bookingMode metadata not found. Creating it first...')
      
      // Create global bookingMode metadata
      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id, metadata_type, entity_type, entity_id, field_key, data_type,
          label, is_required, visibility, layout, display_order, render_as,
          panel, bulk_edit, input_config, block_shape_ref, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), 'primitive', 'blockInstance', 
          :globalConfigId, 'bookingMode', 'string',
          'Booking Mode', true, 'expandedDirect', 'stacked', 10, 'select',
          'none', true, 
          '{"options": [
            {"value": "standalone", "label": "Standalone Only"},
            {"value": "addOn", "label": "Add-On Only"},
            {"value": "both", "label": "Standalone or Add-On"}
          ]}'::jsonb,
          NULL,
          NOW(), NOW()
        )
        ON CONFLICT (entity_type, entity_id, metadata_type, field_key, block_shape_ref) DO NOTHING;
      `, {
        replacements: { globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID }
      })
      console.log('✅ Created global bookingMode metadata')
    } else {
      console.log('✅ Global bookingMode metadata already exists')
    }

    // Create BlockShape-specific copies for each BlockShape
    let createdCount = 0
    let skippedCount = 0

    for (const blockShape of blockShapes) {
      // Check if BlockShape-specific copy already exists
      const [existingRows] = await queryInterface.sequelize.query(`
        SELECT id FROM admin_metadata
        WHERE entity_type = 'blockInstance'
          AND entity_id = :globalConfigId
          AND field_key = 'bookingMode'
          AND block_shape_ref = :blockShapeId;
      `, {
        replacements: { 
          globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
          blockShapeId: blockShape.id 
        }
      })

      if (Array.isArray(existingRows) && existingRows.length > 0) {
        skippedCount++
        continue
      }

      // Create BlockShape-specific copy
      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id, metadata_type, entity_type, entity_id, field_key, data_type,
          label, is_required, visibility, layout, display_order, render_as,
          panel, bulk_edit, input_config, block_shape_ref, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), 'primitive', 'blockInstance', 
          :globalConfigId, 'bookingMode', 'string',
          'Booking Mode', true, 'expandedDirect', 'stacked', 10, 'select',
          'none', true, 
          '{"options": [
            {"value": "standalone", "label": "Standalone Only"},
            {"value": "addOn", "label": "Add-On Only"},
            {"value": "both", "label": "Standalone or Add-On"}
          ]}'::jsonb,
          :blockShapeId,
          NOW(), NOW()
        )
        ON CONFLICT (entity_type, entity_id, metadata_type, field_key, block_shape_ref) DO NOTHING;
      `, {
        replacements: { 
          globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
          blockShapeId: blockShape.id 
        }
      })
      createdCount++
    }

    console.log(`✅ Created ${createdCount} BlockShape-specific bookingMode metadata entries`)
    if (skippedCount > 0) {
      console.log(`ℹ️  Skipped ${skippedCount} entries (already exist)`)
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing BlockShape-specific bookingMode metadata...')

    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    // Remove all BlockShape-specific copies (but keep global)
    await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata 
      WHERE entity_type = 'blockInstance' 
        AND entity_id = :globalConfigId
        AND field_key = 'bookingMode'
        AND block_shape_ref IS NOT NULL;
    `, {
      replacements: { globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID }
    })

    console.log('✅ Removed BlockShape-specific bookingMode metadata')
  },
}
