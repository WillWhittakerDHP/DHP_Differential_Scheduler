# Plan: session 8.7.1 — Ownership registry and real checkOwnership middleware

## Contract
- **Tier:** session | **ID:** 8.7.1
- **Scope:** Server only — inventory **`checkOwnership`** usage, add a maintainable **registry** (resource name → Sequelize model + owner column + optional rules), implement the **middleware body** (404/403, **`req.user`** required, logging). Session **8.7.2** covers edge cases, **SECURITY_STUBS** refresh, and broader smoke.
- **Governance:** Explicit return types, **`createLogger`** on failure paths, function complexity thresholds (extract helpers if needed).

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** function
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Task planning docs own implementation detail; keep this session plan at boundaries and task titles.

## Where we left off
Phase **8.7** started after **8.6** (CSRF) shipped. **`checkOwnership`** in **`security.ts`** is still a no-op. Feature **7** provides **`requireAuth`** and **`req.user.id`**.

## Goal
Deliver a **real** **`checkOwnership(resourceName, paramKey, ownerField?)`** implementation: resolve the model from **`resourceName`**, read **`req.params[paramKey]`**, load the row, return **404** when missing, **403** when **`req.user`** is missing or the row’s owner field does not match **`req.user.id`**, else **`next()`**. **8.7.1** ships the registry + happy-path enforcement; documented exceptions and full doc pass land in **8.7.2**.

## Files
- `server/src/middlewares/security.ts` — replace stub implementation; import registry
- New module under `server/src/middlewares/` or `server/src/auth/` — e.g. `ownershipRegistry.ts` with typed map and lookup
- `server/src/models/**` — read-only unless owner column discovery requires a typed export
- Call sites under `server/src/routes/**` — grep-only in **8.7.1** unless a **`resourceName`** is wrong

## Approach
1. Grep all **`checkOwnership(`** usages; table **`resourceName`**, **`paramKey`**, implied Sequelize **model** and **owner column** (default **`userId`**).
2. Add **registry** entries (no magic strings in the middleware beyond the map key); fail closed with **500** or **403** + log for unknown **`resourceName`**.
3. Implement async middleware: ensure **`req.user`** (if absent, **403** + log — routes should run **`requireAuth`** first); **`findByPk`**; compare ids consistently (**string** normalize for UUID).
4. Keep **createCrudRouter** contract unchanged.
5. **`cd server && npm run lint`** on touched files after each task merge.

## Checkpoint
- At least one protected route returns **403** for authenticated wrong user and **404** for missing id (manual or logged verification)
- Unknown **`resourceName`** is visible in logs and does not silently pass
- Server lint clean on touched files

## How we build the tierDown to achieve them
- **Task 8.7.1.1:** Inventory call sites and add ownership registry module (types + resource → model + ownerField map)
- **Task 8.7.1.2:** Implement `checkOwnership` middleware using registry (404/403, logging, lint)

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/security-hardening/phases/phase-8.7-guide.md`
- Phase planning: `.project-manager/features/security-hardening/phases/phase-8.7-planning.md`
- Contract sketch: `server/docs/SECURITY_STUBS.md` (**checkOwnership** section)
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
