const PLACEMENT_CHECK = `wizard_placement IN ('hidden', 'topLine', 'additional', 'subOption', 'both')`

export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface
    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        ALTER TABLE public.${table}
          DROP CONSTRAINT IF EXISTS ${table}_wizard_placement_check;
        ALTER TABLE public.${table}
          ADD CONSTRAINT ${table}_wizard_placement_check CHECK (${PLACEMENT_CHECK});
      `)
    }
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface
    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        UPDATE public.${table}
        SET wizard_placement = 'subOption'
        WHERE wizard_placement = 'additional';

        ALTER TABLE public.${table}
          DROP CONSTRAINT IF EXISTS ${table}_wizard_placement_check;
        ALTER TABLE public.${table}
          ADD CONSTRAINT ${table}_wizard_placement_check
          CHECK (wizard_placement IN ('hidden', 'topLine', 'subOption', 'both'));
      `)
    }
  },
}
