/**
 * Migration: Fix activeParts render_as to partsCollection
 * Date: 2026-01-29
 * Purpose: Update existing activeParts metadata records to use render_as: 'partsCollection' instead of 'reference'
 *          This ensures activeParts fields render as PartsCollection component instead of SelectInputs
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing activeParts render_as to partsCollection...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping render_as update');
      return;
    }

    // Update ALL metadata records where field_key = 'activeParts' to use render_as: 'partsCollection'
    // LEARNING: Update all activeParts entries regardless of current render_as value (select, reference, etc.)
    // WHY: Ensures consistency - activeParts should always render as PartsCollection, not SelectInputs
    // PATTERN: Update all matching records, not just those with render_as: 'reference'
    // NOTE: This includes blockShape-specific entries (block_shape_ref IS NOT NULL)
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'partsCollection'
      WHERE field_key = 'activeParts'
        AND metadata_type = 'relationship'
        AND (render_as != 'partsCollection' OR render_as IS NULL)
      RETURNING id, entity_type, entity_id, field_key, render_as, block_shape_ref;
    `);

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0;
    console.log(`✅ Updated ${updatedCount} metadata record(s) with field_key='activeParts' to render_as='partsCollection'`);

    if (updatedCount > 0) {
      console.log('📋 Updated records:');
      updateResult.forEach((record) => {
        const blockShapeInfo = record.block_shape_ref ? ` (blockShapeRef: ${record.block_shape_ref})` : '';
        console.log(`   - ${record.entity_type}.${record.entity_id}${blockShapeInfo} (field_key: ${record.field_key}, old render_as: ${record.render_as}, new render_as: partsCollection)`);
      });
    }

    // Also check and update admin_relationship_metadata table (for older databases that might still have it)
    const relationshipTableExists = await queryInterface.tableExists('admin_relationship_metadata');
    if (relationshipTableExists) {
      const [relationshipUpdateResult] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET render_as = 'partsCollection'
        WHERE relationship_key = 'activeParts'
          AND render_as != 'partsCollection'
        RETURNING id, entity_type, entity_id;
      `);

      const relationshipUpdatedCount = Array.isArray(relationshipUpdateResult) ? relationshipUpdateResult.length : 0;
      if (relationshipUpdatedCount > 0) {
        console.log(`✅ Updated ${relationshipUpdatedCount} record(s) in admin_relationship_metadata table`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back activeParts render_as fix...');

    // Check if admin_metadata table exists
    const tableExists = await queryInterface.tableExists('admin_metadata');
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    // Update metadata records where field_key = 'activeParts' and render_as is 'partsCollection' back to 'reference'
    const [updateResult] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'reference'
      WHERE field_key = 'activeParts'
        AND render_as = 'partsCollection'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id;
    `);

    const updatedCount = Array.isArray(updateResult) ? updateResult.length : 0;
    console.log(`✅ Rolled back ${updatedCount} metadata record(s) from 'partsCollection' to 'reference'`);

    // Also check and update admin_relationship_metadata table
    const relationshipTableExists = await queryInterface.tableExists('admin_relationship_metadata');
    if (relationshipTableExists) {
      const [relationshipUpdateResult] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET render_as = 'reference'
        WHERE relationship_key = 'activeParts'
          AND render_as = 'partsCollection'
        RETURNING id, entity_type, entity_id;
      `);

      const relationshipUpdatedCount = Array.isArray(relationshipUpdateResult) ? relationshipUpdateResult.length : 0;
      if (relationshipUpdatedCount > 0) {
        console.log(`✅ Rolled back ${relationshipUpdatedCount} record(s) in admin_relationship_metadata table`);
      }
    }
  }
};
