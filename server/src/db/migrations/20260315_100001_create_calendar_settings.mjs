/**
 * Migration: Create calendar_settings table (singleton for calendar integration config).
 * Purpose: One row; setting_value JSONB holds CalendarConfig + autoConfirmEnabled.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.calendar_settings (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        setting_value jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      DO $do$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          JOIN pg_namespace n ON t.relnamespace = n.oid
          WHERE n.nspname = 'public'
            AND t.relname = 'calendar_settings'
            AND c.contype = 'p'
        ) THEN
          ALTER TABLE ONLY public.calendar_settings
            ADD CONSTRAINT calendar_settings_pkey PRIMARY KEY (id);
        END IF;
      END
      $do$;
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
