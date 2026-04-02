/**
 * Session 6.18.2.1 — Persist canonical user_role → user-type block_instance_id overrides.
 * WHY: Operators align roles to instances without deploy; getUserTypeBlockIdForRole reads this first.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.user_role_block_alignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alignments JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await sequelize.query(`
      INSERT INTO public.user_role_block_alignments (id, alignments, created_at, updated_at)
      SELECT gen_random_uuid(), '{}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM public.user_role_block_alignments LIMIT 1);
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`DROP TABLE IF EXISTS public.user_role_block_alignments;`)
  },
}
