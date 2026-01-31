/**
 * Migration: Update activeParts to partAssignments in metadata
 * Date: 2026-01-30
 * Purpose: Update field_key and input_config fields from 'activeParts' to 'partAssignments'
 *          to match the new relationship naming convention
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Updating activeParts to partAssignments in metadata...')

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata')
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update')
      return
    }

    // Update field_key from 'activeParts' to 'partAssignments'
    const [fieldKeyUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET field_key = 'partAssignments',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'activeParts'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const fieldKeyCount = Array.isArray(fieldKeyUpdate) ? fieldKeyUpdate.length : 0
    console.log(`✅ Updated ${fieldKeyCount} record(s): field_key 'activeParts' → 'partAssignments'`)

    // Update input_config.targetKey from 'activeParts' to 'partAssignments'
    // LEARNING: Update both cases:
    // 1. Records where field_key = 'activeParts' (will be updated to 'partAssignments' above)
    // 2. Records where field_key = 'partAssignments' but input_config.targetKey = 'activeParts' (from seed migration)
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
        AND (field_key = 'activeParts' OR field_key = 'partAssignments')
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const targetKeyCount = Array.isArray(targetKeyUpdate) ? targetKeyUpdate.length : 0
    if (targetKeyCount > 0) {
      console.log(`✅ Updated ${targetKeyCount} record(s): input_config.targetKey 'activeParts' → 'partAssignments'`)
    }

    // Update input_config.globalField from 'activeParts' to 'partAssignments'
    // LEARNING: Update both cases:
    // 1. Records where field_key = 'activeParts' (will be updated to 'partAssignments' above)
    // 2. Records where field_key = 'partAssignments' but input_config.globalField = 'activeParts' (from seed migration)
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
        AND (field_key = 'activeParts' OR field_key = 'partAssignments')
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const globalFieldCount = Array.isArray(globalFieldUpdate) ? globalFieldUpdate.length : 0
    if (globalFieldCount > 0) {
      console.log(`✅ Updated ${globalFieldCount} record(s): input_config.globalField 'activeParts' → 'partAssignments'`)
    }

    // Update label from 'Active Parts' to 'Part Assignments' for consistency
    const [labelUpdate] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'Part Assignments',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'partAssignments'
        AND label = 'Active Parts'
      RETURNING id, entity_type, entity_id, field_key, label
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const labelCount = Array.isArray(labelUpdate) ? labelUpdate.length : 0
    if (labelCount > 0) {
      console.log(`✅ Updated ${labelCount} record(s): label 'Active Parts' → 'Part Assignments'`)
    }

    console.log('✅ Migration complete: activeParts → partAssignments')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting activeParts to partAssignments update...')

    // Revert label
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'Active Parts',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'partAssignments'
        AND label = 'Part Assignments'
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
    `)

    // Revert field_key
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET field_key = 'activeParts',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'partAssignments'
        AND metadata_type = 'relationship'
    `)

    console.log('✅ Reverted: partAssignments → activeParts')
  },
}
