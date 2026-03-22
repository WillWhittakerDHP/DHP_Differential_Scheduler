/**
 * Event assignments: parent is blockInstance only.
 * Remap partInstance parents via part_assignments; drop orphans; dedupe (parent_id, child_id).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `
        DELETE FROM public.event_assignments ea
        WHERE ea.id IN (
          SELECT ea2.id
          FROM public.event_assignments ea2
          INNER JOIN public.part_assignments pa
            ON pa.child_id = ea2.parent_id AND pa.disabled = false
          WHERE ea2.parent_kind = 'partInstance'
            AND EXISTS (
              SELECT 1
              FROM public.event_assignments existing
              WHERE existing.parent_id = pa.parent_id
                AND existing.child_id = ea2.child_id
                AND existing.parent_kind = 'blockInstance'
            )
        );
        `,
        { transaction },
      )

      await sequelize.query(
        `
        UPDATE public.event_assignments ea
        SET
          parent_id = pa.parent_id,
          parent_kind = 'blockInstance'::public.enum_event_assignments_parent_kind,
          updated_at = CURRENT_TIMESTAMP
        FROM public.part_assignments pa
        WHERE ea.parent_kind = 'partInstance'
          AND pa.child_id = ea.parent_id
          AND pa.disabled = false;
        `,
        { transaction },
      )

      await sequelize.query(
        `DELETE FROM public.event_assignments WHERE parent_kind = 'partInstance';`,
        { transaction },
      )

      await sequelize.query(
        `
        DELETE FROM public.event_assignments ea
        WHERE ea.id IN (
          SELECT id FROM (
            SELECT id,
              ROW_NUMBER() OVER (PARTITION BY parent_id, child_id ORDER BY id) AS rn
            FROM public.event_assignments
          ) ranked
          WHERE ranked.rn > 1
        );
        `,
        { transaction },
      )

      await sequelize.query(
        `COMMENT ON COLUMN public.event_assignments.parent_id IS 'Foreign key to block_instances (parent_kind blockInstance)';`,
        { transaction },
      )
    })
  },
}
