/**
 * Drop legacy block_shapes.allow_multiple_blocks (NOT NULL, no default).
 * WHY: Sequelize BlockShape model does not map this column; creates were failing with NULL.
 * 20260432_000060 now includes this drop; this migration fixes databases that ran 060 before that change.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_shapes
        DROP COLUMN IF EXISTS allow_multiple_blocks;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_shapes
        ADD COLUMN IF NOT EXISTS allow_multiple_blocks BOOLEAN NOT NULL DEFAULT false;
    `)
  },
}
