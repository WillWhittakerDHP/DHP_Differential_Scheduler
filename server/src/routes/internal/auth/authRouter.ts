/**
 * Placeholder auth router for /api/v1/internal/auth/*.
 * Login routes will be added in Feature 7 (Authentication).
 * PATTERN: Responses use shared auth types — strategies wire in via Task 7.2.1.2+ / Phase 7.3.
 */

import { Router, Request, Response } from 'express'
import Joi from 'joi'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { buildAuthPlaceholder501Body } from '../../../auth/strategies/strategyTypes.js'
import { getAuthConfig } from '../../../config/authConfig.js'

const router = Router()

const PLACEHOLDER_MESSAGE = 'Auth routes coming in Feature 7'

const loginBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
}).unknown(true)

function sendAuthNotImplemented(res: Response): void {
  const auth = getAuthConfig()
  res.status(501).json(
    buildAuthPlaceholder501Body(PLACEHOLDER_MESSAGE, {
      strategy: auth.strategy,
      sessionCookieName: auth.sessionCookieName,
      sessionMaxAgeSec: auth.sessionMaxAgeSec,
    })
  )
}

/** Placeholder: Auth routes coming in Feature 7 */
router.get('/', (_req: Request, res: Response): void => {
  sendAuthNotImplemented(res)
})

/** POC: Request body validation. Valid payload → 501; invalid → 400 with validation details. */
router.post(
  '/login',
  csrfProtection,
  validateRequest(loginBodySchema),
  (_req: Request, res: Response): void => {
    sendAuthNotImplemented(res)
  }
)

export { router as AuthRouter }
