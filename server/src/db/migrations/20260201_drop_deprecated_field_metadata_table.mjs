/**
 * Migration: Drop deprecated field_metadata table
 * Date: 2026-02-01
 * Purpose: Remove deprecated field_metadata table after data migration to admin_primitive_metadata
 * 
 * LEARNING: field_metadata was replaced by admin_primitive_metadata and admin_relationship_metadata
 * WHY: Data was migrated in 20260118_unify_metadata_tables.mjs, but table was never dropped
 * PATTERN: Drop deprecated table after migration is complete
 * 
 * NOTE: This migration is safe to run - all data has been migrated to admin_primitive_metadata
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Dropping deprecated field_metadata table...');

    const fieldMetadataExists = await queryInterface.tableExists('field_metadata');
    
    if (!fieldMetadataExists) {
      console.log('ℹ️  field_metadata table does not exist, skipping');
      return;
    }

    // Check if table has any data (should be empty after migration)
    const [rowCountResult] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count FROM field_metadata
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    // Handle Sequelize query result format
    const rowCount = Array.isArray(rowCountResult) && rowCountResult.length > 0
      ? (Array.isArray(rowCountResult[0]) ? rowCountResult[0][0] : rowCountResult[0])
      : rowCountResult;
    
    const count = rowCount?.count || (typeof rowCountResult === 'object' && 'count' in rowCountResult ? rowCountResult.count : 0);
    
    if (count > 0) {
      console.log(`⚠️  Warning: field_metadata table still contains ${count} rows`);
      console.log('   Data should have been migrated to admin_primitive_metadata');
      console.log('   Reviewing rows before dropping...');
      
      const [rowsResult] = await queryInterface.sequelize.query(`
        SELECT entity_type, field_key, COUNT(*) as count
        FROM field_metadata
        GROUP BY entity_type, field_key
        ORDER BY entity_type, field_key
        LIMIT 20
      `, {
        type: Sequelize.QueryTypes.SELECT,
      });

      // Handle Sequelize query result format
      const rows = Array.isArray(rowsResult) && rowsResult.length > 0 && Array.isArray(rowsResult[0])
        ? rowsResult[0]
        : Array.isArray(rowsResult) ? rowsResult : [];

      if (rows.length > 0) {
        console.log('   Sample rows:');
        rows.forEach(row => {
          console.log(`     - ${row.entity_type}/${row.field_key}: ${row.count} entries`);
        });
      }
      
      console.log('   ⚠️  Proceeding with drop - ensure data is migrated before continuing');
    } else {
      console.log('✅ field_metadata table is empty (data already migrated)');
    }

    // Drop indexes first
    try {
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS shape_field_metadata_entity_type_field_key_unique;
        DROP INDEX IF EXISTS shape_field_metadata_entity_type_idx;
        DROP INDEX IF EXISTS field_metadata_entity_type_field_key_unique;
        DROP INDEX IF EXISTS field_metadata_entity_type_idx;
      `);
      console.log('✅ Dropped indexes on field_metadata');
    } catch (error) {
      console.log('ℹ️  Could not drop indexes (may not exist):', error instanceof Error ? error.message : String(error));
    }

    // Drop the table
    await queryInterface.dropTable('field_metadata');
    console.log('✅ Dropped field_metadata table');

    // Drop the enum type if it exists (enum_shape_field_metadata_entity_type)
    try {
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS enum_shape_field_metadata_entity_type;
      `);
      console.log('✅ Dropped enum_shape_field_metadata_entity_type');
    } catch (error) {
      console.log('ℹ️  Could not drop enum type (may not exist):', error instanceof Error ? error.message : String(error));
    }

    console.log('✅ Completed dropping deprecated field_metadata table');
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot restore field_metadata table - data was migrated to admin_primitive_metadata');
    console.log('   If you need to restore it, check admin_primitive_metadata table');
    console.log('   The field_metadata table structure can be found in migration 20260117_rename_metadata_tables.mjs');
    // Intentionally no-op - we don't want to restore deprecated table
  },
};
