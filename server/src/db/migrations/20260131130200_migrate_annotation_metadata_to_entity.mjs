/**
 * Migration: Migrate annotation metadata from configType='annotation' to entityType/entityId format
 * Date: 2026-01-31
 * Purpose: Convert all metadata rows with configType='annotation' to use entityType='annotationShape'/'annotationInstance' and entityId
 * 
 * LEARNING: Migrates annotation metadata to entity-based format
 * WHY: Annotations are now core entities, metadata should use entityType/entityId instead of configType/configId
 * PATTERN: Convert configId to entityId, determine entityType from annotation_shapes/annotation_instances tables
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Migrating annotation metadata to entity format...');

    // Sentinel UUIDs for global annotation configs
    const ANNOTATION_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000011';
    const ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000013';

    // Find all annotation metadata rows
    const [annotationMetadataRows] = await queryInterface.sequelize.query(`
      SELECT id, config_id, metadata_type, field_key
      FROM admin_metadata
      WHERE config_type = 'annotation'
    `);

    console.log(`Found ${annotationMetadataRows.length} annotation metadata rows to migrate`);

    // Migrate each row
    for (const row of annotationMetadataRows) {
      const configId = row.config_id;
      let entityType;
      let entityId;

      // Handle sentinel UUIDs
      if (configId === ANNOTATION_SHAPE_GLOBAL_CONFIG_ID) {
        entityType = 'annotationShape';
        entityId = ANNOTATION_SHAPE_GLOBAL_CONFIG_ID;
      } else if (configId === ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID) {
        entityType = 'annotationInstance';
        entityId = ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID;
      } else {
        // Check if configId exists in annotation_shapes or annotation_instances
        const [annotationShape] = await queryInterface.sequelize.query(`
          SELECT id FROM annotation_shapes WHERE id = :configId
        `, {
          replacements: { configId },
          type: Sequelize.QueryTypes.SELECT,
        });

        const [annotationInstance] = await queryInterface.sequelize.query(`
          SELECT id FROM annotation_instances WHERE id = :configId
        `, {
          replacements: { configId },
          type: Sequelize.QueryTypes.SELECT,
        });

        if (annotationShape && annotationShape.length > 0) {
          entityType = 'annotationShape';
          entityId = configId;
        } else if (annotationInstance && annotationInstance.length > 0) {
          entityType = 'annotationInstance';
          entityId = configId;
        } else {
          console.warn(`⚠️  Could not determine entityType for configId ${configId}, defaulting to annotationInstance`);
          entityType = 'annotationInstance';
          entityId = configId;
        }
      }

      // Update the row
      await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET entity_type = :entityType,
            entity_id = :entityId::uuid,
            config_id = NULL
        WHERE id = :id
      `, {
        replacements: {
          id: row.id,
          entityType,
          entityId,
        },
      });
    }

    console.log(`✅ Migrated ${annotationMetadataRows.length} annotation metadata rows to entity format`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting annotation metadata migration...');

    const ANNOTATION_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000011';
    const ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000013';

    // Find all migrated annotation metadata rows
    const [migratedRows] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id
      FROM admin_metadata
      WHERE entity_type IN ('annotationShape', 'annotationInstance')
    `);

    // Revert each row
    for (const row of migratedRows) {
      let configId;
      let configType = 'annotation';

      // Determine configId from entityId
      if (row.entity_id === ANNOTATION_SHAPE_GLOBAL_CONFIG_ID || row.entity_type === 'annotationShape') {
        configId = row.entity_id === ANNOTATION_SHAPE_GLOBAL_CONFIG_ID 
          ? ANNOTATION_SHAPE_GLOBAL_CONFIG_ID 
          : row.entity_id;
      } else {
        configId = row.entity_id === ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID
          ? ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID
          : row.entity_id;
      }

      // Update the row
      await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET config_type = :configType,
            config_id = :configId::uuid,
            entity_type = NULL,
            entity_id = NULL
        WHERE id = :id
      `, {
        replacements: {
          id: row.id,
          configType,
          configId,
        },
      });
    }

    console.log(`✅ Reverted ${migratedRows.length} annotation metadata rows`);
  }
};
