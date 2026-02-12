/**
 * Availability Router
 * 
 * LEARNING: Single endpoint router for computed availability data
 * WHY: Provides pre-computed availability data to eliminate multiple client-side API calls
 * PATTERN: Simple router with validation and error handling
 */

import { Router, Request, Response } from 'express'
import { csrfProtection } from '../../middlewares/security.js'
import { computeAvailabilityData } from '../../services/computedAvailabilityService.js'
import { ERROR_MESSAGES } from './availabilityConstants.js'
import { validateComputedAvailabilityRequest } from './availabilityValidators.js'
import { handleRouteError } from '../helpers/routerErrorHandler.js'
import { HTTP_STATUS_CODES } from '../../constants/router.js'

const router = Router()

/**
 * POST /api/v1/internal/availability/computed-data
 * 
 * LEARNING: Single endpoint that returns all pre-computed availability data
 * WHY: Eliminates multiple client-side API calls and constraint extraction
 * PATTERN: Orchestrator endpoint that coordinates all data sources
 * 
 * Phase 4: Server-Side Computed Availability Data Refactor
 */
router.post('/computed-data', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const validation = validateComputedAvailabilityRequest(req.body)
    if (!validation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: validation.error })
      return
    }
    
    // Compute availability data
    const computedData = await computeAvailabilityData(req.body)
    
    res.status(HTTP_STATUS_CODES.OK).json(computedData)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.COMPUTE_FAILED, 'computing availability data')
  }
})

export { router as AvailabilityRouter }