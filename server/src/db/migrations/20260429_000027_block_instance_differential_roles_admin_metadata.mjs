/**
 * Block instance admin: primitive field for differential_event_role_overrides matrix (global template).
 */

const BLOCK_INSTANCE_GLOBAL_ID = '00000000-0000-0000-0000-000000000004'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

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
        'blockInstance',
        :globalId::uuid,
        'differentialEventRoleOverrides',
        'string',
        'Differential roles',
        false,
        'expandedPanel',
        'stacked',
        5,
        'text',
        NULL,
        'events',
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
        WHERE m.entity_type = 'blockInstance'
          AND m.entity_id = :globalId::uuid
          AND m.field_key = 'differentialEventRoleOverrides'
      );
    `,
      { replacements: { globalId: BLOCK_INSTANCE_GLOBAL_ID } }
    )
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(
      `
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'blockInstance'
        AND entity_id = :globalId::uuid
        AND field_key = 'differentialEventRoleOverrides';
    `,
      { replacements: { globalId: BLOCK_INSTANCE_GLOBAL_ID } }
    )
  },
}
