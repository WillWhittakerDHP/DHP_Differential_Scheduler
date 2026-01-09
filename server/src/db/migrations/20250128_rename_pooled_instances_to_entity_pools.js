/**
 * Migration: Rename pooled_instances table to entity_pools and update column names
 * Date: 2025-01-28
 * Purpose: Rename pooling terminology to use "coordinator" instead of "master"
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if pooled_instances table exists
    const tableExists = await queryInterface.tableExists('pooled_instances');
    
    if (tableExists) {
      // Rename table
      await queryInterface.renameTable('pooled_instances', 'entity_pools');
      
      // Rename columns
      await queryInterface.renameColumn('entity_pools', 'pool_master_id', 'pool_coordinator_id');
      await queryInterface.renameColumn('entity_pools', 'pool_member_id', 'member_id');
      
      // Remove old indexes
      try {
        await queryInterface.removeIndex('entity_pools', 'idx_pool_master');
      } catch (error) {
        // Index might not exist, ignore
      }
      
      try {
        await queryInterface.removeIndex('entity_pools', 'idx_pool_member');
      } catch (error) {
        // Index might not exist, ignore
      }
      
      // Create new indexes with new column names
      await queryInterface.addIndex('entity_pools', ['pool_coordinator_id'], {
        name: 'idx_pool_coordinator',
      });
      
      await queryInterface.addIndex('entity_pools', ['member_id'], {
        name: 'idx_member',
      });
      
      // Update unique constraint to use new column names
      try {
        await queryInterface.removeConstraint('entity_pools', 'unique_pool_membership');
      } catch (error) {
        // Constraint might not exist, ignore
      }
      
      await queryInterface.addConstraint('entity_pools', {
        fields: ['pool_coordinator_id', 'member_id'],
        type: 'unique',
        name: 'unique_pool_membership',
      });
      
      console.log('✅ Renamed pooled_instances table to entity_pools and updated column names');
    } else {
      console.log('ℹ️  Table pooled_instances does not exist, skipping rename');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if entity_pools table exists
    const tableExists = await queryInterface.tableExists('entity_pools');
    
    if (tableExists) {
      // Remove indexes
      try {
        await queryInterface.removeIndex('entity_pools', 'idx_pool_coordinator');
      } catch (error) {
        // Ignore
      }
      
      try {
        await queryInterface.removeIndex('entity_pools', 'idx_member');
      } catch (error) {
        // Ignore
      }
      
      // Remove constraint
      try {
        await queryInterface.removeConstraint('entity_pools', 'unique_pool_membership');
      } catch (error) {
        // Ignore
      }
      
      // Rename columns back
      await queryInterface.renameColumn('entity_pools', 'pool_coordinator_id', 'pool_master_id');
      await queryInterface.renameColumn('entity_pools', 'member_id', 'pool_member_id');
      
      // Rename table back
      await queryInterface.renameTable('entity_pools', 'pooled_instances');
      
      // Recreate old indexes
      await queryInterface.addIndex('pooled_instances', ['pool_master_id'], {
        name: 'idx_pool_master',
      });
      
      await queryInterface.addIndex('pooled_instances', ['pool_member_id'], {
        name: 'idx_pool_member',
      });
      
      // Recreate constraint
      await queryInterface.addConstraint('pooled_instances', {
        fields: ['pool_master_id', 'pool_member_id'],
        type: 'unique',
        name: 'unique_pool_membership',
      });
      
      console.log('✅ Reverted entity_pools table back to pooled_instances');
    } else {
      console.log('ℹ️  Table entity_pools does not exist, skipping revert');
    }
  }
};

