/**
 * Accumulator lateral inclusion gates (Phase 1).
 *
 * - `block_instances.accumulator` / versions: parent participates in gates
 * - `accumulation_links`: parent service → child time/characteristic, gated by property_fact_key
 *
 * Distinct from booking_cascades (user options). See shared/constants/accumulator.ts.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        ALTER TABLE public.${table}
          ADD COLUMN IF NOT EXISTS accumulator BOOLEAN NOT NULL DEFAULT false;
      `)
    }

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.accumulation_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID NOT NULL REFERENCES public.block_instances(id) ON DELETE CASCADE,
        child_id UUID NOT NULL REFERENCES public.block_instances(id) ON DELETE CASCADE,
        property_fact_key TEXT NOT NULL DEFAULT '',
        disabled BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (parent_id, child_id)
      );

      CREATE INDEX IF NOT EXISTS accumulation_links_parent_id_idx
        ON public.accumulation_links (parent_id);
      CREATE INDEX IF NOT EXISTS accumulation_links_child_id_idx
        ON public.accumulation_links (child_id);
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      DROP TABLE IF EXISTS public.accumulation_links;
    `)

    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        ALTER TABLE public.${table}
          DROP COLUMN IF EXISTS accumulator;
      `)
    }
  },
}
