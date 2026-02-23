/**
 * Migration: Add held_by and held_until columns to appointments
 * Date: 2026-02-23
 * Feature: 6.2 — Held & Override Stubs
 * Task: 6.2.1.1
 *
 * Adds two nullable columns for the appointment hold feature:
 *   - held_by:    UUID FK → users.id (who placed the hold)
 *   - held_until: TIMESTAMPTZ (when the hold expires)
 *
 * The 'held' status already exists in the appointment status ENUM (Phase 6.1).
 * These columns track hold metadata when status = 'held'.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS held_by UUID DEFAULT NULL
        REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS held_until TIMESTAMPTZ DEFAULT NULL;
    `);

    console.log('[add_held_columns] Added held_by (FK → users) and held_until columns to appointments');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS held_until;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS held_by;
    `);

    console.log('[add_held_columns] Removed held_by and held_until columns from appointments');
  },
};
