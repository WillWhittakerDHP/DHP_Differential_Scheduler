/**
 * Migration: Rename valid_constituents table to valid_parts
 * 
 * WHY: Renaming relationship from "validConstituents" to "validParts" for clearer terminology
 * PATTERN: Rename table and update foreign key constraint names
 */

import { DataTypes } from 'sequelize'

export default {
  async up(queryInterface) {
    // Check if table exists
    const tableExists = await queryInterface.tableExists('valid_constituents')
    if (!tableExists) {
      console.log('ℹ️  Table valid_constituents does not exist, skipping rename')
      return
    }

    // Drop foreign key constraints first
    try {
      await queryInterface.removeConstraint('valid_constituents', 'valid_constituents_parent_id_fkey')
      await queryInterface.removeConstraint('valid_constituents', 'valid_constituents_child_id_fkey')
    } catch (error) {
      console.log('ℹ️  Error removing valid_constituents constraints (may not exist):', error.message)
    }

    // Rename table
    await queryInterface.renameTable('valid_constituents', 'valid_parts')
    console.log('✅ Renamed valid_constituents table to valid_parts')

    // Re-add foreign key constraints with new names
    await queryInterface.addConstraint('valid_parts', {
      fields: ['parent_id'],
      type: 'foreign key',
      references: {
        table: 'block_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'valid_parts_parent_id_fkey',
    })

    await queryInterface.addConstraint('valid_parts', {
      fields: ['child_id'],
      type: 'foreign key',
      references: {
        table: 'part_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'valid_parts_child_id_fkey',
    })
    console.log('✅ Updated foreign key constraints in valid_parts table')
  },

  async down(queryInterface) {
    // Check if table exists
    const tableExists = await queryInterface.tableExists('valid_parts')
    if (!tableExists) {
      console.log('ℹ️  Table valid_parts does not exist, skipping rename')
      return
    }

    // Drop foreign key constraints first
    try {
      await queryInterface.removeConstraint('valid_parts', 'valid_parts_parent_id_fkey')
      await queryInterface.removeConstraint('valid_parts', 'valid_parts_child_id_fkey')
    } catch (error) {
      console.log('ℹ️  Error removing valid_parts constraints:', error.message)
    }

    // Rename table back
    await queryInterface.renameTable('valid_parts', 'valid_constituents')
    console.log('✅ Renamed valid_parts table back to valid_constituents')

    // Re-add foreign key constraints with old names
    await queryInterface.addConstraint('valid_constituents', {
      fields: ['parent_id'],
      type: 'foreign key',
      references: {
        table: 'block_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'valid_constituents_parent_id_fkey',
    })

    await queryInterface.addConstraint('valid_constituents', {
      fields: ['child_id'],
      type: 'foreign key',
      references: {
        table: 'part_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'valid_constituents_child_id_fkey',
    })
    console.log('✅ Updated foreign key constraints in valid_constituents table')
  },
}
