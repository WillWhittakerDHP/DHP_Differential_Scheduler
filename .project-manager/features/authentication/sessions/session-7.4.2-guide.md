# Session 7.4.2: Auth store and routes

**Phase:** 7.4  
**Tier:** Session  

## Goal

Pinia (or equivalent) auth state + `/login` + verify handling.

## Tasks

1. `useAuthStore`: `user`, `status` (`unknown` | `guest` | `authenticated`), `refreshSession`, `setGuest`, `setUser`.
2. Views: `LoginView.vue` (email + submit magic link), message UX (anti-enumeration).
3. Route `/login`; route `/auth/verify` reads `token` query, calls verify endpoint, redirects home or admin.
4. `router.beforeEach`: optional prefetch `session/me` for routes that need auth (start with `/admin`).

## Acceptance

- Happy path magic link works end-to-end in local dev (proxy).
