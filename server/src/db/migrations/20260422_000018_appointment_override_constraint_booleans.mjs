/**
 * Replace appointments.override_constraints JSONB with four NOT NULL boolean columns.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS override_constraint_capacity boolean NOT NULL DEFAULT false;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS override_constraint_buffer boolean NOT NULL DEFAULT false;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS override_constraint_blackout boolean NOT NULL DEFAULT false;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS override_constraint_business_hours boolean NOT NULL DEFAULT false;
    `)
    await sequelize.query(`
      UPDATE public.appointments
      SET
        override_constraint_capacity = COALESCE((override_constraints->>'capacity')::boolean, false),
        override_constraint_buffer = COALESCE((override_constraints->>'buffer')::boolean, false),
        override_constraint_blackout = COALESCE((override_constraints->>'blackout')::boolean, false),
        override_constraint_business_hours = COALESCE((override_constraints->>'businessHours')::boolean, false)
      WHERE override_constraints IS NOT NULL
        AND jsonb_typeof(override_constraints) = 'object';
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS override_constraints;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS override_constraints jsonb;
    `)
    await sequelize.query(`
      UPDATE public.appointments
      SET override_constraints = jsonb_strip_nulls(
        jsonb_build_object(
          'capacity', CASE WHEN override_constraint_capacity THEN true ELSE NULL END,
          'buffer', CASE WHEN override_constraint_buffer THEN true ELSE NULL END,
          'blackout', CASE WHEN override_constraint_blackout THEN true ELSE NULL END,
          'businessHours', CASE WHEN override_constraint_business_hours THEN true ELSE NULL END
        )
      );
    `)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS override_constraint_capacity;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS override_constraint_buffer;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS override_constraint_blackout;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS override_constraint_business_hours;`)
  },
}
