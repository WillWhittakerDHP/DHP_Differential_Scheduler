<!-- harness-planning-rollup tier=phase id=8.5 consolidatedAt=2026-03-24T22:18:02.801Z -->

# Consolidated planning: phase 8.5

## Phase 8.5 (parent)

## Goal

Harden HTTP security headers for the Express API and Vue SPA: (1) review and tune Helmet configuration (HSTS, referrer policy, safe defaults); (2) add Content-Security-Policy suited for the API + Vue frontend; (3) document patterns in SECURITY_STUBS. Ensure the app continues to load and function after changes.

## Files

- `server/src/app.ts` — Helmet middleware and security header configuration
- `server/src/**` — any route or middleware that serves HTML or affects headers
- `client/` or `frontend/` — Vue SPA entry, meta tags, or CSP-related config if applicable
- `.project-manager/features/security-hardening/**/SECURITY_STUBS*` — document security header patterns and CSP directives
- `LAUNCH_CHECKLIST.md` — update security header item if complete

## Approach

1. **Helmet audit:** Review current `app.use(helmet())` defaults; tune HSTS (maxAge, includeSubDomains, preload), referrerPolicy, and other directives; disable or relax only where needed for app compatibility.
2. **CSP implementation:** Add Content-Security-Policy via Helmet's contentSecurityPolicy option; configure default-src, script-src, style-src, connect-src for API and Vue SPA; use nonces or hashes if inline scripts/styles exist; verify Vue app loads.
3. **Documentation:** Add "Security headers" section to SECURITY_STUBS with Helmet config, CSP directives, and tuning rationale.

## Checkpoint

- Helmet configured with HSTS, referrer policy, and safe defaults
- CSP header applied and verified; Vue app loads without CSP violations
- SECURITY_STUBS updated with security headers section

---

## Session 8.5.1 (source: session-8.5.1-planning.md)

### Goal

Audit current Helmet defaults, tune HSTS and referrer policy for production safety, and document the configuration in SECURITY_STUBS. Session 8.5.2 will add CSP separately.

### Files

- `server/src/app.ts` — Helmet middleware; add options object to `helmet()`
- `server/docs/SECURITY_STUBS.md` — add "Security headers (Helmet)" section with config and rationale

### Approach

1. **Audit:** Review Helmet v8 defaults (hsts, referrerPolicy, etc.); identify directives that may need tuning for API-only vs SPA use.
2. **Configure:** Replace `app.use(helmet())` with `app.use(helmet({ ... }))`; enable HSTS with maxAge, includeSubDomains, preload for production; set referrerPolicy (e.g. strict-origin-when-cross-origin); keep other defaults unless compatibility requires relaxation.
3. **Document:** Add "Security headers (Helmet)" section to SECURITY_STUBS with config summary and verification steps.

### Checkpoint

- Helmet configured with HSTS and referrer policy options
- App starts and API responds; no regression in existing behavior
- SECURITY_STUBS updated with Helmet section

---

---

## Session 8.5.2 (source: session-8.5.2-planning.md)

### Goal

Add Content-Security-Policy via Helmet for the Express API and Vue SPA; configure CSP directives (default-src, script-src, style-src, connect-src); verify app loads without CSP violations; document CSP in SECURITY_STUBS.

### Files

- `server/src/app.ts` — Add Helmet contentSecurityPolicy option (CSP directives)
- `server/docs/SECURITY_STUBS.md` — Document CSP directives and rationale
- `client/` — Vue SPA (consumes API; CSP may affect script/style/connect sources)

### Approach

1. **Add CSP via Helmet:** Configure contentSecurityPolicy in existing helmet({ ... }); set default-src, script-src, style-src, connect-src to allow Vue dev/build, API calls, and trusted CDNs (e.g. Google Fonts, Vite).
2. **Tune for API + SPA:** API serves JSON; Vue SPA is separate origin or same-origin depending on proxy. Ensure connect-src includes API base URL; script-src/style-src allow Vite HMR in dev.
3. **Verify:** Run app; check browser console for CSP violations; relax or add sources only if needed.
4. **Document:** Extend SECURITY_STUBS "Security headers" section with CSP directives and tuning notes.

### Checkpoint

- CSP header applied; Vue app loads without CSP violations in browser console
- SECURITY_STUBS updated with CSP section

---
