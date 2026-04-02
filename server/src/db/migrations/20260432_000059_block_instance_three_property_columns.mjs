/**
 * Block instances: add orchestrator + wizard_visible; drop booking_mode, differential,
 * differential_event_role_overrides. Block instance versions: add same booleans; drop differential.
 * Admin metadata: remove legacy blockInstance fields; seed orchestrator / wizard_visible.
 *
 * WHY: `admin_metadata` no longer has `input_config` — normalized config uses `ic_*` columns (see 20260432_000051).
 * Idempotent: safe if DDL already applied (failed mid-migration) before SequelizeMeta recorded this file.
 */

const BLOCK_INSTANCE_GLOBAL_ID = '00000000-0000-0000-0000-000000000004'

/** Matches INSERT shape in 20260429_000027_block_instance_differential_roles_admin_metadata.mjs */
const ADMIN_METADATA_INSERT_COLUMNS = `
        id,
        metadata_type,
        entity_type,
        entity_id,
        field_key,
        data_type,
        label,
        is_required,
        visibility,
        layout,
        display_order,
        render_as,
        status_button_color,
        panel,
        bulk_edit,
        ic_target_mode,
        ic_select_mode,
        ic_select_type,
        ic_target_key,
        ic_global_field,
        ic_placeholder,
        ic_group_by_key,
        ic_selected_child_key,
        ic_candidate_child_key,
        ic_selected_parent_key,
        ic_candidate_parent_key,
        ic_selected_child_path,
        ic_candidate_child_path,
        ic_candidate_parent_path,
        created_at,
        updated_at,
        block_shape_ref
`

const ADMIN_METADATA_IC_NULLS = `
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
`

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.block_instances
        ADD COLUMN IF NOT EXISTS orchestrator BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS wizard_visible BOOLEAN NOT NULL DEFAULT true;

      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_instances' AND column_name = 'booking_mode'
        ) THEN
          UPDATE public.block_instances
          SET
            wizard_visible = (booking_mode IS DISTINCT FROM 'true'::public.ternary_boolean),
            orchestrator = (differential = 'true'::public.ternary_boolean);
          ALTER TABLE public.block_instances
            DROP COLUMN booking_mode,
            DROP COLUMN differential,
            DROP COLUMN differential_event_role_overrides;
        END IF;
      END $$;
    `)

    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        ADD COLUMN IF NOT EXISTS orchestrator BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS wizard_visible BOOLEAN NOT NULL DEFAULT true;

      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_instance_versions' AND column_name = 'differential'
        ) THEN
          UPDATE public.block_instance_versions
          SET
            orchestrator = (differential = 'true'::public.ternary_boolean),
            wizard_visible = true;
          ALTER TABLE public.block_instance_versions
            DROP COLUMN differential;
        END IF;
      END $$;
    `)

    await sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'blockInstance'
        AND field_key IN ('bookingMode', 'differential', 'differentialEventRoleOverrides');
    `)

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
        ${ADMIN_METADATA_INSERT_COLUMNS}
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'blockInstance',
        :globalId::uuid,
        'orchestrator',
        'boolean',
        'Orchestrator',
        false,
        'expandedDirect',
        'stacked',
        8,
        'statusButton',
        'secondary',
        'none',
        true,
        ${ADMIN_METADATA_IC_NULLS},
        NOW(),
        NOW(),
        s.block_shape_ref
      FROM (
        SELECT DISTINCT block_shape_ref
        FROM public.admin_metadata
        WHERE entity_type = 'blockInstance'
          AND field_key = 'composite'
          AND block_shape_ref IS NOT NULL
      ) s
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata am
        WHERE am.entity_type = 'blockInstance'
          AND am.field_key = 'orchestrator'
          AND am.block_shape_ref IS NOT DISTINCT FROM s.block_shape_ref
      );
    `,
      { replacements: { globalId: BLOCK_INSTANCE_GLOBAL_ID } }
    )

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
        ${ADMIN_METADATA_INSERT_COLUMNS}
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'blockInstance',
        :globalId::uuid,
        'wizardVisible',
        'boolean',
        'Wizard visible',
        false,
        'expandedDirect',
        'stacked',
        9,
        'statusButton',
        'secondary',
        'none',
        true,
        ${ADMIN_METADATA_IC_NULLS},
        NOW(),
        NOW(),
        s.block_shape_ref
      FROM (
        SELECT DISTINCT block_shape_ref
        FROM public.admin_metadata
        WHERE entity_type = 'blockInstance'
          AND field_key = 'composite'
          AND block_shape_ref IS NOT NULL
      ) s
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata am
        WHERE am.entity_type = 'blockInstance'
          AND am.field_key = 'wizardVisible'
          AND am.block_shape_ref IS NOT DISTINCT FROM s.block_shape_ref
      );
    `,
      { replacements: { globalId: BLOCK_INSTANCE_GLOBAL_ID } }
    )

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
        ${ADMIN_METADATA_INSERT_COLUMNS}
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'blockInstance',
        :globalId::uuid,
        'orchestrator',
        'boolean',
        'Orchestrator',
        false,
        'expandedDirect',
        'stacked',
        8,
        'statusButton',
        'secondary',
        'none',
        true,
        ${ADMIN_METADATA_IC_NULLS},
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata am
        WHERE am.entity_type = 'blockInstance'
          AND am.field_key = 'orchestrator'
          AND am.block_shape_ref IS NULL
      );
    `,
      { replacements: { globalId: BLOCK_INSTANCE_GLOBAL_ID } }
    )

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
        ${ADMIN_METADATA_INSERT_COLUMNS}
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'blockInstance',
        :globalId::uuid,
        'wizardVisible',
        'boolean',
        'Wizard visible',
        false,
        'expandedDirect',
        'stacked',
        9,
        'statusButton',
        'secondary',
        'none',
        true,
        ${ADMIN_METADATA_IC_NULLS},
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata am
        WHERE am.entity_type = 'blockInstance'
          AND am.field_key = 'wizardVisible'
          AND am.block_shape_ref IS NULL
      );
    `,
      { replacements: { globalId: BLOCK_INSTANCE_GLOBAL_ID } }
    )
  },

  async down() {
    throw new Error(
      'Irreversible: restored booking_mode/differential columns and admin rows require assumptions.'
    )
  },
}
