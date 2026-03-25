# Session 8.7.1 Guide: Resource ownership (`checkOwnership`)

**Purpose:** Harness anchor for appointment-scoped ownership checks on CRUD mutations.

**Tier:** Session (maps to **Phase 8.7** in the feature guide)

---

## Quick Start

**Session ID:** 8.7.1  
**Delivered behavior**

- **`checkOwnership`** in `security.ts` delegates to **`runOwnershipCheck`** in `ownershipChecks.ts`.
- **Appointments:** privileged roles (`admin`, `transaction_manager`, `inspector`, `seller`) bypass; anonymous requests pass (wizard); otherwise **`scheduledById`** / **`heldBy`** must match **`req.user.id`**.
- Other `modelName` values: permissive passthrough until extended (same pattern as pre-enactment stubs for non-appointment resources).

**Primary files**

- `server/src/middlewares/ownershipChecks.ts`
- `server/src/middlewares/security.ts` — `checkOwnership`
- `server/src/routes/helpers/createCrudRouter.ts` — wires `checkOwnership` on PUT/PATCH/DELETE

**Success criteria**

- [x] Authenticated non-owner cannot mutate another user’s appointment via id-guess (403).
- [ ] Extend to additional entities when product rules require (track as new sessions).

**Harness anchor:** `session-start 8.7.1`.

---

## Notes

- Feature 6 enactment (scheduled-by auto-population, held/override) remains separate work.
