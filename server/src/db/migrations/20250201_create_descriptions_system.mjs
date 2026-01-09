/**
 * Migration: Create descriptions system tables
 * Date: 2025-02-01
 * Purpose: Create Description entity and BlockInstanceDescription through-table for user-specific descriptions
 * 
 * LEARNING: This migration creates:
 * - descriptions table: Reusable description text with optional user-type filtering
 * - block_instance_descriptions table: Many-to-many relationship between block instances and descriptions
 * 
 * WHY: Separating descriptions into their own entity enables:
 * - Shared descriptions across multiple block instances
 * - User-type-specific descriptions (different text for same block based on user type)
 * - Centralized description management (update once, affects all blocks using it)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if descriptions table already exists
    const descriptionsTableExists = await queryInterface.tableExists('descriptions');
    
    if (!descriptionsTableExists) {
      // Create descriptions table
      await queryInterface.createTable('descriptions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        user_type: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'User type filter: buyer, agent, owner, or null for generic descriptions',
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

      // Create index on user_type for filtering
      await queryInterface.addIndex('descriptions', ['user_type'], {
        name: 'idx_descriptions_user_type',
      });

      console.log('✅ Created descriptions table with indexes');
    } else {
      console.log('ℹ️  Table descriptions already exists, skipping');
    }

    // Check if block_instance_descriptions table already exists
    const blockInstanceDescriptionsTableExists = await queryInterface.tableExists('block_instance_descriptions');
    
    if (!blockInstanceDescriptionsTableExists) {
      // Create block_instance_descriptions through-table
      await queryInterface.createTable('block_instance_descriptions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        block_instance_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'block_instances',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        description_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'descriptions',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        user_type: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Optional user type override for this specific relationship (overrides Description.userType)',
        },
        order_index: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Order in which descriptions should be displayed for this block',
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether this description should be shown by default for this block',
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

      // Create unique constraint: prevent duplicate block-description-user_type combinations
      await queryInterface.addConstraint('block_instance_descriptions', {
        fields: ['block_instance_id', 'description_id', 'user_type'],
        type: 'unique',
        name: 'unique_block_instance_description_user_type',
      });

      // Create indexes for performance
      await queryInterface.addIndex('block_instance_descriptions', ['block_instance_id'], {
        name: 'idx_block_instance_descriptions_block_instance_id',
      });

      await queryInterface.addIndex('block_instance_descriptions', ['description_id'], {
        name: 'idx_block_instance_descriptions_description_id',
      });

      await queryInterface.addIndex('block_instance_descriptions', ['order_index'], {
        name: 'idx_block_instance_descriptions_order_index',
      });

      console.log('✅ Created block_instance_descriptions table with indexes and constraints');
    } else {
      console.log('ℹ️  Table block_instance_descriptions already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    const blockInstanceDescriptionsTableExists = await queryInterface.tableExists('block_instance_descriptions');
    
    if (blockInstanceDescriptionsTableExists) {
      await queryInterface.removeIndex('block_instance_descriptions', 'idx_block_instance_descriptions_order_index');
      await queryInterface.removeIndex('block_instance_descriptions', 'idx_block_instance_descriptions_description_id');
      await queryInterface.removeIndex('block_instance_descriptions', 'idx_block_instance_descriptions_block_instance_id');
      
      // Remove unique constraint
      await queryInterface.removeConstraint('block_instance_descriptions', 'unique_block_instance_description_user_type');
      
      // Drop table
      await queryInterface.dropTable('block_instance_descriptions');
      console.log('✅ Removed block_instance_descriptions table');
    }

    const descriptionsTableExists = await queryInterface.tableExists('descriptions');
    
    if (descriptionsTableExists) {
      await queryInterface.removeIndex('descriptions', 'idx_descriptions_user_type');
      await queryInterface.dropTable('descriptions');
      console.log('✅ Removed descriptions table');
    }
  }
};

