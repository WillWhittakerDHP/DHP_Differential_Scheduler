/**
 * Migration: Add Ternary to Metadata DataType Enum
 * Purpose: Add 'ternary' as a valid dataType option in the admin metadata system
 * Date: 2026-01-30
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding ternary to metadata dataType enum...');

    // Add 'ternary' to the enum_admin_metadata_data_type enum
    // LEARNING: PostgreSQL allows adding values to existing enums
    // WHY: Enables selecting 'ternary' as a dataType in the metadata editor
    // PATTERN: Use IF NOT EXISTS to make migration idempotent
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'ternary' 
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_admin_metadata_data_type'
          )
        ) THEN
          ALTER TYPE enum_admin_metadata_data_type ADD VALUE 'ternary';
        END IF;
      END $$;
    `);
    
    console.log('✅ Added ternary to enum_admin_metadata_data_type');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing ternary from metadata dataType enum...');
    console.log('⚠️  Cannot automatically remove enum values in PostgreSQL');
    console.log('ℹ️  Manual intervention required to remove ternary from enum');
    console.log('ℹ️  Note: This would require recreating the enum type, which is complex');
  }
};
