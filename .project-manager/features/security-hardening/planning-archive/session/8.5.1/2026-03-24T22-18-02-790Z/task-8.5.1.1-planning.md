# Plan: task 8.5.1.1 — 8.5.1.1

## Contract
- **Tier:** task | **ID:** 8.5.1.1
- **Scope:** 8.5.1.1
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Session 8.5.1 just started. Task 8.5.1.2 will document in SECURITY_STUBS.

## Goal
Replace `app.use(helmet())` with a configured Helmet options object: enable HSTS (maxAge, includeSubDomains, preload) and set referrerPolicy to `strict-origin-when-cross-origin`. Verify the app starts and API responds.

## Files
- `server/src/app.ts` — Helmet middleware; pass options to `helmet()`

## Approach
1. Replace `app.use(helmet())` with `app.use(helmet({ hsts: {...}, referrerPolicy: {...} }))`.
2. **HSTS:** `{ maxAge: 31536000, includeSubDomains: true, preload: true }` — 1 year, subdomains, preload list eligible. Helmet skips HSTS when not HTTPS; production reverse proxy enforces HTTPS.
3. **referrerPolicy:** `{ policy: 'strict-origin-when-cross-origin' }` — safe default; full URL only for same-origin; origin-only for cross-origin HTTPS→HTTP.
4. Keep other Helmet defaults (contentSecurityPolicy, etc.); Session 8.5.2 will add CSP.
5. Verify: `npm run start:dev` and `curl -I http://localhost:3001/` to confirm headers.

## Checkpoint
- Helmet called with explicit hsts and referrerPolicy options
- App starts; `curl -I` or browser shows `Strict-Transport-Security` and `Referrer-Policy` when applicable
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
