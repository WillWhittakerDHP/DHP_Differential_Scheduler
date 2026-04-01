# Domain rewrite worklog

## Checkpoint 1

- Section completed: Outline and execution setup
- Decisions made (with principles refs):
  - `FEATURE_20_ARCHITECTURE_REDESIGN.md` will mirror the approved rewrite order and cite `ARCHITECTURE_PRINCIPLES.md` section references in every major section.
  - Conflicting v1 assumptions will be deleted instead of reconciled where they contradict Principles §2, §3, §4, §5, or §7.
- Open questions:
  - None at this checkpoint.
- Next 3 actions:
  - Write sections 0-2 in v2.
  - Run contradiction checks for the three-property model and part-instance terminology.
  - Log the next checkpoint before moving to admin redesign.
- Resume sentence:
  - Continue at v2 sections 0-2, then run the first contradiction scan against principles.

## Checkpoint 2

- Section completed: v2 sections 0-2
- Decisions made (with principles refs):
  - Three-property ownership stays on `block_instances`, not `block_shapes` (Principles §2, §3.1, §8 invariant 2).
  - Event routing remains relational through `event_assignments`; no scalar event columns are introduced on part instances (Principles §4.2, §8 invariant 3e).
  - Base values remain owned only by service orchestrators; no atomic-service default/floor rewrite is allowed (Principles §4.1, §8 invariant 3a-3b).
  - User instances remain inside the three-property model (Principles §1, §2, §8 invariant 2, §8 invariant 6).
- Open questions:
  - None at this checkpoint.
- Next 3 actions:
  - Write sections 3-6.
  - Run contradiction checks for orchestration terminology and server-side resolution drift.
  - Log the next checkpoint before writing the final phasing and readiness sections.
- Resume sentence:
  - Continue at v2 sections 3-6, then scan for validity-definition drift and client-versus-server drift.

## Checkpoint 3

- Section completed: v2 sections 3-7
- Decisions made (with principles refs):
  - Admin orchestration editors are framed only as active-assignment selectors constrained by the shape-level validity graph (Principles §3.3, §7.2, §8 invariant 2b).
  - Event routing language is normalized to event orchestrator baseline plus event profile overrides (Principles §4.2, §5.2, §8 invariant 3e).
  - Booking resolution remains client-only and the server remains a configuration/persistence boundary (Principles §4.3, §8 invariant 3f).
  - The default-routing position is explicit baseline routing, not implicit fallback behavior (Principles §5.2).
- Open questions:
  - None at this checkpoint.
- Next 3 actions:
  - Write section 8 ordered implementation passes.
  - Write section 9 readiness, drift, migration, and risk material.
  - Run a full-document contradiction and principle-coverage scan.
- Resume sentence:
  - Continue at v2 sections 8-9, then run the final audit and replacement-readiness check.

## Checkpoint 4

- Section completed: v2 sections 8-9 and final audit
- Decisions made (with principles refs):
  - The implementation passes are locked to this execution order: schema, API, admin UX, booking pipeline, migration, rollout (Principles §1-§7 operationalized).
  - Replacement readiness now requires principle coverage, contradiction scan completion, migration notes, risk register, and unresolved-decision status before any file replacement (derived from the locked principles as review controls).
  - Legacy contradictory terms are retained only where they are explicitly named as removal targets or risk checks, not as active architecture language.
- Open questions:
  - None. `Unresolved decisions: none` is recorded in v2.
- Next 3 actions:
  - Review v2 side by side with v1 before any replacement.
  - Use the replacement readiness checklist in v2 section 9.
  - Replace the original redesign file only after manual review passes.
- Resume sentence:
  - Resume by opening `FEATURE_20_ARCHITECTURE_REDESIGN.md` section 9 and applying the replacement readiness checklist before any file swap.

## Checkpoint 5

- Section completed: Side-by-side v1 versus v2 review and execution-detail restoration
- Decisions made (with principles refs):
  - The v2 rewrite remained principle-aligned, but some execution inventories from v1 were too compressed for handoff clarity, so high-value concrete detail was restored without introducing new architecture.
  - The restored detail keeps the same principle boundaries: instance-level three-property model, active-assignment orchestration, event-orchestrator baseline plus event-profile overrides, and client-side finalizer ownership (Principles §2, §3.3, §4.2-§4.4, §5.2, §7).
  - The first-wave editor order is now explicit again: `PlacementTypeEditor`, then `ServiceAtomicEditor`, then the remaining domain editors.
- Open questions:
  - None.
- Next 3 actions:
  - Re-run the replacement readiness checklist after any further edits.
  - Perform manual human review of v2 beside the locked principles before any file replacement.
  - Replace the original redesign file only if the review gate passes.
- Resume sentence:
  - Resume at `FEATURE_20_ARCHITECTURE_REDESIGN.md` section 9.3 and use the replacement readiness checklist before any swap of the original redesign document.

## Checkpoint 6

- Section completed: v2 gap remediation (12-item patch plan) — execution detail and principle citations restored
- Decisions made (with principles refs):
  - Added explicit citations and content aligned to Principles §1 (domain separation on `part_instances`), §4.5–§4.8 (additive composition, rate×input, guarantees, zero-out admin visibility), §5.1 (placement seeds), §6 (MLS / `property_details`), §7.2 (bottom-up admin workflow), and §8 (formal invariants cross-reference in v2 §9.1a).
  - Restored `part_assignments` survival row, seven default placement-type seeds, segment-manager wireframe and behavior bullets, editor component-pattern column, admin composable list (6.1a), and full EntityCard/metadata deletion inventory (6.3a) from v1 §6.8 without reintroducing shape-level three-property language.
- Open questions:
  - None.
- Next 3 actions:
  - Run v2 section 9.3 replacement readiness checklist (including contradiction scan) before any file swap.
  - Manual read of v2 beside `ARCHITECTURE_PRINCIPLES.md`.
  - Replace `DOMAIN_ARCHITECTURE_REDESIGN.md` only if the review gate passes.
- Resume sentence:
  - Resume at `FEATURE_20_ARCHITECTURE_REDESIGN.md` section 9.3 after gap remediation; complete manual review beside locked principles before replacing the original redesign document.

## Checkpoint 7

- Section completed: v2 post-audit refinements (full set from principles cross-check)
- Decisions made (with principles refs):
  - Documented PartFinalizer §4.3 triplet formulas, modular function split, rejection of `resolution_group_id`, and `@shared`/client-only preview rule (Principles §4.2.1, §4.3).
  - Added placement_kind/anchor_edge validation sets, segment calendar payload row (§5.4), stricter `eventShape`/`eventInstance` API notes, seed naming rule §3.2, user orchestrator branch + multi-select orchestration pattern §7.2, MLS §6.2 flow under §7.6, user-instance convention under §7.1, and outline/citation alignment for §1 and §6 on sections 3–6.
- Open questions:
  - None.
- Next 3 actions:
  - Re-run v2 §9.3 replacement readiness checklist after this edit set.
  - Manual read of v2 beside `ARCHITECTURE_PRINCIPLES.md`.
  - Replace `DOMAIN_ARCHITECTURE_REDESIGN.md` only if the review gate passes.
- Resume sentence:
  - Resume at `FEATURE_20_ARCHITECTURE_REDESIGN.md` section 9.3; complete principle coverage and manual review before any redesign file swap.
