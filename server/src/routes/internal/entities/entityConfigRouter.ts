
import { Router, Request, Response } from 'express'
import { ENTITY_KEYS_ARRAY } from './entityConstants.js'
import { ERROR_MESSAGES, DEFAULT_VALUES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'

const router = Router()

router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      entityKeys: ENTITY_KEYS_ARRAY,
      version: DEFAULT_VALUES.CONFIG_VERSION,
      lastModified: new Date().toISOString()
    })
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_CONFIG, 'entity configuration', 'fetching config')
  }
})

export { router as EntityConfigRouter }
