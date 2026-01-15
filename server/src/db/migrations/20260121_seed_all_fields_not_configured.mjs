/**
 * Migration: Seed all fields with "Not Configured" defaults
 * Date: 2026-01-21
 * Purpose: Create metadata entries for ALL possible fields with notConfigured visibility
 *          so they appear in metadata edit modals and can be configured
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Seeding all fields with "Not Configured" defaults...');

    const { v4: uuidv4 } = await import('uuid');

    // Sentinel UUIDs for global configs
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

    // Helper function to prettify field key into label
    function prettifyLabel(fieldKey) {
      return fieldKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }

    // Helper function to infer data type from field key
    function inferDataType(fieldKey, entityType) {
      // Boolean fields
      const booleanFields = ['active', 'composite', 'differential', 'composable', 'constituable', 
        'allowMultiple', 'requiresUnitNumber', 'dependent', 'visible', 'onSite', 'clientPresent', 
        'moveable', 'zeroOutPart'];
      if (booleanFields.includes(fieldKey)) {
        return 'boolean';
      }
      
      // Number fields
      const numberFields = ['baseSqFt', 'baseFee', 'rateOverBaseFee', 'baseTime', 'rateOverBaseTime', 'orderIndex'];
      if (numberFields.includes(fieldKey)) {
        return 'number';
      }
      
      // Array/reference fields
      const arrayFields = ['activeParts', 'bookingCascades', 'instanceComponents', 
        'dependentInstanceOptions', 'validCascades', 'validParts'];
      if (arrayFields.includes(fieldKey)) {
        return 'array';
      }
      
      // Default to string
      return 'string';
    }

    // Helper function to infer render_as from data type
    // NOTE: Use 'text' as default since 'toggle' may not exist in enum
    // Users can change render_as in the UI if needed
    function inferRenderAs(dataType) {
      switch (dataType) {
        case 'number':
          return 'number';
        case 'array':
          return 'reference';
        case 'boolean':
        default:
          return 'text'; // Use 'text' as safe default - users can configure to 'toggle' or 'statusButton' in UI
      }
    }

    // Field definitions for each entity type
    const fieldDefinitions = {
      blockInstance: [
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'active', dataType: 'boolean' },
        { fieldKey: 'composite', dataType: 'boolean' },
        { fieldKey: 'differential', dataType: 'boolean' },
        { fieldKey: 'icon', dataType: 'string' },
        { fieldKey: 'baseSqFt', dataType: 'number' },
        { fieldKey: 'allowMultiple', dataType: 'boolean' },
        { fieldKey: 'requiresUnitNumber', dataType: 'boolean' },
        { fieldKey: 'dependent', dataType: 'boolean' },
        { fieldKey: 'visible', dataType: 'boolean' },
        // LEARNING: Relationship fields should NOT be seeded in primitive metadata
        // WHY: activeParts (activeConstituents), bookingCascades, instanceComponents, 
        //      and dependentInstanceOptions are defined in RELATIONSHIP_KEYS
        // PATTERN: Relationship fields should only exist in admin_relationship_metadata
      ],
      partInstance: [
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'onSite', dataType: 'boolean' },
        { fieldKey: 'clientPresent', dataType: 'boolean' },
        { fieldKey: 'moveable', dataType: 'boolean' },
        { fieldKey: 'baseFee', dataType: 'number' },
        { fieldKey: 'rateOverBaseFee', dataType: 'number' },
        { fieldKey: 'baseTime', dataType: 'number' },
        { fieldKey: 'rateOverBaseTime', dataType: 'number' },
        { fieldKey: 'active', dataType: 'boolean' },
        { fieldKey: 'zeroOutPart', dataType: 'boolean' },
      ],
      blockShape: [
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'type', dataType: 'string' },
        { fieldKey: 'composable', dataType: 'boolean' },
        { fieldKey: 'constituable', dataType: 'boolean' },
        // LEARNING: validCascades and validParts are relationship fields, not primitive fields
        // WHY: They are defined in RELATIONSHIP_KEYS and should only exist in admin_relationship_metadata
        // PATTERN: Relationship fields should NEVER be seeded in primitive metadata migrations
      ],
      partShape: [
        { fieldKey: 'name', dataType: 'string' },
      ],
    };

    // Seed each entity type with its global config sentinel UUID
    const entityConfigs = [
      { entityType: 'blockInstance', entityId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID },
      { entityType: 'partInstance', entityId: PART_INSTANCE_GLOBAL_CONFIG_ID },
      { entityType: 'blockShape', entityId: BLOCK_SHAPE_GLOBAL_CONFIG_ID },
      { entityType: 'partShape', entityId: PART_SHAPE_GLOBAL_CONFIG_ID },
    ];

    for (const config of entityConfigs) {
      const fields = fieldDefinitions[config.entityType] || [];
      console.log(`📝 Seeding ${fields.length} fields for ${config.entityType}...`);

      for (const field of fields) {
        const dataType = field.dataType || inferDataType(field.fieldKey, config.entityType);
        const renderAs = inferRenderAs(dataType);
        const label = prettifyLabel(field.fieldKey);

        await queryInterface.sequelize.query(
          `INSERT INTO admin_input_metadata (
            id, entity_type, entity_id, field_key, data_type, label, is_required,
            visibility, layout, display_order, section, render_as, status_button_color,
            panel, bulk_edit, inherits_from_entity_type, inherits_from_entity_id,
            created_at, updated_at
          ) VALUES (
            :id, :entity_type, :entity_id, :field_key, :data_type, :label, :is_required,
            :visibility, :layout, :display_order, :section, :render_as, :status_button_color,
            :panel, :bulk_edit, :inherits_from_entity_type, :inherits_from_entity_id,
            :created_at, :updated_at
          ) ON CONFLICT (entity_type, entity_id, field_key) DO NOTHING`,
          {
            replacements: {
              id: uuidv4(),
              entity_type: config.entityType,
              entity_id: config.entityId,
              field_key: field.fieldKey,
              data_type: dataType,
              label: label,
              is_required: false,
              visibility: 'notConfigured',
              layout: 'stacked',
              display_order: 999,
              section: null,
              render_as: renderAs,
              status_button_color: null,
              panel: 'none',
              bulk_edit: false,
              inherits_from_entity_type: null,
              inherits_from_entity_id: null,
              created_at: new Date(),
              updated_at: new Date(),
            },
            type: Sequelize.QueryTypes.INSERT,
          }
        );
      }
      console.log(`✅ Seeded ${fields.length} fields for ${config.entityType}`);
    }

    console.log('✅ Completed seeding all fields with "Not Configured" defaults');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting seed migration...');
    
    // Delete seeded entries (only those with notConfigured visibility and display_order 999)
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004';

    await queryInterface.sequelize.query(`
      DELETE FROM admin_input_metadata 
      WHERE visibility = 'notConfigured' 
        AND display_order = 999
        AND entity_id IN (
          :block_shape_id, :part_shape_id, :part_instance_id, :block_instance_id
        )
    `, {
      replacements: {
        block_shape_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        part_shape_id: PART_SHAPE_GLOBAL_CONFIG_ID,
        part_instance_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
        block_instance_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
      },
      type: Sequelize.QueryTypes.DELETE,
    });
    
    console.log('✅ Reverted seed migration');
  }
};
