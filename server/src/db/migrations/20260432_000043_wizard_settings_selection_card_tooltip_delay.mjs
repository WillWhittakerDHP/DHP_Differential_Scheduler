/**
 * Migration: wizard_settings.selection_card_tooltip_open_delay_ms
 * Purpose: Persist booking selection-card annotation tooltip hover delay (ms); default 3000 matches client DEFAULT_SELECTION_CARD_TOOLTIP_OPEN_DELAY_MS.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings
      ADD COLUMN IF NOT EXISTS selection_card_tooltip_open_delay_ms INTEGER NOT NULL DEFAULT 3000;
    `);
    console.log('[wizard_settings_selection_card_tooltip_delay] Added column');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.wizard_settings
      DROP COLUMN IF EXISTS selection_card_tooltip_open_delay_ms;
    `);
    console.log('[wizard_settings_selection_card_tooltip_delay] Dropped column');
  },
};
