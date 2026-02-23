/**
 * Migration: Clean old-format time slot data
 * Date: 2026-02-23
 * Purpose: NULL out selected_time_slots rows that use the pre-availability
 *          legacy format ({ time: "HH:MM", duration: N }) instead of the
 *          canonical format ({ startTime: RFC3339, endTime: RFC3339, duration: N }).
 *
 *   The old format cannot be losslessly converted because it lacks a date
 *   component and endTime. Since the app is pre-launch, these are test records
 *   and can safely be cleared.
 */

export default {
  async up(queryInterface, _Sequelize) {
    const [, meta] = await queryInterface.sequelize.query(`
      UPDATE public.appointments
      SET selected_time_slots = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE selected_time_slots IS NOT NULL
        AND selected_time_slots::text NOT LIKE '%startTime%';
    `);
    const rowCount = meta?.rowCount ?? meta;
    console.log(`[clean_old_format_time_slots] Cleared ${rowCount} rows with old-format time slots`);
  },

  async down(_queryInterface, _Sequelize) {
    console.log('[clean_old_format_time_slots] Down: no-op (old test data cannot be restored)');
  },
};
