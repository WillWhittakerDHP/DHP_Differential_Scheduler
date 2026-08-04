/**
 * Default Property Detail Fact for time block instances.
 *
 * Runtime accumulator links still store the fact key on `accumulation_links`;
 * this column gives time blocks a reusable default so admin setup is discoverable.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        ALTER TABLE public.${table}
          ADD COLUMN IF NOT EXISTS property_fact_key TEXT;
      `)
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        ALTER TABLE public.${table}
          DROP COLUMN IF EXISTS property_fact_key;
      `)
    }
  },
}
