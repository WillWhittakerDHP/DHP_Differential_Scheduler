/**
 * Migration: Add partsCollection to renderAs ENUM
 * Date: 2026-01-27
 * Purpose: Add partsCollection as a valid renderAs value for declarative PartsCollection rendering
 * 
 * LEARNING: Replaces selectMode:'nested' with declarative renderAs:'partsCollection'
 * WHY: Simplifies rendering logic - renderAs alone determines component type
 * PATTERN: Add new ENUM value to both admin_input_metadata and admin_relationship_metadata tables
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('Starting migration: add partsCollection to renderAs ENUM...');
    
    // Add partsCollection to admin_input_metadata.render_as ENUM
    // Note: PostgreSQL doesn't have "IF NOT EXISTS" for ALTER TYPE ADD VALUE in older versions
    // We'll try to add it and catch the error if it already exists
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_admin_input_metadata_render_as ADD VALUE 'partsCollection';
      `);
      console.log('✓ Added partsCollection to admin_input_metadata renderAs enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠ partsCollection already exists in admin_input_metadata renderAs enum (skipping)');
      } else {
        throw error;
      }
    }
    
    // Add partsCollection to admin_relationship_metadata.render_as ENUM
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_admin_relationship_metadata_render_as ADD VALUE 'partsCollection';
      `);
      console.log('✓ Added partsCollection to admin_relationship_metadata renderAs enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠ partsCollection already exists in admin_relationship_metadata renderAs enum (skipping)');
      } else {
        throw error;
      }
    }
    
    console.log('Migration completed successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing ENUM values directly
    // To rollback, we would need to:
    // 1. Update all rows with 'partsCollection' to another value
    // 2. Drop and recreate the ENUM type
    // This is complex and not recommended, so we leave the ENUM value in place
    console.warn('[Migration] Cannot remove ENUM value - PostgreSQL limitation. Manual cleanup required if needed.');
  },
}
