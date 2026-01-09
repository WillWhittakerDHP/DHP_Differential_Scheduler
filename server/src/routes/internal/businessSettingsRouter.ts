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

/**
 * Default availability settings (fallback if no settings exist in database)
 * LEARNING: Provides sensible defaults matching client-side defaultAvailabilitySettings
 * WHY: Ensures system works even if settings haven't been configured yet
 */
const defaultAvailabilitySettings: AvailabilitySettingsData = {
  businessHours: {
    0: { start: "09:00", end: "19:00" }, // Sunday
    1: { start: "09:00", end: "19:00" }, // Monday
    2: { start: "09:00", end: "19:00" }, // Tuesday
    3: { start: "09:00", end: "19:00" }, // Wednesday
    4: { start: "09:00", end: "19:00" }, // Thursday
    5: { start: "09:00", end: "19:00" }, // Friday
    6: { start: "09:00", end: "19:00" }, // Saturday
  },
  minuteIncrement: 15, // 15-minute intervals
  leadTime: 60, // 1 hour lead time (in minutes)
};

/**
 * Validate AvailabilitySettings structure
 * LEARNING: Type guard to ensure settings match expected structure
 * WHY: Prevents invalid data from being stored
 */
function validateAvailabilitySettings(data: any): data is AvailabilitySettingsData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Validate businessHours
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
    // Basic time format validation (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(dayHours.start) || !/^\d{2}:\d{2}$/.test(dayHours.end)) {
      return false;
    }
  }

  // Validate minuteIncrement
  if (typeof data.minuteIncrement !== 'number' || data.minuteIncrement <= 0) {
    return false;
  }

  // Validate leadTime
  if (typeof data.leadTime !== 'number' || data.leadTime < 0) {
    return false;
  }

  return true;
}

/**
 * GET /business-settings
 * Get all business settings (or get by key if query param provided)
 * LEARNING: Returns settings or defaults if none exist
 * WHY: Provides current configuration for admin panel and availability calculations
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;

    if (key && typeof key === 'string') {
      // Get specific setting by key
      const setting = await BusinessSettings.findOne({
        where: { settingKey: key },
      });

      if (!setting) {
        // Return defaults for availability_settings if not found
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
      // Get all settings
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

/**
 * GET /business-settings/:key
 * Get specific setting by key
 * LEARNING: Convenience endpoint for getting single setting
 * WHY: Allows direct access to specific settings without query params
 */
router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      // Return defaults for availability_settings if not found
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

/**
 * POST /business-settings
 * Create new business setting
 * LEARNING: Creates new setting record
 * WHY: Allows admin to create new settings configurations
 */
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
          details: 'Expected: { businessHours: { 0-6: { start, end } }, minuteIncrement: number, leadTime: number }',
        });
        return;
      }
    }

    // Check if setting already exists
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

/**
 * PUT /business-settings/:key
 * Update business setting (full replace)
 * LEARNING: Replaces entire setting value
 * WHY: Allows admin to update settings with full replacement
 */
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
          details: 'Expected: { businessHours: { 0-6: { start, end } }, minuteIncrement: number, leadTime: number }',
        });
        return;
      }
    }

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      // Create if doesn't exist (upsert behavior)
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

/**
 * PATCH /business-settings/:key
 * Partially update business setting
 * LEARNING: Merges partial updates into existing setting value
 * WHY: Allows admin to update only specific fields without replacing entire object
 */
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

    // Merge partial update into existing value
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

/**
 * DELETE /business-settings/:key
 * Delete business setting
 * LEARNING: Removes setting record from database
 * WHY: Allows admin to remove settings configurations
 */
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

