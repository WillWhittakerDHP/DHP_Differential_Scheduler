/**
 * Migration: Seed BlockShape-specific instance metadata
 * Date: 2026-01-19
 * Purpose: Create BlockShape-specific metadata copies from global blockInstance config
 *          Allows each BlockShape's instances to have their own metadata configuration
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Seeding BlockShape-specific instance metadata...');

    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

    // Get all BlockShapes
    const [blockShapesRows] = await queryInterface.sequelize.query(`
      SELECT id FROM block_shapes ORDER BY id;
    `);

    const blockShapes = Array.isArray(blockShapesRows) ? blockShapesRows : [];

    if (blockShapes.length === 0) {
      console.log('ℹ️  No BlockShapes found, skipping BlockShape-specific metadata seeding');
      return;
    }

    console.log(`📋 Found ${blockShapes.length} BlockShapes`);

    // Get all global blockInstance metadata (blockShapeRef IS NULL)
    const [globalMetadataRows] = await queryInterface.sequelize.query(`
      SELECT * FROM admin_metadata
      WHERE entity_type = 'blockInstance'
        AND entity_id = :globalConfigId
        AND block_shape_ref IS NULL;
    `, {
      replacements: { globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID },
    });

    const globalMetadata = Array.isArray(globalMetadataRows) ? globalMetadataRows : [];

    if (globalMetadata.length === 0) {
      console.log('ℹ️  No global blockInstance metadata found, skipping BlockShape-specific metadata seeding');
      return;
    }

    console.log(`📋 Found ${globalMetadata.length} global blockInstance metadata entries`);

    // Create BlockShape-specific copies for each BlockShape
    let totalCreated = 0;
    for (const blockShape of blockShapes) {
      const blockShapeId = blockShape.id;

      for (const metadataEntry of globalMetadata) {
        // Check if BlockShape-specific metadata already exists
        const [existingRows] = await queryInterface.sequelize.query(`
          SELECT id FROM admin_metadata
          WHERE entity_type = 'blockInstance'
            AND entity_id = :globalConfigId
            AND metadata_type = :metadataType
            AND field_key = :fieldKey
            AND block_shape_ref = :blockShapeRef;
        `, {
          replacements: {
            globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
            metadataType: metadataEntry.metadata_type,
            fieldKey: metadataEntry.field_key,
            blockShapeRef: blockShapeId,
          },
        });

        const existing = Array.isArray(existingRows) ? existingRows : [];
        if (existing.length > 0) {
          // Already exists, skip
          continue;
        }

        // Create BlockShape-specific copy
        await queryInterface.sequelize.query(`
          INSERT INTO admin_metadata (
            id,
            metadata_type,
            entity_type,
            entity_id,
            field_key,
            data_type,
            label,
            is_required,
            visibility,
            layout,
            display_order,
            section,
            render_as,
            status_button_color,
            panel,
            bulk_edit,
            input_config,
            inherits_from_entity_type,
            inherits_from_entity_id,
            block_shape_ref,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            :metadataType,
            :entityType,
            :entityId,
            :fieldKey,
            :dataType,
            :label,
            :isRequired,
            :visibility,
            :layout,
            :displayOrder,
            :section,
            :renderAs,
            :statusButtonColor,
            :panel,
            :bulkEdit,
            :inputConfig,
            :inheritsFromEntityType,
            :inheritsFromEntityId,
            :blockShapeRef,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          );
        `, {
          replacements: {
            metadataType: metadataEntry.metadata_type,
            entityType: metadataEntry.entity_type,
            entityId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
            fieldKey: metadataEntry.field_key,
            dataType: metadataEntry.data_type,
            label: metadataEntry.label,
            isRequired: metadataEntry.is_required,
            visibility: metadataEntry.visibility,
            layout: metadataEntry.layout,
            displayOrder: metadataEntry.display_order,
            section: metadataEntry.section,
            renderAs: metadataEntry.render_as,
            statusButtonColor: metadataEntry.status_button_color,
            panel: metadataEntry.panel,
            bulkEdit: metadataEntry.bulk_edit,
            inputConfig: metadataEntry.input_config ? JSON.stringify(metadataEntry.input_config) : null,
            inheritsFromEntityType: metadataEntry.inherits_from_entity_type,
            inheritsFromEntityId: metadataEntry.inherits_from_entity_id,
            blockShapeRef: blockShapeId,
          },
        });

        totalCreated++;
      }
    }

    console.log(`✅ Created ${totalCreated} BlockShape-specific metadata entries`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting BlockShape-specific instance metadata seeding...');

    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

    // Delete all BlockShape-specific metadata (blockShapeRef IS NOT NULL)
    const [result] = await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata
      WHERE entity_type = 'blockInstance'
        AND entity_id = :globalConfigId
        AND block_shape_ref IS NOT NULL;
    `, {
      replacements: { globalConfigId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID },
    });

    console.log(`✅ Deleted ${result.rowCount || 0} BlockShape-specific metadata entries`);
  },
};
