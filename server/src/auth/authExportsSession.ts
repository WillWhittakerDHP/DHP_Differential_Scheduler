/**
 * Session + cookie re-exports (file-cohesion).
 */
export {
  createAuthSession,
  getAuthSessionBySid,
  revokeAuthSession,
  type CreatedAuthSession,
} from './sessionManager.js'
export { clearSessionCookie, getSessionIdFromRequest, setSessionCookie } from './sessionCookie.js'
export { clearAuthSessionWithCookie, issueAuthSessionWithCookie } from './sessionFacade.js'
