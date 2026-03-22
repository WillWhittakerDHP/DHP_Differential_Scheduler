# Feature 8: Security Hardening — Guide

**Feature Number:** 8
**Status:** In Progress
**Branch:** feature/security-hardening

---

## Overview

Protect the API and data before exposing it to external users. Covers CORS, rate limiting, request validation, secrets audit, security headers, and CSRF protection.

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
