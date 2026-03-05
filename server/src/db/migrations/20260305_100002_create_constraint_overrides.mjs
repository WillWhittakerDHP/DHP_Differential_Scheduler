/**
 * Migration: Create constraint_overrides table
 * Date: 2026-03-05
 * Feature: 6.8 — Admin Force-Create & Constraint Overrides
 * Task: 6.8.1.1
 *
 * Stores which constraints were overridden when an admin force-creates an
 * appointment on a blocked slot. Used for audit and for reschedule flow
 * (allowedExceptions). authorized_by_id populated when Feature 7 provides req.user.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE public.constraint_overrides (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        appointment_id uuid NOT NULL,
        overridden_violations text[] NOT NULL DEFAULT '{}',
        authorized_by_id uuid DEFAULT NULL,
        reason text DEFAULT NULL,
        slot_start timestamptz NOT NULL,
        slot_end timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.constraint_overrides
        ADD CONSTRAINT constraint_overrides_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.constraint_overrides
        ADD CONSTRAINT constraint_overrides_appointment_id_fkey
        FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.constraint_overrides
        ADD CONSTRAINT constraint_overrides_authorized_by_id_fkey
        FOREIGN KEY (authorized_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_constraint_overrides_appointment_id ON public.constraint_overrides(appointment_id);
    `);

    console.log('[create_constraint_overrides] Created constraint_overrides table with FKs to appointments and users');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.constraint_overrides;`);
    console.log('[create_constraint_overrides] Dropped constraint_overrides table');
  },
};
