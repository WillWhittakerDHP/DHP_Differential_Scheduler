<!-- harness-planning-rollup tier=phase id=6.16 consolidatedAt=2026-03-26T02:35:14.051Z -->

# Consolidated planning: phase 6.16

## Phase 6.16 (parent)

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

## Files

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

---

## Session 6.16.1 (source: session-6.16.1-planning.md)

### Story

**This session delivers** the `margin` differential role end-to-end — from DB ENUM + shared types through the part finalizer pipeline to the admin override UI — **so that** event shapes can be assigned `margin` for pre-major temporal placement, and the booking slot pipeline correctly sets `PartFinal.minimizer === 'override'` for margin parts.  
**Estimated size:** M

### Analysis

- **What problem does this solve and why now?** The `margin` role (pre-major anchor) is the first concrete extension of the ternary `PartFinal.minimizer` system designed in Phase 6.16. Without it, `minimizer: 'override'` is dead code — never emitted. Margin must land before multi-minimizer (6.16.2) because it exercises the same type + pipeline + admin surface.
- **Domain boundaries:** Shared types (`shared/types/differentialRole.ts`, `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`); server model + migration (`server/src/db/models/booking/event_shape.ts`, migrations); client booking utilities (`client/src/utils/booking/partFinalizer.ts`); admin field component (`client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`).
- **Existing patterns:** `DifferentialRole` union + `DifferentialRoleStorage` + `DIFFERENTIAL_ROLE_LABELS` + `DIFFERENTIAL_ROLE_SELECT_OPTIONS` — add `margin` to each. `resolvePartShapeDifferentialFlags` uses an `if/else if` chain on `effectiveDifferentialRole` output — add `margin` branch. Admin field uses `roleSelectItems` derived from shared constants.
- **Risks:** (1) DB ENUM migration on remote — we author migration but **do not run** (migration authority rule: `DB_HOST` is remote). (2) ENUM rename strategy: decide whether to keep `moveable` in storage and alias on client, or add `minimizer` alongside — **decision: keep `moveable` in DB for now**, add only `margin`; rename is session 6.16.3.
- **ENUM rename strategy decision (locked):** Add `margin` to DB ENUM alongside existing `moveable`. Do **not** rename `moveable` → `minimizer` in this session — that is 6.16.3 scope. Client code already uses `minimizer` field name on `PartFinal`; the mapping `'moveable' → minimizer: 'true'` and `'margin' → minimizer: 'override'` keeps storage and client aligned without churn.

### Goal

Add `margin` to `DifferentialRole` across the full stack — shared types, DB migration, server model, part finalizer pipeline (`minimizer: 'override'` for margin), admin label/select/override UI — so event shapes can be assigned `margin` and the booking pipeline correctly flags margin parts.

### Files

- `shared/types/differentialRole.ts` — add `'margin'` to `DifferentialRole` and `DifferentialRoleStorage`
- `shared/constants/differentialRoleMappings.ts` — add `margin: 'Margin'` label + select option
- `shared/utils/differentialRoleUtils.ts` — update `isDifferentialRoleStorage`, `isDifferentialRoleOverrideValue`, `parseDifferentialRole`
- `server/src/db/models/booking/event_shape.ts` — add `'margin'` to TypeScript union and `DataTypes.ENUM`
- `server/src/db/migrations/` — new migration: `ALTER TYPE differential_role_enum ADD VALUE 'margin'`
- `client/src/utils/booking/partFinalizer.ts` — `resolvePartShapeDifferentialFlags`: add `role === 'margin'` → `minimizer = 'override'`
- `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` — verify `roleSelectItems` picks up new constant
- `client/src/utils/admin/differentialRoleMatrixRows.ts` — verify compatibility

### Approach

1. **Task 6.16.1.1 (Shared types + constants):** Extend `DifferentialRole`, `DifferentialRoleStorage`, labels, select options, and all util guards/parsers in `shared/`.
2. **Task 6.16.1.2 (Server model + migration):** Add `'margin'` to `event_shape.ts` model TypeScript union and Sequelize ENUM; author migration file (do not run — remote DB).
3. **Task 6.16.1.3 (Part finalizer pipeline):** Add `'margin'` branch in `resolvePartShapeDifferentialFlags` → `minimizer = 'override'`; verify `enrichBlockFinalsWithDifferentialRoles` passes it through.
4. **Task 6.16.1.4 (Admin UI + lint):** Confirm admin field + matrix builder pick up new role from shared constants; run client + server lint; verify app starts.

