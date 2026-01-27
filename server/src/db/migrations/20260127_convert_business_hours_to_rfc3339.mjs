/**
 * Migration: Convert Business Hours from HH:mm to RFC3339 Format
 * Date: 2026-01-27
 * Purpose: Convert business hours from HH:mm format (e.g., "09:00") to RFC3339 format
 *          (e.g., "2000-01-01T09:00:00Z") for both top-level businessHours and
 *          rangeConstraints.businessHours.config.hours
 * 
 * WHY: Server should store RFC3339 format as source of truth. HH:mm should only exist
 *      at the UI boundary for display/input.
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Converting business hours from HH:mm to RFC3339 format...');

    const AVAILABILITY_SETTINGS_KEY = 'availability_settings';

    /**
     * Convert HH:mm time string to RFC3339 format
     * LEARNING: Converts "09:00" to "2000-01-01T09:00:00Z"
     * WHY: Standardizes business hours format in database
     */
    function hhmmToRfc3339(time) {
      if (!time || typeof time !== 'string') {
        return time; // Return as-is if invalid
      }
      // Check if already RFC3339 format
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(time)) {
        return time; // Already RFC3339, return as-is
      }
      // Convert HH:mm to RFC3339
      if (/^\d{2}:\d{2}$/.test(time)) {
        return `2000-01-01T${time}:00Z`;
      }
      // Invalid format, return as-is (will fail validation)
      return time;
    }

    /**
     * Convert business hours object from HH:mm to RFC3339
     * LEARNING: Recursively converts all start/end times in business hours structure
     */
    function convertBusinessHours(hours) {
      if (!hours || typeof hours !== 'object') {
        return hours;
      }
      
      const converted = {};
      for (let day = 0; day <= 6; day++) {
        if (hours[day]) {
          converted[day] = {
            start: hhmmToRfc3339(hours[day].start),
            end: hhmmToRfc3339(hours[day].end)
          };
        }
      }
      return converted;
    }

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
      let needsUpdate = false;

      // 1. Convert top-level businessHours
      if (settingValue.businessHours) {
        const converted = convertBusinessHours(settingValue.businessHours);
        // Check if conversion changed anything
        for (let day = 0; day <= 6; day++) {
          if (settingValue.businessHours[day] && converted[day]) {
            if (settingValue.businessHours[day].start !== converted[day].start ||
                settingValue.businessHours[day].end !== converted[day].end) {
              needsUpdate = true;
              break;
            }
          }
        }
        if (needsUpdate || Object.keys(converted).length > 0) {
          settingValue.businessHours = converted;
        }
      }

      // 2. Convert rangeConstraints.businessHours.config.hours
      if (settingValue.rangeConstraints?.businessHours?.config?.hours) {
        const hours = settingValue.rangeConstraints.businessHours.config.hours;
        const converted = convertBusinessHours(hours);
        // Check if conversion changed anything
        for (let day = 0; day <= 6; day++) {
          if (hours[day] && converted[day]) {
            if (hours[day].start !== converted[day].start ||
                hours[day].end !== converted[day].end) {
              needsUpdate = true;
              break;
            }
          }
        }
        if (needsUpdate || Object.keys(converted).length > 0) {
          settingValue.rangeConstraints.businessHours.config.hours = converted;
        }
      }

      // Update record if changes were made
      if (needsUpdate) {
        await queryInterface.sequelize.query(
          `UPDATE business_settings SET setting_value = :settingValue WHERE id = :id`,
          {
            replacements: {
              id: record.id,
              settingValue: JSON.stringify(settingValue)
            },
            type: Sequelize.QueryTypes.UPDATE
          }
        );
        transformedCount++;
        console.log(`✅ Converted business hours for record ${record.id}`);
      }
    }

    console.log(`✅ Migration complete: ${transformedCount} record(s) updated`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting business hours from RFC3339 to HH:mm format...');

    const AVAILABILITY_SETTINGS_KEY = 'availability_settings';

    /**
     * Convert RFC3339 time string to HH:mm format
     * LEARNING: Extracts time-of-day from RFC3339 format
     * WHY: Allows rollback to previous format if needed
     */
    function rfc3339ToHhmm(time) {
      if (!time || typeof time !== 'string') {
        return time; // Return as-is if invalid
      }
      // Check if already HH:mm format
      if (/^\d{2}:\d{2}$/.test(time)) {
        return time; // Already HH:mm, return as-is
      }
      // Extract HH:mm from RFC3339
      const match = time.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2}):\d{2}(\.\d{3})?Z$/);
      if (match) {
        return `${match[1]}:${match[2]}`;
      }
      // Invalid format, return as-is
      return time;
    }

    /**
     * Convert business hours object from RFC3339 to HH:mm
     */
    function convertBusinessHoursToHhmm(hours) {
      if (!hours || typeof hours !== 'object') {
        return hours;
      }
      
      const converted = {};
      for (let day = 0; day <= 6; day++) {
        if (hours[day]) {
          converted[day] = {
            start: rfc3339ToHhmm(hours[day].start),
            end: rfc3339ToHhmm(hours[day].end)
          };
        }
      }
      return converted;
    }

    // Find all business_settings records with availability_settings key
    const queryResult = await queryInterface.sequelize.query(
      `SELECT id, setting_value FROM business_settings WHERE setting_key = :key`,
      {
        replacements: { key: AVAILABILITY_SETTINGS_KEY },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const results = Array.isArray(queryResult) ? queryResult : [];

    if (!results || results.length === 0) {
      console.log('ℹ️  No availability_settings records found, skipping rollback');
      return;
    }

    let transformedCount = 0;

    for (const record of results) {
      const settingValue = record.setting_value;
      let needsUpdate = false;

      // 1. Convert top-level businessHours back to HH:mm
      if (settingValue.businessHours) {
        const converted = convertBusinessHoursToHhmm(settingValue.businessHours);
        // Check if conversion changed anything
        for (let day = 0; day <= 6; day++) {
          if (settingValue.businessHours[day] && converted[day]) {
            if (settingValue.businessHours[day].start !== converted[day].start ||
                settingValue.businessHours[day].end !== converted[day].end) {
              needsUpdate = true;
              break;
            }
          }
        }
        if (needsUpdate || Object.keys(converted).length > 0) {
          settingValue.businessHours = converted;
        }
      }

      // 2. Convert rangeConstraints.businessHours.config.hours back to HH:mm
      if (settingValue.rangeConstraints?.businessHours?.config?.hours) {
        const hours = settingValue.rangeConstraints.businessHours.config.hours;
        const converted = convertBusinessHoursToHhmm(hours);
        // Check if conversion changed anything
        for (let day = 0; day <= 6; day++) {
          if (hours[day] && converted[day]) {
            if (hours[day].start !== converted[day].start ||
                hours[day].end !== converted[day].end) {
              needsUpdate = true;
              break;
            }
          }
        }
        if (needsUpdate || Object.keys(converted).length > 0) {
          settingValue.rangeConstraints.businessHours.config.hours = converted;
        }
      }

      // Update record if changes were made
      if (needsUpdate) {
        await queryInterface.sequelize.query(
          `UPDATE business_settings SET setting_value = :settingValue WHERE id = :id`,
          {
            replacements: {
              id: record.id,
              settingValue: JSON.stringify(settingValue)
            },
            type: Sequelize.QueryTypes.UPDATE
          }
        );
        transformedCount++;
        console.log(`✅ Reverted business hours for record ${record.id}`);
      }
    }

    console.log(`✅ Rollback complete: ${transformedCount} record(s) reverted`);
  }
};
