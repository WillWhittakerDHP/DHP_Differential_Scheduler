/**
 * Migration: Remove allow_multiple_parts column from block_shapes
 * Purpose: Remove deprecated allow_multiple_parts column that is no longer needed
 * Date: 2026-01-08
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    if (tableDescription.allow_multiple_parts) {
      // First, set a default value for existing rows if needed, then drop NOT NULL constraint
      await queryInterface.sequelize.query(`
        UPDATE block_shapes 
        SET allow_multiple_parts = false 
        WHERE allow_multiple_parts IS NULL;
      `);
      
      // Drop the NOT NULL constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE block_shapes 
        ALTER COLUMN allow_multiple_parts DROP NOT NULL;
      `);
      
      // Then remove the column
      await queryInterface.removeColumn('block_shapes', 'allow_multiple_parts');
      console.log('✅ Removed allow_multiple_parts column from block_shapes table');
    } else {
      console.log('ℹ️  Column block_shapes.allow_multiple_parts does not exist, skipping migration');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    if (!tableDescription.allow_multiple_parts) {
      await queryInterface.addColumn('block_shapes', 'allow_multiple_parts', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      console.log('✅ Restored allow_multiple_parts column to block_shapes table');
    } else {
      console.log('ℹ️  Column block_shapes.allow_multiple_parts already exists, skipping rollback');
    }
  }
};

