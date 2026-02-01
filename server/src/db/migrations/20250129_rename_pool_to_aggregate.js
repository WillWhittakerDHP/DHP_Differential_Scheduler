/**
 * Migration: Rename entity_pools table to entity_aggregates and update column names
 * Date: 2025-01-29
 * Purpose: Migrate from pool/coordinator/member terminology to aggregate/particle terminology
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('entity_pools');
    
    if (tableExists) {
      await queryInterface.renameTable('entity_pools', 'entity_aggregates');
      
      await queryInterface.renameColumn('entity_aggregates', 'pool_coordinator_id', 'aggregate_id');
      await queryInterface.renameColumn('entity_aggregates', 'member_id', 'particle_id');
      
      try {
        await queryInterface.removeIndex('entity_aggregates', 'idx_pool_coordinator');
      } catch (error) {
      }
      
      try {
        await queryInterface.removeIndex('entity_aggregates', 'idx_member');
      } catch (error) {
      }
      
      await queryInterface.addIndex('entity_aggregates', ['aggregate_id'], {
        name: 'idx_aggregate',
      });
      
      await queryInterface.addIndex('entity_aggregates', ['particle_id'], {
        name: 'idx_particle',
      });
      
      // Update unique constraint to use new column names
      try {
        await queryInterface.removeConstraint('entity_aggregates', 'unique_pool_membership');
      } catch (error) {
        // Constraint might not exist, ignore
      }
      
      await queryInterface.addConstraint('entity_aggregates', {
        fields: ['aggregate_id', 'particle_id'],
        type: 'unique',
        name: 'unique_aggregate_particle',
      });
      
      console.log('✅ Renamed entity_pools table to entity_aggregates and updated column names');
    } else {
      console.log('ℹ️  Table entity_pools does not exist, skipping rename');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('entity_aggregates');
    
    if (tableExists) {
      try {
        await queryInterface.removeIndex('entity_aggregates', 'idx_aggregate');
      } catch (error) {
      }
      
      try {
        await queryInterface.removeIndex('entity_aggregates', 'idx_particle');
      } catch (error) {
      }
      
      try {
        await queryInterface.removeConstraint('entity_aggregates', 'unique_aggregate_particle');
      } catch (error) {
      }
      
      await queryInterface.renameColumn('entity_aggregates', 'aggregate_id', 'pool_coordinator_id');
      await queryInterface.renameColumn('entity_aggregates', 'particle_id', 'member_id');
      
      await queryInterface.renameTable('entity_aggregates', 'entity_pools');
      
      await queryInterface.addIndex('entity_pools', ['pool_coordinator_id'], {
        name: 'idx_pool_coordinator',
      });
      
      await queryInterface.addIndex('entity_pools', ['member_id'], {
        name: 'idx_member',
      });
      
      await queryInterface.addConstraint('entity_pools', {
        fields: ['pool_coordinator_id', 'member_id'],
        type: 'unique',
        name: 'unique_pool_membership',
      });
      
      console.log('✅ Reverted entity_aggregates table back to entity_pools');
    } else {
      console.log('ℹ️  Table entity_aggregates does not exist, skipping revert');
    }
  }
};

