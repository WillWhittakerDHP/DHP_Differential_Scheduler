/**
 * Business Settings CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for business settings
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { BusinessSettings } from '../../../config/app.js'
import { ERROR_MESSAGES, AVAILABILITY_SETTINGS_KEY } from './businessSettingsConstants.js'
import { handleRouteError } from './businessSettingsErrorHandler.js'
import { validateSettingKey, validateSettingValue, validateAvailabilitySettingsWithDetails } from './businessSettingsValidators.js'
import { transformSettingToResponse, getSettingWithDefault, mergeSettingValues } from './businessSettingsHelpers.js'
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendNoContent, sendError } from '../../helpers/routerResponseHelpers.js'
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const router = Router()

/**
 * GET /business-settings
 * List all settings or get setting by query key
 * 
 * LEARNING: Fetches all settings or single setting by query parameter
 * WHY: Provides flexible querying of business settings
 * PATTERN: Check query parameter, fetch single or all, return JSON
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query

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

/**
 * GET /business-settings/:key
 * Get single setting by key
 * 
 * LEARNING: Fetches single setting by key with default fallback for availability settings
 * WHY: Provides complete setting data for a specific key
 * PATTERN: Fetch by key, return default if not found for availability settings, return 404 otherwise
 */
router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params

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

/**
 * POST /business-settings
 * Create a new setting
 * 
 * LEARNING: Creates a new setting record with validation
 * WHY: Enables setting creation via API
 * PATTERN: Validate, check if exists, create record, return 201
 */
router.post(
  '/',
  csrfProtection, // Security middleware: CSRF protection
  async (req: Request, res: Response): Promise<void> => {
  try {
    const { setting_key, setting_value } = req.body

    // Validate setting key
    const keyValidation = validateSettingKey(setting_key)
    if (!keyValidation.valid) {
      sendBadRequest(res, keyValidation.error)
      return
    }

    // Validate setting value
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

/**
 * PUT /business-settings/:key
 * Update a setting (full update or create if not exists)
 * 
 * LEARNING: Updates setting record with full replacement, creates if not exists
 * WHY: Enables full setting updates via API
 * PATTERN: Validate, find or create, update, return JSON
 */
router.put(
  '/:key',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('businessSetting', 'key'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params
    const { setting_value } = req.body

    // Validate setting value
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
      })
      sendCreated(res, transformSettingToResponse(newSetting))
      return
    }

    setting.settingValue = setting_value
    await setting.save()

    sendSuccess(res, transformSettingToResponse(setting))
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_SETTING, 'updating business setting')
  }
  }
)

/**
 * PATCH /business-settings/:key
 * Partially update a setting
 * 
 * LEARNING: Updates setting record with partial data
 * WHY: Enables partial setting updates via API
 * PATTERN: Patch record, merge values, validate, return 404 if not found, return updated record
 */
router.patch(
  '/:key',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('businessSetting', 'key'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params
    const { setting_value } = req.body

    // Validate setting value
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

    // PATTERN: After validation, we know mergedValue is valid AvailabilitySettingsData
    setting.settingValue = mergedValue as any
    await setting.save()

    sendSuccess(res, transformSettingToResponse(setting))
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.PATCH_SETTING, 'patching business setting')
  }
  }
)

/**
 * DELETE /business-settings/:key
 * Delete a setting
 * 
 * LEARNING: Deletes setting record
 * WHY: Enables setting deletion via API
 * PATTERN: Delete record, return 404 if not found, return 204 on success
 */
router.delete(
  '/:key',
  csrfProtection, // Security middleware: CSRF protection
  checkOwnership('businessSetting', 'key'), // Security middleware: ownership check (stub)
  async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params

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
