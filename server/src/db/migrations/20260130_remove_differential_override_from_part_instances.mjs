/**
 * Migration: Remove differential_override Column from part_instances Table
 * Purpose: Remove differentialOverride column from part_instances table
 *          This column is no longer needed as override is handled at blockInstance level
 * Date: 2026-01-30
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing differential_override column from part_instances...');

    const partInstancesDescription = await queryInterface.describeTable('part_instances');
    
    if (partInstancesDescription.differential_override) {
      await queryInterface.removeColumn('part_instances', 'differential_override');
      console.log('✅ Removed differential_override column from part_instances');
    } else {
      console.log('ℹ️  Column part_instances.differential_override does not exist, skipping');
    }

    // Remove metadata entry for differentialOverride field
    try {
      await queryInterface.sequelize.query(`
        DELETE FROM admin_metadata
        WHERE entity_type = 'partInstance'
          AND field_key = 'differentialOverride';
      `);
      console.log('✅ Removed differentialOverride metadata entry');
    } catch (error) {
      console.log('ℹ️  Error removing metadata entry (may not exist):', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Restoring differential_override column...');

    const partInstancesDescription = await queryInterface.describeTable('part_instances');
    
    if (!partInstancesDescription.differential_override) {
      await queryInterface.addColumn('part_instances', 'differential_override', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      });
      console.log('✅ Restored differential_override column to part_instances');
    } else {
      console.log('ℹ️  Column part_instances.differential_override already exists, skipping');
    }
  }
};
