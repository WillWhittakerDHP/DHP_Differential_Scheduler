/**
 * Migration: Remove component_required column from block_instances
 * Date: 2025-12-07
 * Purpose: Remove component_required column as it's being replaced by isComposite field
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // Check if component_required column exists
    if (tableDescription.component_required) {
      await queryInterface.removeColumn('block_instances', 'component_required');
      console.log('✅ Removed component_required column from block_instances table');
    } else {
      console.log('ℹ️  Column block_instances.component_required does not exist, skipping migration');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // Check if component_required column already exists
    if (tableDescription.component_required) {
      console.log('ℹ️  Column block_instances.component_required already exists, skipping rollback');
      return;
    }
    
    // Add the component_required column back
    await queryInterface.addColumn('block_instances', 'component_required', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    console.log('✅ Added component_required column back to block_instances table');
  }
};























