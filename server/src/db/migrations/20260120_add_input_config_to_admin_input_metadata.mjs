/**
 * Migration: Add input_config column to admin_input_metadata
 * Date: 2026-01-20
 * Purpose: Add input_config JSONB column for select/multiselect/reference field configuration
 *          Remove 'toggle' from render_as enum (replaced by 'statusButton' or 'text' + boolean)
 * 
 * LEARNING: input_config stores behavioral configuration for select-like fields
 * WHY: Select fields need extra config (target entity/relationship, selectMode, groupByKey, etc.)
 *      This can't be expressed in renderAs alone, so we store it as JSONB
 * PATTERN: Only populated for fields with renderAs: select|multiselect|reference, null otherwise
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding input_config column to admin_input_metadata...');

    // Check if column already exists (idempotent migration)
    const tableDescription = await queryInterface.describeTable('admin_input_metadata');
    if (!tableDescription.input_config) {
      // Add input_config JSONB column
      await queryInterface.addColumn('admin_input_metadata', 'input_config', {
        type: Sequelize.JSONB,
        allowNull: true,
        field: 'input_config',
        comment: 'Input configuration for select/multiselect/reference fields (target entity/relationship, selectMode, groupByKey, etc.)',
      });
      console.log('✅ Added input_config column');
    } else {
      console.log('✅ input_config column already exists, skipping');
    }

    // Update render_as enum to remove 'toggle'
    // Note: We can't directly modify ENUMs in PostgreSQL, so we:
    // 1. Check if enum already has 'toggle' (if not, skip this step)
    // 2. Drop default value (required before changing enum type)
    // 3. Create new enum without 'toggle'
    // 4. Alter column to use new enum
    // 5. Drop old enum
    // 6. Rename new enum to original name
    // 7. Restore default value
    await queryInterface.sequelize.query(`
      DO $$ 
      DECLARE
        has_toggle BOOLEAN;
      BEGIN
        -- Check if 'toggle' exists in current enum
        SELECT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'toggle' 
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_admin_input_metadata_render_as'
          )
        ) INTO has_toggle;
        
        -- Only update enum if 'toggle' exists
        IF has_toggle THEN
          -- Drop default value first (required before changing enum type)
          ALTER TABLE admin_input_metadata 
            ALTER COLUMN render_as DROP DEFAULT;
          
          -- Create new enum without 'toggle'
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_render_as_new') THEN
            CREATE TYPE enum_admin_input_metadata_render_as_new AS ENUM (
              'text', 'number', 'select', 'multiselect', 'reference', 'statusButton'
            );
          END IF;
          
          -- Alter column to use new enum (cast existing values)
          ALTER TABLE admin_input_metadata 
            ALTER COLUMN render_as TYPE enum_admin_input_metadata_render_as_new 
            USING CASE 
              WHEN render_as::text = 'toggle' THEN 'statusButton'::enum_admin_input_metadata_render_as_new
              ELSE render_as::text::enum_admin_input_metadata_render_as_new
            END;
          
          -- Drop old enum
          DROP TYPE IF EXISTS enum_admin_input_metadata_render_as;
          
          -- Rename new enum to original name
          ALTER TYPE enum_admin_input_metadata_render_as_new RENAME TO enum_admin_input_metadata_render_as;
          
          -- Restore default value
          ALTER TABLE admin_input_metadata 
            ALTER COLUMN render_as SET DEFAULT 'text'::enum_admin_input_metadata_render_as;
        ELSE
          RAISE NOTICE 'Enum already updated (toggle not found), skipping enum migration';
        END IF;
      END $$;
    `);
    console.log('✅ Updated render_as enum (removed toggle, migrated to statusButton)');

    console.log('✅ Completed input_config migration');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting input_config migration...');

    // Remove input_config column
    await queryInterface.removeColumn('admin_input_metadata', 'input_config');
    console.log('✅ Removed input_config column');

    // Restore 'toggle' to render_as enum
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Create enum with 'toggle' restored
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admin_input_metadata_render_as_old') THEN
          CREATE TYPE enum_admin_input_metadata_render_as_old AS ENUM (
            'text', 'number', 'toggle', 'select', 'multiselect', 'reference', 'statusButton'
          );
        END IF;
        
        -- Alter column to use old enum
        ALTER TABLE admin_input_metadata 
          ALTER COLUMN render_as TYPE enum_admin_input_metadata_render_as_old 
          USING render_as::text::enum_admin_input_metadata_render_as_old;
        
        -- Drop new enum
        DROP TYPE IF EXISTS enum_admin_input_metadata_render_as;
        
        -- Rename old enum to original name
        ALTER TYPE enum_admin_input_metadata_render_as_old RENAME TO enum_admin_input_metadata_render_as;
      END $$;
    `);
    console.log('✅ Restored render_as enum with toggle');

    console.log('✅ Completed input_config migration rollback');
  }
};
