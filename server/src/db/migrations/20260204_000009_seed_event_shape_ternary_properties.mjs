/**
 * Migration: Seed isTernary and ternaryDefault for existing event shapes
 * 
 * LEARNING: Sets appropriate values for existing event shapes based on their names
 * WHY: OnSite and ClientPresent are ternary events with default 'true', Moveable is boolean
 * PATTERN: Update existing rows based on name matching
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Seeding isTernary and ternaryDefault for existing event shapes...');

    // Set is_ternary = true and ternary_default = 'true' for OnSite and ClientPresent
    const [ternaryUpdateResult] = await queryInterface.sequelize.query(`
      UPDATE event_shapes
      SET is_ternary = true,
          ternary_default = 'true',
          updated_at = CURRENT_TIMESTAMP
      WHERE name IN ('OnSite', 'ClientPresent')
      RETURNING id, name, is_ternary, ternary_default
    `);

    console.log(`✅ Updated ${ternaryUpdateResult.length} ternary event shapes:`, ternaryUpdateResult.map(r => r.name));

    // Set is_ternary = false and ternary_default = NULL for Moveable
    const [booleanUpdateResult] = await queryInterface.sequelize.query(`
      UPDATE event_shapes
      SET is_ternary = false,
          ternary_default = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE name = 'Moveable'
      RETURNING id, name, is_ternary, ternary_default
    `);

    console.log(`✅ Updated ${booleanUpdateResult.length} boolean event shapes:`, booleanUpdateResult.map(r => r.name));

    // Set defaults for any other existing event shapes (shouldn't be any, but just in case)
    const [defaultUpdateResult] = await queryInterface.sequelize.query(`
      UPDATE event_shapes
      SET is_ternary = false,
          ternary_default = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE is_ternary = false AND ternary_default IS NULL
        AND name NOT IN ('OnSite', 'ClientPresent', 'Moveable')
      RETURNING id, name, is_ternary, ternary_default
    `);

    if (defaultUpdateResult.length > 0) {
      console.log(`✅ Updated ${defaultUpdateResult.length} other event shapes with defaults:`, defaultUpdateResult.map(r => r.name));
    }

    console.log('✅ Finished seeding event shape ternary properties');
  },

  async down(queryInterface, Sequelize) {
    // Reset all event shapes to defaults (is_ternary = false, ternary_default = NULL)
    await queryInterface.sequelize.query(`
      UPDATE event_shapes
      SET is_ternary = false,
          ternary_default = NULL,
          updated_at = CURRENT_TIMESTAMP
    `);

    console.log('✅ Reverted event shape ternary properties to defaults');
  },
};
