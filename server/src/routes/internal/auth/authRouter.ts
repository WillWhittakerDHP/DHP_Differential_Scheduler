/**
 * Internal auth router: `/api/v1/internal/auth/*` (see `routes/index.ts`).
 *
 * PATTERN: Session-backed **`requireAuth`** / **`requireRole`** prove middleware wiring (7.2.3).
 * Phase 7.3: **`POST /magic-link/request`** issues a link; **`GET /magic-link/verify`** consumes token + sets session cookie (no CSRF on email link GET).
 * Keep mutating routes behind **`csrfProtection`** + **`validateRequest`** where applicable.
 */

import { Router, Request, Response } from 'express'
import Joi from 'joi'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { csrfProtection, requireAuth, requireRole } from '../../../middlewares/security.js'
import {
  AUTH_FAILURE_CODES,
  buildAuthPlaceholder501Body,
} from '../../../auth/strategies/strategyTypes.js'
import {
  issueAuthSessionWithCookie,
  magicLinkRequestBodySchema,
  magicLinkStrategy,
  submitMagicLinkRequest,
  type AuthRequestContext,
} from '../../../auth/index.js'
import { getAuthConfig } from '../../../config/authConfig.js'
import { USER_ROLE_AGENT } from '../../../constants/userRoles.js'
import { createLogger } from '../../../utils/logger.js'

const router = Router()
const logger = createLogger('routes.authRouter')

const PLACEHOLDER_MESSAGE = 'Auth routes coming in Feature 7'

const loginBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
}).unknown(true)

const MAGIC_LINK_AUTH_CONTEXT: AuthRequestContext = {}

function httpStatusForMagicLinkVerifyFailure(code: string): number {
  if (code === AUTH_FAILURE_CODES.VALIDATION) {
    return 400
  }
  if (code === AUTH_FAILURE_CODES.UNAUTHORIZED) {
    return 401
  }
  return 500
}

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

/** Current session identity (cookie + DB). Unauthenticated → 401 from `requireAuth`. */
router.get('/session/me', requireAuth, (req: Request, res: Response): void => {
  const u = req.user
  if (u === undefined) {
    logger.warn('session/me reached handler without req.user; requireAuth ordering may be wrong')
    res.status(401).json({
      code: AUTH_FAILURE_CODES.UNAUTHORIZED,
      message: 'Authentication required',
    })
    return
  }
  res.status(200).json({ userId: u.id, role: u.role })
})

/**
 * WHY: Demonstrates `requireRole` after `requireAuth`; non-agent sessions get 403 FORBIDDEN.
 */
router.get(
  '/session/agent-ping',
  requireAuth,
  requireRole(USER_ROLE_AGENT),
  (_req: Request, res: Response): void => {
    res.status(200).json({ ok: true })
  }
)

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

/**
 * Request a magic-link email. Body `{ email }` — valid shape → 200 `{ delivered: true }` (anti-enumeration);
 * validation failures → 400 from `validateRequest`.
 */
router.post(
  '/magic-link/request',
  csrfProtection,
  validateRequest(magicLinkRequestBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const email = typeof req.body.email === 'string' ? req.body.email : ''
      await submitMagicLinkRequest(email)
      res.status(200).json({ delivered: true })
    } catch (err) {
      logger.error('magic-link request handler failed', { err })
      res.status(500).json({
        code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
        message: 'Request failed',
      })
    }
  }
)

/**
 * Consume magic-link token from query `token` (email links). On success sets httpOnly session cookie.
 * No CSRF — users open this URL from email; mutating POST flows stay protected separately.
 */
router.get('/magic-link/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const verifyToken = magicLinkStrategy.verifyToken
    if (verifyToken === undefined) {
      logger.error('magicLinkStrategy.verifyToken is not configured')
      res.status(500).json({
        code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
        message: 'Request failed',
      })
      return
    }
    const rawToken = typeof req.query.token === 'string' ? req.query.token : ''
    const result = await verifyToken(MAGIC_LINK_AUTH_CONTEXT, { token: rawToken })
    if (result.ok) {
      if (result.userId === undefined || result.userId === '') {
        logger.error('magic-link verify returned ok without userId')
        res.status(500).json({
          code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
          message: 'Session establishment failed',
        })
        return
      }
      const created = await issueAuthSessionWithCookie(
        res,
        { strategy: 'magic_link' },
        result.userId
      )
      if (created === null) {
        res.status(500).json({
          code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
          message: 'Session establishment failed',
        })
        return
      }
      res.status(200).json({ ok: true, userId: result.userId })
      return
    }
    const status = httpStatusForMagicLinkVerifyFailure(result.code)
    res.status(status).json({ code: result.code, message: result.message })
  } catch (err) {
    logger.error('magic-link verify handler failed', { err })
    res.status(500).json({
      code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
      message: 'Request failed',
    })
  }
})

export { router as AuthRouter }
