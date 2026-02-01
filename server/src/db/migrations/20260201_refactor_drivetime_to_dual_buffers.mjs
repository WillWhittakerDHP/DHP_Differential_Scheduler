/**
 * Migration: Refactor driveTime to dual buffer structure (driveTimeTo/driveTimeFrom)
 * 
 * LEARNING: Transforms legacy single driveTime buffer to semantic dual buffers
 * WHY: driveTimeTo/driveTimeFrom have implicit placement (before/after) - no ambiguity
 * PATTERN: Read existing settings, transform structure, update in place
 * 
 * This migration:
 * 1. Reads business_settings where setting_key = 'availability_settings'
 * 2. Finds any legacy buffers.driveTime configuration
 * 3. Converts to driveTimeTo and/or driveTimeFrom based on placement
 * 4. Removes the legacy driveTime key
 * 
 * Conversion rules:
 * - placement: 'before' → driveTimeTo only
 * - placement: 'after' → driveTimeFrom only
 * - placement: 'both' → driveTimeTo AND driveTimeFrom
 * - All new configs get applyTo: 'all' (default behavior)
 */

export default {
  async up(queryInterface, _Sequelize) {
    // Find all business_settings with availability_settings
    const [settings] = await queryInterface.sequelize.query(
      `SELECT id, setting_value FROM "business_settings" WHERE setting_key = 'availability_settings'`
    );
    
    for (const row of settings) {
      // Parse setting_value - handle both string and object forms
      const settingValue = typeof row.setting_value === 'string' 
        ? JSON.parse(row.setting_value) 
        : row.setting_value;
      
      let needsUpdate = false;
      
      // Check for legacy driveTime buffer
      if (settingValue.buffers?.driveTime) {
        const legacyDriveTime = settingValue.buffers.driveTime;
        
        // Skip if placement is 'off' or no minutes configured
        if (legacyDriveTime.placement === 'off' || !legacyDriveTime.minutes || legacyDriveTime.minutes <= 0) {
          // Remove the legacy key but don't create new buffers
          delete settingValue.buffers.driveTime;
          needsUpdate = true;
        } else {
          // Convert based on placement
          // placement: 'before' or 'both' → create driveTimeTo
          if (legacyDriveTime.placement === 'before' || legacyDriveTime.placement === 'both') {
            settingValue.buffers.driveTimeTo = {
              minutes: legacyDriveTime.minutes,
              enforcement: legacyDriveTime.enforcement || 'hard',
              applyTo: 'all'  // Default: apply to all appointments (preserves existing behavior)
            };
          }
          
          // placement: 'after' or 'both' → create driveTimeFrom
          if (legacyDriveTime.placement === 'after' || legacyDriveTime.placement === 'both') {
            settingValue.buffers.driveTimeFrom = {
              minutes: legacyDriveTime.minutes,
              enforcement: legacyDriveTime.enforcement || 'hard',
              applyTo: 'all'
            };
          }
          
          // Remove the legacy driveTime key
          delete settingValue.buffers.driveTime;
          needsUpdate = true;
        }
      }
      
      // Update the record if changes were made
      if (needsUpdate) {
        await queryInterface.sequelize.query(
          `UPDATE "business_settings" SET setting_value = :value, updated_at = NOW() WHERE id = :id`,
          { 
            replacements: { 
              value: JSON.stringify(settingValue), 
              id: row.id 
            } 
          }
        );
        console.log(`[Migration] Updated business_settings id=${row.id}: Converted legacy driveTime to driveTimeTo/driveTimeFrom`);
      }
    }
  },
  
  async down(queryInterface, _Sequelize) {
    // Reverse migration: merge driveTimeTo/driveTimeFrom back to legacy driveTime
    const [settings] = await queryInterface.sequelize.query(
      `SELECT id, setting_value FROM "business_settings" WHERE setting_key = 'availability_settings'`
    );
    
    for (const row of settings) {
      const settingValue = typeof row.setting_value === 'string' 
        ? JSON.parse(row.setting_value) 
        : row.setting_value;
      
      let needsUpdate = false;
      const driveTimeTo = settingValue.buffers?.driveTimeTo;
      const driveTimeFrom = settingValue.buffers?.driveTimeFrom;
      
      // Only convert if we have driveTimeTo or driveTimeFrom
      if (driveTimeTo || driveTimeFrom) {
        // Determine placement based on which buffers exist
        let placement = 'off';
        let minutes = 0;
        let enforcement = 'hard';
        
        if (driveTimeTo && driveTimeFrom) {
          placement = 'both';
          // Use the larger of the two minutes values
          minutes = Math.max(driveTimeTo.minutes || 0, driveTimeFrom.minutes || 0);
          // Use driveTimeTo enforcement (arbitrary choice)
          enforcement = driveTimeTo.enforcement || 'hard';
        } else if (driveTimeTo) {
          placement = 'before';
          minutes = driveTimeTo.minutes || 0;
          enforcement = driveTimeTo.enforcement || 'hard';
        } else if (driveTimeFrom) {
          placement = 'after';
          minutes = driveTimeFrom.minutes || 0;
          enforcement = driveTimeFrom.enforcement || 'hard';
        }
        
        // Create legacy driveTime buffer if we have valid data
        if (minutes > 0 && placement !== 'off') {
          settingValue.buffers.driveTime = {
            type: 'driveTime',
            minutes,
            placement,
            enforcement
          };
        }
        
        // Remove the new buffer keys
        delete settingValue.buffers.driveTimeTo;
        delete settingValue.buffers.driveTimeFrom;
        needsUpdate = true;
      }
      
      // Also remove defaultLocation if it was added
      if (settingValue.defaultLocation) {
        delete settingValue.defaultLocation;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await queryInterface.sequelize.query(
          `UPDATE "business_settings" SET setting_value = :value, updated_at = NOW() WHERE id = :id`,
          { 
            replacements: { 
              value: JSON.stringify(settingValue), 
              id: row.id 
            } 
          }
        );
        console.log(`[Migration] Reverted business_settings id=${row.id}: Converted driveTimeTo/driveTimeFrom back to legacy driveTime`);
      }
    }
  }
};
