/**
 * Migration: Add order_index to active_components table
 * Date: 2025-12-03
 * Purpose: Add order_index column to active_components to support component ordering
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('active_components');
    
    if (!tableDescription.order_index) {
      await queryInterface.addColumn('active_components', 'order_index', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order in which components should be displayed'
      });
      
      console.log('✅ Added order_index column to active_components table');
    } else {
      console.log('ℹ️  order_index column already exists in active_components, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('active_components');
    
    if (tableDescription.order_index) {
      await queryInterface.removeColumn('active_components', 'order_index');
      console.log('✅ Removed order_index column from active_components table');
    } else {
      console.log('ℹ️  order_index column does not exist in active_components, skipping');
    }
  }
};








