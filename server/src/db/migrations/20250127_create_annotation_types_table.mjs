/**
 * Migration: Create annotation_types table
 * Date: 2025-01-27
 * Purpose: Create table for dynamic annotation type management
 * 
 * LEARNING: This migration creates a new entity table for annotation types.
 * Types are fully dynamic and can be created/deleted by admins via CRUD interface.
 * 
 * WHY: 
 * - Enables dynamic type management without code changes
 * - Provides foreign key constraint for data integrity
 * - Allows type filtering and organization
 * 
 * PATTERN: Standard table creation migration with indexes
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('annotation_types');
    
    if (!tableExists) {
      // Create annotation_types table
      await queryInterface.createTable('annotation_types', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
          comment: 'Annotation type name (e.g., frontPage, description, tooltip)',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
      
      // Create unique index on name
      await queryInterface.addIndex('annotation_types', ['name'], {
        unique: true,
        name: 'idx_annotation_types_name_unique',
      });
      
      console.log('✅ Created annotation_types table with indexes');
    } else {
      console.log('ℹ️  Table annotation_types already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('annotation_types', 'idx_annotation_types_name_unique');
    
    // Drop table
    await queryInterface.dropTable('annotation_types');
    
    console.log('✅ Removed annotation_types table');
  }
};

