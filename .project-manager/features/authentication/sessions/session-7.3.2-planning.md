# Plan: session 7.3.2 — Request magic link + delivery abstraction

## Contract
- **Tier:** session | **ID:** 7.3.2
- **Scope:** HTTP **request-link** endpoint(s), outbound **delivery** (real email when configured; **structured log / console** in dev), wiring into **`authRouter`**. **No** verify route, **no** session+cookie on consume (session **7.3.3**). Reuse **`issueMagicLinkForEmail`** from 7.3.1.3.
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
Session **7.3.1** delivered token utilities, persistence, and **`magicLinkStrategy`** + **`issueMagicLinkForEmail`**. Phase branch **`phase-7.3`**; next work exposes **request magic link** to clients and delivers the link string without requiring SMTP locally.

## Goal
Ship a **request magic link** flow on the server: validate input (email), resolve or accept identity context as scoped, call **`issueMagicLinkForEmail`**, then **deliver** the magic link URL or raw token via a **small mailer abstraction** — **production path** uses real transport when env is set; **development** uses **`createLogger`** (or structured console) so engineers never need Postfix to test. Responses must not leak whether an email exists (generic success). **Verify** and **Set-Cookie** stay in **7.3.3**.

## Files
- **New:** `server/src/auth/magicLinkDelivery.ts` (or `server/src/services/email/magicLinkMailer.ts`) — `sendMagicLinkMessage({ to, verifyUrlOrBody })` with env switch.
- **Extend:** `server/src/routes/internal/auth/authRouter.ts` — `POST` route(s) for request-link; **`csrfProtection`** + **`validateRequest`** + Joi.
- **Config:** `server/.env.example` — SMTP or API keys only as stubs; document **`APP_BASE_URL`** / verify URL prefix for link building.
- **Use:** `issueMagicLinkForEmail` from `server/src/auth/strategies/magicLinkStrategy.ts` (or barrel `auth/index.ts`).

## Approach
1. **Delivery module:** Define a function (no new npm dependency unless already in `package.json`) — if no mailer, log at **info** with stable message key and **redact** full token in logs; if env enables outbound email later, implement one adapter.
2. **Route:** `POST /api/v1/internal/auth/.../magic-link/request` (exact path aligned with existing auth prefix); body `{ email }`; always return **200** or **202** with neutral message after rate-limit considerations (document if rate-limit deferred).
3. **Link format:** Build verify URL as `${APP_BASE_URL}/auth/verify?token=` + encodeURIComponent(rawToken) (or agreed path for 7.3.3) — single source helper **`buildMagicLinkVerifyUrl(rawToken)`** in auth utils.
4. **Security:** CSRF on POST; never log raw token at **error** level; validation errors **400** with Joi.

## Checkpoint
- Dev: requesting a link logs delivery intent and includes a followable URL in log (or mailer noop output).
- Prod-shaped env: code path exists to call mailer (even if integration tested later).
- No verify/session side effects in this session’s routes.

## How we build the tierDown to achieve them
- **Task 7.3.2.1:** Magic link delivery abstraction — env-gated send vs dev logger; redaction rules.
- **Task 7.3.2.2:** `buildMagicLinkVerifyUrl` helper + `POST` request-link handler calling `issueMagicLinkForEmail` + delivery.
- **Task 7.3.2.3:** Auth router wiring, Joi schemas, `.env.example` / docs, smoke notes (no new tests per project policy).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.3-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/session-7.3.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
