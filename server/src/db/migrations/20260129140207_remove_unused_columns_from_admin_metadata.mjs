/**
 * Migration: Remove unused columns from admin_metadata table
 * Date: 2026-01-29
 * Purpose: Remove deprecated/unused columns that are always null:
 *          - section: Never used in categorization logic (uses panel/layout instead)
 *          - inherits_from_entity_type: Deprecated inheritance concept, all values null
 *          - inherits_from_entity_id: Deprecated inheritance concept, all values null
 *          Also removes the inheritance index that's no longer needed
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing unused columns from admin_metadata table...');

    const tableExists = await queryInterface.tableExists('admin_metadata');
    
    if (!tableExists) {
      console.log('❌ admin_metadata table does not exist, cannot remove columns');
      throw new Error('admin_metadata table does not exist');
    }

    const tableDescription = await queryInterface.describeTable('admin_metadata');

    // Remove inheritance index first (before removing columns)
    try {
      await queryInterface.removeIndex('admin_metadata', 'admin_metadata_inheritance_idx');
      console.log('✅ Removed admin_metadata_inheritance_idx index');
    } catch (error) {
      console.log('ℹ️  Index admin_metadata_inheritance_idx does not exist, skipping');
    }

    // Remove inherits_from_entity_type column
    if (tableDescription.inherits_from_entity_type) {
      await queryInterface.removeColumn('admin_metadata', 'inherits_from_entity_type');
      console.log('✅ Removed inherits_from_entity_type column');
    } else {
      console.log('ℹ️  inherits_from_entity_type column does not exist, skipping');
    }

    // Remove inherits_from_entity_id column
    if (tableDescription.inherits_from_entity_id) {
      await queryInterface.removeColumn('admin_metadata', 'inherits_from_entity_id');
      console.log('✅ Removed inherits_from_entity_id column');
    } else {
      console.log('ℹ️  inherits_from_entity_id column does not exist, skipping');
    }

    // Remove section column
    if (tableDescription.section) {
      await queryInterface.removeColumn('admin_metadata', 'section');
      console.log('✅ Removed section column');
    } else {
      console.log('ℹ️  section column does not exist, skipping');
    }

    console.log('✅ Completed removal of unused columns from admin_metadata table');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting unused columns removal from admin_metadata table...');

    const tableExists = await queryInterface.tableExists('admin_metadata');
    
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    const tableDescription = await queryInterface.describeTable('admin_metadata');

    // Restore section column
    if (!tableDescription.section) {
      await queryInterface.addColumn('admin_metadata', 'section', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Optional section/group name',
      });
      console.log('✅ Restored section column');
    }

    // Restore inherits_from_entity_type column
    if (!tableDescription.inherits_from_entity_type) {
      await queryInterface.addColumn('admin_metadata', 'inherits_from_entity_type', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'For instances: parent entity type (blockShape or partShape)',
      });
      console.log('✅ Restored inherits_from_entity_type column');
    }

    // Restore inherits_from_entity_id column
    if (!tableDescription.inherits_from_entity_id) {
      await queryInterface.addColumn('admin_metadata', 'inherits_from_entity_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'For instances: parent entity ID (shape ID)',
      });
      console.log('✅ Restored inherits_from_entity_id column');
    }

    // Restore inheritance index
    try {
      await queryInterface.addIndex('admin_metadata', ['inherits_from_entity_type', 'inherits_from_entity_id'], {
        name: 'admin_metadata_inheritance_idx',
      });
      console.log('✅ Restored admin_metadata_inheritance_idx index');
    } catch (error) {
      console.log('ℹ️  Could not restore inheritance index:', error.message);
    }

    console.log('✅ Reverted unused columns removal from admin_metadata table');
  },
};
