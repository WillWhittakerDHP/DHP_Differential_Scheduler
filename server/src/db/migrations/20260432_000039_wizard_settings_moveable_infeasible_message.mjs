/**
 * Migration: wizard_settings.moveable_no_feasible_completion_slots_message
 * Purpose: Admin-configurable booking copy when moveable completion has no slots (Yes+deadline path).
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings
      ADD COLUMN IF NOT EXISTS moveable_no_feasible_completion_slots_message TEXT;
    `);
    console.log('[wizard_settings_moveable_infeasible_message] Added column');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings
      DROP COLUMN IF EXISTS moveable_no_feasible_completion_slots_message;
    `);
    console.log('[wizard_settings_moveable_infeasible_message] Dropped column');
  },
};
