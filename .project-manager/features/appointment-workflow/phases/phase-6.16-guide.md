# Phase 6.16 Guide: Differential Role Generalization — Margin, Minimizer, and Ternary Placement

**Purpose:** Phase-level guide for extending differential roles (margin before major, multiple minimizer segments), aligning **PartFinal** placement with **`TernaryBoolean`**, and coordinating calendar/API/confirmation behavior.

**Tier:** Phase (Tier 1 — High-Level)

---

## Phase overview

**Phase number:** 6.16  
**Phase name:** Differential Role Generalization: margin + multiple minimizers  
**Status:** Not started (design captured here; sessions 6.16.1–6.16.3 per feature guide)

**Summary:** Add a **`margin`** differential role (deterministic **pre-major** temporal position — work that sits at the **front** of the anchored appointment window). Support **multiple minimizer** segments with **sequential boundary chaining** in scheduling composables. Inventory and extend **downstream** behavior: appointment persistence, **Google Calendar event creation** (what stays on the main event vs a separate calendar event), API payloads, and confirmation copy.

**Related planning artifact (local Cursor plan, not in repo):** `~/.cursor/plans/differential_role_generalization_7884ea5f.plan.md` — use if present for session decomposition detail.

---

## Terminology: minimizer (née moveable)

**Product intent:** “Moveable” in UX copy referred to work scheduled in a **separate completion window** after the onsite inspection, with contingency/deadline semantics. The codebase historically mixed spellings (**moveable** vs **movable**).

**Direction:** Prefer the name **minimizer** in **code identifiers** (composables, types, CSS classes where renamed), and align **user-facing** strings in a later pass. **Rationale:** “Minimizer” reads closer to “residual / completion segment” and avoids collision with generic English “movable.”

**Scope of rename (phased):**

1. **Done in tree (this change):** `PartFinal` field **`minimizer: TernaryBoolean`** replaces **`moveable: boolean`** (`client/src/types/booking/partFinal.ts`, `PartFinal.ts`, `partFinalizer.ts`).
2. **Planned mechanical pass (Phase 6.16 implementation):** Rename wizard/composable/API identifiers (`useMoveablePartsScheduling` → `useMinimizerPartsScheduling`, `moveableScheduling` payload keys, `moveableFallbackLabel` in wizard settings, etc.). **Requires** migration strategy for persisted JSON (`appointment` step data, `wizard_settings` columns) and coordinated **server schema** renames where keys are stored.
3. **Database `differential_role` enum:** Today includes literal **`moveable`** on `event_shapes`. A dedicated migration may introduce **`minimizer`** (or keep **`moveable`** as storage value with client alias) — decide in 6.16.1 to avoid double-migration churn.

---

## PartFinal.minimizer — `TernaryBoolean` semantics

Use the same **`TernaryBoolean`** type as `major` / `minor` on **`PartFinal`**: `'true' | 'false' | 'override'`.

| Value | Meaning (placement) |
|--------|---------------------|
| **`'false'`** | Plain **major/minor** timeline for this part shape — **no** separate minimizer scheduling segment (not the “completion window” path). |
| **`'true'`** | **Minimizer** — participates in the **separately scheduled** segment (completion window, second temporal band, optional extra calendar event). |
| **`'override'`** | **Margin** — **pre-major** anchor (work pushed to the **front** of the appointment window relative to the major segment), not the free-floating minimizer window. |

**Resolution today:** `enrichBlockFinalsWithDifferentialRoles` sets **`minimizer: 'true'`** when an assigned event shape’s effective differential role is **`moveable`** (until DB enum is renamed). **`'override'`** is reserved for Phase 6.16 **margin** role wiring; until then it is not emitted from role resolution.

**Interaction with `differentialEventRoleOverrides`:** Block-instance overrides (Phase 6.12.5) already divert **major / minor / moveable / none** per event shape. Phase 6.16 extends the same override map for **margin** and multiple minimizer shapes once the role enum and admin UI exist.

---

## Alignment with existing patterns

- **`TernaryBoolean`** elsewhere: block **`differential`**, **`agent_permissions`** (`'true' | 'false' | 'override'`) — same three-value discipline for admin + inheritance.
- **Phase 6.4 / 6.9:** Pre-closing UX and availability sub-step “confirm moveable” are **wizard presentation**; they stay until the minimizer rename pass lands.
- **Phase 6.12.5:** **`differentialEventRoleOverrides`** — matrix over active event shapes; use for conditional diversion when margin vs minimizer splits differ by option block.

---

## Sessions (from feature guide)

- **6.16.1 — Margin role:** Shared types, server model + migration, slot pipeline (PartFinal margin flag is **`minimizer: 'override'`** + duration math), perspective resolver, admin dropdown, lint.
- **6.16.2 — Multiple minimizers:** Detection utilities, `MoveableSegment`-style type (rename to **MinimizerSegment** when doing identifier pass), `useMoveablePartsScheduling` multi-segment refactor + sequential boundaries, orchestrator / sub-step wiring.
- **6.16.3 — Integration:** Test event-shape data, sequential scheduling verification, downstream inventory (persistence, calendar events, API, confirmation UX).

---

## Success criteria (draft)

- [ ] `margin` (or agreed name) exists in **DifferentialRole** storage and admin UI; **`PartFinal.minimizer === 'override'`** when margin applies.
- [ ] Multiple minimizer shapes schedule in **order** with correct inner/outer boundaries.
- [ ] Calendar invite pipeline documents which shapes create **separate** events vs **inline** on the main appointment.
- [ ] Mechanical **minimizer** rename completed or explicitly phased with migration notes (no half-renamed public API).
- [ ] Lint and app start pass.

---

## Related documents

- `feature-appointment-workflow-guide.md` — Phase 6.16 row and detailed bullet
- `phases/phase-6.16-planning.md` — phase contract
- `phases/phase-6.12-guide.md` — Session 6.12.5 (`differentialEventRoleOverrides`)
- `features/calendar-appointment-availability/sessions/session-3.6.2-guide.md` — `differentialRole` on `EventShape`
- `client/src/types/booking/partFinal.ts` — **`PartFinal.minimizer`**
- `client/src/utils/booking/partFinalizer.ts` — role → flags
