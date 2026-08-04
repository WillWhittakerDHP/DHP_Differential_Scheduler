/**
 * WHY: Eighth event placement type — `none` — for intentionally unscheduled
 * segments (e.g. “no presentation”). Same constraint family as `primary`
 * (anchor_edge must be null). Seeds an Event Type row named “None”.
 */
export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface

    await sequelize.query(`
      ALTER TABLE public.event_shapes DROP CONSTRAINT IF EXISTS chk_event_shapes_placement_anchor;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD CONSTRAINT chk_event_shapes_placement_anchor CHECK (
          (placement_kind IN ('primary', 'none') AND anchor_edge IS NULL)
          OR (
            placement_kind IN ('secondary', 'marginal', 'floating')
            AND anchor_edge IN ('start', 'end')
          )
        );
    `)

    await sequelize.query(`
      INSERT INTO public.event_shapes (
        id,
        name,
        active,
        order_index,
        placement_kind,
        anchor_edge,
        created_at,
        updated_at
      )
      SELECT
        gen_random_uuid(),
        'None',
        true,
        COALESCE((SELECT MAX(order_index) FROM public.event_shapes), 0) + 1,
        'none',
        NULL,
        NOW(),
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM public.event_shapes WHERE name = 'None'
      );
    `)
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface

    await sequelize.query(`
      DELETE FROM public.event_shapes
      WHERE name = 'None' AND placement_kind = 'none';
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shapes DROP CONSTRAINT IF EXISTS chk_event_shapes_placement_anchor;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD CONSTRAINT chk_event_shapes_placement_anchor CHECK (
          (placement_kind = 'primary' AND anchor_edge IS NULL)
          OR (
            placement_kind IN ('secondary', 'marginal', 'floating')
            AND anchor_edge IN ('start', 'end')
          )
        );
    `)
  },
}
