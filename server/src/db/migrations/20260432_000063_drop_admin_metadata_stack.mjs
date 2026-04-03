/**
 * Feature 20.6.1.2: remove legacy admin field-metadata tables after client code-first cutover.
 *
 * EXECUTION: Run migrations only when DB_HOST is localhost/127.0.0.1 on the machine that owns the DB
 * (see project migration policy). Irreversible — restore from backup if rollback is required.
 *
 * Order: child select_option tables first, then parent metadata tables.
 * PostgreSQL may retain enum_admin_metadata_* types after table drop; optional manual cleanup if desired.
 */

export default {
  async up(queryInterface) {
    const q = queryInterface.sequelize
    await q.query(`DROP TABLE IF EXISTS public.admin_metadata_select_options CASCADE`)
    await q.query(`DROP TABLE IF EXISTS public.admin_metadata CASCADE`)
    await q.query(`DROP TABLE IF EXISTS public.admin_primitive_metadata_select_options CASCADE`)
    await q.query(`DROP TABLE IF EXISTS public.admin_primitive_metadata CASCADE`)
    await q.query(`DROP TABLE IF EXISTS public.admin_relationship_metadata_select_options CASCADE`)
    await q.query(`DROP TABLE IF EXISTS public.admin_relationship_metadata CASCADE`)
  },

  async down() {
    throw new Error(
      'Irreversible migration 20260432_000063_drop_admin_metadata_stack: restore admin_metadata stack from backup or re-run baseline seeds.'
    )
  },
}
