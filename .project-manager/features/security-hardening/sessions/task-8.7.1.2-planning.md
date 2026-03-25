# Plan: task 8.7.1.2 — Implement `checkOwnership` middleware

## Contract
- **Tier:** task | **ID:** 8.7.1.2
- **Scope:** Replace the **`checkOwnership`** stub in **`server/src/middlewares/security.ts`** with registry-driven logic (**`getOwnershipRegistryEntry`** from **`ownershipRegistry.ts`**). **No route file edits** unless a bug is discovered. Session **8.7.2** refines **special** policies and **SECURITY_STUBS**.
- **Governance:** Explicit return types on exports; **`createLogger`** for unknown resource, missing `req.user`, and unexpected errors; avoid deep nesting (extract named helpers under **`security.ts`** or **`ownershipMiddleware.ts`** if complexity grows).

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Keep **`checkOwnership(modelName, paramKey, _ownerField)`** signature stable; third arg remains unused until a follow-up explicitly wires per-route owner overrides.

## Where we left off
Task **8.7.1.1** added **`ownershipRegistry.ts`** with **`OWNERSHIP_RESOURCE_NAMES`**, **`getOwnershipRegistryEntry`**, and per-resource **`kind`**: **`sequelize`**, **`dynamic_entity`**, **`special`**.

## Goal
Return async middleware that: resolves **`registryEntry = getOwnershipRegistryEntry(modelName)`**; if **`undefined`**, log + **403** JSON aligned with **`requireRole`** (**`code: AUTH_FAILURE_CODES.FORBIDDEN`**, stable message). If **`req.user`** is missing, log + **403** (same shape — routes should use **`requireAuth`** first). Otherwise branch on **`entry.kind`**:
- **`sequelize`**: read **`rawId = req.params[paramKey]`**; if missing/empty, **404** with a concise JSON body consistent with nearby routers (or reuse **`AUTH_FAILURE_CODES`** only where it fits; prefer **404** + **`NOT_FOUND`**-style code if one exists in **`strategyTypes`**, else small `{ code, message }` without inventing many variants).
- **`dynamic_entity`**: require **`req.entityConfig`** (set by **`entityTypeParamHandler`**); **`entry.model` is unused** — use **`req.entityConfig.model.findByPk(rawId)`**. Rows are catalog/admin entities with **no `userId`**: treat as **staff-only** — allow if **`req.user.role`** is **`agent`**, **`transaction_manager`**, or **`seller`**; **`client`** → **403**. Log when denying.
- **`special`**: implement minimal safe behavior until **8.7.2**:
  - **`businessSetting`**: **`paramKey`** is **`key`** — validate key matches availability settings key used elsewhere; **404** if wrong key; **staff-only** mutating (same role set as dynamic_entity) since no per-user row.
  - **`calendarSetting` / `wizardSetting`**: PUT routes have **no `:id`** — if **`req.params[paramKey]`** is absent, skip **`findByPk`** and apply **staff-only** gate only.
  - **`appointmentFeeSummary`**: load **`AppointmentFeeSummary`** by **`findByPk`**, load parent **`Appointment`**, compare **`scheduledById`** to **`req.user.id`** (string normalize); **404** if summary or parent missing.
  - **`propertyType`**: **`findByPk(typeId)`** on **`PropertyVersionType`**, load **`PropertyVersion`** by **`propertyVersionId`**, then **staff-only** for now (property ownership chain deferred to **8.7.2**) OR if simpler: **staff-only** for patch/delete on property types.
  - **`property`**: **`PropertyVersion.findByPk`** — **staff-only** until address/owner chain exists (**8.7.2**).
  - **`beta feedback`**, **`business rule`**, **`property field mapping`**, **`property feature mapping`**: **staff-only** (internal admin CRUD).

Use one shared helper **`isInternalStaffUser(req.user)`** (or equivalent) for **agent | transaction_manager | seller**.

## Files
- **`server/src/middlewares/security.ts`** — real **`checkOwnership`**; import registry + **`Appointment`**, **`AppointmentFeeSummary`**, **`PropertyVersion`**, **`PropertyVersionType`** from **`config/app.js`** only where needed for **special** branches (or colocate resolver functions in **`ownershipEnforcement.ts`** next to registry to keep **`security.ts`** thin).
- **`server/src/middlewares/ownershipRegistry.ts`** — touch only if types need a small extension (prefer minimal).
- Optional new **`server/src/middlewares/ownershipEnforcement.ts`** — **`resolveSpecialOwnership`**, **`assertStaff`**, **`idsEqual`** to satisfy function-governance limits.

## Approach
1. Add **`ownershipLogger`** (`createLogger('middleware.checkOwnership')`).
2. Implement **`idsEqual(a: unknown, b: unknown): boolean`** via **`String(a) === String(b)`** after null checks.
3. Implement **`checkOwnership`** factory: return **`async (req, res, next) => { ... }`** with **`try/catch`** → **`ownershipLogger.error`** + **`next(error)`**.
4. Branch **`registryEntry.kind`** with small delegated functions to stay under branch/nesting limits.
5. **`cd server && npm run lint`**.

## Checkpoint
- Unknown **`modelName`** → **403** + log line.
- **`appointment`** + **`user`** **`sequelize`** paths enforce row ownership (wrong user **403**, missing row **404**).
- At least one **`special`** path returns **403** for **`client`** when authenticated.
- Server lint clean.

## Design Before Execute
- **404 body:** Match **`sendNotFound`** patterns if easy; otherwise **`res.status(404).json({ code: …, message: … })`** — grep **`NOT_FOUND`** / **`AUTH_FAILURE_CODES`** for reuse.
- **403 body:** **`{ code: AUTH_FAILURE_CODES.FORBIDDEN, message: '…' }`** — reuse **`ROLE_403_MESSAGE`** or a dedicated **`OWNERSHIP_403_MESSAGE`** string constant at top of **`security.ts`**.
- **`scheduledById`** null on appointment: treat as **403** (no owner) or **404** — prefer **403** “forbidden” so IDOR does not leak existence differently from **404**; document in comment.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- Registry: `server/src/middlewares/ownershipRegistry.ts`
- Auth patterns: `server/src/middlewares/security.ts` (`requireAuth`, `requireRole`, `AUTH_FAILURE_CODES`)
- Entity param: `server/src/routes/internal/entities/entityParamMiddleware.ts` (`req.entityConfig`)
- Roles: `server/src/constants/userRoles.ts` / `shared/constants/roleConstants.js`
- Session guide: `.project-manager/features/security-hardening/sessions/session-8.7.1-guide.md`
- Playbook: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
