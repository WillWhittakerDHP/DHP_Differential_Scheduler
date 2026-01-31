/**
 * Migration: Migrate partsCollection to relationshipCollection
 * Date: 2026-01-30
 * Purpose: Update all existing metadata records from renderAs: 'partsCollection' to 'relationshipCollection'
 * 
 * LEARNING: Aligns codebase to use single relationshipCollection type instead of redundant partsCollection
 * WHY: relationshipCollection with collectionType prop handles all collection types (parts, annotations, events)
 * PATTERN: Update all records in admin_metadata table (unified metadata table)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migration: migrate partsCollection to relationshipCollection...');
    
    // Update admin_metadata table (unified metadata table)
    const [results] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'relationshipCollection'
      WHERE render_as = 'partsCollection'
    `);
    
    const updatedCount = results.rowCount || 0;
    console.log(`   ✅ Updated ${updatedCount} records in admin_metadata table`);
    
    // Also update admin_primitive_metadata table (if it still exists and has records)
    try {
      const [primitiveResults] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET render_as = 'relationshipCollection'
        WHERE render_as = 'partsCollection'
      `);
      const primitiveUpdatedCount = primitiveResults.rowCount || 0;
      if (primitiveUpdatedCount > 0) {
        console.log(`   ✅ Updated ${primitiveUpdatedCount} records in admin_primitive_metadata table`);
      }
    } catch (error) {
      // Table might not exist (if fully migrated to unified table)
      if (!error.message.includes('does not exist')) {
        throw error;
      }
      console.log('   ℹ️  admin_primitive_metadata table does not exist (skipping)');
    }
    
    // Also update admin_relationship_metadata table (if it still exists and has records)
    try {
      const [relationshipResults] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET render_as = 'relationshipCollection'
        WHERE render_as = 'partsCollection'
      `);
      const relationshipUpdatedCount = relationshipResults.rowCount || 0;
      if (relationshipUpdatedCount > 0) {
        console.log(`   ✅ Updated ${relationshipUpdatedCount} records in admin_relationship_metadata table`);
      }
    } catch (error) {
      // Table might not exist (if fully migrated to unified table)
      if (!error.message.includes('does not exist')) {
        throw error;
      }
      console.log('   ℹ️  admin_relationship_metadata table does not exist (skipping)');
    }
    
    console.log('✅ Migration completed successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back migration: revert relationshipCollection to partsCollection...');
    
    // Revert admin_metadata table
    const [results] = await queryInterface.sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'partsCollection'
      WHERE render_as = 'relationshipCollection'
        AND field_key IN ('activeParts', 'validParts')
    `);
    
    const revertedCount = results.rowCount || 0;
    console.log(`   ✅ Reverted ${revertedCount} records in admin_metadata table`);
    
    // Revert admin_primitive_metadata table (if exists)
    try {
      const [primitiveResults] = await queryInterface.sequelize.query(`
        UPDATE admin_primitive_metadata
        SET render_as = 'partsCollection'
        WHERE render_as = 'relationshipCollection'
          AND field_key IN ('activeParts', 'validParts')
      `);
      const primitiveRevertedCount = primitiveResults.rowCount || 0;
      if (primitiveRevertedCount > 0) {
        console.log(`   ✅ Reverted ${primitiveRevertedCount} records in admin_primitive_metadata table`);
      }
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        throw error;
      }
    }
    
    // Revert admin_relationship_metadata table (if exists)
    try {
      const [relationshipResults] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata
        SET render_as = 'partsCollection'
        WHERE render_as = 'relationshipCollection'
          AND relationship_key IN ('activeParts', 'validParts')
      `);
      const relationshipRevertedCount = relationshipResults.rowCount || 0;
      if (relationshipRevertedCount > 0) {
        console.log(`   ✅ Reverted ${relationshipRevertedCount} records in admin_relationship_metadata table`);
      }
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        throw error;
      }
    }
    
    console.log('✅ Rollback completed successfully!');
  },
}
