/**
 * Environment helper utilities
 *
 * LEARNING: Centralized NODE_ENV checks using app constants
 * WHY: Uses NODE_ENV from appConstants; single source of truth
 * PATTERN: Use NODE_ENV from appConstants for consistency
 */

import { NODE_ENV } from '../constants/appConstants.js'

export function isProduction(): boolean {
  return process.env.NODE_ENV === NODE_ENV.PRODUCTION
}
