<!-- harness-planning-rollup tier=session id=20.4.4 consolidatedAt=2026-04-02T22:34:53.654Z -->

# Consolidated planning: session 20.4.4

## Session 20.4.4 (parent)

## Story

**This session delivers** a single coherent **perspective + minimizer** story and **safe** shared **`differentialRole*`** pruning **so that** phase **20.4** closes without dead API surface and without breaking admin placement UI or **`@shared`** contracts still referenced by server/client.
**Estimated size:** M (two tasks; booking utils + shared grep)

---

## Analysis

- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**; admin (**`DifferentialEventRoleOverridesField`**) and **`eventPlacementUtils`** still use role **template** mapping.

## Goal

Close **phase 20.4** session **4**: perspective API matches **placement-only** booking; **no dead `resolveEventShapes` parameters**; **§6.2**-style shared pruning **grep-gated**; **admin** + **server** contracts preserved.

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.2**, **§8.4**)
- **PM:** `phases/phase-20.4-guide.md`, `sessions/session-20.4.4-guide.md`, `sessions/session-20.4.3-handoff.md`
- **Implementation:** `client/src/utils/booking/perspectiveResolver.ts`; `client/src/utils/booking/minimizerEventShapes.ts`; `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`, `shared/types/differentialRole*` — **only if grep-clean**

## Approach

