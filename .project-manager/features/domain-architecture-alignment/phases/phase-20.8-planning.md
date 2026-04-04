<!-- harness-planning-rollup tier=phase id=20.8 consolidatedAt=2026-04-03T22:25:00.000Z -->

# Consolidated planning: phase 20.8

## Phase 20.8 (parent)

## Story

**As a** maintainer moving from preflight evidence into execution, **I want** the remaining schema and API contract drift closed first, **so that** admin and booking follow-on work runs against stable naming, ownership, and validation boundaries.

**Estimated size:** **M**

---

## Reference

- `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` — event-routing watchpoint (§1), §14 invariant table with **owning phase 20.8** rows (§14.1, §14.3, §14.3a–c).
- `.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md` — objectives, **Preflight follow-ups (Session 20.7.2)**, session breakdown **20.8.1–20.8.3**.
- `.project-manager/ARCHITECTURE.md` — §10 (PartFinalizer, `event_assignments`), §11 (events / placement), **§14** invariants.
- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §8 passes where they bound residual API/schema work.
- `architecture-alignment-closeout-master-plan.md` — master plan Phases 1–2 mapped to this phase.

## Codebase recon

- **Part ledger / rates:** `rateOverBaseFee` / `rateOverBaseTime` are still the persisted and typed names across `server/src/db/models/booking/part_instance_version.ts`, `client/src/types/entities.ts`, `client/src/types/booking/partFinal.ts`, `client/src/utils/booking/PartFinal.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `server/src/services/instanceVersioning.ts`, `server/src/services/appointmentSnapshotLoader.ts`, and appointment transformers. **20.8.1** decides rename-vs-quarantine vs architecture vocabulary (`timePerUnit` / `feePerUnit`) with migrations + shared types if renaming.
- **Event ownership / routing:** `server/src/db/models/booking/event_instance.ts` — **`parent_block_instance_id`**; `server/src/db/models/booking/event_assignment.ts` — **`event_assignments`**; `server/src/routes/internal/entities/eventInstanceEntityValidation.ts` enforces parent on create. Client: `client/src/constants/relationships.ts` (**blockInstance → eventInstance**); `client/src/utils/transformers/fetchToGlobalTransformer.ts` allows **`parentKind`** on relationships; booking rebuild in `client/src/utils/booking/appointmentSlotBuilder.ts` / `buildEventAssignmentsByPartShape` filters **`parent.entityKey === 'blockInstance'`** — preflight flags **risk** if API emits part-scoped edges only.
- **Attendees / placement:** Phase guide: **`event_shape_attendees`** vs **`event_instance_attendees`** ownership alignment and placement validation — trace in **20.8.2** / **20.8.3** under `server/src/db/models/booking/`, validators, and any client compatibility shims that still surface legacy placement vocabulary.

## Analysis

- **Problem / why now:** Residual schema/API ambiguity is the cheapest place to create downstream confusion. If event ownership, attendee ownership, placement validation, or part-ledger naming are still fuzzy, later UI and booking work will either duplicate adapters or mask the wrong contract.
- **Boundaries:** Server models/routes/validators, shared types, and selected client types/transformers only where contract naming still leaks into the app.
- **Patterns:** Use the Phase 20.7 evidence package to narrow scope to actual residual drift rather than replaying all of **20.1–20.2**.
- **Risks:** Migration execution only on localhost / designated host per workspace **Migration authority** — author migrations in-repo; do not run DDL against shared DB from consumer machines.

## Goal

1. Finish residual part-ledger contract alignment.
2. Finish residual event ownership and attendee ownership enforcement.
3. Tighten placement validation and legacy alias behavior so the API teaches the locked architecture.

## Decomposition

- **Session 20.8.1:** Part-ledger contract residuals
- **Session 20.8.2:** Event ownership and attendee ownership
- **Session 20.8.3:** Placement validation and alias tightening

## Files

- **Evidence / harness:** `preflight-evidence-20.7.2.md`, `phase-20.8-guide.md`, `feature-domain-architecture-alignment-guide.md` (phase **20.8** row)
- **Server:** `server/src/db/models/booking/part_instance*.ts`, `part_instance_version.ts`, `event_instance.ts`, `event_assignment.ts`, `server/src/routes/internal/entities/eventInstanceEntityValidation.ts`, `server/src/services/instanceVersioning.ts`
- **Client:** `client/src/constants/relationships.ts`, `client/src/utils/transformers/fetchToGlobalTransformer.ts`, `client/src/utils/booking/appointmentSlotBuilder.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, PartFinalizer paths under `client/src/utils/booking/`
- **Shared:** `shared/` types and entity keys if version or rate field names change

## Approach

1. **20.8.1:** Trace `rateOverBase*` and version-table fields end-to-end; align naming with locked architecture or **explicitly quarantine** with documented API boundaries (no silent drift).
2. **20.8.2:** Align `event_assignments`, `parent_block_instance_id`, and attendee ownership with **ARCHITECTURE** §10 / §14 and preflight §1.4; reduce API vs booking consumer ambiguity where product requires a single truth.
3. **20.8.3:** Tighten placement validators and narrow legacy alias layers so they do not teach deprecated models as live truth.

## Checkpoint

- **`/accepted-plan`:** Confirms decomposition covers **20.8.1–20.8.3** and maps to **Acceptance Criteria** below.
- **Per session:** Session-level planning at **`/session-start`**; migrations **authored** in-repo, **executed** only where DB policy allows.
- **Phase-end:** Residuals closed or explicitly documented/quarantined with pointers in phase handoff.

## Deliverables

- Ledger: residual `rateOverBase*` / `timePerUnit` / `feePerUnit` drift **resolved or explicitly quarantined**
- Events: `event_assignments` and `parent_block_instance_id` enforcement **matches** locked contract
- Attendees: ownership **segment-based**, not placement-type-based
- Validation: placement and alias compatibility layers **aligned** with locked architecture

## Acceptance Criteria

- [ ] Residual `rateOverBase*` drift is resolved or explicitly quarantined
- [ ] `event_assignments` and `parent_block_instance_id` enforcement matches the locked contract
- [ ] Attendee ownership is segment-based, not placement-type-based
- [ ] Placement validators and compatibility layers no longer teach the wrong model
