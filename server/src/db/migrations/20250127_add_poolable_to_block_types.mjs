/**
 * Migration: Add poolable column to block_types
 * Date: 2025-01-27
 * Purpose: Add poolable boolean property to BlockType to control whether BlockProfiles of that type can participate in pooling
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if table exists (it may have been renamed to block_shapes)
    const tableExists = await queryInterface.tableExists('block_types');
    const tableName = tableExists ? 'block_types' : 'block_shapes';
    
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable(tableName);
    
    if (!tableDescription.poolable && !tableDescription.composable) {
      // Add poolable/composable column (composable is the new name)
      await queryInterface.addColumn(tableName, 'composable', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      
      // Add index for performance when filtering by composable
      await queryInterface.addIndex(tableName, ['composable'], {
        name: `idx_${tableName}_composable`,
      });
      
      console.log(`✅ Added composable column to ${tableName} table`);
    } else {
      console.log(`ℹ️  Column ${tableName}.composable already exists, skipping`);
    }
  },

  async down(queryInterface, Sequelize) {
    // Check which table exists
    const tableExists = await queryInterface.tableExists('block_types');
    const tableName = tableExists ? 'block_types' : 'block_shapes';
    
    try {
      // Remove index first
      await queryInterface.removeIndex(tableName, `idx_${tableName}_composable`);
    } catch (error) {
      console.log(`ℹ️  Index not found, skipping removal`);
    }
    
    try {
      // Remove composable column
      await queryInterface.removeColumn(tableName, 'composable');
      console.log(`✅ Removed composable column from ${tableName} table`);
    } catch (error) {
      console.log(`ℹ️  Column not found, skipping removal`);
    }
  }
};

