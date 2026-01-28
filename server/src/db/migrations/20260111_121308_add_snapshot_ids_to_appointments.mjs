/**
 * Migration: Add Snapshot ID Columns to Appointments
 * 
 * LEARNING: Adds UUID array columns for referencing block instance versions
 * WHY: Replaces JSONB snapshots with FK references to immutable version tables
 * PATTERN: UUID arrays reference block_instance_versions table
 * 
 * NOTE: These columns start as nullable - new appointments will populate them,
 * old appointments continue using JSONB snapshots during transition period
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping migration.');
      return;
    }

    // Add service_snapshot_ids UUID array column
    const serviceSnapshotIdsExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'service_snapshot_ids';`
    );
    
    if (serviceSnapshotIdsExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'service_snapshot_ids', {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
        comment: 'Array of block_instance_version IDs for selected services',
      });
      console.log('Added service_snapshot_ids column to appointments table');
    }

    // Add property_snapshot_ids UUID array column
    const propertySnapshotIdsExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'property_snapshot_ids';`
    );
    
    if (propertySnapshotIdsExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'property_snapshot_ids', {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
        comment: 'Array of block_instance_version IDs for selected property type blocks',
      });
      console.log('Added property_snapshot_ids column to appointments table');
    }

    // Add option_snapshot_ids UUID array column
    const optionSnapshotIdsExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'option_snapshot_ids';`
    );
    
    if (optionSnapshotIdsExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'option_snapshot_ids', {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
        comment: 'Array of block_instance_version IDs for selected availability options',
      });
      console.log('Added option_snapshot_ids column to appointments table');
    }

    console.log('✅ Migration completed: Added snapshot ID columns to appointments table');
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping rollback.');
      return;
    }

    // Remove columns if they exist
    const columns = ['service_snapshot_ids', 'property_snapshot_ids', 'option_snapshot_ids'];
    
    for (const column of columns) {
      const columnExists = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'appointments' AND column_name = '${column}';`
      );
      
      if (columnExists[0].length > 0) {
        await queryInterface.removeColumn('appointments', column);
        console.log(`Removed ${column} column from appointments table`);
      }
    }

    console.log('✅ Rollback completed: Removed snapshot ID columns from appointments table');
  }
};
