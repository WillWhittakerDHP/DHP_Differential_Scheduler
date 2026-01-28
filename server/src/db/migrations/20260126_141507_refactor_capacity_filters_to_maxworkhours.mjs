/**
 * Migration: Refactor Capacity Filters to maxWorkHours Structure
 * Date: 2026-01-26
 * Purpose: Transform capacity filter settings from separate properties (workHoursPerDay, calendarWeekLimit, rollingWeekLimit)
 *          to nested maxWorkHours structure for consistency and better organization
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Refactoring capacity filters to maxWorkHours structure...');

    const AVAILABILITY_SETTINGS_KEY = 'availability_settings';

    // Find all business_settings records with availability_settings key
    const queryResult = await queryInterface.sequelize.query(
      `SELECT id, setting_value FROM business_settings WHERE setting_key = :key`,
      {
        replacements: { key: AVAILABILITY_SETTINGS_KEY },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Handle Sequelize query result - QueryTypes.SELECT returns rows directly, but check for array
    const results = Array.isArray(queryResult) ? queryResult : [];

    if (!results || results.length === 0) {
      console.log('ℹ️  No availability_settings records found, skipping migration');
      return;
    }

    let transformedCount = 0;

    for (const record of results) {
      const settingValue = record.setting_value;
      
      // Check if old structure exists
      const hasOldStructure = 
        settingValue.workHoursPerDay !== undefined ||
        settingValue.calendarWeekLimit !== undefined ||
        settingValue.rollingWeekLimit !== undefined;

      if (!hasOldStructure) {
        console.log(`ℹ️  Record ${record.id} already uses new structure, skipping`);
        continue;
      }

      // Create maxWorkHours object if it doesn't exist
      if (!settingValue.maxWorkHours) {
        settingValue.maxWorkHours = {};
      }

      // Transform old structure to new structure
      if (settingValue.workHoursPerDay !== undefined) {
        settingValue.maxWorkHours.day = settingValue.workHoursPerDay;
        delete settingValue.workHoursPerDay;
      }

      if (settingValue.calendarWeekLimit !== undefined) {
        settingValue.maxWorkHours.calendarWeek = settingValue.calendarWeekLimit;
        delete settingValue.calendarWeekLimit;
      }

      if (settingValue.rollingWeekLimit !== undefined) {
        settingValue.maxWorkHours.rollingWeek = settingValue.rollingWeekLimit;
        delete settingValue.rollingWeekLimit;
      }

      // Update the record
      await queryInterface.sequelize.query(
        `UPDATE business_settings SET setting_value = :settingValue::jsonb WHERE id = :id`,
        {
          replacements: {
            id: record.id,
            settingValue: JSON.stringify(settingValue)
          },
          type: Sequelize.QueryTypes.UPDATE
        }
      );

      transformedCount++;
      console.log(`✅ Transformed record ${record.id}`);
    }

    console.log(`✅ Migration complete: ${transformedCount} record(s) transformed`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting capacity filters to old structure...');

    const AVAILABILITY_SETTINGS_KEY = 'availability_settings';

    // Find all business_settings records with availability_settings key
    const queryResult = await queryInterface.sequelize.query(
      `SELECT id, setting_value FROM business_settings WHERE setting_key = :key`,
      {
        replacements: { key: AVAILABILITY_SETTINGS_KEY },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Handle Sequelize query result - QueryTypes.SELECT returns rows directly, but check for array
    const results = Array.isArray(queryResult) ? queryResult : [];

    if (!results || results.length === 0) {
      console.log('ℹ️  No availability_settings records found, skipping rollback');
      return;
    }

    let revertedCount = 0;

    for (const record of results) {
      const settingValue = record.setting_value;
      
      // Check if new structure exists
      if (!settingValue.maxWorkHours) {
        console.log(`ℹ️  Record ${record.id} doesn't have maxWorkHours, skipping`);
        continue;
      }

      // Transform new structure back to old structure
      if (settingValue.maxWorkHours.day !== undefined) {
        settingValue.workHoursPerDay = settingValue.maxWorkHours.day;
        delete settingValue.maxWorkHours.day;
      }

      if (settingValue.maxWorkHours.calendarWeek !== undefined) {
        settingValue.calendarWeekLimit = settingValue.maxWorkHours.calendarWeek;
        delete settingValue.maxWorkHours.calendarWeek;
      }

      if (settingValue.maxWorkHours.rollingWeek !== undefined) {
        settingValue.rollingWeekLimit = settingValue.maxWorkHours.rollingWeek;
        delete settingValue.maxWorkHours.rollingWeek;
      }

      // Remove maxWorkHours if empty
      if (Object.keys(settingValue.maxWorkHours).length === 0) {
        delete settingValue.maxWorkHours;
      }

      // Update the record
      await queryInterface.sequelize.query(
        `UPDATE business_settings SET setting_value = :settingValue::jsonb WHERE id = :id`,
        {
          replacements: {
            id: record.id,
            settingValue: JSON.stringify(settingValue)
          },
          type: Sequelize.QueryTypes.UPDATE
        }
      );

      revertedCount++;
      console.log(`✅ Reverted record ${record.id}`);
    }

    console.log(`✅ Rollback complete: ${revertedCount} record(s) reverted`);
  }
};
