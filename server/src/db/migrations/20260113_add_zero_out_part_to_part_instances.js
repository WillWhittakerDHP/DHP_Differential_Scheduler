/**
 * Migration: Add zero_out_part Column to part_instances Table
 * Purpose: Add zeroOutPart boolean field to part_instances table
 *   - part_instances: Add zero_out_part column with default false
 * Date: 2026-01-13
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const partInstancesDescription = await queryInterface.describeTable('part_instances');
    
    if (!partInstancesDescription.zero_out_part) {
      await queryInterface.addColumn('part_instances', 'zero_out_part', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      console.log('✅ Added zero_out_part column to part_instances');
    } else {
      console.log('ℹ️  Column part_instances.zero_out_part already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('part_instances', 'zero_out_part');
      console.log('✅ Removed zero_out_part column from part_instances');
    } catch (error) {
      console.log('ℹ️  Error removing zero_out_part column:', error.message);
    }
  }
};
