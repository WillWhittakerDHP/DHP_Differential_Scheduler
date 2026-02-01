/**
 * Migration: Create active_components table
 * Date: 2025-11-30
 * Purpose: Create active_components table for active component relationships between block instances
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('active_components');
    
    if (!tableExists) {
      await queryInterface.createTable('active_components', {
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

      await queryInterface.addIndex('active_components', ['parent_id', 'child_id'], {
        unique: true,
        name: 'unique_active_component_parent_child',
      });

      await queryInterface.addIndex('active_components', ['parent_id'], {
        name: 'idx_active_components_parent',
      });

      await queryInterface.addIndex('active_components', ['child_id'], {
        name: 'idx_active_components_child',
      });

      console.log('✅ Created active_components table');
    } else {
      console.log('ℹ️  Table active_components already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex('active_components', 'unique_active_component_parent_child');
      await queryInterface.removeIndex('active_components', 'idx_active_components_parent');
      await queryInterface.removeIndex('active_components', 'idx_active_components_child');
    } catch (error) {
      console.log('ℹ️  Error removing indexes (may not exist):', error.message);
    }

    const tableExists = await queryInterface.tableExists('active_components');
    if (tableExists) {
      await queryInterface.dropTable('active_components');
      console.log('✅ Dropped active_components table');
    } else {
      console.log('ℹ️  Table active_components does not exist, skipping');
    }
  }
};

