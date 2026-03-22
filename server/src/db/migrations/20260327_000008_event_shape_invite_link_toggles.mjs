/**
 * Phase 6.12.1.1: Event shape toggles for reschedule/cancel links in calendar invite templates.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD COLUMN IF NOT EXISTS include_reschedule_link boolean NOT NULL DEFAULT true;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD COLUMN IF NOT EXISTS include_cancel_link boolean NOT NULL DEFAULT true;
    `)
    await sequelize.query(`
      COMMENT ON COLUMN public.event_shapes.include_reschedule_link IS 'When false, {rescheduleLink} is stripped from invite templates for event instances of this shape.';
    `)
    await sequelize.query(`
      COMMENT ON COLUMN public.event_shapes.include_cancel_link IS 'When false, {cancelLink} is stripped from invite templates for event instances of this shape.';
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.event_shapes DROP COLUMN IF EXISTS include_cancel_link;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shapes DROP COLUMN IF EXISTS include_reschedule_link;
    `)
  },
}
