/**
 * Migration: Migrate Differential Override from PartInstance to BlockInstance
 * Purpose: Convert differentialOverride: true on partInstances to differential: 'override' on blockInstance
 *          If ANY partInstance in a blockInstance has differentialOverride = true,
 *          the blockInstance gets differential = 'override'
 * Date: 2026-01-30
 * 
 * LEARNING: Moves override logic from partInstance level to blockInstance level
 * WHY: Override is a blockInstance-level concern, not partInstance-level
 * PATTERN: Aggregate partInstance overrides to blockInstance level
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Migrating differentialOverride from partInstances to blockInstances...');

    // Check if differential_override column exists
    const partInstancesDescription = await queryInterface.describeTable('part_instances');
    if (!partInstancesDescription.differential_override) {
      console.log('ℹ️  differential_override column does not exist, skipping migration');
      return;
    }

    // Find all blockInstances that have ANY partInstance with differentialOverride = true
    // Set their differential to 'override'
    // LEARNING: part_instances are related to block_instances through active_parts join table
    // WHY: The relationship is many-to-many through active_parts (parent_id = block_instance, child_id = part_instance)
    // PATTERN: Join through active_parts table to find block instances with parts that have differentialOverride
    const [results] = await queryInterface.sequelize.query(`
      UPDATE block_instances bi
      SET differential = 'override'::ternary_boolean
      WHERE EXISTS (
        SELECT 1
        FROM active_parts ap
        INNER JOIN part_instances pi ON ap.child_id = pi.id
        WHERE ap.parent_id = bi.id
          AND ap.disabled = false
          AND pi.differential_override = true
      )
      AND bi.differential != 'override'::ternary_boolean;
    `);

    const affectedRows = results.rowCount || 0;
    console.log(`✅ Migrated ${affectedRows} blockInstances with differentialOverride to differential: 'override'`);

    // Verify migration
    const [verifyResults] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count
      FROM block_instances bi
      WHERE bi.differential = 'override'::ternary_boolean
        AND EXISTS (
          SELECT 1
          FROM active_parts ap
          INNER JOIN part_instances pi ON ap.child_id = pi.id
          WHERE ap.parent_id = bi.id
            AND ap.disabled = false
            AND pi.differential_override = true
        );
    `);

    console.log(`✅ Verification: ${verifyResults[0]?.count || 0} blockInstances have differential: 'override' matching partInstance overrides`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting differentialOverride migration...');
    console.log('⚠️  Cannot automatically revert - differentialOverride data would be lost');
    console.log('ℹ️  Manual intervention required to restore differentialOverride on partInstances');
  }
};
