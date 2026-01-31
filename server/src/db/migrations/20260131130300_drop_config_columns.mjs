/**
 * Migration: Drop configType and configId columns from admin_metadata table
 * Date: 2026-01-31
 * Purpose: Remove configType and configId columns since all metadata now uses entityType/entityId
 * 
 * LEARNING: Removes redundant columns after migration to entity-based format
 * WHY: Everything is now an entity, configType/configId are no longer needed
 * PATTERN: Drop indexes first, then columns, then recreate indexes without config columns
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Dropping configType and configId columns...');

    // Drop indexes that reference configType/configId
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS admin_metadata_event_unique;
    `);

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS admin_metadata_annotation_unique;
    `);

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS admin_metadata_config_idx;
    `);

    // Drop and recreate admin_metadata_entity_idx without config_type
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS admin_metadata_entity_idx;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS admin_metadata_entity_idx 
      ON admin_metadata (entity_type, entity_id);
    `);

    // Drop existing unique constraint that includes block_shape_ref (if it exists)
    // LEARNING: Need to drop admin_metadata_entity_metadata_field_unique which includes block_shape_ref
    // WHY: This constraint may include config_type, need to recreate without it
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS admin_metadata_entity_metadata_field_unique;
    `);

    // Drop any other unique constraints that reference config_type
    const [constraintCheck] = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'admin_metadata'
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%config%'
    `);

    if (constraintCheck && constraintCheck.length > 0) {
      for (const constraint of constraintCheck) {
        await queryInterface.sequelize.query(`
          ALTER TABLE admin_metadata DROP CONSTRAINT IF EXISTS ${constraint.constraint_name};
        `);
      }
    }

    // Create new unique constraint without config_type, but including block_shape_ref
    // LEARNING: blockShapeRef is needed for blockInstance entities to allow BlockShape-specific metadata
    // WHY: Each BlockShape's instances can have their own metadata configuration
    // PATTERN: Include block_shape_ref in unique constraint using NULLS NOT DISTINCT
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_metadata_entity_metadata_field_unique 
      ON admin_metadata (entity_type, entity_id, metadata_type, field_key, block_shape_ref)
      NULLS NOT DISTINCT;
    `);

    // Drop configType column
    const configTypeColumnExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_metadata' AND column_name = 'config_type'
    `).then(([results]) => results.length > 0);

    if (configTypeColumnExists) {
      await queryInterface.removeColumn('admin_metadata', 'config_type');
      console.log('✅ Dropped config_type column');
    }

    // Drop configId column
    const configIdColumnExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_metadata' AND column_name = 'config_id'
    `).then(([results]) => results.length > 0);

    if (configIdColumnExists) {
      await queryInterface.removeColumn('admin_metadata', 'config_id');
      console.log('✅ Dropped config_id column');
    }

    // Drop configType ENUM type (optional - can keep for rollback)
    // await queryInterface.sequelize.query(`
    //   DROP TYPE IF EXISTS enum_admin_metadata_config_type;
    // `);

    console.log('✅ Dropped configType and configId columns and updated indexes');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting config column drop...');

    // Recreate configType ENUM if it doesn't exist
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

    // Add configType column back
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

    // Add configId column back
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

    // Recreate indexes with config columns
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS admin_metadata_entity_idx;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS admin_metadata_entity_idx 
      ON admin_metadata (config_type, entity_type, entity_id);
    `);

    // Recreate unique constraint with config_type (for rollback compatibility)
    // LEARNING: Include block_shape_ref in unique constraint for blockInstance entities
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS admin_metadata_entity_metadata_field_unique;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_metadata_entity_metadata_field_unique 
      ON admin_metadata (config_type, entity_type, entity_id, metadata_type, field_key, block_shape_ref)
      NULLS NOT DISTINCT;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS admin_metadata_config_idx 
      ON admin_metadata (config_type, config_id)
      WHERE config_type IN ('event', 'annotation');
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_metadata_event_unique 
      ON admin_metadata (config_type, config_id, metadata_type, field_key)
      WHERE config_type = 'event';
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_metadata_annotation_unique 
      ON admin_metadata (config_type, config_id, metadata_type, field_key)
      WHERE config_type = 'annotation';
    `);

    console.log('✅ Reverted config column drop');
  }
};
