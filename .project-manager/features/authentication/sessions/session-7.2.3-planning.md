# Plan: session 7.2.3 — Middleware and Router Integration

## Contract
- **Tier:** session | **ID:** 7.2.3
- **Scope:** Middleware and Router Integration
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
Completed Task - Begin Session 7.2.3 <!-- harness-across-ladder:start -->

## Goal
Wire **7.2.2** session persistence into Express so protected routes can reuse one boundary:

1. **Real `requireAuth`** — read session id from the HttpOnly cookie, load the DB row, require a **logged-in user** (`Session.userId`), attach **`req.user`** (`id`, `role` from `User.userRole`), respond **401** with typed JSON on failure (no silent pass-through).
2. **Real `requireRole`** — factory middleware that checks **`req.user.role`** against allowed roles and returns **403** when missing (depends on `requireAuth` running first).
3. **Router integration** — keep **`authRouter`** on **`/api/v1/internal/auth`** as the extension surface; add a minimal **authenticated internal route** (e.g. session/me-style) to prove middleware + mount order; **login/magic-link stays 501 / Phase 7.3** unless explicitly scoped.

**Out of scope for this session:** Implementing magic-link or password verification, Pinia/Vue guards, Google OAuth.

## Files
- `server/src/middlewares/security.ts` — replace `requireAuth` / `requireRole` stubs with session-backed implementations.
- `server/src/types/express.d.ts` — extend `Request` only if new fields are needed beyond existing `req.user`.
- `server/src/auth/*` — use `getSessionIdFromRequest`, `getAuthSessionBySid`; optional small helper to map `Session` + `User` → `req.user` (keep middleware thin).
- `server/src/routes/internal/auth/authRouter.ts` — add or adjust routes that demonstrate auth middleware; preserve 501 placeholders for unimplemented strategy flows.
- `server/src/routes/index.ts` (or internal mount) — confirm mount order: `cookieParser` already in `app.ts`; auth routes and any new protected stub routes documented.
- `server/src/config/models.ts` / `User` model — read-only lookup by id for role when attaching `req.user`.

## Approach
1. **Task 7.2.3.1:** Implement async `requireAuth`: cookie → session row → must have `userId` → load `User` → set `req.user = { id, role: userRole }`; use `createLogger` on errors; JSON 401 using `AUTH_FAILURE_CODES.UNAUTHORIZED` (or consistent auth error shape).
2. **Task 7.2.3.2:** Implement `requireRole(...roles)` after `requireAuth`: if `!req.user` or role not in list → 403 + stable message; log unexpected gaps at `warn`/`debug` as appropriate.
3. **Task 7.2.3.3:** Add one documented internal endpoint behind `requireAuth` (and optionally `requireRole`) to validate wiring; update module comments for Phase **7.3** extension points; `npm run compile` + `npm run lint` in `server/` after each task.

## Checkpoint
- Unauthenticated requests to protected stub routes receive **401**; wrong role receives **403**.
- `req.user` matches Express augmentation; no stub `next()` bypass for protected paths using these middlewares.
- Auth router still exposes 501 for strategy-backed login until **7.3**; session cookie + DB session are the source of truth for middleware.
- Server compile and lint clean; governance thresholds respected (extract helpers if middleware grows).

## How we build the tierDown to achieve them
- **Task 7.2.3.1:** Session-backed requireAuth middleware
- **Task 7.2.3.2:** requireRole factory on req.user.role
- **Task 7.2.3.3:** Auth router and route-tree integration
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.2-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/session-7.2.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
