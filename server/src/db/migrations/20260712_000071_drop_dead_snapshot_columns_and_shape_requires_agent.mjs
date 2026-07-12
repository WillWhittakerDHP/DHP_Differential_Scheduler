/**
 * Phase 1 grab-bag cleanup (BONSAI_SPEC §6 item 2):
 *
 * 1. Drop appointments.service_snapshots / property_snapshots / option_snapshots —
 *    dead JSONB columns with zero application readers/writers. Snapshots resolve
 *    through appointment_selection_lines.snapshot_version_id → block_instance_versions.
 *    Historical values preserved in differential_scheduler_backup.dump.
 *
 * 2. Drop block_shapes.requires_agent — Will ruled block_instances.requires_agent
 *    authoritative (2026-07-12). The shape-level duplicate is absent from the
 *    Sequelize model and unread by any code path.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.appointments
        DROP COLUMN IF EXISTS service_snapshots,
        DROP COLUMN IF EXISTS property_snapshots,
        DROP COLUMN IF EXISTS option_snapshots;
    `)
    await sequelize.query(`
      ALTER TABLE public.block_shapes
        DROP COLUMN IF EXISTS requires_agent;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS service_snapshots JSONB,
        ADD COLUMN IF NOT EXISTS property_snapshots JSONB,
        ADD COLUMN IF NOT EXISTS option_snapshots JSONB;
    `)
    await sequelize.query(`
      ALTER TABLE public.block_shapes
        ADD COLUMN IF NOT EXISTS requires_agent BOOLEAN NOT NULL DEFAULT false;
    `)
  },
}
