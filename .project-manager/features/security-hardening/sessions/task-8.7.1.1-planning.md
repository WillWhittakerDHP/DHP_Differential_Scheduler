# Plan: task 8.7.1.1 — Call-site inventory + ownership registry module

## Contract
- **Tier:** task | **ID:** 8.7.1.1
- **Scope:** **This task only:** grep and document every **`checkOwnership`** usage; add **`server/src/middlewares/ownershipRegistry.ts`** (or equivalent) exporting typed **lookup** and **registry metadata** (model + owner column + special cases). **Do not** replace the **`checkOwnership`** stub body here — that is **task 8.7.1.2**.
- **Governance:** Explicit return types; small functions; **`createLogger`** only where the registry validates input at runtime (e.g. dev guard), not in hot path until 8.7.1.2.

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Registry must list every **`resourceName`** string passed from routes today so 8.7.1.2 can fail closed on unknown keys.

## Where we left off
Session **8.7.1** started; **`checkOwnership`** is still a no-op in **`security.ts`**.

## Goal
Produce a **single source of truth** for ownership resolution: (1) verified inventory of **`checkOwnership('resourceName', paramKey)`** call sites; (2) a **registry module** that maps each **`resourceName`** to a **typed entry** describing how to load the row and which column (if any) stores the owning **`userId`**, including **explicit special cases** (dynamic entity router, singleton admin settings, repository-backed business settings, rows with no per-user owner).

## Files
- **New:** `server/src/middlewares/ownershipRegistry.ts` — types, `OWNERSHIP_REGISTRY` map or switch, **`getOwnershipRegistryEntry(resourceName: string)`** (returns defined entry or **`undefined`**)
- **Optional:** `server/src/middlewares/ownershipTypes.ts` if types would exceed file limits
- **Read-only:** `server/src/routes/**` (grep / comment references only in this task)
- **`server/src/middlewares/security.ts`** — **no behavioral change** in 8.7.1.1 (stub stays); optional `export type` re-export only if useful

### Inventory (from grep — confirm in code while implementing)

| resourceName | paramKey | Notes |
|--------------|----------|--------|
| From **`createCrudRouter`** | `paramKey` from config | Each router’s **`resourceName`** / **`model`** / **`paramKey`** must match registry entries for those resources. |
| **`appointment`** | `id` | **`Appointment`** model — owner-like columns include **`scheduledById`** / **`heldBy`** (not **`userId`**); pick product-correct column in registry comments + entry for 8.7.1.2. |
| **`businessSetting`** | `key` | Not a single Sequelize **`findByPk`** row by UUID; repository-backed **`availability_settings`**. Registry entry should be **`kind: 'special'`** (or similar) with resolver left to 8.7.1.2. |
| **`calendarSetting`** | `id` | **`CalendarSettings`** — singleton-style admin config, **no `userId` column**; **`kind: 'adminSingleton'`** or **`requireRole`**-only semantics in 8.7.2. |
| **`wizardSetting`** | `id` | **`WizardSettings`** — same as calendar. |
| **`property`** | `id` | **`PropertyVersion`** — **no `userId`**; ownership may chain via **`Address`** or be **admin/global**; document **`kind: 'special'`** or **`derived`** for 8.7.1.2 / 8.7.2. |
| **`propertyType`** | `typeId` | **`PropertyVersionType`** — junction by **`propertyVersionId`**; ownership may inherit from parent property; mark **`special`**. |
| **`entity`** | `id` | Dynamic **`req.entityConfig.model`** per **`entityType`**; registry entry **`kind: 'dynamicEntity'`** — middleware uses **`req`** after **`entityTypeParamHandler`**. |

## Approach
1. Re-run **`rg 'checkOwnership\(' server/src`** and align the table above with every call site (including **`createCrudRouter`** configs).
2. Define discriminated union types, e.g. **`SequelizeOwnedRow`**, **`DynamicEntityResource`**, **`SpecialResource`** — keep **flat** public API: **`getOwnershipRegistryEntry(name: string): OwnershipRegistryEntry | undefined`**.
3. Wire **lazy or static** Sequelize model references from **`config/app.js`** (or existing model bag) to avoid circular imports — match patterns used elsewhere in middleware.
4. For uncertain owner columns, **encode the uncertainty in the type + comment**; resolve behavior in **8.7.1.2** / **8.7.2**, not by guessing silent **`userId`**.
5. **`cd server && npm run lint`** on new files.

## Checkpoint
- Every **`resourceName`** string used in **`checkOwnership(...)`** today has a **registry key** (or a single **`dynamicEntity`** path for **`entity`**).
- **`getOwnershipRegistryEntry`** is exported and **`undefined`** for unknown strings (so 8.7.1.2 can log + fail).
- Server **lint** passes.

## Design Before Execute
- Prefer **`const OWNERSHIP_REGISTRY: Record<string, OwnershipRegistryEntry>`** with **`satisfies`** for excess key checking, or **`Map`** + **`as const`** keys — team style wins.
- **Avoid** importing **`Request`** in the registry file if possible; **`dynamicEntity`** entry is a marker without resolver function until 8.7.1.2.
- **Appointment:** document **`scheduledById`** vs **`heldBy`** vs future **`userId`** in a **WHY** comment; default owner field choice is a **product** decision — stub **`special`** until confirmed if needed.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- Session guide: `.project-manager/features/security-hardening/sessions/session-8.7.1-guide.md`
- Phase planning: `.project-manager/features/security-hardening/phases/phase-8.7-planning.md`
- Stub: `server/src/middlewares/security.ts` (`checkOwnership`)
- Contract notes: `server/docs/SECURITY_STUBS.md` (**checkOwnership**)
- Playbook: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
