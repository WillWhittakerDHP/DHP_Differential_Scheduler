import { timingSafeEqual } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { AUTH_FAILURE_CODES } from '../auth/strategies/strategyTypes.js'
import { resolveAuthenticatedUserForRequest } from '../auth/resolveAuthenticatedUser.js'
import { getAuthSessionBySid } from '../auth/sessionManager.js'
import { getSessionIdFromRequest } from '../auth/sessionCookie.js'
import { createLogger } from '../utils/logger.js'
import { CSRF_HEADER_NAME, readStoredCsrfToken } from './csrfIssuance.js'
import { runOwnershipCheck } from './ownershipEnforcement.js'

const authLogger = createLogger('middleware.requireAuth')
const roleLogger = createLogger('middleware.requireRole')
const csrfLogger = createLogger('middleware.csrfProtection')
const ownershipLogger = createLogger('middleware.checkOwnership')

const AUTH_401_MESSAGE = 'Authentication required'
const AUTH_500_MESSAGE = 'Authentication check failed'
const ROLE_403_MESSAGE = 'Insufficient permissions'
const CSRF_403_MESSAGE = 'CSRF validation failed'

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * WHY: Validates `X-CSRF-Token` against `Session.sess.csrfToken` for unsafe methods.
 * Issuance: `ensureCsrfTokenAttached` in `csrfIssuance.ts`. No session cookie → skip (login / magic-link POST
 * before first session); session without stored token → 403 (client should GET once to mint token).
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase()
  if (SAFE_HTTP_METHODS.has(method)) {
    next()
    return
  }

  void (async () => {
    const sid = getSessionIdFromRequest(req)
    if (sid === null) {
      next()
      return
    }

    const session = await getAuthSessionBySid(sid)
    if (session === null) {
      csrfLogger.warn('csrfProtection: rejected; session cookie present but session row missing')
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: CSRF_403_MESSAGE,
      })
      return
    }

    const stored = readStoredCsrfToken(session.sess)
    if (stored === null) {
      csrfLogger.warn('csrfProtection: rejected; no csrfToken in session (GET once to issue token)')
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: CSRF_403_MESSAGE,
      })
      return
    }

    const headerRaw = req.get(CSRF_HEADER_NAME)
    if (headerRaw === undefined || headerRaw.trim() === '') {
      csrfLogger.warn('csrfProtection: rejected; missing X-CSRF-Token header')
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: CSRF_403_MESSAGE,
      })
      return
    }

    const submitted = headerRaw.trim()
    const a = Buffer.from(stored, 'utf8')
    const b = Buffer.from(submitted, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      csrfLogger.warn('csrfProtection: rejected; token mismatch')
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: CSRF_403_MESSAGE,
      })
      return
    }

    next()
  })().catch((error: unknown) => {
    csrfLogger.error('csrfProtection failed:', error)
    next(error)
  })
}

/**
 * Session-backed auth: HttpOnly session cookie (see `cookieParser` in `app.ts`) → DB `Session` → `User` → `req.user`.
 * Anonymous sessions (no `userId`) receive 401 until a strategy attaches identity (Phase 7.3).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  void (async () => {
    const result = await resolveAuthenticatedUserForRequest(req)
    if (result.status === 'unauthorized') {
      res.status(401).json({
        code: AUTH_FAILURE_CODES.UNAUTHORIZED,
        message: AUTH_401_MESSAGE,
      })
      return
    }
    if (result.status === 'internal_error') {
      res.status(500).json({
        code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
        message: AUTH_500_MESSAGE,
      })
      return
    }
    req.user = result.user
    next()
  })().catch((error: unknown) => {
    authLogger.error('requireAuth async failure:', error)
    next(error)
  })
}

/**
 * Run **after** `requireAuth` on the same route. Returns 403 when `req.user.role` is not in `allowedRoles`.
 * Pass role strings that match `User.userRole` (e.g. shared `USER_ROLE_*` constants).
 */
export function requireRole(
  ...allowedRoles: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  if (allowedRoles.length === 0) {
    roleLogger.warn('requireRole invoked with empty role list; requests will receive 403')
  }
  return (req: Request, res: Response, next: NextFunction): void => {
    if (allowedRoles.length === 0) {
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: ROLE_403_MESSAGE,
      })
      return
    }
    if (req.user === undefined) {
      roleLogger.warn('requireRole used without requireAuth; req.user is missing')
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: ROLE_403_MESSAGE,
      })
      return
    }
    const role = req.user.role
    if (role === undefined || role === '') {
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: ROLE_403_MESSAGE,
      })
      return
    }
    if (!allowedRoles.includes(role)) {
      res.status(403).json({
        code: AUTH_FAILURE_CODES.FORBIDDEN,
        message: ROLE_403_MESSAGE,
      })
      return
    }
    next()
  }
}

/**
 * Check Resource Ownership Middleware Factory
 *
 * Uses `ownershipRegistry.ts` + `ownershipEnforcement.ts` (Phase 8.7.1.2).
 *
 * @param resourceName - Registry key (same string as `checkOwnership('…')` call sites)
 * @param paramKey - `req.params` key for the row id (e.g. `id`, `key`, `typeId`)
 * @param _ownerField - Reserved; owner column comes from the registry (not per-route yet)
 * @see docs/SECURITY_STUBS.md
 */
export function checkOwnership(
  resourceName: string,
  paramKey: string = 'id',
  _ownerField: string = 'userId'
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allowed = await runOwnershipCheck(resourceName, paramKey, req, res, ownershipLogger)
      if (allowed) {
        next()
      }
    } catch (error: unknown) {
      const logger = ownershipLogger
      logger.error('checkOwnership failed:', error)
      next(error)
    }
  }
}
