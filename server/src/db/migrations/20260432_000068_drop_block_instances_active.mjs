/**
 * Remove block_instances.active — visibility is wizardVisible (+ related flags), not a legacy "active" column.
 * Prune admin_metadata primitives that still reference field_key active for blockInstance.
 * Idempotent for column/index already absent.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'admin_metadata'
        ) THEN
          DELETE FROM public.admin_metadata
          WHERE entity_type = 'blockInstance' AND field_key = 'active';
        END IF;
      END $$;
    `)
    await sequelize.query(`DROP INDEX IF EXISTS public.idx_block_instances_active;`)
    await sequelize.query(`
      ALTER TABLE public.block_instances
        DROP COLUMN IF EXISTS active;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_instances
        ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
    `)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_block_instances_active
      ON public.block_instances USING btree (active);
    `)
  },
}
