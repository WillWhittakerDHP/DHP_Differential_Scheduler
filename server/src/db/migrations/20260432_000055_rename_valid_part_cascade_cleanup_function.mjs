/**
 * Rename cleanup trigger function so the name matches `valid_part_cascades`
 * (baseline and new installs already use the new name; this upgrades DBs that
 * ran an older baseline before the rename).
 */

/** @param {import('sequelize').QueryInterface} queryInterface */
export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public'
            AND p.proname = 'cleanup_part_assignments_on_valid_part_delete'
            AND pg_get_function_identity_arguments(p.oid) = ''
        ) THEN
          ALTER FUNCTION public.cleanup_part_assignments_on_valid_part_delete()
            RENAME TO cleanup_part_assignments_on_valid_part_cascade_delete;
        END IF;
      END $$;
    `)
  },

  async down() {
    throw new Error(
      'Irreversible migration 20260432_000055: cleanup trigger function rename for valid_part_cascades.'
    )
  },
}
