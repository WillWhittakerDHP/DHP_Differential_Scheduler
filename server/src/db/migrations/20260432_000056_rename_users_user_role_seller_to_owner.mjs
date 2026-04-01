/**
 * Phase 6.18.1 — Rename ENUM label `seller` → `owner` on `public.enum_users_user_role`.
 * Uses PostgreSQL `ALTER TYPE ... RENAME VALUE` (PG 10+); existing rows update in place.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
DO $migrate$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_users_user_role'
      AND e.enumlabel = 'seller'
  ) THEN
    ALTER TYPE public.enum_users_user_role RENAME VALUE 'seller' TO 'owner';
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
    SELECT 1
    FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_users_user_role'
      AND e.enumlabel = 'owner'
  ) THEN
    ALTER TYPE public.enum_users_user_role RENAME VALUE 'owner' TO 'seller';
  END IF;
END
$migrate$;
`)
  },
}
