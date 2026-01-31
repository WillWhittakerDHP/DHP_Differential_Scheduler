/**
 * Migration: Cleanup and Reseed Config Metadata
 * Date: 2026-01-31
 * Purpose: 
 * - Delete old config metadata entries that combined shape and instance fields
 * - Ensure correct separation of shape vs instance metadata with separate sentinel UUIDs
 * 
 * LEARNING: Separate sentinel UUIDs for shapes vs instances
 * WHY: Shapes and instances have different fields, so they need separate metadata configs
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Cleaning up and reseeding config metadata...')

    // Sentinel UUIDs
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'
    const ANNOTATION_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000011'
    const ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000013'

    // Delete all existing config metadata entries to start fresh
    // LEARNING: Clean slate approach ensures no duplicate or incorrect entries
    // WHY: Old entries may have combined shape and instance fields incorrectly
    await queryInterface.bulkDelete('admin_metadata', {
      config_type: ['event', 'annotation'],
      config_id: [
        EVENT_SHAPE_GLOBAL_CONFIG_ID,
        EVENT_INSTANCE_GLOBAL_CONFIG_ID,
        ANNOTATION_SHAPE_GLOBAL_CONFIG_ID,
        ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID,
      ],
    })
    console.log('✅ Deleted old config metadata entries')

    // Now re-run the seed logic from the original migration
    const { randomUUID } = await import('crypto')
    const now = new Date()
    const jsonbLiteral = (value) => Sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`)

    // Helper function to prettify field key into label
    function prettifyLabel(fieldKey) {
      return fieldKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
    }

    // Helper function to infer data type from field key and config type
    function inferDataType(fieldKey, configType) {
      // Boolean fields
      const booleanFields = ['active', 'defaultIsDefault']
      if (booleanFields.includes(fieldKey)) {
        return 'boolean'
      }
      
      // Number fields
      const numberFields = ['orderIndex', 'defaultOrderIndex']
      if (numberFields.includes(fieldKey)) {
        return 'number'
      }
      
      // Ternary fields (for eventShape)
      if (fieldKey === 'defaultTernaryValue') {
        return 'ternary'
      }
      
      // Textarea fields
      const textareaFields = ['text', 'titleTemplate', 'descriptionTemplate', 'locationTemplate']
      if (textareaFields.includes(fieldKey)) {
        return 'string' // Still string type, but will use textarea mode
      }
      
      // Default to string
      return 'string'
    }

    // Helper function to infer render_as from data type
    function inferRenderAs(dataType, fieldKey) {
      // Special case for icon field
      if (fieldKey === 'icon') {
        return 'iconSelect'
      }
      
      switch (dataType) {
        case 'number':
          return 'number'
        case 'boolean':
        case 'ternary':
          return 'statusButton'
        case 'string':
        default:
          return 'text'
      }
    }

    // Field definitions for each config type
    const configFieldDefinitions = {
      annotationShape: [
        { fieldKey: 'id', dataType: 'string' },
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'defaultOrderIndex', dataType: 'number' },
        { fieldKey: 'defaultIsDefault', dataType: 'boolean' },
        { fieldKey: 'orderIndex', dataType: 'number' },
        { fieldKey: 'active', dataType: 'boolean' },
      ],
      annotationInstance: [
        { fieldKey: 'id', dataType: 'string' },
        { fieldKey: 'text', dataType: 'string' },
        { fieldKey: 'type', dataType: 'string' },
        { fieldKey: 'userTypeBlock', dataType: 'string' },
        { fieldKey: 'orderIndex', dataType: 'number' },
        { fieldKey: 'active', dataType: 'boolean' },
      ],
      eventShape: [
        { fieldKey: 'id', dataType: 'string' },
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'isTernary', dataType: 'boolean' },
        { fieldKey: 'ternaryDefault', dataType: 'string' },
        { fieldKey: 'defaultOrderIndex', dataType: 'number' },
        { fieldKey: 'orderIndex', dataType: 'number' },
        { fieldKey: 'active', dataType: 'boolean' },
      ],
      eventInstance: [
        { fieldKey: 'id', dataType: 'string' },
        { fieldKey: 'name', dataType: 'string' },
        { fieldKey: 'eventShapeRef', dataType: 'string' },
        { fieldKey: 'titleTemplate', dataType: 'string' },
        { fieldKey: 'descriptionTemplate', dataType: 'string' },
        { fieldKey: 'locationTemplate', dataType: 'string' },
        { fieldKey: 'orderIndex', dataType: 'number' },
        { fieldKey: 'active', dataType: 'boolean' },
      ],
    }

    // Config type mappings with separate UUIDs for shapes vs instances
    const configMappings = [
      { 
        configType: 'annotation', 
        configId: ANNOTATION_SHAPE_GLOBAL_CONFIG_ID, 
        fields: configFieldDefinitions.annotationShape,
      },
      { 
        configType: 'annotation', 
        configId: ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID, 
        fields: configFieldDefinitions.annotationInstance,
      },
      { 
        configType: 'event', 
        configId: EVENT_SHAPE_GLOBAL_CONFIG_ID, 
        fields: configFieldDefinitions.eventShape,
      },
      { 
        configType: 'event', 
        configId: EVENT_INSTANCE_GLOBAL_CONFIG_ID, 
        fields: configFieldDefinitions.eventInstance,
      },
    ]

    let totalCount = 0
    for (const mapping of configMappings) {
      const { configType, configId, fields } = mapping
      console.log(`📝 Seeding ${fields.length} fields for configType=${configType}, configId=${configId}...`)

      for (const field of fields) {
        const dataType = field.dataType || inferDataType(field.fieldKey, configType)
        const renderAs = inferRenderAs(dataType, field.fieldKey)
        const label = prettifyLabel(field.fieldKey)

        await queryInterface.bulkInsert('admin_metadata', [{
          id: randomUUID(),
          metadata_type: 'primitive', // Config data fields are primitive (not relationships)
          config_type: configType,
          config_id: configId,
          entity_type: null, // Config data doesn't use entity_type
          entity_id: null, // Config data doesn't use entity_id
          field_key: field.fieldKey,
          data_type: dataType,
          label: label,
          is_required: false,
          visibility: 'notConfigured',
          layout: 'stacked',
          display_order: 999,
          render_as: renderAs,
          status_button_color: null,
          panel: 'none',
          bulk_edit: false,
          input_config: null,
          created_at: now,
          updated_at: now,
        }], {
          ignoreDuplicates: true
        })
        totalCount++
      }
    }
    console.log(`✅ Seeded ${totalCount} config data metadata entries`)
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting config metadata cleanup and reseed...')
    
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'
    const ANNOTATION_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000011'
    const ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000013'

    // Delete seeded entries
    await queryInterface.bulkDelete('admin_metadata', {
      config_type: ['event', 'annotation'],
      config_id: [
        EVENT_SHAPE_GLOBAL_CONFIG_ID,
        EVENT_INSTANCE_GLOBAL_CONFIG_ID,
        ANNOTATION_SHAPE_GLOBAL_CONFIG_ID,
        ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID,
      ],
    })
    
    console.log('✅ Reverted config metadata cleanup and reseed')
  },
}
