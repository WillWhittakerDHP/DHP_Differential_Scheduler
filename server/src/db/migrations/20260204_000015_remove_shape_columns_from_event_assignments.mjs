/**
 * Migration: Remove part_shape_id and block_shape_id columns from event_assignments
 * Date: 2026-02-04
 * Purpose: 
 * - Remove deprecated part_shape_id and block_shape_id columns
 * - Event assignments are now instance-level only (part_instance_id or block_instance_id)
 * - WHY: EventInstances are native to instances, not shapes
 * 
 * LEARNING: Event assignments moved from shape-level to instance-level
 * PATTERN: Drop columns, drop foreign keys, drop indexes, drop associations
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing shape columns from event_assignments table...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    const tableDescription = await queryInterface.describeTable('event_assignments');
    
    // Drop foreign key constraints
    if (tableDescription.part_shape_id) {
      console.log('📝 Dropping foreign key constraint for part_shape_id...');
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE event_assignments
          DROP CONSTRAINT IF EXISTS event_assignments_part_shape_id_fkey
        `);
        console.log('✅ Dropped foreign key constraint for part_shape_id');
      } catch (error) {
        console.log('ℹ️  Foreign key constraint for part_shape_id does not exist or already dropped');
      }
    }

    if (tableDescription.block_shape_id) {
      console.log('📝 Dropping foreign key constraint for block_shape_id...');
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE event_assignments
          DROP CONSTRAINT IF EXISTS event_assignments_block_shape_id_fkey
        `);
        console.log('✅ Dropped foreign key constraint for block_shape_id');
      } catch (error) {
        console.log('ℹ️  Foreign key constraint for block_shape_id does not exist or already dropped');
      }
    }

    // Drop indexes
    if (tableDescription.part_shape_id) {
      console.log('📝 Dropping index for part_shape_id...');
      try {
        await queryInterface.removeIndex('event_assignments', 'idx_event_assignments_part_shape_id');
        console.log('✅ Dropped index for part_shape_id');
      } catch (error) {
        console.log('ℹ️  Index for part_shape_id does not exist or already dropped');
      }
    }

    if (tableDescription.block_shape_id) {
      console.log('📝 Dropping index for block_shape_id...');
      try {
        await queryInterface.removeIndex('event_assignments', 'idx_event_assignments_block_shape_id');
        console.log('✅ Dropped index for block_shape_id');
      } catch (error) {
        console.log('ℹ️  Index for block_shape_id does not exist or already dropped');
      }
    }

    // Drop columns
    if (tableDescription.part_shape_id) {
      console.log('📝 Dropping part_shape_id column...');
      await queryInterface.removeColumn('event_assignments', 'part_shape_id');
      console.log('✅ Dropped part_shape_id column');
    } else {
      console.log('ℹ️  Column part_shape_id does not exist');
    }

    if (tableDescription.block_shape_id) {
      console.log('📝 Dropping block_shape_id column...');
      await queryInterface.removeColumn('event_assignments', 'block_shape_id');
      console.log('✅ Dropped block_shape_id column');
    } else {
      console.log('ℹ️  Column block_shape_id does not exist');
    }

    console.log('✅ Removed shape columns from event_assignments table');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting shape columns removal...');

    const tableExists = await queryInterface.tableExists('event_assignments');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_assignments does not exist, skipping migration');
      return;
    }

    const tableDescription = await queryInterface.describeTable('event_assignments');

    // Re-add columns
    if (!tableDescription.part_shape_id) {
      console.log('📝 Re-adding part_shape_id column...');
      await queryInterface.addColumn('event_assignments', 'part_shape_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Foreign key to part_shapes table (shape-level event configuration - deprecated)',
      });

      // Re-add foreign key constraint
      await queryInterface.addConstraint('event_assignments', {
        fields: ['part_shape_id'],
        type: 'foreign key',
        name: 'event_assignments_part_shape_id_fkey',
        references: {
          table: 'part_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Re-add index
      await queryInterface.addIndex('event_assignments', ['part_shape_id'], {
        name: 'idx_event_assignments_part_shape_id',
      });

      console.log('✅ Re-added part_shape_id column');
    }

    if (!tableDescription.block_shape_id) {
      console.log('📝 Re-adding block_shape_id column...');
      await queryInterface.addColumn('event_assignments', 'block_shape_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Foreign key to block_shapes table (shape-level event configuration - deprecated)',
      });

      // Re-add foreign key constraint
      await queryInterface.addConstraint('event_assignments', {
        fields: ['block_shape_id'],
        type: 'foreign key',
        name: 'event_assignments_block_shape_id_fkey',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Re-add index
      await queryInterface.addIndex('event_assignments', ['block_shape_id'], {
        name: 'idx_event_assignments_block_shape_id',
      });

      console.log('✅ Re-added block_shape_id column');
    }

    console.log('✅ Reverted shape columns removal');
  }
};
