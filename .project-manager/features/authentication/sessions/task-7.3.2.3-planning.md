# Plan: task 7.3.2.3 — Magic link request route

## Contract
- **Tier:** task | **ID:** 7.3.2.3
- **Scope:** Expose `submitMagicLinkRequest` on the internal auth API with CSRF + Joi validation; align path with `routes/index.ts` mount; document smoke steps.
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
Prior tasks delivered `magicLinkRequestBodySchema`, `submitMagicLinkRequest`, and delivery helpers. This task only wires the HTTP surface.

## Goal
Add **`POST /api/v1/internal/auth/magic-link/request`** (full path: `ROUTE_PATHS.API` + `v1` + `internal/auth` + route segment). Body `{ email }` validated with **`magicLinkRequestBodySchema`**; **`csrfProtection`** + **`validateRequest`**; handler delegates to **`submitMagicLinkRequest`** and returns **200** `{ delivered: true }`. Log unexpected errors; **500** with **`AUTH_FAILURE_CODES.INTERNAL_ERROR`**. Clarify **`APP_BASE_URL`** in `.env.example` for magic-link verify URLs.

## Files
- **`server/src/routes/internal/auth/authRouter.ts`** — new `POST` route; thin handler; imports from **`../../../auth/index.js`**.
- **`server/.env.example`** — one-line note that **`APP_BASE_URL`** is also used for magic-link verify links (Feature 7.3).

## Approach
1. Import **`magicLinkRequestBodySchema`**, **`submitMagicLinkRequest`** from auth barrel.
2. Register **`router.post('/magic-link/request', csrfProtection, validateRequest(magicLinkRequestBodySchema), async handler)`** — same middleware order as **`/login`**.
3. Handler: `await submitMagicLinkRequest(req.body.email)` → `res.status(200).json({ delivered: true })`; **`catch`**: **`logger.error`** + **500** `{ code: INTERNAL_ERROR, message }`.
4. Update file header comment to mention the magic-link request route.

## Checkpoint
- **Smoke (dev, `MAGIC_LINK_DELIVERY_MODE=log`):** `curl -X POST http://localhost:3001/api/v1/internal/auth/magic-link/request` with CSRF cookie/header as other mutating routes require — or use the client once wired; expect **200** and **`{ "delivered": true }`**; server log shows delivery (redacted) per **`sendMagicLinkDelivery`**.
- **Validation:** malformed body → **400** from **`validateRequest`** (same as `/login`).
- No verify/session cookies on this route (7.3.3).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.3.2-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/task-7.3.2.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

## Design Before Execute (pseudocode)

```
POST /magic-link/request
  csrfProtection
  validateRequest(magicLinkRequestBodySchema)
  async (req, res) =>
    try:
      await submitMagicLinkRequest(req.body.email as string)
      res.json(200, { delivered: true })
    catch err:
      logger.error('magic-link request handler failed', { err })
      res.json(500, { code: INTERNAL_ERROR, message: 'Request failed' })
```
