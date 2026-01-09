/**
 * Migration: Create valid_components table
 * Date: 2025-11-30
 * Purpose: Create valid_components table for valid component relationships between block shapes
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('valid_components');
    
    if (!tableExists) {
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

      // Create unique index on parent_id + child_id
      await queryInterface.addIndex('valid_components', ['parent_id', 'child_id'], {
        unique: true,
        name: 'unique_valid_component_parent_child',
      });

      // Create index on parent_id for faster lookups
      await queryInterface.addIndex('valid_components', ['parent_id'], {
        name: 'idx_valid_components_parent',
      });

      // Create index on child_id for faster lookups
      await queryInterface.addIndex('valid_components', ['child_id'], {
        name: 'idx_valid_components_child',
      });

      console.log('✅ Created valid_components table');
    } else {
      console.log('ℹ️  Table valid_components already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('valid_components', 'unique_valid_component_parent_child');
      await queryInterface.removeIndex('valid_components', 'idx_valid_components_parent');
      await queryInterface.removeIndex('valid_components', 'idx_valid_components_child');
    } catch (error) {
      console.log('ℹ️  Error removing indexes (may not exist):', error.message);
    }

    // Remove table
    const tableExists = await queryInterface.tableExists('valid_components');
    if (tableExists) {
      await queryInterface.dropTable('valid_components');
      console.log('✅ Dropped valid_components table');
    } else {
      console.log('ℹ️  Table valid_components does not exist, skipping');
    }
  }
};

