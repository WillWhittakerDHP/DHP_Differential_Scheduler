/**
 * Migration: Create shape_field_metadata table
 * Date: 2026-01-15
 * Purpose: Create canonical field metadata table for block and part shapes
 *          Stores field definitions (type, validation, labels) separate from per-shape layout configs
 * 
 * LEARNING: Canonical field definitions separate from layout customizations
 * WHY: Field definitions (type, validation, labels) are shared across shapes
 *      Layout customizations (visibility, order, grouping) are per-shape
 * PATTERN: Single table for both block and part shapes, identified by entity_type
 * 
 * Structure:
 * - id: UUID primary key
 * - entity_type: 'block' | 'part' (identifies which shape type this applies to)
 * - field_key: Field name (e.g., 'active', 'composable', 'baseSqFt')
 * - data_type: Field data type ('string', 'number', 'boolean', 'array', 'reference')
 * - control_type: UI control type ('text', 'number', 'toggle', 'select', 'multiselect', 'reference')
 * - label: Human-readable label
 * - help_text: Optional help text
 * - is_required: Whether field is required
 * - validation_rules: JSONB for validation rules (min, max, pattern, etc.)
 * - default_value: Default value (JSONB to support various types)
 * - display_order: Default display order
 * - created_at, updated_at: Timestamps
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting shape_field_metadata table creation...');

    const tableExists = await queryInterface.tableExists('shape_field_metadata');
    
    if (tableExists) {
      console.log('ℹ️  shape_field_metadata table already exists, skipping');
      return;
    }

    await queryInterface.createTable('shape_field_metadata', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.ENUM('block', 'part'),
        allowNull: false,
        comment: 'Entity type: block for BlockShape, part for PartShape',
      },
      field_key: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Field name/key (e.g., active, composable, baseSqFt)',
      },
      data_type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'array', 'reference'),
        allowNull: false,
        comment: 'Field data type',
      },
      control_type: {
        type: Sequelize.ENUM('text', 'number', 'toggle', 'select', 'multiselect', 'reference'),
        allowNull: false,
        comment: 'UI control type for rendering',
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Human-readable label',
      },
      help_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Optional help text',
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether field is required',
      },
      validation_rules: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Validation rules (min, max, pattern, etc.)',
      },
      default_value: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Default value (JSONB to support various types)',
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Default display order',
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

    // Create unique constraint on entity_type + field_key
    await queryInterface.addIndex('shape_field_metadata', ['entity_type', 'field_key'], {
      unique: true,
      name: 'shape_field_metadata_entity_type_field_key_unique',
    });

    // Create index on entity_type for faster lookups
    await queryInterface.addIndex('shape_field_metadata', ['entity_type'], {
      name: 'shape_field_metadata_entity_type_idx',
    });

    console.log('✅ Created shape_field_metadata table');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting shape_field_metadata table creation...');

    const tableExists = await queryInterface.tableExists('shape_field_metadata');
    
    if (!tableExists) {
      console.log('ℹ️  shape_field_metadata table does not exist, skipping rollback');
      return;
    }

    await queryInterface.dropTable('shape_field_metadata');
    
    // Drop enum types if no other tables use them
    // Note: PostgreSQL doesn't automatically drop enums, but we'll leave them for now
    // They can be manually dropped if needed: DROP TYPE IF EXISTS "enum_shape_field_metadata_entity_type";
    
    console.log('✅ Dropped shape_field_metadata table');
  }
};
