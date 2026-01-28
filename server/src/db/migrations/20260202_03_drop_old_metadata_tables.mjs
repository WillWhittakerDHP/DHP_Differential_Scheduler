/**
 * Migration: Drop old admin_primitive_metadata and admin_relationship_metadata tables
 * Date: 2026-02-02
 * Purpose: Remove old separate metadata tables after data has been migrated to unified admin_metadata table
 * 
 * LEARNING: Clean up old tables after successful migration
 * WHY: Remove duplicate structures, keep only unified table
 * PATTERN: Drop indexes, drop tables, drop ENUM types
 * 
 * NOTE: This migration should only run after data migration is verified successful
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting removal of old metadata tables...');

    // Verify unified table exists and has data
    const unifiedTableExists = await queryInterface.tableExists('admin_metadata');
    if (!unifiedTableExists) {
      throw new Error('admin_metadata table must exist before dropping old tables. Run create_unified_admin_metadata_table migration first.');
    }

    // Verify unified table exists (it's okay if it's empty - old tables might be empty too)
    const [unifiedCount] = await queryInterface.sequelize.query(`
      SELECT COUNT(*)::int as count FROM admin_metadata;
    `, { type: Sequelize.QueryTypes.SELECT });

    const count = unifiedCount?.count || 0;
    console.log(`✅ Verified admin_metadata table exists with ${count} entries`);

    // Drop admin_primitive_metadata table
    const primitiveTableExists = await queryInterface.tableExists('admin_primitive_metadata');
    if (primitiveTableExists) {
      console.log('🔄 Dropping admin_primitive_metadata table...');
      
      // Remove indexes first
      try {
        await queryInterface.removeIndex('admin_primitive_metadata', 'admin_primitive_metadata_entity_field_unique');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }
      
      try {
        await queryInterface.removeIndex('admin_primitive_metadata', 'admin_primitive_metadata_entity_idx');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }
      
      try {
        await queryInterface.removeIndex('admin_primitive_metadata', 'admin_primitive_metadata_field_key_idx');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }
      
      try {
        await queryInterface.removeIndex('admin_primitive_metadata', 'admin_primitive_metadata_inheritance_idx');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }

      // Drop table
      await queryInterface.dropTable('admin_primitive_metadata');
      console.log('✅ Dropped admin_primitive_metadata table');
    } else {
      console.log('ℹ️  admin_primitive_metadata table does not exist, skipping');
    }

    // Drop admin_relationship_metadata table
    const relationshipTableExists = await queryInterface.tableExists('admin_relationship_metadata');
    if (relationshipTableExists) {
      console.log('🔄 Dropping admin_relationship_metadata table...');
      
      // Remove indexes first
      try {
        await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_entity_relationship_unique');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }
      
      try {
        await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_entity_idx');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }
      
      try {
        await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_relationship_key_idx');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }
      
      try {
        await queryInterface.removeIndex('admin_relationship_metadata', 'admin_relationship_metadata_inheritance_idx');
      } catch (error) {
        if (!error.message.includes('does not exist')) throw error;
      }

      // Drop table
      await queryInterface.dropTable('admin_relationship_metadata');
      console.log('✅ Dropped admin_relationship_metadata table');
    } else {
      console.log('ℹ️  admin_relationship_metadata table does not exist, skipping');
    }

    // Drop old ENUM types (only if not used by other tables)
    // Note: We keep the unified ENUM types, only drop the old separate ones
    console.log('🔄 Cleaning up old ENUM types...');
    
    // Drop primitive metadata ENUMs (only if they exist and aren't used elsewhere)
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Drop primitive metadata ENUMs if they exist
        DROP TYPE IF EXISTS enum_admin_primitive_metadata_entity_type;
        DROP TYPE IF EXISTS enum_admin_primitive_metadata_data_type;
        DROP TYPE IF EXISTS enum_admin_primitive_metadata_visibility;
        DROP TYPE IF EXISTS enum_admin_primitive_metadata_layout;
        DROP TYPE IF EXISTS enum_admin_primitive_metadata_render_as;
        DROP TYPE IF EXISTS enum_admin_primitive_metadata_panel;
        
        -- Drop relationship metadata ENUMs if they exist
        DROP TYPE IF EXISTS enum_admin_relationship_metadata_entity_type;
        DROP TYPE IF EXISTS enum_admin_relationship_metadata_data_type;
        DROP TYPE IF EXISTS enum_admin_relationship_metadata_visibility;
        DROP TYPE IF EXISTS enum_admin_relationship_metadata_layout;
        DROP TYPE IF EXISTS enum_admin_relationship_metadata_render_as;
        DROP TYPE IF EXISTS enum_admin_relationship_metadata_panel;
        
        -- Also drop old admin_input_metadata ENUMs if they exist (from before rename)
        DROP TYPE IF EXISTS enum_admin_input_metadata_entity_type;
        DROP TYPE IF EXISTS enum_admin_input_metadata_data_type;
        DROP TYPE IF EXISTS enum_admin_input_metadata_visibility;
        DROP TYPE IF EXISTS enum_admin_input_metadata_layout;
        DROP TYPE IF EXISTS enum_admin_input_metadata_render_as;
        DROP TYPE IF EXISTS enum_admin_input_metadata_panel;
      END $$;
    `);

    console.log('✅ Cleaned up old ENUM types');
    console.log('✅ Old metadata tables removed successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot automatically restore old tables - data structure has changed');
    console.log('   To restore, you would need to:');
    console.log('   1. Restore from database backup');
    console.log('   2. Or recreate tables and re-run data seeding migrations');
    console.log('   This migration intentionally does not restore old tables');
  },
};
