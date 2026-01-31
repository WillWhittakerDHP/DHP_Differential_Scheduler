/**
 * Migration: Ensure partAssignments in input_config
 * Date: 2026-01-30 (later timestamp to run after fix migration)
 * Purpose: Final check to ensure ALL records with field_key='partAssignments' have correct input_config values
 *          This is a safety net to catch any records that might have been missed
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Ensuring partAssignments in input_config fields...')

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata')
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update')
      return
    }

    // First, find all records that might need updating
    const [checkRecords] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id, field_key, 
             input_config->>'targetKey' as target_key,
             input_config->>'globalField' as global_field,
             input_config->'selectedChildPath' as selected_child_path
      FROM admin_metadata
      WHERE metadata_type = 'relationship'
        AND (
          field_key = 'partAssignments'
          OR field_key = 'activeParts'
          OR input_config->>'targetKey' = 'activeParts'
          OR input_config->>'globalField' = 'activeParts'
        )
      LIMIT 20
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    if (Array.isArray(checkRecords) && checkRecords.length > 0) {
      console.log(`📋 Found ${checkRecords.length} record(s) to check:`)
      checkRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.entity_type}.${record.entity_id} (field_key: ${record.field_key})`)
        console.log(`      targetKey: ${record.target_key || 'NULL'}`)
        console.log(`      globalField: ${record.global_field || 'NULL'}`)
        console.log(`      selectedChildPath: ${JSON.stringify(record.selected_child_path) || 'NULL'}`)
      })
    } else {
      console.log('ℹ️  No records found matching criteria')
    }

    // Update input_config.targetKey from 'activeParts' to 'partAssignments'
    // LEARNING: Update ALL records where field_key='partAssignments' but targetKey is wrong
    const [targetKeyUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"partAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'partAssignments'
        AND metadata_type = 'relationship'
        AND (
          input_config->>'targetKey' = 'activeParts'
          OR input_config->>'targetKey' IS NULL
          OR input_config->>'targetKey' != 'partAssignments'
        )
      RETURNING id, entity_type, entity_id, field_key, input_config->>'targetKey' as new_target_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const targetKeyCount = Array.isArray(targetKeyUpdate) ? targetKeyUpdate.length : 0
    if (targetKeyCount > 0) {
      console.log(`✅ Updated ${targetKeyCount} record(s): input_config.targetKey → 'partAssignments'`)
      targetKeyUpdate.forEach((record, index) => {
        if (index < 5) {
          console.log(`   - ${record.entity_type}.${record.entity_id} (new targetKey: ${record.new_target_key})`)
        }
      })
    } else {
      console.log('ℹ️  All records already have correct input_config.targetKey')
    }

    // Update input_config.globalField from 'activeParts' to 'partAssignments'
    const [globalFieldUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"partAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'partAssignments'
        AND metadata_type = 'relationship'
        AND (
          input_config->>'globalField' = 'activeParts'
          OR input_config->>'globalField' IS NULL
          OR input_config->>'globalField' != 'partAssignments'
        )
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const globalFieldCount = Array.isArray(globalFieldUpdate) ? globalFieldUpdate.length : 0
    if (globalFieldCount > 0) {
      console.log(`✅ Updated ${globalFieldCount} record(s): input_config.globalField → 'partAssignments'`)
    } else {
      console.log('ℹ️  All records already have correct input_config.globalField')
    }

    // Update input_config.selectedChildPath array values
    const [selectedChildPathUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectedChildPath}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN value::text = '"activeParts"' THEN '"partAssignments"'::jsonb
                  ELSE value
                END
              )
              FROM jsonb_array_elements(input_config->'selectedChildPath')
            ),
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'partAssignments'
        AND metadata_type = 'relationship'
        AND input_config->'selectedChildPath' @> '["activeParts"]'::jsonb
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const selectedChildPathCount = Array.isArray(selectedChildPathUpdate) ? selectedChildPathUpdate.length : 0
    if (selectedChildPathCount > 0) {
      console.log(`✅ Updated ${selectedChildPathCount} record(s): input_config.selectedChildPath 'activeParts' → 'partAssignments'`)
    } else {
      console.log('ℹ️  All records already have correct input_config.selectedChildPath')
    }

    console.log('✅ Migration complete: Ensured partAssignments in input_config')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting partAssignments ensure in input_config...')
    // This migration is idempotent and safe - no need for complex rollback
    console.log('ℹ️  No rollback needed - migration is idempotent')
  },
}
