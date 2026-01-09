/**
 * Migration: Add poolable column to block_types
 * Date: 2025-01-27
 * Purpose: Add poolable boolean property to BlockType to control whether BlockProfiles of that type can participate in pooling
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('block_types');
    
    if (!tableDescription.poolable) {
      // Add poolable column to block_types table
      await queryInterface.addColumn('block_types', 'poolable', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      
      // Add index for performance when filtering by poolable
      await queryInterface.addIndex('block_types', ['poolable'], {
        name: 'idx_block_types_poolable',
      });
      
      console.log('✅ Added poolable column to block_types table');
    } else {
      console.log('ℹ️  Column block_types.poolable already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('block_types', 'idx_block_types_poolable');
    
    // Remove poolable column
    await queryInterface.removeColumn('block_types', 'poolable');
    
    console.log('✅ Removed poolable column from block_types table');
  }
};
