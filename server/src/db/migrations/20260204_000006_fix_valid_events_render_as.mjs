/**
 * Migration: Fix validEvents render_as to multiselect
 * Date: 2026-02-04
 * Purpose: 
 * - Update validEvents metadata to use render_as: 'multiselect' instead of 'relationshipCollection'
 * - validEvents should be a simple multi-select dropdown, not a relationshipCollection
 * - Similar to validParts which uses render_as: 'reference' with selectMode: 'multiple'
 * 
 * LEARNING: Valid events are simple select fields, not relationship collections
 * WHY: validEvents defines which event shapes are valid for a part shape (like validParts)
 * PATTERN: Use multiselect render_as for multi-select relationship fields
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing validEvents render_as to multiselect...');

    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';

    // Update validEvents metadata to use multiselect instead of relationshipCollection
    // Update regardless of current render_as value to ensure it's correct
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'multiselect',
          updated_at = CURRENT_TIMESTAMP
      WHERE entity_type = 'partShape'
        AND entity_id = $1
        AND field_key = 'validEvents'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key, render_as
    `, {
      bind: [PART_SHAPE_GLOBAL_CONFIG_ID],
      type: Sequelize.QueryTypes.SELECT,
    });

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0;
    console.log(`✅ Updated ${updatedCount} metadata record(s) with field_key='validEvents' to render_as='multiselect'`);

    if (updatedCount > 0) {
      console.log('📋 Updated records:');
      updateResult.forEach((record) => {
        console.log(`   - ${record.entity_type}.${record.field_key}: ${record.render_as}`);
      });
    } else {
      console.log('ℹ️  No records found to update (may already be correct)');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back validEvents render_as to relationshipCollection...');

    const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002';

    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'relationshipCollection',
          updated_at = CURRENT_TIMESTAMP
      WHERE entity_type = 'partShape'
        AND entity_id = $1
        AND field_key = 'validEvents'
        AND metadata_type = 'relationship'
        AND render_as = 'multiselect'
    `, {
      bind: [PART_SHAPE_GLOBAL_CONFIG_ID],
    });

    console.log('✅ Rolled back validEvents render_as to relationshipCollection');
  },
}
