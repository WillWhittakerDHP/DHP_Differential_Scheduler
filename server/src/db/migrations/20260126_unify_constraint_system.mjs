/**
 * Migration: Unify Constraint System with Enforcement Types
 * Date: 2026-01-26
 * Purpose: Transform constraint system to unified structure:
 *          - Move buffers.leadTime to rangeConstraints.leadTime
 *          - Rename maxWorkHours.*.filterMode to maxWorkHours.*.enforcement
 *          - Rename buffers.*.mode to buffers.*.placement
 *          - Add enforcement property to all buffers (default: 'hard')
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Unifying constraint system...');

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
      let needsUpdate = false;

      // 1. Transform buffers.leadTime to rangeConstraints.leadTime
      if (settingValue.buffers?.leadTime) {
        if (!settingValue.rangeConstraints) {
          settingValue.rangeConstraints = {};
        }
        
        const leadTimeBuffer = settingValue.buffers.leadTime;
        settingValue.rangeConstraints.leadTime = {
          type: 'leadTime',
          enforcement: 'hard', // LeadTime is always hard enforced
          config: {
            minutes: leadTimeBuffer.minutes || 60
          }
        };
        
        delete settingValue.buffers.leadTime;
        needsUpdate = true;
      }

      // 2. Transform maxWorkHours.*.filterMode to maxWorkHours.*.enforcement
      if (settingValue.maxWorkHours) {
        if (settingValue.maxWorkHours.day?.filterMode !== undefined) {
          settingValue.maxWorkHours.day.enforcement = settingValue.maxWorkHours.day.filterMode;
          delete settingValue.maxWorkHours.day.filterMode;
          needsUpdate = true;
        }
        
        if (settingValue.maxWorkHours.calendarWeek?.filterMode !== undefined) {
          settingValue.maxWorkHours.calendarWeek.enforcement = settingValue.maxWorkHours.calendarWeek.filterMode;
          delete settingValue.maxWorkHours.calendarWeek.filterMode;
          needsUpdate = true;
        }
        
        if (settingValue.maxWorkHours.rollingWeek?.filterMode !== undefined) {
          settingValue.maxWorkHours.rollingWeek.enforcement = settingValue.maxWorkHours.rollingWeek.filterMode;
          delete settingValue.maxWorkHours.rollingWeek.filterMode;
          needsUpdate = true;
        }
      }

      // 3. Transform buffers.*.mode to buffers.*.placement and add enforcement
      if (settingValue.buffers) {
        // Transform appointment buffer
        if (settingValue.buffers.appointment) {
          if (settingValue.buffers.appointment.mode !== undefined) {
            settingValue.buffers.appointment.placement = settingValue.buffers.appointment.mode;
            delete settingValue.buffers.appointment.mode;
            needsUpdate = true;
          }
          // Add enforcement if not present (default: 'hard')
          if (!settingValue.buffers.appointment.enforcement) {
            settingValue.buffers.appointment.enforcement = 'hard';
            needsUpdate = true;
          }
        }
        
        // Transform driveTime buffer
        if (settingValue.buffers.driveTime) {
          if (settingValue.buffers.driveTime.mode !== undefined) {
            settingValue.buffers.driveTime.placement = settingValue.buffers.driveTime.mode;
            delete settingValue.buffers.driveTime.mode;
            needsUpdate = true;
          }
          // Add enforcement if not present (default: 'hard')
          if (!settingValue.buffers.driveTime.enforcement) {
            settingValue.buffers.driveTime.enforcement = 'hard';
            needsUpdate = true;
          }
        }
        
        // Transform lunch buffer
        if (settingValue.buffers.lunch) {
          if (settingValue.buffers.lunch.mode !== undefined) {
            settingValue.buffers.lunch.placement = settingValue.buffers.lunch.mode;
            delete settingValue.buffers.lunch.mode;
            needsUpdate = true;
          }
          // Add enforcement if not present (default: 'hard')
          if (!settingValue.buffers.lunch.enforcement) {
            settingValue.buffers.lunch.enforcement = 'hard';
            needsUpdate = true;
          }
        }
        
        // Remove buffers object if empty (after removing leadTime)
        if (Object.keys(settingValue.buffers).length === 0) {
          delete settingValue.buffers;
          needsUpdate = true;
        }
      }

      // 4. Add businessHours constraint to rangeConstraints if not present
      if (!settingValue.rangeConstraints?.businessHours && settingValue.businessHours) {
        if (!settingValue.rangeConstraints) {
          settingValue.rangeConstraints = {};
        }
        settingValue.rangeConstraints.businessHours = {
          type: 'businessHours',
          enforcement: 'hard',
          config: {
            hours: settingValue.businessHours
          }
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
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
      } else {
        console.log(`ℹ️  Record ${record.id} already uses new structure, skipping`);
      }
    }

    console.log(`✅ Migration complete: ${transformedCount} record(s) transformed`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting constraint system unification...');

    const AVAILABILITY_SETTINGS_KEY = 'availability_settings';

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

      // 1. Transform rangeConstraints.leadTime back to buffers.leadTime
      if (settingValue.rangeConstraints?.leadTime) {
        if (!settingValue.buffers) {
          settingValue.buffers = {};
        }
        
        const leadTimeConstraint = settingValue.rangeConstraints.leadTime;
        settingValue.buffers.leadTime = {
          type: 'lead',
          minutes: leadTimeConstraint.config?.minutes || 60,
          mode: 'leadTime'
        };
        
        delete settingValue.rangeConstraints.leadTime;
        needsUpdate = true;
      }

      // 2. Transform maxWorkHours.*.enforcement back to maxWorkHours.*.filterMode
      if (settingValue.maxWorkHours) {
        if (settingValue.maxWorkHours.day?.enforcement !== undefined) {
          settingValue.maxWorkHours.day.filterMode = settingValue.maxWorkHours.day.enforcement;
          delete settingValue.maxWorkHours.day.enforcement;
          needsUpdate = true;
        }
        
        if (settingValue.maxWorkHours.calendarWeek?.enforcement !== undefined) {
          settingValue.maxWorkHours.calendarWeek.filterMode = settingValue.maxWorkHours.calendarWeek.enforcement;
          delete settingValue.maxWorkHours.calendarWeek.enforcement;
          needsUpdate = true;
        }
        
        if (settingValue.maxWorkHours.rollingWeek?.enforcement !== undefined) {
          settingValue.maxWorkHours.rollingWeek.filterMode = settingValue.maxWorkHours.rollingWeek.enforcement;
          delete settingValue.maxWorkHours.rollingWeek.enforcement;
          needsUpdate = true;
        }
      }

      // 3. Transform buffers.*.placement back to buffers.*.mode and remove enforcement
      if (settingValue.buffers) {
        if (settingValue.buffers.appointment) {
          if (settingValue.buffers.appointment.placement !== undefined) {
            settingValue.buffers.appointment.mode = settingValue.buffers.appointment.placement;
            delete settingValue.buffers.appointment.placement;
            needsUpdate = true;
          }
          delete settingValue.buffers.appointment.enforcement;
        }
        
        if (settingValue.buffers.driveTime) {
          if (settingValue.buffers.driveTime.placement !== undefined) {
            settingValue.buffers.driveTime.mode = settingValue.buffers.driveTime.placement;
            delete settingValue.buffers.driveTime.placement;
            needsUpdate = true;
          }
          delete settingValue.buffers.driveTime.enforcement;
        }
        
        if (settingValue.buffers.lunch) {
          if (settingValue.buffers.lunch.placement !== undefined) {
            settingValue.buffers.lunch.mode = settingValue.buffers.lunch.placement;
            delete settingValue.buffers.lunch.placement;
            needsUpdate = true;
          }
          delete settingValue.buffers.lunch.enforcement;
        }
      }

      // 4. Remove businessHours constraint from rangeConstraints
      if (settingValue.rangeConstraints?.businessHours) {
        delete settingValue.rangeConstraints.businessHours;
        if (Object.keys(settingValue.rangeConstraints).length === 0) {
          delete settingValue.rangeConstraints;
        }
        needsUpdate = true;
      }

      if (needsUpdate) {
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
        console.log(`✅ Reverted record ${record.id}`);
      }
    }

    console.log(`✅ Rollback complete: ${transformedCount} record(s) reverted`);
  }
};
