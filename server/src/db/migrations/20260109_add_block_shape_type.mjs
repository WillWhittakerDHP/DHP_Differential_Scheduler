/**
 * Migration: Add block_shape_type enum and type column
 * Date: 2026-01-09
 * Purpose: Add immutable `type` enum column to block_shapes for semantic identification
 *          independent of display name. This enables stable type-based filtering
 *          instead of fragile name-based lookups.
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting block_shape_type migration...');

    // Check if enum type already exists
    const [enumExists] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'block_shape_type'
      ) as exists;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (!enumExists?.exists) {
      // Create block_shape_type enum
      await queryInterface.sequelize.query(`
        CREATE TYPE block_shape_type AS ENUM ('user', 'service', 'property', 'option');
      `);
      console.log('✅ Created block_shape_type enum');
    } else {
      console.log('ℹ️  block_shape_type enum already exists, skipping creation');
    }

    // Check if type column already exists
    const [columnExists] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'block_shapes' AND column_name = 'type'
      ) as exists;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (!columnExists?.exists) {
      // Add type column to block_shapes (nullable initially)
      await queryInterface.sequelize.query(`
        ALTER TABLE block_shapes ADD COLUMN type block_shape_type;
      `);
      console.log('✅ Added type column to block_shapes');
    } else {
      console.log('ℹ️  type column already exists, skipping creation');
    }

    // Populate based on current names
    await queryInterface.sequelize.query(`
      UPDATE block_shapes SET type = 'user' WHERE name = 'User';
    `);
    console.log("✅ Populated type = 'user' for User block shapes");

    await queryInterface.sequelize.query(`
      UPDATE block_shapes SET type = 'service' WHERE name = 'Service';
    `);
    console.log("✅ Populated type = 'service' for Service block shapes");

    await queryInterface.sequelize.query(`
      UPDATE block_shapes SET type = 'property' WHERE name = 'Property';
    `);
    console.log("✅ Populated type = 'property' for Property block shapes");

    await queryInterface.sequelize.query(`
      UPDATE block_shapes SET type = 'option' WHERE name = 'Option';
    `);
    console.log("✅ Populated type = 'option' for Option block shapes");

    // Verify all rows have type populated
    const untypedRows = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count FROM block_shapes WHERE type IS NULL;
    `, { type: Sequelize.QueryTypes.SELECT });

    const untypedCount = untypedRows?.[0]?.count || 0;
    if (untypedCount > 0) {
      throw new Error(`Found ${untypedCount} block_shapes without type. Cannot proceed.`);
    }

    // Check if column is already NOT NULL
    const [notNullCheck] = await queryInterface.sequelize.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'block_shapes' AND column_name = 'type';
    `, { type: Sequelize.QueryTypes.SELECT });

    if (notNullCheck?.is_nullable === 'YES') {
      // Make NOT NULL after population
      await queryInterface.sequelize.query(`
        ALTER TABLE block_shapes ALTER COLUMN type SET NOT NULL;
      `);
      console.log('✅ Set type column to NOT NULL');
    } else {
      console.log('ℹ️  type column is already NOT NULL, skipping');
    }

    // Verify final state
    const finalState = await queryInterface.sequelize.query(`
      SELECT type, COUNT(*) as count
      FROM block_shapes
      GROUP BY type
      ORDER BY type;
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('✅ Final block_shapes type distribution:');
    if (Array.isArray(finalState)) {
      finalState.forEach((row) => {
        console.log(`   - ${row.type}: ${row.count} block shape(s)`);
      });
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting block_shape_type migration...');

    // Remove NOT NULL constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE block_shapes ALTER COLUMN type DROP NOT NULL;
    `);

    // Drop type column
    await queryInterface.sequelize.query(`
      ALTER TABLE block_shapes DROP COLUMN type;
    `);

    // Drop enum type
    await queryInterface.sequelize.query(`
      DROP TYPE block_shape_type;
    `);

    console.log('✅ Reverted block_shape_type migration');
  }
};
