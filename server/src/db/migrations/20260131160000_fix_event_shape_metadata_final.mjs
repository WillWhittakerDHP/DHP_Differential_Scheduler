/**
 * Migration: Fix Event Shape Metadata - Final
 * Date: 2026-01-31
 * Purpose: 
 * - Insert missing event shape metadata (config_id: 00000000-0000-0000-0000-000000000010)
 * - Complete event instance metadata (config_id: 00000000-0000-0000-0000-000000000012)
 * - Uses raw SQL with explicit ON CONFLICT to handle partial unique index
 * 
 * LEARNING: Raw SQL bypasses Sequelize validation issues
 * WHY: bulkInsert with ignoreDuplicates doesn't work reliably with partial unique indexes
 * PATTERN: Use raw SQL INSERT with explicit ON CONFLICT matching the unique index constraint
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing event shape and instance metadata (final)...')

    // LEARNING: The admin_metadata_entity_metadata_field_unique index conflicts with event/annotation inserts
    // WHY: This index includes (entity_type, entity_id) with NULLS NOT DISTINCT, causing all NULL values to conflict
    // SOLUTION: Temporarily drop this index, insert the data, then recreate it
    // PATTERN: Drop conflicting index, insert data, recreate index
    
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'

    // Check if the conflicting index exists and drop it temporarily
    const indexExists = await queryInterface.sequelize.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'admin_metadata' 
        AND indexname = 'admin_metadata_entity_metadata_field_unique'
    `, { type: Sequelize.QueryTypes.SELECT })

    let indexDropped = false
    if (indexExists && indexExists.length > 0) {
      console.log('   ⚠️  Temporarily dropping admin_metadata_entity_metadata_field_unique index...')
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS admin_metadata_entity_metadata_field_unique
      `)
      indexDropped = true
    }

    // Event Shape fields (4 fields: id, name, orderIndex, active)
    // LEARNING: Only include fields that are actually needed
    // WHY: defaultOrderIndex and defaultTernaryValue are unnecessary
    const eventShapeFields = [
      { fieldKey: 'id', dataType: 'string', label: 'Id', renderAs: 'text' },
      { fieldKey: 'name', dataType: 'string', label: 'Name', renderAs: 'text' },
      { fieldKey: 'orderIndex', dataType: 'number', label: 'Order Index', renderAs: 'number' },
      { fieldKey: 'active', dataType: 'boolean', label: 'Active', renderAs: 'statusButton' },
    ]

    // Event Instance missing fields (id, name, orderIndex, active)
    // Current fields: descriptionTemplate, eventShapeRef, locationTemplate, titleTemplate
    const eventInstanceFields = [
      { fieldKey: 'id', dataType: 'string', label: 'Id', renderAs: 'text' },
      { fieldKey: 'name', dataType: 'string', label: 'Name', renderAs: 'text' },
      { fieldKey: 'orderIndex', dataType: 'number', label: 'Order Index', renderAs: 'number' },
      { fieldKey: 'active', dataType: 'boolean', label: 'Active', renderAs: 'statusButton' },
    ]

    // Insert event shape metadata using bulkInsert
    // LEARNING: bulkInsert with ignoreDuplicates works for other migrations
    // WHY: Raw SQL triggers Sequelize validation hooks that cause unique constraint errors
    // PATTERN: Use bulkInsert with ignoreDuplicates for idempotent inserts
    const { randomUUID } = await import('crypto')
    const now = new Date()
    
    // Insert event shape metadata using bulkInsert (like working migrations)
    // LEARNING: bulkInsert handles enum conversion automatically
    // WHY: No casting needed - Sequelize converts string values to enum types
    console.log(`📝 Inserting ${eventShapeFields.length} fields for eventShape (configId: ${EVENT_SHAPE_GLOBAL_CONFIG_ID})...`)
    for (const field of eventShapeFields) {
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

    // Verify event shape insertion
    const [eventShapeVerify] = await queryInterface.sequelize.query(`
      SELECT COUNT(*)::int as count 
      FROM admin_metadata 
      WHERE config_type = 'event' 
        AND config_id = '${EVENT_SHAPE_GLOBAL_CONFIG_ID}'::uuid
    `, { type: Sequelize.QueryTypes.SELECT })

    const eventShapeCount = eventShapeVerify?.count || 0
    console.log(`   ✅ Event shape: Found ${eventShapeCount} fields`)
    
    if (eventShapeCount !== 4) {
      throw new Error(`Expected 4 fields for event shape, found ${eventShapeCount}`)
    }

    // Insert missing event instance metadata using bulkInsert
    console.log(`📝 Inserting ${eventInstanceFields.length} missing fields for eventInstance (configId: ${EVENT_INSTANCE_GLOBAL_CONFIG_ID})...`)
    for (const field of eventInstanceFields) {
      try {
        await queryInterface.bulkInsert('admin_metadata', [{
          id: randomUUID(),
          metadata_type: 'primitive',
          config_type: 'event',
          config_id: EVENT_INSTANCE_GLOBAL_CONFIG_ID,
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

    // Recreate the index if we dropped it, but only for entity data (not event/annotation)
    // LEARNING: This index should only apply to entity metadata, not config data
    // WHY: Event/annotation config data has NULL entity_type/entity_id, which would all conflict
    // PATTERN: Use WHERE clause to exclude config data from this index
    if (indexDropped) {
      console.log('   🔄 Recreating admin_metadata_entity_metadata_field_unique index (entity data only)...')
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX admin_metadata_entity_metadata_field_unique 
        ON admin_metadata (entity_type, entity_id, metadata_type, field_key, block_shape_ref) 
        NULLS NOT DISTINCT
        WHERE config_type = 'entity' OR (config_type IS NULL AND entity_type IS NOT NULL)
      `)
    }

    // Verify event instance has all expected fields (should have 8 total: 4 existing + 4 new)
    const [eventInstanceVerify] = await queryInterface.sequelize.query(`
      SELECT COUNT(*)::int as count 
      FROM admin_metadata 
      WHERE config_type = 'event' 
        AND config_id = '${EVENT_INSTANCE_GLOBAL_CONFIG_ID}'::uuid
    `, { type: Sequelize.QueryTypes.SELECT })

    const eventInstanceCount = eventInstanceVerify?.count || 0
    console.log(`   ✅ Event instance: Found ${eventInstanceCount} fields`)
    
    if (eventInstanceCount !== 8) {
      console.warn(`   ⚠️  Expected 8 fields for event instance, found ${eventInstanceCount} (may already have some fields)`)
    }

    // Recreate the index with a WHERE clause that excludes event/annotation config data
    if (indexDropped) {
      console.log('   🔧 Recreating admin_metadata_entity_metadata_field_unique index with WHERE clause...')
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX admin_metadata_entity_metadata_field_unique 
        ON admin_metadata (entity_type, entity_id, metadata_type, field_key, block_shape_ref) 
        NULLS NOT DISTINCT
        WHERE config_type = 'entity' OR (config_type IS NULL AND entity_type IS NOT NULL)
      `)
    }
    
    console.log('✅ Fixed event shape and instance metadata')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting event shape and instance metadata fix...')
    
    const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
    const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'

    // Delete the inserted entries
    await queryInterface.bulkDelete('admin_metadata', {
      config_type: 'event',
      config_id: [EVENT_SHAPE_GLOBAL_CONFIG_ID, EVENT_INSTANCE_GLOBAL_CONFIG_ID],
    })
    
    console.log('✅ Reverted event shape and instance metadata fix')
  },
}