### Checkpoint

- `margin` exists in `DifferentialRole` union, DB ENUM (migration authored), server model, and admin UI select.
- `resolvePartShapeDifferentialFlags` returns `minimizer: 'override'` when effective role is `'margin'`.
- No silent fallback: margin does not silently map to `'none'` or get dropped.
- Client and server lint pass; app starts.

### Deliverables

- Extended `DifferentialRole` / `DifferentialRoleStorage` types with `'margin'`
- Updated shared constants: labels, select options
- Updated shared utils: guards, parsers, sanitizers
- Server model with `'margin'` in TypeScript union and ENUM
- Migration file for `ALTER TYPE differential_role_enum ADD VALUE 'margin'` (authored, not executed)
- Part finalizer: `'margin'` → `minimizer: 'override'` branch
- Admin override field: `Margin` option in dropdown
- Lint clean; app starts

### Acceptance Criteria

- [ ] `DifferentialRole` includes `'margin'`; `DifferentialRoleStorage` includes `'margin'`
- [ ] `DIFFERENTIAL_ROLE_LABELS.margin === 'Margin'`; select options include margin
- [ ] `isDifferentialRoleStorage('margin') === true`; `parseDifferentialRole('margin') === 'margin'`
- [ ] Server `event_shape` model accepts `'margin'` without type error
- [ ] Migration file exists (authored but not run per migration authority)
- [ ] `resolvePartShapeDifferentialFlags` sets `minimizer: 'override'` when effective role is `'margin'`
- [ ] Admin differential-role-override dropdown includes "Margin"
- [ ] Client lint passes; server lint passes; app starts

---

---

## Session 6.16.2 (source: session-6.16.2-planning.md)

### Story

**This session delivers** ordered **multi-minimizer** scheduling (detect all minimizer-role event shapes, chain segment boundaries) **so that** appointments with more than one minimizer-shaped block can pick completion windows in sequence without breaking slot math or the availability sub-step.

**Estimated size:** M (two tasks: utilities/types first, then composable + orchestrator wiring).

---

### Analysis

- **Problem / why now:** `useMoveablePartsScheduling` uses `getEventShapeByRoleWithOverrides(..., 'moveable', …)` and effectively assumes **at most one** minimizer-role shape. Product intent (phase guide) requires **multiple** minimizer segments with **sequential inner/outer boundary chaining**. Margin (`minimizer: 'override'`) is **not** the same path — it stays pre-major; this session focuses on **`minimizer: 'true'`** shapes (still stored as role `moveable` until rename tranche).

- **Domain boundaries:** **Booking / wizard** — `client/src/composables/booking/*`, `client/src/utils/booking/*`, `client/src/utils/eventAttendeeUtils.ts`, `client/src/types/moveableScheduling*`. **Shared** — only if a new exported helper belongs next to `effectiveDifferentialRole` (prefer client-side first unless both sides need it). See [.project-manager/ARCHITECTURE.md](.project-manager/ARCHITECTURE.md) §2–4.

- **Patterns:** Keep **thin components**; push ordering and boundary math into **named utilities** with explicit return types. Reuse `buildMoveableSchedulingWindow`, `applyMoveableWindowToComputedSlots`, `computeOuterBoundary` / `extractInnerBoundary` where possible; extend rather than fork.

- **Ordering source of truth:** Prefer **stable order** from `appointmentShape.slotShape.eventFinals` (array index) for multiple shapes that resolve to minimizer role after overrides — document if product later needs explicit sort keys.

- **Risks:** Modal UX for “pick segment 1 then segment 2” vs single modal — may stay **single flow** with internal iteration; avoid silent collapse to first shape only. **No** DB migration in this session unless unavoidable (defer enum rename to 6.16.3).

