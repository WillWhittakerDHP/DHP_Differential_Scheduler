# Phase 6.16 Guide: Differential Role Generalization — Margin, Minimizer, and Ternary Placement

**Purpose:** Phase-level guide for extending differential roles (margin before major, multiple minimizer segments), aligning **PartFinal** placement with **`TernaryBoolean`**, and coordinating calendar/API/confirmation behavior.

**Tier:** Phase (Tier 1 — High-Level)

---

## Overview

**Phase Number:** 6.16  
**Phase Name:** Differential Role Generalization: margin + multiple minimizers  
**Description:** Add a **`margin`** differential role (deterministic **pre-major** temporal position — work that sits at the **front** of the anchored appointment window). Support **multiple minimizer** segments with **sequential boundary chaining** in scheduling composables. Align **`PartFinal.minimizer: TernaryBoolean`** (`'false'` plain timeline, `'true'` minimizer, `'override'` margin). Inventory and extend **downstream** behavior: appointment persistence, **Google Calendar event creation** (what stays on the main event vs a separate calendar event), API payloads, and confirmation copy. Execute or document phased **moveable → minimizer** rename with migrations for stored JSON.

**Duration:** 3 sessions (6.16.1 margin foundation, 6.16.2 multiple minimizers, 6.16.3 integration + rename) — see `phases/phase-6.16-planning.md`.  
**Status:** Not started

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

**Direction:** Prefer the name **minimizer** in **code identifiers** (composables, types, CSS classes where renamed), and align **user-facing** strings in a later pass.

**Scope of rename (phased):**

1. **Done in tree:** `PartFinal` field **`minimizer: TernaryBoolean`** replaces **`moveable: boolean`**.
2. **Planned mechanical pass:** Rename wizard/composable/API identifiers; **requires** migration strategy for persisted JSON and server keys.
3. **Database `differential_role` enum:** May introduce **`minimizer`** or keep **`moveable`** as storage — decide in 6.16.1 to avoid double-migration churn.

---

## PartFinal.minimizer — `TernaryBoolean` semantics

| Value | Meaning (placement) |
|--------|---------------------|
| **`'false'`** | Plain **major/minor** timeline — **no** separate minimizer scheduling segment. |
| **`'true'`** | **Minimizer** — separately scheduled segment (completion window). |
| **`'override'`** | **Margin** — **pre-major** anchor (front of window). |

**Interaction with `differentialEventRoleOverrides`:** Phase 6.16 extends the override map for **margin** and multiple minimizer shapes once the role enum and admin UI exist.

---

## Tasks

- DB migration: add **`margin`** to `differential_role` ENUM; decide storage vs alias strategy.
- Shared types, part finalizer, perspective resolver, admin override surface.
- Multi-minimizer composable work (6.16.2); downstream inventory + rename tranches (6.16.3).

### Sessions Breakdown

- [ ] ### Session 6.16.1: Margin role — types, pipeline, admin
- [ ] ### Session 6.16.2: Multiple minimizers — segments, composable, orchestrator
- [ ] ### Session 6.16.3: Integration + rename tranches

---

## Dependencies

**Prerequisites:** Phase 6.12.5 (`differentialEventRoleOverrides`). `PartFinal.minimizer: TernaryBoolean` type change. Phase 6.14 organization defaults for numeric policy context.

---

## Success Criteria

- [ ] `margin` in **DifferentialRole** storage and admin UI; **`PartFinal.minimizer === 'override'`** when margin applies.
- [ ] Multiple minimizer shapes schedule in **order** with correct boundaries.
- [ ] Calendar pipeline documented for separate vs inline events.
- [ ] Mechanical **minimizer** rename completed or phased with migration notes.
- [ ] Lint and app start pass.

---

## Related Documents

- `feature-appointment-workflow-guide.md`
- `phases/phase-6.16-planning.md`
