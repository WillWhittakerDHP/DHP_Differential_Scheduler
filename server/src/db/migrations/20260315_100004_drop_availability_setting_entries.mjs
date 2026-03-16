/**
 * Migration: Drop availability_setting_entries table.
 * Purpose: Settings are now split into business_settings (availability), calendar_settings, wizard_settings.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.availability_setting_entries;`);
    console.log('[drop_availability_setting_entries] Dropped availability_setting_entries table');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE public.availability_setting_entries (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        entry_key character varying(255) NOT NULL,
        value jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.availability_setting_entries
        ADD CONSTRAINT availability_setting_entries_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.availability_setting_entries
        ADD CONSTRAINT availability_setting_entries_entry_key_key UNIQUE (entry_key);
    `);
    console.log('[drop_availability_setting_entries] Recreated availability_setting_entries table');
  },
};
