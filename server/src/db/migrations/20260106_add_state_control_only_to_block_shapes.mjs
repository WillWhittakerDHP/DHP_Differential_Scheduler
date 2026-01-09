/**
 * Migration: Add state_control_only column to block_shapes
 * Date: 2026-01-06
 * Purpose: Add state_control_only boolean to block_shapes to control whether blockInstances of this shape display or interact with PartInstances
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if state_control_only column already exists
    if (tableDescription.state_control_only) {
      console.log('ℹ️  Column block_shapes.state_control_only already exists, skipping migration');
      return;
    }
    
    // Add the state_control_only column
    await queryInterface.addColumn('block_shapes', 'state_control_only', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    console.log('✅ Added state_control_only column to block_shapes table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if state_control_only column exists
    if (tableDescription.state_control_only) {
      await queryInterface.removeColumn('block_shapes', 'state_control_only');
      console.log('✅ Removed state_control_only column from block_shapes table');
    } else {
      console.log('ℹ️  Column block_shapes.state_control_only does not exist, skipping rollback');
    }
  }
};

