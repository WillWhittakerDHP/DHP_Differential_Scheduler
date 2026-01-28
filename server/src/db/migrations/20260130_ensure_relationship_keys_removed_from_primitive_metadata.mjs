/**
 * Migration: Ensure relationship keys are removed from admin_primitive_metadata
 * Date: 2026-01-30
 * Purpose: Final cleanup to ensure all relationship keys are removed from primitive metadata
 *          This migration uses RELATIONSHIP_KEYS as the source of truth
 * 
 * LEARNING: Relationship keys (defined in RELATIONSHIP_KEYS constant) should ONLY exist
 *           in admin_relationship_metadata, never in admin_primitive_metadata
 * WHY: Prevents key collisions when merging primitive and relationship metadata in useAdmin.getMetadata()
 * PATTERN: Use RELATIONSHIP_KEYS as source of truth - any field in that constant should not be in primitive metadata
 * 
 * NOTE: This is a defensive cleanup migration to ensure data integrity even if previous
 *       migrations didn't run or data was re-seeded incorrectly
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Ensuring relationship keys are removed from admin_primitive_metadata...');

    // LEARNING: Use RELATIONSHIP_KEYS as source of truth for which fields are relationships
    // WHY: Single source of truth prevents inconsistencies
    // PATTERN: Match the relationship keys defined in client/src/constants/relationships.ts
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

    // Check what exists before deletion (for logging)
    // LEARNING: Use PostgreSQL array literal syntax for WHERE IN with array
    // WHY: Sequelize replacements don't work well with arrays in WHERE IN clauses
    // PATTERN: Use unnest with array literal or construct SQL with proper array syntax
    const relationshipKeysArray = relationshipKeys.map(key => `'${key.replace(/'/g, "''")}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(`
      SELECT entity_type, entity_id, field_key
      FROM admin_primitive_metadata
      WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      ORDER BY entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`📋 Found ${existing.length} relationship key entries that should not exist in primitive metadata:`);
      existing.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
      });

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
    } else {
      console.log('✅ No relationship keys found in admin_primitive_metadata (already clean)');
    }

    // Verify they exist in relationship metadata (for validation)
    const [inRelationshipMetadata] = await queryInterface.sequelize.query(`
      SELECT DISTINCT relationship_key
      FROM admin_relationship_metadata
      WHERE relationship_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      ORDER BY relationship_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(inRelationshipMetadata) && inRelationshipMetadata.length > 0) {
      const foundKeys = inRelationshipMetadata.map(r => r.relationship_key);
      console.log(`✅ Verified relationship keys exist in admin_relationship_metadata: ${foundKeys.join(', ')}`);
    } else {
      console.log('⚠️  Warning: No relationship keys found in admin_relationship_metadata');
      console.log('   This might indicate that relationship metadata needs to be seeded');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot restore deleted relationship keys - they should not exist in primitive metadata');
    console.log('   Relationship keys belong in admin_relationship_metadata table only');
    console.log('   If you need to restore them, check admin_relationship_metadata table');
    // Intentionally no-op - we don't want to restore these
  },
};
