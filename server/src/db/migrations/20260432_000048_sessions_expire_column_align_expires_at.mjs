/**
 * Align `sessions` expiry column with Sequelize + connect-pg-simple naming drift:
 * - 000040 uses `expire`; some DBs have `expires_at` NOT NULL instead or in addition.
 * - App maps ORM attribute `expire` → column `expires_at` (see session model).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'expire'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'expires_at'
      ) THEN
        ALTER TABLE public.sessions RENAME COLUMN expire TO expires_at;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'expire'
      ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'expires_at'
      ) THEN
        UPDATE public.sessions SET expires_at = expire WHERE expires_at IS NULL AND expire IS NOT NULL;
        ALTER TABLE public.sessions DROP COLUMN expire;
      END IF;
    END
    $migrate$;
  `)
  },

  async down() {
    // Reverting column renames is environment-specific; no-op.
  },
}
