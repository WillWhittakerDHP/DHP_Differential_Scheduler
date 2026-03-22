# Feature 8: Security Hardening

**Feature Number:** 8
**Status:** 📋 Planning
**Created:** 2026-02-18
**Branch:** feature/security-hardening
**Depends On:** LAUNCH_CHECKLIST.md Phase 2; Authentication (Feature 7) for Phases 8.6–8.7

---

## Overview

Protect the API and data before exposing it to any external users, even trusted alpha testers. Covers CORS lockdown, rate limiting, request validation, secrets audit, security headers (Helmet), and CSRF protection when using session-based auth.

## Key Objectives

1. Lock down CORS to specific origins (Render static site URL, localhost for dev)
2. Add API rate limiting for internal and auth routes
3. Add request validation / input sanitization (Joi on all POST/PUT bodies)
4. Audit environment variables and ensure no secrets in committed files
5. Review security response headers (Helmet, CSP)
6. Implement CSRF protection if using session-based auth

## Related Documents

- **Feature Guide:** `feature-security-hardening-guide.md`
- **Checklist (todo layer):** `../../../LAUNCH_CHECKLIST.md` — Phase 2
- **Authentication (Phases 8.6–8.7):** `../authentication/` — Feature 7

---

**Last Updated:** 2026-02-18
