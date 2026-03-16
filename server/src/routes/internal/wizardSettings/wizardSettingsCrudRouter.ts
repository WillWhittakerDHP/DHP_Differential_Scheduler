/**
 * Singleton CRUD for wizard_settings: GET / returns setting_value; PUT / upserts.
 */
import { Router, Request, Response } from 'express';
import { WizardSettings } from '../../../config/app.js';
import type { WizardSettingsData } from '../../../db/models/admin/wizard_settings.js';
import { handleRouteError } from '../../helpers/routerErrorHandler.js';
import { sendSuccess, sendBadRequest } from '../../helpers/routerResponseHelpers.js';
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js';

const DEFAULT_WIZARD_SETTINGS: WizardSettingsData = {
  showApplyCoupon: false,
  useBrandColors: false,
};

const ERROR_FETCH = 'Failed to fetch wizard settings';
const ERROR_UPDATE = 'Failed to update wizard settings';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const row = await WizardSettings.findOne();
    const settingValue: WizardSettingsData = row?.settingValue
      ? (row.settingValue as WizardSettingsData)
      : DEFAULT_WIZARD_SETTINGS;
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
      const row = await WizardSettings.findOne();
      const payload = { settingValue: settingValue as WizardSettingsData };
      if (row) {
        await row.update(payload);
        sendSuccess(res, { setting_value: row.settingValue });
      } else {
        const created = await WizardSettings.create(payload);
        sendSuccess(res, { setting_value: created.settingValue });
      }
    } catch (error) {
      handleRouteError(error, res, ERROR_UPDATE, 'updating wizard settings');
    }
  }
);

export { router as WizardSettingsCrudRouter };
