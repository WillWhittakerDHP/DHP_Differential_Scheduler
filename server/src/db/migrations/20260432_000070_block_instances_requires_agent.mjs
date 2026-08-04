/**
 * Ensure block_instances.requires_agent exists — Sequelize model and baseline schema expect it.
 * Idempotent: no-op when column already present (e.g. fresh baseline or already migrated DB).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_instances
        ADD COLUMN IF NOT EXISTS requires_agent BOOLEAN NOT NULL DEFAULT false;
    `)
    await sequelize.query(`
      COMMENT ON COLUMN public.block_instances.requires_agent IS
        'Service requires agent/client contact information';
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_instances
        DROP COLUMN IF EXISTS requires_agent;
    `)
  },
}
