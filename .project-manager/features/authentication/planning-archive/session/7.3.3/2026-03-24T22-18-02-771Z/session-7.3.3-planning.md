# Plan: session 7.3.3 — Verify route and session establishment

## Contract
- **Tier:** session | **ID:** 7.3.3
- **Scope:** Server **verify** endpoint(s): validate raw token via `magicLinkStrategy.verifyToken`, create DB session and **httpOnly** cookie on success, structured errors and logging on failure. Request-link and delivery are done in 7.3.2; full Vue `/auth/verify` UX stays in 7.4.
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
Completed session 7.3.2 (request route + delivery). `buildMagicLinkVerifyUrl` points at the **client** path `/auth/verify?token=`; this session adds the **API** path that actually consumes the token and sets the session cookie (browser may call it from the app or via redirect flow later).

## Goal
Complete the magic-link **consume** path on the server: expose a **GET** (and optionally **POST**) route under **`/api/v1/internal/auth`** that accepts the raw token, delegates to **`magicLinkStrategy.verifyToken`**, on success calls **`issueAuthSessionWithCookie`** so **`requireAuth`** works on subsequent requests. Return **JSON** with stable **`AUTH_FAILURE_CODES`** (or agreed shapes) for invalid/expired/consumed links; **`createLogger`** on unexpected paths. No silent failures.

## Files
- **`server/src/routes/internal/auth/authRouter.ts`** — verify route(s); thin handlers.
- **`server/src/auth/sessionFacade.ts`** / **`server/src/auth/index.ts`** — reuse **`issueAuthSessionWithCookie`** (and types as needed).
- **`server/src/auth/strategies/magicLinkStrategy.ts`** — already implements **`verifyToken`**; route imports **`magicLinkStrategy`** (or factory export).
- **`server/.env.example`** — any new flags only if needed (e.g. post-verify redirect base); otherwise document smoke URL for verify API.
- **Planning / handoff:** this file, session guide updates after tasks.

## Approach
1. **Task 7.3.3.1:** Add **`GET /magic-link/verify`** (full path **`/api/v1/internal/auth/magic-link/verify`**) with **`token`** query param (email links use query strings; **no CSRF** on GET link-open — do not reuse **`csrfProtection`** for this GET). Validate non-empty token → **`verifyToken`** → on **`ok`**, **`issueAuthSessionWithCookie`** with `userId` from result → **200** JSON (e.g. `{ ok: true, userId }` minimal). On strategy failure, map to **401**/**400** with **`code`** from **`AUTH_FAILURE_CODES`** and safe **`message`**.
2. **Task 7.3.3.2:** Hardening and docs: align error JSON shape with existing auth responses; ensure **`logger.warn`**/**`error`** where appropriate; document manual smoke (curl/browser) and relationship to client **`/auth/verify`** in session log or `.env.example` notes; **`npm run lint`** (server) clean.

## Checkpoint
- Valid token from **`issueMagicLinkForEmail` + request flow** → verify route returns **200**, **`Set-Cookie`** present, **`GET /session/me`** with that cookie returns **200** with user id.
- Bad/missing token → **4xx** JSON with **`code`**, no cookie set.
- Server lint and compile pass.

## How we build the tierDown to achieve them
- **Task 7.3.3.1:** Magic-link verify route + `issueAuthSessionWithCookie` on success.
- **Task 7.3.3.2:** Structured errors, logging, env/smoke documentation.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.3-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/session-7.3.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
