/**
 * Allow deleting an event_shape without manual cleanup: dependent calendar segments (event_instances)
 * cascade. Previously ON DELETE RESTRICT caused 500s; app-level 409 preflight was removed per product preference.
 */
export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.event_instances
        DROP CONSTRAINT IF EXISTS event_instances_event_shape_ref_fkey;

      ALTER TABLE public.event_instances
        ADD CONSTRAINT event_instances_event_shape_ref_fkey
        FOREIGN KEY (event_shape_ref)
        REFERENCES public.event_shapes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.event_instances
        DROP CONSTRAINT IF EXISTS event_instances_event_shape_ref_fkey;

      ALTER TABLE public.event_instances
        ADD CONSTRAINT event_instances_event_shape_ref_fkey
        FOREIGN KEY (event_shape_ref)
        REFERENCES public.event_shapes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT;
    `)
  },
}
