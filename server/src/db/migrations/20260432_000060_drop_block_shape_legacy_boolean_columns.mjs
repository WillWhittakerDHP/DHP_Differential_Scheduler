/**
 * Phase 20.1.2.2 — Remove block_shapes.allow_multiple_blocks, composable, can_have_parts, is_state_control and DB check constraint.
 * Prune admin_metadata rows for removed blockShape primitives.
 *
 * WHY: Feature 20 — semantics live on block_shapes.type and block_instances.composite / orchestrator / wizardVisible.
 * Idempotent: safe if columns or constraint already removed.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'blockShape'
        AND field_key IN ('composable', 'canHaveParts', 'isStateControl');
    `)

    await sequelize.query(`
      ALTER TABLE public.block_shapes
        DROP CONSTRAINT IF EXISTS check_state_control_mutual_exclusivity;
    `)

    await sequelize.query(`DROP INDEX IF EXISTS public.idx_block_types_poolable;`)

    await sequelize.query(`
      ALTER TABLE public.block_shapes
        DROP COLUMN IF EXISTS allow_multiple_blocks,
        DROP COLUMN IF EXISTS composable,
        DROP COLUMN IF EXISTS can_have_parts,
        DROP COLUMN IF EXISTS is_state_control;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.block_shapes
        ADD COLUMN IF NOT EXISTS allow_multiple_blocks BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS composable BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS can_have_parts BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_state_control BOOLEAN NOT NULL DEFAULT false;
    `)

    await sequelize.query(`
      ALTER TABLE public.block_shapes
        DROP CONSTRAINT IF EXISTS check_state_control_mutual_exclusivity;
    `)

    await sequelize.query(`
      ALTER TABLE public.block_shapes
        ADD CONSTRAINT check_state_control_mutual_exclusivity
        CHECK (NOT ((is_state_control = true) AND (can_have_parts = true)));
    `)

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_block_types_poolable ON public.block_shapes USING btree (composable);
    `)
  },
}
