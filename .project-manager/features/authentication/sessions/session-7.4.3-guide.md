# Session 7.4.3: Logout and layout alignment

**Phase:** 7.4  
**Tier:** Session  

## Goal

Single logout path: server `POST /auth/logout` + clear client store.

## Tasks

1. Implement server `POST /api/v1/internal/auth/logout` (revoke session + clear cookie) if missing.
2. Update `useLogout.ts` to call logout API and `useAuthStore` reset instead of legacy cookies only.
3. Ensure `UserProfile.vue` or equivalent uses the composable.

## Acceptance

- After logout, `session/me` returns 401.
