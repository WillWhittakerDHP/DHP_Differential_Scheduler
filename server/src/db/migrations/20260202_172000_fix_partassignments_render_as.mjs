/**
 * Migration: Fix partAssignments render_as to relationshipCollection
 * Date: 2026-02-02
 * Purpose: Ensure partAssignments metadata records use render_as: 'relationshipCollection' instead of 'partsCollection'
 * 
 * LEARNING: Ensures partAssignments uses the generic relationshipCollection type
 * WHY: relationshipCollection with collectionType prop handles all collection types (parts, annotations, events)
 * PATTERN: Update all partAssignments records to use relationshipCollection
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Fixing partAssignments render_as to relationshipCollection...');
    
    // Update admin_metadata table - update all partAssignments records
    const [results] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'relationshipCollection'
      WHERE field_key = 'partAssignments'
        AND render_as = 'partsCollection'
    `);
    
    const updatedCount = results.rowCount || 0;
    console.log(`   ✅ Updated ${updatedCount} partAssignments record(s) to relationshipCollection`);
    
    console.log('✅ Migration completed successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back partAssignments render_as fix...');
    
    // Revert partAssignments records back to partsCollection
    const [results] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'partsCollection'
      WHERE field_key = 'partAssignments'
        AND render_as = 'relationshipCollection'
    `);
    
    const revertedCount = results.rowCount || 0;
    console.log(`   ✅ Reverted ${revertedCount} partAssignments record(s) to partsCollection`);
    
    console.log('✅ Rollback completed successfully!');
  },
}
