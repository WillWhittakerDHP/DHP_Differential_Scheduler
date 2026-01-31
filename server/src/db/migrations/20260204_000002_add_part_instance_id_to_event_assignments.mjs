/**
 * Migration: Add part_instance_id to event_assignments table
 * Date: 2026-02-04
 * Purpose: 
 * - Add part_instance_id column to event_assignments table
 * - Enables instance-level event assignments (PartInstance → EventInstance)
 * - Keeps part_shape_id and block_shape_id for backward compatibility during migration
 * 
 * LEARNING: Event assignments move from shape-level to instance-level
 * WHY: Matches validParts/partAssignments pattern - shapes define valid options, instances assign them
 * PATTERN: Add nullable column, add foreign key constraint, add index
 */

import { DataTypes } from 'sequelize'

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting add part_instance_id to event_assignments migration...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('event_assignments');
    if (tableDescription.part_instance_id) {
      console.log('ℹ️  Column part_instance_id already exists, skipping migration');
      return;
    }

    console.log('📝 Adding part_instance_id column to event_assignments table...');
    
    await queryInterface.addColumn('event_assignments', 'part_instance_id', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'Foreign key to part_instances table (instance-level event configuration)',
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('event_assignments', {
      fields: ['part_instance_id'],
      type: 'foreign key',
      name: 'event_assignments_part_instance_id_fkey',
      references: {
        table: 'part_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add index for performance
    await queryInterface.addIndex('event_assignments', ['part_instance_id'], {
      name: 'idx_event_assignments_part_instance_id',
    });

    console.log('✅ part_instance_id column added successfully');
  },

  async down(queryInterface) {
    console.log('🔄 Rolling back part_instance_id column addition...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping rollback');
      return;
    }

    // Check if column exists
    const tableDescription = await queryInterface.describeTable('event_assignments');
    if (!tableDescription.part_instance_id) {
      console.log('ℹ️  Column part_instance_id does not exist, skipping rollback');
      return;
    }

    // Drop foreign key constraint first
    try {
      await queryInterface.removeConstraint('event_assignments', 'event_assignments_part_instance_id_fkey');
    } catch (error) {
      console.log('ℹ️  Error removing part_instance_id constraint (may not exist):', error.message);
    }

    // Drop index
    try {
      await queryInterface.removeIndex('event_assignments', 'idx_event_assignments_part_instance_id');
    } catch (error) {
      console.log('ℹ️  Error removing part_instance_id index (may not exist):', error.message);
    }

    // Drop column
    await queryInterface.removeColumn('event_assignments', 'part_instance_id');
    console.log('✅ part_instance_id column removed successfully');
  },
}
