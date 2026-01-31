/**
 * Migration: Fix all activeParts references in admin_metadata
 * Date: 2026-01-30 17:35:00
 * Purpose: Comprehensive fix for ALL remaining activeParts references in admin_metadata table
 *          Updates ALL records regardless of field_key value - only checks input_config values
 *          This migration is more aggressive than 20260130_fix_all_active_assignments_in_metadata.mjs
 *          and specifically targets activeParts to ensure complete cleanup
 * 
 * WHY: Despite previous migrations, activeParts references persist in input_config fields,
 *      causing frontend errors: "RelationshipKey: activeParts. Please configure optionsFieldKey..."
 * PATTERN: Updates input_config JSONB fields (targetKey, globalField, selectedChildPath)
 *          without relying on field_key matching, ensuring all records are checked
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing all activeParts references in admin_metadata...')

    const tableExists = await queryInterface.tableExists('admin_metadata')
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update')
      return
    }

    // Update input_config.targetKey from 'activeParts' to 'partAssignments'
    // NO RESTRICTIONS - update ALL records with activeParts in targetKey
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
      RETURNING id, entity_type, entity_id, field_key, input_config->>'targetKey' as new_target_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const targetKeyCount = Array.isArray(targetKeyUpdate) ? targetKeyUpdate.length : 0
    if (targetKeyCount > 0) {
      console.log(`✅ Updated ${targetKeyCount} record(s): input_config.targetKey 'activeParts' → 'partAssignments'`)
      if (targetKeyCount > 0 && Array.isArray(targetKeyUpdate)) {
        targetKeyUpdate.forEach((record) => {
          console.log(`   - ${record.entity_type}.${record.field_key} (id: ${record.id})`)
        })
      }
    } else {
      console.log(`ℹ️  No records found with input_config.targetKey = 'activeParts'`)
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
      WHERE input_config->>'globalField' = 'activeParts'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const globalFieldCount = Array.isArray(globalFieldUpdate) ? globalFieldUpdate.length : 0
    if (globalFieldCount > 0) {
      console.log(`✅ Updated ${globalFieldCount} record(s): input_config.globalField 'activeParts' → 'partAssignments'`)
      if (Array.isArray(globalFieldUpdate)) {
        globalFieldUpdate.forEach((record) => {
          console.log(`   - ${record.entity_type}.${record.field_key} (id: ${record.id})`)
        })
      }
    } else {
      console.log(`ℹ️  No records found with input_config.globalField = 'activeParts'`)
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
      WHERE input_config->'selectedChildPath' @> '["activeParts"]'::jsonb
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const selectedChildPathCount = Array.isArray(selectedChildPathUpdate) ? selectedChildPathUpdate.length : 0
    if (selectedChildPathCount > 0) {
      console.log(`✅ Updated ${selectedChildPathCount} record(s): input_config.selectedChildPath 'activeParts' → 'partAssignments'`)
      if (Array.isArray(selectedChildPathUpdate)) {
        selectedChildPathUpdate.forEach((record) => {
          console.log(`   - ${record.entity_type}.${record.field_key} (id: ${record.id})`)
        })
      }
    } else {
      console.log(`ℹ️  No records found with input_config.selectedChildPath containing 'activeParts'`)
    }

    // Also check for wrapped relationshipSelect structure (if it exists)
    const [relationshipSelectTargetKeyUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{relationshipSelect,targetKey}',
            '"partAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->'relationshipSelect'->>'targetKey' = 'activeParts'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const relationshipSelectTargetKeyCount = Array.isArray(relationshipSelectTargetKeyUpdate) ? relationshipSelectTargetKeyUpdate.length : 0
    if (relationshipSelectTargetKeyCount > 0) {
      console.log(`✅ Updated ${relationshipSelectTargetKeyCount} record(s): input_config.relationshipSelect.targetKey 'activeParts' → 'partAssignments'`)
      if (Array.isArray(relationshipSelectTargetKeyUpdate)) {
        relationshipSelectTargetKeyUpdate.forEach((record) => {
          console.log(`   - ${record.entity_type}.${record.field_key} (id: ${record.id})`)
        })
      }
    }

    const [relationshipSelectGlobalFieldUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{relationshipSelect,globalField}',
            '"partAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->'relationshipSelect'->>'globalField' = 'activeParts'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const relationshipSelectGlobalFieldCount = Array.isArray(relationshipSelectGlobalFieldUpdate) ? relationshipSelectGlobalFieldUpdate.length : 0
    if (relationshipSelectGlobalFieldCount > 0) {
      console.log(`✅ Updated ${relationshipSelectGlobalFieldCount} record(s): input_config.relationshipSelect.globalField 'activeParts' → 'partAssignments'`)
      if (Array.isArray(relationshipSelectGlobalFieldUpdate)) {
        relationshipSelectGlobalFieldUpdate.forEach((record) => {
          console.log(`   - ${record.entity_type}.${record.field_key} (id: ${record.id})`)
        })
      }
    }

    const [relationshipSelectSelectedChildPathUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{relationshipSelect,selectedChildPath}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN value::text = '"activeParts"' THEN '"partAssignments"'::jsonb
                  ELSE value
                END
              )
              FROM jsonb_array_elements(input_config->'relationshipSelect'->'selectedChildPath')
            ),
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE input_config->'relationshipSelect'->'selectedChildPath' @> '["activeParts"]'::jsonb
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const relationshipSelectSelectedChildPathCount = Array.isArray(relationshipSelectSelectedChildPathUpdate) ? relationshipSelectSelectedChildPathUpdate.length : 0
    if (relationshipSelectSelectedChildPathCount > 0) {
      console.log(`✅ Updated ${relationshipSelectSelectedChildPathCount} record(s): input_config.relationshipSelect.selectedChildPath 'activeParts' → 'partAssignments'`)
      if (Array.isArray(relationshipSelectSelectedChildPathUpdate)) {
        relationshipSelectSelectedChildPathUpdate.forEach((record) => {
          console.log(`   - ${record.entity_type}.${record.field_key} (id: ${record.id})`)
        })
      }
    }

    console.log('✅ Migration complete: Fixed all activeParts references')
  },

  async down(queryInterface, Sequelize) {
    // Reverse the changes if needed
    console.log('🔄 Reverting activeParts fixes...')
    
    // Reverse targetKey
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

    // Reverse globalField
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

    // Reverse selectedChildPath
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectedChildPath}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN value::text = '"partAssignments"' THEN '"activeParts"'::jsonb
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

    console.log('✅ Reverted activeParts fixes')
  },
}
