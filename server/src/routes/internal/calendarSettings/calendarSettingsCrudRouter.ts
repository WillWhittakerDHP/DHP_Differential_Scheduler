/**
 * Singleton CRUD for calendar_settings: GET / returns setting_value; PUT / upserts.
 */
import { Router, Request, Response } from 'express';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { calendarSettingsPutBodySchema } from '../../schemas/calendarSettingsSchemas.js';
import { CalendarSettings } from '../../../config/app.js';
import type { CalendarSettingsData } from '../../../db/models/admin/calendar_settings.js';
import { handleRouteError } from '../../helpers/routerErrorHandler.js';
import { sendSuccess, sendBadRequest } from '../../helpers/routerResponseHelpers.js';
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js';

const DEFAULT_CALENDAR_SETTINGS: CalendarSettingsData = {
  enabled: false,
  provider: 'none',
  calendars: [],
  holdDurationMinutes: 15,
  holdDurationMin: 1,
  holdDurationMax: 60,
  holdDurationFallback: 15,
  adminEntryTimeout: { value: 30, unit: 'days' },
  autoConfirmEnabled: false,
};

const ERROR_FETCH = 'Failed to fetch calendar settings';
const ERROR_UPDATE = 'Failed to update calendar settings';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const row = await CalendarSettings.findOne();
    const settingValue: CalendarSettingsData = row?.settingValue
      ? (row.settingValue as CalendarSettingsData)
      : DEFAULT_CALENDAR_SETTINGS;
    sendSuccess(res, { setting_value: settingValue });
  } catch (error) {
    handleRouteError(error, res, ERROR_FETCH, 'fetching calendar settings');
  }
});

router.put(
  '/',
  csrfProtection,
  checkOwnership('calendarSetting', 'id'),
  validateRequest(calendarSettingsPutBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const settingValue = req.body?.setting_value;
      if (settingValue === undefined || settingValue === null) {
        sendBadRequest(res, 'setting_value is required');
        return;
      }
      const row = await CalendarSettings.findOne();
      const payload = { settingValue: settingValue as CalendarSettingsData };
      if (row) {
        await row.update(payload);
        sendSuccess(res, { setting_value: row.settingValue });
      } else {
        const created = await CalendarSettings.create(payload);
        sendSuccess(res, { setting_value: created.settingValue });
      }
    } catch (error) {
      handleRouteError(error, res, ERROR_UPDATE, 'updating calendar settings');
    }
  }
);

export { router as CalendarSettingsCrudRouter };
