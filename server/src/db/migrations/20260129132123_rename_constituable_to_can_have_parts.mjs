/**
 * Migration: Rename constituable column to can_have_parts in block_shapes
 * Date: 2026-01-29
 * Purpose: Rename constituable boolean column to canHaveParts (can_have_parts in database) for better semantic clarity
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if constituable column exists
    if (!tableDescription.constituable) {
      console.log('ℹ️  Column block_shapes.constituable does not exist, skipping migration');
      return;
    }
    
    // Check if can_have_parts column already exists
    if (tableDescription.can_have_parts) {
      console.log('ℹ️  Column block_shapes.can_have_parts already exists, skipping migration');
      return;
    }
    
    // Rename constituable to can_have_parts
    await queryInterface.renameColumn('block_shapes', 'constituable', 'can_have_parts');
    
    console.log('✅ Renamed constituable column to can_have_parts in block_shapes table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if can_have_parts column exists
    if (!tableDescription.can_have_parts) {
      console.log('ℹ️  Column block_shapes.can_have_parts does not exist, skipping rollback');
      return;
    }
    
    // Check if constituable column already exists
    if (tableDescription.constituable) {
      console.log('ℹ️  Column block_shapes.constituable already exists, skipping rollback');
      return;
    }
    
    // Rename can_have_parts back to constituable
    await queryInterface.renameColumn('block_shapes', 'can_have_parts', 'constituable');
    
    console.log('✅ Renamed can_have_parts column back to constituable in block_shapes table');
  }
};
