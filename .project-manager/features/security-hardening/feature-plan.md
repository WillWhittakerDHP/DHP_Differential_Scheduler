# Feature 11: Security Hardening — Feature Plan

**Feature:** Security Hardening
**Status:** 📋 Planning
**Created:** 2026-02-18
**Source:** BETA_LAUNCH_CHECKLIST.md Phase 2

---

## Goal

Protect the API and data before exposing it to any external users, even trusted alpha testers.

---

## Phase 11.1: CORS, Helmet & Rate Limiting

### Checklist

- [ ] **2.1** Implement authentication (Strategy Pattern — see **Phase 2A** / Feature 10 for full details)
  - Shared infrastructure: sessions table, session manager, `requireAuth` middleware
  - Beta: Magic Link strategy (passwordless email verification)
  - Production: Password strategy (email + bcrypt hashed password)
  - Environment-based routing in `server/src/auth/authConfig.ts`
  - Protects all `/api/v1/internal/*` mutation endpoints (POST/PUT/DELETE)
  - Implement in `server/src/middlewares/security.ts` (stubs already wired in)

- [ ] **2.2** Lock down CORS to specific origins
  - Production: Render static site URL only
  - Development: `http://localhost:3002`
  - Use environment variable `CORS_ORIGIN` to configure per environment

- [ ] **2.3** Add API rate limiting for internal routes
  - Install `express-rate-limit`
  - Apply to all `/api/v1/internal/*` routes
  - Suggested: 100 requests per 15 minutes per IP for general routes, 10 per 15 minutes for auth routes

- [ ] **2.6** Add security response headers review
  - Helmet is already installed — verify configuration is production-appropriate
  - Consider adding `Content-Security-Policy` header

---

## Phase 11.2: Input Validation (Joi)

### Checklist

- [ ] **2.4** Add request validation / input sanitization
  - Joi validation on all POST/PUT request bodies (some already exists)
  - Audit all route handlers for missing validation

---

## Phase 11.3: Secrets Audit & CSRF

### Checklist

- [ ] **2.5** Audit environment variables — ensure no secrets in committed files
  - Verify `.gitignore` covers all `.env.*` files (except `.env.example`)
  - Verify `.google-tokens.json` is gitignored
  - Check for any hardcoded credentials in source

- [ ] **2.7** Implement CSRF protection (if using session-based auth)
  - Only needed if using cookies/sessions, not needed for API-key or Bearer token auth

---

## Security Notes for Alpha

Phase 2A (Feature 10) defines the full authentication strategy. For alpha/beta, Magic Link authentication provides email collection, role-based access, and session management without passwords. The critical thing is that the admin panel and mutation endpoints are not publicly accessible — `requireAuth` + `requireRole` middleware handles this. See Feature 10 (Authentication) for implementation details.

---

**Last Updated:** 2026-02-18
