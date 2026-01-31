/**
 * Migration: Remove activeParts and other relationship keys from admin_primitive_metadata
 * Date: 2026-01-15
 * Purpose: Remove relationship keys that were incorrectly added to primitive metadata
 *          This is a cleanup migration to fix the collision error
 * 
 * LEARNING: Relationship keys should NEVER be in admin_primitive_metadata
 * WHY: They belong exclusively in admin_relationship_metadata
 * PATTERN: Direct SQL DELETE to ensure relationship keys are removed
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing relationship keys from admin_primitive_metadata...');

    const relationshipKeys = [
      'validCascades',
      'validParts',
      'bookingCascades',
      'activeParts',
      'instanceComponents',
      'dependentInstances', // Current name
      'dependentInstanceOptions', // Old name - catch legacy data
      // Old names that might have been used before renaming
      'activeConstituents', // Old name for activeParts
      'validConstituents', // Old name for validParts
    ];

    // Format array for PostgreSQL
    const relationshipKeysArray = relationshipKeys.map(key => `'${key.replace(/'/g, "''")}'`).join(',');

    // Check what exists before deletion
    const [existing] = await queryInterface.sequelize.query(`
      SELECT entity_type, entity_id, field_key
      FROM admin_primitive_metadata
      WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      ORDER BY entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`📋 Found ${existing.length} relationship key entries to remove:`);
      existing.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
      });

      // Delete relationship keys from primitive metadata
      const [deletedResult] = await queryInterface.sequelize.query(`
        DELETE FROM admin_primitive_metadata
        WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
        RETURNING entity_type, entity_id, field_key
      `, {
        type: Sequelize.QueryTypes.DELETE,
      });

      const deletedCount = Array.isArray(deletedResult) ? deletedResult.length : 0;
      console.log(`✅ Deleted ${deletedCount} relationship key entries from admin_primitive_metadata`);

      if (deletedCount > 0) {
        console.log('   Deleted entries:');
        deletedResult.forEach(entry => {
          console.log(`     - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
        });
      }

      // Verify deletion
      const [remaining] = await queryInterface.sequelize.query(`
        SELECT COUNT(*)::int as count
        FROM admin_primitive_metadata
        WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      `, {
        type: Sequelize.QueryTypes.SELECT,
      });

      const remainingCount = remaining?.[0]?.count || remaining?.count || 0;
      if (remainingCount === 0) {
        console.log('✅ Verification: All relationship keys removed from admin_primitive_metadata');
      } else {
        console.log(`⚠️  Warning: ${remainingCount} relationship keys still remain in admin_primitive_metadata`);
      }
    } else {
      console.log('✅ No relationship keys found in admin_primitive_metadata (already clean)');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot restore deleted relationship keys - they should not exist in primitive metadata');
    console.log('   Relationship keys belong in admin_relationship_metadata table only');
    // Intentionally no-op - relationship keys should never be in primitive metadata
  },
};
