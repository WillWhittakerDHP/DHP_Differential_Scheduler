/**
 * Migration: Remove Active Column from Shapes
 * Purpose: Remove the active column from block_shapes and part_shapes tables (NOT instances)
 * Date: 2026-01-13
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('block_shapes', 'idx_block_shapes_active');
      console.log('✅ Removed index idx_block_shapes_active');
    } catch (error) {
      console.log('ℹ️  Index idx_block_shapes_active may not exist:', error.message);
    }

    try {
      await queryInterface.removeIndex('part_shapes', 'idx_part_shapes_active');
      console.log('✅ Removed index idx_part_shapes_active');
    } catch (error) {
      console.log('ℹ️  Index idx_part_shapes_active may not exist:', error.message);
    }

    // Remove active column from block_shapes
    try {
      const blockShapesDescription = await queryInterface.describeTable('block_shapes');
      if (blockShapesDescription.active) {
        await queryInterface.removeColumn('block_shapes', 'active');
        console.log('✅ Removed active column from block_shapes');
      } else {
        console.log('ℹ️  Column block_shapes.active does not exist, skipping');
      }
    } catch (error) {
      console.log('ℹ️  Error removing active column from block_shapes:', error.message);
    }

    // Remove active column from part_shapes
    try {
      const partShapesDescription = await queryInterface.describeTable('part_shapes');
      if (partShapesDescription.active) {
        await queryInterface.removeColumn('part_shapes', 'active');
        console.log('✅ Removed active column from part_shapes');
      } else {
        console.log('ℹ️  Column part_shapes.active does not exist, skipping');
      }
    } catch (error) {
      console.log('ℹ️  Error removing active column from part_shapes:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add active column to block_shapes
    try {
      const blockShapesDescription = await queryInterface.describeTable('block_shapes');
      if (!blockShapesDescription.active) {
        await queryInterface.addColumn('block_shapes', 'active', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
        console.log('✅ Re-added active column to block_shapes');
      }
    } catch (error) {
      console.log('ℹ️  Error re-adding active column to block_shapes:', error.message);
    }

    // Re-add active column to part_shapes
    try {
      const partShapesDescription = await queryInterface.describeTable('part_shapes');
      if (!partShapesDescription.active) {
        await queryInterface.addColumn('part_shapes', 'active', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
        console.log('✅ Re-added active column to part_shapes');
      }
    } catch (error) {
      console.log('ℹ️  Error re-adding active column to part_shapes:', error.message);
    }

    // Re-add indexes
    try {
      await queryInterface.addIndex('block_shapes', ['active'], {
        name: 'idx_block_shapes_active',
      });
      console.log('✅ Re-added index idx_block_shapes_active');
    } catch (error) {
      console.log('ℹ️  Error re-adding index idx_block_shapes_active:', error.message);
    }

    try {
      await queryInterface.addIndex('part_shapes', ['active'], {
        name: 'idx_part_shapes_active',
      });
      console.log('✅ Re-added index idx_part_shapes_active');
    } catch (error) {
      console.log('ℹ️  Error re-adding index idx_part_shapes_active:', error.message);
    }
  }
};
