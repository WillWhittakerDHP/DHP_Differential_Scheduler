/**
 * Migration: Add is_state_control column to block_shapes
 * Date: 2026-01-29
 * Purpose: Add is_state_control boolean column to separate state control concept from parts capability.
 *          State control blocks act as state selectors in the wizard (like User Types).
 *          This is mutually exclusive with can_have_parts: if is_state_control is true, can_have_parts must be false.
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migration: Add is_state_control column to block_shapes...');

    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if is_state_control column already exists
    if (tableDescription.is_state_control) {
      console.log('ℹ️  Column block_shapes.is_state_control already exists, skipping migration');
      return;
    }

    // Add is_state_control column with default value based on can_have_parts
    // Migration strategy: is_state_control = NOT can_have_parts (preserve current behavior)
    await queryInterface.addColumn('block_shapes', 'is_state_control', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'If true, block instances of this shape act as state selectors in the wizard (like User Types). Mutually exclusive with can_have_parts.',
    });

    console.log('✅ Added is_state_control column to block_shapes table');

    // Set initial values: is_state_control = NOT can_have_parts
    // This preserves current behavior where canHaveParts: false meant state control
    await queryInterface.sequelize.query(`
      UPDATE block_shapes
      SET is_state_control = NOT can_have_parts
      WHERE is_state_control IS NULL OR is_state_control = false;
    `);

    console.log('✅ Set initial is_state_control values based on can_have_parts');

    // Add database constraint: is_state_control and can_have_parts cannot both be true
    // Note: PostgreSQL CHECK constraints are added via raw SQL
    await queryInterface.sequelize.query(`
      ALTER TABLE block_shapes
      ADD CONSTRAINT check_state_control_mutual_exclusivity
      CHECK (NOT (is_state_control = true AND can_have_parts = true));
    `);

    console.log('✅ Added constraint: is_state_control and can_have_parts cannot both be true');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back migration: Remove is_state_control column from block_shapes...');

    const tableDescription = await queryInterface.describeTable('block_shapes');
    
    // Check if is_state_control column exists
    if (!tableDescription.is_state_control) {
      console.log('ℹ️  Column block_shapes.is_state_control does not exist, skipping rollback');
      return;
    }

    // Drop constraint first
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE block_shapes
        DROP CONSTRAINT IF EXISTS check_state_control_mutual_exclusivity;
      `);
      console.log('✅ Dropped constraint check_state_control_mutual_exclusivity');
    } catch (error) {
      console.log('ℹ️  Constraint check_state_control_mutual_exclusivity does not exist, skipping');
    }

    // Remove is_state_control column
    await queryInterface.removeColumn('block_shapes', 'is_state_control');
    
    console.log('✅ Removed is_state_control column from block_shapes table');
  }
};
