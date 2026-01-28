/**
 * Migration: Seed canonical field metadata for shape entities
 * Date: 2026-01-17
 * Purpose: Populate field_metadata table with field definitions for BlockShape and PartShape entities
 *          Also create global layout configs for shape entities using sentinel UUIDs
 * 
 * LEARNING: Shape entities need their own metadata configuration
 * WHY: Shape entities (BlockShape, PartShape) have different fields than instance entities
 * PATTERN: Use sentinel UUIDs for global configurations shared by all shapes of each type
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting shape entity metadata seed migration...');

    const { v4: uuidv4 } = await import('uuid');

    // LEARNING: ENUM type names don't change when tables are renamed
    // WHY: PostgreSQL ENUM types are independent objects, not tied to table names
    // PATTERN: Add new values to existing ENUM types before inserting data
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

    // Sentinel UUIDs for global shape entity configurations
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';

    // BlockShape fields (entity_type='blockShape')
    const blockShapeFields = [
      {
        fieldKey: 'name',
        dataType: 'string',
        controlType: 'text',
        label: 'Name',
        helpText: null,
        isRequired: true,
        validationRules: null,
        defaultValue: null,
        displayOrder: 0,
      },
      {
        fieldKey: 'composable',
        dataType: 'boolean',
        controlType: 'toggle',
        label: 'Composable',
        helpText: null,
        isRequired: false,
        validationRules: null,
        defaultValue: false,
        displayOrder: 1,
      },
      {
        fieldKey: 'constituable',
        dataType: 'boolean',
        controlType: 'toggle',
        label: 'Constituable',
        helpText: null,
        isRequired: false,
        validationRules: null,
        defaultValue: false,
        displayOrder: 2,
      },
      {
        fieldKey: 'type',
        dataType: 'string',
        controlType: 'select',
        label: 'Type',
        helpText: null,
        isRequired: false,
        validationRules: null,
        defaultValue: null,
        displayOrder: 3,
      },
      // LEARNING: validCascades and validParts are relationship fields, not primitive fields
      // WHY: They are defined in RELATIONSHIP_KEYS and should only exist in admin_relationship_metadata
      // PATTERN: Relationship fields should NEVER be seeded in primitive metadata migrations
      // NOTE: These fields are seeded via 20260114_seed_admin_relationship_metadata_block_shape.mjs
    ];

    // PartShape fields (entity_type='partShape')
    const partShapeFields = [
      {
        fieldKey: 'name',
        dataType: 'string',
        controlType: 'text',
        label: 'Name',
        helpText: null,
        isRequired: true,
        validationRules: null,
        defaultValue: null,
        displayOrder: 0,
      },
    ];

    // Insert BlockShape canonical metadata
    for (const field of blockShapeFields) {
      // Check if already exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM field_metadata 
         WHERE entity_type = 'blockShape' AND field_key = :fieldKey`,
        {
          replacements: { fieldKey: field.fieldKey },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        // LEARNING: Convert default_value to JSONB format
        // WHY: PostgreSQL JSONB columns require JSON format, not raw JavaScript values
        // PATTERN: Use JSON.stringify for non-null values, null for null values
        const defaultValueJson = field.defaultValue !== null && field.defaultValue !== undefined
          ? JSON.stringify(field.defaultValue)
          : null;
        
        await queryInterface.bulkInsert('field_metadata', [{
          id: uuidv4(),
          entity_type: 'blockShape',
          field_key: field.fieldKey,
          data_type: field.dataType,
          control_type: field.controlType,
          label: field.label,
          help_text: field.helpText,
          is_required: field.isRequired,
          validation_rules: field.validationRules ? JSON.stringify(field.validationRules) : null,
          default_value: defaultValueJson,
          display_order: field.displayOrder,
          created_at: new Date(),
          updated_at: new Date(),
        }]);
      }
    }

    // Insert PartShape canonical metadata
    for (const field of partShapeFields) {
      // Check if already exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM field_metadata 
         WHERE entity_type = 'partShape' AND field_key = :fieldKey`,
        {
          replacements: { fieldKey: field.fieldKey },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        // LEARNING: Convert default_value to JSONB format
        // WHY: PostgreSQL JSONB columns require JSON format, not raw JavaScript values
        // PATTERN: Use JSON.stringify for non-null values, null for null values
        const defaultValueJson = field.defaultValue !== null && field.defaultValue !== undefined
          ? JSON.stringify(field.defaultValue)
          : null;
        
        await queryInterface.bulkInsert('field_metadata', [{
          id: uuidv4(),
          entity_type: 'partShape',
          field_key: field.fieldKey,
          data_type: field.dataType,
          control_type: field.controlType,
          label: field.label,
          help_text: field.helpText,
          is_required: field.isRequired,
          validation_rules: field.validationRules ? JSON.stringify(field.validationRules) : null,
          default_value: defaultValueJson,
          display_order: field.displayOrder,
          created_at: new Date(),
          updated_at: new Date(),
        }]);
      }
    }

    // Create global layout configs for BlockShape
    for (const field of blockShapeFields) {
      // Check if already exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM entity_layout_config 
         WHERE entity_id = :entityId AND entity_type = 'blockShape' AND field_key = :fieldKey`,
        {
          replacements: { 
            entityId: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
            fieldKey: field.fieldKey 
          },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        // Determine visibility based on field
        let visibility = 'expandedDirect';
        let panel = 'none';
        if (field.fieldKey === 'name') {
          visibility = 'titleRow';
        }
        // LEARNING: validCascades and validParts are relationship fields - they should not be in this migration
        // WHY: Relationship fields are handled in admin_relationship_metadata, not primitive metadata
        // PATTERN: Only primitive fields should have layout configs created here

        await queryInterface.bulkInsert('entity_layout_config', [{
          id: uuidv4(),
          entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
          entity_type: 'blockShape',
          field_key: field.fieldKey,
          visibility: visibility,
          layout: 'stacked',
          order: field.displayOrder,
          section: null,
          render_as: 'field',
          status_button_color: null,
          panel: panel,
          bulk_edit: false,
          created_at: new Date(),
          updated_at: new Date(),
        }]);
      }
    }

    // Create global layout configs for PartShape
    for (const field of partShapeFields) {
      // Check if already exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM entity_layout_config 
         WHERE entity_id = :entityId AND entity_type = 'partShape' AND field_key = :fieldKey`,
        {
          replacements: { 
            entityId: PART_SHAPE_GLOBAL_CONFIG_ID,
            fieldKey: field.fieldKey 
          },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        // Name field is in title row
        const visibility = field.fieldKey === 'name' ? 'titleRow' : 'expandedDirect';

        await queryInterface.bulkInsert('entity_layout_config', [{
          id: uuidv4(),
          entity_id: PART_SHAPE_GLOBAL_CONFIG_ID,
          entity_type: 'partShape',
          field_key: field.fieldKey,
          visibility: visibility,
          layout: 'stacked',
          order: field.displayOrder,
          section: null,
          render_as: 'field',
          status_button_color: null,
          panel: 'none',
          bulk_edit: false,
          created_at: new Date(),
          updated_at: new Date(),
        }]);
      }
    }

    console.log('✅ Seeded shape entity metadata');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting shape entity metadata seed migration...');
    
    // Delete seeded entries (by entity_type to avoid deleting user-created entries)
    await queryInterface.bulkDelete('entity_layout_config', {
      entity_type: ['blockShape', 'partShape'],
    });

    await queryInterface.bulkDelete('field_metadata', {
      entity_type: ['blockShape', 'partShape'],
    });

    console.log('✅ Reverted shape entity metadata seed');
  }
};