- **Alternatives:** Full rename `useMoveablePartsScheduling` → `useMinimizerPartsScheduling` in this session — **deferred** to mechanical pass / 6.16.3 unless trivial re-export alias is needed for clarity.

- **Out of scope for 6.16.2:** Google Calendar split, persistence/API checklist (6.16.3); mechanical `moveable` → `minimizer` identifier rename across repo.

---

### Goal

1. Detect **all** event shapes whose **effective** differential role is the minimizer storage role (`moveable` today) in **deterministic order**.
2. Introduce **segment-level** types/helpers so each segment has duration, boundaries, and optional labels without duplicating logic per segment.
3. Refactor **scheduling composable** (and **availability orchestrator / sub-step** wiring) so multiple segments chain **outer → inner** boundaries correctly and the user flow still validates against governance (explicit return types on exported composables).

---

### Files

| Area | Paths |
|------|--------|
| Role / shape resolution | `client/src/utils/eventAttendeeUtils.ts` (or new `client/src/utils/booking/minimizerEventShapes.ts` if file grows) |
| Bounds / window | `client/src/utils/booking/moveableSchedulingBounds.ts`, `applyMoveableWindowToComputedSlots.ts` (only if API must widen) |
| Types | `client/src/types/moveableScheduling.ts`, optional `client/src/types/booking/minimizerSegment.ts` |
| Composable | `client/src/composables/booking/useMoveablePartsScheduling.ts` |
| Orchestrator / sub-step | `client/src/composables/booking/useAvailabilityOrchestrator.ts`, `useAvailabilitySubStepContent.ts` (minimal wiring only) |
| Reference | [phase-6.16-guide.md](../phases/phase-6.16-guide.md), [session-6.16.2-guide.md](session-6.16.2-guide.md) |

---

### Approach

1. **Utilities first:** Implement `getMinimizerEventShapesOrdered` (name TBD) returning `EventShapeEntity[]` filtered by `effectiveDifferentialRole === 'moveable'` (storage), ordered by `eventFinals` index. Add typed **segment descriptor** (id, duration, display name) built from each shape.
2. **Boundaries:** For each segment after the first, treat **previous segment’s outer boundary** as constraint for the next **inner** range; document invariants in a short comment block near the chain function.
3. **Composable:** Replace single `moveableEventFinal` with **list**; derive `moveableOptions` / slots per active segment or a stepped index — smallest change that preserves existing modal + stepper behavior when `length === 1`.
4. **Orchestrator:** Pass through any new refs/computed needed by the availability sub-step; no new cross-domain imports from admin.

---

### Checkpoint

- With **two** minimizer-role shapes on a test appointment template, scheduling logic considers **both** in order (no silent drop).
- **One-shape** appointments behave as today (regression).
- Client lint clean for touched files; `npm run start:dev` starts.

---

### Deliverables

- Ordered multi-minimizer detection utility (+ types).
- Composable supports sequential multi-segment boundary chaining.
- Orchestrator / sub-step wired so the wizard availability step receives correct data.
- Session log + handoff updated at session-end.

---

### Acceptance Criteria

- [ ] Phase 6.16 guide intent for **6.16.2** satisfied: multi-minimizer detection + composable + orchestrator wiring.
- [ ] No silent fallback when multiple minimizer shapes exist.
- [ ] Client lint passes; app starts.
- [ ] Session guide tasks 6.16.2.1 / 6.16.2.2 align with this decomposition (update guide at task-start if labels differ).

---

---

---

## Session 6.16.3 (source: session-6.16.3-planning.md)

### Story

**This session delivers** verified integration of margin + multi-minimizer flows and a closed book on **minimizer** rename/storage alignment **so that** phase 6.16 can complete without undocumented downstream gaps or a split public vocabulary (`moveable` vs `minimizer`).
**Estimated size:** M

---

### Analysis

