/**
 * Migration: Seed admin_metadata for EventInstance scheduledBy (include in display/export)
 * Date: 2026-03-05
 * Purpose: Phase 6.7.2 — Add scheduledBy to event instance metadata so admins can control
 *          visibility via Instance Fields modal. When visibility is not 'hidden', scheduled-by
 *          is included in event instance display/export (e.g. template variable at invite time).
 *          Uses the global EventInstance sentinel entity_id (00000000-0000-0000-0000-000000000012).
 */

export default {
  async up(queryInterface, _Sequelize) {
    const entityType = 'eventInstance'
    const metadataType = 'primitive'
    const entityId = '00000000-0000-0000-0000-000000000012'

    const [existing] = await queryInterface.sequelize.query(`
      SELECT 1 FROM public.admin_metadata
      WHERE entity_type = '${entityType}' AND entity_id = '${entityId}'
        AND metadata_type = '${metadataType}' AND field_key = 'scheduledBy'
        AND block_shape_ref IS NULL
      LIMIT 1
    `)
    if (Array.isArray(existing) && existing.length === 0) {
      await queryInterface.sequelize.query(`
        INSERT INTO public.admin_metadata (
          id, metadata_type, entity_type, entity_id, field_key, data_type,
          label, is_required, visibility, layout, display_order, render_as,
          panel, bulk_edit, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), '${metadataType}', '${entityType}', '${entityId}',
          'scheduledBy', 'string',
          'Scheduled By', false, 'hidden', 'stacked',
          50, 'text',
          'none', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `)
    }

    console.log('[seed_event_instance_scheduled_by_metadata] Seeded admin_metadata for eventInstance.scheduledBy')
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'eventInstance'
        AND entity_id = '00000000-0000-0000-0000-000000000012'
        AND field_key = 'scheduledBy';
    `)

    console.log('[seed_event_instance_scheduled_by_metadata] Removed eventInstance.scheduledBy metadata')
  },
}
