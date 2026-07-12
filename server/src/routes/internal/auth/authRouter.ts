/**
 * Internal auth router: `/api/v1/internal/auth/*` (see `routes/index.ts`).
 *
 * PATTERN: Session-backed **`requireAuth`** / **`requireRole`** prove middleware wiring (7.2.3).
 * Phase 7.3: **`POST /magic-link/request`** issues a link; **`GET /magic-link/verify`** consumes token + sets session cookie (no CSRF on email link GET).
 * Keep mutating routes behind **`csrfProtection`** + **`validateRequest`** where applicable.
 */

import { Router, Request, Response, type NextFunction } from 'express'
import Joi from 'joi'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { csrfProtection, requireAuth, requireRole } from '../../../middlewares/security.js'
import {
  AUTH_FAILURE_CODES,
  buildAuthPlaceholder501Body,
} from '../../../auth/strategies/strategyTypes.js'
import {
  clearAuthSessionWithCookie,
  issueAuthSessionWithCookie,
  magicLinkRequestBodySchema,
  magicLinkStrategy,
  submitMagicLinkRequest,
  type AuthRequestContext,
} from '../../../auth/index.js'
import { createCsrfTokenForRequest } from '../../../middlewares/csrfTokens.js'
import { getAuthConfig } from '../../../config/authConfig.js'
import { USER_ROLE_AGENT } from '../../../constants/userRoles.js'
import { describeMagicLinkTokenForLogs } from '../../../auth/magicLinkVerifyDiagnostics.js'
import { loggableErrorFields } from '../../../utils/loggableError.js'
import { createLogger } from '../../../utils/logger.js'

const router = Router()
const logger = createLogger('routes.authRouter')

/** Express may surface `token` as string or string[] when query is duplicated. */
function readMagicLinkQueryToken(req: Request): string {
  const q = req.query.token
  if (typeof q === 'string') {
    return q
  }
  if (Array.isArray(q) && typeof q[0] === 'string') {
    return q[0]
  }
  return ''
}

const PLACEHOLDER_MESSAGE = 'Auth routes coming in Feature 7'

const loginBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
}).unknown(true)

const MAGIC_LINK_AUTH_CONTEXT: AuthRequestContext = {}

/** Issue CSRF secret cookie + token for SPA (safe method; no CSRF header required). */
router.get('/csrf-token', (req: Request, res: Response): void => {
  const token = createCsrfTokenForRequest(req, res)
  res.status(200).json({ csrfToken: token })
})

/** Revoke session and clear session cookie (requires CSRF on POST). */
router.post('/logout', csrfProtection, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await clearAuthSessionWithCookie(req, res)
    res.status(204).send()
  } catch (err: unknown) {
    logger.error('logout handler failed', { err })
    next(err)
  }
})

function httpStatusForMagicLinkVerifyFailure(code: string): number {
  if (code === AUTH_FAILURE_CODES.VALIDATION) {
    return 400
  }
  if (code === AUTH_FAILURE_CODES.UNAUTHORIZED) {
    return 401
  }
  return 500
}

/** WHY: Distinguish expected bad tokens (warn) from persistence / strategy faults (error). */
function logMagicLinkVerifyStrategyFailure(code: string, message: string): void {
  if (code === AUTH_FAILURE_CODES.INTERNAL_ERROR) {
    logger.error('magic-link verify internal failure', { code, message })
    return
  }
  logger.warn('magic-link verify rejected', { code, message })
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

function sendMagicLinkDisabled(res: Response): void {
  const auth = getAuthConfig()
  res.status(501).json(
    buildAuthPlaceholder501Body('Magic link auth is disabled', {
      strategy: auth.strategy,
      sessionCookieName: auth.sessionCookieName,
      sessionMaxAgeSec: auth.sessionMaxAgeSec,
    })
  )
}

function isMagicLinkStrategyActive(): boolean {
  return getAuthConfig().strategy === 'magic_link'
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
    if (!isMagicLinkStrategyActive()) {
      sendMagicLinkDisabled(res)
      return
    }
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
  if (!isMagicLinkStrategyActive()) {
    sendMagicLinkDisabled(res)
    return
  }
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
    const rawToken = readMagicLinkQueryToken(req)
    const tokenDiag =
      rawToken.trim() === '' ? { rawCharLength: 0, sha256HexPrefix: '' } : describeMagicLinkTokenForLogs(rawToken.trim())
    logger.info('magic_link.verify.request', {
      ...tokenDiag,
      queryTokenPresent: rawToken.length > 0,
      expressQueryKeys: Object.keys(req.query),
    })
    const result = await verifyToken(MAGIC_LINK_AUTH_CONTEXT, { token: rawToken })
    if (result.ok) {
      if (result.userId === undefined || result.userId === '') {
        logger.error('magic-link verify returned ok without userId', { ...tokenDiag })
        res.status(500).json({
          code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
          message: 'Session establishment failed',
        })
        return
      }
      logger.info('magic_link.verify.issue_session', { userId: result.userId, ...tokenDiag })
      const created = await issueAuthSessionWithCookie(
        res,
        { strategy: 'magic_link' },
        result.userId
      )
      if (created === null) {
        logger.error('magic-link verify session persist failed', {
          userId: result.userId,
          ...tokenDiag,
        })
        res.status(500).json({
          code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
          message: 'Session establishment failed',
        })
        return
      }
      logger.info('magic_link.verify.success', {
        userId: result.userId,
        sessionSidPrefix: created.sid.slice(0, 8),
        ...tokenDiag,
      })
      res.status(200).json({ ok: true, userId: result.userId })
      return
    }
    logMagicLinkVerifyStrategyFailure(result.code, result.message)
    const status = httpStatusForMagicLinkVerifyFailure(result.code)
    logger.info('magic_link.verify.response', {
      httpStatus: status,
      strategyCode: result.code,
      ...tokenDiag,
    })
    res.status(status).json({ code: result.code, message: result.message })
  } catch (err: unknown) {
    logger.error('magic-link verify handler failed', {
      ...loggableErrorFields(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    res.status(500).json({
      code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
      message: 'Request failed',
    })
  }
})

export { router as AuthRouter }
