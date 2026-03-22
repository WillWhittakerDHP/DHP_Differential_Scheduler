/**
 * Reparent valid_events: part_shape -> block_shape (via valid_parts).
 * Orphan rows (part shape not in any valid_parts) are dropped.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `
        CREATE TEMP TABLE ve_migrated (
          parent_id uuid NOT NULL,
          child_id uuid NOT NULL,
          disabled boolean NOT NULL,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        ) ON COMMIT DROP;
        `,
        { transaction },
      )

      await sequelize.query(
        `
        INSERT INTO ve_migrated (parent_id, child_id, disabled, created_at, updated_at)
        SELECT DISTINCT ON (vp.parent_id, ve.child_id)
          vp.parent_id,
          ve.child_id,
          ve.disabled,
          ve.created_at,
          ve.updated_at
        FROM public.valid_events ve
        INNER JOIN public.valid_parts vp ON vp.child_id = ve.parent_id
        ORDER BY vp.parent_id, ve.child_id, ve.created_at ASC;
        `,
        { transaction },
      )

      await sequelize.query(`DELETE FROM public.valid_events`, { transaction })

      await sequelize.query(
        `ALTER TABLE public.valid_events DROP CONSTRAINT IF EXISTS valid_events_parent_id_fkey;`,
        { transaction },
      )

      await sequelize.query(
        `
        ALTER TABLE public.valid_events
          ADD CONSTRAINT valid_events_parent_id_fkey
          FOREIGN KEY (parent_id) REFERENCES public.block_shapes(id)
          ON UPDATE CASCADE ON DELETE CASCADE;
        `,
        { transaction },
      )

      await sequelize.query(
        `COMMENT ON COLUMN public.valid_events.parent_id IS 'Foreign key to block_shapes table';`,
        { transaction },
      )

      await sequelize.query(
        `
        INSERT INTO public.valid_events (id, parent_id, child_id, disabled, created_at, updated_at)
        SELECT gen_random_uuid(), parent_id, child_id, disabled, created_at, updated_at
        FROM ve_migrated;
        `,
        { transaction },
      )
    })
  },
}
