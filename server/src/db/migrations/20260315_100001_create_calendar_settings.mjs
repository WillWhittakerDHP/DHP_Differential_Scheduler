/**
 * Migration: Create calendar_settings table (singleton for calendar integration config).
 * Purpose: One row; setting_value JSONB holds CalendarConfig + autoConfirmEnabled.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE public.calendar_settings (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        setting_value jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.calendar_settings
        ADD CONSTRAINT calendar_settings_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE public.calendar_settings IS 'Singleton: calendar integration config (provider, calendars, hold duration, autoConfirmEnabled)';
    `);
    console.log('[create_calendar_settings] Created calendar_settings table');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.calendar_settings;`);
    console.log('[create_calendar_settings] Dropped calendar_settings table');
  },
};
