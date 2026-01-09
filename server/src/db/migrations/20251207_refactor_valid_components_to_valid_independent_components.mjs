/**
 * Migration: Refactor valid_components to valid_independent_components
 * Date: 2025-12-07
 * Purpose: Change validComponents from blockShape → blockShape to blockInstance → blockInstance
 *          and rename to validIndependentComponents
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if old valid_components table exists
    const oldTableExists = await queryInterface.tableExists('valid_components');
    
    if (oldTableExists) {
      // Drop old table and indexes
      await queryInterface.removeIndex('valid_components', 'unique_valid_component_parent_child');
      await queryInterface.removeIndex('valid_components', 'idx_valid_components_parent');
      await queryInterface.removeIndex('valid_components', 'idx_valid_components_child');
      await queryInterface.dropTable('valid_components');
      console.log('✅ Dropped old valid_components table');
    } else {
      console.log('ℹ️  Old valid_components table does not exist, skipping drop');
    }
    
    // Check if new valid_independent_components table already exists
    const newTableExists = await queryInterface.tableExists('valid_independent_components');
    
    if (newTableExists) {
      console.log('ℹ️  Table valid_independent_components already exists, skipping creation');
      return;
    }
    
    // Create new valid_independent_components table
    await queryInterface.createTable('valid_independent_components', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      child_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      disabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    
    // Create indexes
    await queryInterface.addIndex('valid_independent_components', ['parent_id', 'child_id'], {
      unique: true,
      name: 'unique_valid_independent_component_parent_child',
    });
    
    await queryInterface.addIndex('valid_independent_components', ['parent_id'], {
      name: 'idx_valid_independent_components_parent',
    });
    
    await queryInterface.addIndex('valid_independent_components', ['child_id'], {
      name: 'idx_valid_independent_components_child',
    });
    
    console.log('✅ Created valid_independent_components table');
  },

  async down(queryInterface, Sequelize) {
    // Check if new table exists
    const newTableExists = await queryInterface.tableExists('valid_independent_components');
    
    if (newTableExists) {
      // Drop new table and indexes
      await queryInterface.removeIndex('valid_independent_components', 'unique_valid_independent_component_parent_child');
      await queryInterface.removeIndex('valid_independent_components', 'idx_valid_independent_components_parent');
      await queryInterface.removeIndex('valid_independent_components', 'idx_valid_independent_components_child');
      await queryInterface.dropTable('valid_independent_components');
      console.log('✅ Dropped valid_independent_components table');
    } else {
      console.log('ℹ️  Table valid_independent_components does not exist, skipping rollback');
    }
    
    // Check if old table exists
    const oldTableExists = await queryInterface.tableExists('valid_components');
    
    if (oldTableExists) {
      console.log('ℹ️  Old valid_components table already exists, skipping recreation');
      return;
    }
    
    // Recreate old valid_components table (blockShape → blockShape)
    await queryInterface.createTable('valid_components', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      child_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      disabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    
    // Create indexes for old table
    await queryInterface.addIndex('valid_components', ['parent_id', 'child_id'], {
      unique: true,
      name: 'unique_valid_component_parent_child',
    });
    
    await queryInterface.addIndex('valid_components', ['parent_id'], {
      name: 'idx_valid_components_parent',
    });
    
    await queryInterface.addIndex('valid_components', ['child_id'], {
      name: 'idx_valid_components_child',
    });
    
    console.log('✅ Recreated old valid_components table');
  }
};























