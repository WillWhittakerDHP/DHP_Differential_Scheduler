/**
 * Block instance event assignments: same relationship key as part instances (`eventAssignments`),
 * but parent_kind = blockInstance. Put metadata on Events panel with ic_* for blockShapeRef candidates.
 */

const BLOCK_INSTANCE_GLOBAL = '00000000-0000-0000-0000-000000000004'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(
      `
      UPDATE public.admin_metadata
      SET
        metadata_type = 'relationship',
        render_as = 'relationshipCollection',
        visibility = 'expandedPanel',
        panel = 'events',
        data_type = 'reference',
        ic_target_mode = 'relationship',
        ic_select_mode = 'multiple',
        ic_select_type = 'eventAssignmentSelect',
        ic_target_key = 'eventAssignments',
        ic_global_field = 'eventAssignments',
        ic_placeholder = 'No events selected',
        ic_group_by_key = 'eventShapeRef',
        ic_selected_child_key = 'eventInstance',
        ic_candidate_child_key = 'eventInstance',
        ic_selected_parent_key = 'blockInstance',
        ic_candidate_parent_key = 'blockShape',
        ic_selected_child_path = ARRAY['eventAssignments']::text[],
        ic_candidate_child_path = ARRAY[]::text[],
        ic_candidate_parent_path = ARRAY['blockShapeRef']::text[],
        updated_at = NOW()
      WHERE entity_type = 'blockInstance'
        AND field_key = 'eventAssignments';
    `
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
        'blockInstance',
        :blockInstanceGlobal::uuid,
        'eventAssignments',
        'reference',
        'Event Assignments',
        false,
        'expandedPanel',
        'stacked',
        42,
        'relationshipCollection',
        NULL,
        'events',
        false,
        'relationship',
        'multiple',
        'eventAssignmentSelect',
        'eventAssignments',
        'eventAssignments',
        'No events selected',
        'eventShapeRef',
        'eventInstance',
        'eventInstance',
        'blockInstance',
        'blockShape',
        ARRAY['eventAssignments']::text[],
        ARRAY[]::text[],
        ARRAY['blockShapeRef']::text[],
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata m
        WHERE m.entity_type = 'blockInstance'
          AND m.entity_id = :blockInstanceGlobal::uuid
          AND m.field_key = 'eventAssignments'
          AND m.block_shape_ref IS NULL
      );
    `,
      { replacements: { blockInstanceGlobal: BLOCK_INSTANCE_GLOBAL } }
    )
  },
}
