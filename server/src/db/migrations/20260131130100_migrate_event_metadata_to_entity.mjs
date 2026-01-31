/**
 * Migration: Migrate event metadata from configType='event' to entityType/entityId format
 * Date: 2026-01-31
 * Purpose: Convert all metadata rows with configType='event' to use entityType='eventShape'/'eventInstance' and entityId
 * 
 * LEARNING: Migrates event metadata to entity-based format
 * WHY: Events are now core entities, metadata should use entityType/entityId instead of configType/configId
 * PATTERN: Convert configId to entityId, determine entityType from event_shapes/event_instances tables
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Migrating event metadata to entity format...');

    // Sentinel UUIDs for global event configs
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010';
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012';

    // Find all event metadata rows
    const [eventMetadataRows] = await queryInterface.sequelize.query(`
      SELECT id, config_id, metadata_type, field_key
      FROM admin_metadata
      WHERE config_type = 'event'
    `);

    console.log(`Found ${eventMetadataRows.length} event metadata rows to migrate`);

    // Migrate each row
    for (const row of eventMetadataRows) {
      const configId = row.config_id;
      let entityType;
      let entityId;

      // Handle sentinel UUIDs
      if (configId === EVENT_SHAPE_GLOBAL_CONFIG_ID) {
        entityType = 'eventShape';
        entityId = EVENT_SHAPE_GLOBAL_CONFIG_ID;
      } else if (configId === EVENT_INSTANCE_GLOBAL_CONFIG_ID) {
        entityType = 'eventInstance';
        entityId = EVENT_INSTANCE_GLOBAL_CONFIG_ID;
      } else {
        // Check if configId exists in event_shapes or event_instances
        const [eventShape] = await queryInterface.sequelize.query(`
          SELECT id FROM event_shapes WHERE id = :configId
        `, {
          replacements: { configId },
          type: Sequelize.QueryTypes.SELECT,
        });

        const [eventInstance] = await queryInterface.sequelize.query(`
          SELECT id FROM event_instances WHERE id = :configId
        `, {
          replacements: { configId },
          type: Sequelize.QueryTypes.SELECT,
        });

        if (eventShape && eventShape.length > 0) {
          entityType = 'eventShape';
          entityId = configId;
        } else if (eventInstance && eventInstance.length > 0) {
          entityType = 'eventInstance';
          entityId = configId;
        } else {
          console.warn(`⚠️  Could not determine entityType for configId ${configId}, defaulting to eventInstance`);
          entityType = 'eventInstance';
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

    console.log(`✅ Migrated ${eventMetadataRows.length} event metadata rows to entity format`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting event metadata migration...');

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010';
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012';

    // Find all migrated event metadata rows
    const [migratedRows] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id
      FROM admin_metadata
      WHERE entity_type IN ('eventShape', 'eventInstance')
    `);

    // Revert each row
    for (const row of migratedRows) {
      let configId;
      let configType = 'event';

      // Determine configId from entityId
      if (row.entity_id === EVENT_SHAPE_GLOBAL_CONFIG_ID || row.entity_type === 'eventShape') {
        configId = row.entity_id === EVENT_SHAPE_GLOBAL_CONFIG_ID 
          ? EVENT_SHAPE_GLOBAL_CONFIG_ID 
          : row.entity_id;
      } else {
        configId = row.entity_id === EVENT_INSTANCE_GLOBAL_CONFIG_ID
          ? EVENT_INSTANCE_GLOBAL_CONFIG_ID
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

    console.log(`✅ Reverted ${migratedRows.length} event metadata rows`);
  }
};
