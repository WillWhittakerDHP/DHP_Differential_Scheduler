export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface
    await sequelize.query(`
      ALTER TABLE public.part_instances
        ADD COLUMN IF NOT EXISTS base_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS rate_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1;

      ALTER TABLE public.part_instance_versions
        ADD COLUMN IF NOT EXISTS base_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS rate_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1;
    `)
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface
    await sequelize.query(`
      ALTER TABLE public.part_instance_versions
        DROP COLUMN IF EXISTS rate_multiplier,
        DROP COLUMN IF EXISTS base_multiplier;

      ALTER TABLE public.part_instances
        DROP COLUMN IF EXISTS rate_multiplier,
        DROP COLUMN IF EXISTS base_multiplier;
    `)
  },
}
