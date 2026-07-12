/**
 * Remove block_instance_versions.allow_multiple — same product decision as block_instances (no allow-multiple column).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        DROP COLUMN IF EXISTS allow_multiple;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        ADD COLUMN IF NOT EXISTS allow_multiple BOOLEAN NOT NULL DEFAULT false;
    `)
  },
}
