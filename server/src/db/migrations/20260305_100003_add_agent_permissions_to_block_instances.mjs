/**
 * Migration: Add agent_permissions to block_instances
 * Date: 2026-03-05
 * Purpose: Session 6.8.5 — Block-level agentPermissions. Same pattern as differential
 *          (ternary_boolean: 'true' | 'false' | 'override'), default 'false'.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instances
        ADD COLUMN IF NOT EXISTS agent_permissions public.ternary_boolean NOT NULL DEFAULT 'false'::public.ternary_boolean;
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.block_instances DROP COLUMN IF EXISTS agent_permissions;
    `);
  },
};
