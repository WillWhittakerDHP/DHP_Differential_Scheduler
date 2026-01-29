/**
 * Migration: Seed unified admin_metadata table
 * Date: 2026-02-02
 * Purpose: Seed all metadata (primitives + relationships) into unified admin_metadata table
 *          Combines data from previous primitive and relationship seed migrations
 * 
 * LEARNING: Unified seed for all metadata types
 * WHY: Single table stores both primitive and relationship metadata with metadataType discriminator
 * PATTERN: Seed primitives with metadataType='primitive', relationships with metadataType='relationship'
 */

import { randomUUID } from 'crypto'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Seeding unified admin_metadata table...')

    // Sentinel UUIDs for global configs
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002'
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003'
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    const now = new Date()
    const jsonbLiteral = (value) => Sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`)

    // Helper function to prettify field key into label
    function prettifyLabel(fieldKey) {
      return fieldKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
    }

    // Helper function to infer data type from field key
    function inferDataType(fieldKey, entityType) {
      // Boolean fields
      const booleanFields = ['active', 'composite', 'differential', 'composable', 'canHaveParts', 'isStateControl',
        'allowMultiple', 'requiresUnitNumber', 'onSite', 'clientPresent', 
        'moveable', 'zeroOutPart', 'differentialOverride']
      if (booleanFields.includes(fieldKey)) {
        return 'boolean'
      }
      
      // Number fields
      const numberFields = ['baseSqFt', 'baseFee', 'rateOverBaseFee', 'baseTime', 'rateOverBaseTime', 'orderIndex']
      if (numberFields.includes(fieldKey)) {
        return 'number'
      }
      
      // Array/reference fields
      const arrayFields = ['activeParts', 'bookingCascades', 'instanceComponents', 
        'dependentInstances', 'validCascades', 'validParts']
      if (arrayFields.includes(fieldKey)) {
        return 'array'
      }
      
      // Default to string
      return 'string'
    }

    // Helper function to infer render_as from data type
    function inferRenderAs(dataType) {
      switch (dataType) {
        case 'number':
          return 'number'
        case 'array':
          return 'reference'
        case 'boolean':
        default:
          return 'text'
      }
    }

    // PRIMITIVE METADATA - Seed all primitive fields for all entity types
    const primitiveFieldDefinitions = {
      blockInstance: [
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'active', dataType: 'boolean' },
        { fieldKey: 'composite', dataType: 'boolean' },
        { fieldKey: 'differential', dataType: 'boolean' },
        { fieldKey: 'icon', dataType: 'string' },
        { fieldKey: 'baseSqFt', dataType: 'number' },
        { fieldKey: 'allowMultiple', dataType: 'boolean' },
        { fieldKey: 'requiresUnitNumber', dataType: 'boolean' },
        { fieldKey: 'bookingMode', dataType: 'string' },
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
        { fieldKey: 'differentialOverride', dataType: 'boolean' },
      ],
      blockShape: [
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'type', dataType: 'string' },
        { fieldKey: 'composable', dataType: 'boolean' },
        { fieldKey: 'canHaveParts', dataType: 'boolean' },
        { fieldKey: 'isStateControl', dataType: 'boolean' },
      ],
      partShape: [
        { fieldKey: 'name', dataType: 'string' },
      ],
    }

    // Seed primitive metadata
    const primitiveEntityConfigs = [
      { entityType: 'blockInstance', entityId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID },
      { entityType: 'partInstance', entityId: PART_INSTANCE_GLOBAL_CONFIG_ID },
      { entityType: 'blockShape', entityId: BLOCK_SHAPE_GLOBAL_CONFIG_ID },
      { entityType: 'partShape', entityId: PART_SHAPE_GLOBAL_CONFIG_ID },
    ]

    let primitiveCount = 0
    for (const config of primitiveEntityConfigs) {
      const fields = primitiveFieldDefinitions[config.entityType] || []
      console.log(`📝 Seeding ${fields.length} primitive fields for ${config.entityType}...`)

      for (const field of fields) {
        const dataType = field.dataType || inferDataType(field.fieldKey, config.entityType)
        const renderAs = inferRenderAs(dataType)
        const label = prettifyLabel(field.fieldKey)

        await queryInterface.bulkInsert('admin_metadata', [{
          id: randomUUID(),
          metadata_type: 'primitive',
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
          input_config: null,
          inherits_from_entity_type: null,
          inherits_from_entity_id: null,
          created_at: now,
          updated_at: now,
        }], {
          ignoreDuplicates: true
        })
        primitiveCount++
      }
    }
    console.log(`✅ Seeded ${primitiveCount} primitive metadata entries`)

    // RELATIONSHIP METADATA - Seed relationship fields
    // BlockShape relationships
    await queryInterface.bulkInsert('admin_metadata', [
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockShape',
        entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        field_key: 'validCascades',
        data_type: 'reference',
        label: 'Valid Cascades',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 1,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'validCascades',
          globalField: 'validCascades',
          selectedParentKey: 'blockShape',
          selectedChildKey: 'blockShape',
          selectedChildPath: ['validCascades'],
          candidateParentKey: 'blockShape',
          candidateParentPath: [],
          candidateChildKey: 'blockShape',
          candidateChildPath: [],
          selectType: 'validCascadeSelect',
          selectMode: 'multiple',
          placeholder: 'No cascades selected',
        }),
        inherits_from_entity_type: null,
        inherits_from_entity_id: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockShape',
        entity_id: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        field_key: 'validParts',
        data_type: 'reference',
        label: 'Valid Parts',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 2,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'validParts',
          globalField: 'validParts',
          selectedParentKey: 'blockShape',
          selectedChildKey: 'partShape',
          selectedChildPath: ['validParts'],
          candidateParentKey: 'blockShape',
          candidateParentPath: [],
          candidateChildKey: 'partShape',
          candidateChildPath: [],
          selectType: 'validPartSelect',
          selectMode: 'multiple',
          placeholder: 'No parts selected',
        }),
        inherits_from_entity_type: null,
        inherits_from_entity_id: null,
        created_at: now,
        updated_at: now,
      },
    ], {
      ignoreDuplicates: true
    })

    // BlockInstance relationships
    await queryInterface.bulkInsert('admin_metadata', [
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        field_key: 'bookingCascades',
        data_type: 'reference',
        label: 'Booking Cascade',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 1,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'bookingCascades',
          globalField: 'bookingCascades',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'blockInstance',
          selectedChildPath: ['bookingCascades'],
          candidateParentKey: 'blockShape',
          candidateParentPath: ['blockShapeRef'],
          candidateChildKey: 'blockInstance',
          candidateChildPath: [],
          selectType: 'bookingCascadeSelect',
          selectMode: 'multiple',
          groupByKey: 'blockShapeRef',
          placeholder: 'No cascades selected',
        }),
        inherits_from_entity_type: null,
        inherits_from_entity_id: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        field_key: 'activeParts',
        data_type: 'reference',
        label: 'Active Parts',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 2,
        section: null,
        render_as: 'partsCollection',
        status_button_color: null,
        panel: 'parts',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'activeParts',
          globalField: 'activeParts',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'partInstance',
          selectedChildPath: ['activeParts'],
          candidateParentKey: 'blockShape',
          candidateParentPath: ['blockShapeRef'],
          candidateChildKey: 'partInstance',
          candidateChildPath: [],
          selectType: 'activePartSelect',
          placeholder: 'No parts selected',
        }),
        inherits_from_entity_type: null,
        inherits_from_entity_id: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        field_key: 'dependentInstances',
        data_type: 'reference',
        label: 'Dependent Instances',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 3,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'dependentInstances',
          globalField: 'dependentInstances',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'blockInstance',
          selectedChildPath: ['dependentInstances'],
          candidateParentKey: 'blockInstance',
          candidateParentPath: [],
          candidateChildKey: 'blockInstance',
          candidateChildPath: ['blockShapeRef'],
          selectType: 'dependentInstanceSelect',
          selectMode: 'multiple',
          placeholder: 'No dependent instances',
        }),
        inherits_from_entity_type: null,
        inherits_from_entity_id: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        metadata_type: 'relationship',
        entity_type: 'blockInstance',
        entity_id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
        field_key: 'instanceComponents',
        data_type: 'reference',
        label: '{blockShapeName} Components',
        is_required: false,
        visibility: 'expandedPanel',
        layout: 'stacked',
        display_order: 4,
        section: null,
        render_as: 'reference',
        status_button_color: null,
        panel: 'relationships',
        bulk_edit: false,
        input_config: jsonbLiteral({
          targetMode: 'relationship',
          targetKey: 'instanceComponents',
          globalField: 'instanceComponents',
          selectedParentKey: 'blockInstance',
          selectedChildKey: 'blockInstance',
          selectedChildPath: ['instanceComponents'],
          candidateParentKey: 'blockInstance',
          candidateParentPath: ['dependentInstances'],
          candidateChildKey: 'blockInstance',
          candidateChildPath: [],
          selectType: 'instanceComponentSelect',
          selectMode: 'multiple',
          placeholder: 'Select components...',
        }),
        inherits_from_entity_type: null,
        inherits_from_entity_id: null,
        created_at: now,
        updated_at: now,
      },
    ], {
      ignoreDuplicates: true
    })

    console.log('✅ Seeded relationship metadata entries')

    // Verify seeding
    const [finalCount] = await queryInterface.sequelize.query(`
      SELECT 
        metadata_type,
        COUNT(*)::int as count
      FROM admin_metadata
      GROUP BY metadata_type;
    `, { type: Sequelize.QueryTypes.SELECT })

    console.log('✅ Unified metadata seeding completed. Summary:')
    if (Array.isArray(finalCount)) {
      finalCount.forEach(({ metadata_type, count }) => {
        console.log(`   - ${metadata_type}: ${count} entries`)
      })
    } else if (finalCount) {
      console.log(`   - ${finalCount.metadata_type}: ${finalCount.count} entries`)
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting unified metadata seed...')
    
    const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002'
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003'
    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    // Delete seeded entries (only those with notConfigured visibility and display_order 999 for primitives)
    await queryInterface.bulkDelete('admin_metadata', {
      entity_id: [
        BLOCK_SHAPE_GLOBAL_CONFIG_ID,
        PART_SHAPE_GLOBAL_CONFIG_ID,
        PART_INSTANCE_GLOBAL_CONFIG_ID,
        BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
      ],
    })
    
    console.log('✅ Reverted unified metadata seed')
  },
}
