# Plan: phase 8.5 — 8.5

## Contract
- **Tier:** phase | **ID:** 8.5
- **Scope:** 8.5
- **Governance:** 2 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase 8.4 completed with sessions: 8.4.1, 8.4.2. The server already uses Helmet (`app.use(helmet())`) with default config only — no custom CSP, HSTS tuning, or referrer policy.

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

## How we build the tierDown to achieve them
- **Session 8.5.1:** Helmet configuration — audit defaults, tune HSTS/referrer policy, document in SECURITY_STUBS
- **Session 8.5.2:** CSP implementation — add Content-Security-Policy for API and Vue SPA, verify app loads
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/phases/phase-8.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
