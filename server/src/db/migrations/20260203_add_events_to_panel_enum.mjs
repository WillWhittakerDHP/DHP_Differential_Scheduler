/**
 * Migration: Add 'events' to panel enum
 * Date: 2026-01-30
 * Purpose: Add 'events' as a valid panel type option for metadata fields
 * 
 * LEARNING: PostgreSQL enums can be extended with ALTER TYPE ... ADD VALUE
 * WHY: Need to add 'events' panel type without recreating the enum
 * PATTERN: Use IF NOT EXISTS pattern to safely add enum value
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding "events" to panel enum...');

    // Add 'events' to the enum_admin_metadata_panel type if it doesn't exist
    // LEARNING: PostgreSQL doesn't support IF NOT EXISTS for ALTER TYPE ADD VALUE
    // WHY: Need to check if value exists before adding
    // PATTERN: Use DO block with exception handling
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Check if 'events' already exists in the enum
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_enum 
          WHERE enumlabel = 'events' 
          AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'enum_admin_metadata_panel'
          )
        ) THEN
          -- Add 'events' to the enum
          ALTER TYPE enum_admin_metadata_panel ADD VALUE 'events';
          RAISE NOTICE 'Added "events" to enum_admin_metadata_panel';
        ELSE
          RAISE NOTICE '"events" already exists in enum_admin_metadata_panel, skipping';
        END IF;
      END $$;
    `);

    console.log('✅ Added "events" to panel enum');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing "events" from panel enum...');

    // LEARNING: PostgreSQL doesn't support removing enum values directly
    // WHY: Enum values can't be removed once added (would break existing data)
    // PATTERN: This migration is irreversible - enum values can't be removed
    // NOTE: If we need to remove 'events', we'd need to:
    // 1. Update all records using 'events' to another value
    // 2. Recreate the enum without 'events'
    // 3. Update the column to use the new enum
    
    console.log('⚠️  Cannot remove enum values in PostgreSQL - migration is irreversible');
    console.log('   If needed, update all records using "events" panel and recreate enum');
  },
};
