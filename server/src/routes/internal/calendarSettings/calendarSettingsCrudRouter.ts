/**
 * Singleton CRUD for calendar settings. Persisted in app_setting_entries (namespace calendar, path document).
 */
import { Router, Request, Response } from 'express';
import type { CalendarSettingsData } from '../../../../../shared/types/calendarSettingsDocument.js';
import {
  getCalendarSettings,
  saveCalendarSettingsData,
} from '../../../repositories/calendarSettingsRepository.js';
import { handleRouteError } from '../../helpers/routerErrorHandler.js';
import { sendSuccess, sendBadRequest } from '../../helpers/routerResponseHelpers.js';
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js';

const ERROR_FETCH = 'Failed to fetch calendar settings';
const ERROR_UPDATE = 'Failed to update calendar settings';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settingValue = await getCalendarSettings();
    sendSuccess(res, { setting_value: settingValue });
  } catch (error) {
    handleRouteError(error, res, ERROR_FETCH, 'fetching calendar settings');
  }
});

router.put(
  '/',
  csrfProtection,
  checkOwnership('calendarSetting', 'id'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const settingValue = req.body?.setting_value;
      if (settingValue === undefined || settingValue === null) {
        sendBadRequest(res, 'setting_value is required');
        return;
      }
      const saved = await saveCalendarSettingsData(settingValue as CalendarSettingsData);
      sendSuccess(res, { setting_value: saved });
    } catch (error) {
      handleRouteError(error, res, ERROR_UPDATE, 'updating calendar settings');
    }
  }
);

export { router as CalendarSettingsCrudRouter };
