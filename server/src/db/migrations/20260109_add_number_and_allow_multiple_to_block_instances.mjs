/**
 * Migration: Add number and allow_multiple columns to block_instances
 * Purpose: Add support for quantity/multiplier and allowMultiple flag for fee calculations
 * Date: 2026-01-09
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    
    // Add number column (nullable integer)
    await queryInterface.addColumn('block_instances', 'number', {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'number',
      comment: 'Optional quantity/multiplier for this block instance (used when allow_multiple is true)'
    });
    
    // Add allow_multiple column (boolean, default false)
    await queryInterface.addColumn('block_instances', 'allow_multiple', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'allow_multiple',
      comment: 'Whether this block instance can be multiplied by ADU count or number'
    });
    
    console.log('✅ Added number and allow_multiple columns to block_instances table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    if (tableDescription.number) {
      await queryInterface.removeColumn('block_instances', 'number');
      console.log('✅ Removed number column from block_instances table');
    } else {
      console.log('ℹ️  Column block_instances.number does not exist, skipping rollback');
    }
    
    if (tableDescription.allow_multiple) {
      await queryInterface.removeColumn('block_instances', 'allow_multiple');
      console.log('✅ Removed allow_multiple column from block_instances table');
    } else {
      console.log('ℹ️  Column block_instances.allow_multiple does not exist, skipping rollback');
    }
  }
};

