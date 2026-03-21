/**
 * Phase 6.12.1.1 follow-up: admin_metadata rows for event shape invite link toggles.
 * WHY: Entity cards use metadata keys from the API; without rows, includeRescheduleLink / includeCancelLink never render.
 */

const EVENT_SHAPE_GLOBAL_ID = '00000000-0000-0000-0000-000000000010'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key, data_type, label, is_required,
        visibility, layout, display_order, render_as, status_button_color, panel, bulk_edit, input_config,
        created_at, updated_at, block_shape_ref
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'eventShape',
        :eventShapeGlobalId,
        'includeRescheduleLink',
        'boolean',
        'Include reschedule link in invites',
        false,
        'expandedDirect',
        'stacked',
        5,
        'statusButton',
        'secondary',
        'none',
        false,
        NULL,
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.admin_metadata am
        WHERE am.entity_type = 'eventShape'
          AND am.entity_id = :eventShapeGlobalId::uuid
          AND am.metadata_type = 'primitive'
          AND am.field_key = 'includeRescheduleLink'
          AND am.block_shape_ref IS NULL
      );
    `,
      { replacements: { eventShapeGlobalId: EVENT_SHAPE_GLOBAL_ID } }
    )

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key, data_type, label, is_required,
        visibility, layout, display_order, render_as, status_button_color, panel, bulk_edit, input_config,
        created_at, updated_at, block_shape_ref
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'eventShape',
        :eventShapeGlobalId,
        'includeCancelLink',
        'boolean',
        'Include cancel link in invites',
        false,
        'expandedDirect',
        'stacked',
        6,
        'statusButton',
        'secondary',
        'none',
        false,
        NULL,
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.admin_metadata am
        WHERE am.entity_type = 'eventShape'
          AND am.entity_id = :eventShapeGlobalId::uuid
          AND am.metadata_type = 'primitive'
          AND am.field_key = 'includeCancelLink'
          AND am.block_shape_ref IS NULL
      );
    `,
      { replacements: { eventShapeGlobalId: EVENT_SHAPE_GLOBAL_ID } }
    )
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(
      `
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'eventShape'
        AND entity_id = :eventShapeGlobalId::uuid
        AND metadata_type = 'primitive'
        AND field_key IN ('includeRescheduleLink', 'includeCancelLink')
        AND block_shape_ref IS NULL;
    `,
      { replacements: { eventShapeGlobalId: EVENT_SHAPE_GLOBAL_ID } }
    )
  },
}
