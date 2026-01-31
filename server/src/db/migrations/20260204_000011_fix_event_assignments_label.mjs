/**
 * Migration: Fix eventAssignments label in admin_metadata
 * Date: 2026-02-04
 * Purpose: Update label from 'Active Event' to 'Event Assignments' for consistency
 *          This completes the migration from activeEvents naming to eventAssignments naming
 * 
 * LEARNING: Label was not updated in previous migrations that fixed field_key and input_config
 * WHY: Previous migrations focused on field_key, targetKey, globalField, selectedChildPath, selectType but missed label
 * PATTERN: Update label column directly for eventAssignments metadata entries
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing eventAssignments label in admin_metadata...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping update');
      return;
    }

    // Update label from 'Active Event' to 'Event Assignments'
    // Check both 'eventAssignments' and 'activeEvents' field_key to catch any that weren't updated yet
    const [updatedLabel] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'Event Assignments',
          updated_at = CURRENT_TIMESTAMP
      WHERE (field_key = 'eventAssignments' OR field_key = 'activeEvents')
        AND metadata_type = 'relationship'
        AND (label = 'Active Event' OR label ILIKE '%active event%')
      RETURNING id, entity_type, entity_id, field_key, label
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const labelCount = Array.isArray(updatedLabel) ? updatedLabel.length : 0;
    if (labelCount > 0) {
      console.log(`✅ Updated ${labelCount} eventAssignments metadata entries: label 'Active Event' → 'Event Assignments'`);
    } else {
      console.log('ℹ️  No eventAssignments metadata entries needed label updating');
    }

    console.log('✅ Completed fixing eventAssignments label');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting eventAssignments label fixes...');

    // Revert label
    await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'Active Event',
          updated_at = CURRENT_TIMESTAMP
      WHERE field_key = 'eventAssignments'
        AND metadata_type = 'relationship'
        AND label = 'Event Assignments'
    `);

    console.log('✅ Reverted eventAssignments label');
  },
};
