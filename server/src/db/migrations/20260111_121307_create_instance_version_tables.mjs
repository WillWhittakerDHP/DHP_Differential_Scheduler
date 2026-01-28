/**
 * Migration: Create Instance Version Tables
 * 
 * LEARNING: Creates immutable version tables for block and part instances
 * WHY: Enables lazy versioning - versions created only when appointments reference instances
 * PATTERN: Temporal/tuple versioning - stores immutable snapshots
 * 
 * CRITICAL DESIGN DECISIONS:
 * - No FK constraint on block_instance_id/part_instance_id to allow deletion without losing history
 * - Part instances versioned as children of block instances (lazy cascade)
 * - Unique constraint on (block_instance_id, created_at) prevents duplicate versions
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create block_instance_versions table
    await queryInterface.createTable('block_instance_versions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      block_instance_id: {
        type: Sequelize.UUID,
        allowNull: false,
        // NO FK constraint - allows instance deletion while preserving history
        comment: 'References block_instances(id) but no FK constraint to allow instance deletion while preserving history',
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      base_sq_ft: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      allow_multiple: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      differential: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('block_instance_versions', ['block_instance_id'], {
      name: 'idx_block_instance_versions_block_instance_id',
    });
    
    await queryInterface.addIndex('block_instance_versions', ['created_at'], {
      name: 'idx_block_instance_versions_created_at',
    });
    
    // Add unique constraint
    await queryInterface.addIndex('block_instance_versions', ['block_instance_id', 'created_at'], {
      unique: true,
      name: 'block_instance_versions_block_instance_id_created_at_unique',
    });

    // Create part_instance_versions table
    await queryInterface.createTable('part_instance_versions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      block_instance_version_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'block_instance_versions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      part_instance_id: {
        type: Sequelize.UUID,
        allowNull: false,
        // NO FK constraint - allows instance deletion while preserving history
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      base_fee: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      base_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rate_over_base_fee: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rate_over_base_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('part_instance_versions', ['block_instance_version_id'], {
      name: 'idx_part_instance_versions_block_instance_version_id',
    });
    
    await queryInterface.addIndex('part_instance_versions', ['part_instance_id'], {
      name: 'idx_part_instance_versions_part_instance_id',
    });
    
    // Add unique constraint
    await queryInterface.addIndex('part_instance_versions', ['block_instance_version_id', 'part_instance_id'], {
      unique: true,
      name: 'part_instance_versions_block_instance_version_id_part_instance_id_unique',
    });

    console.log('✅ Migration completed: Created instance version tables');
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (part_instance_versions first due to FK)
    await queryInterface.dropTable('part_instance_versions');
    await queryInterface.dropTable('block_instance_versions');

    console.log('✅ Rollback completed: Dropped instance version tables');
  }
};
