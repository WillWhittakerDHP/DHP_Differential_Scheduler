/**
 * Feature 7 auth — Phase 7.1 / Session 7.1.1 / Task 7.1.1.2
 *
 * Rows for magic-link / passwordless flows: store hashed token only, expiry, consumption,
 * optional email and user anchor. Phase 7.3 implements issuance and verification.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.magic_links (
        id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        token_hash TEXT NOT NULL,
        email TEXT NULL,
        user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
        purpose TEXT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        consumed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await sequelize.query(`
      COMMENT ON TABLE public.magic_links IS 'Magic-link tokens: token_hash is digest of secret; raw token never stored.';
    `)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS magic_links_token_hash_idx ON public.magic_links (token_hash);
    `)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS magic_links_expires_at_idx ON public.magic_links (expires_at);
    `)
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS magic_links_token_hash_active_idx
        ON public.magic_links (token_hash)
        WHERE consumed_at IS NULL;
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.magic_links CASCADE;`)
  },
}
