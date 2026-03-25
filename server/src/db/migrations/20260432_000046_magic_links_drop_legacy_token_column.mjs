/**
 * Drifted databases may retain a legacy `magic_links.token` NOT NULL column while the app only
 * persists `token_hash` (raw token never stored — see 000041). Drop the obsolete column.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.magic_links DROP COLUMN IF EXISTS token;
    `)
  },

  async down() {
    // Restoring a dropped column without the prior type/default is unsafe; no-op.
  },
}
