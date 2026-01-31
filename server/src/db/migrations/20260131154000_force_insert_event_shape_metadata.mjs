/**
 * Migration: Force Insert Event Shape Metadata
 * Date: 2026-01-31
 * Purpose: Force insert event shape metadata using raw SQL to ensure it works
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Force inserting event shape metadata...')

    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'

    // Event Shape fields
    const eventShapeFields = [
      { fieldKey: 'id', dataType: 'string', renderAs: 'text', label: 'Id' },
      { fieldKey: 'name', dataType: 'string', renderAs: 'text', label: 'Name' },
      { fieldKey: 'defaultOrderIndex', dataType: 'number', renderAs: 'number', label: 'Default Order Index' },
      { fieldKey: 'orderIndex', dataType: 'number', renderAs: 'number', label: 'Order Index' },
      { fieldKey: 'active', dataType: 'boolean', renderAs: 'statusButton', label: 'Active' },
    ]

    // Event Instance missing fields
    const eventInstanceFields = [
      { fieldKey: 'id', dataType: 'string', renderAs: 'text', label: 'Id' },
      { fieldKey: 'name', dataType: 'string', renderAs: 'text', label: 'Name' },
      { fieldKey: 'orderIndex', dataType: 'number', renderAs: 'number', label: 'Order Index' },
      { fieldKey: 'active', dataType: 'boolean', renderAs: 'statusButton', label: 'Active' },
    ]

    // Insert event shape metadata
    console.log(`📝 Force inserting ${eventShapeFields.length} fields for eventShape...`)
    for (const field of eventShapeFields) {
      try {
        await queryInterface.sequelize.query(`
          INSERT INTO admin_metadata (
            id, metadata_type, config_type, config_id, entity_type, entity_id,
            field_key, data_type, label, is_required, visibility, layout,
            display_order, render_as, status_button_color, panel, bulk_edit,
            input_config, created_at, updated_at
          )
          SELECT 
            gen_random_uuid(),
            'primitive',
            'event',
            :configId::uuid,
            NULL,
            NULL,
            :fieldKey,
            :dataType,
            :label,
            false,
            'notConfigured',
            'stacked',
            999,
            :renderAs,
            NULL,
            'none',
            false,
            NULL,
            NOW(),
            NOW()
          WHERE NOT EXISTS (
            SELECT 1 FROM admin_metadata 
            WHERE config_type = 'event' 
              AND config_id = :configId::uuid 
              AND field_key = :fieldKey
          )
        `, {
          replacements: {
            configId: EVENT_SHAPE_GLOBAL_CONFIG_ID,
            fieldKey: field.fieldKey,
            dataType: field.dataType,
            label: field.label,
            renderAs: field.renderAs,
          },
        })
        console.log(`   ✅ Inserted/checked field: ${field.fieldKey}`)
      } catch (error) {
        console.error(`   ❌ Error inserting ${field.fieldKey}:`, error.message)
      }
    }

    // Insert missing event instance metadata
    console.log(`📝 Force inserting ${eventInstanceFields.length} missing fields for eventInstance...`)
    for (const field of eventInstanceFields) {
      try {
        await queryInterface.sequelize.query(`
          INSERT INTO admin_metadata (
            id, metadata_type, config_type, config_id, entity_type, entity_id,
            field_key, data_type, label, is_required, visibility, layout,
            display_order, render_as, status_button_color, panel, bulk_edit,
            input_config, created_at, updated_at
          )
          SELECT 
            gen_random_uuid(),
            'primitive',
            'event',
            :configId::uuid,
            NULL,
            NULL,
            :fieldKey,
            :dataType,
            :label,
            false,
            'notConfigured',
            'stacked',
            999,
            :renderAs,
            NULL,
            'none',
            false,
            NULL,
            NOW(),
            NOW()
          WHERE NOT EXISTS (
            SELECT 1 FROM admin_metadata 
            WHERE config_type = 'event' 
              AND config_id = :configId::uuid 
              AND field_key = :fieldKey
          )
        `, {
          replacements: {
            configId: EVENT_INSTANCE_GLOBAL_CONFIG_ID,
            fieldKey: field.fieldKey,
            dataType: field.dataType,
            label: field.label,
            renderAs: field.renderAs,
          },
        })
        console.log(`   ✅ Inserted/checked field: ${field.fieldKey}`)
      } catch (error) {
        console.error(`   ❌ Error inserting ${field.fieldKey}:`, error.message)
      }
    }

    console.log('✅ Force inserted event shape metadata')
  },

  async down(queryInterface, Sequelize) {
    // No down migration needed - this is a data fix
    console.log('🔄 Skipping down migration for data fix')
  },
}
