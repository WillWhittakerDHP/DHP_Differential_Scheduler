import { Router, Request, Response } from 'express'
import Joi from 'joi'
import {
  getAutocompleteSuggestions,
  getPlaceDetails,
  generateSessionToken
} from '../../services/google/maps/placesApiService.js'
import { createLogger } from '../../utils/logger.js'
import { MapsDebugRouter } from './mapsDebugRoutes.js'
import { MAPS_ROUTE_MESSAGES } from './mapsRouteConstants.js'
import { sendMapsRouteErrorResponse } from './mapsRouteErrorResponses.js'

const autocompleteQuerySchema = Joi.object({
  input: Joi.string().required(),
  sessionToken: Joi.string().optional(),
}).unknown(true)

const placeDetailsQuerySchema = Joi.object({
  placeId: Joi.string().required(),
  sessionToken: Joi.string().optional(),
}).unknown(true)

const logger = createLogger('MapsRoutes')

const router = Router()

type AsyncRouteHandler = (req: Request, res: Response) => Promise<void>

function withMapsErrorHandling(handler: AsyncRouteHandler): AsyncRouteHandler {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await handler(req, res)
    } catch (error) {
      logger.error('Maps route error:', error)
      sendMapsRouteErrorResponse(res, error)
    }
  }
}

router.get(
  '/autocomplete',
  withMapsErrorHandling(async (req: Request, res: Response): Promise<void> => {
    const validation = autocompleteQuerySchema.validate(req.query, { abortEarly: false })
    if (validation.error) {
      res.status(400).json({ error: MAPS_ROUTE_MESSAGES.MISSING_INPUT, type: 'invalid' })
      return
    }
    const { input, sessionToken } = validation.value
    const predictions = await getAutocompleteSuggestions(
      input,
      sessionToken
    )
    res.json({ predictions })
  })
)

router.get(
  '/place-details',
  withMapsErrorHandling(async (req: Request, res: Response): Promise<void> => {
    const validation = placeDetailsQuerySchema.validate(req.query, { abortEarly: false })
    if (validation.error) {
      res.status(400).json({ error: MAPS_ROUTE_MESSAGES.MISSING_PLACE_ID, type: 'invalid' })
      return
    }
    const { placeId, sessionToken } = validation.value
    const details = await getPlaceDetails(
      placeId,
      sessionToken
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
