/**
 * Migration: Add metadata columns to event_shapes table
 * Date: 2026-02-03
 * Purpose: Add metadata columns (default_ternary_value, default_order_index) to event_shapes table
 * 
 * LEARNING: Shape tables store metadata as columns
 * WHY: Metadata (ternaryValue, orderIndex) belongs in shape tables, not in relationship tables
 * PATTERN: Shape columns are always metadata - relationships just indicate which shapes are active
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting add metadata columns to event_shapes migration...');

    const tableExists = await queryInterface.tableExists('event_shapes');
    
    if (!tableExists) {
      console.log('⚠️  event_shapes table does not exist. Run create_event_tables migration first.');
      return;
    }

    // Add default_ternary_value column
    const hasTernaryValue = await queryInterface.describeTable('event_shapes')
      .then(columns => 'default_ternary_value' in columns)
      .catch(() => false);

    if (!hasTernaryValue) {
      console.log('📝 Adding default_ternary_value column to event_shapes...');
      
      // Create enum type if it doesn't exist (using dollar-quoting to avoid quote issues)
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'enum_event_shapes_default_ternary_value'
          ) THEN
            CREATE TYPE enum_event_shapes_default_ternary_value AS ENUM('true', 'false', 'override');
          END IF;
        END $$;
      `);
      
      // Add column using the enum type
      await queryInterface.sequelize.query(`
        ALTER TABLE event_shapes 
        ADD COLUMN default_ternary_value enum_event_shapes_default_ternary_value;
        COMMENT ON COLUMN event_shapes.default_ternary_value IS 'Default ternary value for this event shape (for onSite/clientPresent logic)';
      `);
      
      console.log('   ✅ default_ternary_value column added');
    } else {
      console.log('ℹ️  default_ternary_value column already exists, skipping');
    }

    // Add default_order_index column
    const hasOrderIndex = await queryInterface.describeTable('event_shapes')
      .then(columns => 'default_order_index' in columns)
      .catch(() => false);

    if (!hasOrderIndex) {
      console.log('📝 Adding default_order_index column to event_shapes...');
      await queryInterface.addColumn('event_shapes', 'default_order_index', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Default order index for this event shape',
      });
      console.log('   ✅ default_order_index column added');
    } else {
      console.log('ℹ️  default_order_index column already exists, skipping');
    }

    console.log('✅ Migration completed: metadata columns added to event_shapes');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back add metadata columns to event_shapes migration...');

    const tableExists = await queryInterface.tableExists('event_shapes');
    if (!tableExists) {
      console.log('ℹ️  event_shapes table does not exist, nothing to rollback');
      return;
    }

    // Remove default_ternary_value column
    const hasTernaryValue = await queryInterface.describeTable('event_shapes')
      .then(columns => 'default_ternary_value' in columns)
      .catch(() => false);

    if (hasTernaryValue) {
      console.log('📝 Removing default_ternary_value column from event_shapes...');
      await queryInterface.removeColumn('event_shapes', 'default_ternary_value');
      
      // Drop enum type if it exists (using dollar-quoting)
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'enum_event_shapes_default_ternary_value'
          ) THEN
            DROP TYPE enum_event_shapes_default_ternary_value;
          END IF;
        END $$;
      `);
      
      console.log('   ✅ default_ternary_value column removed');
    }

    // Remove default_order_index column
    const hasOrderIndex = await queryInterface.describeTable('event_shapes')
      .then(columns => 'default_order_index' in columns)
      .catch(() => false);

    if (hasOrderIndex) {
      console.log('📝 Removing default_order_index column from event_shapes...');
      await queryInterface.removeColumn('event_shapes', 'default_order_index');
      console.log('   ✅ default_order_index column removed');
    }

    console.log('✅ Rollback completed');
  }
};
