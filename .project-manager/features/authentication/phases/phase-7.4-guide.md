# Phase 7.4: Client-side authentication

**Feature:** authentication  
**Tier:** Phase  
**Status:** Active  

## Purpose

Wire the Vue client to **session cookies** (`httpOnly`, same-site) issued by Phase 7.2–7.3: magic-link request, verify, `session/me`, and logout. Replace legacy `accessToken` / `userData` cookie assumptions where they conflict.

## Dependencies

- Phase 7.3 magic-link API: `POST /api/v1/internal/auth/magic-link/request`, `GET /api/v1/internal/auth/magic-link/verify`
- Vite dev proxy: `/api` → server (cookies on shared `localhost` host)

## Sessions

| Session | Focus |
|---------|--------|
| [7.4.1](sessions/session-7.4.1-guide.md) | API client `withCredentials`, auth API helpers |
| [7.4.2](sessions/session-7.4.2-guide.md) | Pinia auth store, `/login`, verify callback route, router |
| [7.4.3](sessions/session-7.4.3-guide.md) | Logout alignment (`useLogout`), optional admin prefetch of session |

## Success criteria

- [ ] Unauthenticated user can open `/login`, request magic link, complete verify (token in query), land logged-in with `session/me` succeeding.
- [ ] Logout clears server session and client auth state; navigation sane for admin layout.
- [ ] `axios` uses `withCredentials: true` for internal API base URL.

## References

- Server: `server/src/routes/internal/auth/authRouter.ts`, `server/src/auth/sessionCookie.ts`
- Client: `client/src/utils/api/apiClientCore.ts`, `client/src/router/index.ts`
