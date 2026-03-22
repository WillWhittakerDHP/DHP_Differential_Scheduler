# Plan: session 8.5.2 — ** ** CSP implementation — add Content-Security-Policy for API and Vue SPA, verify app loads

## Contract
- **Tier:** session | **ID:** 8.5.2
- **Scope:** ** ** CSP implementation — add Content-Security-Policy for API and Vue SPA, verify app loads
- **Governance:** 4 governance highlights — read reports before filling slots

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
Completed Task - Begin Session 8.5.2

## Goal
Add Content-Security-Policy via Helmet for the Express API and Vue SPA; configure CSP directives (default-src, script-src, style-src, connect-src); verify app loads without CSP violations; document CSP in SECURITY_STUBS.

## Files
- `server/src/app.ts` — Add Helmet contentSecurityPolicy option (CSP directives)
- `server/docs/SECURITY_STUBS.md` — Document CSP directives and rationale
- `client/` — Vue SPA (consumes API; CSP may affect script/style/connect sources)

## Approach
1. **Add CSP via Helmet:** Configure `contentSecurityPolicy` in existing `helmet({ ... })`; set default-src, script-src, style-src, connect-src to allow Vue dev/build, API calls, and trusted CDNs (e.g. Google Fonts, Vite).
2. **Tune for API + SPA:** API serves JSON; Vue SPA is separate origin or same-origin depending on proxy. Ensure connect-src includes API base URL; script-src/style-src allow Vite HMR in dev.
3. **Verify:** Run app; check browser console for CSP violations; relax or add sources only if needed.
4. **Document:** Extend SECURITY_STUBS "Security headers" section with CSP directives and tuning notes.

## Checkpoint
- CSP header applied; Vue app loads without CSP violations in browser console
- SECURITY_STUBS updated with CSP section

## How we build the tierDown to achieve them
- **Task 8.5.2.1:** Add CSP directives via Helmet contentSecurityPolicy — default-src, script-src, style-src, connect-src for API and Vue SPA
- **Task 8.5.2.2:** Verify app loads, document CSP in SECURITY_STUBS
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.5-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/session-8.5.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
