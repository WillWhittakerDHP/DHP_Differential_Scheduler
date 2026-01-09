/**
 * Migration: Add Block Instance Snapshots to Appointments
 * 
 * LEARNING: Adds JSONB fields to store snapshots of block instances at booking time
 * WHY: Preserves service details (name, fees, icon) at booking time for historical accuracy
 * PATTERN: JSONB fields storing snapshots of selected services/dwelling adjustments/availability options
 * 
 * Example data structure:
 * serviceSnapshots: {
 *   "service-uuid": {
 *     id: "service-uuid",
 *     name: "Single Family Home Inspection",
 *     icon: "tabler-home",
 *     baseSqFt: 2000,
 *     allowMultiple: false,
 *     differential: true,
 *     partInstances: [{ id: "...", name: "...", baseFee: 500, ... }]
 *   }
 * }
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping migration.');
      return;
    }

    // Add service_snapshots JSONB column
    const serviceSnapshotsExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'service_snapshots';`
    );
    
    if (serviceSnapshotsExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'service_snapshots', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Snapshots of selected services at booking time (preserves pricing/names)',
      });
      console.log('Added service_snapshots column to appointments table');
    }

    // Add dwelling_snapshots JSONB column
    const dwellingSnapshotsExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'dwelling_snapshots';`
    );
    
    if (dwellingSnapshotsExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'dwelling_snapshots', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Snapshots of selected dwelling adjustments at booking time (preserves pricing/names)',
      });
      console.log('Added dwelling_snapshots column to appointments table');
    }

    // Add availability_option_snapshots JSONB column
    const availabilityOptionSnapshotsExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'availability_option_snapshots';`
    );
    
    if (availabilityOptionSnapshotsExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'availability_option_snapshots', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Snapshots of selected availability options at booking time (preserves pricing/names)',
      });
      console.log('Added availability_option_snapshots column to appointments table');
    }

    console.log('✅ Migration completed: Added block instance snapshot fields to appointments table');
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping rollback.');
      return;
    }

    // Remove columns if they exist
    const columns = ['service_snapshots', 'dwelling_snapshots', 'availability_option_snapshots'];
    
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

    console.log('✅ Rollback completed: Removed block instance snapshot fields from appointments table');
  }
};

