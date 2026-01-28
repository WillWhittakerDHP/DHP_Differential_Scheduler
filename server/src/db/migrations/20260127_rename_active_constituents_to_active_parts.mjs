/**
 * Migration: Rename active_constituents table to active_parts
 * 
 * WHY: Renaming relationship from "activeConstituents" to "activeParts" for clearer terminology
 * PATTERN: Rename table and update foreign key constraint names
 */

import { DataTypes } from 'sequelize'

export default {
  async up(queryInterface) {
    // Check if table exists
    const tableExists = await queryInterface.tableExists('active_constituents')
    if (!tableExists) {
      console.log('ℹ️  Table active_constituents does not exist, skipping rename')
      return
    }

    // Drop foreign key constraints first
    try {
      await queryInterface.removeConstraint('active_constituents', 'active_constituents_parent_id_fkey')
      await queryInterface.removeConstraint('active_constituents', 'active_constituents_child_id_fkey')
    } catch (error) {
      console.log('ℹ️  Error removing active_constituents constraints (may not exist):', error.message)
    }

    // Rename table
    await queryInterface.renameTable('active_constituents', 'active_parts')
    console.log('✅ Renamed active_constituents table to active_parts')

    // Re-add foreign key constraints with new names
    await queryInterface.addConstraint('active_parts', {
      fields: ['parent_id'],
      type: 'foreign key',
      references: {
        table: 'block_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'active_parts_parent_id_fkey',
    })

    await queryInterface.addConstraint('active_parts', {
      fields: ['child_id'],
      type: 'foreign key',
      references: {
        table: 'part_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'active_parts_child_id_fkey',
    })
    console.log('✅ Updated foreign key constraints in active_parts table')
  },

  async down(queryInterface) {
    // Check if table exists
    const tableExists = await queryInterface.tableExists('active_parts')
    if (!tableExists) {
      console.log('ℹ️  Table active_parts does not exist, skipping rename')
      return
    }

    // Drop foreign key constraints first
    try {
      await queryInterface.removeConstraint('active_parts', 'active_parts_parent_id_fkey')
      await queryInterface.removeConstraint('active_parts', 'active_parts_child_id_fkey')
    } catch (error) {
      console.log('ℹ️  Error removing active_parts constraints:', error.message)
    }

    // Rename table back
    await queryInterface.renameTable('active_parts', 'active_constituents')
    console.log('✅ Renamed active_parts table back to active_constituents')

    // Re-add foreign key constraints with old names
    await queryInterface.addConstraint('active_constituents', {
      fields: ['parent_id'],
      type: 'foreign key',
      references: {
        table: 'block_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'active_constituents_parent_id_fkey',
    })

    await queryInterface.addConstraint('active_constituents', {
      fields: ['child_id'],
      type: 'foreign key',
      references: {
        table: 'part_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'active_constituents_child_id_fkey',
    })
    console.log('✅ Updated foreign key constraints in active_constituents table')
  },
}
