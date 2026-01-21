/**
 * Migration: Create unified admin_metadata table
 * Date: 2026-02-02
 * Purpose: Create unified admin_metadata table to replace admin_primitive_metadata and admin_relationship_metadata
 *          Follows entity pattern: single table with discriminator field
 * 
 * LEARNING: Unified metadata table with metadataType discriminator
 * WHY: Matches entity pattern - single endpoint/table, backend routes based on field type
 * PATTERN: Single table stores both primitive and relationship metadata with metadata_type discriminator
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting unified admin_metadata table creation...');

    const tableExists = await queryInterface.tableExists('admin_metadata');
    
    if (tableExists) {
      console.log('ℹ️  admin_metadata table already exists, skipping');
      return;
    }

    // Create ENUM types first
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Metadata type enum (discriminator)
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_metadata_type') THEN
          CREATE TYPE enum_admin_metadata_metadata_type AS ENUM (
            'primitive', 'relationship'
          );
        END IF;
        
        -- Entity type enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_entity_type') THEN
          CREATE TYPE enum_admin_metadata_entity_type AS ENUM (
            'blockShape', 'partShape', 'blockInstance', 'partInstance'
          );
        END IF;
        
        -- Data type enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_data_type') THEN
          CREATE TYPE enum_admin_metadata_data_type AS ENUM (
            'string', 'number', 'boolean', 'array', 'reference'
          );
        END IF;
        
        -- Visibility enum (includes staticAsTitle)
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_visibility') THEN
          CREATE TYPE enum_admin_metadata_visibility AS ENUM (
            'titleRow', 'staticAsTitle', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'
          );
        END IF;
        
        -- Layout enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_layout') THEN
          CREATE TYPE enum_admin_metadata_layout AS ENUM (
            'inline', 'stacked'
          );
        END IF;
        
        -- Render as enum (includes all values from both tables)
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_render_as') THEN
          CREATE TYPE enum_admin_metadata_render_as AS ENUM (
            'text', 'number', 'select', 'multiselect', 'reference', 'statusButton', 'iconSelect', 'partsCollection'
          );
        END IF;
        
        -- Panel enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_metadata_panel') THEN
          CREATE TYPE enum_admin_metadata_panel AS ENUM (
            'none', 'parts', 'relationships', 'annotations'
          );
        END IF;
      END $$;
    `);

    // Create unified table
    await queryInterface.createTable('admin_metadata', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      metadata_type: {
        type: Sequelize.ENUM('primitive', 'relationship'),
        allowNull: false,
        comment: 'Discriminator: primitive or relationship metadata',
      },
      entity_type: {
        type: Sequelize.ENUM('blockShape', 'partShape', 'blockInstance', 'partInstance'),
        allowNull: false,
        comment: 'Entity type for this metadata entry',
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Entity ID or sentinel UUID for global configs',
      },
      field_key: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Field name/key (unified - replaces both field_key and relationship_key)',
      },
      // Canonical properties
      data_type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'array', 'reference'),
        allowNull: false,
        comment: 'Field data type',
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Human-readable label',
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether field is required',
      },
      // Layout/rendering properties
      visibility: {
        type: Sequelize.ENUM('titleRow', 'staticAsTitle', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'),
        allowNull: false,
        defaultValue: 'notConfigured',
        comment: 'Field visibility setting',
      },
      layout: {
        type: Sequelize.ENUM('inline', 'stacked'),
        allowNull: false,
        defaultValue: 'stacked',
        comment: 'Layout within section',
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 999,
        comment: 'Display order (lower = first). 999 = not configured.',
      },
      section: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Optional section/group name',
      },
      render_as: {
        type: Sequelize.ENUM('text', 'number', 'select', 'multiselect', 'reference', 'statusButton', 'iconSelect', 'partsCollection'),
        allowNull: false,
        defaultValue: 'text',
        comment: 'How to render the field',
      },
      status_button_color: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Color for statusButton rendering (Vuetify color name)',
      },
      panel: {
        type: Sequelize.ENUM('none', 'parts', 'relationships', 'annotations'),
        allowNull: false,
        defaultValue: 'none',
        comment: 'Panel name for expandedPanel visibility',
      },
      bulk_edit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether field can be bulk edited',
      },
      input_config: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Input configuration for select/multiselect/reference/partsCollection fields',
      },
      // Inheritance
      inherits_from_entity_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'For instances: parent entity type (blockShape or partShape)',
      },
      inherits_from_entity_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'For instances: parent entity ID (shape ID)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes
    await queryInterface.addIndex('admin_metadata', ['entity_type', 'entity_id', 'metadata_type', 'field_key'], {
      unique: true,
      name: 'admin_metadata_entity_metadata_field_unique',
    });
    
    await queryInterface.addIndex('admin_metadata', ['entity_type', 'entity_id'], {
      name: 'admin_metadata_entity_idx',
    });
    
    await queryInterface.addIndex('admin_metadata', ['field_key'], {
      name: 'admin_metadata_field_key_idx',
    });
    
    await queryInterface.addIndex('admin_metadata', ['metadata_type'], {
      name: 'admin_metadata_metadata_type_idx',
    });
    
    await queryInterface.addIndex('admin_metadata', ['inherits_from_entity_type', 'inherits_from_entity_id'], {
      name: 'admin_metadata_inheritance_idx',
    });

    console.log('✅ Created unified admin_metadata table with indexes');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting unified admin_metadata table creation...');

    const tableExists = await queryInterface.tableExists('admin_metadata');
    
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    // Remove indexes
    await queryInterface.removeIndex('admin_metadata', 'admin_metadata_entity_metadata_field_unique');
    await queryInterface.removeIndex('admin_metadata', 'admin_metadata_entity_idx');
    await queryInterface.removeIndex('admin_metadata', 'admin_metadata_field_key_idx');
    await queryInterface.removeIndex('admin_metadata', 'admin_metadata_metadata_type_idx');
    await queryInterface.removeIndex('admin_metadata', 'admin_metadata_inheritance_idx');

    // Drop table
    await queryInterface.dropTable('admin_metadata');

    // Drop ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_admin_metadata_metadata_type;
      DROP TYPE IF EXISTS enum_admin_metadata_entity_type;
      DROP TYPE IF EXISTS enum_admin_metadata_data_type;
      DROP TYPE IF EXISTS enum_admin_metadata_visibility;
      DROP TYPE IF EXISTS enum_admin_metadata_layout;
      DROP TYPE IF EXISTS enum_admin_metadata_render_as;
      DROP TYPE IF EXISTS enum_admin_metadata_panel;
    `);

    console.log('✅ Dropped unified admin_metadata table');
  },
};
