/**
 * Migration: Fix Event Shape Metadata Fields
 * Date: 2026-01-31
 * Purpose: 
 * - Remove defaultTernaryValue from eventShape metadata (shouldn't be configurable)
 * - Ensure name field exists for eventShape metadata
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing event shape metadata fields...')

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'

    // Delete defaultTernaryValue field from eventShape metadata
    await queryInterface.bulkDelete('admin_metadata', {
      config_type: 'event',
      config_id: EVENT_SHAPE_GLOBAL_CONFIG_ID,
      field_key: 'defaultTernaryValue',
    })
    console.log('✅ Deleted defaultTernaryValue from eventShape metadata')

    // Check if name field exists
    const [existingName] = await queryInterface.sequelize.query(`
      SELECT id FROM admin_metadata 
      WHERE config_type = 'event' 
        AND config_id = :configId 
        AND field_key = 'name'
    `, {
      replacements: { configId: EVENT_SHAPE_GLOBAL_CONFIG_ID },
      type: Sequelize.QueryTypes.SELECT
    })

    // If name doesn't exist, insert it
    if (!existingName || existingName.length === 0) {
      const { randomUUID } = await import('crypto')
      const now = new Date()

      await queryInterface.bulkInsert('admin_metadata', [{
        id: randomUUID(),
        metadata_type: 'primitive',
        config_type: 'event',
        config_id: EVENT_SHAPE_GLOBAL_CONFIG_ID,
        entity_type: null,
        entity_id: null,
        field_key: 'name',
        data_type: 'string',
        label: 'Name',
        is_required: false,
        visibility: 'notConfigured',
        layout: 'stacked',
        display_order: 999,
        render_as: 'text',
        status_button_color: null,
        panel: 'none',
        bulk_edit: false,
        input_config: null,
        created_at: now,
        updated_at: now,
      }], {
        ignoreDuplicates: true
      })
      console.log('✅ Inserted name field for eventShape metadata')
    } else {
      console.log('ℹ️  name field already exists for eventShape metadata')
    }

    console.log('✅ Fixed event shape metadata fields')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting event shape metadata fields fix...')
    
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'

    // Re-insert defaultTernaryValue (if needed for rollback)
    const { randomUUID } = await import('crypto')
    const now = new Date()

    await queryInterface.bulkInsert('admin_metadata', [{
      id: randomUUID(),
      metadata_type: 'primitive',
      config_type: 'event',
      config_id: EVENT_SHAPE_GLOBAL_CONFIG_ID,
      entity_type: null,
      entity_id: null,
      field_key: 'defaultTernaryValue',
      data_type: 'ternary',
      label: 'Default Ternary Value',
      is_required: false,
      visibility: 'notConfigured',
      layout: 'stacked',
      display_order: 999,
      render_as: 'statusButton',
      status_button_color: null,
      panel: 'none',
      bulk_edit: false,
      input_config: null,
      created_at: now,
      updated_at: now,
    }], {
      ignoreDuplicates: true
    })
    
    console.log('✅ Reverted event shape metadata fields fix')
  },
}
