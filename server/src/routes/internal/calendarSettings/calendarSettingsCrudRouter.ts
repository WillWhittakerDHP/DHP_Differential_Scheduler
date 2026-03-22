/**
 * Singleton CRUD for calendar settings. Relational storage + calendar_setting_calendars.
 */
import { Router, Request, Response } from 'express';
import type { CalendarSettingsData } from '../../../../../shared/types/calendarSettingsDocument.js';
import {
  getCalendarSettings,
  saveCalendarSettingsData,
} from '../../../repositories/calendarSettingsRepository.js';
import { handleRouteError } from '../../helpers/routerErrorHandler.js';
import { sendSuccess } from '../../helpers/routerResponseHelpers.js';
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { calendarSettingsPutBodySchema } from '../../schemas/calendarSettingsSchemas.js';

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
  validateRequest(calendarSettingsPutBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const settingValue = (req.body as { setting_value: CalendarSettingsData }).setting_value;
      const saved = await saveCalendarSettingsData(settingValue);
      sendSuccess(res, { setting_value: saved });
    } catch (error) {
      handleRouteError(error, res, ERROR_UPDATE, 'updating calendar settings');
    }
  }
);

export { router as CalendarSettingsCrudRouter };
