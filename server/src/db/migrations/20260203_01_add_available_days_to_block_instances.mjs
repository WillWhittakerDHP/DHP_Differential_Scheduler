/**
 * Migration: Add Available Days to Block Instances
 * 
 * LEARNING: Adds JSONB field to store per-service available days configuration
 * WHY: Allows services to be configured for specific days of the week (e.g., Mon-Fri only)
 * PATTERN: JSONB array storing day indices (0 = Sunday, 6 = Saturday)
 * 
 * Example data:
 * available_days: [1, 2, 3, 4, 5] // Monday through Friday
 * available_days: null // All days available (default/backward compatible)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('block_instances');
    
    if (!tableExists) {
      console.log('block_instances table does not exist. Skipping migration.');
      return;
    }

    // Check if column already exists
    const columnExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'block_instances' AND column_name = 'available_days';`
    );
    
    if (columnExists[0].length === 0) {
      await queryInterface.addColumn('block_instances', 'available_days', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array of day indices (0-6) when this service is available. Null means all days.'
      });
      console.log('Added available_days column to block_instances table');
    } else {
      console.log('available_days column already exists in block_instances table');
    }

    console.log('✅ Migration completed: Added available_days field to block_instances table');
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('block_instances');
    
    if (!tableExists) {
      console.log('block_instances table does not exist. Skipping rollback.');
      return;
    }

    // Check if column exists before removing
    const columnExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'block_instances' AND column_name = 'available_days';`
    );
    
    if (columnExists[0].length > 0) {
      await queryInterface.removeColumn('block_instances', 'available_days');
      console.log('Removed available_days column from block_instances table');
    } else {
      console.log('available_days column does not exist in block_instances table');
    }

    console.log('✅ Rollback completed: Removed available_days field from block_instances table');
  }
};
