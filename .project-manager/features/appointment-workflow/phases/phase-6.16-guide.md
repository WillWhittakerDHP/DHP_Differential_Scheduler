# Phase 6.16 Guide: Differential Role Generalization — Margin, Minimizer, and Ternary Placement

**Purpose:** Phase-level guide for extending differential roles (margin before major, multiple minimizer segments), aligning **PartFinal** placement with **`TernaryBoolean`**, and coordinating calendar/API/confirmation behavior.

**Tier:** Phase (Tier 1 — High-Level)

---

## Overview

**Phase Number:** 6.16  
**Phase Name:** Differential Role Generalization: margin + multiple minimizers  
**Description:** Add a **`margin`** differential role (deterministic **pre-major** temporal position — work that sits at the **front** of the anchored appointment window). Support **multiple minimizer** segments with **sequential boundary chaining** in scheduling composables. Align **`PartFinal.minimizer: TernaryBoolean`** (`'false'` plain timeline, `'true'` minimizer, `'override'` margin). Inventory and extend **downstream** behavior: appointment persistence, **Google Calendar event creation** (what stays on the main event vs a separate calendar event), API payloads, and confirmation copy. Execute or document phased **moveable → minimizer** rename with migrations for stored JSON.

**Duration:** 3 sessions (6.16.1 margin foundation, 6.16.2 multiple minimizers, 6.16.3 integration + rename) — see `phases/phase-6.16-planning.md`.  
**Status:** ✅ **Complete** (sessions **6.16.1–6.16.3**; phase closed at Feature 6 feature-end **2026-04-02**).

**Related planning artifact (local Cursor plan, not in repo):** `~/.cursor/plans/differential_role_generalization_7884ea5f.plan.md` — use if present for session decomposition detail.

---

## Objectives

- Add **`margin`** to the **DifferentialRole** enum (server + shared types) with DB migration; set **`PartFinal.minimizer`** to **`'override'`** when margin applies.
- Extend slot pipeline (part finalizer, slot shapes) to compute margin durations and **pre-major** temporal position.
- Support **multiple minimizer** event shapes with ordered, sequential boundary chaining in scheduling composables (`useMoveablePartsScheduling` → eventual `useMinimizerPartsScheduling`).
- Extend **`differentialEventRoleOverrides`** (Phase 6.12.5) path for margin and multiple minimizer shapes in admin UI.
- Inventory and document (or implement) downstream behavior: appointment persistence, **Google Calendar** event split, API payloads, confirmation copy.
- Execute or explicitly phase the mechanical **moveable → minimizer** rename with migration notes for stored JSON and server keys.

---

## Terminology: minimizer (née moveable)

**Product intent:** "Moveable" in UX copy referred to work scheduled in a **separate completion window** after the onsite inspection, with contingency/deadline semantics. The codebase historically mixed spellings (**moveable** vs **movable**).

**Direction:** Prefer the name **minimizer** in **code identifiers** (composables, types, CSS classes where renamed), and align **user-facing** strings in a later pass. **Rationale:** "Minimizer" reads closer to "residual / completion segment" and avoids collision with generic English "movable."

**Scope of rename (phased):**

1. **Done in tree (this change):** `PartFinal` field **`minimizer: TernaryBoolean`** replaces **`moveable: boolean`** (`client/src/types/booking/partFinal.ts`, `PartFinal.ts`, `partFinalizer.ts`).
2. **Planned mechanical pass (Phase 6.16 implementation):** Rename wizard/composable/API identifiers (`useMoveablePartsScheduling` → `useMinimizerPartsScheduling`, `moveableScheduling` payload keys, `moveableFallbackLabel` in wizard settings, etc.). **Requires** migration strategy for persisted JSON (`appointment` step data, `wizard_settings` columns) and coordinated **server schema** renames where keys are stored.
3. **Database `differential_role` enum:** Today includes literal **`moveable`** on `event_shapes`. A dedicated migration may introduce **`minimizer`** (or keep **`moveable`** as storage value with client alias) — decide in 6.16.1 to avoid double-migration churn.

---

## PartFinal.minimizer — `TernaryBoolean` semantics

Use the same **`TernaryBoolean`** type as `major` / `minor` on **`PartFinal`**: `'true' | 'false' | 'override'`.

| Value | Meaning (placement) |
|--------|---------------------|
| **`'false'`** | Plain **major/minor** timeline for this part shape — **no** separate minimizer scheduling segment (not the "completion window" path). |
| **`'true'`** | **Minimizer** — participates in the **separately scheduled** segment (completion window, second temporal band, optional extra calendar event). |
| **`'override'`** | **Margin** — **pre-major** anchor (work pushed to the **front** of the appointment window relative to the major segment), not the free-floating minimizer window. |

**Resolution today:** `enrichBlockFinalsWithDifferentialRoles` maps storage role **`minimizer`** to **`PartFinal.minimizer: 'true'`** and **`margin`** to **`'override'`** per shared differential-role utilities (obsolete storage spellings rejected at parse).

**Interaction with `differentialEventRoleOverrides`:** Block-instance overrides (Phase 6.12.5) divert **major / minor / minimizer / margin / none** per event shape in admin and booking resolution.

---

## Alignment with existing patterns

