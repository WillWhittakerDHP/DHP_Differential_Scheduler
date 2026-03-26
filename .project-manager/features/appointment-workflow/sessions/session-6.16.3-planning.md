<!-- harness-planning-rollup tier=session id=6.16.3 consolidatedAt=2026-03-26T02:29:05.692Z -->

# Consolidated planning: session 6.16.3

## Session 6.16.3 (parent)

## Story

**This session delivers** verified integration of margin + multi-minimizer flows and a closed book on **minimizer** rename/storage alignment **so that** phase 6.16 can complete without undocumented downstream gaps or a split public vocabulary (`moveable` vs `minimizer`).
**Estimated size:** M

---

## Analysis

- **Problem / why now:** Phases 6.16.1–6.16.2 implemented storage semantics, pipeline, and multi-segment minimizer UX in code. Phase 6.16 success criteria still require **downstream honesty** (persistence, calendar, API, confirmation copy) and **rename discipline** (no mixed `moveable` / `minimizer` vocabulary in public layers). This session closes those gaps or documents phased follow-ups explicitly.
- **Cross-domain:** Booking composables ↔ server appointment/availability routes ↔ optional Google Calendar / invite documentation; admin overrides (`differentialEventRoleOverrides`) where they touch event shapes.
- **Patterns to follow:** Existing `useMinimizerPartsScheduling` / orchestrator wiring; `shared/utils/differentialRoleUtils.ts` — **no** legacy coercion from obsolete tokens; use `@shared` for API-aligned enums.
- **Risks:** `DB_HOST` remote — **do not** run migrations on shared DB from this machine; author or verify migrations only, execute on localhost. Oversized composable refactors are **out of scope** unless they block correctness.
- **Alternatives:** Full calendar implementation vs **document-first** for split events — prefer document + gap list unless product demands code in-session.

## Goal

1. **Verify** margin + multi-minimizer scheduling end-to-end in the booking wizard (happy paths + at least one edge: no silent fallback when multiple segments exist).
2. **Inventory** downstream: appointment persistence payloads, relevant internal APIs, confirmation UX strings, and calendar/invite touchpoints; **document** Google Calendar split behavior (separate events vs inline) per phase guide or file a concise gap in session log.
3. **Rename / storage tranches:** Align remaining **public** API and stored JSON with **`minimizer`** vocabulary; confirm migration `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs` scope; grep for stale **`moveable`** in user-facing or cross-boundary surfaces; update phase/session docs when tranches complete.

## Files

| Area | Paths |
|------|--------|
| Booking / minimizer | `client/src/composables/booking/useMinimizerPartsScheduling.ts`, `useMinimizerAvailableDayKeys.ts`, `useAvailabilityOrchestrator*.ts`, `utils/booking/minimizer*.ts`, `types/minimizerScheduling.ts` |
| Part final / roles | `client/src/utils/booking/partFinalizer*.ts`, `enrichBlockFinalsWithDifferentialRoles*`, `shared/utils/differentialRoleUtils.ts`, `shared/types` for `DifferentialRole` / event shapes |
| Server | `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs`, models/repos/routes touching `event_shapes.differential_role`, wizard JSONB columns |
| Calendar / invites | `server/src/services/google/` (or calendar invite pipeline), relevant routes — **inventory + doc** |
| Docs | `phases/phase-6.16-guide.md` (session 6.16.3 checkbox), `session-6.16.3-log.md`, `session-6.16.3-handoff.md` when created |

## Approach

1. **Task 6.16.3.1** — Run integration verification + downstream checklist; record findings in session log; add or update a short **calendar split** note (markdown in `.project-manager` or inline in phase guide) as appropriate.
2. **Task 6.16.3.2** — Rename/storage alignment: verify migration coverage, fix any remaining boundary leaks, run **localhost** migration only if `DB_HOST` is local; lint + app start; tick phase guide success items that are truly done.

## Checkpoint

Before **session-end:** app starts; client + server lint clean for touched code; session log lists verification evidence; handoff **Next Action** filled; no silent fallback in resolver paths for multi-segment minimizer.

## Deliverables

