/**
 * Migration: Create shape_layout_config table
 * Date: 2026-01-15
 * Purpose: Create per-shape layout configuration table
 *          Stores layout customizations (visibility, order, grouping) per shape
 * 
 * LEARNING: Per-shape layout configs separate from canonical field definitions
 * WHY: Layout customizations (visibility, order, grouping) are shape-specific
 *      Field definitions (type, validation, labels) are shared via shape_field_metadata
 * PATTERN: One row per shape per field, storing only layout properties
 * 
 * Structure:
 * - id: UUID primary key
 * - shape_id: UUID foreign key to block_shapes or part_shapes
 * - shape_type: 'block' | 'part' (identifies which shape table)
 * - field_key: Field name (must exist in shape_field_metadata for this entity_type)
 * - visibility: 'titleRow' | 'expandedDirect' | 'expandedPanel' | 'hidden'
 * - layout: 'inline' | 'stacked'
 * - order: Display order (overrides canonical display_order)
 * - section: Section/group name for organization
 * - render_as: 'field' | 'statusButton'
 * - status_button_color: Color for statusButton rendering
 * - panel: 'parts' | 'relationships' | 'annotations' | 'none'
 * - bulk_edit: Whether field can be bulk edited
 * - created_at, updated_at: Timestamps
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting shape_layout_config table creation...');

    const tableExists = await queryInterface.tableExists('shape_layout_config');
    
    if (tableExists) {
      console.log('ℹ️  shape_layout_config table already exists, skipping');
      return;
    }

    await queryInterface.createTable('shape_layout_config', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      shape_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Foreign key to block_shapes.id or part_shapes.id',
      },
      shape_type: {
        type: Sequelize.ENUM('block', 'part'),
        allowNull: false,
        comment: 'Shape type: block for BlockShape, part for PartShape',
      },
      field_key: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Field name/key (must exist in shape_field_metadata)',
      },
      visibility: {
        type: Sequelize.ENUM('titleRow', 'expandedDirect', 'expandedPanel', 'hidden'),
        allowNull: false,
        comment: 'Field visibility setting',
      },
      layout: {
        type: Sequelize.ENUM('inline', 'stacked'),
        allowNull: false,
        comment: 'Layout within section',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Display order (overrides canonical display_order)',
      },
      section: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Section/group name for organization',
      },
      render_as: {
        type: Sequelize.ENUM('field', 'statusButton'),
        allowNull: false,
        defaultValue: 'field',
        comment: 'How to render the field',
      },
      status_button_color: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Color for statusButton rendering (Vuetify color name)',
      },
      panel: {
        type: Sequelize.ENUM('parts', 'relationships', 'annotations', 'none'),
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

    // Create unique constraint on shape_id + shape_type + field_key
    await queryInterface.addIndex('shape_layout_config', ['shape_id', 'shape_type', 'field_key'], {
      unique: true,
      name: 'shape_layout_config_shape_field_unique',
    });

    // Create index on shape_id + shape_type for faster lookups
    await queryInterface.addIndex('shape_layout_config', ['shape_id', 'shape_type'], {
      name: 'shape_layout_config_shape_idx',
    });

    // Create index on field_key for validation lookups
    await queryInterface.addIndex('shape_layout_config', ['field_key'], {
      name: 'shape_layout_config_field_key_idx',
    });

    console.log('✅ Created shape_layout_config table');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting shape_layout_config table creation...');

    const tableExists = await queryInterface.tableExists('shape_layout_config');
    
    if (!tableExists) {
      console.log('ℹ️  shape_layout_config table does not exist, skipping rollback');
      return;
    }

    await queryInterface.dropTable('shape_layout_config');
    
    console.log('✅ Dropped shape_layout_config table');
  }
};
