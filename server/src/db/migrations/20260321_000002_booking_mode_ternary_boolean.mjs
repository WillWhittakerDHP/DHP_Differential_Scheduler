/**
 * Migration: booking_mode uses ternary_boolean (aligned with differential / agent_permissions).
 * Migrates legacy booking_mode_enum values; updates admin_metadata; seeds agentPermissions rows.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.block_instances
        ALTER COLUMN booking_mode DROP DEFAULT;

      ALTER TABLE public.block_instances
        ALTER COLUMN booking_mode TYPE public.ternary_boolean
        USING (
          CASE booking_mode::text
            WHEN 'standalone' THEN 'false'::public.ternary_boolean
            WHEN 'addOn' THEN 'true'::public.ternary_boolean
            WHEN 'both' THEN 'override'::public.ternary_boolean
            WHEN 'true' THEN 'true'::public.ternary_boolean
            WHEN 'false' THEN 'false'::public.ternary_boolean
            WHEN 'override' THEN 'override'::public.ternary_boolean
            ELSE 'false'::public.ternary_boolean
          END
        );

      ALTER TABLE public.block_instances
        ALTER COLUMN booking_mode SET DEFAULT 'false'::public.ternary_boolean;
    `)

    await sequelize.query(`
      DROP TYPE IF EXISTS public.booking_mode_enum;
    `)

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET
        data_type = 'ternary',
        render_as = 'statusButton',
        status_button_color = COALESCE(NULLIF(TRIM(status_button_color), ''), 'secondary'),
        input_config = NULL
      WHERE entity_type = 'blockInstance'
        AND field_key = 'bookingMode';
    `)

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET data_type = 'ternary'
      WHERE entity_type = 'blockInstance'
        AND field_key = 'differential';
    `)

    await sequelize.query(`
      INSERT INTO public.admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key, data_type, label, is_required,
        visibility, layout, display_order, render_as, status_button_color, panel, bulk_edit, input_config,
        created_at, updated_at, block_shape_ref
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'blockInstance',
        '00000000-0000-0000-0000-000000000004',
        'agentPermissions',
        'ternary',
        'Agent Permissions',
        false,
        'expandedDirect',
        'stacked',
        11,
        'statusButton',
        'info',
        'none',
        true,
        NULL,
        NOW(),
        NOW(),
        s.block_shape_ref
      FROM (
        SELECT DISTINCT block_shape_ref
        FROM public.admin_metadata
        WHERE entity_type = 'blockInstance'
          AND field_key = 'bookingMode'
          AND block_shape_ref IS NOT NULL
      ) s
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.admin_metadata am
        WHERE am.entity_type = 'blockInstance'
          AND am.field_key = 'agentPermissions'
          AND am.block_shape_ref IS NOT DISTINCT FROM s.block_shape_ref
      );
    `)

    await sequelize.query(`
      INSERT INTO public.admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key, data_type, label, is_required,
        visibility, layout, display_order, render_as, status_button_color, panel, bulk_edit, input_config,
        created_at, updated_at, block_shape_ref
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'blockInstance',
        '00000000-0000-0000-0000-000000000004',
        'agentPermissions',
        'ternary',
        'Agent Permissions',
        false,
        'expandedDirect',
        'stacked',
        11,
        'statusButton',
        'info',
        'none',
        true,
        NULL,
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.admin_metadata am
        WHERE am.entity_type = 'blockInstance'
          AND am.field_key = 'agentPermissions'
          AND am.block_shape_ref IS NULL
      );
    `)
  },

  async down() {
    throw new Error(
      'Irreversible: booking_mode_enum and enum values cannot be restored without data loss assumptions.'
    )
  },
}
