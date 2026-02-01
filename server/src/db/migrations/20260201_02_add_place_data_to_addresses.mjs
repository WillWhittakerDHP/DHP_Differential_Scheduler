/**
 * Migration: Add place_id, latitude, longitude to addresses table
 * Date: 2026-02-01
 * Purpose: Add Google Places API data to addresses for drive time calculations
 * 
 * LEARNING: Addresses now store placeId and coordinates from Google Places API
 * WHY: Enables accurate drive time calculations using Routes API with Place IDs
 * PATTERN: Add nullable columns for backward compatibility, index on place_id for lookups
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add place_id column
    await queryInterface.addColumn('addresses', 'place_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Google Place ID for accurate location identification',
    });

    // Add latitude column
    await queryInterface.addColumn('addresses', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
      comment: 'Latitude coordinate from Google Places API',
    });

    // Add longitude column
    await queryInterface.addColumn('addresses', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
      comment: 'Longitude coordinate from Google Places API',
    });

    // Create index for place_id lookups
    await queryInterface.addIndex('addresses', ['place_id'], {
      name: 'idx_addresses_place_id',
      where: {
        place_id: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    console.log('✅ Added place_id, latitude, longitude columns to addresses table');
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    try {
      await queryInterface.removeIndex('addresses', 'idx_addresses_place_id');
    } catch (e) {
      console.log('   ℹ️  Index idx_addresses_place_id may not exist');
    }

    // Remove columns
    await queryInterface.removeColumn('addresses', 'longitude');
    await queryInterface.removeColumn('addresses', 'latitude');
    await queryInterface.removeColumn('addresses', 'place_id');

    console.log('✅ Removed place_id, latitude, longitude columns from addresses table');
  }
};
