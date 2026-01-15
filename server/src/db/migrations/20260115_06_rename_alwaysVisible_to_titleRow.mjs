/**
 * Migration: Rename 'alwaysVisible' to 'titleRow' in visibility enums
 * Date: 2026-01-15
 * Purpose: Rename the 'alwaysVisible' enum value to 'titleRow' for consistency
 *          across the entire stack (database to frontend)
 * 
 * LEARNING: Consistent terminology eliminates naming confusion
 * WHY: "titleRow" accurately describes where these fields render (the title row
 *      at the top of EntityCard, visible both collapsed and expanded)
 * PATTERN: Alter ENUM type, then update all existing rows
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting rename alwaysVisible to titleRow migration...');

    // Alter enum_admin_input_metadata_visibility enum type
    // LEARNING: PostgreSQL doesn't support renaming enum values directly
    // WHY: Must add new value, update rows, then remove old value
    // PATTERN: Use ALTER TYPE ... ADD VALUE, UPDATE, then ALTER TYPE ... RENAME VALUE
    try {
      // Step 1: Add 'titleRow' to the enum (if it doesn't exist)
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'titleRow' 
            AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'enum_admin_input_metadata_visibility'
            )
          ) THEN
            ALTER TYPE enum_admin_input_metadata_visibility ADD VALUE 'titleRow';
          END IF;
        END $$;
      `);
      console.log('✅ Added titleRow to enum_admin_input_metadata_visibility');

      // Step 2: Update all rows with 'alwaysVisible' to 'titleRow'
      const [inputMetadataUpdated] = await queryInterface.sequelize.query(`
        UPDATE admin_input_metadata 
        SET visibility = 'titleRow' 
        WHERE visibility = 'alwaysVisible';
      `);
      console.log(`✅ Updated ${inputMetadataUpdated[1] || 0} rows in admin_input_metadata`);

      // Step 3: Remove 'alwaysVisible' from enum (PostgreSQL 10+ supports this)
      // LEARNING: We can't directly remove enum values, but we can rename the old value
      // WHY: PostgreSQL doesn't allow removing enum values that are still referenced
      // PATTERN: Since we've updated all rows, we can try to remove it, but it's safer to leave it
      //          and just ensure all code uses 'titleRow'
      // NOTE: Leaving 'alwaysVisible' in enum for now to avoid breaking existing code
      //       It will be removed in a future migration after all code is updated
    } catch (error) {
      console.error('❌ Error updating enum_admin_input_metadata_visibility:', error);
      throw error;
    }

    // Alter enum_admin_relationship_metadata_visibility enum type
    try {
      // Step 1: Add 'titleRow' to the enum (if it doesn't exist)
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'titleRow' 
            AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'enum_admin_relationship_metadata_visibility'
            )
          ) THEN
            ALTER TYPE enum_admin_relationship_metadata_visibility ADD VALUE 'titleRow';
          END IF;
        END $$;
      `);
      console.log('✅ Added titleRow to enum_admin_relationship_metadata_visibility');

      // Step 2: Update all rows with 'alwaysVisible' to 'titleRow'
      const [relationshipMetadataUpdated] = await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata 
        SET visibility = 'titleRow' 
        WHERE visibility = 'alwaysVisible';
      `);
      console.log(`✅ Updated ${relationshipMetadataUpdated[1] || 0} rows in admin_relationship_metadata`);

      // Step 3: Leave 'alwaysVisible' in enum for now (see note above)
    } catch (error) {
      console.error('❌ Error updating enum_admin_relationship_metadata_visibility:', error);
      throw error;
    }

    console.log('✅ Completed rename alwaysVisible to titleRow migration');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting rename alwaysVisible to titleRow migration...');

    // Revert admin_input_metadata
    try {
      await queryInterface.sequelize.query(`
        UPDATE admin_input_metadata 
        SET visibility = 'alwaysVisible' 
        WHERE visibility = 'titleRow';
      `);
      console.log('✅ Reverted admin_input_metadata rows');
    } catch (error) {
      console.error('❌ Error reverting admin_input_metadata:', error);
      throw error;
    }

    // Revert admin_relationship_metadata
    try {
      await queryInterface.sequelize.query(`
        UPDATE admin_relationship_metadata 
        SET visibility = 'alwaysVisible' 
        WHERE visibility = 'titleRow';
      `);
      console.log('✅ Reverted admin_relationship_metadata rows');
    } catch (error) {
      console.error('❌ Error reverting admin_relationship_metadata:', error);
      throw error;
    }

    // NOTE: We don't remove 'titleRow' from the enum in down() because
    // PostgreSQL doesn't support removing enum values easily
    // The enum will still contain 'titleRow' but it won't be used

    console.log('✅ Completed revert rename alwaysVisible to titleRow migration');
  }
};