- **Problem / why now:** Phases 6.16.1–6.16.2 implemented storage semantics, pipeline, and multi-segment minimizer UX in code. Phase 6.16 success criteria still require **downstream honesty** (persistence, calendar, API, confirmation copy) and **rename discipline** (no mixed `moveable` / `minimizer` vocabulary in public layers). This session closes those gaps or documents phased follow-ups explicitly.
- **Cross-domain:** Booking composables ↔ server appointment/availability routes ↔ optional Google Calendar / invite documentation; admin overrides (`differentialEventRoleOverrides`) where they touch event shapes.
- **Patterns to follow:** Existing `useMinimizerPartsScheduling` / orchestrator wiring; `shared/utils/differentialRoleUtils.ts` — **no** legacy coercion from obsolete tokens; use `@shared` for API-aligned enums.
- **Risks:** `DB_HOST` remote — **do not** run migrations on shared DB from this machine; author or verify migrations only, execute on localhost. Oversized composable refactors are **out of scope** unless they block correctness.
- **Alternatives:** Full calendar implementation vs **document-first** for split events — prefer document + gap list unless product demands code in-session.

### Goal

1. **Verify** margin + multi-minimizer scheduling end-to-end in the booking wizard (happy paths + at least one edge: no silent fallback when multiple segments exist).
2. **Inventory** downstream: appointment persistence payloads, relevant internal APIs, confirmation UX strings, and calendar/invite touchpoints; **document** Google Calendar split behavior (separate events vs inline) per phase guide or file a concise gap in session log.
3. **Rename / storage tranches:** Align remaining **public** API and stored JSON with **`minimizer`** vocabulary; confirm migration `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs` scope; grep for stale **`moveable`** in user-facing or cross-boundary surfaces; update phase/session docs when tranches complete.

### Files

| Area | Paths |
|------|--------|
| Booking / minimizer | `client/src/composables/booking/useMinimizerPartsScheduling.ts`, `useMinimizerAvailableDayKeys.ts`, `useAvailabilityOrchestrator*.ts`, `utils/booking/minimizer*.ts`, `types/minimizerScheduling.ts` |
| Part final / roles | `client/src/utils/booking/partFinalizer*.ts`, `enrichBlockFinalsWithDifferentialRoles*`, `shared/utils/differentialRoleUtils.ts`, `shared/types` for `DifferentialRole` / event shapes |
| Server | `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs`, models/repos/routes touching `event_shapes.differential_role`, wizard JSONB columns |
| Calendar / invites | `server/src/services/google/` (or calendar invite pipeline), relevant routes — **inventory + doc** |
| Docs | `phases/phase-6.16-guide.md` (session 6.16.3 checkbox), `session-6.16.3-log.md`, `session-6.16.3-handoff.md` when created |

### Approach

1. **Task 6.16.3.1** — Run integration verification + downstream checklist; record findings in session log; add or update a short **calendar split** note (markdown in `.project-manager` or inline in phase guide) as appropriate.
2. **Task 6.16.3.2** — Rename/storage alignment: verify migration coverage, fix any remaining boundary leaks, run **localhost** migration only if `DB_HOST` is local; lint + app start; tick phase guide success items that are truly done.

### Checkpoint

Before **session-end:** app starts; client + server lint clean for touched code; session log lists verification evidence; handoff **Next Action** filled; no silent fallback in resolver paths for multi-segment minimizer.

### Deliverables

- Checklist-style **downstream inventory** (persistence / API / UX / calendar) with **done** or **documented gap**.
- **Google Calendar / invite** behavior documented for multi-minimizer + margin (matches code or explicit gap).
- **Rename tranche** status: migration verified + stale public `moveable` eliminated **or** explicit phased notes in planning/log.
- Phase **6.16** guide session **6.16.3** row and success criteria updated where satisfied.

### Acceptance Criteria

- [ ] Wizard flow exercised with **margin** and **multi-minimizer** data; scheduling behavior matches intent (aggregate duration / labels; no silent single-segment collapse).
- [ ] Downstream inventory complete; calendar split **documented** or gap explicitly logged.
- [ ] Public API / stored JSON vocabulary consistent with **`minimizer`** tranche plan; migration path documented; **no** unauthorized migration run against remote `DB_HOST`.
- [ ] `client` + `server` lint pass for touched files; `npm run start:dev` verified for session closeout.
- [ ] Session log + handoff updated; child tasks completed via task-end cascade.

---

---
