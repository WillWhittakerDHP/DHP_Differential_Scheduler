# Plan: phase 6.16 — Differential role generalization (margin + multiple minimizers)

## Contract

- **Tier:** phase | **ID:** 6.16
- **Scope:** Margin role (pre-major placement), multiple minimizer segments, `PartFinal.minimizer` ternary semantics, calendar/API/confirmation inventory; phased rename **moveable → minimizer** in code and persisted payloads
- **Governance:** Read `.project-manager/ARCHITECTURE.md` (if present), type and function playbooks, before slot pipeline and composable edits

## Where we left off

Design captured in `phases/phase-6.16-guide.md`. **`PartFinal.minimizer: TernaryBoolean`** replaces **`moveable: boolean`** in client types/factory/role enrichment; full identifier and API rename deferred to Phase 6.16 implementation sessions.

## Goal

Deliver **margin** + **multiple minimizer** scheduling with explicit **three-state placement** on **`PartFinal`** (`false` = plain major/minor timeline, `true` = minimizer segment, `override` = margin / pre-major). Extend slot math, perspective resolution, admin overrides, and document **Google Calendar** split (main appointment vs separate events). Complete mechanical **minimizer** rename with migrations for stored JSON where needed.

## Files (initial)

- `phases/phase-6.16-guide.md` — canonical terminology and semantics
- `shared/types/differentialRole.ts` (or equivalent) — role enum + migrations
- `client/src/utils/booking/partFinalizer.ts`, `partFinalizerSlotShape*.ts` — duration and offsets
- `client/src/composables/booking/useMoveablePartsScheduling.ts` — multi-segment (rename in later pass)
- Invite / appointment persistence paths (inventory in 6.16.3)

## Approach

1. **6.16.1** — DB + shared types for **margin**; set **`PartFinal.minimizer`** to **`override`** when margin applies; slot pipeline + perspective + admin.
2. **6.16.2** — Multiple minimizer shapes; sequential boundaries; orchestrator + availability sub-step.
3. **6.16.3** — End-to-end verification + downstream checklist; rename pass plan executed or documented per tranche.

## Checkpoint

Phase guide success criteria satisfied; session logs and handoff updated; no silent fallback in resolver paths.
