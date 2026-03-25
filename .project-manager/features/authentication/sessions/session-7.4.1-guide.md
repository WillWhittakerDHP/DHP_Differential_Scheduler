# Session 7.4.1: API client credentials mode

**Phase:** 7.4  
**Tier:** Session  

## Goal

Send cookies on same-origin proxied `/api` requests.

## Tasks

1. Set `withCredentials: true` on the shared Axios instance (`apiClientCore.ts`).
2. Add thin `authApi.ts` (or equivalent) for `requestMagicLink`, `verifyMagicLinkToken`, `fetchSessionMe`, `logout` calling `/auth/*` paths.

## Acceptance

- Browser network tab shows `Cookie` header on `/api/v1/internal/auth/session/me` after login.
