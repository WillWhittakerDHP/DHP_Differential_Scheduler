/**
 * Admin: validEvents belongs to blockShape (not partShape).
 * Remove partInstance.eventAssignments metadata (events attach to block instances only).
 */

/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {typeof import('sequelize').Sequelize} SequelizeCtor
 * @param {string} tableName
 */
async function publicTableExists(sequelize, SequelizeCtor, tableName) {
  const { QueryTypes } = SequelizeCtor
  const rows = await sequelize.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = :tableName
     LIMIT 1`,
    { replacements: { tableName }, type: QueryTypes.SELECT },
  )
  return rows.length > 0
}

const BLOCK_SHAPE_GLOBAL = '00000000-0000-0000-0000-000000000001'

/** @param {import('sequelize').QueryInterface} queryInterface */
export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    const { Sequelize } = await import('sequelize')

    if (!(await publicTableExists(sequelize, Sequelize, 'admin_metadata'))) {
      console.info('[migration 000036] public.admin_metadata absent; skipping.')
      return
    }

    await sequelize.query(
      `
      UPDATE public.admin_metadata
      SET
        entity_type = 'blockShape',
        entity_id = :blockShapeGlobal::uuid,
        ic_selected_parent_key = 'blockShape',
        ic_candidate_parent_key = 'blockShape',
        ic_selected_child_path = ARRAY['validEvents']::text[],
        ic_candidate_child_path = ARRAY[]::text[],
        ic_candidate_parent_path = ARRAY[]::text[],
        updated_at = NOW()
      WHERE metadata_type = 'relationship'
        AND field_key = 'validEvents';
    `,
      { replacements: { blockShapeGlobal: BLOCK_SHAPE_GLOBAL } },
    )

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
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
      )
      SELECT
        gen_random_uuid(),
        'relationship',
        'blockShape',
        :blockShapeGlobal::uuid,
        'validEvents',
        'reference',
        'Valid Events',
        false,
        'expandedPanel',
        'stacked',
        4,
        'multiselect',
        NULL,
        'events',
        false,
        'relationship',
        'multiple',
        'validEventSelect',
        'validEvents',
        'validEvents',
        'No valid events defined',
        NULL,
        'eventShape',
        'eventShape',
        'blockShape',
        'blockShape',
        ARRAY['validEvents']::text[],
        ARRAY[]::text[],
        ARRAY[]::text[],
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata m
        WHERE m.entity_type = 'blockShape'
          AND m.entity_id = :blockShapeGlobal::uuid
          AND m.field_key = 'validEvents'
          AND m.block_shape_ref IS NULL
      );
    `,
      { replacements: { blockShapeGlobal: BLOCK_SHAPE_GLOBAL } },
    )

    await sequelize.query(
      `
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'partInstance'
        AND field_key = 'eventAssignments';
    `,
    )
  },
}
