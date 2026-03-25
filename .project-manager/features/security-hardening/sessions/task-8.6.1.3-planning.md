# Plan: task 8.6.1.3 — Docs and handoff for Session 8.6.2 (Vue CSRF)

## Contract
- **Tier:** task | **ID:** 8.6.1.3
- **Scope:** Documentation and transition context only — no new CSRF logic (8.6.1.1–8.6.1.2 shipped code)
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** docs
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Tasks **8.6.1.1** (issuance) and **8.6.1.2** (validation) are complete. **`server/docs/SECURITY_STUBS.md`** already describes issuance + validation; this task tightens the **Vue-facing contract** and verification checklist for **Session 8.6.2**.

## Goal
Make **`server/docs/SECURITY_STUBS.md`** the single reference for the Vue team: exact **cookie name**, **header name**, **when CSRF is skipped**, **`fetch`/`axios` expectations** (credentials: `include` for cookie + header on mutating methods), and a short **“Session 8.6.2 checklist”**. Confirm **`server/.env.example`** needs **no** new vars (CSRF uses code constants from `csrfIssuance.ts`, not env). Optionally add one line in **`task-8.6.1.3-handoff.md`** (harness) pointing at the doc section — no duplicate prose in planning.

## Files
- `server/docs/SECURITY_STUBS.md` — add/refine **Vue / SPA integration (Session 8.6.2)** subsection: constants to import or mirror (`CSRF_TOKEN_COOKIE_NAME`, `CSRF_HEADER_NAME` from `server/src/middlewares/csrfIssuance.ts`), `credentials: 'include'`, order of operations (GET or any safe request with session → cookie set → read `csrf_token` → attach header on POST/PUT/PATCH/DELETE)
- `server/.env.example` — touch only if audit shows a gap; expect **no change**

## Approach
1. Read current CSRF sections in `SECURITY_STUBS.md` to avoid duplication; extend rather than repeat tables.
2. Add explicit **TypeScript constant paths** and **example pseudo-code** for Vue (comment-only in doc, not executable in this task).
3. State **breaking change:** admin/booking CRUD from the SPA will **403** until 8.6.2 sends `X-CSRF-Token`.
4. Manual verify: re-read doc as if you were a new client dev — can you implement without opening `security.ts`?

## Checkpoint
- `SECURITY_STUBS.md` contains a clear 8.6.2-oriented checklist and names matching `csrfIssuance.ts` exports
- No erroneous `docs/SECURITY_STUBS.md` path (server doc lives under **`server/docs/`**)
- `server/.env.example` unchanged unless a real env knob was added (it was not for CSRF)

## Design Before Execute
- Subsection title: **Vue SPA (Session 8.6.2) — CSRF header wiring**
- Bullets: import paths; `document.cookie` vs reading from response (cookie set by server on prior request); mutating methods list; link to `createCrudRouter` applying `csrfProtection`

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.6.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.6.1.2-handoff.md`
- Code constants: `server/src/middlewares/csrfIssuance.ts`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
