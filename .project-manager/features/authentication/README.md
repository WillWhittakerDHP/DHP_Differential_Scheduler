# Feature 7: Authentication

**Feature Number:** 7
**Status:** 📋 Planning
**Created:** 2026-02-18
**Branch:** TBD
**Depends On:** BETA_LAUNCH_CHECKLIST.md Phase 2A

---

## Overview

Pluggable authentication using a Strategy Pattern: Magic Link for beta/development (passwordless, email-based) and Email + Password for production. Shared session infrastructure (PostgreSQL sessions table, httpOnly cookies, requireAuth middleware) is built once; the swap between strategies is environment-driven with zero rework of middleware, stores, or API contracts.

## Key Objectives

1. Collect user data during beta via magic link (email-only sign-in)
2. Enable role-based access (admin panel restricted to agent/transaction_manager)
3. Auto-populate returning users and tie feedback/appointments to identity
4. Build architecture that swaps to password auth for production via config alone
5. Session tokens in PostgreSQL (revocable, no JWT/signing infrastructure)

## Architecture Summary

- **Shared:** sessions table, sessionManager, requireAuth middleware, authRouter, Pinia auth store, Vue Router guards
- **Magic Link (beta):** magic_links table, MagicLinkStrategy, emailService, MagicLinkForm.vue, MagicLinkVerifyView.vue
- **Password (production, deferred):** login table, PasswordStrategy, PasswordLoginForm.vue — implement when transitioning from beta

## Key Files (to be created)

### Server
- `server/src/auth/sessionManager.ts`, `authConfig.ts`, `authRouter.ts`, `emailService.ts`
- `server/src/auth/strategies/strategyTypes.ts`, `magicLinkStrategy.ts`, `passwordStrategy.ts` (skeleton)
- `server/src/db/models/auth/Session.ts`, `MagicLink.ts`
- `server/src/db/migrations/20260219_100000_create_auth_tables.mjs`

### Client
- `client/src/stores/auth.ts`
- `client/src/views/auth/AuthView.vue`, `MagicLinkForm.vue`, `MagicLinkVerifyView.vue`

## Related Documents

- **Feature Guide (full spec):** `feature-authentication-guide.md`
- **Checklist (todo layer):** `../../../BETA_LAUNCH_CHECKLIST.md` — Phase 2A

---

**Last Updated:** 2026-02-18
