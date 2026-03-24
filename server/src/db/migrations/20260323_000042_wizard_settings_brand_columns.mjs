/**
 * Migration: wizard_settings brand_primary_hex, brand_secondary_hex, logo_url
 * Purpose: Admin brand customization (anchors + logo URL) for session 6.15.1.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings ADD COLUMN IF NOT EXISTS brand_primary_hex VARCHAR(32);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings ADD COLUMN IF NOT EXISTS brand_secondary_hex VARCHAR(32);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings ADD COLUMN IF NOT EXISTS logo_url VARCHAR(2048);
    `);
    console.log('[wizard_settings_brand_columns] Added brand columns');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings DROP COLUMN IF EXISTS brand_primary_hex;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings DROP COLUMN IF EXISTS brand_secondary_hex;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings DROP COLUMN IF EXISTS logo_url;
    `);
    console.log('[wizard_settings_brand_columns] Dropped brand columns');
  },
};
