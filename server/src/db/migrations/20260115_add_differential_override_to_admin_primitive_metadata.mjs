/**
 * Migration: Add differentialOverride to admin_primitive_metadata for part instances
 * Date: 2026-01-15
 * Purpose: Explicitly seed differentialOverride field into admin_primitive_metadata
 *          This ensures the field is available for configuration in the admin panel
 * 
 * LEARNING: Add new primitive fields to admin_primitive_metadata with proper configuration
 * WHY: Ensures new fields are available for admin configuration
 * PATTERN: Insert with ON CONFLICT DO NOTHING to be idempotent
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding differentialOverride to admin_primitive_metadata for part instances...');

    const { v4: uuidv4 } = await import('uuid');

    // Sentinel UUID for global part instance config
    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';

    // Determine which table name exists (admin_input_metadata or admin_primitive_metadata)
    // LEARNING: Migration runs before rename (20260128), but may run after if database is already migrated
    // WHY: Need to handle both table names for idempotency
    // PATTERN: Check which table exists and use the correct name
    const [tableCheck] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_primitive_metadata'
      ) as exists;
    `);
    const tableName = tableCheck[0]?.exists ? 'admin_primitive_metadata' : 'admin_input_metadata';
    console.log(`📋 Using table: ${tableName}`);

    // Check if differentialOverride already exists
    const checkQuery = `
      SELECT id, field_key, visibility
      FROM ${tableName}
      WHERE entity_type = 'partInstance'
        AND entity_id = :entity_id
        AND field_key = 'differentialOverride'
    `;
    const [existing] = await queryInterface.sequelize.query(checkQuery, {
      replacements: {
        entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(existing) && existing.length > 0) {
      console.log('✅ differentialOverride already exists in admin_primitive_metadata');
      console.log(`   Current visibility: ${existing[0].visibility}`);
      return;
    }

    // Insert differentialOverride with proper configuration
    const insertQuery = `
      INSERT INTO ${tableName} (
        id, entity_type, entity_id, field_key, data_type, label, is_required,
        visibility, layout, display_order, section, render_as, status_button_color,
        panel, bulk_edit, inherits_from_entity_type, inherits_from_entity_id,
        created_at, updated_at
      ) VALUES (
        :id, :entity_type, :entity_id, :field_key, :data_type, :label, :is_required,
        :visibility, :layout, :display_order, :section, :render_as, :status_button_color,
        :panel, :bulk_edit, :inherits_from_entity_type, :inherits_from_entity_id,
        :created_at, :updated_at
      ) ON CONFLICT (entity_type, entity_id, field_key) DO NOTHING
    `;
    await queryInterface.sequelize.query(insertQuery, {
        replacements: {
          id: uuidv4(),
          entity_type: 'partInstance',
          entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
          field_key: 'differentialOverride',
          data_type: 'boolean',
          label: 'Differential Override',
          is_required: false,
          visibility: 'expandedDirect', // Same as other part instance fields like zeroOutPart
          layout: 'stacked',
          display_order: 6, // After zeroOutPart (5), before baseFee (7)
          section: null,
          render_as: 'text', // Will be configured to toggle in UI if needed
          status_button_color: null,
          panel: 'none',
          bulk_edit: false,
          inherits_from_entity_type: null,
          inherits_from_entity_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        type: Sequelize.QueryTypes.INSERT,
      }
    );

    console.log('✅ Added differentialOverride to admin_primitive_metadata for part instances');

    // Verify insertion
    const verifyQuery = `
      SELECT id, field_key, visibility, display_order
      FROM ${tableName}
      WHERE entity_type = 'partInstance'
        AND entity_id = :entity_id
        AND field_key = 'differentialOverride'
    `;
    const [verified] = await queryInterface.sequelize.query(verifyQuery, {
      replacements: {
        entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(verified) && verified.length > 0) {
      console.log('✅ Verification: differentialOverride successfully added');
      console.log(`   Visibility: ${verified[0].visibility}, Display Order: ${verified[0].display_order}`);
    } else {
      console.log('⚠️  Warning: differentialOverride was not found after insertion');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing differentialOverride from admin_primitive_metadata...');

    const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003';

    // Determine which table name exists
    const [tableCheck] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_primitive_metadata'
      ) as exists;
    `);
    const tableName = tableCheck[0]?.exists ? 'admin_primitive_metadata' : 'admin_input_metadata';

    const deleteQuery = `
      DELETE FROM ${tableName}
      WHERE entity_type = 'partInstance'
        AND entity_id = :entity_id
        AND field_key = 'differentialOverride'
    `;
    await queryInterface.sequelize.query(deleteQuery, {
        replacements: {
          entity_id: PART_INSTANCE_GLOBAL_CONFIG_ID,
        },
        type: Sequelize.QueryTypes.DELETE,
      }
    );

    console.log(`✅ Removed differentialOverride from ${tableName}`);
  },
};
