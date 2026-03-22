import { Request, Response, NextFunction } from 'express'

/**
 * WHY: CSRF Protection Middleware (Stub)
WHY: Wires CSRF protection into all st...
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Stub: see docs/SECURITY_STUBS.md
  next()
}

/**
 * Require Authentication Middleware (Stub)
 *
 * ENACTMENT(Feature 7): Replace stub with real JWT/session verification.
 * Currently passes all requests through. When enacted, should:
 *   1. Validate auth token from request header or cookie
 *   2. Attach authenticated user to req.user
 *   3. Return 401 if token is missing or invalid
 *
 * @see docs/SECURITY_STUBS.md
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  next()
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
