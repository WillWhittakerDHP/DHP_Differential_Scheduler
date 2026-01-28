/**
 * Migration: Migrate data to unified admin_metadata table
 * Date: 2026-02-02
 * Purpose: Copy all data from admin_primitive_metadata and admin_relationship_metadata to unified admin_metadata table
 * 
 * LEARNING: Migrate both tables to unified structure
 * WHY: Consolidate metadata into single table with discriminator
 * PATTERN: Copy all rows with appropriate metadata_type discriminator
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting data migration to unified admin_metadata table...');

    // Check if unified table exists
    const unifiedTableExists = await queryInterface.tableExists('admin_metadata');
    if (!unifiedTableExists) {
      throw new Error('admin_metadata table must exist before migrating data. Run create_unified_admin_metadata_table migration first.');
    }

    // Check if data already migrated (idempotent)
    const [existingCount] = await queryInterface.sequelize.query(`
      SELECT COUNT(*)::int as count FROM admin_metadata;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (existingCount && existingCount.count > 0) {
      console.log(`ℹ️  admin_metadata table already has ${existingCount.count} rows, skipping data migration`);
      return;
    }

    // Migrate primitive metadata
    const [primitiveRows] = await queryInterface.sequelize.query(`
      SELECT 
        id,
        entity_type,
        entity_id,
        field_key,
        data_type,
        label,
        is_required,
        visibility,
        layout,
        display_order,
        section,
        render_as,
        status_button_color,
        panel,
        bulk_edit,
        input_config,
        inherits_from_entity_type,
        inherits_from_entity_id,
        created_at,
        updated_at
      FROM admin_primitive_metadata;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (Array.isArray(primitiveRows) && primitiveRows.length > 0) {
      console.log(`📋 Found ${primitiveRows.length} primitive metadata entries to migrate`);
      
      const primitiveInserts = primitiveRows.map(row => ({
        id: row.id,
        metadata_type: 'primitive',
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        field_key: row.field_key,
        data_type: row.data_type,
        label: row.label,
        is_required: row.is_required,
        visibility: row.visibility,
        layout: row.layout,
        display_order: row.display_order,
        section: row.section,
        render_as: row.render_as,
        status_button_color: row.status_button_color,
        panel: row.panel,
        bulk_edit: row.bulk_edit,
        input_config: row.input_config,
        inherits_from_entity_type: row.inherits_from_entity_type,
        inherits_from_entity_id: row.inherits_from_entity_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      await queryInterface.bulkInsert('admin_metadata', primitiveInserts);
      console.log(`✅ Migrated ${primitiveInserts.length} primitive metadata entries`);
    } else {
      console.log('ℹ️  No primitive metadata entries found to migrate');
    }

    // Migrate relationship metadata
    const [relationshipRows] = await queryInterface.sequelize.query(`
      SELECT 
        id,
        entity_type,
        entity_id,
        relationship_key,
        data_type,
        label,
        is_required,
        visibility,
        layout,
        display_order,
        section,
        render_as,
        status_button_color,
        panel,
        bulk_edit,
        input_config,
        inherits_from_entity_type,
        inherits_from_entity_id,
        created_at,
        updated_at
      FROM admin_relationship_metadata;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (Array.isArray(relationshipRows) && relationshipRows.length > 0) {
      console.log(`📋 Found ${relationshipRows.length} relationship metadata entries to migrate`);
      
      const relationshipInserts = relationshipRows.map(row => ({
        id: row.id,
        metadata_type: 'relationship',
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        field_key: row.relationship_key, // Map relationship_key to field_key
        data_type: row.data_type,
        label: row.label,
        is_required: row.is_required,
        visibility: row.visibility,
        layout: row.layout,
        display_order: row.display_order,
        section: row.section,
        render_as: row.render_as,
        status_button_color: row.status_button_color,
        panel: row.panel,
        bulk_edit: row.bulk_edit,
        input_config: row.input_config,
        inherits_from_entity_type: row.inherits_from_entity_type,
        inherits_from_entity_id: row.inherits_from_entity_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      await queryInterface.bulkInsert('admin_metadata', relationshipInserts);
      console.log(`✅ Migrated ${relationshipInserts.length} relationship metadata entries`);
    } else {
      console.log('ℹ️  No relationship metadata entries found to migrate');
    }

    // Verify migration
    const [finalCount] = await queryInterface.sequelize.query(`
      SELECT 
        metadata_type,
        COUNT(*)::int as count
      FROM admin_metadata
      GROUP BY metadata_type;
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('✅ Data migration completed. Summary:');
    if (Array.isArray(finalCount)) {
      finalCount.forEach(({ metadata_type, count }) => {
        console.log(`   - ${metadata_type}: ${count} entries`);
      });
    } else if (finalCount) {
      console.log(`   - ${finalCount.metadata_type}: ${finalCount.count} entries`);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting data migration...');
    console.log('⚠️  This will delete all data from admin_metadata table');
    
    // Delete all data from unified table
    await queryInterface.bulkDelete('admin_metadata', {}, {});
    
    console.log('✅ Reverted data migration (admin_metadata table is now empty)');
    console.log('⚠️  Note: Original tables (admin_primitive_metadata, admin_relationship_metadata) were not restored');
    console.log('   To fully restore, you would need to restore from backup or re-run data seeding migrations');
  },
};
