/**
 * Migration: Fix eventAssignments selectType in admin_metadata
 * Date: 2026-01-31
 * Purpose: Fix selectType from 'activeEventSelect' to 'eventAssignmentSelect' in eventAssignments metadata
 *          This completes the migration from activeEvents naming to eventAssignments naming
 * 
 * LEARNING: selectType was not updated in the previous migration that fixed other references
 * WHY: Previous migration focused on targetKey, globalField, selectedChildPath but missed selectType
 * PATTERN: Update JSONB field using jsonb_set to update selectType property
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing eventAssignments selectType in admin_metadata...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update');
      return;
    }

    // First, update any entries that still have field_key = 'activeEvents' to 'eventAssignments'
    const [updatedFieldKey] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET field_key = 'eventAssignments',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'activeEvents'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const fieldKeyCount = Array.isArray(updatedFieldKey) ? updatedFieldKey.length : 0;
    if (fieldKeyCount > 0) {
      console.log(`✅ Updated ${fieldKeyCount} metadata entries: field_key 'activeEvents' → 'eventAssignments'`);
    }

    // Update selectType from 'activeEventSelect' to 'eventAssignmentSelect'
    // Check both 'eventAssignments' and 'activeEvents' field_key
    const [updatedSelectType] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectType}',
            '"eventAssignmentSelect"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE (field_key = 'eventAssignments' OR field_key = 'activeEvents')
        AND metadata_type = 'relationship'
        AND input_config->>'selectType' = 'activeEventSelect'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const selectTypeCount = Array.isArray(updatedSelectType) ? updatedSelectType.length : 0;
    if (selectTypeCount > 0) {
      console.log(`✅ Updated ${selectTypeCount} eventAssignments metadata entries: selectType 'activeEventSelect' → 'eventAssignmentSelect'`);
    } else {
      console.log('ℹ️  No eventAssignments metadata entries needed selectType updating');
    }

    // Also fix any remaining activeEvents references in targetKey, globalField, selectedChildPath
    // (in case the previous migration didn't catch everything)
    // Check both 'eventAssignments' and 'activeEvents' field_key to catch any that weren't updated yet
    const [updatedTargetKey] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"eventAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE (field_key = 'eventAssignments' OR field_key = 'activeEvents')
        AND metadata_type = 'relationship'
        AND input_config->>'targetKey' = 'activeEvents'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const targetKeyCount = Array.isArray(updatedTargetKey) ? updatedTargetKey.length : 0;
    if (targetKeyCount > 0) {
      console.log(`✅ Updated ${targetKeyCount} eventAssignments metadata entries: targetKey 'activeEvents' → 'eventAssignments'`);
    }

    const [updatedGlobalField] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"eventAssignments"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE (field_key = 'eventAssignments' OR field_key = 'activeEvents')
        AND metadata_type = 'relationship'
        AND input_config->>'globalField' = 'activeEvents'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const globalFieldCount = Array.isArray(updatedGlobalField) ? updatedGlobalField.length : 0;
    if (globalFieldCount > 0) {
      console.log(`✅ Updated ${globalFieldCount} eventAssignments metadata entries: globalField 'activeEvents' → 'eventAssignments'`);
    }

    // Update selectedChildPath array (replace 'activeEvents' with 'eventAssignments')
    const [updatedSelectedChildPath] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectedChildPath}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN value::text = '"activeEvents"' THEN '"eventAssignments"'::jsonb
                  ELSE value
                END
              )
              FROM jsonb_array_elements(input_config->'selectedChildPath')
            ),
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE (field_key = 'eventAssignments' OR field_key = 'activeEvents')
        AND metadata_type = 'relationship'
        AND input_config->'selectedChildPath' @> '["activeEvents"]'::jsonb
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const selectedChildPathCount = Array.isArray(updatedSelectedChildPath) ? updatedSelectedChildPath.length : 0;
    if (selectedChildPathCount > 0) {
      console.log(`✅ Updated ${selectedChildPathCount} eventAssignments metadata entries: selectedChildPath 'activeEvents' → 'eventAssignments'`);
    }

    // Ensure render_as is set to 'relationshipCollection' (should already be set, but verify)
    const [updatedRenderAs] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'relationshipCollection',
          updated_at = CURRENT_TIMESTAMP
      WHERE (field_key = 'eventAssignments' OR field_key = 'activeEvents')
        AND metadata_type = 'relationship'
        AND render_as != 'relationshipCollection'
      RETURNING id, entity_type, entity_id, field_key, render_as
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const renderAsCount = Array.isArray(updatedRenderAs) ? updatedRenderAs.length : 0;
    if (renderAsCount > 0) {
      console.log(`✅ Updated ${renderAsCount} eventAssignments metadata entries: render_as → 'relationshipCollection'`);
    }

    // Ensure selectMode is present in inputConfig (required for relationshipCollection fields)
    const [updatedSelectMode] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{selectMode}',
            '"multiple"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE (field_key = 'eventAssignments' OR field_key = 'activeEvents')
        AND metadata_type = 'relationship'
        AND (input_config->>'selectMode' IS NULL OR input_config->>'selectMode' = '')
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const selectModeCount = Array.isArray(updatedSelectMode) ? updatedSelectMode.length : 0;
    if (selectModeCount > 0) {
      console.log(`✅ Updated ${selectModeCount} eventAssignments metadata entries: added selectMode: 'multiple'`);
    }

    console.log('✅ Completed fixing eventAssignments metadata references');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting eventAssignments selectType fixes...');

    // Revert selectType
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectType}',
            '"activeEventSelect"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND input_config->>'selectType' = 'eventAssignmentSelect'
    `);

    // Revert targetKey
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{targetKey}',
            '"activeEvents"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND input_config->>'targetKey' = 'eventAssignments'
    `);

    // Revert globalField
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            COALESCE(input_config, '{}'::jsonb),
            '{globalField}',
            '"activeEvents"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND input_config->>'globalField' = 'eventAssignments'
    `);

    // Revert selectedChildPath
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
            input_config,
            '{selectedChildPath}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN value::text = '"eventAssignments"' THEN '"activeEvents"'::jsonb
                  ELSE value
                END
              )
              FROM jsonb_array_elements(input_config->'selectedChildPath')
            ),
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND input_config->'selectedChildPath' @> '["eventAssignments"]'::jsonb
    `);

    console.log('✅ Reverted eventAssignments metadata references');
  },
};
