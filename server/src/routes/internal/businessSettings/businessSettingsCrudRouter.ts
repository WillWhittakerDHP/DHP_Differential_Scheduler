/**
 * CRUD for business_settings. Only key in use is availability_settings; direct read/write of that row.
 * Calendar and wizard settings use /calendar-settings and /wizard-settings.
 */
import { Router, Request, Response } from 'express';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  businessSettingsPostBodySchema,
  businessSettingsPutPatchBodySchema,
} from '../../schemas/businessSettingsSchemas.js';
import { BusinessSettings } from '../../../config/app.js';
import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js';
import { ERROR_MESSAGES, AVAILABILITY_SETTINGS_KEY, defaultAvailabilitySettings } from './businessSettingsConstants.js';
import { handleRouteError } from '../../helpers/routerErrorHandler.js';
import {
  validateSettingKey,
  validateSettingValue,
  validateAvailabilitySettings,
  validateAvailabilitySettingsWithDetails,
} from './businessSettingsValidators.js';
import { transformSettingToResponse, getSettingWithDefault, mergeSettingValues } from './businessSettingsHelpers.js';
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError } from '../../helpers/routerResponseHelpers.js';
import { paramString } from '../../helpers/requestHelpers.js';
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js';
import { HTTP_STATUS_CODES } from '../../../constants/router.js';

const router = Router();

async function getAvailabilityRow(): Promise<{ setting_key: string; setting_value: AvailabilitySettingsData }> {
  const row = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  });
  const settingValue = row?.settingValue
    ? (row.settingValue as AvailabilitySettingsData)
    : (defaultAvailabilitySettings as AvailabilitySettingsData);
  return {
    setting_key: AVAILABILITY_SETTINGS_KEY,
    setting_value: settingValue,
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    if (key && typeof key === 'string') {
      if (key === AVAILABILITY_SETTINGS_KEY) {
        const data = await getAvailabilityRow();
        sendSuccess(res, data);
        return;
      }
      const setting = await BusinessSettings.findOne({ where: { settingKey: key } });
      const settingWithDefault = getSettingWithDefault(setting, key);
      if (!settingWithDefault) {
        sendNotFound(res, ERROR_MESSAGES.SETTING_NOT_FOUND.replace('{key}', key), key);
        return;
      }
      sendSuccess(res, settingWithDefault);
    } else {
      const settings = await BusinessSettings.findAll();
      const list = settings.map((s) => transformSettingToResponse(s));
      const hasAvailability = list.some((s: { setting_key: string }) => s.setting_key === AVAILABILITY_SETTINGS_KEY);
      if (!hasAvailability) {
        list.push(await getAvailabilityRow());
      }
      sendSuccess(res, list);
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_SETTINGS, 'fetching business settings');
  }
});

router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const key = paramString(req, 'key');
    if (key === AVAILABILITY_SETTINGS_KEY) {
      sendSuccess(res, await getAvailabilityRow());
      return;
    }
    const setting = await BusinessSettings.findOne({ where: { settingKey: key } });
    const settingWithDefault = getSettingWithDefault(setting, key);
    if (!settingWithDefault) {
      sendNotFound(res, ERROR_MESSAGES.SETTING_NOT_FOUND.replace('{key}', key), key);
      return;
    }
    sendSuccess(res, settingWithDefault);
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_SETTING, 'fetching business setting');
  }
});

router.post(
  '/',
  csrfProtection,
  validateRequest(businessSettingsPostBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { setting_key, setting_value } = req.body;
      const keyValidation = validateSettingKey(setting_key);
      if (!keyValidation.valid) {
        sendBadRequest(res, keyValidation.error);
        return;
      }
      const valueValidation = validateSettingValue(setting_value);
      if (!valueValidation.valid) {
        sendBadRequest(res, valueValidation.error);
        return;
      }
      const availabilityValidation = validateAvailabilitySettingsWithDetails(setting_key, setting_value);
      if (!availabilityValidation.valid) {
        sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string);
        return;
      }
      if (setting_key === AVAILABILITY_SETTINGS_KEY) {
        let row = await BusinessSettings.findOne({ where: { settingKey: AVAILABILITY_SETTINGS_KEY } });
        if (row) {
          await row.update({ settingValue: setting_value as AvailabilitySettingsData });
        } else {
          row = await BusinessSettings.create({
            settingKey: AVAILABILITY_SETTINGS_KEY,
            settingValue: setting_value as AvailabilitySettingsData,
          });
        }
        sendCreated(res, { setting_key: AVAILABILITY_SETTINGS_KEY, setting_value: row.settingValue });
        return;
      }
      const existing = await BusinessSettings.findOne({ where: { settingKey: setting_key } });
      if (existing) {
        sendError(res, ERROR_MESSAGES.SETTING_ALREADY_EXISTS.replace('{key}', setting_key), HTTP_STATUS_CODES.CONFLICT);
        return;
      }
      const setting = await BusinessSettings.create({
        settingKey: setting_key,
        settingValue: setting_value,
      });
      sendCreated(res, transformSettingToResponse(setting));
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.CREATE_SETTING, 'creating business setting');
    }
  }
);

