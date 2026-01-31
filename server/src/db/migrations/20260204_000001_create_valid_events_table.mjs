/**
 * Migration: Create valid_events table
 * Date: 2026-02-04
 * Purpose: 
 * - Create valid_events table for PartShape → EventShape relationships
 * - Similar to valid_parts table (BlockShape → PartShape)
 * 
 * LEARNING: Valid events enable part shapes to define which event shapes are valid
 * WHY: Part shapes need to define which event shapes can be assigned to their instances
 * PATTERN: Through table for many-to-many relationships between part shapes and event shapes
 */

import { DataTypes } from 'sequelize'

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting valid_events table creation migration...');

    const tableExists = await queryInterface.tableExists('valid_events');
    
    if (tableExists) {
      console.log('ℹ️  Table valid_events already exists, skipping creation');
      return;
    }

    console.log('📝 Creating valid_events table...');
    
    await queryInterface.createTable('valid_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'parent_id',
        comment: 'Foreign key to part_shapes table',
      },
      child_id: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'child_id',
        comment: 'Foreign key to event_shapes table',
      },
      disabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this relationship is disabled',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    });

    // Add unique index on (parent_id, child_id)
    await queryInterface.addIndex('valid_events', ['parent_id', 'child_id'], {
      unique: true,
      name: 'idx_valid_events_parent_child_unique',
    });

    // Add foreign key constraint for parent_id (part_shapes)
    await queryInterface.addConstraint('valid_events', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'valid_events_parent_id_fkey',
      references: {
        table: 'part_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add foreign key constraint for child_id (event_shapes)
    await queryInterface.addConstraint('valid_events', {
      fields: ['child_id'],
      type: 'foreign key',
      name: 'valid_events_child_id_fkey',
      references: {
        table: 'event_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add indexes for performance
    await queryInterface.addIndex('valid_events', ['parent_id'], {
      name: 'idx_valid_events_parent_id',
    });

    await queryInterface.addIndex('valid_events', ['child_id'], {
      name: 'idx_valid_events_child_id',
    });

    console.log('✅ valid_events table created successfully');
  },

  async down(queryInterface) {
    console.log('🔄 Rolling back valid_events table creation...');

    const tableExists = await queryInterface.tableExists('valid_events');
    
    if (!tableExists) {
      console.log('ℹ️  Table valid_events does not exist, skipping rollback');
      return;
    }

    // Drop foreign key constraints first
    try {
      await queryInterface.removeConstraint('valid_events', 'valid_events_parent_id_fkey');
      await queryInterface.removeConstraint('valid_events', 'valid_events_child_id_fkey');
    } catch (error) {
      console.log('ℹ️  Error removing valid_events constraints (may not exist):', error.message);
    }

    // Drop indexes
    try {
      await queryInterface.removeIndex('valid_events', 'idx_valid_events_parent_child_unique');
      await queryInterface.removeIndex('valid_events', 'idx_valid_events_parent_id');
      await queryInterface.removeIndex('valid_events', 'idx_valid_events_child_id');
    } catch (error) {
      console.log('ℹ️  Error removing valid_events indexes (may not exist):', error.message);
    }

    // Drop table
    await queryInterface.dropTable('valid_events');
    console.log('✅ valid_events table dropped successfully');
  },
}
