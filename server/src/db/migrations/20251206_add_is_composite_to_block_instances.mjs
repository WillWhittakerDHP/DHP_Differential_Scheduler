/**
 * Migration: Add is_composite column to block_instances
 * Date: 2025-12-06
 * Purpose: Add is_composite boolean to block_instances to distinguish atomic vs composite instances
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // Check if is_composite column already exists
    if (tableDescription.is_composite) {
      console.log('ℹ️  Column block_instances.is_composite already exists, skipping migration');
      return;
    }
    
    // Add the is_composite column
    await queryInterface.addColumn('block_instances', 'is_composite', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    console.log('✅ Added is_composite column to block_instances table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // Check if is_composite column exists
    if (tableDescription.is_composite) {
      await queryInterface.removeColumn('block_instances', 'is_composite');
      console.log('✅ Removed is_composite column from block_instances table');
    } else {
      console.log('ℹ️  Column block_instances.is_composite does not exist, skipping rollback');
    }
  }
};























