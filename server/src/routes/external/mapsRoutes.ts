/**
 * Maps Routes
 *
 *
 * SESSION: 2.2.1 - Address Autocomplete (Places API)
 * SESSION: 2.2.2 - Drive Time Calculations (Routes API)
 */

import { Router, Request, Response } from 'express'
import {
  getAutocompleteSuggestions,
  getPlaceDetails,
  generateSessionToken
} from '../../services/google/maps/placesApiService.js'
import { MapsApiError } from '../../services/google/maps/mapsErrorHandler.js'
import { createLogger } from '../../utils/logger.js'
import { MapsDebugRouter } from './mapsDebugRoutes.js'
import { MAPS_ROUTE_MESSAGES } from './mapsRouteConstants.js'

const logger = createLogger('MapsRoutes')

const router = Router()

function getStatusCodeForError(type: string): number {
  const statusMap: Record<string, number> = {
    auth: 401,
    rate_limit: 429,
    invalid: 400,
    not_found: 404,
    network: 502
  }
  return statusMap[type] ?? 500
}

type AsyncRouteHandler = (req: Request, res: Response) => Promise<void>

function withMapsErrorHandling(handler: AsyncRouteHandler): AsyncRouteHandler {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await handler(req, res)
    } catch (error) {
      logger.error('Maps route error:', error)
      if (error instanceof MapsApiError) {
        const statusCode = getStatusCodeForError(error.type)
        res.status(statusCode).json({
          error: error.getUserMessage(),
          type: error.type,
          retryable: error.retryable
        })
        return
      }
      res.status(500).json({
        error: MAPS_ROUTE_MESSAGES.INTERNAL_SERVER_ERROR,
        type: 'unknown'
      })
    }
  }
}

router.get(
  '/autocomplete',
  withMapsErrorHandling(async (req: Request, res: Response): Promise<void> => {
    const { input, sessionToken } = req.query
    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: MAPS_ROUTE_MESSAGES.MISSING_INPUT, type: 'invalid' })
      return
    }
    const predictions = await getAutocompleteSuggestions(
      input,
      sessionToken as string | undefined
    )
    res.json({ predictions })
  })
)

router.get(
  '/place-details',
  withMapsErrorHandling(async (req: Request, res: Response): Promise<void> => {
    const { placeId, sessionToken } = req.query
    if (!placeId || typeof placeId !== 'string') {
      res.status(400).json({ error: MAPS_ROUTE_MESSAGES.MISSING_PLACE_ID, type: 'invalid' })
      return
    }
    const details = await getPlaceDetails(
      placeId,
      sessionToken as string | undefined
    )
    res.json(details)
  })
)

router.get('/session-token', (_req: Request, res: Response): void => {
  const sessionToken = generateSessionToken()
  res.json({ sessionToken })
})

router.use('/debug', MapsDebugRouter)

export { router as MapsRouter }
