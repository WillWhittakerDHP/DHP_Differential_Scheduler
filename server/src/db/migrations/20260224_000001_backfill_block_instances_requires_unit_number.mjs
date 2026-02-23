/**
 * Migration: Backfill block_instances.requires_unit_number nulls to false
 * Date: 2026-02-24
 * Purpose: Normalize NULL requires_unit_number to false so the column can be
 *          NOT NULL DEFAULT false. Avoids meaningless null in field context
 *          and aligns with statusButton (boolean) usage.
 */

export default {
  async up(queryInterface, _Sequelize) {
    const [, meta] = await queryInterface.sequelize.query(`
      UPDATE public.block_instances
      SET requires_unit_number = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE requires_unit_number IS NULL;
    `);
    const rowCount = meta?.rowCount ?? meta;
    console.log(`[backfill_block_instances_requires_unit_number] Updated ${rowCount} rows to requires_unit_number = false`);

    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instances
        ALTER COLUMN requires_unit_number SET NOT NULL,
        ALTER COLUMN requires_unit_number SET DEFAULT false;
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instances
        ALTER COLUMN requires_unit_number DROP NOT NULL,
        ALTER COLUMN requires_unit_number DROP DEFAULT;
    `);
    console.log('[backfill_block_instances_requires_unit_number] Down: column again nullable (nulls not restored)');
  },
};
