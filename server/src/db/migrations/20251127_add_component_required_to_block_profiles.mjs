/**
 * Migration: Add particle_required column to block_profiles
 * Date: 2025-11-27
 * Purpose: Add particleRequired boolean property to BlockProfile to mark entities that must always be particles (aggregated entities)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check which table exists (block_profiles was renamed to block_instances)
    const blockProfilesExists = await queryInterface.tableExists('block_profiles');
    const blockInstancesExists = await queryInterface.tableExists('block_instances');
    const tableName = blockProfilesExists ? 'block_profiles' : (blockInstancesExists ? 'block_instances' : null);
    
    if (!tableName) {
      console.log('ℹ️  Table block_profiles/block_instances does not exist, skipping');
      return;
    }
    
    // Check if column already exists (may have been created as component_required)
    const tableDescription = await queryInterface.describeTable(tableName);
    
    // If component_required exists, rename it to particle_required (but actually it's component_required now)
    // Note: This migration adds component_required, which was later renamed to component_required
    // So we check for both particle_required and component_required
    if (tableDescription.component_required && !tableDescription.particle_required) {
      // component_required already exists, which is what we want (it was renamed from particle_required)
      console.log(`ℹ️  Column ${tableName}.component_required already exists (correct name), skipping`);
    } else if (!tableDescription.component_required && !tableDescription.particle_required) {
      // Add component_required column (the current name)
      await queryInterface.addColumn(tableName, 'component_required', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      
      console.log(`✅ Added component_required column to ${tableName} table`);
    } else if (tableDescription.particle_required && !tableDescription.component_required) {
      // Rename particle_required to component_required
      await queryInterface.renameColumn(tableName, 'particle_required', 'component_required');
      console.log(`✅ Renamed particle_required column to component_required in ${tableName}`);
    } else {
      console.log(`ℹ️  Column ${tableName}.component_required already exists, skipping`);
    }
  },

  async down(queryInterface, Sequelize) {
    // Check which table exists
    const blockProfilesExists = await queryInterface.tableExists('block_profiles');
    const blockInstancesExists = await queryInterface.tableExists('block_instances');
    const tableName = blockProfilesExists ? 'block_profiles' : (blockInstancesExists ? 'block_instances' : null);
    
    if (!tableName) {
      console.log('ℹ️  Table block_profiles/block_instances does not exist, skipping');
      return;
    }
    
    // Remove component_required column
    try {
      await queryInterface.removeColumn(tableName, 'component_required');
      console.log(`✅ Removed component_required column from ${tableName} table`);
    } catch (error) {
      // Try removing particle_required if component_required doesn't exist
      try {
        await queryInterface.removeColumn(tableName, 'particle_required');
        console.log(`✅ Removed particle_required column from ${tableName} table`);
      } catch (error2) {
        console.log(`ℹ️  Column not found, skipping removal`);
      }
    }
  }
};

