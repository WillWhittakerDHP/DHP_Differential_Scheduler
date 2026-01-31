/**
 * Migration: Rename active relationship tables to assignment pattern
 * Date: 2026-01-30
 * Purpose: 
 * - Rename active_annotations → annotation_assignments
 * - Rename active_events → event_assignments
 * - Rename active_parts → part_assignments
 * - Update all foreign key references, indexes, and constraints
 * 
 * LEARNING: Consistent naming pattern for assignment/through tables
 * WHY: 
 * - Clearer naming: "assignments" indicates these are runtime assignments
 * - Consistent with assignment terminology used elsewhere
 * - Better semantic clarity: these tables assign entities to other entities
 * 
 * PATTERN: Multi-step migration with foreign key and constraint updates
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Rename active_annotations → annotation_assignments
    const activeAnnotationsExists = await queryInterface.tableExists('active_annotations');
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
    
    if (activeAnnotationsExists && !annotationAssignmentsExists) {
      console.log('📝 Renaming active_annotations → annotation_assignments...');
      
      // Get foreign key constraints
      const [foreignKeys] = await queryInterface.sequelize.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'active_annotations'
        AND constraint_type = 'FOREIGN KEY'
      `);
      
      // Drop foreign key constraints
      for (const fk of foreignKeys) {
        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE active_annotations DROP CONSTRAINT IF EXISTS ${fk.constraint_name}
          `);
        } catch (e) {
          console.log(`   ℹ️  Constraint ${fk.constraint_name} already removed or doesn't exist`);
        }
      }
      
      // Remove unique constraint
      try {
        await queryInterface.removeConstraint('active_annotations', 'unique_block_instance_annotation_user_type');
      } catch (e) {
        console.log('   ℹ️  Unique constraint already removed or doesn\'t exist');
      }
      
      // Remove indexes (will recreate with new names)
      const indexes = [
        'idx_active_annotations_block_instance_id',
        'idx_active_annotations_annotation_id',
        'idx_active_annotations_user_type_block_instance_id'
      ];
      
      for (const indexName of indexes) {
        try {
          await queryInterface.removeIndex('active_annotations', indexName);
        } catch (e) {
          console.log(`   ℹ️  Index ${indexName} already removed or doesn't exist`);
        }
      }
      
      // Rename table
      await queryInterface.renameTable('active_annotations', 'annotation_assignments');
      console.log('   ✅ Table renamed');
      
      // Recreate foreign key constraints with new table names
      await queryInterface.addConstraint('annotation_assignments', {
        fields: ['block_instance_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'annotation_assignments_block_instance_id_fkey',
      });
      
      await queryInterface.addConstraint('annotation_assignments', {
        fields: ['annotation_id'],
        type: 'foreign key',
        references: {
          table: 'annotation_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'annotation_assignments_annotation_id_fkey',
      });
      
      await queryInterface.addConstraint('annotation_assignments', {
        fields: ['user_type_block_instance_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        name: 'annotation_assignments_user_type_block_instance_id_fkey',
      });
      
      // Recreate unique constraint
      await queryInterface.addConstraint('annotation_assignments', {
        fields: ['block_instance_id', 'annotation_id', 'user_type_block_instance_id'],
        type: 'unique',
        name: 'unique_block_instance_annotation_user_type',
      });
      
      // Recreate indexes with new names
      await queryInterface.addIndex('annotation_assignments', ['block_instance_id'], {
        name: 'idx_annotation_assignments_block_instance_id',
      });
      
      await queryInterface.addIndex('annotation_assignments', ['annotation_id'], {
        name: 'idx_annotation_assignments_annotation_id',
      });
      
      await queryInterface.addIndex('annotation_assignments', ['user_type_block_instance_id'], {
        name: 'idx_annotation_assignments_user_type_block_instance_id',
      });
      
      console.log('   ✅ Foreign keys, constraints, and indexes recreated');
    } else if (annotationAssignmentsExists) {
      console.log('ℹ️  annotation_assignments table already exists, skipping rename');
    } else {
      console.log('ℹ️  active_annotations table does not exist, skipping rename');
    }
    
    // 2. Rename active_events → event_assignments
    const activeEventsExists = await queryInterface.tableExists('active_events');
    const eventAssignmentsExists = await queryInterface.tableExists('event_assignments');
    
    if (activeEventsExists && !eventAssignmentsExists) {
      console.log('📝 Renaming active_events → event_assignments...');
      
      // Get foreign key constraints
      const [foreignKeys] = await queryInterface.sequelize.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'active_events'
        AND constraint_type = 'FOREIGN KEY'
      `);
      
      // Drop foreign key constraints
      for (const fk of foreignKeys) {
        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE active_events DROP CONSTRAINT IF EXISTS ${fk.constraint_name}
          `);
        } catch (e) {
          console.log(`   ℹ️  Constraint ${fk.constraint_name} already removed or doesn't exist`);
        }
      }
      
      // Remove indexes (will recreate with new names)
      const indexes = [
        'idx_active_events_part_shape_id',
        'idx_active_events_block_shape_id',
        'idx_active_events_event_instance_id'
      ];
      
      for (const indexName of indexes) {
        try {
          await queryInterface.removeIndex('active_events', indexName);
        } catch (e) {
          console.log(`   ℹ️  Index ${indexName} already removed or doesn't exist`);
        }
      }
      
      // Rename table
      await queryInterface.renameTable('active_events', 'event_assignments');
      console.log('   ✅ Table renamed');
      
      // Recreate foreign key constraints with new table names
      await queryInterface.addConstraint('event_assignments', {
        fields: ['part_shape_id'],
        type: 'foreign key',
        references: {
          table: 'part_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'event_assignments_part_shape_id_fkey',
      });
      
      await queryInterface.addConstraint('event_assignments', {
        fields: ['block_shape_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'event_assignments_block_shape_id_fkey',
      });
      
      await queryInterface.addConstraint('event_assignments', {
        fields: ['event_instance_id'],
        type: 'foreign key',
        references: {
          table: 'event_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'event_assignments_event_instance_id_fkey',
      });
      
      // Recreate indexes with new names
      await queryInterface.addIndex('event_assignments', ['part_shape_id'], {
        name: 'idx_event_assignments_part_shape_id',
      });
      
      await queryInterface.addIndex('event_assignments', ['block_shape_id'], {
        name: 'idx_event_assignments_block_shape_id',
      });
      
      await queryInterface.addIndex('event_assignments', ['event_instance_id'], {
        name: 'idx_event_assignments_event_instance_id',
      });
      
      console.log('   ✅ Foreign keys, constraints, and indexes recreated');
    } else if (eventAssignmentsExists) {
      console.log('ℹ️  event_assignments table already exists, skipping rename');
    } else {
      console.log('ℹ️  active_events table does not exist, skipping rename');
    }
    
    // 3. Rename active_parts → part_assignments
    const activePartsExists = await queryInterface.tableExists('active_parts');
    const partAssignmentsExists = await queryInterface.tableExists('part_assignments');
    
    if (activePartsExists && !partAssignmentsExists) {
      console.log('📝 Renaming active_parts → part_assignments...');
      
      // Get foreign key constraints
      const [foreignKeys] = await queryInterface.sequelize.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'active_parts'
        AND constraint_type = 'FOREIGN KEY'
      `);
      
      // Drop foreign key constraints
      for (const fk of foreignKeys) {
        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE active_parts DROP CONSTRAINT IF EXISTS ${fk.constraint_name}
          `);
        } catch (e) {
          console.log(`   ℹ️  Constraint ${fk.constraint_name} already removed or doesn't exist`);
        }
      }
      
      // Remove unique constraint
      try {
        const [constraints] = await queryInterface.sequelize.query(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = 'active_parts'
          AND constraint_type = 'UNIQUE'
        `);
        for (const constraint of constraints) {
          await queryInterface.removeConstraint('active_parts', constraint.constraint_name);
        }
      } catch (e) {
        console.log('   ℹ️  Unique constraint already removed or doesn\'t exist');
      }
      
      // Rename table
      await queryInterface.renameTable('active_parts', 'part_assignments');
      console.log('   ✅ Table renamed');
      
      // Recreate foreign key constraints with new table names
      await queryInterface.addConstraint('part_assignments', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'part_assignments_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('part_assignments', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'part_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'part_assignments_child_id_fkey',
      });
      
      // Recreate unique constraint
      await queryInterface.addConstraint('part_assignments', {
        fields: ['parent_id', 'child_id'],
        type: 'unique',
        name: 'unique_part_assignment',
      });
      
      console.log('   ✅ Foreign keys and constraints recreated');
    } else if (partAssignmentsExists) {
      console.log('ℹ️  part_assignments table already exists, skipping rename');
    } else {
      console.log('ℹ️  active_parts table does not exist, skipping rename');
    }
    
    console.log('✅ Migration completed: active tables renamed to assignments');
  },
  
  async down(queryInterface, Sequelize) {
    // Reverse order: part_assignments → active_parts
    const partAssignmentsExists = await queryInterface.tableExists('part_assignments');
    if (partAssignmentsExists) {
      console.log('📝 Renaming part_assignments → active_parts...');
      
      // Drop foreign key constraints
      try {
        await queryInterface.removeConstraint('part_assignments', 'part_assignments_parent_id_fkey');
        await queryInterface.removeConstraint('part_assignments', 'part_assignments_child_id_fkey');
        await queryInterface.removeConstraint('part_assignments', 'unique_part_assignment');
      } catch (e) {
        console.log('   ℹ️  Constraints already removed or don\'t exist');
      }
      
      await queryInterface.renameTable('part_assignments', 'active_parts');
      
      // Recreate foreign key constraints
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
      });
      
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
      });
      
      await queryInterface.addConstraint('active_parts', {
        fields: ['parent_id', 'child_id'],
        type: 'unique',
        name: 'unique_active_part',
      });
      
      console.log('   ✅ Table renamed back');
    }
    
    // Reverse: event_assignments → active_events
    const eventAssignmentsExists = await queryInterface.tableExists('event_assignments');
    if (eventAssignmentsExists) {
      console.log('📝 Renaming event_assignments → active_events...');
      
      // Drop foreign key constraints
      try {
        await queryInterface.removeConstraint('event_assignments', 'event_assignments_part_shape_id_fkey');
        await queryInterface.removeConstraint('event_assignments', 'event_assignments_block_shape_id_fkey');
        await queryInterface.removeConstraint('event_assignments', 'event_assignments_event_instance_id_fkey');
      } catch (e) {
        console.log('   ℹ️  Constraints already removed or don\'t exist');
      }
      
      // Remove indexes
      const indexes = [
        'idx_event_assignments_part_shape_id',
        'idx_event_assignments_block_shape_id',
        'idx_event_assignments_event_instance_id'
      ];
      
      for (const indexName of indexes) {
        try {
          await queryInterface.removeIndex('event_assignments', indexName);
        } catch (e) {
          // Ignore
        }
      }
      
      await queryInterface.renameTable('event_assignments', 'active_events');
      
      // Recreate foreign key constraints
      await queryInterface.addConstraint('active_events', {
        fields: ['part_shape_id'],
        type: 'foreign key',
        references: {
          table: 'part_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_events_part_shape_id_fkey',
      });
      
      await queryInterface.addConstraint('active_events', {
        fields: ['block_shape_id'],
        type: 'foreign key',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_events_block_shape_id_fkey',
      });
      
      await queryInterface.addConstraint('active_events', {
        fields: ['event_instance_id'],
        type: 'foreign key',
        references: {
          table: 'event_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_events_event_instance_id_fkey',
      });
      
      // Recreate indexes
      await queryInterface.addIndex('active_events', ['part_shape_id'], {
        name: 'idx_active_events_part_shape_id',
      });
      
      await queryInterface.addIndex('active_events', ['block_shape_id'], {
        name: 'idx_active_events_block_shape_id',
      });
      
      await queryInterface.addIndex('active_events', ['event_instance_id'], {
        name: 'idx_active_events_event_instance_id',
      });
      
      console.log('   ✅ Table renamed back');
    }
    
    // Reverse: annotation_assignments → active_annotations
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
    if (annotationAssignmentsExists) {
      console.log('📝 Renaming annotation_assignments → active_annotations...');
      
      // Drop foreign key constraints
      try {
        await queryInterface.removeConstraint('annotation_assignments', 'annotation_assignments_block_instance_id_fkey');
        await queryInterface.removeConstraint('annotation_assignments', 'annotation_assignments_annotation_id_fkey');
        await queryInterface.removeConstraint('annotation_assignments', 'annotation_assignments_user_type_block_instance_id_fkey');
        await queryInterface.removeConstraint('annotation_assignments', 'unique_block_instance_annotation_user_type');
      } catch (e) {
        console.log('   ℹ️  Constraints already removed or don\'t exist');
      }
      
      // Remove indexes
      const indexes = [
        'idx_annotation_assignments_block_instance_id',
        'idx_annotation_assignments_annotation_id',
        'idx_annotation_assignments_user_type_block_instance_id'
      ];
      
      for (const indexName of indexes) {
        try {
          await queryInterface.removeIndex('annotation_assignments', indexName);
        } catch (e) {
          // Ignore
        }
      }
      
      await queryInterface.renameTable('annotation_assignments', 'active_annotations');
      
      // Recreate foreign key constraints
      await queryInterface.addConstraint('active_annotations', {
        fields: ['block_instance_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_annotations_block_instance_id_fkey',
      });
      
      await queryInterface.addConstraint('active_annotations', {
        fields: ['annotation_id'],
        type: 'foreign key',
        references: {
          table: 'annotation_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_annotations_annotation_id_fkey',
      });
      
      await queryInterface.addConstraint('active_annotations', {
        fields: ['user_type_block_instance_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        name: 'active_annotations_user_type_block_instance_id_fkey',
      });
      
      // Recreate unique constraint
      await queryInterface.addConstraint('active_annotations', {
        fields: ['block_instance_id', 'annotation_id', 'user_type_block_instance_id'],
        type: 'unique',
        name: 'unique_block_instance_annotation_user_type',
      });
      
      // Recreate indexes
      await queryInterface.addIndex('active_annotations', ['block_instance_id'], {
        name: 'idx_active_annotations_block_instance_id',
      });
      
      await queryInterface.addIndex('active_annotations', ['annotation_id'], {
        name: 'idx_active_annotations_annotation_id',
      });
      
      await queryInterface.addIndex('active_annotations', ['user_type_block_instance_id'], {
        name: 'idx_active_annotations_user_type_block_instance_id',
      });
      
      console.log('   ✅ Table renamed back');
    }
    
    console.log('✅ Rollback completed: assignment tables renamed back to active tables');
  }
};
