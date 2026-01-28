/**
 * Migration: Create admin_relationship_metadata table
 * Date: 2026-01-14
 * Purpose: Create admin_relationship_metadata table for storing relationship field metadata
 *          Parallel structure to admin_input_metadata but keyed by relationship_key instead of field_key
 * 
 * LEARNING: Relationship metadata stored separately from field metadata
 * WHY: Relationship fields (activeConstituents, validCascades, etc.) are not on entity objects
 *      but need metadata for rendering configuration
 * PATTERN: Same structure as admin_input_metadata but for relationship fields
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting admin_relationship_metadata table creation...');

    const tableExists = await queryInterface.tableExists('admin_relationship_metadata');
    
    if (tableExists) {
      console.log('ℹ️  admin_relationship_metadata table already exists, skipping');
      return;
    }

    // Create ENUM types first
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Entity type enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_entity_type') THEN
          CREATE TYPE enum_admin_relationship_metadata_entity_type AS ENUM (
            'blockShape', 'partShape', 'blockInstance', 'partInstance'
          );
        END IF;
        
        -- Data type enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_data_type') THEN
          CREATE TYPE enum_admin_relationship_metadata_data_type AS ENUM (
            'string', 'number', 'boolean', 'array', 'reference'
          );
        END IF;
        
        -- Visibility enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_visibility') THEN
          CREATE TYPE enum_admin_relationship_metadata_visibility AS ENUM (
            'titleRow', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'
          );
        END IF;
        
        -- Layout enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_layout') THEN
          CREATE TYPE enum_admin_relationship_metadata_layout AS ENUM (
            'inline', 'stacked'
          );
        END IF;
        
        -- Render as enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_render_as') THEN
          CREATE TYPE enum_admin_relationship_metadata_render_as AS ENUM (
            'text', 'number', 'select', 'multiselect', 'reference', 'statusButton'
          );
        END IF;
        
        -- Panel enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_panel') THEN
          CREATE TYPE enum_admin_relationship_metadata_panel AS ENUM (
            'none', 'parts', 'relationships', 'annotations'
          );
        END IF;
      END $$;
    `);

    // Create table
    await queryInterface.createTable('admin_relationship_metadata', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.ENUM('blockShape', 'partShape', 'blockInstance', 'partInstance'),
        allowNull: false,
        comment: 'Entity type for this relationship metadata entry',
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Entity ID or sentinel UUID for global configs',
      },
      relationship_key: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Relationship name/key (e.g., activeParts, validCascades)',
      },
      data_type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'array', 'reference'),
        allowNull: false,
        comment: 'Relationship data type',
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
        comment: 'Whether relationship field is required',
      },
      visibility: {
        type: Sequelize.ENUM('titleRow', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'),
        allowNull: false,
        defaultValue: 'notConfigured',
        comment: 'Relationship field visibility setting',
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
        type: Sequelize.ENUM('text', 'number', 'select', 'multiselect', 'reference', 'statusButton'),
        allowNull: false,
        defaultValue: 'reference',
        comment: 'How to render the relationship field (typically reference)',
      },
      status_button_color: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Color for statusButton rendering (Vuetify color name)',
      },
      panel: {
        type: Sequelize.ENUM('none', 'parts', 'relationships', 'annotations'),
        allowNull: false,
        defaultValue: 'relationships',
        comment: 'Panel name for expandedPanel visibility (typically relationships)',
      },
      bulk_edit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether relationship field can be bulk edited',
      },
      input_config: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Input configuration for relationship fields (selectMode, groupByKey, etc.)',
      },
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

    // Create unique constraint on entity_type + entity_id + relationship_key
    await queryInterface.addIndex('admin_relationship_metadata', ['entity_type', 'entity_id', 'relationship_key'], {
      unique: true,
      name: 'admin_relationship_metadata_entity_relationship_unique',
    });

    // Create index on entity_type + entity_id for faster lookups
    await queryInterface.addIndex('admin_relationship_metadata', ['entity_type', 'entity_id'], {
      name: 'admin_relationship_metadata_entity_idx',
    });

    // Create index on relationship_key for validation lookups
    await queryInterface.addIndex('admin_relationship_metadata', ['relationship_key'], {
      name: 'admin_relationship_metadata_relationship_key_idx',
    });

    // Create index on inheritance fields
    await queryInterface.addIndex('admin_relationship_metadata', ['inherits_from_entity_type', 'inherits_from_entity_id'], {
      name: 'admin_relationship_metadata_inheritance_idx',
    });

    console.log('✅ Created admin_relationship_metadata table with indexes');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting admin_relationship_metadata table creation...');

    const tableExists = await queryInterface.tableExists('admin_relationship_metadata');
    
    if (!tableExists) {
      console.log('ℹ️  admin_relationship_metadata table does not exist, skipping rollback');
      return;
    }

    // Remove indexes
    try {
      await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_entity_relationship_unique');
      await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_entity_idx');
      await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_relationship_key_idx');
      await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_inheritance_idx');
    } catch (e) {
      console.log('   ℹ️  Some indexes may not exist');
    }

    // Drop table
    await queryInterface.dropTable('admin_relationship_metadata');

    // Drop ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_admin_relationship_metadata_entity_type;
      DROP TYPE IF EXISTS enum_admin_relationship_metadata_data_type;
      DROP TYPE IF EXISTS enum_admin_relationship_metadata_visibility;
      DROP TYPE IF EXISTS enum_admin_relationship_metadata_layout;
      DROP TYPE IF EXISTS enum_admin_relationship_metadata_render_as;
      DROP TYPE IF EXISTS enum_admin_relationship_metadata_panel;
    `);
    
    console.log('✅ Dropped admin_relationship_metadata table');
  }
};
