/**
 * Migration: Direct Insert Event Shape Metadata
 * Date: 2026-01-31
 * Purpose: Directly insert event shape metadata using simplest possible SQL
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Directly inserting event shape metadata...')

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'

    // Use bulkInsert like other successful migrations
    // LEARNING: bulkInsert with ignoreDuplicates works for other migrations
    // WHY: Follows the same pattern as 20260131151000_cleanup_and_reseed_config_metadata.mjs
    // PATTERN: Use bulkInsert with ignoreDuplicates for idempotent inserts
    const { randomUUID } = await import('crypto')
    const now = new Date()
    
    const fields = [
      { fieldKey: 'id', dataType: 'string', renderAs: 'text', label: 'Id' },
      { fieldKey: 'name', dataType: 'string', renderAs: 'text', label: 'Name' },
      { fieldKey: 'defaultOrderIndex', dataType: 'number', renderAs: 'number', label: 'Default Order Index' },
      { fieldKey: 'orderIndex', dataType: 'number', renderAs: 'number', label: 'Order Index' },
      { fieldKey: 'active', dataType: 'boolean', renderAs: 'statusButton', label: 'Active' },
    ]
    
    for (const field of fields) {
      try {
        await queryInterface.bulkInsert('admin_metadata', [{
          id: randomUUID(),
          metadata_type: 'primitive',
          config_type: 'event',
          config_id: EVENT_SHAPE_GLOBAL_CONFIG_ID,
          entity_type: null,
          entity_id: null,
          field_key: field.fieldKey,
          data_type: field.dataType,
          label: field.label,
          is_required: false,
          visibility: 'notConfigured',
          layout: 'stacked',
          display_order: 999,
          render_as: field.renderAs,
          status_button_color: null,
          panel: 'none',
          bulk_edit: false,
          input_config: null,
          created_at: now,
          updated_at: now,
        }], {
          ignoreDuplicates: true
        })
        console.log(`   ✅ Inserted/checked: ${field.fieldKey}`)
      } catch (error) {
        console.error(`   ❌ Error inserting ${field.fieldKey}:`, error.message)
        // Don't throw - continue with other fields
      }
    }
    
    console.log('✅ Directly inserted event shape metadata')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting direct insert...')
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    await queryInterface.bulkDelete('admin_metadata', {
      config_type: 'event',
      config_id: EVENT_SHAPE_GLOBAL_CONFIG_ID,
    })
    console.log('✅ Reverted direct insert')
  },
}
