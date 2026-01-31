/**
 * Migration: Remove default* fields from annotation_shapes and event_shapes tables
 * Date: 2026-01-31
 * Purpose: Remove defaultOrderIndex, defaultIsDefault, and defaultTernaryValue fields
 *          These are internal implementation details that shouldn't be in the database
 * 
 * LEARNING: These fields are garbage and should be removed entirely
 * WHY: They're not user-configurable and clutter the metadata editor
 * PATTERN: Drop columns and delete metadata entries
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing default* fields from annotation_shapes and event_shapes tables...');

    // Delete metadata entries for these fields first
    console.log('📝 Deleting metadata entries for default* fields...');
    
    await queryInterface.sequelize.query(`
      DELETE FROM admin_metadata
      WHERE field_key IN ('defaultOrderIndex', 'defaultIsDefault', 'defaultTernaryValue')
        AND entity_type IN ('annotationShape', 'eventShape');
    `);

    // Drop defaultOrderIndex from annotation_shapes
    const annotationDefaultOrderIndexExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'annotation_shapes' AND column_name = 'default_order_index'
    `).then(([results]) => results.length > 0);

    if (annotationDefaultOrderIndexExists) {
      await queryInterface.removeColumn('annotation_shapes', 'default_order_index');
      console.log('✅ Dropped default_order_index from annotation_shapes');
    }

    // Drop defaultIsDefault from annotation_shapes
    const annotationDefaultIsDefaultExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'annotation_shapes' AND column_name = 'default_is_default'
    `).then(([results]) => results.length > 0);

    if (annotationDefaultIsDefaultExists) {
      await queryInterface.removeColumn('annotation_shapes', 'default_is_default');
      console.log('✅ Dropped default_is_default from annotation_shapes');
    }

    // Drop defaultOrderIndex from event_shapes
    const eventDefaultOrderIndexExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'event_shapes' AND column_name = 'default_order_index'
    `).then(([results]) => results.length > 0);

    if (eventDefaultOrderIndexExists) {
      await queryInterface.removeColumn('event_shapes', 'default_order_index');
      console.log('✅ Dropped default_order_index from event_shapes');
    }

    // Drop defaultTernaryValue from event_shapes
    const eventDefaultTernaryValueExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'event_shapes' AND column_name = 'default_ternary_value'
    `).then(([results]) => results.length > 0);

    if (eventDefaultTernaryValueExists) {
      await queryInterface.removeColumn('event_shapes', 'default_ternary_value');
      console.log('✅ Dropped default_ternary_value from event_shapes');
    }

    // Drop the ENUM type if it exists and is no longer used
    // Check if default_ternary_value enum type exists and has no other references
    const enumExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_event_shapes_default_ternary_value'
      ) as exists;
    `).then(([results]) => results[0]?.exists);

    if (enumExists) {
      // Check if any other columns use this enum
      const enumInUse = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE udt_name = 'enum_event_shapes_default_ternary_value'
        ) as in_use;
      `).then(([results]) => results[0]?.in_use);

      if (!enumInUse) {
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS enum_event_shapes_default_ternary_value;
        `);
        console.log('✅ Dropped enum_event_shapes_default_ternary_value type');
      }
    }

    console.log('✅ Removed all default* fields from annotation_shapes and event_shapes tables');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting default* fields removal...');

    // Re-add defaultOrderIndex to annotation_shapes
    const annotationDefaultOrderIndexExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'annotation_shapes' AND column_name = 'default_order_index'
    `).then(([results]) => results.length > 0);

    if (!annotationDefaultOrderIndexExists) {
      await queryInterface.addColumn('annotation_shapes', 'default_order_index', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Default order index for this annotation shape',
      });
    }

    // Re-add defaultIsDefault to annotation_shapes
    const annotationDefaultIsDefaultExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'annotation_shapes' AND column_name = 'default_is_default'
    `).then(([results]) => results.length > 0);

    if (!annotationDefaultIsDefaultExists) {
      await queryInterface.addColumn('annotation_shapes', 'default_is_default', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: 'Default isDefault flag for this annotation shape',
      });
    }

    // Re-add defaultOrderIndex to event_shapes
    const eventDefaultOrderIndexExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'event_shapes' AND column_name = 'default_order_index'
    `).then(([results]) => results.length > 0);

    if (!eventDefaultOrderIndexExists) {
      await queryInterface.addColumn('event_shapes', 'default_order_index', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Default order index for this event shape',
      });
    }

    // Re-add defaultTernaryValue to event_shapes
    const eventDefaultTernaryValueExists = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'event_shapes' AND column_name = 'default_ternary_value'
    `).then(([results]) => results.length > 0);

    if (!eventDefaultTernaryValueExists) {
      // Recreate enum type if it doesn't exist
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_event_shapes_default_ternary_value') THEN
            CREATE TYPE enum_event_shapes_default_ternary_value AS ENUM ('true', 'false', 'override');
          END IF;
        END $$;
      `);

      await queryInterface.addColumn('event_shapes', 'default_ternary_value', {
        type: Sequelize.ENUM('true', 'false', 'override'),
        allowNull: true,
        comment: 'Default ternary value for this event shape (for onSite/clientPresent logic)',
      });
    }

    console.log('✅ Reverted default* fields removal');
  },
};
