/**
 * Migration: Rename annotation tables to match entity/relationship pattern
 * Date: 2025-12-02
 * Purpose: 
 * - Rename annotation_types → annotation_shapes (shape-level: defines what annotation types can exist)
 * - Rename annotations → annotation_instances (instance-level: concrete annotation entities)
 * - Rename annotation_assignments → active_annotations (runtime: which annotations are assigned to which entities)
 * - Update all foreign key references, indexes, and constraints
 * 
 * LEARNING: This creates full parallelism with entity/relationship naming:
 * - Shapes: block_shapes, part_shapes, annotation_shapes
 * - Instances: block_instances, part_instances, annotation_instances
 * - Active Relationships: active_cascades, active_components, active_constituents, active_annotations
 * 
 * WHY: 
 * - Consistent naming pattern across entire system
 * - Clear distinction between shape-level (definitions) and instance-level (concrete entities)
 * - Matches established entity/relationship architecture
 * 
 * PATTERN: Multi-step migration with foreign key and constraint updates
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting annotation tables → shape/instance pattern migration...');

    // Step 1: Rename annotation_types → annotation_shapes
    const annotationTypesExists = await queryInterface.tableExists('annotation_types');
    const annotationShapesExists = await queryInterface.tableExists('annotation_shapes');
    
    if (annotationTypesExists && !annotationShapesExists) {
      console.log('📝 Renaming annotation_types → annotation_shapes...');
      
      // Remove indexes first (will recreate with new names)
      try {
        await queryInterface.removeIndex('annotation_types', 'idx_annotation_types_name_unique');
      } catch (e) {
        console.log('   ℹ️  Index idx_annotation_types_name_unique already removed or doesn\'t exist');
      }

      // Rename table
      await queryInterface.renameTable('annotation_types', 'annotation_shapes');
      console.log('   ✅ Table renamed');

      // Recreate indexes with new table name
      try {
        await queryInterface.addIndex('annotation_shapes', ['name'], {
          unique: true,
          name: 'idx_annotation_shapes_name_unique',
        });
        console.log('   ✅ Index recreated');
      } catch (e) {
        console.log('   ℹ️  Index already exists or error creating');
      }
    } else if (annotationShapesExists) {
      console.log('ℹ️  Table annotation_shapes already exists, skipping rename');
    } else {
      console.log('⚠️  Table annotation_types does not exist, skipping rename');
    }

    // Step 2: Rename annotations → annotation_instances
    const annotationsExists = await queryInterface.tableExists('annotations');
    const annotationInstancesExists = await queryInterface.tableExists('annotation_instances');
    
    if (annotationsExists && !annotationInstancesExists) {
      console.log('📝 Renaming annotations → annotation_instances...');
      
      // Remove foreign key constraints first (will recreate with new names)
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE annotations DROP CONSTRAINT IF EXISTS annotations_type_fkey
        `);
        await queryInterface.sequelize.query(`
          ALTER TABLE annotations DROP CONSTRAINT IF EXISTS annotations_type_fkey1
        `);
        console.log('   ✅ Foreign key constraints removed');
      } catch (e) {
        console.log('   ℹ️  Foreign key constraints already removed or don\'t exist');
      }

      // Remove indexes first (will recreate with new names)
      try {
        await queryInterface.removeIndex('annotations', 'idx_annotations_type');
        await queryInterface.removeIndex('annotations', 'idx_annotations_user_type');
      } catch (e) {
        console.log('   ℹ️  Indexes already removed or don\'t exist');
      }

      // Rename table
      await queryInterface.renameTable('annotations', 'annotation_instances');
      console.log('   ✅ Table renamed');

      // Recreate foreign key constraint with new table name
      await queryInterface.sequelize.query(`
        ALTER TABLE annotation_instances
        ADD CONSTRAINT annotation_instances_type_fkey
        FOREIGN KEY (type) REFERENCES annotation_shapes(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
      `);
      console.log('   ✅ Foreign key constraint recreated');

      // Recreate indexes with new table name
      try {
        await queryInterface.addIndex('annotation_instances', ['type'], {
          name: 'idx_annotation_instances_type',
        });
        await queryInterface.addIndex('annotation_instances', ['user_type'], {
          name: 'idx_annotation_instances_user_type',
        });
        console.log('   ✅ Indexes recreated');
      } catch (e) {
        console.log('   ℹ️  Indexes already exist or error creating');
      }
    } else if (annotationInstancesExists) {
      console.log('ℹ️  Table annotation_instances already exists, skipping rename');
    } else {
      console.log('⚠️  Table annotations does not exist, skipping rename');
    }

    // Step 3: Rename annotation_assignments → active_annotations
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
    const activeAnnotationsExists = await queryInterface.tableExists('active_annotations');
    
    if (annotationAssignmentsExists && !activeAnnotationsExists) {
      console.log('📝 Renaming annotation_assignments → active_annotations...');
      
      // Remove foreign key constraints first (will recreate with new names)
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE annotation_assignments DROP CONSTRAINT IF EXISTS block_instance_descriptions_block_instance_id_fkey
        `);
        await queryInterface.sequelize.query(`
          ALTER TABLE annotation_assignments DROP CONSTRAINT IF EXISTS block_instance_descriptions_description_id_fkey
        `);
        await queryInterface.sequelize.query(`
          ALTER TABLE annotation_assignments DROP CONSTRAINT IF EXISTS annotation_assignments_user_type_block_instance_id_fkey
        `);
        console.log('   ✅ Foreign key constraints removed');
      } catch (e) {
        console.log('   ℹ️  Foreign key constraints already removed or don\'t exist');
      }

      // Remove unique constraint
      try {
        await queryInterface.removeConstraint('annotation_assignments', 'unique_block_instance_annotation_user_type');
      } catch (e) {
        console.log('   ℹ️  Unique constraint already removed or doesn\'t exist');
      }

      // Remove indexes first (will recreate with new names)
      try {
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_annotation_id');
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_block_instance_id');
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_order_index');
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_user_type_block_instance_id');
      } catch (e) {
        console.log('   ℹ️  Indexes already removed or don\'t exist');
      }

      // Rename table
      await queryInterface.renameTable('annotation_assignments', 'active_annotations');
      console.log('   ✅ Table renamed');

      // Recreate foreign key constraints with new table names
      await queryInterface.sequelize.query(`
        ALTER TABLE active_annotations
        ADD CONSTRAINT active_annotations_block_instance_id_fkey
        FOREIGN KEY (block_instance_id) REFERENCES block_instances(id)
        ON UPDATE CASCADE ON DELETE CASCADE
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE active_annotations
        ADD CONSTRAINT active_annotations_annotation_id_fkey
        FOREIGN KEY (annotation_id) REFERENCES annotation_instances(id)
        ON UPDATE CASCADE ON DELETE CASCADE
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE active_annotations
        ADD CONSTRAINT active_annotations_user_type_block_instance_id_fkey
        FOREIGN KEY (user_type_block_instance_id) REFERENCES block_instances(id)
        ON UPDATE CASCADE ON DELETE SET NULL
      `);
      console.log('   ✅ Foreign key constraints recreated');

      // Recreate unique constraint
      await queryInterface.addConstraint('active_annotations', {
        fields: ['block_instance_id', 'annotation_id', 'user_type_block_instance_id'],
        type: 'unique',
        name: 'unique_block_instance_annotation_user_type',
      });
      console.log('   ✅ Unique constraint recreated');

      // Recreate indexes with new table name
      try {
        await queryInterface.addIndex('active_annotations', ['annotation_id'], {
          name: 'idx_active_annotations_annotation_id',
        });
        await queryInterface.addIndex('active_annotations', ['block_instance_id'], {
          name: 'idx_active_annotations_block_instance_id',
        });
        await queryInterface.addIndex('active_annotations', ['order_index'], {
          name: 'idx_active_annotations_order_index',
        });
        await queryInterface.addIndex('active_annotations', ['user_type_block_instance_id'], {
          name: 'idx_active_annotations_user_type_block_instance_id',
        });
        console.log('   ✅ Indexes recreated');
      } catch (e) {
        console.log('   ℹ️  Indexes already exist or error creating');
      }
    } else if (activeAnnotationsExists) {
      console.log('ℹ️  Table active_annotations already exists, skipping rename');
    } else {
      console.log('⚠️  Table annotation_assignments does not exist, skipping rename');
    }

    console.log('✅ All annotation tables renamed to shape/instance pattern!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back annotation tables rename...');

    // Reverse order: active_annotations → annotation_assignments
    const activeAnnotationsExists = await queryInterface.tableExists('active_annotations');
    if (activeAnnotationsExists) {
      // Remove constraints and indexes
      try {
        await queryInterface.removeConstraint('active_annotations', 'unique_block_instance_annotation_user_type');
        await queryInterface.removeIndex('active_annotations', 'idx_active_annotations_annotation_id');
        await queryInterface.removeIndex('active_annotations', 'idx_active_annotations_block_instance_id');
        await queryInterface.removeIndex('active_annotations', 'idx_active_annotations_order_index');
        await queryInterface.removeIndex('active_annotations', 'idx_active_annotations_user_type_block_instance_id');
        await queryInterface.sequelize.query(`
          ALTER TABLE active_annotations DROP CONSTRAINT IF EXISTS active_annotations_block_instance_id_fkey
        `);
        await queryInterface.sequelize.query(`
          ALTER TABLE active_annotations DROP CONSTRAINT IF EXISTS active_annotations_annotation_id_fkey
        `);
        await queryInterface.sequelize.query(`
          ALTER TABLE active_annotations DROP CONSTRAINT IF EXISTS active_annotations_user_type_block_instance_id_fkey
        `);
      } catch (e) {
        console.log('   ℹ️  Error removing constraints/indexes');
      }
      
      await queryInterface.renameTable('active_annotations', 'annotation_assignments');
      console.log('✅ Renamed active_annotations → annotation_assignments');
    }

    // annotation_instances → annotations
    const annotationInstancesExists = await queryInterface.tableExists('annotation_instances');
    if (annotationInstancesExists) {
      try {
        await queryInterface.removeIndex('annotation_instances', 'idx_annotation_instances_type');
        await queryInterface.removeIndex('annotation_instances', 'idx_annotation_instances_user_type');
        await queryInterface.sequelize.query(`
          ALTER TABLE annotation_instances DROP CONSTRAINT IF EXISTS annotation_instances_type_fkey
        `);
      } catch (e) {
        console.log('   ℹ️  Error removing constraints/indexes');
      }
      
      await queryInterface.renameTable('annotation_instances', 'annotations');
      console.log('✅ Renamed annotation_instances → annotations');
    }

    // annotation_shapes → annotation_types
    const annotationShapesExists = await queryInterface.tableExists('annotation_shapes');
    if (annotationShapesExists) {
      try {
        await queryInterface.removeIndex('annotation_shapes', 'idx_annotation_shapes_name_unique');
      } catch (e) {
        console.log('   ℹ️  Error removing index');
      }
      
      await queryInterface.renameTable('annotation_shapes', 'annotation_types');
      console.log('✅ Renamed annotation_shapes → annotation_types');
    }

    console.log('✅ Rollback complete!');
  }
};

