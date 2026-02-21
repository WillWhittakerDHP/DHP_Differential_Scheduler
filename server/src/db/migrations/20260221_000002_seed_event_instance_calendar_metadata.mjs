/**
 * Migration: Seed admin_metadata for new EventInstance Google Calendar properties
 * Date: 2026-02-21
 * Purpose: Add admin_metadata records so the new calendar property fields appear
 *          in EntityCard expanded view on the Instances tab Events section.
 *          Uses the global EventInstance sentinel entity_id (00000000-0000-0000-0000-000000000012).
 */

export default {
  async up(queryInterface, _Sequelize) {
    const entityType = 'eventInstance';
    const metadataType = 'primitive';
    const entityId = '00000000-0000-0000-0000-000000000012';

    const fields = [
      { field_key: 'visibility',               label: 'Visibility',               data_type: 'string',  render_as: 'select',       visibility: 'expandedDirect', layout: 'inline',  display_order: 10 },
      { field_key: 'transparency',             label: 'Show As',                  data_type: 'string',  render_as: 'select',       visibility: 'expandedDirect', layout: 'inline',  display_order: 11 },
      { field_key: 'status',                   label: 'Event Status',             data_type: 'string',  render_as: 'select',       visibility: 'expandedDirect', layout: 'inline',  display_order: 12 },
      { field_key: 'colorId',                  label: 'Event Color',              data_type: 'string',  render_as: 'select',       visibility: 'expandedDirect', layout: 'inline',  display_order: 13 },
      { field_key: 'guestsCanModify',          label: 'Guests Can Modify',        data_type: 'boolean', render_as: 'statusButton', visibility: 'expandedDirect', layout: 'inline',  display_order: 20 },
      { field_key: 'guestsCanInviteOthers',    label: 'Guests Can Invite Others', data_type: 'boolean', render_as: 'statusButton', visibility: 'expandedDirect', layout: 'inline',  display_order: 21 },
      { field_key: 'guestsCanSeeOtherGuests',  label: 'Guests Can See Guests',    data_type: 'boolean', render_as: 'statusButton', visibility: 'expandedDirect', layout: 'inline',  display_order: 22 },
      { field_key: 'sendUpdates',              label: 'Send Invitations',         data_type: 'string',  render_as: 'select',       visibility: 'expandedDirect', layout: 'inline',  display_order: 30 },
      { field_key: 'addConferenceLink',        label: 'Google Meet',              data_type: 'boolean', render_as: 'statusButton', visibility: 'expandedDirect', layout: 'inline',  display_order: 31 },
      { field_key: 'reminderOverrides',        label: 'Reminder Overrides',       data_type: 'string',  render_as: 'text',         visibility: 'expandedDirect', layout: 'stacked', display_order: 40 },
    ];

    for (const field of fields) {
      await queryInterface.sequelize.query(`
        INSERT INTO public.admin_metadata (
          id, metadata_type, entity_type, entity_id, field_key, data_type,
          label, is_required, visibility, layout, display_order, render_as,
          panel, bulk_edit, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), '${metadataType}', '${entityType}', '${entityId}',
          '${field.field_key}', '${field.data_type}',
          '${field.label}', false, '${field.visibility}', '${field.layout}',
          ${field.display_order}, '${field.render_as}',
          'none', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
      `);
    }

    console.log('[seed_event_instance_calendar_metadata] Seeded 10 admin_metadata records for new EventInstance calendar fields');
  },

  async down(queryInterface, _Sequelize) {
    const fieldKeys = [
      'visibility', 'transparency', 'status', 'colorId',
      'guestsCanModify', 'guestsCanInviteOthers', 'guestsCanSeeOtherGuests',
      'sendUpdates', 'addConferenceLink', 'reminderOverrides',
    ];

    for (const key of fieldKeys) {
      await queryInterface.sequelize.query(`
        DELETE FROM public.admin_metadata
        WHERE entity_type = 'eventInstance'
          AND entity_id = '00000000-0000-0000-0000-000000000012'
          AND field_key = '${key}';
      `);
    }

    console.log('[seed_event_instance_calendar_metadata] Removed calendar field metadata for EventInstance');
  },
};
