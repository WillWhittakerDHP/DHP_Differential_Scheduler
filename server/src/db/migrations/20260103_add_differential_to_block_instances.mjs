/**
 * Migration: Add differential column to block_instances
 * Date: 2026-01-03
 * Purpose: Add differential boolean to block_instances to support differential scheduling
 *          (services where inspector and client have different arrival times)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // Check if differential column already exists
    if (tableDescription.differential) {
      console.log('ℹ️  Column block_instances.differential already exists, skipping migration');
      return;
    }
    
    // Add the differential column
    await queryInterface.addColumn('block_instances', 'differential', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'differential'
    });
    
    console.log('✅ Added differential column to block_instances table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // Check if differential column exists
    if (tableDescription.differential) {
      await queryInterface.removeColumn('block_instances', 'differential');
      console.log('✅ Removed differential column from block_instances table');
    } else {
      console.log('ℹ️  Column block_instances.differential does not exist, skipping rollback');
    }
  }
};

