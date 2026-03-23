/**
 * Feature 7 auth — Phase 7.1 / Session 7.1.1 / Task 7.1.1.1
 *
 * PostgreSQL session store compatible with express-session / connect-pg-simple column names
 * (`sid`, `sess`, `expire`). Optional `user_id` links a row to `users` after login (nullable for
 * anonymous sessions). Phase 7.2 owns session manager wiring; this migration is DDL only.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.sessions (
        sid VARCHAR(255) NOT NULL PRIMARY KEY,
        sess JSONB NOT NULL DEFAULT '{}'::jsonb,
        expire TIMESTAMPTZ NOT NULL,
        user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    // If public.sessions already existed with another shape, CREATE TABLE IF NOT EXISTS is a no-op.
    // Add any missing columns so indexes and connect-pg-simple alignment succeed.
    await sequelize.query(`
      ALTER TABLE public.sessions
        ADD COLUMN IF NOT EXISTS sess JSONB NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS expire TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    `)
    await sequelize.query(`
      ALTER TABLE public.sessions
        ADD COLUMN IF NOT EXISTS sid VARCHAR(255);
    `)
    await sequelize.query(`
      COMMENT ON TABLE public.sessions IS 'Server-side session rows; sid/sess/expire align with connect-pg-simple; user_id optional post-login.';
    `)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS sessions_expire_idx ON public.sessions (expire);
    `)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions (user_id) WHERE user_id IS NOT NULL;
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.sessions CASCADE;`)
  },
}
