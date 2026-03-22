/**
 * Persist drive-time **billing** settings on availability_settings (relational layer).
 * WHY: PUT /business-settings/availability_settings validated driveTimeFee but codec/repository dropped it.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.availability_settings
        ADD COLUMN IF NOT EXISTS drive_time_fee_complimentary_minutes INTEGER NOT NULL DEFAULT 0;
    `)
    await sequelize.query(`
      ALTER TABLE public.availability_settings
        ADD COLUMN IF NOT EXISTS drive_time_fee_rate_per_hour DOUBLE PRECISION NOT NULL DEFAULT 0;
    `)
    await sequelize.query(`
      ALTER TABLE public.availability_settings
        ADD COLUMN IF NOT EXISTS drive_time_fee_rounding_minutes INTEGER NOT NULL DEFAULT 15;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.availability_settings DROP COLUMN IF EXISTS drive_time_fee_rounding_minutes;
    `)
    await sequelize.query(`
      ALTER TABLE public.availability_settings DROP COLUMN IF EXISTS drive_time_fee_rate_per_hour;
    `)
    await sequelize.query(`
      ALTER TABLE public.availability_settings DROP COLUMN IF EXISTS drive_time_fee_complimentary_minutes;
    `)
  },
}
