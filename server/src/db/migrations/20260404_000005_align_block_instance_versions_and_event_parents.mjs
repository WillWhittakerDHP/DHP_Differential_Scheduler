/**
 * Close-out alignment:
 * - block_instance_versions must snapshot composite alongside orchestrator / wizard_visible.
 * - event_instances.parent_block_instance_id is required ownership, not an optional hint.
 *
 * Backfill rules (ordering matters — see 20260432_000035 which later normalizes event_assignments):
 * 1) Baseline routing rows use parent_kind = blockInstance; parent_id is already a block_instances.id.
 * 2) Legacy part-scoped rows use parent_kind = partInstance; resolve the owning block via part_assignments.
 * 3) Orphan event_instances still NULL after (1)(2) cannot satisfy NOT NULL — delete (CASCADE cleans edges).
 */
export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        ADD COLUMN IF NOT EXISTS composite BOOLEAN NOT NULL DEFAULT false;

      UPDATE public.block_instance_versions biv
      SET composite = bi.composite
      FROM public.block_instances bi
      WHERE bi.id = biv.block_instance_id;
    `)

    await sequelize.query(`
      UPDATE public.event_instances ei
      SET parent_block_instance_id = sub.parent_id
      FROM (
        SELECT DISTINCT ON (child_id) child_id, parent_id
        FROM public.event_assignments
        WHERE disabled = false
          AND parent_kind = 'blockInstance'::public.enum_event_assignments_parent_kind
        ORDER BY child_id, created_at ASC
      ) sub
      WHERE sub.child_id = ei.id
        AND ei.parent_block_instance_id IS NULL;
    `)

    await sequelize.query(`
      UPDATE public.event_instances ei
      SET parent_block_instance_id = sub.block_id
      FROM (
        SELECT DISTINCT ON (ei2.id)
          ei2.id AS event_instance_id,
          pa.parent_id AS block_id
        FROM public.event_instances ei2
        INNER JOIN public.event_assignments ea
          ON ea.child_id = ei2.id
          AND ea.disabled = false
          AND ea.parent_kind = 'partInstance'::public.enum_event_assignments_parent_kind
        INNER JOIN public.part_assignments pa
          ON pa.child_id = ea.parent_id
          AND pa.disabled = false
        WHERE ei2.parent_block_instance_id IS NULL
        ORDER BY ei2.id, ea.created_at ASC
      ) sub
      WHERE ei.id = sub.event_instance_id;
    `)

    await sequelize.query(`
      DELETE FROM public.event_instances
      WHERE parent_block_instance_id IS NULL;
    `)

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM public.event_instances
          WHERE parent_block_instance_id IS NULL
        ) THEN
          RAISE EXCEPTION
            'Cannot enforce NOT NULL on event_instances.parent_block_instance_id while rows still have no owning event block instance.';
        END IF;
      END
      $$;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_instances
        ALTER COLUMN parent_block_instance_id SET NOT NULL;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.event_instances
        ALTER COLUMN parent_block_instance_id DROP NOT NULL;
    `)

    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        DROP COLUMN IF EXISTS composite;
    `)
  },
}
