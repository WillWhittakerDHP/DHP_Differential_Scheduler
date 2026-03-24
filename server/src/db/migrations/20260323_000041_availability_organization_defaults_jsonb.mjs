/**
 * Organization-wide numeric defaults (Phase 6.14) — JSONB on singleton availability_settings.
 * WHY: GET/PUT /organization-defaults; merge-at-read via resolveOrganizationNumericPolicy.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.availability_settings
        ADD COLUMN IF NOT EXISTS organization_defaults JSONB;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.availability_settings DROP COLUMN IF EXISTS organization_defaults;
    `)
  },
}
