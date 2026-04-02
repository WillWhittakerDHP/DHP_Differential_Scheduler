/**
 * Feature 20 — Surface placement_kind / anchor_edge in admin event shape cards.
 *
 * 000061 added DB columns and pruned legacy keys but did not seed admin_metadata.
 * Without rows for placementKind (+ anchorEdge for form path state), the grouped
 * EventShapePlacementFields control never mounts.
 */

const EVENT_SHAPE_GLOBAL_ID = '00000000-0000-0000-0000-000000000010'

const PLACEMENT_OPTIONS = [
  { label: 'Primary', valuePayload: JSON.stringify('primary') },
  { label: 'Secondary', valuePayload: JSON.stringify('secondary') },
  { label: 'Marginal', valuePayload: JSON.stringify('marginal') },
  { label: 'Floating', valuePayload: JSON.stringify('floating') },
]

const ANCHOR_OPTIONS = [
  { label: 'Start', valuePayload: JSON.stringify('start') },
  { label: 'End', valuePayload: JSON.stringify('end') },
]

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

async function seedSelectPrimitive(sequelize, params) {
  const {
    fieldKey,
    label,
    visibility,
    layout,
    displayOrder,
    isRequired,
    options,
  } = params

  await sequelize.query(
    `
      INSERT INTO public.admin_metadata (
        ${ADMIN_METADATA_INSERT_COLUMNS}
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'eventShape',
        :globalId::uuid,
        :fieldKey,
        'string',
        :label,
        :isRequired,
        :visibility,
        :layout,
        :displayOrder,
        'select',
        NULL,
        'none',
        false,
        ${ADMIN_METADATA_IC_NULLS},
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.admin_metadata am
        WHERE am.entity_type = 'eventShape'
          AND am.entity_id = :globalId::uuid
          AND am.metadata_type = 'primitive'
          AND am.field_key = :fieldKey
          AND am.block_shape_ref IS NULL
      );
    `,
    {
      replacements: {
        globalId: EVENT_SHAPE_GLOBAL_ID,
        fieldKey,
        label,
        isRequired,
        visibility,
        layout,
        displayOrder,
      },
    }
  )

  const [rows] = await sequelize.query(
    `
      SELECT id FROM public.admin_metadata
      WHERE entity_type = 'eventShape'
        AND entity_id = :globalId::uuid
        AND metadata_type = 'primitive'
        AND field_key = :fieldKey
        AND block_shape_ref IS NULL
      LIMIT 1;
    `,
    { replacements: { globalId: EVENT_SHAPE_GLOBAL_ID, fieldKey } }
  )

  const metaId = rows?.[0]?.id
  if (!metaId) {
    return
  }

  const [optTable] = await sequelize.query(
    `SELECT 1 AS ok FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'admin_metadata_select_options'
     LIMIT 1`
  )
  if (!Array.isArray(optTable) || optTable.length === 0) {
    return
  }

  const [existingOpts] = await sequelize.query(
    `SELECT COUNT(*)::int AS c FROM public.admin_metadata_select_options WHERE admin_metadata_id = :id`,
    { replacements: { id: metaId } }
  )
  const optCount = Number(existingOpts?.[0]?.c ?? 0)
  if (optCount > 0) {
    return
  }

  for (let i = 0; i < options.length; i += 1) {
    const opt = options[i]
    await sequelize.query(
      `
        INSERT INTO public.admin_metadata_select_options (
          admin_metadata_id,
          display_order,
          label,
          value_payload,
          created_at,
          updated_at
        ) VALUES (
          :adminMetadataId,
          :displayOrder,
          :label,
          :valuePayload,
          NOW(),
          NOW()
        );
      `,
      {
        replacements: {
          adminMetadataId: metaId,
          displayOrder: i,
          label: opt.label,
          valuePayload: opt.valuePayload,
        },
      }
    )
  }
}

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await seedSelectPrimitive(sequelize, {
      fieldKey: 'placementKind',
      label: 'Placement kind',
      visibility: 'expandedDirect',
      layout: 'inline',
      displayOrder: 0,
      isRequired: true,
      options: PLACEMENT_OPTIONS,
    })

    await seedSelectPrimitive(sequelize, {
      fieldKey: 'anchorEdge',
      label: 'Anchor edge',
      visibility: 'hidden',
      layout: 'stacked',
      displayOrder: 999,
      isRequired: false,
      options: ANCHOR_OPTIONS,
    })
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      DELETE FROM public.admin_metadata_select_options
      WHERE admin_metadata_id IN (
        SELECT id FROM public.admin_metadata
        WHERE entity_type = 'eventShape'
          AND entity_id = '${EVENT_SHAPE_GLOBAL_ID}'::uuid
          AND field_key IN ('placementKind', 'anchorEdge')
      );
    `)
    await sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'eventShape'
        AND entity_id = '${EVENT_SHAPE_GLOBAL_ID}'::uuid
        AND field_key IN ('placementKind', 'anchorEdge');
    `)
  },
}
