/**
 * PATTERN: Public server auth surface — types + config readers for routes and future strategies.
 */

export type {
  AuthFailureCode,
  AuthOpResult,
  AuthPlaceholder501Json,
  AuthPlaceholder501Meta,
  AuthRequestContext,
  AuthStrategy,
  AuthStrategyName,
  RequestLoginInput,
  VerifyTokenInput,
} from './strategies/strategyTypes.js'
export { AUTH_FAILURE_CODES, buildAuthPlaceholder501Body } from './strategies/strategyTypes.js'
export { getAuthConfig, type AuthRuntimeConfig } from '../config/authConfig.js'
export {
  createAuthSession,
  getAuthSessionBySid,
  revokeAuthSession,
  type CreatedAuthSession,
} from './sessionManager.js'
