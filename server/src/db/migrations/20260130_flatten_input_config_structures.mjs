/**
 * Migration: Flatten input_config structures to direct format
 * Date: 2026-01-30
 * Purpose: Standardize all input_config to use direct structure (input_config.targetKey)
 *          instead of wrapped structure (input_config.relationshipSelect.targetKey)
 *          This aligns with the seed migration format and simplifies code
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Flattening input_config structures to direct format...')

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata')
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update')
      return
    }

    // Find all records with wrapped relationshipSelect structure
    const [wrappedRecords] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id, field_key, input_config
      FROM admin_metadata
      WHERE metadata_type = 'relationship'
        AND input_config IS NOT NULL
        AND input_config->'relationshipSelect' IS NOT NULL
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const wrappedCount = Array.isArray(wrappedRecords) ? wrappedRecords.length : 0
    console.log(`📋 Found ${wrappedCount} record(s) with wrapped relationshipSelect structure`)

    if (wrappedCount === 0) {
      console.log('✅ No records to flatten')
      return
    }

    // Flatten each record: move relationshipSelect.* to top level
    // Use a single UPDATE query for better performance
    // LEARNING: Use jsonb_build_object to construct new object, then merge with remaining properties
    // WHY: Preserves any other top-level properties while flattening relationshipSelect
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = (
        jsonb_build_object(
          'targetMode', input_config->'relationshipSelect'->>'targetMode',
          'targetKey', input_config->'relationshipSelect'->>'targetKey',
          'globalField', input_config->'relationshipSelect'->>'globalField',
          'selectedParentKey', input_config->'relationshipSelect'->>'selectedParentKey',
          'selectedChildKey', input_config->'relationshipSelect'->>'selectedChildKey',
          'selectedChildPath', input_config->'relationshipSelect'->'selectedChildPath',
          'candidateParentKey', input_config->'relationshipSelect'->>'candidateParentKey',
          'candidateParentPath', input_config->'relationshipSelect'->'candidateParentPath',
          'candidateChildKey', input_config->'relationshipSelect'->>'candidateChildKey',
          'candidateChildPath', input_config->'relationshipSelect'->'candidateChildPath',
          'selectType', input_config->'relationshipSelect'->>'selectType',
          'selectMode', input_config->'relationshipSelect'->>'selectMode',
          'groupByKey', input_config->'relationshipSelect'->>'groupByKey',
          'placeholder', input_config->'relationshipSelect'->>'placeholder'
        )
        || (input_config - 'relationshipSelect')
      ),
          updated_at = CURRENT_TIMESTAMP
      WHERE metadata_type = 'relationship'
        AND input_config IS NOT NULL
        AND input_config->'relationshipSelect' IS NOT NULL
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0

    console.log(`✅ Flattened ${updatedCount} record(s): relationshipSelect.* → top level`)
    console.log('✅ Migration complete: All input_config structures are now direct format')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting input_config flattening (wrapping back to relationshipSelect)...')

    // Find all records with direct structure that should be wrapped
    const [directRecords] = await queryInterface.sequelize.query(`
      SELECT id, entity_type, entity_id, field_key, input_config
      FROM admin_metadata
      WHERE metadata_type = 'relationship'
        AND input_config IS NOT NULL
        AND input_config->'relationshipSelect' IS NULL
        AND input_config->>'targetKey' IS NOT NULL
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const directCount = Array.isArray(directRecords) ? directRecords.length : 0
    console.log(`📋 Found ${directCount} record(s) with direct structure to wrap`)

    if (directCount === 0) {
      console.log('✅ No records to wrap')
      return
    }

    // Wrap each record: move top-level select properties into relationshipSelect
    let updatedCount = 0
    for (const record of directRecords) {
      try {
        const inputConfig = record.input_config || {}
        
        // Properties that belong in relationshipSelect
        const relationshipSelectProps = [
          'targetMode',
          'targetKey',
          'globalField',
          'selectedParentKey',
          'selectedChildKey',
          'selectedChildPath',
          'candidateParentKey',
          'candidateParentPath',
          'candidateChildKey',
          'candidateChildPath',
          'selectType',
          'selectMode',
          'groupByKey',
          'placeholder',
        ]

        const relationshipSelect = {}
        const otherProps = {}

        // Separate properties
        for (const [key, value] of Object.entries(inputConfig)) {
          if (relationshipSelectProps.includes(key)) {
            relationshipSelect[key] = value
          } else {
            otherProps[key] = value
          }
        }

        // Build wrapped structure
        const newInputConfig = {
          relationshipSelect,
          ...otherProps,
        }

        await queryInterface.sequelize.query(`
          UPDATE admin_metadata
          SET input_config = $1::jsonb,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, {
          bind: [JSON.stringify(newInputConfig), record.id],
        })

        updatedCount++
      } catch (error) {
        console.error(`  ❌ Error wrapping record ${record.id}:`, error.message)
      }
    }

    console.log(`✅ Wrapped ${updatedCount} record(s): top level → relationshipSelect.*`)
    console.log('✅ Reverted: All input_config structures wrapped back to relationshipSelect')
  },
}