- Checklist-style **downstream inventory** (persistence / API / UX / calendar) with **done** or **documented gap**.
- **Google Calendar / invite** behavior documented for multi-minimizer + margin (matches code or explicit gap).
- **Rename tranche** status: migration verified + stale public `moveable` eliminated **or** explicit phased notes in planning/log.
- Phase **6.16** guide session **6.16.3** row and success criteria updated where satisfied.

## Acceptance Criteria

- [ ] Wizard flow exercised with **margin** and **multi-minimizer** data; scheduling behavior matches intent (aggregate duration / labels; no silent single-segment collapse).
- [ ] Downstream inventory complete; calendar split **documented** or gap explicitly logged.
- [ ] Public API / stored JSON vocabulary consistent with **`minimizer`** tranche plan; migration path documented; **no** unauthorized migration run against remote `DB_HOST`.
- [ ] `client` + `server` lint pass for touched files; `npm run start:dev` verified for session closeout.
- [ ] Session log + handoff updated; child tasks completed via task-end cascade.

---

## Task 6.16.3.1 (source: task-6.16.3.1-planning.md)

### Story

**This task changes** project documentation and the session log **because** stakeholders need a traceable checklist of how margin and multi-minimizer data flows through save paths, APIs, and integrations before rename tranches are finalized in 6.16.3.2.

---

### Analysis

Phase 6.16.3 closes **integration honesty**: downstream surfaces (persistence, calendar, API, copy) must be inventoried and calendar split behavior **documented** or **gapped**. Rename/migration closure is **task 6.16.3.2**.

---

### Goal

- Produce a **single downstream inventory document** plus **session log** update that satisfies session **6.16.3** acceptance criteria for inventory and calendar documentation (or explicit gaps).
- Confirm **multi-segment + margin** behavior is **not silently reduced** to first segment only in the client pipeline (cite code paths—already implemented in 6.16.2; this task **verifies by reference**, not rewrites).

### Files

| Area | Paths |
|------|--------|
| New / updated docs | `.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md` (create), `session-6.16.3-log.md` (update) |
| Read-only references (cite in inventory) | `client/src/utils/transformers/` (appointment ↔ wizard), `client/src/composables/booking/useAvailabilityOrchestrator*.ts`, `server/src/routes/internal/appointments/`, `server/src/services/google/` or calendar invite code, `shared/types` for appointment payloads |

### Approach

1. Search and read persistence/transform paths for appointment creation/update and minimizer-related fields.
2. Draft the inventory markdown with evidence-based rows.
3. Add manual verification bullets aligned with 6.16.2 composable behavior.
4. Update session log; run **client + server lint** if any TS/MD-adjacent edits are not applicable—**docs-only** task: lint only if touched code.

### Checkpoint

Inventory file exists and is linked from session log; session guide task checkbox can move to **in progress** / **done** at task-end.

### Deliverables

- **`session-6.16.3-downstream-inventory.md`** with downstream table + manual check narrative + calendar/invite subsection.
- **`session-6.16.3-log.md`** updated with task 6.16.3.1 completion summary.

### Acceptance Criteria

- [ ] Inventory covers **persistence**, **API**, **confirmation copy**, and **calendar/invite** with honest **verified** vs **gap** labels.
- [ ] Multi-segment minimizer **not** silently collapsed to first shape only is **addressed** (reference to existing code or explicit gap if missing).
- [ ] Session log reflects task 6.16.3.1 completion.
- [ ] No unauthorized migration or test files added.

### Design

1. **Inventory artifact:** Add or extend **`.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md`** with a table: **Surface** | **Path / entrypoint** | **Notes** | **Status (verified / gap / N/A)** covering:
   - Wizard → persisted appointment payload (fields carrying `PartFinal`, minimizer scheduling, contingency).
   - Internal API routes used on confirm or autosave.
   - User-facing confirmation copy that references minimizer/margin (grep-driven list of strings).
   - Google Calendar / invite pipeline: which module builds events, whether multiple minimizer segments map to multiple events vs one block (document **current behavior** or **not wired**).
