/**
 * Singleton CRUD for wizard settings. Persisted in app_setting_entries (namespace wizard, path document).
 */
import { Router, Request, Response } from 'express';
import type { WizardSettingsData } from '../../../../../shared/types/wizardSettingsTypes.js';
import {
  getWizardSettingsData,
  saveWizardSettingsData,
} from '../../../repositories/wizardSettingsRepository.js';
import { handleRouteError } from '../../helpers/routerErrorHandler.js';
import { sendSuccess, sendBadRequest } from '../../helpers/routerResponseHelpers.js';
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js';

const ERROR_FETCH = 'Failed to fetch wizard settings';
const ERROR_UPDATE = 'Failed to update wizard settings';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settingValue = await getWizardSettingsData();
    sendSuccess(res, { setting_value: settingValue });
  } catch (error) {
    handleRouteError(error, res, ERROR_FETCH, 'fetching wizard settings');
  }
});

router.put(
  '/',
  csrfProtection,
  checkOwnership('wizardSetting', 'id'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const settingValue = req.body?.setting_value;
      if (settingValue === undefined || settingValue === null) {
        sendBadRequest(res, 'setting_value is required');
        return;
      }
      const saved = await saveWizardSettingsData(settingValue as WizardSettingsData);
      sendSuccess(res, { setting_value: saved });
    } catch (error) {
      handleRouteError(error, res, ERROR_UPDATE, 'updating wizard settings');
    }
  }
);

export { router as WizardSettingsCrudRouter };
