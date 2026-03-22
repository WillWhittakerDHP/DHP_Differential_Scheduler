/**
 * Events UX + relationships panel alignment:
 * - partInstance.eventAssignments: ensure row exists; use events panel + relationshipCollection (restore UX after 000025 reference-only).
 * - partShape.validEvents: events panel + expandedPanel + relationship metadata + ic_* for validEventSelect.
 * - instanceComponents: panel relationships (matches client routing — no longer composition).
 */

const PART_INSTANCE_GLOBAL = '00000000-0000-0000-0000-000000000003'
const PART_SHAPE_GLOBAL = '00000000-0000-0000-0000-000000000002'

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
        ic_selected_parent_key = 'partInstance',
        ic_candidate_parent_key = 'partShape',
        ic_selected_child_path = ARRAY['eventAssignments']::text[],
        ic_candidate_child_path = ARRAY[]::text[],
        ic_candidate_parent_path = ARRAY['partShapeRef']::text[],
        updated_at = NOW()
      WHERE entity_type = 'partInstance'
        AND entity_id = :partInstanceGlobal::uuid
        AND field_key = 'eventAssignments';
    `,
      { replacements: { partInstanceGlobal: PART_INSTANCE_GLOBAL } }
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
        'partInstance',
        :partInstanceGlobal::uuid,
        'eventAssignments',
        'reference',
        'Event Assignments',
        false,
        'expandedPanel',
        'stacked',
        40,
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
        'partInstance',
        'partShape',
        ARRAY['eventAssignments']::text[],
        ARRAY[]::text[],
        ARRAY['partShapeRef']::text[],
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata m
        WHERE m.entity_type = 'partInstance'
          AND m.entity_id = :partInstanceGlobal::uuid
          AND m.field_key = 'eventAssignments'
          AND m.block_shape_ref IS NULL
      );
    `,
      { replacements: { partInstanceGlobal: PART_INSTANCE_GLOBAL } }
    )

    await sequelize.query(
      `
      UPDATE public.admin_metadata
      SET
        metadata_type = 'relationship',
        render_as = 'multiselect',
        visibility = 'expandedPanel',
        panel = 'events',
        data_type = 'reference',
        ic_target_mode = 'relationship',
        ic_select_mode = 'multiple',
        ic_select_type = 'validEventSelect',
        ic_target_key = 'validEvents',
        ic_global_field = 'validEvents',
        ic_placeholder = 'No valid events defined',
        ic_group_by_key = NULL,
        ic_selected_child_key = 'eventShape',
        ic_candidate_child_key = 'eventShape',
        ic_selected_parent_key = 'partShape',
        ic_candidate_parent_key = 'partShape',
        ic_selected_child_path = ARRAY['validEvents']::text[],
        ic_candidate_child_path = ARRAY[]::text[],
        ic_candidate_parent_path = ARRAY[]::text[],
        updated_at = NOW()
      WHERE entity_type = 'partShape'
        AND entity_id = :partShapeGlobal::uuid
        AND field_key = 'validEvents';
    `,
      { replacements: { partShapeGlobal: PART_SHAPE_GLOBAL } }
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
        'partShape',
        :partShapeGlobal::uuid,
        'validEvents',
        'reference',
        'Valid Events',
        false,
        'expandedPanel',
        'stacked',
        35,
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
        'partShape',
        'partShape',
        ARRAY['validEvents']::text[],
        ARRAY[]::text[],
        ARRAY[]::text[],
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_metadata m
        WHERE m.entity_type = 'partShape'
          AND m.entity_id = :partShapeGlobal::uuid
          AND m.field_key = 'validEvents'
          AND m.block_shape_ref IS NULL
      );
    `,
      { replacements: { partShapeGlobal: PART_SHAPE_GLOBAL } }
    )

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET panel = 'relationships', updated_at = NOW()
      WHERE metadata_type = 'relationship'
        AND field_key = 'instanceComponents'
        AND panel IS DISTINCT FROM 'relationships';
    `)
  },
}
