<!-- harness-planning-rollup tier=session id=8.5.1 consolidatedAt=2026-03-24T22:18:02.790Z -->

# Consolidated planning: session 8.5.1

## Session 8.5.1 (parent)

## Goal

Audit current Helmet defaults, tune HSTS and referrer policy for production safety, and document the configuration in SECURITY_STUBS. Session 8.5.2 will add CSP separately.

## Files

- `server/src/app.ts` — Helmet middleware; add options object to `helmet()`
- `server/docs/SECURITY_STUBS.md` — add "Security headers (Helmet)" section with config and rationale

## Approach

1. **Audit:** Review Helmet v8 defaults (hsts, referrerPolicy, etc.); identify directives that may need tuning for API-only vs SPA use.
2. **Configure:** Replace `app.use(helmet())` with `app.use(helmet({ ... }))`; enable HSTS with maxAge, includeSubDomains, preload for production; set referrerPolicy (e.g. strict-origin-when-cross-origin); keep other defaults unless compatibility requires relaxation.
3. **Document:** Add "Security headers (Helmet)" section to SECURITY_STUBS with config summary and verification steps.

## Checkpoint

- Helmet configured with HSTS and referrer policy options
- App starts and API responds; no regression in existing behavior
- SECURITY_STUBS updated with Helmet section

---

## Task 8.5.1.1 (source: task-8.5.1.1-planning.md)

### Goal

Replace `app.use(helmet())` with a configured Helmet options object: enable HSTS (maxAge, includeSubDomains, preload) and set referrerPolicy to `strict-origin-when-cross-origin`. Verify the app starts and API responds.

### Files

- `server/src/app.ts` — Helmet middleware; pass options to `helmet()`

### Approach

1. Replace `app.use(helmet())` with `app.use(helmet({ hsts: {...}, referrerPolicy: {...} }))`.
2. **HSTS:** `{ maxAge: 31536000, includeSubDomains: true, preload: true }` — 1 year, subdomains, preload list eligible. Helmet skips HSTS when not HTTPS; production reverse proxy enforces HTTPS.
3. **referrerPolicy:** `{ policy: 'strict-origin-when-cross-origin' }` — safe default; full URL only for same-origin; origin-only for cross-origin HTTPS→HTTP.
4. Keep other Helmet defaults (contentSecurityPolicy, etc.); Session 8.5.2 will add CSP.
5. Verify: `npm run start:dev` and `curl -I http://localhost:3001/` to confirm headers.

### Checkpoint

- Helmet called with explicit hsts and referrerPolicy options
- App starts; `curl -I` or browser shows `Strict-Transport-Security` and `Referrer-Policy` when applicable
---

---

## Task 8.5.1.2 (source: task-8.5.1.2-planning.md)

### Goal

Add a "Security headers (Helmet)" section to SECURITY_STUBS documenting the Helmet config (hsts, referrerPolicy), rationale, and verification steps.

### Files

- `server/docs/SECURITY_STUBS.md` — add new section after "Inbound rate limiting" or in logical order

### Approach

1. Add "## Security headers (Helmet)" section to SECURITY_STUBS.
2. Document: location (app.ts), configured options (hsts: maxAge 31536000, includeSubDomains, preload; referrerPolicy: strict-origin-when-cross-origin), rationale for each.
3. Add verification steps: `curl -I http://localhost:3001/` and/or browser DevTools Network tab; list expected headers (Strict-Transport-Security, Referrer-Policy).
4. Note: HSTS is applied when HTTPS; Referrer-Policy always. Session 8.5.2 will add CSP.

### Checkpoint

- SECURITY_STUBS has "Security headers (Helmet)" section with config, rationale, and verification
---

---
