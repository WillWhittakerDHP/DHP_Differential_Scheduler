/**
 * Migration: Remove relationship keys from admin_primitive_metadata
 * Date: 2026-01-29
 * Purpose: Remove relationship keys that were incorrectly seeded into primitive metadata table
 *          Relationship keys should only exist in admin_relationship_metadata table
 * 
 * LEARNING: Relationship keys (validCascades, validParts, bookingCascades, activeParts, etc.)
 *           should only be in admin_relationship_metadata, not admin_primitive_metadata
 * WHY: Prevents key collisions when merging primitive and relationship metadata
 * PATTERN: Clean separation - primitives in primitive metadata, relationships in relationship metadata
 * 
 * NOTE: This fixes the issue where 20260121_seed_all_fields_not_configured.mjs incorrectly
 *       added relationship keys to primitive metadata table
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing relationship keys from admin_primitive_metadata...');

    // Relationship keys that should NOT be in primitive metadata
    // Include both current names and old names for safety
    const relationshipKeys = [
      'validCascades',
      'validParts',
      'bookingCascades',
      'activeParts',
      'instanceComponents',
      'dependentInstanceOptions',
      // Old names that might have been used before renaming
      'activeConstituents', // Old name for activeParts
      'validConstituents', // Old name for validParts
    ];

    // Check what we're about to delete (for logging)
    // LEARNING: Use PostgreSQL array literal syntax for WHERE IN with array
    // WHY: Sequelize replacements don't work well with arrays in WHERE IN clauses
    // PATTERN: Use unnest with array literal or construct SQL with proper array syntax
    const relationshipKeysArray = relationshipKeys.map(key => `'${key.replace(/'/g, "''")}'`).join(',');
    const [toDelete] = await queryInterface.sequelize.query(`
      SELECT entity_type, entity_id, field_key
      FROM admin_primitive_metadata
      WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(toDelete) && toDelete.length > 0) {
      console.log(`📋 Found ${toDelete.length} relationship key entries to remove:`);
      toDelete.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
      });
    } else {
      console.log('ℹ️  No relationship keys found in admin_primitive_metadata (already clean)');
    }

    // LEARNING: Use raw SQL DELETE with PostgreSQL array syntax to ensure deletion works
    // WHY: bulkDelete may not handle arrays correctly in all Sequelize versions
    // PATTERN: Use raw SQL with proper PostgreSQL array literal syntax
    const [deletedResult] = await queryInterface.sequelize.query(`
      DELETE FROM admin_primitive_metadata
      WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      RETURNING entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.DELETE,
    });

    const deletedCount = Array.isArray(deletedResult) ? deletedResult.length : 0;
    console.log(`✅ Removed ${deletedCount} relationship key entries from admin_primitive_metadata`);
    console.log(`   Removed field_key values: ${relationshipKeys.join(', ')}`);
    
    if (deletedCount > 0 && Array.isArray(deletedResult)) {
      console.log(`   Deleted entries:`);
      deletedResult.forEach(entry => {
        console.log(`     - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
      });
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot restore deleted relationship keys - they should not exist in primitive metadata');
    console.log('   Relationship keys belong in admin_relationship_metadata table only');
    console.log('   If you need to restore them, check admin_relationship_metadata table');
    // Intentionally no-op - we don't want to restore these
  },
};
