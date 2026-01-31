/**
 * Migration: Add configType discriminator to admin_metadata table
 * Date: 2026-01-31
 * Purpose: Extend AdminMetadata to support both entities and configuration data (events/annotations)
 *          using a configType discriminator
 * 
 * LEARNING: Extends AdminMetadata to support non-entity configuration data
 * WHY: Events and annotations are configuration data, not entities, but need metadata support
 * PATTERN: Use configType discriminator: 'entity' | 'event' | 'annotation'
 *          For entities: configType='entity', entityType/entityId populated, configId NULL
 *          For config: configType='event'|'annotation', configId populated, entityType/entityId NULL
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding configType discriminator to admin_metadata table...');

    // Create configType ENUM
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_config_type') THEN
          CREATE TYPE enum_admin_metadata_config_type AS ENUM (
            'entity', 'event', 'annotation'
          );
        END IF;
      END $$;
    `);

    // Add configType column (default 'entity' for existing rows)
    // LEARNING: Check if column exists before adding to make migration idempotent
    // WHY: Migration may have partially run before failing
    const configTypeColumnExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_metadata' AND column_name = 'config_type'
    `).then(([results]) => results.length > 0);

    if (!configTypeColumnExists) {
      await queryInterface.addColumn('admin_metadata', 'config_type', {
        type: Sequelize.ENUM('entity', 'event', 'annotation'),
        allowNull: false,
        defaultValue: 'entity',
        comment: 'Discriminator: entity, event, or annotation metadata',
      });
    }

    // Add configId column (nullable, used for non-entities)
    const configIdColumnExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_metadata' AND column_name = 'config_id'
    `).then(([results]) => results.length > 0);

    if (!configIdColumnExists) {
      await queryInterface.addColumn('admin_metadata', 'config_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Configuration data ID (for events/annotations, NULL for entities)',
      });
    }

    // Make entityType nullable (for non-entities)
    // LEARNING: Use raw SQL instead of changeColumn to avoid ENUM type recreation issues
    // WHY: changeColumn tries to recreate ENUM types which causes SQL quote escaping problems
    // PATTERN: Use ALTER TABLE directly with raw SQL
    // LEARNING: Check if column is already nullable to make migration idempotent
    const entityTypeIsNullable = await queryInterface.sequelize.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'admin_metadata' AND column_name = 'entity_type'
    `).then(([results]) => results[0]?.is_nullable === 'YES');

    if (!entityTypeIsNullable) {
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_metadata 
        ALTER COLUMN entity_type DROP NOT NULL;
      `);
    }
    
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN admin_metadata.entity_type IS 'Entity type for this metadata entry (NULL for non-entities)';
    `);

    // Make entityId nullable (for non-entities)
    const entityIdIsNullable = await queryInterface.sequelize.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'admin_metadata' AND column_name = 'entity_id'
    `).then(([results]) => results[0]?.is_nullable === 'YES');

    if (!entityIdIsNullable) {
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_metadata 
        ALTER COLUMN entity_id DROP NOT NULL;
      `);
    }
    
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN admin_metadata.entity_id IS 'Entity ID or sentinel UUID for global configs (NULL for non-entities)';
    `);

    // Drop old unique constraint (if it exists)
    // LEARNING: Check if constraint exists before removing to make migration idempotent
    const constraintExists = await queryInterface.sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'admin_metadata' AND constraint_name = 'admin_metadata_entity_metadata_field_unique'
    `).then(([results]) => results.length > 0);

    if (constraintExists) {
      await queryInterface.removeConstraint('admin_metadata', 'admin_metadata_entity_metadata_field_unique');
    }

    // Create partial unique indexes (PostgreSQL supports WHERE clauses in unique indexes)
    // LEARNING: Use IF NOT EXISTS to make migration idempotent
    // WHY: Indexes may have been created in a previous partial run
    // For entities: configType='entity', entityType/entityId populated, configId NULL
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_metadata_entity_unique 
      ON admin_metadata (config_type, entity_type, entity_id, metadata_type, field_key, COALESCE(block_shape_ref::text, ''))
      WHERE config_type = 'entity';
    `);

    // For event config data: configType='event', configId populated, entityType/entityId NULL
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_metadata_event_unique 
      ON admin_metadata (config_type, config_id, metadata_type, field_key)
      WHERE config_type = 'event';
    `);

    // For annotation config data: configType='annotation', configId populated, entityType/entityId NULL
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_metadata_annotation_unique 
      ON admin_metadata (config_type, config_id, metadata_type, field_key)
      WHERE config_type = 'annotation';
    `);

    // Add indexes for config data lookups
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS admin_metadata_config_idx 
      ON admin_metadata (config_type, config_id)
      WHERE config_type IN ('event', 'annotation');
    `);

    console.log('✅ Added configType discriminator to admin_metadata table');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing configType discriminator from admin_metadata table...');

    // Remove indexes
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS admin_metadata_config_idx;`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS admin_metadata_annotation_unique;`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS admin_metadata_event_unique;`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS admin_metadata_entity_unique;`);

    // Restore old unique constraint
    await queryInterface.addConstraint('admin_metadata', {
      fields: ['entity_type', 'entity_id', 'metadata_type', 'field_key', 'block_shape_ref'],
      type: 'unique',
      name: 'admin_metadata_entity_metadata_field_unique',
    });

    // Make entityId NOT NULL again
    // LEARNING: Use raw SQL instead of changeColumn to avoid ENUM type recreation issues
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_metadata 
      ALTER COLUMN entity_id SET NOT NULL;
      
      COMMENT ON COLUMN admin_metadata.entity_id IS 'Entity ID or sentinel UUID for global configs';
    `);

    // Make entityType NOT NULL again
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_metadata 
      ALTER COLUMN entity_type SET NOT NULL;
      
      COMMENT ON COLUMN admin_metadata.entity_type IS 'Entity type for this metadata entry';
    `);

    // Remove columns
    await queryInterface.removeColumn('admin_metadata', 'config_id');
    await queryInterface.removeColumn('admin_metadata', 'config_type');

    // Note: We don't drop the enum type as it might be used elsewhere
    // If needed, drop manually: DROP TYPE IF EXISTS enum_admin_metadata_config_type;

    console.log('✅ Removed configType discriminator from admin_metadata table');
  },
};
