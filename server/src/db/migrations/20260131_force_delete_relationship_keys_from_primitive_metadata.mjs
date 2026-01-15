/**
 * Migration: Force delete relationship keys from admin_primitive_metadata
 * Date: 2026-01-31
 * Purpose: Forcefully remove relationship keys that persist despite previous cleanup migrations
 *          Uses direct SQL DELETE with explicit array syntax to ensure deletion
 * 
 * LEARNING: Relationship keys should NEVER be in admin_primitive_metadata
 * WHY: They belong exclusively in admin_relationship_metadata
 * PATTERN: Direct SQL DELETE with PostgreSQL array literal syntax
 * 
 * NOTE: This is a final cleanup migration to remove any remaining relationship keys
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Force deleting relationship keys from admin_primitive_metadata...');

    const relationshipKeys = [
      'validCascades',
      'validParts',
      'bookingCascades',
      'activeParts',
      'instanceComponents',
      'dependentInstanceOptions',
      'activeConstituents', // Old name for activeParts
      'validConstituents', // Old name for validParts
    ];

    // Format array for PostgreSQL
    const relationshipKeysArray = relationshipKeys.map(key => `'${key.replace(/'/g, "''")}'`).join(',');

    // Check what exists
    // LEARNING: Sequelize.query returns [results, metadata] tuple for SELECT queries
    // WHY: Need to extract the actual results array from the tuple
    // PATTERN: Handle both tuple and direct array returns for compatibility
    const existingResult = await queryInterface.sequelize.query(`
      SELECT entity_type, entity_id, field_key
      FROM admin_primitive_metadata
      WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      ORDER BY entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    // Extract results array (Sequelize returns [results, metadata] tuple)
    const existing = Array.isArray(existingResult) && existingResult.length > 0 && Array.isArray(existingResult[0])
      ? existingResult[0]
      : Array.isArray(existingResult) ? existingResult : [];

    if (existing.length > 0) {
      console.log(`📋 Found ${existing.length} relationship key entries to delete:`);
      existing.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
      });

      // Force delete using raw SQL with explicit array syntax
      // LEARNING: For DELETE with RETURNING, Sequelize returns results directly (not wrapped in tuple)
      // WHY: DELETE queries return the RETURNING clause results as an array
      // PATTERN: Use raw query without QueryTypes to get RETURNING results
      const deletedResult = await queryInterface.sequelize.query(`
        DELETE FROM admin_primitive_metadata
        WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
        RETURNING entity_type, entity_id, field_key
      `, {
        type: Sequelize.QueryTypes.RAW,
      });

      // Extract results (Sequelize returns [results, metadata] tuple)
      const deletedRows = Array.isArray(deletedResult) && deletedResult.length > 0 && Array.isArray(deletedResult[0])
        ? deletedResult[0]
        : Array.isArray(deletedResult) ? deletedResult : [];
      const deletedCount = deletedRows.length;
      console.log(`✅ Deleted ${deletedCount} relationship key entries`);

      if (deletedCount > 0) {
        console.log('   Deleted entries:');
        deletedRows.forEach(entry => {
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

      const remainingCount = remaining?.[0]?.count || 0;
      if (remainingCount === 0) {
        console.log('✅ Verification: All relationship keys removed');
      } else {
        console.log(`⚠️  Warning: ${remainingCount} relationship keys still remain`);
      }
    } else {
      console.log('✅ No relationship keys found (already clean)');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot restore deleted relationship keys - they should not exist in primitive metadata');
    console.log('   Relationship keys belong in admin_relationship_metadata table only');
    // Intentionally no-op
  },
};
