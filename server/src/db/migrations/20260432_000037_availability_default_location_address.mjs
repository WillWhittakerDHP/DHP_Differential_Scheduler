/**
 * Persist default location **formatted address** (Places autocomplete line) on availability_settings.
 * WHY: Relational layer stored place_id, label, lat/lng only; client `defaultLocation.address` was never
 * round-tripped, so admin Home/Office line stayed empty and safeDefaults logged misalignment on undefined.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.availability_settings
        ADD COLUMN IF NOT EXISTS default_location_address TEXT;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.availability_settings DROP COLUMN IF EXISTS default_location_address;
    `)
  },
}
