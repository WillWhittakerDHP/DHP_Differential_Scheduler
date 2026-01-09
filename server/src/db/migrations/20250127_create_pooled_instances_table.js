/**
 * Migration: Create pooled_instances table
 * Date: 2025-01-27
 * Purpose: Create table for entity pooling relationships (through table for many-to-many pooling)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('pooled_instances');
    
    if (!tableExists) {
      // Create pooled_instances table
      await queryInterface.createTable('pooled_instances', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        pool_master_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        pool_member_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        entity_type: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        order_index: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
      
      // Create unique constraint: prevent duplicate pool memberships
      await queryInterface.addConstraint('pooled_instances', {
        fields: ['pool_master_id', 'pool_member_id'],
        type: 'unique',
        name: 'unique_pool_membership',
      });
      
      // Create indexes for performance
      await queryInterface.addIndex('pooled_instances', ['pool_master_id'], {
        name: 'idx_pool_master',
      });
      
      await queryInterface.addIndex('pooled_instances', ['pool_member_id'], {
        name: 'idx_pool_member',
      });
      
      await queryInterface.addIndex('pooled_instances', ['entity_type'], {
        name: 'idx_entity_type',
      });
      
      console.log('✅ Created pooled_instances table with indexes');
    } else {
      console.log('ℹ️  Table pooled_instances already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('pooled_instances', 'idx_pool_master');
    await queryInterface.removeIndex('pooled_instances', 'idx_pool_member');
    await queryInterface.removeIndex('pooled_instances', 'idx_entity_type');
    
    // Remove unique constraint
    await queryInterface.removeConstraint('pooled_instances', 'unique_pool_membership');
    
    // Drop table
    await queryInterface.dropTable('pooled_instances');
    
    console.log('✅ Removed pooled_instances table');
  }
};

