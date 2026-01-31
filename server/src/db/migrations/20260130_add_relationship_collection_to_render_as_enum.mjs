/**
 * Migration: Add relationshipCollection to renderAs ENUM
 * Date: 2026-01-30
 * Purpose: Add relationshipCollection as a valid renderAs value for generic RelationshipCollection rendering
 * 
 * LEARNING: Generic collection component pattern - relationshipCollection works for parts, annotations, events
 * WHY: Unified pattern for all relationship collections, differentiated by collectionType prop
 * PATTERN: Add new ENUM value to admin_metadata table (unified metadata table)
 * 
 * NOTE: partsCollection is kept for backward compatibility, relationshipCollection is the new generic type
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migration: add relationshipCollection to renderAs ENUM...');
    
    // Add relationshipCollection to admin_metadata.render_as ENUM
    // Note: PostgreSQL doesn't have "IF NOT EXISTS" for ALTER TYPE ADD VALUE in older versions
    // We'll try to add it and catch the error if it already exists
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_admin_metadata_render_as ADD VALUE IF NOT EXISTS 'relationshipCollection';
      `);
      console.log('   ✅ Added relationshipCollection to admin_metadata renderAs enum');
    } catch (error) {
      // Check if error is about value already existing or IF NOT EXISTS not supported
      if (error.message.includes('already exists') || error.message.includes('syntax error')) {
        // Try without IF NOT EXISTS (for older PostgreSQL versions)
        try {
          await queryInterface.sequelize.query(`
            ALTER TYPE enum_admin_metadata_render_as ADD VALUE 'relationshipCollection';
          `);
          console.log('   ✅ Added relationshipCollection to admin_metadata renderAs enum');
        } catch (error2) {
          if (error2.message.includes('already exists')) {
            console.log('   ℹ️  relationshipCollection already exists in admin_metadata renderAs enum (skipping)');
          } else {
            throw error2;
          }
        }
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migration completed successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing ENUM values directly
    // To rollback, we would need to:
    // 1. Update all rows with 'relationshipCollection' to 'partsCollection' or another value
    // 2. Drop and recreate the ENUM type
    // This is complex and not recommended, so we leave the ENUM value in place
    console.warn('[Migration] Cannot remove ENUM value - PostgreSQL limitation. Manual cleanup required if needed.');
  },
}
