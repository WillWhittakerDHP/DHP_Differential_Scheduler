/**
 * Drifted `sessions` tables may include a legacy NOT NULL `token` column while Feature 7 session rows
 * use `sid` + `sess` (see 000040). Sequelize inserts omit `token` → 23502. Align with app model.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.sessions DROP COLUMN IF EXISTS token;
    `)
  },

  async down() {
    // Restoring dropped column without prior type is unsafe; no-op.
  },
}
