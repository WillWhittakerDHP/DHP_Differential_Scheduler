/**
 * Migration: Add override_constraints column to appointments
 * Date: 2026-02-23
 * Feature: 6.2 — Held & Override Stubs
 * Task: 6.2.2.1
 *
 * Adds a nullable JSONB column for admin constraint overrides:
 *   - override_constraints: JSONB (which slot-computation constraints are bypassed)
 *
 * Phase 6.7 will build the full constraint override system on top of this column.
 * Feature 7 (Authentication) will wire requireRole so only admins can set overrides.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS override_constraints JSONB DEFAULT NULL;
    `);

    console.log('[add_override_constraints] Added override_constraints JSONB column to appointments');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS override_constraints;
    `);

    console.log('[add_override_constraints] Removed override_constraints column from appointments');
  },
};