1. Run **20.4.4.1** then **20.4.4.2**; **`vue-tsc`** + **`npm run lint`** (`client/`) per task; **server lint** if **shared/** or **server/** touched.
2. **Grep-before-delete** for any **shared** removal.

## Checkpoint

- **Perspective** / slot **end-time** behavior unchanged for **no-override** templates.
- **Admin** **`DifferentialEventRoleOverridesField`** and block-instance saves unaffected.

## Deliverables

- Updated **`perspectiveResolver`** (+ any import fixes).
- Minimizer / **`@shared`** outcomes per task **20.4.4.2** with grep notes.

## Design

- **Task 1:** **`perspectiveResolver`:** Remove **`overrides`** from **`resolveEventShapes`**; implement **`derivePerspective`** via **`resolveEventShapes(eventFinals)`** + **`derivePerspectiveWithResolved`** to avoid duplicate **`resolveDifferentialMajorMinorFromEventShapes`**.
- **Task 2:** **`minimizerEventShapes`** + **`@shared` `differentialRole*`** — grep-first: simplify minimizer legacy path **only** if no writers / no payload risk; else **document deferral**; remove **only** **unreferenced** shared symbols.

---

## Task 20.4.4.2 (source: task-20.4.4.2-planning.md)

### Story

**This task** drops dead minimizer logic that depended on **`differentialEventRoleOverrides`** (booking no longer produces non-empty maps after **20.4.3**) **and** removes **`@shared`** exports that full-repo grep shows have **zero** importers, **because** phase **20.4** is closing out placement-only scheduling without carrying unused API surface.

---

### Analysis

- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**;… _(truncated)_

### Goal

Close **phase 20.4** session **4**: perspective API matches **placement-only** booking; **no dead `resolveEventShapes` parameters**; **§6.2**-style shared pruning **grep-gated**; **admin** + **server** contracts preserved.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.2**, **§8.4**)
- **PM:** `phases/phase-20.4-guide.md`, `sessions/session-20.4.4-guide.md`, `sessions/session-20.4.3-handoff.md`
- **Implementation:** `client/src/utils/booking/perspectiveResolver.ts`; `client/src/utils/booking/minimizerEventShapes.ts`; `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`, `shared/types/differentialRole*` — **only if grep-clean**

### Approach

1. Run **20.4.4.1** then **20.4.4.2**; **`vue-tsc`** + **`npm run lint`** (`client/`) per task; **server lint** if **shared/** or **server/** touched.
2. **Grep-before-delete** for any **shared** removal.

### Checkpoint

- **Perspective** / slot **end-time** behavior unchanged for **no-override** templates.
- **Admin** **`DifferentialEventRoleOverridesField`** and block-instance saves unaffected.

### Deliverables

- Simplified **`listMinimizerSegmentsFromAppointmentShape`** (placement-only floating check; no override branch).
- Removed dead exports: **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`**, **`toApiDifferentialRole`**, **`sanitizeDifferentialRoleInput`**.
- Task log note if any planned deletion is skipped (not expected).

### Acceptance Criteria

- [ ] Full-repo grep shows **no** remaining references to removed symbols in `client/`, `server/`, `shared/` (excluding `.project-manager`).
- [ ] **`DifferentialEventRoleOverridesField.vue`** still builds (still uses **`DIFFERENTIAL_ROLE_LABELS`**, **`sanitizeDifferentialEventRoleOverridesInput`**).
- [ ] **`eventPlacementUtils`** / **`eventAttendeeUtils`** unchanged except any knock-on type fixes from shared deletes (none expected).
- [ ] Client + server lint and **`vue-tsc`** pass.

### Design

1. **`minimizerEventShapes.ts`:** Remove **`useOverridePath`** branch, **`effectiveDifferentialRole`**, **`DifferentialRole`**, and **`hasNonEmptyDifferentialRoleOverrides`** imports. Single loop: include finals where **`sanitizeEventPlacementKindInput(eventShape.placementKind) === 'floating'`** (non-floating / marginal unchanged). Update file header / function JSDoc to describe **placement-only** minimizer discovery (no override map).
2. **`shared/constants/differentialRoleMappings.ts`:** Delete **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`** (and its array) — **grep-clean** dead export; keep **`DIFFERENTIAL_ROLE_LABELS`**.
3. **`shared/utils/differentialRoleUtils.ts`:** Delete **`toApiDifferentialRole`** and **`sanitizeDifferentialRoleInput`** — **grep-clean**; keep **`INVALID_LEGACY_*`**, **`parseDifferentialRole`**, **`isDifferentialRoleStorage`**, **`isDifferentialRoleOverrideValue`**, **`sanitizeDifferentialEventRoleOverridesInput`**, **`effectiveDifferentialRole`** (still used).
4. **Verification:** `cd client && npx vue-tsc --noEmit && npm run lint`; `cd server && npm run lint` (shared touched). Re-grep removed symbol names → only docs or absent.

---

## Task 20.4.4.1 (source: task-20.4.4.1-planning.md)

### Story

**This task changes** **`perspectiveResolver`** public API and **`derivePerspective`** internals **because** **`overrides`** is dead after **20.4.3**, and duplicating **`resolveDifferentialMajorMinorFromEventShapes`** invites drift.

---

### Analysis

- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**;… _(truncated)_

### Goal

**Task 20.4.4.1 only:** **`resolveEventShapes`** is single-arg; **`derivePerspective`** uses it; no behavior change for placement-only slots.

### Files

- `client/src/utils/booking/perspectiveResolver.ts`

### Approach

Refactor in one file; verify with **grep**, **vue-tsc**, **eslint**.

### Checkpoint

- **`derivePerspective`** still returns **`totalTimeRange`** when there is no major+minor pair (non-differential / single-final cases).

### Deliverables

- Updated **`perspectiveResolver.ts`**; no **`DifferentialRole`** in this module unless still required.

### Acceptance Criteria

- **`resolveEventShapes`** has exactly **one** parameter (**`eventFinals`**).
- **`derivePerspective`** does not call **`resolveDifferentialMajorMinorFromEventShapes`** directly (only via **`resolveEventShapes`** chain).
- **Client** **lint** + **vue-tsc** clean.

### Design

1. **`resolveEventShapesCore(eventFinals)`** — call **`resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)`** (single arg); remove **`overrides`** from signature.
2. **`resolveEventShapes(eventFinals)`** — single parameter; update JSDoc if any.
3. **`derivePerspective`:** `const resolved = resolveEventShapes(eventFinals)`; if **`!resolved.majorEventShape`** then **`return slot.totalTimeRange ?? derivePerspectiveNoEventFinals(...)`**; else **`derivePerspectiveWithResolved(slot, perspective, resolved)`**.
4. Remove unused **`DifferentialRole`** import if no longer referenced in this file.
5. **`npx vue-tsc -b`** (or project script) + **`cd client && npm run lint`**.

### Implementation Orders
1. Edit **`perspectiveResolver.ts`** per above.
2. Grep **`resolveEventShapes`**; fix any stale two-arg call (none expected).
3. Lint + typecheck.

---
