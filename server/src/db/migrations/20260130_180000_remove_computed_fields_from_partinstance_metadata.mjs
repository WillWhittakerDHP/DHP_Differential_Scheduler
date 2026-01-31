/**
 * Migration: Remove computed fields from partInstance metadata
 * Date: 2026-01-30 18:00:00
 * Purpose: Delete metadata records for onSite, moveable, and clientPresent on partInstance
 *          These fields are computed from EventAssignment relationships and should not be stored
 *          as primitive fields in the database.
 * 
 * WHY: onSite, moveable, and clientPresent are computed fields derived from EventAssignment
 *      relationships. They exist only in BookingPartInstance (computed type) and should not
 *      be configured as primitive fields in admin_metadata.
 * PATTERN: Delete all primitive metadata records for these fields on partInstance
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing computed fields (onSite, moveable, clientPresent) from partInstance metadata...')

    const tableExists = await queryInterface.tableExists('admin_metadata')
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping deletion')
      return
    }

    // Delete metadata records for computed fields
    const [deletedRecords] = await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata
      WHERE entity_type = 'partInstance'
        AND field_key IN ('onSite', 'moveable', 'clientPresent')
        AND metadata_type = 'primitive'
      RETURNING id, entity_type, field_key, render_as, status_button_color
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const deletedCount = Array.isArray(deletedRecords) ? deletedRecords.length : 0
    if (deletedCount > 0) {
      console.log(`✅ Deleted ${deletedCount} metadata record(s) for computed fields:`)
      if (Array.isArray(deletedRecords)) {
        deletedRecords.forEach((record) => {
          console.log(`   - ${record.field_key}: render_as=${record.render_as}, status_button_color=${record.status_button_color} (id: ${record.id})`)
        })
      }
    } else {
      console.log(`ℹ️  No metadata records found for onSite, moveable, or clientPresent on partInstance`)
    }

    console.log('✅ Migration complete: Removed computed fields from partInstance metadata')
  },

  async down(queryInterface, Sequelize) {
    // Reverse the changes if needed - but we shouldn't restore these since they're incorrect
    console.log('🔄 Reverting computed fields deletion...')
    console.log('⚠️  Note: These fields should not be restored as they are computed from relationships')
    console.log('✅ Reverted (no-op: computed fields should remain deleted)')
  },
}
