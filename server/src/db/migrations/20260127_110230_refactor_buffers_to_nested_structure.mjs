/**
 * Migration: Refactor Buffers to Nested Structure
 * Date: 2026-01-27
 * Purpose: Transform buffer settings from separate properties (leadTime, bufferMinutes, bufferMode)
 *          to nested buffers structure (buffers.leadTime, buffers.appointment) for consistency
 *          and better organization, matching the capacity filters pattern
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Refactoring buffers to nested structure...');

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
        settingValue.leadTime !== undefined ||
        settingValue.bufferMinutes !== undefined ||
        settingValue.bufferMode !== undefined;

      if (!hasOldStructure && settingValue.buffers) {
        console.log(`ℹ️  Record ${record.id} already uses new structure, skipping`);
        continue;
      }

      // Create buffers object if it doesn't exist
      if (!settingValue.buffers) {
        settingValue.buffers = {};
      }

      // Transform leadTime to buffers.leadTime
      if (settingValue.leadTime !== undefined) {
        settingValue.buffers.leadTime = {
          type: 'lead',
          minutes: settingValue.leadTime,
          mode: 'leadTime'
        };
        delete settingValue.leadTime;
      }

      // Transform bufferMinutes/bufferMode to buffers.appointment
      if (settingValue.bufferMinutes !== undefined && settingValue.bufferMinutes > 0 && 
          settingValue.bufferMode && settingValue.bufferMode !== 'off') {
        settingValue.buffers.appointment = {
          type: 'appointment',
          minutes: settingValue.bufferMinutes,
          mode: settingValue.bufferMode
        };
      }
      
      // Delete old buffer fields
      delete settingValue.bufferMinutes;
      delete settingValue.bufferMode;

      // Remove buffers object if empty
      if (Object.keys(settingValue.buffers).length === 0) {
        delete settingValue.buffers;
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
    console.log('🔄 Reverting buffers to old structure...');

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
      if (!settingValue.buffers) {
        console.log(`ℹ️  Record ${record.id} doesn't have buffers, skipping`);
        continue;
      }

      // Transform buffers.leadTime back to leadTime
      if (settingValue.buffers.leadTime) {
        settingValue.leadTime = settingValue.buffers.leadTime.minutes;
        delete settingValue.buffers.leadTime;
      }

      // Transform buffers.appointment back to bufferMinutes/bufferMode
      if (settingValue.buffers.appointment) {
        settingValue.bufferMinutes = settingValue.buffers.appointment.minutes;
        settingValue.bufferMode = settingValue.buffers.appointment.mode;
        delete settingValue.buffers.appointment;
      }

      // Remove buffers object if empty
      if (Object.keys(settingValue.buffers).length === 0) {
        delete settingValue.buffers;
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
