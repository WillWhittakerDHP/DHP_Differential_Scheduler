/**
 * GET/PUT organization_defaults JSON on availability_settings singleton.
 */
import { Router, Request, Response } from 'express'
import type { OrganizationDefaults } from '../../../../../shared/types/organizationDefaults.js'
import {
  getOrganizationDefaultsData,
  saveOrganizationDefaultsData,
} from '../../../repositories/organizationDefaultsRepository.js'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import { sendBadRequest, sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { staffMutations } from '../../../middlewares/security.js'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { organizationDefaultsPutBodySchema } from '../../schemas/organizationDefaultsSchemas.js'
import { validateOrganizationDefaultsPayload } from './organizationDefaultsValidators.js'

const ERROR_FETCH = 'Failed to fetch organization defaults'
const ERROR_UPDATE = 'Failed to update organization defaults'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settingValue = await getOrganizationDefaultsData()
    sendSuccess(res, { setting_value: settingValue })
  } catch (error) {
    handleRouteError(error, res, ERROR_FETCH, 'fetching organization defaults')
  }
})

router.put(
  '/',
  ...staffMutations('organizationDefaults', 'id'),
  validateRequest(organizationDefaultsPutBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const settingValue = (req.body as { setting_value: unknown }).setting_value
      if (!validateOrganizationDefaultsPayload(settingValue)) {
        sendBadRequest(res, 'Invalid organization_defaults payload')
        return
      }
      const saved = await saveOrganizationDefaultsData(settingValue as OrganizationDefaults)
      sendSuccess(res, { setting_value: saved })
    } catch (error) {
      handleRouteError(error, res, ERROR_UPDATE, 'updating organization defaults')
    }
  }
)

export { router as OrganizationDefaultsCrudRouter }
