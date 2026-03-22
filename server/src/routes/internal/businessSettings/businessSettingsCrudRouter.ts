/**
 * Availability settings only (`availability_settings`). Persisted in `availability_*` tables.
 * Calendar and wizard: `/calendar-settings`, `/wizard-settings`.
 */
import { Router, Request, Response } from 'express'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import {
  businessSettingsPostBodySchema,
  businessSettingsPutPatchBodySchema,
} from '../../schemas/businessSettingsSchemas.js'
import type { AvailabilitySettingsData } from '../../../../../shared/types/availabilitySettingsDocument.js'
import {
  getAvailabilitySettingsData,
  resetAvailabilitySettingsToDefault,
  saveAvailabilitySettingsData,
} from '../../../repositories/availabilitySettingsRepository.js'
import { ERROR_MESSAGES, AVAILABILITY_SETTINGS_KEY } from './businessSettingsConstants.js'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import {
  validateSettingKey,
  validateSettingValue,
  validateAvailabilitySettingsWithDetails,
} from './businessSettingsValidators.js'
import { mergeSettingValues } from './businessSettingsHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const router = Router()

function isAvailabilityKey(key: string): boolean {
  return key === AVAILABILITY_SETTINGS_KEY
}

async function getAvailabilityRow(): Promise<{ setting_key: string; setting_value: AvailabilitySettingsData }> {
  const setting_value = await getAvailabilitySettingsData()
  return {
    setting_key: AVAILABILITY_SETTINGS_KEY,
    setting_value,
  }
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query
    if (key && typeof key === 'string') {
      if (!isAvailabilityKey(key)) {
        sendNotFound(res, ERROR_MESSAGES.AVAILABILITY_SETTINGS_ONLY, key)
        return
      }
      sendSuccess(res, await getAvailabilityRow())
      return
    }
    sendSuccess(res, [await getAvailabilityRow()])
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_SETTINGS, 'fetching business settings')
  }
})

router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const key = paramString(req, 'key')
    if (!isAvailabilityKey(key)) {
      sendNotFound(res, ERROR_MESSAGES.AVAILABILITY_SETTINGS_ONLY, key)
      return
    }
    sendSuccess(res, await getAvailabilityRow())
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_SETTING, 'fetching business setting')
  }
})

router.post(
  '/',
  csrfProtection,
  validateRequest(businessSettingsPostBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { setting_key, setting_value } = req.body
      const keyValidation = validateSettingKey(setting_key)
      if (!keyValidation.valid) {
        sendBadRequest(res, keyValidation.error)
        return
      }
      if (!isAvailabilityKey(setting_key as string)) {
        sendNotFound(res, ERROR_MESSAGES.AVAILABILITY_SETTINGS_ONLY, setting_key as string)
        return
      }
      const valueValidation = validateSettingValue(setting_value)
      if (!valueValidation.valid) {
        sendBadRequest(res, valueValidation.error)
        return
      }
      const availabilityValidation = validateAvailabilitySettingsWithDetails(setting_key, setting_value)
      if (!availabilityValidation.valid) {
        sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string)
        return
      }
      await saveAvailabilitySettingsData(setting_value as AvailabilitySettingsData)
      const saved = await getAvailabilitySettingsData()
      sendCreated(res, { setting_key: AVAILABILITY_SETTINGS_KEY, setting_value: saved })
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.CREATE_SETTING, 'creating business setting')
    }
  }
)

router.put(
  '/:key',
  csrfProtection,
  checkOwnership('businessSetting', 'key'),
  validateRequest(businessSettingsPutPatchBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = paramString(req, 'key')
      if (!isAvailabilityKey(key)) {
        sendNotFound(res, ERROR_MESSAGES.AVAILABILITY_SETTINGS_ONLY, key)
        return
      }
      const { setting_value } = req.body
      const valueValidation = validateSettingValue(setting_value)
      if (!valueValidation.valid) {
        sendBadRequest(res, valueValidation.error)
        return
      }
      const availabilityValidation = validateAvailabilitySettingsWithDetails(key, setting_value)
      if (!availabilityValidation.valid) {
        sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string)
        return
      }
      await saveAvailabilitySettingsData(setting_value as AvailabilitySettingsData)
      const saved = await getAvailabilitySettingsData()
      sendSuccess(res, { setting_key: AVAILABILITY_SETTINGS_KEY, setting_value: saved })
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.UPDATE_SETTING, 'updating business setting')
    }
  }
)

router.patch(
  '/:key',
  csrfProtection,
  checkOwnership('businessSetting', 'key'),
  validateRequest(businessSettingsPutPatchBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = paramString(req, 'key')
      if (!isAvailabilityKey(key)) {
        sendNotFound(res, ERROR_MESSAGES.AVAILABILITY_SETTINGS_ONLY, key)
        return
      }
      const { setting_value } = req.body
      const valueValidation = validateSettingValue(setting_value)
      if (!valueValidation.valid) {
        sendBadRequest(res, valueValidation.error)
        return
      }
      const current = await getAvailabilitySettingsData()
      const mergedValue = mergeSettingValues(current, setting_value) as AvailabilitySettingsData
      const availabilityValidation = validateAvailabilitySettingsWithDetails(key, mergedValue)
      if (!availabilityValidation.valid) {
        sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string)
        return
      }
      await saveAvailabilitySettingsData(mergedValue)
      const saved = await getAvailabilitySettingsData()
      sendSuccess(res, { setting_key: AVAILABILITY_SETTINGS_KEY, setting_value: saved })
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.PATCH_SETTING, 'patching business setting')
    }
  }
)

router.delete(
  '/:key',
  csrfProtection,
  checkOwnership('businessSetting', 'key'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = paramString(req, 'key')
      if (!isAvailabilityKey(key)) {
        sendNotFound(res, ERROR_MESSAGES.AVAILABILITY_SETTINGS_ONLY, key)
        return
      }
      await resetAvailabilitySettingsToDefault()
      res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.DELETE_SETTING, 'deleting business setting')
    }
  }
)

export { router as BusinessSettingsCrudRouter }
