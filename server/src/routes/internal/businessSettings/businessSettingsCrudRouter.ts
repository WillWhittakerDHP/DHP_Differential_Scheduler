
import { Router, Request, Response } from 'express'
import { BusinessSettings } from '../../../config/app.js'
import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js'
import { ERROR_MESSAGES } from './businessSettingsConstants.js'
import { handleRouteError } from './businessSettingsErrorHandler.js'
import { validateSettingKey, validateSettingValue, validateAvailabilitySettings, validateAvailabilitySettingsWithDetails } from './businessSettingsValidators.js'
import { transformSettingToResponse, getSettingWithDefault, mergeSettingValues } from './businessSettingsHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query

    // @audit-allow:hardcoding:fieldEqualsString - Type guard for query key
    if (key && typeof key === 'string') {
      const setting = await BusinessSettings.findOne({
        where: { settingKey: key },
      })

      const settingWithDefault = getSettingWithDefault(setting, key)
      if (!settingWithDefault) {
        sendNotFound(res, ERROR_MESSAGES.SETTING_NOT_FOUND.replace('{key}', key), key)
        return
      }

      sendSuccess(res, settingWithDefault)
    } else {
      const settings = await BusinessSettings.findAll()
      sendSuccess(res, settings.map(s => transformSettingToResponse(s)))
    }
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_SETTINGS, 'fetching business settings')
  }
})

router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const key = paramString(req, 'key')

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    })

    const settingWithDefault = getSettingWithDefault(setting, key)
    if (!settingWithDefault) {
      sendNotFound(res, ERROR_MESSAGES.SETTING_NOT_FOUND.replace('{key}', key), key)
      return
    }

    sendSuccess(res, settingWithDefault)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_SETTING, 'fetching business setting')
  }
})

router.post(
  '/',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  try {
    const { setting_key, setting_value } = req.body

    const keyValidation = validateSettingKey(setting_key)
    if (!keyValidation.valid) {
      sendBadRequest(res, keyValidation.error)
      return
    }

    const valueValidation = validateSettingValue(setting_value)
    if (!valueValidation.valid) {
      sendBadRequest(res, valueValidation.error)
      return
    }

    // Validate availability_settings structure
    const availabilityValidation = validateAvailabilitySettingsWithDetails(setting_key, setting_value)
    if (!availabilityValidation.valid) {
      sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string)
      return
    }

    const existing = await BusinessSettings.findOne({
      where: { settingKey: setting_key },
    })

    if (existing) {
      sendError(res, ERROR_MESSAGES.SETTING_ALREADY_EXISTS.replace('{key}', setting_key), HTTP_STATUS_CODES.CONFLICT)
      return
    }

    const setting = await BusinessSettings.create({
      settingKey: setting_key,
      settingValue: setting_value,
    })

    sendCreated(res, transformSettingToResponse(setting))
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_SETTING, 'creating business setting')
  }
  }
)

router.put(
  '/:key',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('businessSetting', 'key'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
  try {
    const key = paramString(req, 'key')
    const { setting_value, auto_confirm_enabled } = req.body

    const valueValidation = validateSettingValue(setting_value)
    if (!valueValidation.valid) {
      sendBadRequest(res, valueValidation.error)
      return
    }

    // Validate availability_settings structure
    const availabilityValidation = validateAvailabilitySettingsWithDetails(key, setting_value)
    if (!availabilityValidation.valid) {
      sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string)
      return
    }

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    })

    if (!setting) {
      const newSetting = await BusinessSettings.create({
        settingKey: key,
        settingValue: setting_value,
        ...(typeof auto_confirm_enabled === 'boolean' && { autoConfirmEnabled: auto_confirm_enabled }),
      })
      sendCreated(res, transformSettingToResponse(newSetting))
      return
    }

    setting.settingValue = setting_value
    if (typeof auto_confirm_enabled === 'boolean') {
      setting.autoConfirmEnabled = auto_confirm_enabled
    }
    await setting.save()

    sendSuccess(res, transformSettingToResponse(setting))
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_SETTING, 'updating business setting')
  }
  }
)

router.patch(
  '/:key',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('businessSetting', 'key'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
  try {
    const key = paramString(req, 'key')
    const { setting_value, auto_confirm_enabled } = req.body

    const valueValidation = validateSettingValue(setting_value)
    if (!valueValidation.valid) {
      sendBadRequest(res, valueValidation.error)
      return
    }

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    })

    if (!setting) {
      sendNotFound(res, ERROR_MESSAGES.SETTING_NOT_FOUND_FOR_PATCH.replace('{key}', key), key)
      return
    }

    const mergedValue = mergeSettingValues(setting.settingValue, setting_value)

    // Validate availability_settings structure after merge
    const availabilityValidation = validateAvailabilitySettingsWithDetails(key, mergedValue)
    if (!availabilityValidation.valid) {
      sendBadRequest(res, availabilityValidation.error, availabilityValidation.details?.message as string)
      return
    }

    // PATTERN: After validation, for availability key mergedValue is valid AvailabilitySettingsData; for other keys assign as-is
    if (validateAvailabilitySettings(mergedValue)) {
      setting.settingValue = mergedValue
    } else {
      setting.settingValue = mergedValue as AvailabilitySettingsData
    }

    // Task 6.3.2.3: persist auto_confirm_enabled when provided (availability_settings row only)
    if (typeof auto_confirm_enabled === 'boolean') {
      setting.autoConfirmEnabled = auto_confirm_enabled
    }

    await setting.save()

    sendSuccess(res, transformSettingToResponse(setting))
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.PATCH_SETTING, 'patching business setting')
  }
  }
)

router.delete(
  '/:key',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('businessSetting', 'key'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
  try {
    const key = paramString(req, 'key')

    const setting = await BusinessSettings.findOne({
      where: { settingKey: key },
    })

    if (!setting) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.SETTING_NOT_FOUND.replace('{key}', key)
      })
      return
    }

    await setting.destroy()

    res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_SETTING, 'deleting business setting')
  }
  }
)

export { router as BusinessSettingsCrudRouter }
