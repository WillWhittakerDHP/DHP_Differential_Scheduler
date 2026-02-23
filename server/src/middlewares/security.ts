/**
 * WHY: Security Middleware
LEARNING: Security middleware stubs for CSRF protect...
 */
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
 *
 * @see docs/SECURITY_STUBS.md
 */
function _requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Stub: see docs/SECURITY_STUBS.md
  next()
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

