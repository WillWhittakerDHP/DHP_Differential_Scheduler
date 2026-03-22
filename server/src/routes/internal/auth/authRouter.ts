/**
 * Placeholder auth router for /api/v1/internal/auth/*.
 * Login routes will be added in Feature 7 (Authentication).
 */

import { Router, Request, Response } from 'express'
import { csrfProtection } from '../../../middlewares/security.js'

const router = Router()

/** Placeholder: Auth routes coming in Feature 7 */
router.get('/', (_req: Request, res: Response): void => {
  res.status(501).json({ message: 'Auth routes coming in Feature 7' })
})

/** Placeholder login endpoint — real implementation in Feature 7 sessions. */
router.post(
  '/login',
  csrfProtection,
  (_req: Request, res: Response): void => {
    res.status(501).json({ message: 'Auth routes coming in Feature 7' })
  }
)

export { router as AuthRouter }
