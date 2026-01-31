/**
 * Migration: Remove boolean/ternary columns from part_instances table
 * Date: 2026-01-30
 * Purpose: 
 * - Remove on_site, moveable, client_present columns from part_instances table
 * - These flags are now managed via ActiveEvent relationships
 * 
 * LEARNING: This migration should be run AFTER data migration and code updates are complete
 * WHY: Keeps migration reversible for safety during transition period
 * PATTERN: Column removal migration following additive-first migration strategy
 * 
 * IMPORTANT: Run this migration ONLY after:
 * 1. Event tables are created
 * 2. Data is migrated to ActiveEvent relationships
 * 3. Transformer code is updated to use ActiveEvent relationships
 * 4. All tests are passing with ActiveEvent relationships
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting removal of boolean columns from part_instances...');

    // Check if part_instances table exists
    const partInstancesExists = await queryInterface.tableExists('part_instances');
    if (!partInstancesExists) {
      console.log('⚠️  part_instances table does not exist, skipping column removal');
      return;
    }

    // Check if columns exist before attempting to remove
    const tableDescription = await queryInterface.describeTable('part_instances');
    
    // Remove on_site column
    if (tableDescription.on_site) {
      console.log('📝 Removing on_site column...');
      await queryInterface.removeColumn('part_instances', 'on_site');
      console.log('   ✅ on_site column removed');
    } else {
      console.log('ℹ️  on_site column does not exist, skipping');
    }

    // Remove client_present column
    if (tableDescription.client_present) {
      console.log('📝 Removing client_present column...');
      await queryInterface.removeColumn('part_instances', 'client_present');
      console.log('   ✅ client_present column removed');
    } else {
      console.log('ℹ️  client_present column does not exist, skipping');
    }

    // Remove moveable column
    if (tableDescription.moveable) {
      console.log('📝 Removing moveable column...');
      await queryInterface.removeColumn('part_instances', 'moveable');
      console.log('   ✅ moveable column removed');
    } else {
      console.log('ℹ️  moveable column does not exist, skipping');
    }

    // Drop enum type if it exists and is no longer used
    try {
      // Check if enum is still used by other tables
      const enumCheck = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'enum_part_instances_on_site'
      `);
      
      // If enum exists but is not used, we could drop it, but Sequelize manages enum types
      // So we'll leave it for now - Sequelize will handle cleanup if needed
      console.log('   ℹ️  Enum types are managed by Sequelize, leaving for automatic cleanup');
    } catch (e) {
      console.log('   ℹ️  Error checking enum types (this is okay)');
    }

    console.log('✅ Boolean columns removal migration completed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting boolean columns removal...');

    // Check if part_instances table exists
    const partInstancesExists = await queryInterface.tableExists('part_instances');
    if (!partInstancesExists) {
      console.log('⚠️  part_instances table does not exist, skipping column restoration');
      return;
    }

    const tableDescription = await queryInterface.describeTable('part_instances');

    // Restore on_site column
    if (!tableDescription.on_site) {
      console.log('📝 Restoring on_site column...');
      await queryInterface.addColumn('part_instances', 'on_site', {
        type: Sequelize.ENUM('true', 'false', 'override'),
        allowNull: false,
        defaultValue: 'false'
      });
      console.log('   ✅ on_site column restored');
    }

    // Restore client_present column
    if (!tableDescription.client_present) {
      console.log('📝 Restoring client_present column...');
      await queryInterface.addColumn('part_instances', 'client_present', {
        type: Sequelize.ENUM('true', 'false', 'override'),
        allowNull: false,
        defaultValue: 'false'
      });
      console.log('   ✅ client_present column restored');
    }

    // Restore moveable column
    if (!tableDescription.moveable) {
      console.log('📝 Restoring moveable column...');
      await queryInterface.addColumn('part_instances', 'moveable', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
      console.log('   ✅ moveable column restored');
    }

    console.log('✅ Boolean columns removal migration reverted');
    console.log('⚠️  NOTE: Data will need to be restored from ActiveEvent relationships');
  },
};
