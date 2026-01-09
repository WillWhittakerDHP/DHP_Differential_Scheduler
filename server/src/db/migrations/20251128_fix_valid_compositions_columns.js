/**
 * Migration: Fix valid_compositions table column names
 * Purpose: Rename createdAt/updatedAt to created_at/updated_at to match Sequelize underscored convention
 * Date: 2025-11-28
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const validCompositionsExists = await queryInterface.tableExists('valid_compositions');
    if (validCompositionsExists) {
      // Check if columns need to be renamed
      const tableDescription = await queryInterface.describeTable('valid_compositions');
      
      if (tableDescription.createdAt && !tableDescription.created_at) {
        await queryInterface.renameColumn('valid_compositions', 'createdAt', 'created_at');
        console.log('✅ Renamed createdAt to created_at in valid_compositions');
      }
      
      if (tableDescription.updatedAt && !tableDescription.updated_at) {
        await queryInterface.renameColumn('valid_compositions', 'updatedAt', 'updated_at');
        console.log('✅ Renamed updatedAt to updated_at in valid_compositions');
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const validCompositionsExists = await queryInterface.tableExists('valid_compositions');
    if (validCompositionsExists) {
      const tableDescription = await queryInterface.describeTable('valid_compositions');
      
      if (tableDescription.created_at && !tableDescription.createdAt) {
        await queryInterface.renameColumn('valid_compositions', 'created_at', 'createdAt');
        console.log('✅ Renamed created_at back to createdAt in valid_compositions');
      }
      
      if (tableDescription.updated_at && !tableDescription.updatedAt) {
        await queryInterface.renameColumn('valid_compositions', 'updated_at', 'updatedAt');
        console.log('✅ Renamed updated_at back to updatedAt in valid_compositions');
      }
    }
  },
};

