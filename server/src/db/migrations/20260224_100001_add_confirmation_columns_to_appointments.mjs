/**
 * Migration: Add confirmation tracking columns to appointments
 * Date: 2026-02-24
 * Feature: 6.3 — Confirmation Routine
 * Task: 6.3.1.1
 *
 * Adds three nullable columns for appointment confirmation tracking:
 *   - submitted_at:  TIMESTAMPTZ (when status transitioned to 'submitted')
 *   - confirmed_at:  TIMESTAMPTZ (when status transitioned to 'confirmed')
 *   - confirmed_by:  UUID FK → users.id (who confirmed — populated by Feature 7 auth)
 *
 * The 'submitted' and 'confirmed' statuses already exist in the appointment
 * status ENUM (Phase 6.1). These columns track transition metadata.
 * confirmed_by will be NULL until Feature 7 provides req.user.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ DEFAULT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS confirmed_by UUID DEFAULT NULL
        REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    console.log('[add_confirmation_columns] Added submitted_at, confirmed_at, confirmed_by (FK → users) columns to appointments');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS confirmed_by;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS confirmed_at;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS submitted_at;
    `);

    console.log('[add_confirmation_columns] Removed submitted_at, confirmed_at, confirmed_by columns from appointments');
  },
};
