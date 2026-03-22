# Feature 8: Security Hardening — Guide

**Feature Number:** 8
**Status:** In Progress
**Branch:** feature/security-hardening

---

## Overview

Protect the API and data before exposing it to external users. Covers CORS, rate limiting, request validation, secrets audit, security headers, and CSRF protection. Scope aligns with Feature 8 in PROJECT_PLAN and LAUNCH_CHECKLIST security phases; inbound protection can land before Feature 7, while real CSRF and ownership enforcement follow session-based auth.

## Architecture

Express app hardening layered on existing routers: `cors()` locked to configured origins, `express-rate-limit` on internal and stricter limits on auth routes, Joi (or aligned validators) on request bodies, Helmet with production CSP/HSTS tuning, expanded `.env.example` and secrets hygiene. `createCrudRouter` already applies `csrfProtection` and `checkOwnership` stubs—replacing stub implementations in `security.ts` activates them across CRUD without per-route edits once sessions and `req.user` exist (Feature 7).

## Implementation Plan

Complete **8.1** CORS and **8.2** inbound rate limiting, then **8.3** request validation, **8.4** secrets audit, **8.5** Helmet/CSP. Defer **8.6–8.7** CSRF and ownership **real** implementations until Feature 7 delivers sessions and user identity, per PROJECT_PLAN dependencies.

## Phase Breakdown

- **Phase 8.1:** CORS origin wiring — lock down CORS to specific origins (complete)
- **Phase 8.2:** Inbound rate limiting — general + auth-route limiters (complete)
- **Phase 8.3:** Request validation / input sanitization — Joi on POST/PUT bodies
- **Phase 8.4:** Secrets audit — audit env vars, no secrets in committed files
- **Phase 8.5:** Security headers — Helmet, CSP
- **Phase 8.6–8.7:** CSRF protection (depends on Feature 7 Authentication)

## Related Documents

- Feature README: `README.md`
- LAUNCH_CHECKLIST: `../../../LAUNCH_CHECKLIST.md`
