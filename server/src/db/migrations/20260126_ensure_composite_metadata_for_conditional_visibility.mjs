/**
 * Migration: Ensure composite field metadata for conditional visibility
 * Date: 2026-01-26
 * Purpose: Set composite field metadata to expandedDirect visibility so it can be conditionally shown/hidden
 * 
 * LEARNING: Conditional visibility requires field to be configured in metadata
 * WHY: Fields with visibility: 'notConfigured' don't render, so we need expandedDirect to enable conditional filtering
 * PATTERN: Update metadata to expandedDirect, panel: 'none' for conditional visibility filtering
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migration: Ensure composite metadata for conditional visibility...')

    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    // Update global composite metadata to expandedDirect
    console.log('📝 Updating global composite metadata to expandedDirect...')
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET 
        visibility = 'expandedDirect',
        panel = 'none',
        display_order = 10
      WHERE entity_type = 'blockInstance'
        AND entity_id = :entityId
        AND metadata_type = 'primitive'
        AND field_key = 'composite';
    `, {
      replacements: { entityId: BLOCK_INSTANCE_GLOBAL_CONFIG_ID }
    })
    console.log('✅ Updated global composite metadata')

    // Update BlockShape-specific composite metadata entries
    console.log('📝 Updating BlockShape-specific composite metadata entries...')
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET 
        visibility = 'expandedDirect',
        panel = 'none',
        display_order = 10
      WHERE entity_type = 'blockInstance'
        AND metadata_type = 'primitive'
        AND field_key = 'composite'
        AND block_shape_ref IS NOT NULL;
    `)
    console.log('✅ Updated BlockShape-specific composite metadata')

    console.log('✅ Migration completed successfully')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting migration: Revert composite metadata...')

    const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

    // Revert composite metadata to notConfigured
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET 
        visibility = 'notConfigured',
        panel = 'none',
        display_order = 999
      WHERE entity_type = 'blockInstance'
        AND metadata_type = 'primitive'
        AND field_key = 'composite';
    `)
    console.log('✅ Reverted composite metadata')

    console.log('✅ Migration reverted successfully')
  },
}
