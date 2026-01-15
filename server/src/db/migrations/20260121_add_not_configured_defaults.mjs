/**
 * Migration: Add "Not Configured" defaults and backfill existing rows
 * Date: 2026-01-21
 * Purpose: Ensure all admin_input_metadata rows have proper defaults for "not configured" state
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding "Not Configured" defaults and backfilling rows...');

    // 1. Add default value for display_order column
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_input_metadata 
      ALTER COLUMN display_order SET DEFAULT 999;
    `);
    console.log('✅ Added default value for display_order');

    // 2. Backfill rows that have NULL or missing defaults
    // Set visibility to 'notConfigured' if it's NULL (shouldn't happen, but safety check)
    await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET visibility = 'notConfigured'
      WHERE visibility IS NULL;
    `);
    console.log('✅ Backfilled NULL visibility values');

    // Set display_order to 999 (not configured) if it's NULL or 0 (unset)
    await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET display_order = 999
      WHERE display_order IS NULL OR display_order = 0;
    `);
    console.log('✅ Backfilled NULL/zero display_order values');

    // Set layout to 'stacked' if it's NULL
    await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET layout = 'stacked'
      WHERE layout IS NULL;
    `);
    console.log('✅ Backfilled NULL layout values');

    // Set render_as to 'text' if it's NULL
    await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET render_as = 'text'
      WHERE render_as IS NULL;
    `);
    console.log('✅ Backfilled NULL render_as values');

    // Set panel to 'none' if it's NULL
    await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET panel = 'none'
      WHERE panel IS NULL;
    `);
    console.log('✅ Backfilled NULL panel values');

    // Set bulk_edit to false if it's NULL
    await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET bulk_edit = false
      WHERE bulk_edit IS NULL;
    `);
    console.log('✅ Backfilled NULL bulk_edit values');

    // Set is_required to false if it's NULL
    await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET is_required = false
      WHERE is_required IS NULL;
    `);
    console.log('✅ Backfilled NULL is_required values');

    console.log('✅ Completed "Not Configured" defaults migration');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting "Not Configured" defaults migration...');
    
    // Remove default from display_order
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_input_metadata 
      ALTER COLUMN display_order DROP DEFAULT;
    `);
    
    console.log('✅ Reverted "Not Configured" defaults migration');
  }
};
