/**
 * Migration: Add Boolean Fields to Entity Tables
 * Purpose: Add boolean fields (active, dependent, visible) to all entity tables:
 *   - block_shapes: Add active, dependent, visible
 *   - block_instances: Add active, dependent, rename visibility → visible
 *   - part_shapes: Add active, dependent, visible
 *   - part_instances: Add active, dependent, visible
 * Date: 2025-11-28
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Add boolean fields to block_shapes
    const blockShapesDescription = await queryInterface.describeTable('block_shapes');
    
    if (!blockShapesDescription.active) {
      await queryInterface.addColumn('block_shapes', 'active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added active column to block_shapes');
    } else {
      console.log('ℹ️  Column block_shapes.active already exists, skipping');
    }
    
    if (!blockShapesDescription.dependent) {
      await queryInterface.addColumn('block_shapes', 'dependent', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      console.log('✅ Added dependent column to block_shapes');
    } else {
      console.log('ℹ️  Column block_shapes.dependent already exists, skipping');
    }
    
    if (!blockShapesDescription.visible) {
      await queryInterface.addColumn('block_shapes', 'visible', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added visible column to block_shapes');
    } else {
      console.log('ℹ️  Column block_shapes.visible already exists, skipping');
    }

    // 2. Add boolean fields to block_instances and rename visibility → visible
    const blockInstancesDescription = await queryInterface.describeTable('block_instances');
    
    // Check if visibility column exists and rename it to visible
    if (blockInstancesDescription.visibility && !blockInstancesDescription.visible) {
      await queryInterface.renameColumn('block_instances', 'visibility', 'visible');
      console.log('✅ Renamed visibility column to visible in block_instances');
    } else if (!blockInstancesDescription.visible) {
      // If visibility doesn't exist, add visible column
      await queryInterface.addColumn('block_instances', 'visible', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added visible column to block_instances');
    } else {
      console.log('ℹ️  Column block_instances.visible already exists, skipping');
    }
    
    if (!blockInstancesDescription.active) {
      await queryInterface.addColumn('block_instances', 'active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added active column to block_instances');
    } else {
      console.log('ℹ️  Column block_instances.active already exists, skipping');
    }
    
    if (!blockInstancesDescription.dependent) {
      await queryInterface.addColumn('block_instances', 'dependent', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      console.log('✅ Added dependent column to block_instances');
    } else {
      console.log('ℹ️  Column block_instances.dependent already exists, skipping');
    }

    // 3. Add boolean fields to part_shapes
    const partShapesDescription = await queryInterface.describeTable('part_shapes');
    
    if (!partShapesDescription.active) {
      await queryInterface.addColumn('part_shapes', 'active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added active column to part_shapes');
    } else {
      console.log('ℹ️  Column part_shapes.active already exists, skipping');
    }
    
    if (!partShapesDescription.dependent) {
      await queryInterface.addColumn('part_shapes', 'dependent', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      console.log('✅ Added dependent column to part_shapes');
    } else {
      console.log('ℹ️  Column part_shapes.dependent already exists, skipping');
    }
    
    if (!partShapesDescription.visible) {
      await queryInterface.addColumn('part_shapes', 'visible', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added visible column to part_shapes');
    } else {
      console.log('ℹ️  Column part_shapes.visible already exists, skipping');
    }

    // 4. Add boolean fields to part_instances
    const partInstancesDescription = await queryInterface.describeTable('part_instances');
    
    if (!partInstancesDescription.active) {
      await queryInterface.addColumn('part_instances', 'active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added active column to part_instances');
    } else {
      console.log('ℹ️  Column part_instances.active already exists, skipping');
    }
    
    if (!partInstancesDescription.dependent) {
      await queryInterface.addColumn('part_instances', 'dependent', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      console.log('✅ Added dependent column to part_instances');
    } else {
      console.log('ℹ️  Column part_instances.dependent already exists, skipping');
    }
    
    if (!partInstancesDescription.visible) {
      await queryInterface.addColumn('part_instances', 'visible', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
      console.log('✅ Added visible column to part_instances');
    } else {
      console.log('ℹ️  Column part_instances.visible already exists, skipping');
    }

    // Add indexes for filtering performance
    try {
      await queryInterface.addIndex('block_shapes', ['active'], {
        name: 'idx_block_shapes_active',
      });
      await queryInterface.addIndex('block_shapes', ['visible'], {
        name: 'idx_block_shapes_visible',
      });
      await queryInterface.addIndex('block_instances', ['active'], {
        name: 'idx_block_instances_active',
      });
      await queryInterface.addIndex('block_instances', ['visible'], {
        name: 'idx_block_instances_visible',
      });
      await queryInterface.addIndex('part_shapes', ['active'], {
        name: 'idx_part_shapes_active',
      });
      await queryInterface.addIndex('part_shapes', ['visible'], {
        name: 'idx_part_shapes_visible',
      });
      await queryInterface.addIndex('part_instances', ['active'], {
        name: 'idx_part_instances_active',
      });
      await queryInterface.addIndex('part_instances', ['visible'], {
        name: 'idx_part_instances_visible',
      });
      console.log('✅ Added indexes for boolean fields');
    } catch (error) {
      console.log('ℹ️  Some indexes may already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('block_shapes', 'idx_block_shapes_active');
      await queryInterface.removeIndex('block_shapes', 'idx_block_shapes_visible');
      await queryInterface.removeIndex('block_instances', 'idx_block_instances_active');
      await queryInterface.removeIndex('block_instances', 'idx_block_instances_visible');
      await queryInterface.removeIndex('part_shapes', 'idx_part_shapes_active');
      await queryInterface.removeIndex('part_shapes', 'idx_part_shapes_visible');
      await queryInterface.removeIndex('part_instances', 'idx_part_instances_active');
      await queryInterface.removeIndex('part_instances', 'idx_part_instances_visible');
    } catch (error) {
      console.log('ℹ️  Error removing indexes (may not exist):', error.message);
    }

    // Remove columns from part_instances
    try {
      await queryInterface.removeColumn('part_instances', 'visible');
      await queryInterface.removeColumn('part_instances', 'dependent');
      await queryInterface.removeColumn('part_instances', 'active');
      console.log('✅ Removed boolean columns from part_instances');
    } catch (error) {
      console.log('ℹ️  Error removing columns from part_instances:', error.message);
    }

    // Remove columns from part_shapes
    try {
      await queryInterface.removeColumn('part_shapes', 'visible');
      await queryInterface.removeColumn('part_shapes', 'dependent');
      await queryInterface.removeColumn('part_shapes', 'active');
      console.log('✅ Removed boolean columns from part_shapes');
    } catch (error) {
      console.log('ℹ️  Error removing columns from part_shapes:', error.message);
    }

    // Remove columns from block_instances and rename visible → visibility
    try {
      await queryInterface.removeColumn('block_instances', 'dependent');
      await queryInterface.removeColumn('block_instances', 'active');
      // Rename visible back to visibility if it was renamed
      const blockInstancesDescription = await queryInterface.describeTable('block_instances');
      if (blockInstancesDescription.visible && !blockInstancesDescription.visibility) {
        await queryInterface.renameColumn('block_instances', 'visible', 'visibility');
        console.log('✅ Renamed visible column back to visibility in block_instances');
      } else {
        await queryInterface.removeColumn('block_instances', 'visible');
      }
      console.log('✅ Removed boolean columns from block_instances');
    } catch (error) {
      console.log('ℹ️  Error removing columns from block_instances:', error.message);
    }

    // Remove columns from block_shapes
    try {
      await queryInterface.removeColumn('block_shapes', 'visible');
      await queryInterface.removeColumn('block_shapes', 'dependent');
      await queryInterface.removeColumn('block_shapes', 'active');
      console.log('✅ Removed boolean columns from block_shapes');
    } catch (error) {
      console.log('ℹ️  Error removing columns from block_shapes:', error.message);
    }
  }
};

