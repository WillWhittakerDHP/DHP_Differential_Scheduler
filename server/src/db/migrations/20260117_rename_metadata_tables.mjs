/**
 * Migration: Rename metadata tables to clarify purpose
 * Date: 2026-01-17
 * Purpose: Rename tables to reflect that they store metadata for ALL entity types, not just shapes
 * 
 * LEARNING: Table names were misleading - they actually store instance field metadata
 * WHY: Need clearer naming: field_metadata (canonical) and entity_layout_config (per-entity)
 * PATTERN: Generic names that work for all entity types (instances and shapes)
 * 
 * Changes:
 * - shape_field_metadata → field_metadata
 * - shape_layout_config → entity_layout_config
 * - shape_layout_config.shape_id → entity_layout_config.entity_id
 * - shape_layout_config.shape_type → entity_layout_config.entity_type
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting metadata table rename...');

    // Rename shape_field_metadata to field_metadata
    const fieldMetadataExists = await queryInterface.tableExists('shape_field_metadata');
    if (fieldMetadataExists) {
      await queryInterface.renameTable('shape_field_metadata', 'field_metadata');
      console.log('✅ Renamed shape_field_metadata → field_metadata');
    } else {
      console.log('ℹ️  shape_field_metadata table does not exist, skipping rename');
    }

    // Rename shape_layout_config to entity_layout_config
    const layoutConfigExists = await queryInterface.tableExists('shape_layout_config');
    if (layoutConfigExists) {
      await queryInterface.renameTable('shape_layout_config', 'entity_layout_config');
      console.log('✅ Renamed shape_layout_config → entity_layout_config');

      // Rename columns in entity_layout_config
      const tableDescription = await queryInterface.describeTable('entity_layout_config');
      
      if (tableDescription.shape_id) {
        await queryInterface.renameColumn('entity_layout_config', 'shape_id', 'entity_id');
        console.log('✅ Renamed column shape_id → entity_id');
      }
      
      if (tableDescription.shape_type) {
        await queryInterface.renameColumn('entity_layout_config', 'shape_type', 'entity_type');
        console.log('✅ Renamed column shape_type → entity_type');
      }

      // Drop old indexes and recreate with new names
      try {
        await queryInterface.removeIndex('entity_layout_config', 'shape_layout_config_shape_field_unique');
      } catch (e) {
        // Index might not exist or have different name
      }
      
      try {
        await queryInterface.removeIndex('entity_layout_config', 'shape_layout_config_shape_idx');
      } catch (e) {
        // Index might not exist or have different name
      }
      
      try {
        await queryInterface.removeIndex('entity_layout_config', 'shape_layout_config_field_key_idx');
      } catch (e) {
        // Index might not exist or have different name
      }

      // Recreate indexes with new column names
      await queryInterface.addIndex('entity_layout_config', ['entity_id', 'entity_type', 'field_key'], {
        unique: true,
        name: 'entity_layout_config_entity_field_unique',
      });

      await queryInterface.addIndex('entity_layout_config', ['entity_id', 'entity_type'], {
        name: 'entity_layout_config_entity_idx',
      });

      await queryInterface.addIndex('entity_layout_config', ['field_key'], {
        name: 'entity_layout_config_field_key_idx',
      });

      console.log('✅ Recreated indexes with new column names');

      // Update ENUM types to include shape entity types
      // Note: PostgreSQL ENUM type names don't change when tables are renamed
      // We need to find the actual ENUM type names and update them
      
      // Update ENUM types to include shape entity types
      // Note: PostgreSQL ENUM type names don't change when tables are renamed
      // The enum is still named enum_shape_field_metadata_entity_type (old name)
      
      // Update field_metadata enum (still named enum_shape_field_metadata_entity_type)
      try {
        await queryInterface.sequelize.query(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'blockShape' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_shape_field_metadata_entity_type')) THEN
              ALTER TYPE enum_shape_field_metadata_entity_type ADD VALUE 'blockShape';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partShape' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_shape_field_metadata_entity_type')) THEN
              ALTER TYPE enum_shape_field_metadata_entity_type ADD VALUE 'partShape';
            END IF;
          END $$;
        `);
        console.log('✅ Updated enum_shape_field_metadata_entity_type to include blockShape and partShape');
      } catch (err) {
        console.log('ℹ️  Could not update enum_shape_field_metadata_entity_type:', err instanceof Error ? err.message : String(err));
      }
      
      // Update entity_layout_config enum (still named enum_shape_layout_config_shape_type)
      try {
        await queryInterface.sequelize.query(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'blockShape' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_shape_layout_config_shape_type')) THEN
              ALTER TYPE enum_shape_layout_config_shape_type ADD VALUE 'blockShape';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partShape' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_shape_layout_config_shape_type')) THEN
              ALTER TYPE enum_shape_layout_config_shape_type ADD VALUE 'partShape';
            END IF;
          END $$;
        `);
        console.log('✅ Updated enum_shape_layout_config_shape_type to include blockShape and partShape');
      } catch (err) {
        console.log('ℹ️  Could not update enum_shape_layout_config_shape_type:', err instanceof Error ? err.message : String(err));
      }
    } else {
      console.log('ℹ️  shape_layout_config table does not exist, skipping rename');
    }

    console.log('✅ Completed metadata table rename');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting metadata table rename...');

    // Revert entity_layout_config to shape_layout_config
    const entityLayoutConfigExists = await queryInterface.tableExists('entity_layout_config');
    if (entityLayoutConfigExists) {
      // Drop new indexes
      try {
        await queryInterface.removeIndex('entity_layout_config', 'entity_layout_config_entity_field_unique');
      } catch (e) {
        // Index might not exist
      }
      
      try {
        await queryInterface.removeIndex('entity_layout_config', 'entity_layout_config_entity_idx');
      } catch (e) {
        // Index might not exist
      }
      
      try {
        await queryInterface.removeIndex('entity_layout_config', 'entity_layout_config_field_key_idx');
      } catch (e) {
        // Index might not exist
      }

      // Rename columns back
      const tableDescription = await queryInterface.describeTable('entity_layout_config');
      
      if (tableDescription.entity_id) {
        await queryInterface.renameColumn('entity_layout_config', 'entity_id', 'shape_id');
      }
      
      if (tableDescription.entity_type) {
        await queryInterface.renameColumn('entity_layout_config', 'entity_type', 'shape_type');
      }

      // Recreate old indexes
      await queryInterface.addIndex('entity_layout_config', ['shape_id', 'shape_type', 'field_key'], {
        unique: true,
        name: 'shape_layout_config_shape_field_unique',
      });

      await queryInterface.addIndex('entity_layout_config', ['shape_id', 'shape_type'], {
        name: 'shape_layout_config_shape_idx',
      });

      await queryInterface.addIndex('entity_layout_config', ['field_key'], {
        name: 'shape_layout_config_field_key_idx',
      });

      await queryInterface.renameTable('entity_layout_config', 'shape_layout_config');
      console.log('✅ Reverted entity_layout_config → shape_layout_config');
    }

    // Revert field_metadata to shape_field_metadata
    const fieldMetadataExists = await queryInterface.tableExists('field_metadata');
    if (fieldMetadataExists) {
      await queryInterface.renameTable('field_metadata', 'shape_field_metadata');
      console.log('✅ Reverted field_metadata → shape_field_metadata');
    }

    console.log('✅ Completed metadata table rename rollback');
  }
};
