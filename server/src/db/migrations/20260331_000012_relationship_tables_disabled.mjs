/**
 * Align annotation_assignments, event_assignments, event_shape_attendees with soft-delete pattern (disabled).
 * Rows stay in DB; list/batch filters use disabled = false; DELETE sets disabled = true.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.annotation_assignments
        ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;
    `)
    await sequelize.query(`
      COMMENT ON COLUMN public.annotation_assignments.disabled IS 'When true, relationship is inactive (soft-deleted); excluded from active graph queries.';
    `)
    await sequelize.query(`
      ALTER TABLE public.event_assignments
        ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;
    `)
    await sequelize.query(`
      COMMENT ON COLUMN public.event_assignments.disabled IS 'When true, relationship is inactive (soft-deleted); excluded from active graph queries.';
    `)
    await sequelize.query(`
      DO $$
      BEGIN
        IF to_regclass('public.event_shape_attendees') IS NOT NULL THEN
          ALTER TABLE public.event_shape_attendees
            ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;
          COMMENT ON COLUMN public.event_shape_attendees.disabled IS 'When true, relationship is inactive (soft-deleted); excluded from active graph queries.';
        END IF;

        IF to_regclass('public.event_instance_attendees') IS NOT NULL THEN
          ALTER TABLE public.event_instance_attendees
            ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;
          COMMENT ON COLUMN public.event_instance_attendees.disabled IS 'When true, relationship is inactive (soft-deleted); excluded from active graph queries.';
        END IF;
      END $$;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      DO $$
      BEGIN
        IF to_regclass('public.event_shape_attendees') IS NOT NULL THEN
          ALTER TABLE public.event_shape_attendees DROP COLUMN IF EXISTS disabled;
        END IF;

        IF to_regclass('public.event_instance_attendees') IS NOT NULL THEN
          ALTER TABLE public.event_instance_attendees DROP COLUMN IF EXISTS disabled;
        END IF;
      END $$;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_assignments DROP COLUMN IF EXISTS disabled;
    `)
    await sequelize.query(`
      ALTER TABLE public.annotation_assignments DROP COLUMN IF EXISTS disabled;
    `)
  },
}
