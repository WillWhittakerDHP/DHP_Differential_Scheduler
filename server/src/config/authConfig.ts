/**
 * WHY: Single read surface for auth-related env — strategies and middleware use this, not raw process.env.
 */

import { envConfig } from './envConfig.js'
import type { AuthStrategyName } from '../auth/strategies/strategyTypes.js'

export interface AuthRuntimeConfig {
  strategy: AuthStrategyName
  sessionCookieName: string
  sessionMaxAgeSec: number
}

export function getAuthConfig(): AuthRuntimeConfig {
  return {
    strategy: envConfig.AUTH_STRATEGY,
    sessionCookieName: envConfig.AUTH_SESSION_COOKIE_NAME,
    sessionMaxAgeSec: envConfig.AUTH_SESSION_MAX_AGE_SEC,
  }
}
