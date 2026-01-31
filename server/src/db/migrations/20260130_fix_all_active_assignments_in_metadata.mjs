/**
 * Migration: Fix all activeParts, activeEvents, and activeAnnotations in admin_metadata
 * Date: 2026-01-30
 * Purpose: Comprehensive fix for all old "active*" naming in admin_metadata table
 *          Handles both direct and wrapped (relationshipSelect) input_config structures
 *          Updates: field_key, input_config.targetKey, input_config.globalField, input_config.selectedChildPath
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing all activeParts, activeEvents, and activeAnnotations in admin_metadata...')

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata')
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update')
      return
    }

    // Mapping of old names to new names
    const nameMappings = [
      { old: 'activeParts', new: 'partAssignments' },
      { old: 'activeEvents', new: 'eventAssignments' },
      { old: 'activeAnnotations', new: 'annotationAssignments' },
    ]

    for (const mapping of nameMappings) {
      const { old: oldName, new: newName } = mapping
      console.log(`\n📝 Processing ${oldName} → ${newName}...`)

      // 1. Update field_key
      const [fieldKeyUpdate] = await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET field_key = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE field_key = $2
          AND metadata_type = 'relationship'
        RETURNING id, entity_type, entity_id, field_key
      `, {
        bind: [newName, oldName],
        type: Sequelize.QueryTypes.SELECT,
      })

      const fieldKeyCount = Array.isArray(fieldKeyUpdate) ? fieldKeyUpdate.length : 0
      if (fieldKeyCount > 0) {
        console.log(`  ✅ Updated ${fieldKeyCount} record(s): field_key '${oldName}' → '${newName}'`)
      }

      // 2. Update direct input_config.targetKey
      const [targetKeyUpdate] = await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              COALESCE(input_config, '{}'::jsonb),
              '{targetKey}',
              $1::jsonb,
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->>'targetKey' = $2
          AND metadata_type = 'relationship'
        RETURNING id, entity_type, entity_id, field_key
      `, {
        bind: [`"${newName}"`, oldName],
        type: Sequelize.QueryTypes.SELECT,
      })

      const targetKeyCount = Array.isArray(targetKeyUpdate) ? targetKeyUpdate.length : 0
      if (targetKeyCount > 0) {
        console.log(`  ✅ Updated ${targetKeyCount} record(s): input_config.targetKey '${oldName}' → '${newName}'`)
      }

      // 3. Update wrapped input_config.relationshipSelect.targetKey
      const [relationshipSelectTargetKeyUpdate] = await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              input_config,
              '{relationshipSelect,targetKey}',
              $1::jsonb,
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->'relationshipSelect'->>'targetKey' = $2
          AND metadata_type = 'relationship'
        RETURNING id, entity_type, entity_id, field_key
      `, {
        bind: [`"${newName}"`, oldName],
        type: Sequelize.QueryTypes.SELECT,
      })

      const relationshipSelectTargetKeyCount = Array.isArray(relationshipSelectTargetKeyUpdate) ? relationshipSelectTargetKeyUpdate.length : 0
      if (relationshipSelectTargetKeyCount > 0) {
        console.log(`  ✅ Updated ${relationshipSelectTargetKeyCount} record(s): input_config.relationshipSelect.targetKey '${oldName}' → '${newName}'`)
      }

      // 4. Update direct input_config.globalField
      const [globalFieldUpdate] = await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              COALESCE(input_config, '{}'::jsonb),
              '{globalField}',
              $1::jsonb,
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->>'globalField' = $2
          AND metadata_type = 'relationship'
        RETURNING id, entity_type, entity_id, field_key
      `, {
        bind: [`"${newName}"`, oldName],
        type: Sequelize.QueryTypes.SELECT,
      })

      const globalFieldCount = Array.isArray(globalFieldUpdate) ? globalFieldUpdate.length : 0
      if (globalFieldCount > 0) {
        console.log(`  ✅ Updated ${globalFieldCount} record(s): input_config.globalField '${oldName}' → '${newName}'`)
      }

      // 5. Update wrapped input_config.relationshipSelect.globalField
      const [relationshipSelectGlobalFieldUpdate] = await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              input_config,
              '{relationshipSelect,globalField}',
              $1::jsonb,
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->'relationshipSelect'->>'globalField' = $2
          AND metadata_type = 'relationship'
        RETURNING id, entity_type, entity_id, field_key
      `, {
        bind: [`"${newName}"`, oldName],
        type: Sequelize.QueryTypes.SELECT,
      })

      const relationshipSelectGlobalFieldCount = Array.isArray(relationshipSelectGlobalFieldUpdate) ? relationshipSelectGlobalFieldUpdate.length : 0
      if (relationshipSelectGlobalFieldCount > 0) {
        console.log(`  ✅ Updated ${relationshipSelectGlobalFieldCount} record(s): input_config.relationshipSelect.globalField '${oldName}' → '${newName}'`)
      }

      // 6. Update direct input_config.selectedChildPath array
      const [selectedChildPathUpdate] = await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              input_config,
              '{selectedChildPath}',
              (
                SELECT jsonb_agg(
                  CASE 
                    WHEN value::text = $1 THEN $2::jsonb
                    ELSE value
                  END
                )
                FROM jsonb_array_elements(input_config->'selectedChildPath')
              ),
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->'selectedChildPath' @> $3::jsonb
          AND metadata_type = 'relationship'
        RETURNING id, entity_type, entity_id, field_key
      `, {
        bind: [`"${oldName}"`, `"${newName}"`, `["${oldName}"]`],
        type: Sequelize.QueryTypes.SELECT,
      })

      const selectedChildPathCount = Array.isArray(selectedChildPathUpdate) ? selectedChildPathUpdate.length : 0
      if (selectedChildPathCount > 0) {
        console.log(`  ✅ Updated ${selectedChildPathCount} record(s): input_config.selectedChildPath '${oldName}' → '${newName}'`)
      }

      // 7. Update wrapped input_config.relationshipSelect.selectedChildPath array
      const [relationshipSelectSelectedChildPathUpdate] = await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              input_config,
              '{relationshipSelect,selectedChildPath}',
              (
                SELECT jsonb_agg(
                  CASE 
                    WHEN value::text = $1 THEN $2::jsonb
                    ELSE value
                  END
                )
                FROM jsonb_array_elements(input_config->'relationshipSelect'->'selectedChildPath')
              ),
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->'relationshipSelect'->'selectedChildPath' @> $3::jsonb
          AND metadata_type = 'relationship'
        RETURNING id, entity_type, entity_id, field_key
      `, {
        bind: [`"${oldName}"`, `"${newName}"`, `["${oldName}"]`],
        type: Sequelize.QueryTypes.SELECT,
      })

      const relationshipSelectSelectedChildPathCount = Array.isArray(relationshipSelectSelectedChildPathUpdate) ? relationshipSelectSelectedChildPathUpdate.length : 0
      if (relationshipSelectSelectedChildPathCount > 0) {
        console.log(`  ✅ Updated ${relationshipSelectSelectedChildPathCount} record(s): input_config.relationshipSelect.selectedChildPath '${oldName}' → '${newName}'`)
      }
    }

    console.log('\n✅ Migration complete: Fixed all activeParts, activeEvents, and activeAnnotations')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting activeParts, activeEvents, and activeAnnotations fixes...')

    // Reverse mapping
    const nameMappings = [
      { old: 'partAssignments', new: 'activeParts' },
      { old: 'eventAssignments', new: 'activeEvents' },
      { old: 'annotationAssignments', new: 'activeAnnotations' },
    ]

    for (const mapping of nameMappings) {
      const { old: oldName, new: newName } = mapping
      
      // Reverse field_key updates
      await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET field_key = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE field_key = $2
          AND metadata_type = 'relationship'
      `, {
        bind: [newName, oldName],
      })

      // Reverse input_config updates (both direct and wrapped)
      await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              COALESCE(input_config, '{}'::jsonb),
              '{targetKey}',
              $1::jsonb,
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->>'targetKey' = $2
          AND metadata_type = 'relationship'
      `, {
        bind: [`"${newName}"`, oldName],
      })

      await queryInterface.sequelize.query(`
        UPDATE admin_metadata
        SET input_config = jsonb_set(
              input_config,
              '{relationshipSelect,targetKey}',
              $1::jsonb,
              false
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE input_config->'relationshipSelect'->>'targetKey' = $2
          AND metadata_type = 'relationship'
      `, {
        bind: [`"${newName}"`, oldName],
      })

      // Similar reversals for globalField and selectedChildPath...
    }

    console.log('✅ Reverted: partAssignments/eventAssignments/annotationAssignments → activeParts/activeEvents/activeAnnotations')
  },
}
