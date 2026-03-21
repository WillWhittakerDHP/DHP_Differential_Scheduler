/**
 * Removes generic business_settings (setting_key + JSONB). Availability lives in availability_* tables.
 * Run after 20260325_000006_relational_settings (which deletes the availability_settings row).
 */

export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.business_settings CASCADE`)
  },

  async down() {
    throw new Error(
      'Irreversible migration 20260326_000007_drop_business_settings: restore from backup to recreate business_settings.'
    )
  },
}
