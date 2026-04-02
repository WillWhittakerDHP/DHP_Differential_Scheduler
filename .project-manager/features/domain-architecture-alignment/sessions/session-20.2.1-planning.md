<!-- harness-planning-rollup tier=session id=20.2.1 consolidatedAt=2026-04-02T17:29:21.793Z -->

# Consolidated planning: session 20.2.1

## Session 20.2.1 (parent)

## Story

**This session delivers** server-side validation and sanitization alignment for **block shape `type`** and **block instance three-property fields** on internal entity routes **so that** later sessions (event APIs, booking) can assume consistent HTTP contracts matching `FEATURE_20` §5.1 and `ARCHITECTURE.md` §8–§9.

**Estimated size:** M

---

## Analysis

- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`client/src/constants/blockShapeTypes.ts`** / `ARCHITECTURE.md` §8. No booking resolution on server.
- **Patterns:** Extend **`sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate`** for `blockShape` (reject or map legacy type strings with clear 400 messaging if product requires); add **`sanitizeBlockInstancePrimitiveFields`** extensions for boolean coercion only where safe. Prefer **named helpers** in `entitySanitizers.ts` or a small `blockEntityValidation.ts` imported from router layer before `updateRecord` — keep **`entityCrudRouter`** branch count manageable per function governance.
- **Risks:** Breaking admin saves if clients still emit old type strings — document in task if migration/backfill is separate (20.5); prefer explicit 400 with message over silent map unless plan says otherwise.
- **Alternatives:** Per-route Joi only for `blockShape`/`blockInstance` — heavier duplication; rejected in favor of central sanitizer + optional thin Joi fragment keyed by `entityType` in middleware (evaluate in task 1).

## Goal

For **`blockShape`** and **`blockInstance`** entity keys on internal **`/internal/entities`** CRUD: reject invalid **`type`** and non-boolean / missing handling for **`composite`**, **`orchestrator`**, **`wizardVisible`** consistently with Sequelize models; keep responses as raw rows (no computed booking fields).

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5.1 (rows for block shape / block instance), `phase-20.2-guide.md` §8.2 acceptance checks, `.project-manager/ARCHITECTURE.md` §8–§9.
- **Implementation:** `server/src/routes/internal/entities/entitySanitizers.ts`, `entityCrudRouter.ts` (only if a pre-flight validation hook is needed), `server/src/routes/schemas/entitySchemas.ts` (optional stricter schema by `entityType` via dynamic validation — only if chosen in task), `server/src/db/models/admin/block_shape.ts`, `server/src/db/models/booking/block_instance.ts` (reference only unless model tweak required).

## Approach

1. Add **block shape `type`** allowlist validation (five strings) on create/update payloads; return **400** with stable error text for legacy tokens if we choose reject over map.
2. Extend **block instance** sanitization to ensure the three booleans are present as booleans when provided; strip or reject unknown keys only if project policy requires (default: rely on Sequelize + existing unknown keys in body already pass through — focus on the three fields + `agentPermissions` already handled).
3. Smoke: PUT/PATCH a block shape and block instance via existing patterns (or document manual Thunder Client) without introducing tests (project suspended).
4. Run **server lint**; note **FEATURE_20 §9.1** drift line in `DOMAIN_REWRITE_WORKLOG.md` when done.

## Checkpoint

- Confirm no change introduces **server-side** fee/time **resolution** endpoints.
- After **task 20.2.1.1**, shapes cannot persist illegal `type` values through the happy path.
- After **task 20.2.1.2**, instance three-property fields round-trip through entity CRUD used by admin.

## Deliverables

- Updated **`entitySanitizers.ts`** (and any small validation module) for `blockShape` + `blockInstance`.
- Optional **`entitySchemas.ts`** or route-level validation if decomposition chooses stricter Joi.
- Short note in **`DOMAIN_REWRITE_WORKLOG.md`** for session 20.2.1 API decisions.

## Acceptance Criteria

- [ ] `blockShape` create/update rejects `type` outside the five canonical domain types (or documents explicit legacy mapping if product chooses map over reject).
- [ ] `blockInstance` create/update accepts boolean `composite`, `orchestrator`, `wizardVisible` consistent with DB columns; invalid types yield 400 or Sequelize validation errors surfaced via existing `handleRouteError` path (no empty catches).
- [ ] No new server endpoints compute booking totals or PartFinalizer-equivalent aggregates.
- [ ] `cd server && npm run lint` passes after tasks.

---

## Task 20.2.1.1 (source: task-20.2.1.1-planning.md)

### Story

**This task changes** internal **`/internal/entities/blockShape`** writes **because** permissive `entityBodySchema` lets legacy `type` values reach Sequelize; we fail fast with **400** and clear copy that points admins to **`user` / `service` / `time` / `event` / `price`** (aligned with `client/src/constants/blockShapeTypes.ts` and `ARCHITECTURE.md` §8).

---

### Analysis

- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`clie… _(truncated)_

### Goal

**Block shape** entity writes: every **POST** includes a valid **`type`**; every **PUT/PATCH** that includes **`type`** uses only **`user` | `service` | `time` | `event` | `price`**; legacy tokens get **400** with clear guidance.

### Files

- `server/src/routes/internal/entities/entitySanitizers.ts` and/or new `server/src/routes/internal/entities/blockShapeEntityValidation.ts`
- `server/src/routes/internal/entities/entityCrudRouter.ts`
- `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (optional note)

