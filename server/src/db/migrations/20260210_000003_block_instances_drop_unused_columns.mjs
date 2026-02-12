/**
 * Migration: Drop unused block_instances columns and align base_sq_ft NOT NULL
 * Date: 2026-02-10
 * Purpose: Align block_instances table with Sequelize model (camelCase convention).
 * - DROP particle_required (not in model, not used in code)
 * - DROP available_days (in model but unused, all NULL)
 * - SET base_sq_ft NOT NULL (model expects NOT NULL, all rows already non-null)
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE block_instances DROP COLUMN IF EXISTS particle_required;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE block_instances DROP COLUMN IF EXISTS available_days;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE block_instances ALTER COLUMN base_sq_ft SET NOT NULL;
    `);
    console.log('[block_instances] Dropped particle_required, available_days; set base_sq_ft NOT NULL');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE block_instances ALTER COLUMN base_sq_ft DROP NOT NULL;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE block_instances ADD COLUMN IF NOT EXISTS available_days jsonb;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE block_instances ADD COLUMN IF NOT EXISTS particle_required boolean NOT NULL DEFAULT false;
    `);
    console.log('[block_instances] Restored base_sq_ft nullable, available_days, particle_required');
  },
};
