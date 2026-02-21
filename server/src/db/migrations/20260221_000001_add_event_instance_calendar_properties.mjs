/**
 * Migration: Add Google Calendar configurable properties to event_instances
 * Date: 2026-02-21
 * Purpose: EventInstances currently only store title/description/location templates.
 *          This adds all Google Calendar event behavior properties so admins can
 *          configure visibility, free/busy, guest permissions, Meet links, colors,
 *          notification behavior, and reminders per event instance.
 */

export default {
  async up(queryInterface, _Sequelize) {
    const table = 'event_instances';

    await queryInterface.sequelize.query(`
      ALTER TABLE public.${table}
        ADD COLUMN IF NOT EXISTS visibility varchar(20) NOT NULL DEFAULT 'default',
        ADD COLUMN IF NOT EXISTS transparency varchar(12) NOT NULL DEFAULT 'opaque',
        ADD COLUMN IF NOT EXISTS guests_can_modify boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS guests_can_invite_others boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS guests_can_see_other_guests boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS add_conference_link boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS send_updates varchar(16) NOT NULL DEFAULT 'all',
        ADD COLUMN IF NOT EXISTS color_id varchar(4) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS status varchar(12) NOT NULL DEFAULT 'confirmed',
        ADD COLUMN IF NOT EXISTS reminder_overrides jsonb DEFAULT NULL;
    `);

    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.visibility IS 'Event visibility: default, public, private, confidential';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.transparency IS 'Free/busy: opaque (busy) or transparent (free)';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.guests_can_modify IS 'Whether attendees can edit the event';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.guests_can_invite_others IS 'Whether attendees can invite other people';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.guests_can_see_other_guests IS 'Whether attendees can see the guest list';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.add_conference_link IS 'Whether to auto-attach a Google Meet link';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.send_updates IS 'Email invitation behavior: all, externalOnly, none';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.color_id IS 'Google Calendar event color ID (1-11), null for default';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.status IS 'Event status: confirmed or tentative';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.${table}.reminder_overrides IS 'JSON array of reminder overrides, e.g. [{"method":"popup","minutes":10}]';
    `);

    console.log('[add_event_instance_calendar_properties] Added 10 Google Calendar property columns to event_instances');
  },

  async down(queryInterface, _Sequelize) {
    const table = 'event_instances';
    const columns = [
      'visibility',
      'transparency',
      'guests_can_modify',
      'guests_can_invite_others',
      'guests_can_see_other_guests',
      'add_conference_link',
      'send_updates',
      'color_id',
      'status',
      'reminder_overrides',
    ];

    for (const col of columns) {
      try {
        await queryInterface.sequelize.query(`ALTER TABLE public.${table} DROP COLUMN IF EXISTS ${col};`);
      } catch (error) {
        console.log(`ℹ️  Error dropping ${col} (may not exist):`, error.message);
      }
    }

    console.log('[add_event_instance_calendar_properties] Dropped Google Calendar property columns from event_instances');
  },
};
