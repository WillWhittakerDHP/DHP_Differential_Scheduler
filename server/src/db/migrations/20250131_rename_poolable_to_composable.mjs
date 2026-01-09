/**
 * Migration: Rename poolable column to composable in block_shapes
 * Date: 2025-01-31
 * Purpose: Rename poolable column to composable to better reflect the concept of composable entities
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if poolable column exists
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    if (tableDescription.poolable) {
      // Rename the column
      await queryInterface.renameColumn('block_shapes', 'poolable', 'composable');
      console.log('✅ Renamed poolable column to composable in block_shapes table');
      
      // Rename the index if it exists
      const indexes = await queryInterface.showIndex('block_shapes');
      const poolableIndex = indexes.find(idx => idx.name === 'idx_block_shapes_poolable');
      
      if (poolableIndex) {
        // Note: Sequelize doesn't have a direct renameIndex method, so we use raw SQL
        await queryInterface.sequelize.query(`
          ALTER INDEX IF EXISTS idx_block_shapes_poolable RENAME TO idx_block_shapes_composable;
        `);
        console.log('✅ Renamed index idx_block_shapes_poolable to idx_block_shapes_composable');
      }
    } else if (tableDescription.composable) {
      console.log('ℹ️  Column block_shapes.composable already exists, skipping migration');
    } else {
      throw new Error('Column block_shapes.poolable does not exist and block_shapes.composable does not exist. Cannot perform migration.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if composable column exists
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    if (tableDescription.composable) {
      // Rename the column back
      await queryInterface.renameColumn('block_shapes', 'composable', 'poolable');
      console.log('✅ Renamed composable column back to poolable in block_shapes table');
      
      // Rename the index back if it exists
      const indexes = await queryInterface.showIndex('block_shapes');
      const composableIndex = indexes.find(idx => idx.name === 'idx_block_shapes_composable');
      
      if (composableIndex) {
        await queryInterface.sequelize.query(`
          ALTER INDEX IF EXISTS idx_block_shapes_composable RENAME TO idx_block_shapes_poolable;
        `);
        console.log('✅ Renamed index idx_block_shapes_composable back to idx_block_shapes_poolable');
      }
    } else if (tableDescription.poolable) {
      console.log('ℹ️  Column block_shapes.poolable already exists, skipping rollback');
    } else {
      throw new Error('Column block_shapes.composable does not exist and block_shapes.poolable does not exist. Cannot perform rollback.');
    }
  }
};