router.put(
  '/:key',
  csrfProtection,
  checkOwnership('businessSetting', 'key'),
  validateRequest(businessSettingsPutPatchBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = paramString(req, 'key');
      const { setting_value } = req.body;
      const valueValidation = validateSettingValue(setting_value);
      if (!valueValidation.valid) {
        sendBadRequest(res, valueValidation.error);
        return;
      }
      const availabilityValidation = validateAvailabilitySettingsWithDetails(key, setting_value);
      if (!availabilityValidation.valid) {
        sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string);
        return;
      }
      if (key === AVAILABILITY_SETTINGS_KEY) {
        let row = await BusinessSettings.findOne({ where: { settingKey: AVAILABILITY_SETTINGS_KEY } });
        if (row) {
          await row.update({ settingValue: setting_value as AvailabilitySettingsData });
        } else {
          row = await BusinessSettings.create({
            settingKey: AVAILABILITY_SETTINGS_KEY,
            settingValue: setting_value as AvailabilitySettingsData,
          });
        }
        sendSuccess(res, { setting_key: AVAILABILITY_SETTINGS_KEY, setting_value: row.settingValue });
        return;
      }
      const setting = await BusinessSettings.findOne({ where: { settingKey: key } });
      if (!setting) {
        const newSetting = await BusinessSettings.create({
          settingKey: key,
          settingValue: setting_value,
        });
        sendCreated(res, transformSettingToResponse(newSetting));
        return;
      }
      await setting.update({ settingValue: setting_value });
      sendSuccess(res, transformSettingToResponse(setting));
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.UPDATE_SETTING, 'updating business setting');
    }
  }
);

router.patch(
  '/:key',
  csrfProtection,
  checkOwnership('businessSetting', 'key'),
  validateRequest(businessSettingsPutPatchBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = paramString(req, 'key');
      const { setting_value } = req.body;
      const valueValidation = validateSettingValue(setting_value);
      if (!valueValidation.valid) {
        sendBadRequest(res, valueValidation.error);
        return;
      }
      if (key === AVAILABILITY_SETTINGS_KEY) {
        const row = await BusinessSettings.findOne({ where: { settingKey: AVAILABILITY_SETTINGS_KEY } });
        const existing = row?.settingValue as AvailabilitySettingsData | undefined;
        const mergedValue = mergeSettingValues(
          existing ?? defaultAvailabilitySettings,
          setting_value
        ) as AvailabilitySettingsData;
        const availabilityValidation = validateAvailabilitySettingsWithDetails(key, mergedValue);
        if (!availabilityValidation.valid) {
          sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string);
          return;
        }
        if (row) {
          await row.update({ settingValue: mergedValue });
          sendSuccess(res, { setting_key: AVAILABILITY_SETTINGS_KEY, setting_value: row.settingValue });
        } else {
          const created = await BusinessSettings.create({
            settingKey: AVAILABILITY_SETTINGS_KEY,
            settingValue: mergedValue,
          });
          sendSuccess(res, { setting_key: AVAILABILITY_SETTINGS_KEY, setting_value: created.settingValue });
        }
        return;
      }
      const setting = await BusinessSettings.findOne({ where: { settingKey: key } });
      if (!setting) {
        sendNotFound(res, ERROR_MESSAGES.SETTING_NOT_FOUND_FOR_PATCH.replace('{key}', key), key);
        return;
      }
      const mergedValue = mergeSettingValues(setting.settingValue, setting_value);
      const availabilityValidation = validateAvailabilitySettingsWithDetails(key, mergedValue);
      if (!availabilityValidation.valid) {
        sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string);
        return;
      }
      const toSave = validateAvailabilitySettings(mergedValue) ? mergedValue : (mergedValue as AvailabilitySettingsData);
      await setting.update({ settingValue: toSave });
      sendSuccess(res, transformSettingToResponse(setting));
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.PATCH_SETTING, 'patching business setting');
    }
  }
);

router.delete(
  '/:key',
  csrfProtection,
  checkOwnership('businessSetting', 'key'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = paramString(req, 'key');
      if (key === AVAILABILITY_SETTINGS_KEY) {
        const row = await BusinessSettings.findOne({ where: { settingKey: AVAILABILITY_SETTINGS_KEY } });
        if (row) {
          await row.update({ settingValue: defaultAvailabilitySettings as AvailabilitySettingsData });
        }
        res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
        return;
      }
      const setting = await BusinessSettings.findOne({ where: { settingKey: key } });
      if (!setting) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          error: ERROR_MESSAGES.SETTING_NOT_FOUND.replace('{key}', key),
        });
        return;
      }
      await setting.destroy();
      res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.DELETE_SETTING, 'deleting business setting');
    }
  }
);

export { router as BusinessSettingsCrudRouter };