### Approach

Implement Design steps 1–3 in order; keep router branches thin by delegating to named validators; no new tests (project policy).

### Checkpoint

- No new routes; only guards on existing `blockShape` CRUD.
- After merge, illegal `type` never reaches `createRecord` / `patchRecord` for `blockShape`.

### Deliverables

- Exported validators + wired POST/PUT/PATCH for `blockShape`.
- Server lint clean.

### Acceptance Criteria

- POST `blockShape` without `type` → **400** with clear message.
- POST/PUT/PATCH with `type: property` (or `option` / `coupon`) → **400** mentioning canonical types and legacy mapping hint.
- POST/PUT/PATCH with `type: time` (etc.) → unchanged success path (still passes through sanitizer/ORM).
- `npm run lint` in `server/` passes.

### Design

1. Add **`entitySanitizers.ts`** (or `blockShapeEntityValidation.ts` colocated) exports:
   - `validateBlockShapeTypeValue(raw: unknown): string | null` — non-string, empty, unknown string, or legacy `property` / `option` / `coupon` → single-line user-facing message; canonical five → `null`.
   - `validateBlockShapeCreateBody(body: Record<string, unknown>): string | null` — **`type` required** on POST.
   - `validateBlockShapeUpdateBody(body: Record<string, unknown>): string | null` — if **`type`** key present, validate value (PATCH partial OK).
2. **`entityCrudRouter.ts`:** Before `sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate` on POST, PUT, PATCH, when `entityType` is `blockShape`:
   - If validation returns string → `sendBadRequest(res, msg, msg)` and `return`.
3. PATCH supports `{ key, value }` — when `key === 'type'`, same validator on `value`.
4. Run **`cd server && npm run lint`**.
5. Optional one-line **DOMAIN_REWRITE_WORKLOG.md** under Feature 20 noting block-shape type pre-validation.

---

## Task 20.2.1.2 (source: task-20.2.1.2-planning.md)

### Story

**This task changes** internal **`/internal/entities/blockInstance`** writes **because** permissive `entityBodySchema` allows strings or numbers for boolean columns; Sequelize errors or odd coercions are harder to debug than an immediate **400** with a field-level message. **`agentPermissions`** empty-string defaults stay in **`sanitizeBlockInstancePrimitiveFields`** (already implemented).

---

### Analysis

- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`clie… _(truncated)_

### Goal

**Block instance** entity writes: whenever **`composite`**, **`orchestrator`**, or **`wizardVisible`** is **present** in the body (or PATCH **`updateData`**), the value is a **JSON boolean**; otherwise **400** with a clear field message. Omitted keys remain valid (Sequelize defaults on create; partial PATCH unchanged).

### Files

- `server/src/routes/internal/entities/blockInstanceEntityValidation.ts` (new)
- `server/src/routes/internal/entities/entityCrudRouter.ts`
- Reference only: `server/src/db/models/booking/block_instance.ts`, `server/src/routes/internal/entities/entitySanitizers.ts`

### Approach

Implement **Design** steps 1–3; no new tests (project policy); optional **`DOMAIN_REWRITE_WORKLOG.md`** one-liner only if phase guide expects it.

### Checkpoint

- No new routes or shared type changes required for this slice.
- After merge, admin CRUD cannot persist non-boolean values for these flags through the guarded paths.

### Deliverables

- Exported boolean-field validator + POST/PUT/PATCH wiring for **`blockInstance`**.
- **`npm run lint`** clean under **`server/`**.

### Acceptance Criteria

- POST/PUT/PATCH **`blockInstance`** with **`composite: "true"`** (string) → **400** mentioning the field.
- POST/PUT/PATCH with **`orchestrator: true`** and valid payload otherwise → passes validation (continues to sanitizer / ORM).
- Omitted **`wizardVisible`** on POST → still allowed (DB default **`true`** applies via Sequelize).
- PATCH with **`key: "wizardVisible", value: false`** → allowed; **`value: "false"`** → **400**.
- **`cd server && npm run lint`** passes.

### Design

1. Add **`server/src/routes/internal/entities/blockInstanceEntityValidation.ts`** with:
   - Watched keys: **`composite`**, **`orchestrator`**, **`wizardVisible`** only.
   - `validateBlockInstanceBooleanFields(body: Record<string, unknown>): string | null` — for each key, if **`Object.prototype.hasOwnProperty.call(body, key)`** and value is not **`undefined`**, require **`typeof value === 'boolean'`**; return first violation message (e.g. **`Block instance field "wizardVisible" must be a boolean (true or false).`**).
2. **`entityCrudRouter.ts`:** After annotation body shaping where applicable, before **`sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate`**, when **`entityType`** is **`blockInstance`**, if validator returns string → **`sendBadRequest`** and **`return`** (POST, PUT, PATCH — same as block shape pattern).
3. PATCH **`{ key, value }`:** Resolved **`updateData`** already contains the single key; validator covers it.
4. Run **`cd server && npm run lint`**.

---
