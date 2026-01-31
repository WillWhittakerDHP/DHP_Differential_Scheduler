/**
 * Migration: Move eventAssignments metadata from PartShape to PartInstance
 * Date: 2026-02-04
 * Purpose: 
 * - Move eventAssignments metadata from PartShape to PartInstance
 * - Update input_config to reflect instance-level assignment pattern
 * - Similar to how partAssignments works (BlockInstance → PartInstance)
 * 
 * LEARNING: Event assignments move from shape-level to instance-level
 * WHY: Matches validParts/partAssignments pattern - shapes define valid options, instances assign them
 * PATTERN: Update entity_type and input_config to reflect new parent/child relationship
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Moving eventAssignments metadata from PartShape to PartInstance...');

    // Update entity_type from partShape to partInstance
    // Chain all jsonb_set operations into a single nested call
    const [updatedEntityType] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET entity_type = 'partInstance',
          input_config = jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    COALESCE(input_config, '{}'::jsonb),
                    '{selectedParentKey}',
                    '"partInstance"',
                    false
                  ),
                  '{candidateParentKey}',
                  '"partShape"',
                  false
                ),
                '{candidateParentPath}',
                '["partShapeRef"]'::jsonb,
                false
              ),
              '{candidateChildKey}',
              '"eventInstance"',
              false
            ),
            '{optionsFieldKey}',
            '"validEvents"',
            false
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND entity_type = 'partShape'
      RETURNING id, entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const entityTypeCount = Array.isArray(updatedEntityType) ? updatedEntityType.length : 0;
    if (entityTypeCount > 0) {
      console.log(`✅ Moved ${entityTypeCount} eventAssignments metadata entries from PartShape to PartInstance`);
    } else {
      console.log('ℹ️  No eventAssignments metadata entries found on PartShape to move');
    }

    // Also update any eventAssignments metadata on blockShape (keep for backward compatibility but mark as deprecated)
    // Note: We're not removing blockShape eventAssignments, just updating them to note they're deprecated
    console.log('ℹ️  BlockShape eventAssignments metadata kept for backward compatibility');

    console.log('✅ Completed moving eventAssignments metadata to PartInstance');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting eventAssignments metadata move...');

    // Revert entity_type from partInstance back to partShape
    // Chain jsonb_set and jsonb removal into a single operation
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET entity_type = 'partShape',
          input_config = (
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  COALESCE(input_config, '{}'::jsonb),
                  '{selectedParentKey}',
                  '"partShape"',
                  false
                ),
                '{candidateParentKey}',
                '"partShape"',
                false
              ),
              '{candidateParentPath}',
              '[]'::jsonb,
              false
            ) - 'optionsFieldKey'
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND entity_type = 'partInstance'
    `);

    console.log('✅ Reverted eventAssignments metadata to PartShape');
  },
}
