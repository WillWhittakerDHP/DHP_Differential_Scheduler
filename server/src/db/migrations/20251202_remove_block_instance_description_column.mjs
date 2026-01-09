/**
 * Migration: Remove deprecated description column from block_instances
 * Date: 2025-12-02
 * Purpose: Remove the single `description` string column from block_instances table
 * 
 * LEARNING: This migration removes the deprecated description column that has been
 * replaced by the annotations system (via annotation_assignments through-table).
 * 
 * WHY: 
 * - The description column is deprecated and replaced by the annotation system
 * - Removing it prevents confusion and ensures all descriptions go through annotations
 * - Data has already been migrated to annotations system (via previous migration)
 * 
 * PATTERN: Simple column removal migration
 * 
 * NOTE: This migration should run AFTER the descriptions → annotations migration
 * to ensure all data has been migrated first.
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const blockInstancesExists = await queryInterface.tableExists('block_instances');
    
    if (!blockInstancesExists) {
      console.log('⚠️  block_instances table does not exist, skipping');
      return;
    }

    // Check if description column exists
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    if (tableDescription.description) {
      console.log('📝 Removing deprecated description column from block_instances...');
      
      // Verify that data has been migrated (check if annotation_assignments table exists)
      const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
      if (!annotationAssignmentsExists) {
        console.log('⚠️  Warning: annotation_assignments table does not exist.');
        console.log('   This migration should run AFTER the descriptions → annotations migration.');
        console.log('   Skipping column removal to prevent data loss.');
        return;
      }

      // Check if there are any non-empty descriptions that haven't been migrated
      const [unmigratedDescriptions] = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count
        FROM block_instances bi
        WHERE bi.description IS NOT NULL 
          AND bi.description != ''
          AND bi.description != ' '
          AND bi.id NOT IN (
            SELECT DISTINCT block_instance_id 
            FROM annotation_assignments
          )
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      if (unmigratedDescriptions.count > 0) {
        console.log(`⚠️  Warning: Found ${unmigratedDescriptions.count} block instances with descriptions that haven't been migrated.`);
        console.log('   Please run the migrate_description_to_descriptions migration first.');
        console.log('   Skipping column removal to prevent data loss.');
        return;
      }

      // Remove the column
      await queryInterface.removeColumn('block_instances', 'description');
      console.log('   ✅ Description column removed');
      console.log('✅ Migration complete!');
    } else {
      console.log('ℹ️  description column does not exist in block_instances, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const blockInstancesExists = await queryInterface.tableExists('block_instances');
    
    if (!blockInstancesExists) {
      console.log('⚠️  block_instances table does not exist, skipping');
      return;
    }

    // Check if description column exists
    const tableDescription = await queryInterface.describeTable('block_instances');
    
    if (!tableDescription.description) {
      console.log('📝 Restoring description column to block_instances...');
      
      // Add the column back (nullable, as we can't restore the original values)
      await queryInterface.addColumn('block_instances', 'description', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      
      console.log('   ✅ Description column restored (values will be NULL)');
      console.log('   ⚠️  Note: Original description values cannot be restored from annotations');
      console.log('✅ Rollback complete!');
    } else {
      console.log('ℹ️  description column already exists in block_instances, skipping');
    }
  }
};

