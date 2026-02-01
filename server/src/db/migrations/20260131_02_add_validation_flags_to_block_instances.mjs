/**
 * Migration: Add validation flags to block_instances
 * Date: 2026-01-31
 * Purpose: Add is_multi_family and requires_agent flags to block_instances table
 * 
 * LEARNING: Validation flags on block_instances for fast common checks (follows requiresUnitNumber pattern)
 * WHY: Replaces hardcoded name checks (name.includes('multi')) with database flags
 * PATTERN: Boolean flags for common validation rules, business_rules table for complex rules
 * 
 * Flags:
 * - is_multi_family: Property type is multi-family (requires numberOfUnits field)
 * - requires_agent: Service requires agent/client contact information
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('block_instances');
    
    // Add is_multi_family column if it doesn't exist
    if (!tableInfo.is_multi_family) {
      await queryInterface.addColumn('block_instances', 'is_multi_family', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Property type is multi-family (requires numberOfUnits field)',
      });
      console.log('✅ Added is_multi_family column to block_instances');
      
      // Update existing blocks: set is_multi_family=true for blocks with "multi" or "duplex" in name
      await queryInterface.sequelize.query(`
        UPDATE block_instances 
        SET is_multi_family = true 
        WHERE LOWER(name) LIKE '%multi%' 
           OR LOWER(name) LIKE '%duplex%'
      `);
      console.log('✅ Updated existing blocks with is_multi_family flag');
    } else {
      console.log('ℹ️  Column is_multi_family already exists, skipping');
    }

    // Add requires_agent column if it doesn't exist
    if (!tableInfo.requires_agent) {
      await queryInterface.addColumn('block_instances', 'requires_agent', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Service requires agent/client contact information',
      });
      console.log('✅ Added requires_agent column to block_instances');
      
      // Note: Not auto-updating requires_agent - will be set via seed script based on business rules
      console.log('ℹ️  requires_agent flags will be set via seed script');
    } else {
      console.log('ℹ️  Column requires_agent already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('block_instances');
    
    // Remove is_multi_family column if it exists
    if (tableInfo.is_multi_family) {
      await queryInterface.removeColumn('block_instances', 'is_multi_family');
      console.log('✅ Removed is_multi_family column from block_instances');
    }

    // Remove requires_agent column if it exists
    if (tableInfo.requires_agent) {
      await queryInterface.removeColumn('block_instances', 'requires_agent');
      console.log('✅ Removed requires_agent column from block_instances');
    }
  }
};
