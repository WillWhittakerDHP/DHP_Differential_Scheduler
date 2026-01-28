/**
 * Migration: Replace isDependentInstance and visible with bookingMode enum
 * Date: 2026-01-25
 * Purpose: Replace confusing boolean fields with single enum field for clearer booking behavior
 * 
 * LEARNING: Single enum field is clearer than two booleans
 * WHY: Eliminates confusion about when services appear in booking wizard
 * PATTERN: Create enum type, migrate data, drop old columns
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migration: Replace isDependentInstance and visible with bookingMode enum...')

    // 1. Create ENUM type
    console.log('📝 Creating booking_mode_enum type...')
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE booking_mode_enum AS ENUM ('standalone', 'addOn', 'both');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('✅ Created booking_mode_enum type')

    // 2. Add booking_mode column with default
    console.log('📝 Adding booking_mode column...')
    const tableDescription = await queryInterface.describeTable('block_instances')
    
    if (!tableDescription.booking_mode) {
      await queryInterface.addColumn('block_instances', 'booking_mode', {
        type: 'booking_mode_enum',
        allowNull: false,
        defaultValue: 'standalone'
      })
      console.log('✅ Added booking_mode column to block_instances')
    } else {
      console.log('ℹ️  Column booking_mode already exists, skipping')
    }

    // 3. Migrate existing data with smart logic:
    //    - isDependentInstance = true → 'addOn'
    //    - isDependentInstance = false AND is child in dependent_instances → 'both'
    //    - isDependentInstance = false AND NOT child in dependent_instances → 'standalone'
    console.log('📝 Migrating existing data...')
    await queryInterface.sequelize.query(`
      UPDATE block_instances bi
      SET booking_mode = CASE
        WHEN bi.is_dependent_instance = true THEN 'addOn'::booking_mode_enum
        WHEN EXISTS (
          SELECT 1 
          FROM dependent_instances di 
          WHERE di.child_id = bi.id 
            AND (di.disabled IS NULL OR di.disabled = false)
        ) THEN 'both'::booking_mode_enum
        ELSE 'standalone'::booking_mode_enum
      END;
    `)
    console.log('✅ Migrated existing data to booking_mode')

    // 4. Drop old columns
    console.log('📝 Dropping old columns...')
    if (tableDescription.is_dependent_instance) {
      await queryInterface.removeColumn('block_instances', 'is_dependent_instance')
      console.log('✅ Removed is_dependent_instance column')
    }
    
    if (tableDescription.visible) {
      await queryInterface.removeColumn('block_instances', 'visible')
      console.log('✅ Removed visible column')
    }

    // 5. Update admin_metadata table
    console.log('📝 Updating admin_metadata...')
    
    // Remove old field metadata entries (both global and BlockShape-specific)
    await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata 
      WHERE entity_type = 'blockInstance' 
        AND metadata_type = 'primitive'
        AND field_key IN ('isDependentInstance', 'visible');
    `)
    console.log('✅ Removed old field metadata entries (global and BlockShape-specific)')

    // Add new bookingMode field metadata (global config)
    await queryInterface.sequelize.query(`
      INSERT INTO admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key, data_type,
        label, is_required, visibility, layout, display_order, render_as,
        panel, bulk_edit, input_config, block_shape_ref, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'primitive', 'blockInstance', 
        '00000000-0000-0000-0000-000000000004', 'bookingMode', 'string',
        'Booking Mode', true, 'expandedDirect', 'stacked', 10, 'select',
        'none', true, 
        '{"options": [
          {"value": "standalone", "label": "Standalone Only"},
          {"value": "addOn", "label": "Add-On Only"},
          {"value": "both", "label": "Standalone or Add-On"}
        ]}'::jsonb,
        NULL, -- block_shape_ref is NULL for global config
        NOW(), NOW()
      )
      ON CONFLICT (entity_type, entity_id, metadata_type, field_key, block_shape_ref) DO NOTHING;
    `)
    console.log('✅ Added bookingMode field metadata (global config)')

    // Create BlockShape-specific copies of bookingMode metadata for each BlockShape
    const [blockShapesRows] = await queryInterface.sequelize.query(`
      SELECT id FROM block_shapes ORDER BY id;
    `)
    const blockShapes = Array.isArray(blockShapesRows) ? blockShapesRows : []
    
    if (blockShapes.length > 0) {
      console.log(`📝 Creating BlockShape-specific bookingMode metadata for ${blockShapes.length} BlockShapes...`)
      
      for (const blockShape of blockShapes) {
        await queryInterface.sequelize.query(`
          INSERT INTO admin_metadata (
            id, metadata_type, entity_type, entity_id, field_key, data_type,
            label, is_required, visibility, layout, display_order, render_as,
            panel, bulk_edit, input_config, block_shape_ref, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), 'primitive', 'blockInstance', 
            '00000000-0000-0000-0000-000000000004', 'bookingMode', 'string',
            'Booking Mode', true, 'expandedDirect', 'stacked', 10, 'select',
            'none', true, 
            '{"options": [
              {"value": "standalone", "label": "Standalone Only"},
              {"value": "addOn", "label": "Add-On Only"},
              {"value": "both", "label": "Standalone or Add-On"}
            ]}'::jsonb,
            :blockShapeId,
            NOW(), NOW()
          )
          ON CONFLICT (entity_type, entity_id, metadata_type, field_key, block_shape_ref) DO NOTHING;
        `, {
          replacements: { blockShapeId: blockShape.id }
        })
      }
      console.log(`✅ Created BlockShape-specific bookingMode metadata for ${blockShapes.length} BlockShapes`)
    } else {
      console.log('ℹ️  No BlockShapes found, skipping BlockShape-specific metadata creation')
    }

    console.log('✅ Migration completed successfully')
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting migration: Restore isDependentInstance and visible columns...')

    const tableDescription = await queryInterface.describeTable('block_instances')

    // 1. Restore old columns
    if (!tableDescription.is_dependent_instance) {
      await queryInterface.addColumn('block_instances', 'is_dependent_instance', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      })
      console.log('✅ Restored is_dependent_instance column')
    }

    if (!tableDescription.visible) {
      await queryInterface.addColumn('block_instances', 'visible', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      })
      console.log('✅ Restored visible column')
    }

    // 2. Migrate data back (approximate - we can't perfectly reverse)
    await queryInterface.sequelize.query(`
      UPDATE block_instances
      SET is_dependent_instance = (booking_mode = 'addOn'::booking_mode_enum),
          visible = (booking_mode != 'addOn'::booking_mode_enum);
    `)
    console.log('✅ Migrated data back to old columns')

    // 3. Remove booking_mode column
    if (tableDescription.booking_mode) {
      await queryInterface.removeColumn('block_instances', 'booking_mode')
      console.log('✅ Removed booking_mode column')
    }

    // 4. Drop enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS booking_mode_enum;
    `)
    console.log('✅ Dropped booking_mode_enum type')

    // 5. Restore admin_metadata
    await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata 
      WHERE entity_type = 'blockInstance' 
        AND field_key = 'bookingMode';
    `)

    // Restore old metadata entries (approximate)
    await queryInterface.sequelize.query(`
      INSERT INTO admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key, data_type,
        label, is_required, visibility, layout, display_order, render_as,
        panel, bulk_edit, input_config, created_at, updated_at
      ) VALUES 
        (gen_random_uuid(), 'primitive', 'blockInstance', '00000000-0000-0000-0000-000000000004', 'isDependentInstance', 'boolean', 'Is Dependent Instance', false, 'expandedDirect', 'stacked', 999, 'text', 'none', false, null, NOW(), NOW()),
        (gen_random_uuid(), 'primitive', 'blockInstance', '00000000-0000-0000-0000-000000000004', 'visible', 'boolean', 'Visible', false, 'notConfigured', 'stacked', 999, 'text', 'none', false, null, NOW(), NOW())
      ON CONFLICT (entity_type, entity_id, metadata_type, field_key, block_shape_ref) DO NOTHING;
    `)

    console.log('✅ Migration reverted successfully')
  },
}
