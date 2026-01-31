/**
 * Migration: Convert existing PartShape → EventInstance assignments to PartInstance → EventInstance
 * Date: 2026-02-04
 * Purpose: 
 * - Convert existing shape-level event assignments to instance-level assignments
 * - For each EventAssignment with partShapeId, create assignments for all PartInstances with that partShapeRef
 * - Keep old shape-level assignments for backward compatibility (they'll be ignored in new code)
 * 
 * LEARNING: Event assignments move from shape-level to instance-level
 * WHY: Matches validParts/partAssignments pattern - shapes define valid options, instances assign them
 * PATTERN: Find shape-level assignments, create instance-level assignments, keep old ones for migration period
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Converting PartShape → EventInstance assignments to PartInstance → EventInstance...');

    // Find all EventAssignments with partShapeId (shape-level assignments)
    const [shapeAssignments] = await queryInterface.sequelize.query(`
      SELECT 
        ea.id,
        ea.part_shape_id,
        ea.event_instance_id,
        ea.created_at,
        ea.updated_at
      FROM event_assignments ea
      WHERE ea.part_shape_id IS NOT NULL
        AND ea.part_instance_id IS NULL
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (!shapeAssignments || shapeAssignments.length === 0) {
      console.log('ℹ️  No shape-level event assignments found to migrate');
      return;
    }

    console.log(`📋 Found ${shapeAssignments.length} shape-level event assignments to migrate`);

    let totalCreated = 0;
    let totalSkipped = 0;

    // For each shape-level assignment, create instance-level assignments
    for (const assignment of shapeAssignments) {
      // Find all PartInstances with this partShapeRef
      const [partInstances] = await queryInterface.sequelize.query(`
        SELECT id FROM part_instances
        WHERE part_shape_ref = $1
      `, {
        bind: [assignment.part_shape_id],
        type: Sequelize.QueryTypes.SELECT,
      });

      if (!partInstances || partInstances.length === 0) {
        console.log(`ℹ️  No PartInstances found for PartShape ${assignment.part_shape_id}, skipping`);
        totalSkipped++;
        continue;
      }

      // Create instance-level assignments for each PartInstance
      for (const partInstance of partInstances) {
        // Check if assignment already exists (avoid duplicates)
        const [existing] = await queryInterface.sequelize.query(`
          SELECT id FROM event_assignments
          WHERE part_instance_id = $1
            AND event_instance_id = $2
        `, {
          bind: [partInstance.id, assignment.event_instance_id],
          type: Sequelize.QueryTypes.SELECT,
        });

        if (existing && existing.length > 0) {
          // Assignment already exists, skip
          continue;
        }

        // Create new instance-level assignment
        await queryInterface.sequelize.query(`
          INSERT INTO event_assignments (
            id,
            part_instance_id,
            event_instance_id,
            part_shape_id,
            block_shape_id,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2,
            NULL,
            NULL,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `, {
          bind: [partInstance.id, assignment.event_instance_id],
        });

        totalCreated++;
      }
    }

    console.log(`✅ Created ${totalCreated} instance-level event assignments`);
    console.log(`ℹ️  Skipped ${totalSkipped} shape-level assignments (no PartInstances found)`);
    console.log('ℹ️  Old shape-level assignments kept for backward compatibility');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting instance-level event assignments...');

    // Delete all instance-level assignments that were created by this migration
    // Note: This is a best-effort rollback - we can't perfectly identify which assignments
    // were created by this migration vs. manually created, so we delete all instance-level assignments
    const [deleted] = await queryInterface.sequelize.query(`
      DELETE FROM event_assignments
      WHERE part_instance_id IS NOT NULL
        AND part_shape_id IS NULL
        AND block_shape_id IS NULL
      RETURNING id
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const deletedCount = Array.isArray(deleted) ? deleted.length : 0;
    console.log(`✅ Deleted ${deletedCount} instance-level event assignments`);
    console.log('⚠️  Note: This rollback deletes ALL instance-level assignments, not just migrated ones');
  },
}
