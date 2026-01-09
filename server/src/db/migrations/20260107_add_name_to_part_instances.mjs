/**
 * Migration: Add name column to part_instances table
 * Date: 2026-01-07
 * Purpose: Allow PartInstances to have a custom name for better identification
 * The name is auto-generated on the client as "BlockInstanceName-PartShapeName" format
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('part_instances');
    
    // Check if name column already exists
    if (tableDescription.name) {
      console.log('ℹ️  Column part_instances.name already exists, skipping migration');
      return;
    }
    
    // Add the name column
    await queryInterface.addColumn('part_instances', 'name', {
      type: Sequelize.STRING(255),
      allowNull: true,
      field: 'name'
    });
    
    console.log('✅ Added name column to part_instances table');
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('part_instances');
    
    // Check if name column exists
    if (tableDescription.name) {
      await queryInterface.removeColumn('part_instances', 'name');
      console.log('✅ Removed name column from part_instances table');
    } else {
      console.log('ℹ️  Column part_instances.name does not exist, skipping rollback');
    }
  }
};
