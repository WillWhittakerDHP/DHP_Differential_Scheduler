/**
 * Migration: Cleanup Duplicate ActiveParts Relationships
 * Date: 2026-01-29
 * Purpose: Disable old activeParts relationships that point to duplicate part instances
 *          For each (parent_id, name, partShapeRef) group, keep only the relationship
 *          pointing to the most recent part instance (by updatedAt), disable all others
 * 
 * LEARNING: Ensures only one activeParts relationship exists per logical part
 * WHY: When part instances were edited, new instances may have been created without
 *      cleaning up old relationships, leading to multiple relationships pointing to
 *      different versions of the same logical part
 * PATTERN: Group by (parent_id, name, partShapeRef), select most recent per group, disable others
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Cleaning up duplicate activeParts relationships...');

    // Find all activeParts relationships with their part instance data
    // We need to join with part_instances to get name, partShapeRef, and updatedAt
    // LEARNING: Handle NULL values in name and part_shape_ref for grouping
    // WHY: Some part instances might have NULL names or part_shape_ref, we need to handle them
    // PATTERN: Use COALESCE to convert NULL to empty string for grouping
    const duplicateGroups = await queryInterface.sequelize.query(`
      WITH relationship_data AS (
        SELECT 
          ap.id as relationship_id,
          ap.parent_id,
          ap.child_id,
          ap.disabled,
          COALESCE(pi.name, '') as name,
          COALESCE(pi.part_shape_ref::text, '') as part_shape_ref,
          pi.updated_at as part_updated_at,
          pi.created_at as part_created_at,
          ROW_NUMBER() OVER (
            PARTITION BY ap.parent_id, COALESCE(pi.name, ''), COALESCE(pi.part_shape_ref::text, '')
            ORDER BY 
              COALESCE(pi.updated_at, pi.created_at) DESC NULLS LAST,
              ap.created_at DESC NULLS LAST
          ) as rn
        FROM active_parts ap
        INNER JOIN part_instances pi ON ap.child_id = pi.id
        WHERE ap.disabled = false
      )
      SELECT 
        relationship_id,
        parent_id,
        child_id,
        name,
        part_shape_ref,
        part_updated_at,
        part_created_at
      FROM relationship_data
      WHERE rn > 1
      ORDER BY parent_id, name, part_shape_ref, part_updated_at DESC NULLS LAST
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(duplicateGroups) && duplicateGroups.length > 0) {
      const relationshipIdsToDisable = duplicateGroups.map((row) => row.relationship_id);
      
      console.log(`  📊 Found ${relationshipIdsToDisable.length} duplicate relationships to disable`);
      console.log(`  📊 Affected groups:`, 
        Array.from(new Set(duplicateGroups.map((row) => 
          `${row.parent_id}::${row.name}::${row.part_shape_ref}`
        ))).length
      );

      // Disable duplicate relationships
      await queryInterface.sequelize.query(`
        UPDATE active_parts
        SET disabled = true
        WHERE id = ANY(ARRAY[${relationshipIdsToDisable.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')}]::uuid[])
      `);

      console.log(`  ✅ Disabled ${relationshipIdsToDisable.length} duplicate activeParts relationships`);
    } else {
      console.log('  ℹ️  No duplicate activeParts relationships found');
    }
  },

  async down(queryInterface, Sequelize) {
    // LEARNING: Re-enable all disabled relationships (not recommended, but provides rollback)
    // WHY: Allows rolling back the migration if needed
    // PATTERN: Simple UPDATE to set disabled = false for all relationships
    console.log('🔄 Re-enabling all disabled activeParts relationships...');
    
    await queryInterface.sequelize.query(`
      UPDATE active_parts
      SET disabled = false
      WHERE disabled = true
    `);
    
    console.log('  ✅ Re-enabled all disabled activeParts relationships');
  }
};
