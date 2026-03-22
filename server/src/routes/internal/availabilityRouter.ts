
import { Router, Request, Response } from 'express'
import { csrfProtection } from '../../middlewares/security.js'
import { computeAvailabilityData } from '../../services/computedAvailabilityService.js'
import { ERROR_MESSAGES } from './availabilityConstants.js'
import { validateComputedAvailabilityRequest } from './availabilityValidators.js'
import { handleRouteError } from '../helpers/routerErrorHandler.js'
import { HTTP_STATUS_CODES } from '../../constants/router.js'

const router = Router()

router.post('/computed-data', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateComputedAvailabilityRequest(req.body)
    if (!validation.valid) {
      // @audit-allow:hardcoding:fieldMapping - Response shape
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: validation.error })
      return
    }
    
    const computedData = await computeAvailabilityData(req.body)
    
    res.status(HTTP_STATUS_CODES.OK).json(computedData)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.COMPUTE_FAILED, 'computing availability data')
  }
})

export { router as AvailabilityRouter }