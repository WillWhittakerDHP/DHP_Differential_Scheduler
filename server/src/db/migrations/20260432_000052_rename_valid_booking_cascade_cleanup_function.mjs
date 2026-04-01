/**
 * Rename cleanup trigger function so the name matches `valid_booking_cascades`
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
            AND p.proname = 'cleanup_booking_cascades_on_valid_cascade_delete'
            AND pg_get_function_identity_arguments(p.oid) = ''
        ) THEN
          ALTER FUNCTION public.cleanup_booking_cascades_on_valid_cascade_delete()
            RENAME TO cleanup_booking_cascades_on_valid_booking_cascade_delete;
        END IF;
      END $$;
    `)
  },

  async down() {
    throw new Error(
      'Irreversible migration 20260432_000052: cleanup trigger function rename for valid_booking_cascades.'
    )
  },
}
