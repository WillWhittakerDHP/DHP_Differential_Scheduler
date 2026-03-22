/**
 * Migration: sessions + magic_links (Feature 7 / LAUNCH_CHECKLIST §2A.1)
 * Depends on baseline schema including public.users(id uuid PK).
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE public.sessions (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        token varchar(255) NOT NULL,
        expires_at timestamptz NOT NULL,
        last_active_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT sessions_pkey PRIMARY KEY (id),
        CONSTRAINT sessions_token_key UNIQUE (token),
        CONSTRAINT sessions_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.users(id)
          ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE public.magic_links (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        token varchar(255) NOT NULL,
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT magic_links_pkey PRIMARY KEY (id),
        CONSTRAINT magic_links_token_key UNIQUE (token),
        CONSTRAINT magic_links_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.users(id)
          ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX magic_links_token_idx ON public.magic_links USING btree (token);
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS public.magic_links;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS public.sessions;');
  },
};
