/**
 * Migration: Fix Missing Event Shape Metadata
 * Date: 2026-01-31
 * Purpose: 
 * - Insert missing event shape metadata (config_id: 00000000-0000-0000-0000-000000000010)
 * - Complete event instance metadata (config_id: 00000000-0000-0000-0000-000000000012)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing missing event shape metadata...')

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'

    const { randomUUID } = await import('crypto')
    const now = new Date()

    // Helper function to prettify field key into label
    function prettifyLabel(fieldKey) {
      return fieldKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
    }

    // Event Shape fields (missing - need to insert)
    const eventShapeFields = [
      { fieldKey: 'id', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'name', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'defaultOrderIndex', dataType: 'number', renderAs: 'number' },
      { fieldKey: 'orderIndex', dataType: 'number', renderAs: 'number' },
      { fieldKey: 'active', dataType: 'boolean', renderAs: 'statusButton' },
    ]

    // Event Instance fields (incomplete - need to add missing ones)
    const eventInstanceFields = [
      { fieldKey: 'id', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'name', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'eventShapeRef', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'titleTemplate', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'descriptionTemplate', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'locationTemplate', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'orderIndex', dataType: 'number', renderAs: 'number' },
      { fieldKey: 'active', dataType: 'boolean', renderAs: 'statusButton' },
    ]

    // Insert event shape metadata using raw SQL to ensure it works
    console.log(`📝 Inserting ${eventShapeFields.length} fields for eventShape (configId: ${EVENT_SHAPE_GLOBAL_CONFIG_ID})...`)
    for (const field of eventShapeFields) {
      const label = prettifyLabel(field.fieldKey)
      const fieldId = randomUUID()
      
      // Use raw SQL with ON CONFLICT to handle unique constraint
      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id, metadata_type, config_type, config_id, entity_type, entity_id,
          field_key, data_type, label, is_required, visibility, layout,
          display_order, render_as, status_button_color, panel, bulk_edit,
          input_config, created_at, updated_at
        ) VALUES (
          :id, 'primitive', 'event', :configId::uuid, NULL, NULL,
          :fieldKey, :dataType, :label, false, 'notConfigured', 'stacked',
          999, :renderAs, NULL, 'none', false,
          NULL, :now, :now
        )
        ON CONFLICT (config_type, config_id, metadata_type, field_key)
        WHERE config_type = 'event'
        DO NOTHING
      `, {
        replacements: {
          id: fieldId,
          configId: EVENT_SHAPE_GLOBAL_CONFIG_ID,
          fieldKey: field.fieldKey,
          dataType: field.dataType,
          label: label,
          renderAs: field.renderAs,
          now: now.toISOString(),
        },
      })
      console.log(`   ✅ Inserted/checked field: ${field.fieldKey}`)
    }

    // Insert missing event instance metadata using raw SQL
    console.log(`📝 Inserting missing fields for eventInstance (configId: ${EVENT_INSTANCE_GLOBAL_CONFIG_ID})...`)
    const missingInstanceFields = [
      { fieldKey: 'id', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'name', dataType: 'string', renderAs: 'text' },
      { fieldKey: 'orderIndex', dataType: 'number', renderAs: 'number' },
      { fieldKey: 'active', dataType: 'boolean', renderAs: 'statusButton' },
    ]
    
    for (const field of missingInstanceFields) {
      const label = prettifyLabel(field.fieldKey)
      const fieldId = randomUUID()
      
      // Use raw SQL with ON CONFLICT to handle unique constraint
      await queryInterface.sequelize.query(`
        INSERT INTO admin_metadata (
          id, metadata_type, config_type, config_id, entity_type, entity_id,
          field_key, data_type, label, is_required, visibility, layout,
          display_order, render_as, status_button_color, panel, bulk_edit,
          input_config, created_at, updated_at
        ) VALUES (
          :id, 'primitive', 'event', :configId::uuid, NULL, NULL,
          :fieldKey, :dataType, :label, false, 'notConfigured', 'stacked',
          999, :renderAs, NULL, 'none', false,
          NULL, :now, :now
        )
        ON CONFLICT (config_type, config_id, metadata_type, field_key)
        WHERE config_type = 'event'
        DO NOTHING
      `, {
        replacements: {
          id: fieldId,
          configId: EVENT_INSTANCE_GLOBAL_CONFIG_ID,
          fieldKey: field.fieldKey,
          dataType: field.dataType,
          label: label,
          renderAs: field.renderAs,
          now: now.toISOString(),
        },
      })
      console.log(`   ✅ Inserted/checked field: ${field.fieldKey}`)
    }

    console.log('✅ Fixed missing event shape metadata')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting missing event shape metadata fix...')
    
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'

    // Delete the inserted entries
    await queryInterface.bulkDelete('admin_metadata', {
      config_type: 'event',
      config_id: [EVENT_SHAPE_GLOBAL_CONFIG_ID, EVENT_INSTANCE_GLOBAL_CONFIG_ID],
    })
    
    console.log('✅ Reverted missing event shape metadata fix')
  },
}
