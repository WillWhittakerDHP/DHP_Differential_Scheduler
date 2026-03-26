# Plan: phase 6.16 — Differential role generalization (margin + multiple minimizers)

## Contract

- **Tier:** phase | **ID:** 6.16
- **Scope:** Margin role (pre-major placement), multiple minimizer segments, `PartFinal.minimizer` ternary semantics, calendar/API/confirmation inventory; phased rename **moveable → minimizer** in code and persisted payloads
- **Governance:** Type boundaries (`shared` vs `client/src/types/booking`), function/composable thresholds, no silent fallbacks — use `createLogger` in catch paths; read type and composable playbooks before slot pipeline and booking composable edits

## Where we left off

Design captured in `phases/phase-6.16-guide.md`. **`PartFinal.minimizer: TernaryBoolean`** replaces **`moveable: boolean`** in client types/factory/role enrichment where not yet done; full identifier and API rename is tranched across 6.16.x sessions with explicit migration notes for stored JSON.

## Story

As a scheduler, I can model **margin** work (pre-major anchor) and **multiple minimizer** segments with correct ordering and boundaries so slot math, admin overrides, and downstream calendar/API behavior stay consistent with **`PartFinal.minimizer`** (`'false'` | `'true'` | `'override'`).

## Analysis

- **Domains:** Booking (PartFinal, part finalizer, slot shapes), differential roles on event shapes, admin block-instance overrides (`differentialEventRoleOverrides` from Phase 6.12.5), availability/wizard orchestration (`useMoveablePartsScheduling` → eventual `useMinimizerPartsScheduling`), server ENUM/migrations for `differential_role`, persistence (`appointment` step data, `wizard_settings`).
- **Cross-boundary:** Shared differential role type + DB enum must agree with client `TernaryBoolean` on `PartFinal`; API payloads that echo persisted wizard keys need coordinated rename tranches to avoid half-migrated clients.
- **Risks:** Double migration on DB ENUM if we rename `moveable` → `minimizer` twice — **decide storage vs alias in session 6.16.1**; silent mapping in resolvers without logs; calendar split (main vs separate events) drifting from product intent without documentation.
- **Patterns:** Align with existing **`TernaryBoolean`** usage (`major`/`minor` on PartFinal, block `differential`, `agent_permissions`); extend **`differentialEventRoleOverrides`** for margin and multi-minimizer when UI exists; sequential boundary chaining in composables should stay testable via pure utilities where possible.
- **Testing:** Automated tests suspended (`TEST_ENABLED=false`); verification is manual/lint/app-start per session until Phase 3.0.

## Goal

Deliver **margin** + **multiple minimizer** scheduling with explicit **three-state placement** on **`PartFinal`** (`'false'` plain major/minor timeline, `'true'` minimizer segment, `'override'` margin / pre-major). Extend slot math, perspective resolution, admin overrides, and document **Google Calendar** split (main appointment vs separate events). Execute or document phased **minimizer** rename with migrations for stored JSON where needed.

## Files (initial)

- `phases/phase-6.16-guide.md` — canonical terminology and semantics
- `shared/types/` — `DifferentialRole` / enums + migration alignment
- `client/src/types/booking/partFinal.ts`, PartFinal factories — `minimizer` ternary
- `client/src/utils/booking/partFinalizer.ts`, `partFinalizerSlotShape*.ts` — duration and offsets
- `client/src/utils/booking/` — `enrichBlockFinalsWithDifferentialRoles` and related
- `client/src/composables/booking/useMoveablePartsScheduling.ts` — multi-segment; rename in mechanical pass
- Server: models/migrations for `event_shapes.differential_role` (ENUM), routes touching shapes
- Invite / appointment persistence paths — inventory in 6.16.3
- Phase 6.12.5 override surfaces — admin matrix for margin / minimizer splits

## Approach

1. **6.16.1** — DB + shared types for **margin**; set **`PartFinal.minimizer`** to **`'override'`** when margin applies; slot pipeline + perspective + admin dropdown; lock ENUM rename strategy (`minimizer` vs alias).
2. **6.16.2** — Multiple minimizer shapes; detection utilities; MinimizerSegment-style types; `useMoveablePartsScheduling` multi-segment refactor + sequential boundaries; orchestrator / availability sub-step wiring.
3. **6.16.3** — End-to-end verification + downstream checklist (persistence, calendar events, API, confirmation UX); rename/migration tranches executed or explicitly documented.

## Checkpoint

Phase guide success criteria satisfied; session logs and handoff updated; no silent fallback in resolver paths; client and server lint clean for touched code; app start verified per session closeout.

## Deliverables

- **`margin`** in **DifferentialRole** (storage + admin); **`PartFinal.minimizer === 'override'`** when margin applies; slot pipeline and perspective resolver updated.
- **Multiple minimizers:** ordered segments with correct inner/outer boundaries in scheduling composables.
- **Overrides:** `differentialEventRoleOverrides` extended for margin and multiple minimizer shapes where the phase guide requires.
- **Downstream:** documented (or implemented) behavior for calendar split, API payloads, confirmation copy; persistence inventory closed or ticketed.
- **Rename:** mechanical minimizer rename completed **or** phased with migration notes — no half-renamed public API.
- **Quality:** Lint and app start pass; no new test files while testing suspended unless project policy explicitly allows.

## Acceptance Criteria

- [ ] `margin` (or agreed name) exists in **DifferentialRole** storage and admin UI; **`PartFinal.minimizer === 'override'`** when margin applies.
- [ ] Multiple minimizer shapes schedule in **order** with correct sequential boundaries.
- [ ] Calendar invite pipeline **documents** which shapes create **separate** events vs **inline** on the main appointment (and implementation matches doc or gap is ticketed).
- [ ] **`differentialEventRoleOverrides`** path supports margin / multi-minimizer per phase guide when those controls exist.
- [ ] Mechanical **minimizer** rename completed **or** explicitly phased with migration notes (stored JSON + server keys).
- [ ] Client and server lint pass for touched files; app starts.

## Decomposition

| Unit | Session | Outcome |
|------|---------|---------|
| **Margin foundation** | 6.16.1 | Types, DB/migration decision, `PartFinal.minimizer: 'override'` for margin, slot pipeline + perspective + admin, lint |
| **Multi-minimizer scheduling** | 6.16.2 | Utilities, segment types, composable multi-segment + sequential boundaries, orchestrator/sub-step |
| **Integration + rename tranches** | 6.16.3 | E2E verification, downstream inventory, rename/migration execution or documented tranches |

**Leaf tier:** Sessions 6.16.1–6.16.3 are **session**-tier; each will use `session-start` → planning/guide → tasks as needed.

---

## Coverage check (agent)

**Goal:** Generalize differential roles for margin placement, multiple minimizer segments, and ternary `PartFinal.minimizer`, with downstream and rename discipline.

**Decomposition coverage:** The three sessions map directly to the guide’s 6.16.1–6.16.3 bullets (margin + pipeline, multi-minimizer composable work, integration + inventory + rename). Deliverables and AC mirror `phase-6.16-guide.md` success criteria. **Gap none** for phase-level planning; session-level planning docs will add file-level tasks.
