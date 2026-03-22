/**
 * Per-block-instance overrides for major/minor/movable keyed by event shape id (JSONB).
 */

export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instances
      ADD COLUMN IF NOT EXISTS differential_event_role_overrides JSONB NOT NULL DEFAULT '{}'::jsonb;
    `)
  },
}
