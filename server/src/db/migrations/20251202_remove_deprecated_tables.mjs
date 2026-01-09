/**
 * Migration: Remove deprecated tables
 * Date: 2025-12-02
 * Purpose: Remove tables that should have been deleted:
 * - pooled_instances (deprecated, replaced by entity_pools/composers)
 * - entity_property_mappings (deprecated property system)
 * - active_compositions (deprecated composition system)
 * - valid_compositions (deprecated composition system)
 * 
 * LEARNING: These tables were created by earlier migrations but are no longer needed
 * WHY: Architecture changed - these tables represent old patterns that have been replaced
 * PATTERN: Drop tables that are no longer part of the current architecture
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing deprecated tables...');

    // 1. Drop pooled_instances table
    const pooledInstancesExists = await queryInterface.tableExists('pooled_instances');
    if (pooledInstancesExists) {
      // Remove indexes first
      try {
        await queryInterface.removeIndex('pooled_instances', 'idx_pool_master');
      } catch (error) {
        console.log('ℹ️  Index idx_pool_master does not exist, skipping');
      }
      
      try {
        await queryInterface.removeIndex('pooled_instances', 'idx_pool_member');
      } catch (error) {
        console.log('ℹ️  Index idx_pool_member does not exist, skipping');
      }
      
      try {
        await queryInterface.removeIndex('pooled_instances', 'idx_entity_type');
      } catch (error) {
        console.log('ℹ️  Index idx_entity_type does not exist, skipping');
      }
      
      // Remove constraint
      try {
        await queryInterface.removeConstraint('pooled_instances', 'unique_pool_membership');
      } catch (error) {
        console.log('ℹ️  Constraint unique_pool_membership does not exist, skipping');
      }
      
      await queryInterface.dropTable('pooled_instances');
      console.log('✅ Dropped pooled_instances table');
    } else {
      console.log('ℹ️  Table pooled_instances does not exist, skipping');
    }

    // 2. Drop entity_property_mappings table
    const entityPropertyMappingsExists = await queryInterface.tableExists('entity_property_mappings');
    if (entityPropertyMappingsExists) {
      await queryInterface.dropTable('entity_property_mappings');
      console.log('✅ Dropped entity_property_mappings table');
    } else {
      console.log('ℹ️  Table entity_property_mappings does not exist, skipping');
    }

    // 3. Drop active_compositions table
    const activeCompositionsExists = await queryInterface.tableExists('active_compositions');
    if (activeCompositionsExists) {
      await queryInterface.dropTable('active_compositions');
      console.log('✅ Dropped active_compositions table');
    } else {
      console.log('ℹ️  Table active_compositions does not exist, skipping');
    }

    // 4. Drop valid_compositions table
    const validCompositionsExists = await queryInterface.tableExists('valid_compositions');
    if (validCompositionsExists) {
      // Remove indexes first
      try {
        await queryInterface.removeIndex('valid_compositions', 'valid_compositions_parent_shape_id_idx');
      } catch (error) {
        console.log('ℹ️  Index valid_compositions_parent_shape_id_idx does not exist, skipping');
      }
      
      try {
        await queryInterface.removeIndex('valid_compositions', 'valid_compositions_child_shape_id_idx');
      } catch (error) {
        console.log('ℹ️  Index valid_compositions_child_shape_id_idx does not exist, skipping');
      }
      
      try {
        await queryInterface.removeIndex('valid_compositions', 'valid_compositions_shape_kind_idx');
      } catch (error) {
        console.log('ℹ️  Index valid_compositions_shape_kind_idx does not exist, skipping');
      }
      
      try {
        await queryInterface.removeIndex('valid_compositions', 'unique_parent_child_shape');
      } catch (error) {
        console.log('ℹ️  Index unique_parent_child_shape does not exist, skipping');
      }
      
      await queryInterface.dropTable('valid_compositions');
      console.log('✅ Dropped valid_compositions table');
    } else {
      console.log('ℹ️  Table valid_compositions does not exist, skipping');
    }

    console.log('✅ All deprecated tables removed successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Rolling back deprecated table removal...');
    console.log('⚠️  WARNING: This will recreate tables but data will be lost!');
    
    // Note: We're not recreating these tables in the down migration
    // because they're deprecated and shouldn't exist
    // If rollback is needed, the original creation migrations can be re-run
    
    console.log('ℹ️  Down migration skipped - tables are deprecated and should not be recreated');
  }
};

