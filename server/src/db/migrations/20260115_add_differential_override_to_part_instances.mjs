/**
 * Migration: Add differential_override Column to part_instances Table
 * Purpose: Add differentialOverride boolean field to part_instances table
 *   - part_instances: Add differential_override column (nullable, default null)
 *   - When true, forces non-differential UI behavior regardless of service's differential setting
 * Date: 2026-01-15
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const partInstancesDescription = await queryInterface.describeTable('part_instances');
    
    if (!partInstancesDescription.differential_override) {
      await queryInterface.addColumn('part_instances', 'differential_override', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      });
      console.log('✅ Added differential_override column to part_instances');
    } else {
      console.log('ℹ️  Column part_instances.differential_override already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('part_instances', 'differential_override');
      console.log('✅ Removed differential_override column from part_instances');
    } catch (error) {
      console.log('ℹ️  Error removing differential_override column:', error.message);
    }
  }
};
