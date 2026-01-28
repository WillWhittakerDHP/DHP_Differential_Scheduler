/**
 * Migration: Add 'staticAsTitle' to visibility enums
 * Date: 2026-01-15
 * Purpose: Add 'staticAsTitle' visibility type for name fields that render left-justified
 *          and read-only when collapsed
 * 
 * LEARNING: staticAsTitle is a new visibility type for fields that should always render
 *           in the title row (left-justified) and be read-only when the card is collapsed
 * WHY: Name fields need special handling - always visible, left-justified, read-only when collapsed
 * PATTERN: Add new enum value to both admin_input_metadata and admin_relationship_metadata enums
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting add staticAsTitle to visibility enum migration...');

    // Add 'staticAsTitle' to enum_admin_input_metadata_visibility enum type
    try {
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'staticAsTitle' 
            AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'enum_admin_input_metadata_visibility'
            )
          ) THEN
            ALTER TYPE enum_admin_input_metadata_visibility ADD VALUE 'staticAsTitle';
          END IF;
        END $$;
      `);
      console.log('✅ Added staticAsTitle to enum_admin_input_metadata_visibility');
    } catch (error) {
      console.error('❌ Error adding staticAsTitle to enum_admin_input_metadata_visibility:', error);
      throw error;
    }

    // Add 'staticAsTitle' to enum_admin_relationship_metadata_visibility enum type
    try {
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'staticAsTitle' 
            AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_visibility'
            )
          ) THEN
            ALTER TYPE enum_admin_relationship_metadata_visibility ADD VALUE 'staticAsTitle';
          END IF;
        END $$;
      `);
      console.log('✅ Added staticAsTitle to enum_admin_relationship_metadata_visibility');
    } catch (error) {
      console.error('❌ Error adding staticAsTitle to enum_admin_relationship_metadata_visibility:', error);
      throw error;
    }

    console.log('✅ Completed add staticAsTitle to visibility enum migration');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting add staticAsTitle to visibility enum migration...');
    console.log('⚠️  Note: PostgreSQL does not support removing enum values easily.');
    console.log('⚠️  The staticAsTitle value will remain in the enum but should not be used.');
    console.log('✅ Revert completed (enum value remains but unused)');
  }
};
