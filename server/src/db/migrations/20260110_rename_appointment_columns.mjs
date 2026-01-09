/**
 * Migration: Rename Appointment Columns for Consistency
 * 
 * LEARNING: Renames misaligned columns to match current block shape naming conventions
 * WHY: Aligns database column names with frontend types and block shape names (Property, Option)
 * PATTERN: Rename columns to match naming conventions
 * 
 * Column renames:
 * - selected_dwelling_adjustment_ids → selected_property_ids (Property block shape)
 * - dwelling_snapshots → property_snapshots
 * - dwelling_quantities → property_quantities
 * - selected_availability_options → selected_option_ids (Option block shape)
 * - availability_option_snapshots → option_snapshots
 * - availability_option_quantities → option_quantities
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping migration.');
      return;
    }

    // Check if columns exist before renaming (idempotent migration)
    const checkColumn = async (columnName) => {
      const result = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'appointments' AND column_name = '${columnName}';`
      );
      return result[0].length > 0;
    };

    // Rename dwelling → property columns
    if (await checkColumn('selected_dwelling_adjustment_ids')) {
      await queryInterface.renameColumn('appointments', 'selected_dwelling_adjustment_ids', 'selected_property_ids');
      console.log('Renamed selected_dwelling_adjustment_ids → selected_property_ids');
    }

    if (await checkColumn('dwelling_snapshots')) {
      await queryInterface.renameColumn('appointments', 'dwelling_snapshots', 'property_snapshots');
      console.log('Renamed dwelling_snapshots → property_snapshots');
    }

    if (await checkColumn('dwelling_quantities')) {
      await queryInterface.renameColumn('appointments', 'dwelling_quantities', 'property_quantities');
      console.log('Renamed dwelling_quantities → property_quantities');
    }

    // Rename availability_option → option columns
    if (await checkColumn('selected_availability_options')) {
      await queryInterface.renameColumn('appointments', 'selected_availability_options', 'selected_option_ids');
      console.log('Renamed selected_availability_options → selected_option_ids');
    }

    if (await checkColumn('availability_option_snapshots')) {
      await queryInterface.renameColumn('appointments', 'availability_option_snapshots', 'option_snapshots');
      console.log('Renamed availability_option_snapshots → option_snapshots');
    }

    if (await checkColumn('availability_option_quantities')) {
      await queryInterface.renameColumn('appointments', 'availability_option_quantities', 'option_quantities');
      console.log('Renamed availability_option_quantities → option_quantities');
    }

    console.log('✅ Column renaming migration completed');
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('Appointments table does not exist. Skipping rollback.');
      return;
    }

    // Rollback: rename back to original names
    const checkColumn = async (columnName) => {
      const result = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'appointments' AND column_name = '${columnName}';`
      );
      return result[0].length > 0;
    };

    // Rollback property → dwelling
    if (await checkColumn('selected_property_ids')) {
      await queryInterface.renameColumn('appointments', 'selected_property_ids', 'selected_dwelling_adjustment_ids');
      console.log('Rolled back selected_property_ids → selected_dwelling_adjustment_ids');
    }

    if (await checkColumn('property_snapshots')) {
      await queryInterface.renameColumn('appointments', 'property_snapshots', 'dwelling_snapshots');
      console.log('Rolled back property_snapshots → dwelling_snapshots');
    }

    if (await checkColumn('property_quantities')) {
      await queryInterface.renameColumn('appointments', 'property_quantities', 'dwelling_quantities');
      console.log('Rolled back property_quantities → dwelling_quantities');
    }

    // Rollback option → availability_option
    if (await checkColumn('selected_option_ids')) {
      await queryInterface.renameColumn('appointments', 'selected_option_ids', 'selected_availability_options');
      console.log('Rolled back selected_option_ids → selected_availability_options');
    }

    if (await checkColumn('option_snapshots')) {
      await queryInterface.renameColumn('appointments', 'option_snapshots', 'availability_option_snapshots');
      console.log('Rolled back option_snapshots → availability_option_snapshots');
    }

    if (await checkColumn('option_quantities')) {
      await queryInterface.renameColumn('appointments', 'option_quantities', 'availability_option_quantities');
      console.log('Rolled back option_quantities → availability_option_quantities');
    }

    console.log('✅ Column renaming rollback completed');
  }
};

