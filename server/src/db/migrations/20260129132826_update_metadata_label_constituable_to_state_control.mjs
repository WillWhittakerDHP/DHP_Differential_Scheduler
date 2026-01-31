/**
 * Migration: Update metadata label from Constituable to State Control
 * Date: 2026-01-29
 * Purpose: Update existing metadata records in admin_metadata table to change label from "Constituable" to "State Control"
 *          for the canHaveParts field (previously constituable)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting metadata label update: Constituable → State Control...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping label update');
      return;
    }

    // Update metadata records where field_key = 'canHaveParts' and label contains 'Constituable'
    // Handle both 'canHaveParts' (if previous migration ran) and 'constituable' (if not)
    const [updateResult1] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'State Control'
      WHERE field_key = 'canHaveParts'
        AND (label ILIKE '%Constituable%' OR label = 'Constituable')
      RETURNING id, entity_type, entity_id, field_key, label;
    `);

    const updatedCount1 = Array.isArray(updateResult1) ? updateResult1.length : 0;
    console.log(`✅ Updated ${updatedCount1} metadata record(s) with field_key='canHaveParts'`);

    // Also update records that might still have field_key = 'constituable' (if previous migration hasn't run)
    const [updateResult2] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'State Control'
      WHERE field_key = 'constituable'
        AND (label ILIKE '%Constituable%' OR label = 'Constituable')
      RETURNING id, entity_type, entity_id, field_key, label;
    `);

    const updatedCount2 = Array.isArray(updateResult2) ? updateResult2.length : 0;
    console.log(`✅ Updated ${updatedCount2} metadata record(s) with field_key='constituable'`);

    const totalUpdated = updatedCount1 + updatedCount2;
    if (totalUpdated > 0) {
      console.log('📋 Updated records:');
      [...(updateResult1 || []), ...(updateResult2 || [])].forEach((record) => {
        console.log(`   - ${record.entity_type}.${record.entity_id} (field_key: ${record.field_key}, old label: ${record.label})`);
      });
    } else {
      console.log('ℹ️  No records found with Constituable label');
    }

    // Also check and update admin_primitive_metadata table (for older databases that might still have it)
    const primitiveTableExists = await queryInterface.tableExists('admin_primitive_metadata');
    if (primitiveTableExists) {
      const [primitiveUpdateResult1] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET label = 'State Control'
        WHERE field_key = 'canHaveParts'
          AND (label ILIKE '%Constituable%' OR label = 'Constituable')
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount1 = Array.isArray(primitiveUpdateResult1) ? primitiveUpdateResult1.length : 0;

      const [primitiveUpdateResult2] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET label = 'State Control'
        WHERE field_key = 'constituable'
          AND (label ILIKE '%Constituable%' OR label = 'Constituable')
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount2 = Array.isArray(primitiveUpdateResult2) ? primitiveUpdateResult2.length : 0;
      const totalPrimitiveUpdated = primitiveUpdatedCount1 + primitiveUpdatedCount2;
      
      if (totalPrimitiveUpdated > 0) {
        console.log(`✅ Updated ${totalPrimitiveUpdated} record(s) in admin_primitive_metadata table`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back metadata label update: State Control → Constituable...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    // Update metadata records where field_key = 'canHaveParts' and label = 'State Control' back to 'Constituable'
    const [updateResult1] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'Constituable'
      WHERE field_key = 'canHaveParts'
        AND label = 'State Control'
      RETURNING id, entity_type, entity_id;
    `);

    const updatedCount1 = Array.isArray(updateResult1) ? updateResult1.length : 0;
    console.log(`✅ Rolled back ${updatedCount1} metadata record(s) with field_key='canHaveParts'`);

    // Also update records with field_key = 'constituable'
    const [updateResult2] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET label = 'Constituable'
      WHERE field_key = 'constituable'
        AND label = 'State Control'
      RETURNING id, entity_type, entity_id;
    `);

    const updatedCount2 = Array.isArray(updateResult2) ? updateResult2.length : 0;
    console.log(`✅ Rolled back ${updatedCount2} metadata record(s) with field_key='constituable'`);

    // Also check and update admin_primitive_metadata table
    const primitiveTableExists = await queryInterface.tableExists('admin_primitive_metadata');
    if (primitiveTableExists) {
      const [primitiveUpdateResult1] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET label = 'Constituable'
        WHERE field_key = 'canHaveParts'
          AND label = 'State Control'
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount1 = Array.isArray(primitiveUpdateResult1) ? primitiveUpdateResult1.length : 0;

      const [primitiveUpdateResult2] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET label = 'Constituable'
        WHERE field_key = 'constituable'
          AND label = 'State Control'
        RETURNING id, entity_type, entity_id;
      `);

      const primitiveUpdatedCount2 = Array.isArray(primitiveUpdateResult2) ? primitiveUpdateResult2.length : 0;
      const totalPrimitiveUpdated = primitiveUpdatedCount1 + primitiveUpdatedCount2;
      
      if (totalPrimitiveUpdated > 0) {
        console.log(`✅ Rolled back ${totalPrimitiveUpdated} record(s) in admin_primitive_metadata table`);
      }
    }
  }
};
