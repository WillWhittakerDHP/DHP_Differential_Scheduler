/**
 * Migration: Create wizard_settings table (singleton for wizard display config).
 * Purpose: One row; setting_value JSONB holds showApplyCoupon, useBrandColors, labels, subStepLabels.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE public.wizard_settings (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        setting_value jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.wizard_settings
        ADD CONSTRAINT wizard_settings_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE public.wizard_settings IS 'Singleton: wizard display config (coupon, brand colors, labels)';
    `);
    console.log('[create_wizard_settings] Created wizard_settings table');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.wizard_settings;`);
    console.log('[create_wizard_settings] Dropped wizard_settings table');
  },
};