- **`TernaryBoolean`** elsewhere: block **`differential`**, **`agent_permissions`** (`'true' | 'false' | 'override'`) — same three-value discipline for admin + inheritance.
- **Phase 6.4 / 6.9:** Pre-closing UX and availability sub-step "confirm moveable" are **wizard presentation**; they stay until the minimizer rename pass lands.
- **Phase 6.12.5:** **`differentialEventRoleOverrides`** — matrix over active event shapes; use for conditional diversion when margin vs minimizer splits differ by option block.

---

## Tasks

- DB migration: add **`margin`** to `differential_role` ENUM on `event_shapes`; decide storage name vs alias (6.16.1).
- Shared types: extend `DifferentialRole` (or equivalent) with `margin`; align with `TernaryBoolean` on `PartFinal`.
- Part finalizer / slot shapes: compute margin durations, offsets, and pre-major positioning.
- Perspective resolver: emit `PartFinal.minimizer === 'override'` for margin; update `enrichBlockFinalsWithDifferentialRoles`.
- Admin dropdown / override surface: margin option in differential role override matrix.
- Multi-minimizer detection utilities and segment types.
- Composable refactor: `useMinimizerPartsScheduling` + sequential multi-segment boundaries; orchestrator/sub-step wiring.
- Downstream inventory: appointment persistence, calendar event split, API payloads, confirmation UX (implement or document gaps).
- Mechanical rename: moveable → minimizer pass executed or tranched with migration notes.
- Client lint + app start; update session logs and handoff per workflow.

### Sessions Breakdown

- [x] ### Session 6.16.1: Margin role — types, pipeline, admin
**Description:** Shared types and DB migration for **margin** on `DifferentialRole`; lock ENUM rename strategy (minimizer vs alias); slot pipeline — `PartFinal.minimizer: 'override'` + duration math for pre-major placement; perspective resolver; admin dropdown for margin in override matrix; lint.
**Tasks:** ENUM migration; shared types; part finalizer margin path; perspective + enrichment; admin override UI; lint + app start.
**Focus:** Foundation: margin in storage/types/pipeline/admin; no silent fallback in resolver.

- [x] ### Session 6.16.2: Multiple minimizers — segments, composable, orchestrator
**Description:** Detection utilities for multiple minimizer shapes; `MinimizerSegment`-style types; `useMinimizerPartsScheduling` multi-segment refactor with sequential boundary chaining; orchestrator / availability sub-step wiring.
**Tasks:** Multi-minimizer detection; segment types; composable refactor; sequential boundaries; orchestrator wiring; lint + app start.
**Focus:** Ordered multi-segment scheduling with correct inner/outer boundaries.

- [x] ### Session 6.16.3: Integration + rename tranches
**Description:** End-to-end verification with test event-shape data; sequential scheduling verification; downstream inventory (persistence, calendar events, API, confirmation UX); mechanical minimizer rename pass executed or documented per tranche.
**Tasks:** E2E data verification; downstream checklist; rename/migration execution or documentation; lint + app start; phase handoff.
**Focus:** No half-renamed API; downstream behavior documented or implemented; honest phase close.

---

## Dependencies

**Prerequisites:** Phase 6.12.5 (`differentialEventRoleOverrides`) complete. `PartFinal.minimizer: TernaryBoolean` type change landed. Phase 6.14 (organization defaults) complete for numeric policy context.

---

## Success Criteria

- [x] `margin` (or agreed name) exists in **DifferentialRole** storage and admin UI; **`PartFinal.minimizer === 'override'`** when margin applies. *(Sessions 6.16.1 / pipeline.)*
- [x] Multiple minimizer shapes schedule in **order** with correct inner/outer boundaries. *(Session 6.16.2 — aggregate duration + segment ordering utilities; per-segment inner chaining deferred per planning.)*
- [ ] Calendar invite pipeline documents which shapes create **separate** events vs **inline** on the main appointment. *(Gap: EventInstance-driven invites documented in `session-6.16.3-downstream-inventory.md`; product mapping for “one event per minimizer segment” not defined.)*
- [x] **`differentialEventRoleOverrides`** path supports margin / multi-minimizer per phase guide. *(Admin `DifferentialEventRoleOverridesField.vue` includes `margin`; overrides apply in booking resolution.)*
- [x] Mechanical **minimizer** rename completed or explicitly phased with migration notes (no half-renamed public API). *(Migration `20260432_000049_rename_moveable_to_minimizer.mjs` + grep audit in `session-6.16.3-downstream-inventory.md`.)*
- [x] Lint and app start pass. *(Lint run at task close; app start per session-end checklist.)*

---

## Related Documents

- `feature-appointment-workflow-guide.md` — Phase 6.16 row and detailed bullet
- `phases/phase-6.16-planning.md` — phase contract
- `phases/phase-6.12-guide.md` — Session 6.12.5 (`differentialEventRoleOverrides`)
- `features/calendar-appointment-availability/sessions/session-3.6.2-guide.md` — `differentialRole` on `EventShape`
- `client/src/types/booking/partFinal.ts` — **`PartFinal.minimizer`**
- `client/src/utils/booking/partFinalizer.ts` — role → flags

<!-- end excerpt phase -->