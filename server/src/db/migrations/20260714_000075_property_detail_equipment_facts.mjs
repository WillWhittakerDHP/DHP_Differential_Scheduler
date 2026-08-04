/**
 * Property Detail Facts for accumulator gates.
 *
 * These are manually editable now; MLS enrichment can populate the same columns later.
 * Null/0 both evaluate as "fact absent" for accumulator inclusion.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.property_details
        ADD COLUMN IF NOT EXISTS hvac_count INTEGER,
        ADD COLUMN IF NOT EXISTS water_heater_count INTEGER,
        ADD COLUMN IF NOT EXISTS kitchen_appliance_count INTEGER;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.property_details
        DROP COLUMN IF EXISTS kitchen_appliance_count,
        DROP COLUMN IF EXISTS water_heater_count,
        DROP COLUMN IF EXISTS hvac_count;
    `)
  },
}
