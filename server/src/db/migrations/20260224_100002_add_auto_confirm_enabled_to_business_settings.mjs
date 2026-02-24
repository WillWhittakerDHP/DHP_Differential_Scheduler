/**
 * Migration: Add auto_confirm_enabled to business_settings
 * Date: 2026-02-24
 * Feature: 6.3 — Confirmation Routine
 * Task: 6.3.2.3
 *
 * Adds one boolean column for the auto-confirm appointments business setting:
 *   - auto_confirm_enabled: BOOLEAN DEFAULT false
 *
 * Used by the availability_settings row; server auto-confirm logic (Task 6.3.2.4)
 * will read this to decide whether to transition submitted → confirmed on create.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.business_settings
      ADD COLUMN IF NOT EXISTS auto_confirm_enabled BOOLEAN DEFAULT false NOT NULL;
    `);

    console.log('[add_auto_confirm_enabled] Added auto_confirm_enabled column to business_settings');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.business_settings DROP COLUMN IF EXISTS auto_confirm_enabled;
    `);

    console.log('[add_auto_confirm_enabled] Removed auto_confirm_enabled column from business_settings');
  },
};
