/**
 * Migration: Remove state_control_only column from block_shapes
 * Date: 2026-01-07
 * Purpose: Remove redundant state_control_only column. All logic now uses canHaveParts field (inverted).
 *          If state_control_only was true, set canHaveParts to false (state control mode).
 * Note: This migration originally referenced 'constituable', which was later renamed to 'can_have_parts' in a subsequent migration
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if state_control_only column exists
    if (!tableDescription.state_control_only) {
      console.log('ℹ️  Column block_shapes.state_control_only does not exist, skipping migration');
      return;
    }
    
    // LEARNING: Migrate data: if state_control_only was true, set canHaveParts to false
    // WHY: Preserve existing state control behavior when removing the column
    // PATTERN: Update canHaveParts (can_have_parts) based on state_control_only value before removing column
    // NOTE: Column name may be 'constituable' or 'can_have_parts' depending on migration order
    const tableDescription = await queryInterface.describeTable('block_shapes');
    const columnName = tableDescription.can_have_parts ? 'can_have_parts' : 'constituable';
    
    await queryInterface.sequelize.query(`
      UPDATE block_shapes 
      SET ${columnName} = false 
      WHERE state_control_only = true AND ${columnName} = true;
    `);
    
    console.log(`✅ Migrated state_control_only values to ${columnName} field`);
    
    // Remove the state_control_only column
    await queryInterface.removeColumn('block_shapes', 'state_control_only');
    
    console.log('✅ Removed state_control_only column from block_shapes table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if state_control_only column already exists
    if (tableDescription.state_control_only) {
      console.log('ℹ️  Column block_shapes.state_control_only already exists, skipping rollback');
      return;
    }
    
    // Add the state_control_only column back
    await queryInterface.addColumn('block_shapes', 'state_control_only', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    // LEARNING: Restore data: if canHaveParts is false, set state_control_only to true
    // WHY: Restore state_control_only values based on canHaveParts when rolling back
    // PATTERN: Set state_control_only based on canHaveParts value
    // NOTE: Column name may be 'constituable' or 'can_have_parts' depending on migration order
    const tableDescription = await queryInterface.describeTable('block_shapes');
    const columnName = tableDescription.can_have_parts ? 'can_have_parts' : 'constituable';
    
    await queryInterface.sequelize.query(`
      UPDATE block_shapes 
      SET state_control_only = CASE 
        WHEN ${columnName} = false THEN true 
        ELSE false 
      END;
    `);
    
    console.log('✅ Restored state_control_only column to block_shapes table');
  }
};

