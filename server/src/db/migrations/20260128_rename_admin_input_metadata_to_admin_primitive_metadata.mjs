/**
 * Migration: Rename admin_input_metadata to admin_primitive_metadata
 * Date: 2026-01-28
 * Purpose: Rename table and related objects to align with entity data pattern
 *          Primitive metadata matches displayConfig.primitives pattern
 * 
 * LEARNING: Align metadata naming with entity data structure
 * WHY: Prevents key collisions, matches regular entity data pattern (primitives + relationships)
 * PATTERN: Rename to "primitive metadata" to match displayConfig.primitives terminology
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting admin_input_metadata to admin_primitive_metadata rename...');

    // Check if table already exists with new name (idempotent migration)
    const [results] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_primitive_metadata'
      );
    `);
    const tableAlreadyRenamed = results[0].exists;

    if (!tableAlreadyRenamed) {
      // Rename the table only if it hasn't been renamed yet
      await queryInterface.renameTable('admin_input_metadata', 'admin_primitive_metadata');
      console.log('✅ Renamed table: admin_input_metadata → admin_primitive_metadata');
    } else {
      console.log('⚠️  Table already renamed to admin_primitive_metadata, skipping rename step');
    }

    // Rename indexes (idempotent - IF EXISTS handles already renamed indexes)
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_input_metadata_entity_field_unique 
      RENAME TO admin_primitive_metadata_entity_field_unique;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_input_metadata_entity_idx 
      RENAME TO admin_primitive_metadata_entity_idx;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_input_metadata_field_key_idx 
      RENAME TO admin_primitive_metadata_field_key_idx;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_input_metadata_inheritance_idx 
      RENAME TO admin_primitive_metadata_inheritance_idx;
    `);
    
    console.log('✅ Renamed indexes (if they existed)');

    // Rename ENUM types (create new ones, migrate data, drop old ones)
    // Note: PostgreSQL doesn't support renaming ENUM types directly, so we create new ones
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Create new ENUM types if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_primitive_metadata_entity_type') THEN
          CREATE TYPE enum_admin_primitive_metadata_entity_type AS ENUM (
            'blockShape', 'partShape', 'blockInstance', 'partInstance'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_primitive_metadata_data_type') THEN
          CREATE TYPE enum_admin_primitive_metadata_data_type AS ENUM (
            'string', 'number', 'boolean', 'array', 'reference'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_primitive_metadata_visibility') THEN
          CREATE TYPE enum_admin_primitive_metadata_visibility AS ENUM (
            'titleRow', 'staticAsTitle', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_primitive_metadata_layout') THEN
          CREATE TYPE enum_admin_primitive_metadata_layout AS ENUM (
            'inline', 'stacked'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_primitive_metadata_render_as') THEN
          CREATE TYPE enum_admin_primitive_metadata_render_as AS ENUM (
            'text', 'number', 'select', 'multiselect', 'reference', 'statusButton', 'iconSelect', 'partsCollection'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_primitive_metadata_panel') THEN
          CREATE TYPE enum_admin_primitive_metadata_panel AS ENUM (
            'none', 'parts', 'relationships', 'annotations'
          );
        END IF;
      END $$;
    `);

    // Check if ENUM types already exist (idempotent check)
    const [enumCheck] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM pg_type WHERE typname = 'enum_admin_primitive_metadata_entity_type'
      );
    `);
    const enumsAlreadyExist = enumCheck[0].exists;

    if (!enumsAlreadyExist) {
      // Update column types to use new ENUMs
      // LEARNING: Need to drop defaults before changing type, then restore them
      // WHY: PostgreSQL can't automatically cast default values when changing ENUM types
      // PATTERN: Drop default → Change type → Restore default
      
      // entity_type
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN entity_type DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN entity_type TYPE enum_admin_primitive_metadata_entity_type 
        USING entity_type::text::enum_admin_primitive_metadata_entity_type;
      `);

      // data_type
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN data_type DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN data_type TYPE enum_admin_primitive_metadata_data_type 
        USING data_type::text::enum_admin_primitive_metadata_data_type;
      `);

      // visibility
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN visibility DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN visibility TYPE enum_admin_primitive_metadata_visibility 
        USING visibility::text::enum_admin_primitive_metadata_visibility;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN visibility SET DEFAULT 'notConfigured';
      `);

      // layout
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN layout DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN layout TYPE enum_admin_primitive_metadata_layout 
        USING layout::text::enum_admin_primitive_metadata_layout;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN layout SET DEFAULT 'stacked';
      `);

      // render_as
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN render_as DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN render_as TYPE enum_admin_primitive_metadata_render_as 
        USING render_as::text::enum_admin_primitive_metadata_render_as;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN render_as SET DEFAULT 'text';
      `);

      // panel
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN panel DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN panel TYPE enum_admin_primitive_metadata_panel 
        USING panel::text::enum_admin_primitive_metadata_panel;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE admin_primitive_metadata
        ALTER COLUMN panel SET DEFAULT 'none';
      `);
      
      console.log('✅ Updated ENUM types');
    } else {
      console.log('⚠️  ENUM types already exist, skipping type conversion');
    }

    console.log('✅ Updated ENUM types');

    console.log('✅ Migration completed: admin_input_metadata → admin_primitive_metadata');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting admin_primitive_metadata to admin_input_metadata rename...');

    // Revert ENUM types (drop defaults first, change type, restore defaults)
    
    // visibility
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN visibility DROP DEFAULT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN visibility TYPE enum_admin_input_metadata_visibility 
      USING visibility::text::enum_admin_input_metadata_visibility;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN visibility SET DEFAULT 'notConfigured';
    `);

    // layout
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN layout DROP DEFAULT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN layout TYPE enum_admin_input_metadata_layout 
      USING layout::text::enum_admin_input_metadata_layout;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN layout SET DEFAULT 'stacked';
    `);

    // render_as
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN render_as DROP DEFAULT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN render_as TYPE enum_admin_input_metadata_render_as 
      USING render_as::text::enum_admin_input_metadata_render_as;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN render_as SET DEFAULT 'text';
    `);

    // panel
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN panel DROP DEFAULT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN panel TYPE enum_admin_input_metadata_panel 
      USING panel::text::enum_admin_input_metadata_panel;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN panel SET DEFAULT 'none';
    `);

    // entity_type and data_type (no defaults to restore)
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN entity_type TYPE enum_admin_input_metadata_entity_type 
      USING entity_type::text::enum_admin_input_metadata_entity_type;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE admin_primitive_metadata
      ALTER COLUMN data_type TYPE enum_admin_input_metadata_data_type 
      USING data_type::text::enum_admin_input_metadata_data_type;
    `);

    // Revert indexes
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_primitive_metadata_entity_field_unique 
      RENAME TO admin_input_metadata_entity_field_unique;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_primitive_metadata_entity_idx 
      RENAME TO admin_input_metadata_entity_idx;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_primitive_metadata_field_key_idx 
      RENAME TO admin_input_metadata_field_key_idx;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS admin_primitive_metadata_inheritance_idx 
      RENAME TO admin_input_metadata_inheritance_idx;
    `);

    // Revert table name
    await queryInterface.renameTable('admin_primitive_metadata', 'admin_input_metadata');
    
    console.log('✅ Reverted migration');
  },
};
