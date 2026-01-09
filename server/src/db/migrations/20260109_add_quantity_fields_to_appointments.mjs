/**
 * Migration: Add Quantity Fields to Appointments
 * 
 * LEARNING: Adds JSONB fields to store per-item quantities for appointments
 * WHY: When users select items with allowMultiple, we need to capture their quantity choices
 * PATTERN: Add optional JSONB fields that store item_id -> quantity mappings
 * 
 * Example data structure:
 * serviceQuantities: { "service-uuid": 2, "another-service-uuid": 1 }
 * dwellingQuantities: { "adu-uuid": 3 }
 * availabilityOptionQuantities: { "option-uuid": 2 }
 * 
 * Use case: When user selects "ADU" dwelling adjustment and specifies "2 ADUs",
 * the appointment stores: dwellingQuantities: { "adu-block-instance-id": 2 }
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping migration.');
      return;
    }

    // Add service_quantities JSONB column
    const serviceQuantitiesExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'service_quantities';`
    );
    
    if (serviceQuantitiesExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'service_quantities', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Quantity multipliers for selected services (item_id -> quantity mapping)',
      });
      console.log('Added service_quantities column to appointments table');
    }

    // Add dwelling_quantities JSONB column
    const dwellingQuantitiesExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'dwelling_quantities';`
    );
    
    if (dwellingQuantitiesExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'dwelling_quantities', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Quantity multipliers for selected dwelling adjustments (item_id -> quantity mapping)',
      });
      console.log('Added dwelling_quantities column to appointments table');
    }

    // Add availability_option_quantities JSONB column
    const optionQuantitiesExists = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'appointments' AND column_name = 'availability_option_quantities';`
    );
    
    if (optionQuantitiesExists[0].length === 0) {
      await queryInterface.addColumn('appointments', 'availability_option_quantities', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Quantity multipliers for selected availability options (item_id -> quantity mapping)',
      });
      console.log('Added availability_option_quantities column to appointments table');
    }

    console.log('Migration completed: Added quantity fields to appointments table');
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping rollback.');
      return;
    }

    // Remove columns if they exist
    const columns = ['service_quantities', 'dwelling_quantities', 'availability_option_quantities'];
    
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

    console.log('Rollback completed: Removed quantity fields from appointments table');
  }
};

