import { Router, Request, Response } from 'express';
import { BusinessSettings } from '../../config/app.js';
import type { AvailabilitySettingsData } from '../../db/models/admin/business_settings.js';

const router = Router();

/**
 * WHY: BusinessSettingsRouter
 *
 * LEARNING: Handles CRUD operations for admin-configurable business settings
 * WHY: Allows admin to configure availability settings (business hours, time increments, lead time) without code changes
 * PATTERN: Single settings record pattern with key "availability_settings" storing AvailabilitySettings JSONB object
 */

const AVAILABILITY_SETTINGS_KEY = 'availability_settings';

const defaultAvailabilitySettings: AvailabilitySettingsData = {
  businessHours: {
    0: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Sunday
    1: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Monday
    2: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Tuesday
    3: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Wednesday
    4: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Thursday
    5: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Friday
    6: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Saturday
  },
  minuteIncrement: 15, // 15-minute intervals
  rangeConstraints: {
    businessHours: {
      type: 'businessHours',
      enforcement: 'hard',
      config: {
        hours: {
          0: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Sunday
          1: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Monday
          2: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Tuesday
          3: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Wednesday
          4: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Thursday
          5: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Friday
          6: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Saturday
        }
      }
    },
    leadTime: {
      type: 'leadTime',
      enforcement: 'hard',
      config: {
        minutes: 60 // 1 hour lead time
      }
    }
  },
  durationRounding: {
    enabled: false, // Default disabled for testing
    increment: 15,
    method: 'roundUp'
  }
};

