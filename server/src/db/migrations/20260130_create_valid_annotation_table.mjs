/**
 * Migration: Create valid_annotations table
 * Date: 2026-01-30
 * Purpose: 
 * - Create valid_annotations table (shape-level: defines which annotation shapes can be used by block shapes)
 * 
 * LEARNING: This creates shape-level validation for annotations, matching the ValidPart pattern
 * - ValidPart: BlockShape → PartShape (which part shapes can be parts of a block shape)
 * - ValidAnnotation: BlockShape → AnnotationShape (which annotation shapes can be annotations of a block shape)
 * 
 * WHY: 
 * - Enables shape-level validation for annotations (similar to parts)
 * - Allows block shapes to define which annotation shapes are valid
 * - Supports the part-to-block collection model alignment
 * 
 * PATTERN: Follows ValidPart table structure exactly
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting valid_annotations table creation migration...');

    const validAnnotationsExists = await queryInterface.tableExists('valid_annotations');
    
    if (!validAnnotationsExists) {
      console.log('📝 Creating valid_annotations table...');
      
      await queryInterface.createTable('valid_annotations', {
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
          comment: 'Foreign key to block_shapes table',
        },
        child_id: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'child_id',
          comment: 'Foreign key to annotation_shapes table',
        },
        disabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
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

      // Add foreign key constraints
      try {
        await queryInterface.addConstraint('valid_annotations', {
          fields: ['parent_id'],
          type: 'foreign key',
          name: 'valid_annotations_parent_id_fkey',
          references: {
            table: 'block_shapes',
            field: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        });
      } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42710') {
          console.log('   ℹ️  Foreign key constraint already exists, skipping');
        } else {
          throw error;
        }
      }

      try {
        await queryInterface.addConstraint('valid_annotations', {
          fields: ['child_id'],
          type: 'foreign key',
          name: 'valid_annotations_child_id_fkey',
          references: {
            table: 'annotation_shapes',
            field: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        });
      } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42710') {
          console.log('   ℹ️  Foreign key constraint already exists, skipping');
        } else {
          throw error;
        }
      }

      // Add indexes
      await queryInterface.addIndex('valid_annotations', ['parent_id', 'child_id'], {
        unique: true,
        name: 'valid_annotations_parent_id_child_id_unique',
      });

      await queryInterface.addIndex('valid_annotations', ['parent_id'], {
        name: 'idx_valid_annotations_parent_id',
      });

      await queryInterface.addIndex('valid_annotations', ['child_id'], {
        name: 'idx_valid_annotations_child_id',
      });

      console.log('   ✅ valid_annotations table created');
    } else {
      console.log('ℹ️  Table valid_annotations already exists, skipping creation');
    }

    console.log('✅ valid_annotations table creation migration completed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Starting valid_annotations table deletion migration...');

    const validAnnotationsExists = await queryInterface.tableExists('valid_annotations');
    
    if (validAnnotationsExists) {
      console.log('📝 Dropping valid_annotations table...');
      
      // Drop indexes first
      try {
        await queryInterface.removeIndex('valid_annotations', 'valid_annotations_parent_id_child_id_unique');
      } catch (error) {
        console.log('   ℹ️  Index already removed or does not exist');
      }

      try {
        await queryInterface.removeIndex('valid_annotations', 'idx_valid_annotations_parent_id');
      } catch (error) {
        console.log('   ℹ️  Index already removed or does not exist');
      }

      try {
        await queryInterface.removeIndex('valid_annotations', 'idx_valid_annotations_child_id');
      } catch (error) {
        console.log('   ℹ️  Index already removed or does not exist');
      }

      // Drop constraints
      try {
        await queryInterface.removeConstraint('valid_annotations', 'valid_annotations_parent_id_fkey');
      } catch (error) {
        console.log('   ℹ️  Constraint already removed or does not exist');
      }

      try {
        await queryInterface.removeConstraint('valid_annotations', 'valid_annotations_child_id_fkey');
      } catch (error) {
        console.log('   ℹ️  Constraint already removed or does not exist');
      }

      // Drop table
      await queryInterface.dropTable('valid_annotations');
      
      console.log('   ✅ valid_annotations table dropped');
    } else {
      console.log('ℹ️  Table valid_annotations does not exist, skipping deletion');
    }

    console.log('✅ valid_annotations table deletion migration completed');
  },
};
