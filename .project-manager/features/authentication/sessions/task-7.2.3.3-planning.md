# Plan: task 7.2.3.3 — Auth router and route-tree integration

## Contract
- **Tier:** task | **ID:** 7.2.3.3
- **Scope:** Prove `requireAuth` / `requireRole` on real internal routes under existing auth mount
- **Governance:** Thin handlers; no new strategy logic

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local

## Where we left off
**7.2.3.1** / **7.2.3.2** shipped `requireAuth` and `requireRole`. **`AuthRouter`** is mounted at **`/api/v1/internal/auth`** via `routes/index.ts` (with `authRateLimiter`). **`cookieParser`** is global in `app.ts`.

## Goal
1. Add **at least one read-only GET** on **`authRouter`** that runs **`requireAuth`** and returns a **small JSON** body derived from **`req.user`** (e.g. `id`, `role`) — **no** session ids, cookies, or tokens in the response.
2. Add a **second GET** (optional but recommended) that chains **`requireAuth`** + **`requireRole(USER_ROLE_AGENT)`** (import from `server/src/constants/userRoles.js`) to demonstrate **403** for wrong role — stable JSON only.
3. Keep **`GET /`**, **`POST /login`** as **501** placeholders (Phase **7.3**).
4. Document in module comment where **Phase 7.3** will register strategy handlers (verify magic link, etc.) without reshaping these middleware routes.

**Out of scope:** Magic-link implementation, changing global mount path, client work.

## Files
- **`server/src/routes/internal/auth/authRouter.ts`** — new routes + imports `requireAuth`, `requireRole`, `USER_ROLE_AGENT`.
- **`server/src/routes/index.ts`** — read-only verification: mount already correct; comment only if something about order must be documented.

## Approach
1. Add **`GET /session/me`** (or **`/me`** if shorter — prefer **`/session/me`** to avoid colliding with future resource names): **`requireAuth`**, handler returns **`200`** + `{ userId: req.user.id, role: req.user.role }` (field names explicit for API clarity).
2. Add **`GET /session/agent-ping`**: **`requireAuth`**, **`requireRole(USER_ROLE_AGENT)`**, **`200`** + `{ ok: true }` (minimal).
3. **GET** routes — **no** `csrfProtection` (read-only; aligns with existing GET patterns on API).
4. Top-of-file **WHY / PATTERN** comment: extension points for **7.3**.
5. **`npm run compile && npm run lint`** in **`server/`**.

## Design before execute

```
GET /session/me → requireAuth → 200 { userId, role } | 401 from middleware
GET /session/agent-ping → requireAuth → requireRole(AGENT) → 200 { ok: true } | 401 | 403
```

## Checkpoint
- Unauthenticated **`curl`** to **`/session/me`** → **401** with typed body.
- Authenticated session with user → **200** and body matches **`req.user`**.
- Client-role user hits **`agent-ping`** → **403** `FORBIDDEN`; agent → **200**.
- **`POST /login`** still **501**; server compile + lint clean.

---
## Reference
- `.project-manager/features/authentication/sessions/session-7.2.3-guide.md`
- `.project-manager/features/authentication/sessions/task-7.2.3.2-handoff.md`
- `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
