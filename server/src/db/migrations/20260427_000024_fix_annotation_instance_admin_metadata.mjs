/**
 * Annotation instance admin cards: show text + active; hide auto-set / legacy fields.
 *
 * INSERT aligns with normalized admin_metadata (ic_* columns), not legacy input_config JSONB.
 * See 20260401_000014_admin_metadata_normalize_input_config.mjs.
 */

const ANNOTATION_INSTANCE_GLOBAL_ID = '00000000-0000-0000-0000-000000000013'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(
      `
      UPDATE public.admin_metadata
      SET
        visibility = 'expandedDirect',
        display_order = 10,
        updated_at = NOW()
      WHERE entity_type = 'annotationInstance'
        AND entity_id = :globalId::uuid
        AND field_key = 'text';
    `,
      { replacements: { globalId: ANNOTATION_INSTANCE_GLOBAL_ID } }
    )

    await sequelize.query(
      `
      UPDATE public.admin_metadata
      SET
        visibility = 'hidden',
        display_order = 999,
        updated_at = NOW()
      WHERE entity_type = 'annotationInstance'
        AND entity_id = :globalId::uuid
        AND field_key IN ('type', 'userTypeBlock');
    `,
      { replacements: { globalId: ANNOTATION_INSTANCE_GLOBAL_ID } }
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
        'primitive',
        'annotationInstance',
        :globalId::uuid,
        'active',
        'boolean',
        'Active',
        false,
        'titleRow',
        'stacked',
        1,
        'statusButton',
        'primary',
        'none',
        false,
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
        NULL,
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata m
        WHERE m.entity_type = 'annotationInstance'
          AND m.entity_id = :globalId::uuid
          AND m.field_key = 'active'
      );
    `,
      { replacements: { globalId: ANNOTATION_INSTANCE_GLOBAL_ID } }
    )
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(
      `
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'annotationInstance'
        AND entity_id = :globalId::uuid
        AND field_key = 'active';
    `,
      { replacements: { globalId: ANNOTATION_INSTANCE_GLOBAL_ID } }
    )

    await sequelize.query(
      `
      UPDATE public.admin_metadata
      SET
        visibility = 'notConfigured',
        display_order = 999,
        updated_at = NOW()
      WHERE entity_type = 'annotationInstance'
        AND entity_id = :globalId::uuid
        AND field_key IN ('text', 'type', 'userTypeBlock');
    `,
      { replacements: { globalId: ANNOTATION_INSTANCE_GLOBAL_ID } }
    )
  },
}
