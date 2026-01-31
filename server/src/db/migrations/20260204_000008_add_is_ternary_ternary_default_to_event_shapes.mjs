/**
 * Migration: Add isTernary and ternaryDefault columns to event_shapes table
 * 
 * LEARNING: Adds properties to EventShape entity to support dynamic event behavior
 * WHY: Enables determining if an event is ternary vs boolean without hard-coding event names
 * PATTERN: Add columns with appropriate defaults and constraints
 */

export default {
  async up(queryInterface, Sequelize) {
    // Add is_ternary column
    await queryInterface.addColumn('event_shapes', 'is_ternary', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if this event shape uses ternary logic (true/false/override)',
    });

    // Add ternary_default column
    await queryInterface.addColumn('event_shapes', 'ternary_default', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Default ternary value to use when value cannot be determined (null means fail gracefully). Valid values: "true", "false", "override", or NULL',
    });

    // Add check constraint to ensure ternary_default is valid
    await queryInterface.sequelize.query(`
      ALTER TABLE event_shapes
      ADD CONSTRAINT check_ternary_default_valid
      CHECK (ternary_default IS NULL OR ternary_default IN ('true', 'false', 'override'));
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove check constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE event_shapes
      DROP CONSTRAINT IF EXISTS check_ternary_default_valid;
    `);

    // Remove columns
    await queryInterface.removeColumn('event_shapes', 'ternary_default');
    await queryInterface.removeColumn('event_shapes', 'is_ternary');
  },
};
