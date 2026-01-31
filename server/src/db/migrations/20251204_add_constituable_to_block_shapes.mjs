/**
 * Migration: Add canHaveParts column to block_shapes (originally named constituable)
 * Date: 2025-12-04
 * Purpose: Add canHaveParts boolean to block_shapes to control whether blockInstances of this shape can have parts (partInstances)
 * Note: This migration originally added the column as 'constituable', which was later renamed to 'can_have_parts' in a subsequent migration
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

