/**
 * Magic-link issuance: align `magic_links.user_id` with migration 000041 (nullable) for drifted DBs;
 * extend `enum_users_user_role` with `admin`; seed staff user for magic-link sign-in (7.3.x).
 *
 * Seeded user id (when insert runs): a8f3b2c1-4d5e-6f70-a8b9-c0d1e2f3a4b5 — will@districthomepro.com
 */

const WILL_USER_ID = 'a8f3b2c1-4d5e-6f70-a8b9-c0d1e2f3a4b5'
const WILL_EMAIL = 'will@districthomepro.com'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.magic_links
        ALTER COLUMN user_id DROP NOT NULL;
    `)

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'enum_users_user_role'
          AND e.enumlabel = 'admin'
      ) THEN
        ALTER TYPE public.enum_users_user_role ADD VALUE 'admin';
      END IF;
    END
    $migrate$;
  `)

    await sequelize.query(
      `
      INSERT INTO public.users (id, first_name, last_name, email, phone, user_role, login_id, created_at, updated_at)
      SELECT $1::uuid, 'Will', 'Admin', $2::varchar, NULL, 'admin'::public.enum_users_user_role, NULL, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE lower(email) = lower($2::varchar));
    `,
      { bind: [WILL_USER_ID, WILL_EMAIL] }
    )
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`DELETE FROM public.users WHERE id = $1::uuid`, {
      bind: [WILL_USER_ID],
    })
    // Cannot remove ENUM label `admin` or restore NOT NULL safely here; no-op.
  },
}
