/**
 * Rename `users.user_role` enum label `client` → `buyer`; reassign `transaction_manager` → `agent`;
 * add `inspector` when missing (aligns with USER_ROLE_VALUES).
 *
 * The `transaction_manager` enum label may remain on the type (DROP VALUE is not available on all
 * PostgreSQL builds); no rows should reference it after the UPDATE above. App validation uses USER_ROLE_VALUES only.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      UPDATE public.users
      SET user_role = 'agent'::public.enum_users_user_role
      WHERE user_role::text = 'transaction_manager';
    `)

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'enum_users_user_role' AND e.enumlabel = 'inspector'
      ) THEN
        ALTER TYPE public.enum_users_user_role ADD VALUE 'inspector';
      END IF;
    END
    $migrate$;
    `)

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'enum_users_user_role' AND e.enumlabel = 'client'
      ) THEN
        ALTER TYPE public.enum_users_user_role RENAME VALUE 'client' TO 'buyer';
      END IF;
    END
    $migrate$;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'enum_users_user_role' AND e.enumlabel = 'buyer'
      ) THEN
        ALTER TYPE public.enum_users_user_role RENAME VALUE 'buyer' TO 'client';
      END IF;
    END
    $migrate$;
    `)
    // Dropped enum value / reassigned users are not restored.
  },
}
