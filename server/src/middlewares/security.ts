import { Request, Response, NextFunction } from 'express'
import { AUTH_FAILURE_CODES } from '../auth/strategies/strategyTypes.js'
import { resolveAuthenticatedUserForRequest } from '../auth/resolveAuthenticatedUser.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('middleware.requireAuth')

const AUTH_401_MESSAGE = 'Authentication required'
const AUTH_500_MESSAGE = 'Authentication check failed'

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
    logger.error('requireAuth async failure:', error)
    next(error)
  })
}

/**
 * Require Role Middleware Factory (Stub)
 *
 * ENACTMENT(Feature 7): Replace stub with real role verification.
 * Currently passes all requests through. When enacted, should:
 *   1. Read user role from req.user.role (set by requireAuth)
 *   2. Check if user's role is in the allowed roles list
 *   3. Return 403 if user lacks the required role
 *
 * Usage: router.patch('/appointments/:id', requireRole('admin'), handler)
 *
 * @param _roles - Role names that are allowed access (e.g. 'admin', 'manager')
 * @see docs/SECURITY_STUBS.md
 */
export function requireRole(..._roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
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
