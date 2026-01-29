/**
 * Migration: Update metadata fieldKey from constituable to canHaveParts
 * Date: 2026-01-29
 * Purpose: Update existing metadata records in admin_metadata table to use canHaveParts instead of constituable
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting metadata fieldKey update: constituable → canHaveParts...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping metadata update');
      return;
    }

    // Update metadata records where field_key = 'constituable' to 'canHaveParts'
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET field_key = 'canHaveParts'
      WHERE field_key = 'constituable'
      RETURNING id, entity_type, entity_id;
    `);

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0;
    console.log(`✅ Updated ${updatedCount} metadata record(s) from constituable to canHaveParts`);

    if (updatedCount > 0) {
      console.log('📋 Updated records:');
      updateResult.forEach((record) => {
        console.log(`   - ${record.entity_type}.${record.entity_id} (id: ${record.id})`);
      });
    }

    // Also check and update admin_primitive_metadata table (for older databases that might still have it)
    const primitiveTableExists = await queryInterface.tableExists('admin_primitive_metadata');
    if (primitiveTableExists) {
      const [primitiveUpdateResult] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET field_key = 'canHaveParts'
        WHERE field_key = 'constituable'
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount = Array.isArray(primitiveUpdateResult) ? primitiveUpdateResult.length : 0;
      if (primitiveUpdatedCount > 0) {
        console.log(`✅ Updated ${primitiveUpdatedCount} record(s) in admin_primitive_metadata table`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back metadata fieldKey update: canHaveParts → constituable...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    // Update metadata records where field_key = 'canHaveParts' back to 'constituable'
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET field_key = 'constituable'
      WHERE field_key = 'canHaveParts'
      RETURNING id, entity_type, entity_id;
    `);

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0;
    console.log(`✅ Rolled back ${updatedCount} metadata record(s) from canHaveParts to constituable`);

    // Also check and update admin_primitive_metadata table
    const primitiveTableExists = await queryInterface.tableExists('admin_primitive_metadata');
    if (primitiveTableExists) {
      const [primitiveUpdateResult] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET field_key = 'constituable'
        WHERE field_key = 'canHaveParts'
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount = Array.isArray(primitiveUpdateResult) ? primitiveUpdateResult.length : 0;
      if (primitiveUpdatedCount > 0) {
        console.log(`✅ Rolled back ${primitiveUpdatedCount} record(s) in admin_primitive_metadata table`);
      }
    }
  }
};
