/**
 * Migration: Rename particle_required to component_required on block_instances
 * Date: 2025-11-30
 * Purpose: Rename column from particle_required to component_required to match codebase terminology
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if column already exists
    // NOTE: describeTable returns camelCase keys (particleRequired, componentRequired)
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // If particleRequired exists and componentRequired doesn't, rename it
    if (tableDescription.particleRequired && !tableDescription.componentRequired) {
      await queryInterface.renameColumn('block_instances', 'particle_required', 'component_required');
      console.log('✅ Renamed particle_required column to component_required on block_instances');
    } else if (tableDescription.componentRequired) {
      // componentRequired already exists, do nothing
      console.log('ℹ️  Column block_instances.component_required already exists, skipping');
    } else if (!tableDescription.particleRequired && !tableDescription.componentRequired) {
      // Neither exists, add component_required
      await queryInterface.addColumn('block_instances', 'component_required', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      console.log('✅ Added component_required column to block_instances table');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check current state
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    // If componentRequired exists, rename it back to particle_required
    // NOTE: describeTable returns camelCase keys
    if (tableDescription.componentRequired && !tableDescription.particleRequired) {
      await queryInterface.renameColumn('block_instances', 'component_required', 'particle_required');
      console.log('✅ Renamed component_required column back to particle_required on block_instances');
    } else if (tableDescription.componentRequired && tableDescription.particleRequired) {
      // Both exist (shouldn't happen), remove component_required
      await queryInterface.removeColumn('block_instances', 'component_required');
      console.log('✅ Removed component_required column from block_instances table');
    } else if (!tableDescription.componentRequired && tableDescription.particleRequired) {
      // particle_required exists but component_required doesn't, do nothing (already in desired state)
      console.log('ℹ️  Column block_instances.particle_required already exists, no change needed');
    } else {
      // Neither exists, remove component_required if it somehow exists
      await queryInterface.removeColumn('block_instances', 'component_required');
      console.log('✅ Removed component_required column from block_instances table');
    }
  }
};

