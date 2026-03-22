# Plan: task 8.5.1.2 — 8.5.1.2

## Contract
- **Tier:** task | **ID:** 8.5.1.2
- **Scope:** 8.5.1.2
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
Task 8.5.1.1 completed: Helmet configured in server/src/app.ts with HSTS and referrer policy. This task adds documentation only.

## Goal
Add a "Security headers (Helmet)" section to SECURITY_STUBS documenting the Helmet config (hsts, referrerPolicy), rationale, and verification steps.

## Files
- `server/docs/SECURITY_STUBS.md` — add new section after "Inbound rate limiting" or in logical order

## Approach
1. Add "## Security headers (Helmet)" section to SECURITY_STUBS.
2. Document: location (app.ts), configured options (hsts: maxAge 31536000, includeSubDomains, preload; referrerPolicy: strict-origin-when-cross-origin), rationale for each.
3. Add verification steps: `curl -I http://localhost:3001/` and/or browser DevTools Network tab; list expected headers (Strict-Transport-Security, Referrer-Policy).
4. Note: HSTS is applied when HTTPS; Referrer-Policy always. Session 8.5.2 will add CSP.

## Checkpoint
- SECURITY_STUBS has "Security headers (Helmet)" section with config, rationale, and verification
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.5.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
