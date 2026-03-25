# Session 8.5.5 Log: Joi gap closure batch C (verification + documentation)

**Status:** Complete (verification only; no server code changes)
**Date:** 2026-03-25

---

## Session Goal

Record **batch C**: auth subtree + mount layout + straggler scan, confirm **GC-8-JOI** closure from 8.5.3–8.5.4 still holds, run **server lint**.

---

## Batch C verification

### Mount layout (`server/src/routes/index.ts`)

- **`/v1/internal/auth`** → `AuthRouter` (separate from `InternalRouter`).
- **`/v1/internal`** → `InternalRouter` (batches A/B audited here).

### Auth mutating routes (`authRouter.ts`)

| Route | Method | Validation |
|-------|--------|------------|
| `/login` | POST | `validateRequest(loginBodySchema)` |
| `/magic-link/request` | POST | `validateRequest(magicLinkRequestBodySchema)` |
| `/magic-link/verify` | GET | Query `token` only — **N/A** for body Joi |

### Dev router (`devStatusRouter`)

- **`GET /dev/status` only** — no POST/PUT/PATCH body validation scope (N/A for GC-8-JOI).

### Internal tree stragglers (grep `router.post|put|patch` under `routes/internal`)

- **Relationship PATCH handlers** (`relationshipAnnotationAssignmentRouter`, `relationshipInstanceComponentRouter`): inline **Joi** `validate` on params/body — equivalent coverage (not `validateRequest` middleware, same intent).
- **Availability POST** `/computed-data`: `validateRequest(computedAvailabilityRequestSchema)` + secondary validator.
- **Event instance preview POST**: `validateRequest(eventInstancePreviewPostBodySchema)`.
- **Force create, CRUD factories, etc.**: covered in prior audits or `validateRequest` on router factory configs.

**Verdict:** No new GAPs found for batch C scope; **GC-8-JOI** remains **done** without status change.

---

## Lint

- `cd server && npm run lint` — **pass** (2026-03-25).

---

## Tasks

- [x] **8.5.5.1** — Evidence: mount layout + auth + grep sweep (this log).
- [x] **8.5.5.2** — Server lint + checklist Notes + handoff.
