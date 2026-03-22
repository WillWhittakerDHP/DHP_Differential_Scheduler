# Plan: session 8.5.1 — ** ** Helmet configuration — audit defaults, tune HSTS/referrer policy, document in SECURITY_STUBS

## Contract
- **Tier:** session | **ID:** 8.5.1
- **Scope:** ** ** Helmet configuration — audit defaults, tune HSTS/referrer policy, document in SECURITY_STUBS
- **Governance:** 3 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase 8.5 just started. Session 8.5.1 focuses on Helmet only (CSP is Session 8.5.2). Server uses `app.use(helmet())` with defaults; no HSTS or referrer policy tuning.

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

## How we build the tierDown to achieve them
- **Task 8.5.1.1:** Helmet config — replace default call with options (HSTS, referrerPolicy); verify app starts
- **Task 8.5.1.2:** SECURITY_STUBS documentation — add Security headers (Helmet) section with config and verification
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.5-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