2. **Session log:** Update **`session-6.16.3-log.md`** with **### Task 6.16.3.1** completed, date, and pointer to the inventory file.
3. **Verification narrative:** In the inventory doc, include a short **Manual wizard check** subsection: expected steps to see multi-segment duration + margin path without silent collapse (references `useMinimizerPartsScheduling` / orchestrator behavior from 6.16.2).
4. **Code exploration:** Use repository search to list concrete files; no behavioral code changes unless a **documentation-only** comment is needed (avoid scope creep).

---

## Task 6.16.3.2 (source: task-6.16.3.2-planning.md)

### Story

**This task changes** documentation and light source hygiene **because** phase 6.16 success criteria require an honest **rename tranche** status and **no** misleading `moveable` naming in active booking code comments where `minimizer` is the product term.

---

### Analysis

Session **6.16.3** requires **rename discipline**: no half-renamed public API; migration notes for DB. **`differentialRoleUtils`** already rejects the obsolete storage spelling without embedding it as a grep-attracting literal. Remaining work is **audit + docs +** optional **cosmetic** renames in live source (comments, UI copy keys already migrated to `minimizer*` in wizard settings).

---

### Goal

- Publish a **rename tranche summary** tied to migration **`20260432_000049_rename_moveable_to_minimizer.mjs`** and a **clean grep** of active source for obsolete public naming.
- Align **phase 6.16** documentation with **actual** completion state without checking boxes for undelivered calendar-split product work.

### Files

| Area | Paths |
|------|--------|
| Docs | `session-6.16.3-downstream-inventory.md` (append) or new `session-6.16.3-rename-tranche.md`, `session-6.16.3-log.md`, `phases/phase-6.16-guide.md` |
| Client (optional) | `client/src/utils/booking/availabilityStepHandlers.ts` — comment only |
| Reference (read-only) | `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs`, `shared/utils/differentialRoleUtils.ts`, `server/src/db/models/booking/event_shape.ts` |

### Approach

1. Run scoped grep; record results in the rename tranche doc.
2. Apply minimal comment edit if grep shows only benign leftovers in target file.
3. Update phase guide checkboxes conservatively.
4. Update session log; run lint if TS changed.

### Checkpoint

Session 6.16.3 ready for **session-end** after this task and user acceptance of doc accuracy.

### Deliverables

- **Rename tranche** subsection or standalone markdown under **`.project-manager/features/appointment-workflow/sessions/`**.
- **Session log** entry for 6.16.3.2.
- **Phase guide** updated where criteria are **actually** met.

### Acceptance Criteria

- [ ] Grep audit of **active** source documented; migration file identified as canonical rename path.
- [ ] No **new** `moveable` / `Moveable` identifiers introduced in **product** TS/Vue under `client/src` / `server/src` (excluding migrations); any intentional historical reference in migrations left untouched.
- [ ] Phase **6.16** guide reflects honest status (rename tranche + prior session work); calendar split criterion remains **unchecked** if still a documented gap.
- [ ] Client + server lint pass after code edits.
- [ ] Migration **not** run against remote DB from this environment.

### Design

1. **Grep pass:** `client/src`, `server/src` (exclude `server/src/db/migrations`), `shared` for `moveable` / `Moveable` in **source**; classify: **historical migration** (ignore), **comment/UI string** (fix if in active booking path), **data** (N/A).
2. **Artifact:** Append **“Rename tranche (6.16.3.2)”** subsection to **`session-6.16.3-downstream-inventory.md`** OR add **`session-6.16.3-rename-tranche.md`** with: migration id, grep summary, “DB execution: localhost only” note.
3. **Hygiene:** Replace stale **“Moveable flow”** wording in **`client/src/utils/booking/availabilityStepHandlers.ts`** comment with **minimizer** terminology (task 6.9.4.2 reference preserved by session id).
4. **Phase guide:** Update **`phase-6.16-guide.md`** success criteria checkboxes **only** for items satisfied by prior sessions + this audit (e.g. mechanical rename + margin + multi-minimizer where verified); leave calendar-split doc item **unchecked** if still gap per 6.16.3.1 inventory.
5. **Session log:** Add **### Task 6.16.3.2** with summary and pointers.
6. **Lint:** `cd client && npm run lint`, `cd server && npm run lint` after any TS edits.

---
