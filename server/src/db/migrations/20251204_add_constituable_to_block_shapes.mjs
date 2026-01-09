/**
 * Migration: Add constituable column to block_shapes
 * Date: 2025-12-04
 * Purpose: Add constituable boolean to block_shapes to control whether blockInstances of this shape can have constituents (partInstances)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if constituable column already exists
    if (tableDescription.constituable) {
      console.log('ℹ️  Column block_shapes.constituable already exists, skipping migration');
      return;
    }
    
    // Add the constituable column
    await queryInterface.addColumn('block_shapes', 'constituable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    console.log('✅ Added constituable column to block_shapes table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if constituable column exists
    if (tableDescription.constituable) {
      await queryInterface.removeColumn('block_shapes', 'constituable');
      console.log('✅ Removed constituable column from block_shapes table');
    } else {
      console.log('ℹ️  Column block_shapes.constituable does not exist, skipping rollback');
    }
  }
};

