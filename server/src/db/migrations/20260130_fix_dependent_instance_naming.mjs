/**
 * Migration: Fix dependent instance naming alignment
 * Date: 2026-01-30
 * Purpose: Update existing metadata entries from dependentInstanceOptions to dependentInstances
 *          This fixes the naming misalignment between old and current naming conventions
 * 
 * LEARNING: The table was renamed from dependent_instance_options to dependent_instances,
 *           and constants were updated, but metadata entries may still reference the old name
 * WHY: Ensures consistency - all metadata should use dependentInstances (current naming)
 * PATTERN: Update field_key and input_config JSONB fields to use correct naming
 * 
 * NOTE: This migration is idempotent - safe to run multiple times
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing dependent instance naming alignment...');

    // Step 1: Update field_key from dependentInstanceOptions to dependentInstances
    const [updatedFieldKey] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET field_key = 'dependentInstances',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'dependentInstanceOptions'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const fieldKeyCount = Array.isArray(updatedFieldKey) ? updatedFieldKey.length : 0;
    if (fieldKeyCount > 0) {
      console.log(`✅ Updated ${fieldKeyCount} metadata entries: field_key dependentInstanceOptions → dependentInstances`);
    } else {
      console.log('ℹ️  No metadata entries found with field_key = dependentInstanceOptions');
    }

    // Step 2: Update input_config JSONB fields for dependentInstances
    // Update targetKey
    const [updatedTargetKey] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
        input_config,
        '{targetKey}',
        '"dependentInstances"'
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'dependentInstances'
        AND input_config->>'targetKey' = 'dependentInstanceOptions'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const targetKeyCount = Array.isArray(updatedTargetKey) ? updatedTargetKey.length : 0;
    if (targetKeyCount > 0) {
      console.log(`✅ Updated ${targetKeyCount} input_config.targetKey: dependentInstanceOptions → dependentInstances`);
    }

    // Update globalField
    const [updatedGlobalField] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
        input_config,
        '{globalField}',
        '"dependentInstances"'
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'dependentInstances'
        AND input_config->>'globalField' = 'dependentInstanceOptions'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const globalFieldCount = Array.isArray(updatedGlobalField) ? updatedGlobalField.length : 0;
    if (globalFieldCount > 0) {
      console.log(`✅ Updated ${globalFieldCount} input_config.globalField: dependentInstanceOptions → dependentInstances`);
    }

    // Update selectedChildPath
    const [updatedSelectedChildPath] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
        input_config,
        '{selectedChildPath}',
        '["dependentInstances"]'::jsonb
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'dependentInstances'
        AND input_config->'selectedChildPath'->>0 = 'dependentInstanceOptions'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const selectedChildPathCount = Array.isArray(updatedSelectedChildPath) ? updatedSelectedChildPath.length : 0;
    if (selectedChildPathCount > 0) {
      console.log(`✅ Updated ${selectedChildPathCount} input_config.selectedChildPath: dependentInstanceOptions → dependentInstances`);
    }

    // Update selectType from dependentInstanceOptionSelect to dependentInstanceSelect
    const [updatedSelectType] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
        input_config,
        '{selectType}',
        '"dependentInstanceSelect"'
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'dependentInstances'
        AND input_config->>'selectType' = 'dependentInstanceOptionSelect'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const selectTypeCount = Array.isArray(updatedSelectType) ? updatedSelectType.length : 0;
    if (selectTypeCount > 0) {
      console.log(`✅ Updated ${selectTypeCount} input_config.selectType: dependentInstanceOptionSelect → dependentInstanceSelect`);
    }

    // Step 3: Update instanceComponents candidateParentPath
    const [updatedCandidateParentPath] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET input_config = jsonb_set(
        input_config,
        '{candidateParentPath}',
        '["dependentInstances"]'::jsonb
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'instanceComponents'
        AND input_config->'candidateParentPath'->>0 = 'dependentInstanceOptions'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    const candidateParentPathCount = Array.isArray(updatedCandidateParentPath) ? updatedCandidateParentPath.length : 0;
    if (candidateParentPathCount > 0) {
      console.log(`✅ Updated ${candidateParentPathCount} instanceComponents input_config.candidateParentPath: dependentInstanceOptions → dependentInstances`);
    }

    console.log('✅ Dependent instance naming alignment complete!');
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Reverting dependent instance naming alignment...');
    console.log('   This will change dependentInstances back to dependentInstanceOptions');
    
    // Revert field_key
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET field_key = 'dependentInstanceOptions',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'dependentInstances'
    `);

    // Revert input_config fields (simplified - would need to restore original values)
    console.log('⚠️  Note: input_config JSONB fields cannot be fully reverted without original values');
    console.log('   Manual restoration may be needed if rollback is required');
  },
};
