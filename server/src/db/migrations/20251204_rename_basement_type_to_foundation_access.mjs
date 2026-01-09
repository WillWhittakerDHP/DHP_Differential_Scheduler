/**
 * Migration: Rename basement_type to foundation_access in properties table
 * Date: 2025-12-04
 * Purpose: Rename basement_type column to foundation_access to match the model definition
 * 
 * LEARNING: Column renames require checking if the column exists before renaming
 * WHY: The model expects foundation_access but the database still has basement_type
 * PATTERN: Use describeTable to check column existence, then renameColumn
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('properties');
    
    // Check if basement_type exists and foundation_access doesn't
    if (tableDescription.basement_type && !tableDescription.foundation_access) {
      await queryInterface.renameColumn('properties', 'basement_type', 'foundation_access');
      console.log('✅ Renamed basement_type to foundation_access in properties table');
    } else if (tableDescription.foundation_access) {
      console.log('ℹ️  foundation_access column already exists in properties, skipping');
    } else if (!tableDescription.basement_type) {
      console.log('ℹ️  basement_type column does not exist in properties, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('properties');
    
    // Check if foundation_access exists and basement_type doesn't
    if (tableDescription.foundation_access && !tableDescription.basement_type) {
      await queryInterface.renameColumn('properties', 'foundation_access', 'basement_type');
      console.log('✅ Renamed foundation_access back to basement_type in properties table');
    } else if (tableDescription.basement_type) {
      console.log('ℹ️  basement_type column already exists in properties, skipping');
    } else if (!tableDescription.foundation_access) {
      console.log('ℹ️  foundation_access column does not exist in properties, skipping');
    }
  }
};























