/**
 * Migration: Remove number column from block_instances
 * Purpose: Remove number field as quantities are stored in appointment records, not on block instances
 * Date: 2026-01-09
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    if (tableDescription.number) {
      await queryInterface.removeColumn('block_instances', 'number');
      console.log('✅ Removed number column from block_instances table');
    } else {
      console.log('ℹ️  Column block_instances.number does not exist, skipping removal');
    }
  },

  async down(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    if (!tableDescription.number) {
      // Re-add number column (nullable integer)
      await queryInterface.addColumn('block_instances', 'number', {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'number',
        comment: 'Optional quantity/multiplier for this block instance (deprecated - use appointment quantities instead)'
      });
      console.log('✅ Re-added number column to block_instances table');
    } else {
      console.log('ℹ️  Column block_instances.number already exists, skipping rollback');
    }
  }
};

