export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface
    await sequelize.query(`
      ALTER TABLE public.block_instances
        ADD COLUMN IF NOT EXISTS default_event_instance_id UUID NULL;

      ALTER TABLE public.block_instance_versions
        ADD COLUMN IF NOT EXISTS default_event_instance_id UUID NULL;
    `)
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface
    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        DROP COLUMN IF EXISTS default_event_instance_id;

      ALTER TABLE public.block_instances
        DROP COLUMN IF EXISTS default_event_instance_id;
    `)
  },
}
