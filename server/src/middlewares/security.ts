import { Request, Response, NextFunction } from 'express'
import { AUTH_FAILURE_CODES } from '../auth/strategies/strategyTypes.js'
import { resolveAuthenticatedUserForRequest } from '../auth/resolveAuthenticatedUser.js'
import { createLogger } from '../utils/logger.js'

const authLogger = createLogger('middleware.requireAuth')
const roleLogger = createLogger('middleware.requireRole')

const AUTH_401_MESSAGE = 'Authentication required'
const AUTH_500_MESSAGE = 'Authentication check failed'
const ROLE_403_MESSAGE = 'Insufficient permissions'

/**
 * WHY: CSRF Protection Middleware (Stub)
WHY: Wires CSRF protection into all st...
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Stub: see docs/SECURITY_STUBS.md
  next()
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
 *
 * @param modelName - Name of the model/resource (for error messages and logging)
 * @param _paramKey - Parameter key to extract ID from (defaults to 'id')
 * @param _ownerField - Field name in model that stores owner ID (defaults to 'userId')
 * @see docs/SECURITY_STUBS.md
 */
export function checkOwnership(
  modelName: string,
  _paramKey: string = 'id',
  _ownerField: string = 'userId'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Stub: see docs/SECURITY_STUBS.md
    next()
  }
}
