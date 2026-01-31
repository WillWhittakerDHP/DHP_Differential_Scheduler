/**
 * Migration: Fix activeParts in input_config
 * Date: 2026-01-30
 * Purpose: Catch any records missed by the previous migration where input_config still contains 'activeParts'
 *          Updates ALL records with 'activeParts' in input_config fields, regardless of field_key value
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing activeParts in input_config fields...')

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata')
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update')
      return
    }

    // First, check what records exist with 'activeParts' in input_config
    const [checkRecords] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id, field_key, 
             input_config->>'targetKey' as target_key,
             input_config->>'globalField' as global_field
      FROM admin_metadata
      WHERE metadata_type = 'relationship'
        AND (
          input_config->>'targetKey' = 'activeParts'
          OR input_config->>'globalField' = 'activeParts'
          OR (field_key = 'partAssignments' AND input_config IS NOT NULL)
        )
      LIMIT 10
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    if (Array.isArray(checkRecords) && checkRecords.length > 0) {
      console.log(`📋 Found ${checkRecords.length} record(s) to check:`)
      checkRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.entity_type}.${record.entity_id} (field_key: ${record.field_key}, targetKey: ${record.target_key}, globalField: ${record.global_field})`)
      })
    }

    // Update input_config.targetKey from 'activeParts' to 'partAssignments'
    // LEARNING: Remove field_key restriction to catch ALL records
    // WHY: Some records may have field_key already updated but input_config.targetKey still has old value
    // PATTERN: Update regardless of field_key value - only check metadata_type and input_config value
    const [targetKeyUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"partAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'targetKey' = 'activeParts'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key, input_config->>'targetKey' as old_target_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const targetKeyCount = Array.isArray(targetKeyUpdate) ? targetKeyUpdate.length : 0
    if (targetKeyCount > 0) {
      console.log(`✅ Updated ${targetKeyCount} record(s): input_config.targetKey 'activeParts' → 'partAssignments'`)
      targetKeyUpdate.forEach((record, index) => {
        if (index < 5) { // Log first 5 records
          console.log(`   - ${record.entity_type}.${record.entity_id} (field_key: ${record.field_key}, old targetKey: ${record.old_target_key})`)
        }
      })
    } else {
      console.log('ℹ️  No records found with input_config.targetKey = "activeParts"')
    }

    // Update input_config.globalField from 'activeParts' to 'partAssignments'
    // LEARNING: Remove field_key restriction to catch ALL records
    const [globalFieldUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"partAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'globalField' = 'activeParts'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const globalFieldCount = Array.isArray(globalFieldUpdate) ? globalFieldUpdate.length : 0
    if (globalFieldCount > 0) {
      console.log(`✅ Updated ${globalFieldCount} record(s): input_config.globalField 'activeParts' → 'partAssignments'`)
    } else {
      console.log('ℹ️  No records found with input_config.globalField = "activeParts"')
    }

    // Update input_config.selectedChildPath array values that contain 'activeParts'
    // LEARNING: Update array elements in JSONB
    // WHY: selectedChildPath is an array that may contain 'activeParts' as an element
    // PATTERN: Use jsonb_set with array index or replace the entire array with updated values
    // NOTE: PostgreSQL doesn't have a direct way to update array elements, so we need to:
    // 1. Find records where selectedChildPath contains 'activeParts'
    // 2. Replace the array with a new array where 'activeParts' → 'partAssignments'
    const [selectedChildPathUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectedChildPath}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN value = '"activeParts"' THEN '"partAssignments"'
                  ELSE value
                END
              )
              FROM jsonb_array_elements(input_config->'selectedChildPath')
            ),
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->'selectedChildPath' @> '["activeParts"]'::jsonb
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const selectedChildPathCount = Array.isArray(selectedChildPathUpdate) ? selectedChildPathUpdate.length : 0
    if (selectedChildPathCount > 0) {
      console.log(`✅ Updated ${selectedChildPathCount} record(s): input_config.selectedChildPath 'activeParts' → 'partAssignments'`)
    } else {
      console.log('ℹ️  No records found with input_config.selectedChildPath containing "activeParts"')
    }

    console.log('✅ Migration complete: Fixed activeParts in input_config')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting activeParts fix in input_config...')

    // Revert selectedChildPath
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectedChildPath}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN value = '"partAssignments"' THEN '"activeParts"'
                  ELSE value
                END
              )
              FROM jsonb_array_elements(input_config->'selectedChildPath')
            ),
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->'selectedChildPath' @> '["partAssignments"]'::jsonb
        AND metadata_type = 'relationship'
    `)

    // Revert input_config.globalField
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"activeParts"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'globalField' = 'partAssignments'
        AND metadata_type = 'relationship'
    `)

    // Revert input_config.targetKey
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"activeParts"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->>'targetKey' = 'partAssignments'
        AND metadata_type = 'relationship'
    `)

    console.log('✅ Reverted: partAssignments → activeParts in input_config')
  },
}
