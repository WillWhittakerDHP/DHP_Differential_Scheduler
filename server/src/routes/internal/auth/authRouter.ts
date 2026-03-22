/**
 * Placeholder auth router for /api/v1/internal/auth/*.
 * Login routes will be added in Feature 7 (Authentication).
 */

import { Router, Request, Response } from 'express'
import Joi from 'joi'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { csrfProtection } from '../../../middlewares/security.js'

const router = Router()

const loginBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
}).unknown(true)

/** Placeholder: Auth routes coming in Feature 7 */
router.get('/', (_req: Request, res: Response): void => {
  res.status(501).json({ message: 'Auth routes coming in Feature 7' })
})

/** POC: Request body validation. Valid payload → 501; invalid → 400 with validation details. */
router.post(
  '/login',
  csrfProtection,
  validateRequest(loginBodySchema),
  (_req: Request, res: Response): void => {
    res.status(501).json({ message: 'Auth routes coming in Feature 7' })
  }
)

export { router as AuthRouter }
