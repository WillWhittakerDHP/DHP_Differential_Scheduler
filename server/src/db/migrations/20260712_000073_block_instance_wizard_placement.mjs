/**
 * Phase B — restore explicit wizard placement on block instances.
 *
 * Replaces the two-state `wizard_visible` BOOLEAN with a four-state `wizard_placement` TEXT:
 *   'hidden' | 'topLine' | 'subOption' | 'both'
 *
 * WHY: `wizard_visible` collapsed three distinct admin intents (top-line card, sub-option/add-on,
 * and both) and could not express "hidden entirely". See shared/constants/wizardPlacement.ts.
 *
 * Backfill preserves prior *runtime* behaviour rather than the field's label. The old line-item
 * (add-on) path was dead code — nothing with wizard_visible = false ever rendered in the wizard —
 * and the `false` rows are component children, hidden user roles (e.g. Inspector), and system
 * blocks. Mapping them to 'subOption' would wrongly surface them as add-ons now that the sub-option
 * path is live, so we map to 'hidden' and let admins opt specific blocks into subOption/both:
 *   wizard_visible = true  -> 'topLine'
 *   wizard_visible = false -> 'hidden'
 *
 * Applies to block_instances and block_instance_versions.
 * Idempotent: safe to re-run if a prior attempt failed before SequelizeMeta recorded this file.
 */

const PLACEMENT_CHECK = `wizard_placement IN ('hidden', 'topLine', 'subOption', 'both')`

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        ALTER TABLE public.${table}
          ADD COLUMN IF NOT EXISTS wizard_placement TEXT NOT NULL DEFAULT 'topLine';

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'wizard_visible'
          ) THEN
            UPDATE public.${table}
            SET wizard_placement = CASE WHEN wizard_visible THEN 'topLine' ELSE 'hidden' END;
            ALTER TABLE public.${table} DROP COLUMN wizard_visible;
          END IF;
        END $$;

        ALTER TABLE public.${table}
          DROP CONSTRAINT IF EXISTS ${table}_wizard_placement_check;
        ALTER TABLE public.${table}
          ADD CONSTRAINT ${table}_wizard_placement_check CHECK (${PLACEMENT_CHECK});
      `)
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    for (const table of ['block_instances', 'block_instance_versions']) {
      await sequelize.query(`
        ALTER TABLE public.${table}
          ADD COLUMN IF NOT EXISTS wizard_visible BOOLEAN NOT NULL DEFAULT true;

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'wizard_placement'
          ) THEN
            UPDATE public.${table}
            SET wizard_visible = (wizard_placement IN ('topLine', 'both'));
            ALTER TABLE public.${table}
              DROP CONSTRAINT IF EXISTS ${table}_wizard_placement_check;
            ALTER TABLE public.${table} DROP COLUMN wizard_placement;
          END IF;
        END $$;
      `)
    }
  },
}
