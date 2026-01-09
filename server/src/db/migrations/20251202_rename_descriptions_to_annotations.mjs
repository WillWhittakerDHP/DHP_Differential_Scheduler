/**
 * Migration: Rename descriptions to annotations and migrate user types to BlockInstances
 * Date: 2025-12-02
 * Purpose: 
 * - Rename descriptions → annotations (main entity table)
 * - Rename block_instance_descriptions → annotation_assignments (through table)
 * - Rename description_id → annotation_id
 * - Change user_type VARCHAR → user_type_block_instance_id UUID (foreign key to block_instances)
 * - Map existing string user_type values to BlockInstance IDs
 * 
 * LEARNING: This migration:
 * - Renames tables to match frontend terminology (annotations)
 * - Changes user types from strings to BlockInstance foreign keys for proper SQL relationships
 * - Enables cascade support and proper relational queries
 * 
 * WHY: 
 * - Frontend uses "annotations" terminology, backend should match
 * - User types as BlockInstances enables proper SQL relationships and cascade support
 * - Foreign key constraints ensure data integrity
 * 
 * PATTERN: Multi-step migration with data transformation
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const USER_TYPE_BLOCK_SHAPE_ID = 'c6e7ec8a-ed79-4280-b54c-3e8b75155168'; // "User Type" BlockShape ID
    
    console.log('🔄 Starting descriptions → annotations migration...');

    // Step 1: Get user type BlockInstances for mapping
    console.log('📋 Fetching user type BlockInstances...');
    const userTypeBlockInstancesResult = await queryInterface.sequelize.query(`
      SELECT id, LOWER(name) as name_lower, name
      FROM block_instances
      WHERE block_shape_ref = :blockShapeId
    `, {
      replacements: { blockShapeId: USER_TYPE_BLOCK_SHAPE_ID },
      type: Sequelize.QueryTypes.SELECT
    });

    // Handle query result format (could be array or object with array)
    const userTypeBlockInstances = Array.isArray(userTypeBlockInstancesResult)
      ? userTypeBlockInstancesResult
      : (userTypeBlockInstancesResult[0] || []);

    // Create mapping: lowercase name → BlockInstance ID
    const userTypeMapping = new Map();
    userTypeBlockInstances.forEach(ut => {
      userTypeMapping.set(ut.name_lower, ut.id);
      console.log(`   - ${ut.name} (${ut.name_lower}) → ${ut.id}`);
    });

    // Step 2: Rename block_instance_descriptions table → annotation_assignments
    const blockInstanceDescriptionsExists = await queryInterface.tableExists('block_instance_descriptions');
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
    
    if (blockInstanceDescriptionsExists && !annotationAssignmentsExists) {
      console.log('📝 Renaming block_instance_descriptions → annotation_assignments...');
      
      // Remove old unique constraint (will recreate with new name)
      try {
        await queryInterface.removeConstraint('block_instance_descriptions', 'unique_block_instance_description_user_type');
      } catch (e) {
        console.log('   ℹ️  Constraint already removed or doesn\'t exist');
      }

      // Remove old indexes (will recreate with new names)
      try {
        await queryInterface.removeIndex('block_instance_descriptions', 'idx_block_instance_descriptions_block_instance_id');
        await queryInterface.removeIndex('block_instance_descriptions', 'idx_block_instance_descriptions_description_id');
        await queryInterface.removeIndex('block_instance_descriptions', 'idx_block_instance_descriptions_order_index');
      } catch (e) {
        console.log('   ℹ️  Indexes already removed or don\'t exist');
      }

      // Rename table
      await queryInterface.renameTable('block_instance_descriptions', 'annotation_assignments');
      console.log('   ✅ Table renamed');

      // Step 3: Rename description_id → annotation_id
      console.log('📝 Renaming description_id → annotation_id...');
      await queryInterface.renameColumn('annotation_assignments', 'description_id', 'annotation_id');
      console.log('   ✅ Column renamed');

      // Step 4: Add new user_type_block_instance_id column (UUID, nullable)
      console.log('📝 Adding user_type_block_instance_id column...');
      await queryInterface.addColumn('annotation_assignments', 'user_type_block_instance_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'block_instances',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      console.log('   ✅ Column added');

      // Step 5: Migrate existing user_type string values to BlockInstance IDs
      console.log('📝 Migrating user_type string values to BlockInstance IDs...');
      const rowsWithUserTypeResult = await queryInterface.sequelize.query(`
        SELECT id, user_type
        FROM annotation_assignments
        WHERE user_type IS NOT NULL
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      // Handle query result format
      const rowsWithUserType = Array.isArray(rowsWithUserTypeResult)
        ? rowsWithUserTypeResult
        : (rowsWithUserTypeResult[0] || []);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const row of rowsWithUserType) {
        const userTypeLower = row.user_type.toLowerCase();
        const blockInstanceId = userTypeMapping.get(userTypeLower);

        if (blockInstanceId) {
          await queryInterface.sequelize.query(`
            UPDATE annotation_assignments
            SET user_type_block_instance_id = :blockInstanceId
            WHERE id = :id
          `, {
            replacements: {
              id: row.id,
              blockInstanceId: blockInstanceId
            }
          });
          migratedCount++;
        } else {
          console.log(`   ⚠️  Warning: Unknown user_type "${row.user_type}" for assignment ${row.id}, setting to NULL`);
          skippedCount++;
        }
      }

      console.log(`   ✅ Migrated ${migratedCount} assignments, skipped ${skippedCount}`);

      // Step 6: Add index on user_type_block_instance_id
      console.log('📝 Adding index on user_type_block_instance_id...');
      await queryInterface.addIndex('annotation_assignments', ['user_type_block_instance_id'], {
        name: 'idx_annotation_assignments_user_type_block_instance_id',
      });
      console.log('   ✅ Index added');

      // Step 7: Recreate indexes with new names
      console.log('📝 Recreating indexes with new names...');
      await queryInterface.addIndex('annotation_assignments', ['block_instance_id'], {
        name: 'idx_annotation_assignments_block_instance_id',
      });
      await queryInterface.addIndex('annotation_assignments', ['annotation_id'], {
        name: 'idx_annotation_assignments_annotation_id',
      });
      await queryInterface.addIndex('annotation_assignments', ['order_index'], {
        name: 'idx_annotation_assignments_order_index',
      });
      console.log('   ✅ Indexes recreated');

      // Step 8: Update unique constraint (now uses user_type_block_instance_id instead of user_type)
      console.log('📝 Updating unique constraint...');
      await queryInterface.addConstraint('annotation_assignments', {
        fields: ['block_instance_id', 'annotation_id', 'user_type_block_instance_id'],
        type: 'unique',
        name: 'unique_block_instance_annotation_user_type',
      });
      console.log('   ✅ Unique constraint updated');

      // Step 9: Remove old user_type column (after migration)
      console.log('📝 Removing old user_type column...');
      await queryInterface.removeColumn('annotation_assignments', 'user_type');
      console.log('   ✅ Old column removed');
    } else if (annotationAssignmentsExists) {
      console.log('ℹ️  annotation_assignments table already exists, skipping table rename');
    } else {
      console.log('⚠️  block_instance_descriptions table does not exist, skipping');
    }

    // Step 10: Rename descriptions table → annotations
    const descriptionsExists = await queryInterface.tableExists('descriptions');
    const annotationsExists = await queryInterface.tableExists('annotations');
    
    if (descriptionsExists && !annotationsExists) {
      console.log('📝 Renaming descriptions → annotations...');
      
      // Remove old index (will recreate with new name)
      try {
        await queryInterface.removeIndex('descriptions', 'idx_descriptions_user_type');
      } catch (e) {
        console.log('   ℹ️  Index already removed or doesn\'t exist');
      }

      // Rename table
      await queryInterface.renameTable('descriptions', 'annotations');
      console.log('   ✅ Table renamed');

      // Recreate index with new name
      await queryInterface.addIndex('annotations', ['user_type'], {
        name: 'idx_annotations_user_type',
      });
      console.log('   ✅ Index recreated');

      // Update foreign key reference in annotation_assignments (if table exists)
      if (await queryInterface.tableExists('annotation_assignments')) {
        // Note: PostgreSQL doesn't support renaming foreign key constraints directly
        // We need to drop and recreate the foreign key
        console.log('📝 Updating foreign key reference to annotations table...');
        
        // Get the constraint name
        const constraintsResult = await queryInterface.sequelize.query(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = 'annotation_assignments'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%annotation_id%'
        `, {
          type: Sequelize.QueryTypes.SELECT
        });

        const constraints = Array.isArray(constraintsResult)
          ? constraintsResult
          : (constraintsResult[0] || []);

        if (constraints.length > 0) {
          // Drop old foreign key
          await queryInterface.sequelize.query(`
            ALTER TABLE annotation_assignments
            DROP CONSTRAINT IF EXISTS ${constraints[0].constraint_name}
          `);

          // Recreate foreign key pointing to annotations table
          await queryInterface.addConstraint('annotation_assignments', {
            fields: ['annotation_id'],
            type: 'foreign key',
            name: 'annotation_assignments_annotation_id_fkey',
            references: {
              table: 'annotations',
              field: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          });
          console.log('   ✅ Foreign key updated');
        }
      }
    } else if (annotationsExists) {
      console.log('ℹ️  annotations table already exists, skipping table rename');
    } else {
      console.log('⚠️  descriptions table does not exist, skipping');
    }

    console.log('✅ Migration complete!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back annotations → descriptions migration...');

    // Step 1: Rename annotations → descriptions
    const annotationsExists = await queryInterface.tableExists('annotations');
    if (annotationsExists) {
      console.log('📝 Renaming annotations → descriptions...');
      
      // Remove index
      try {
        await queryInterface.removeIndex('annotations', 'idx_annotations_user_type');
      } catch (e) {
        console.log('   ℹ️  Index already removed or doesn\'t exist');
      }

      await queryInterface.renameTable('annotations', 'descriptions');
      
      // Recreate index
      await queryInterface.addIndex('descriptions', ['user_type'], {
        name: 'idx_descriptions_user_type',
      });
      console.log('   ✅ Table renamed back');
    }

    // Step 2: Rename annotation_assignments → block_instance_descriptions
    const annotationAssignmentsExists = await queryInterface.tableExists('annotation_assignments');
    if (annotationAssignmentsExists) {
      console.log('📝 Renaming annotation_assignments → block_instance_descriptions...');

      // Remove new constraint and indexes
      try {
        await queryInterface.removeConstraint('annotation_assignments', 'unique_block_instance_annotation_user_type');
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_user_type_block_instance_id');
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_block_instance_id');
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_annotation_id');
        await queryInterface.removeIndex('annotation_assignments', 'idx_annotation_assignments_order_index');
      } catch (e) {
        console.log('   ℹ️  Constraints/indexes already removed or don\'t exist');
      }

      // Add back user_type column (VARCHAR)
      await queryInterface.addColumn('annotation_assignments', 'user_type', {
        type: Sequelize.STRING,
        allowNull: true,
      });

      // Migrate BlockInstance IDs back to strings (if possible)
      // Note: This is lossy - we can't perfectly reverse the migration
      // We'll set user_type to NULL for all rows
      await queryInterface.sequelize.query(`
        UPDATE annotation_assignments
        SET user_type = NULL
      `);

      // Remove user_type_block_instance_id column
      await queryInterface.removeColumn('annotation_assignments', 'user_type_block_instance_id');

      // Rename annotation_id → description_id
      await queryInterface.renameColumn('annotation_assignments', 'annotation_id', 'description_id');

      // Rename table
      await queryInterface.renameTable('annotation_assignments', 'block_instance_descriptions');

      // Recreate old indexes
      await queryInterface.addIndex('block_instance_descriptions', ['block_instance_id'], {
        name: 'idx_block_instance_descriptions_block_instance_id',
      });
      await queryInterface.addIndex('block_instance_descriptions', ['description_id'], {
        name: 'idx_block_instance_descriptions_description_id',
      });
      await queryInterface.addIndex('block_instance_descriptions', ['order_index'], {
        name: 'idx_block_instance_descriptions_order_index',
      });

      // Recreate old unique constraint
      await queryInterface.addConstraint('block_instance_descriptions', {
        fields: ['block_instance_id', 'description_id', 'user_type'],
        type: 'unique',
        name: 'unique_block_instance_description_user_type',
      });

      // Update foreign key reference back to descriptions
      await queryInterface.sequelize.query(`
        ALTER TABLE block_instance_descriptions
        DROP CONSTRAINT IF EXISTS annotation_assignments_annotation_id_fkey
      `);

      await queryInterface.addConstraint('block_instance_descriptions', {
        fields: ['description_id'],
        type: 'foreign key',
        name: 'block_instance_descriptions_description_id_fkey',
        references: {
          table: 'descriptions',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      console.log('   ✅ Table renamed back');
    }

    console.log('✅ Rollback complete!');
  }
};

