/**
 * Migration: Add pre_closing to block_instances and block_instance_versions
 * Date: 2026-02-26
 * Purpose: Phase 6.4 — preClosing property for moveable-parts modal gating
 *          (modal only for pre-closing services).
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instances
        ADD COLUMN IF NOT EXISTS pre_closing boolean NOT NULL DEFAULT false;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instance_versions
        ADD COLUMN IF NOT EXISTS pre_closing boolean NOT NULL DEFAULT false;
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instances DROP COLUMN IF EXISTS pre_closing;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instance_versions DROP COLUMN IF EXISTS pre_closing;
    `);
  },
};