function validateAvailabilitySettings(data: any): data is AvailabilitySettingsData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Reject old structure - check for deprecated fields
  if (data.workHoursPerDay !== undefined || data.calendarWeekLimit !== undefined || data.rollingWeekLimit !== undefined) {
    return false; // Old structure not allowed
  }

  // Reject old buffer structure - check for deprecated fields
  if (data.leadTime !== undefined || data.bufferMinutes !== undefined || data.bufferMode !== undefined) {
    return false; // Old buffer structure not allowed - must use rangeConstraints.leadTime and buffers.appointment
  }

  // Reject old buffers.leadTime structure - leadTime moved to rangeConstraints.leadTime
  if (data.buffers?.leadTime !== undefined) {
    return false; // buffers.leadTime deprecated - must use rangeConstraints.leadTime
  }

  if (!data.businessHours || typeof data.businessHours !== 'object') {
    return false;
  }

  // Validate each day (0-6)
  for (let day = 0; day <= 6; day++) {
    const dayHours = data.businessHours[day];
    if (!dayHours || typeof dayHours !== 'object') {
      return false;
    }
    if (typeof dayHours.start !== 'string' || typeof dayHours.end !== 'string') {
      return false;
    }
    // Validate RFC3339 format with reference date (2000-01-01T00:00:00Z pattern)
    const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!rfc3339Regex.test(dayHours.start) || !rfc3339Regex.test(dayHours.end)) {
      return false;
    }
  }

  // Validate minuteIncrement
  if (typeof data.minuteIncrement !== 'number' || data.minuteIncrement <= 0) {
    return false;
  }

  // Validate rangeConstraints structure if present
  if (data.rangeConstraints !== undefined) {
    if (typeof data.rangeConstraints !== 'object') {
      return false;
    }
    
    // Validate businessHours constraint if present
    if (data.rangeConstraints.businessHours !== undefined) {
      const constraint = data.rangeConstraints.businessHours;
      if (typeof constraint !== 'object' ||
          constraint.type !== 'businessHours' ||
          !['off', 'flexible', 'hard'].includes(constraint.enforcement) ||
          !constraint.config ||
          typeof constraint.config !== 'object' ||
          !constraint.config.hours) {
        return false;
      }
      // Validate businessHours.config.hours format (RFC3339)
      const hours = constraint.config.hours;
      if (typeof hours !== 'object') {
        return false;
      }
      const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      for (let day = 0; day <= 6; day++) {
        const dayHours = hours[day];
        if (dayHours) {
          if (typeof dayHours !== 'object' ||
              typeof dayHours.start !== 'string' ||
              typeof dayHours.end !== 'string' ||
              !rfc3339Regex.test(dayHours.start) ||
              !rfc3339Regex.test(dayHours.end)) {
            return false;
          }
        }
      }
    }
    
    // Validate leadTime constraint if present
    if (data.rangeConstraints.leadTime !== undefined) {
      const constraint = data.rangeConstraints.leadTime;
      if (typeof constraint !== 'object' ||
          constraint.type !== 'leadTime' ||
          !['off', 'flexible', 'hard'].includes(constraint.enforcement) ||
          !constraint.config ||
          typeof constraint.config !== 'object' ||
          typeof constraint.config.minutes !== 'number' ||
          constraint.config.minutes < 0) {
        return false;
      }
    }
    
    // Validate dateRange constraint if present
    if (data.rangeConstraints.dateRange !== undefined) {
      const constraint = data.rangeConstraints.dateRange;
      if (typeof constraint !== 'object' ||
          constraint.type !== 'dateRange' ||
          !['off', 'flexible', 'hard'].includes(constraint.enforcement) ||
          !constraint.config ||
          typeof constraint.config !== 'object' ||
          typeof constraint.config.start !== 'string' ||
          typeof constraint.config.end !== 'string') {
        return false;
      }
    }
  }

  // Validate buffers structure if present (leadTime moved to rangeConstraints)
  if (data.buffers !== undefined) {
    if (typeof data.buffers !== 'object') {
      return false;
    }
    
    // Validate appointment buffer if present
    if (data.buffers.appointment !== undefined) {
      const appointmentBuffer = data.buffers.appointment;
      if (typeof appointmentBuffer !== 'object' ||
          appointmentBuffer.type !== 'appointment' ||
          typeof appointmentBuffer.minutes !== 'number' ||
          appointmentBuffer.minutes < 0 ||
          !['off', 'before', 'after', 'both'].includes(appointmentBuffer.placement) ||
          !['off', 'flexible', 'hard'].includes(appointmentBuffer.enforcement)) {
        return false;
      }
    }
    
    // Validate driveTime buffer if present
    if (data.buffers.driveTime !== undefined) {
      const driveTimeBuffer = data.buffers.driveTime;
      if (typeof driveTimeBuffer !== 'object' ||
          driveTimeBuffer.type !== 'driveTime' ||
          typeof driveTimeBuffer.minutes !== 'number' ||
          driveTimeBuffer.minutes < 0 ||
          !['off', 'before', 'after', 'both'].includes(driveTimeBuffer.placement) ||
          !['off', 'flexible', 'hard'].includes(driveTimeBuffer.enforcement)) {
        return false;
      }
    }
    
    // Validate lunch buffer if present
    if (data.buffers.lunch !== undefined) {
      const lunchBuffer = data.buffers.lunch;
      if (typeof lunchBuffer !== 'object' ||
          lunchBuffer.type !== 'lunch' ||
          typeof lunchBuffer.minutes !== 'number' ||
          lunchBuffer.minutes < 0 ||
          !['off', 'before', 'after', 'both'].includes(lunchBuffer.placement) ||
          !['off', 'flexible', 'hard'].includes(lunchBuffer.enforcement)) {
        return false;
      }
    }
  }

  // Validate maxWorkHours structure if present
  if (data.maxWorkHours !== undefined) {
    if (typeof data.maxWorkHours !== 'object') {
      return false;
    }
    // Validate day filter if present
    if (data.maxWorkHours.day !== undefined) {
      if (typeof data.maxWorkHours.day !== 'object' ||
          typeof data.maxWorkHours.day.maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxWorkHours.day.enforcement)) {
        return false;
      }
    }
    // Validate calendarWeek filter if present
    if (data.maxWorkHours.calendarWeek !== undefined) {
      if (typeof data.maxWorkHours.calendarWeek !== 'object' ||
          typeof data.maxWorkHours.calendarWeek.maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxWorkHours.calendarWeek.enforcement)) {
        return false;
      }
    }
    // Validate rollingWeek filter if present
    if (data.maxWorkHours.rollingWeek !== undefined) {
      if (typeof data.maxWorkHours.rollingWeek !== 'object' ||
          typeof data.maxWorkHours.rollingWeek.maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxWorkHours.rollingWeek.enforcement) ||
          !['past', 'centered', 'future'].includes(data.maxWorkHours.rollingWeek.direction)) {
        return false;
      }
    }
  }

  // Validate durationRounding structure if present
  if (data.durationRounding !== undefined) {
    if (typeof data.durationRounding !== 'object') {
      return false;
    }
    if (typeof data.durationRounding.enabled !== 'boolean') {
      return false;
    }
    if (data.durationRounding.increment !== undefined) {
      if (typeof data.durationRounding.increment !== 'number' || data.durationRounding.increment <= 0) {
        return false;
      }
    }
    if (data.durationRounding.method !== undefined) {
      if (!['roundUp', 'roundDown', 'roundNearest'].includes(data.durationRounding.method)) {
        return false;
      }
    }
  }

  return true;
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;

    if (key && typeof key === 'string') {
      const setting = await BusinessSettings.findOne({
        where: { settingKey: key },
      });

      if (!setting) {
        if (key === AVAILABILITY_SETTINGS_KEY) {
          res.json({
            setting_key: AVAILABILITY_SETTINGS_KEY,
            setting_value: defaultAvailabilitySettings,
          });
          return;
        }
        res.status(404).json({ error: `Setting with key "${key}" not found` });
        return;
      }
      res.json({
        setting_key: setting.settingKey,
        setting_value: setting.settingValue,
      });
    } else {
      const settings = await BusinessSettings.findAll();
      res.json(settings.map(s => ({
        setting_key: s.settingKey,
        setting_value: s.settingValue,
      })));
    }
  } catch (error) {
    console.error('[BusinessSettingsRouter] Error fetching settings:', error);
    res.status(500).json({
      error: 'Failed to fetch business settings',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      if (key === AVAILABILITY_SETTINGS_KEY) {
        res.json({
          setting_key: AVAILABILITY_SETTINGS_KEY,
          setting_value: defaultAvailabilitySettings,
        });
        return;
      }
      res.status(404).json({ error: `Setting with key "${key}" not found` });
      return;
    }

    res.json({
      setting_key: setting.settingKey,
      setting_value: setting.settingValue,
    });
  } catch (error) {
    console.error('[BusinessSettingsRouter] Error fetching setting:', error);
    res.status(500).json({
      error: 'Failed to fetch business setting',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { setting_key, setting_value } = req.body;

    if (!setting_key || typeof setting_key !== 'string') {
      res.status(400).json({ error: 'setting_key is required and must be a string' });
      return;
    }

    if (!setting_value) {
      res.status(400).json({ error: 'setting_value is required' });
      return;
    }

    // Validate availability_settings structure
    if (setting_key === AVAILABILITY_SETTINGS_KEY) {
      if (!validateAvailabilitySettings(setting_value)) {
        res.status(400).json({
          error: 'Invalid availability_settings structure',
          details: 'Expected: { businessHours: { 0-6: { start, end } }, minuteIncrement: number, buffers?: { leadTime?: BufferConfig, appointment?: BufferConfig, driveTime?: BufferConfig } }. Old fields (leadTime, bufferMinutes, bufferMode) are not allowed.',
        });
        return;
      }
    }

    const existing = await BusinessSettings.findOne({
      where: { settingKey: setting_key },
    });

    if (existing) {
      res.status(409).json({ error: `Setting with key "${setting_key}" already exists. Use PUT or PATCH to update.` });
      return;
    }

    const setting = await BusinessSettings.create({
      settingKey: setting_key,
      settingValue: setting_value,
    });

    res.status(201).json({
      setting_key: setting.settingKey,
      setting_value: setting.settingValue,
    });
  } catch (error) {
    console.error('[BusinessSettingsRouter] Error creating setting:', error);
    res.status(500).json({
      error: 'Failed to create business setting',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.put('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { setting_value } = req.body;

    if (!setting_value) {
      res.status(400).json({ error: 'setting_value is required' });
      return;
    }

    // Validate availability_settings structure
    if (key === AVAILABILITY_SETTINGS_KEY) {
      if (!validateAvailabilitySettings(setting_value)) {
        res.status(400).json({
          error: 'Invalid availability_settings structure',
          details: 'Expected: { businessHours: { 0-6: { start, end } }, minuteIncrement: number, buffers?: { leadTime?: BufferConfig, appointment?: BufferConfig, driveTime?: BufferConfig } }. Old fields (leadTime, bufferMinutes, bufferMode) are not allowed.',
        });
        return;
      }
    }

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      const newSetting = await BusinessSettings.create({
        settingKey: key,
        settingValue: setting_value,
      });
      res.status(201).json({
        setting_key: newSetting.settingKey,
        setting_value: newSetting.settingValue,
      });
      return;
    }

    setting.settingValue = setting_value;
    await setting.save();

    res.json({
      setting_key: setting.settingKey,
      setting_value: setting.settingValue,
    });
  } catch (error) {
    console.error('[BusinessSettingsRouter] Error updating setting:', error);
    res.status(500).json({
      error: 'Failed to update business setting',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.patch('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { setting_value } = req.body;

    if (!setting_value) {
      res.status(400).json({ error: 'setting_value is required' });
      return;
    }

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      res.status(404).json({ error: `Setting with key "${key}" not found. Use POST to create.` });
      return;
    }

    const mergedValue = {
      ...setting.settingValue,
      ...setting_value,
    };

    // Validate availability_settings structure after merge
    if (key === AVAILABILITY_SETTINGS_KEY) {
      if (!validateAvailabilitySettings(mergedValue)) {
        res.status(400).json({
          error: 'Invalid availability_settings structure after merge',
          details: 'Expected: { businessHours: { 0-6: { start, end } }, minuteIncrement: number, leadTime: number }',
        });
        return;
      }
    }

    setting.settingValue = mergedValue;
    await setting.save();

    res.json({
      setting_key: setting.settingKey,
      setting_value: setting.settingValue,
    });
  } catch (error) {
    console.error('[BusinessSettingsRouter] Error patching setting:', error);
    res.status(500).json({
      error: 'Failed to patch business setting',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      res.status(404).json({ error: `Setting with key "${key}" not found` });
      return;
    }

    await setting.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('[BusinessSettingsRouter] Error deleting setting:', error);
    res.status(500).json({
      error: 'Failed to delete business setting',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as BusinessSettingsRouter };

