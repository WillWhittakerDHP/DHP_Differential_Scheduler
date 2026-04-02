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

## Checkpoint 8

- Section completed: Feature 20 **Phase 20.2** (Pass 2 — API alignment) closed on branch `feature/domain-architecture-alignment`
- Decisions made (with principles refs):
  - Internal entity/relationship/appointment/invite paths align with Phase 20.1 schema and FEATURE_20 **§5.1–5.2** (persistence + raw rows; no server PartFinalizer).
  - Event-shape legacy **`differentialRole`** API keys are isolated in `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts` while preserving reject/strip behavior (**§5.3**).
- Open questions:
  - None for Phase 20.2 closure.
- Next 3 actions:
  - Run **`/phase-start 20.3`** (Pass 3 — Admin UX per **§8.3**).
  - Keep feature handoff **`across-ladder.json`** in sync after tier starts.
  - Continue client/admin work per **`phase-20.3-guide.md`** execution sequence.
- Resume sentence:
  - Continue Feature 20 at **Phase 20.3** — admin UX alignment (`PlacementTypeEditor`, `ServiceAtomicEditor`, segment manager under event block instance, EntityCard replacement sequence).

## Checkpoint 9

- Section completed: Feature 20 **Phase 20.5** — Session **20.5.1** — Task **20.5.1.1** (`20260432_*` ordered inventory, docs only)
- Decisions made (with principles refs):
  - **Lexicographic order** of migration **filenames** under `server/src/db/migrations/20260432_*.mjs` matches Sequelize execution order for this prefix; the list below is the canonical inventory for cross-walking **FEATURE_20** **§9.5** in task **20.5.1.2**.
  - **Tags:** **§1** = block-shape type enum rename (**FEATURE_20** §1). **§2** = schema / validity / event-routing surfaces in §2 (including relational **`event_assignments`** and **`valid_*` graph**). **core** = primary Feature 20 DDL in this tranche. **adjacent** = same prefix but mainline is auth, user_role, wizard copy, availability, or legacy differential/minimizer cleanup. **other** = none of the above primary mapping (still runs in the same sequence).
- Open questions:
  - **§9.5** bullet-by-bullet mapping — deferred to **20.5.1.2**. Baseline orchestrator / seed narrative — **20.5.2**.
- Next 3 actions:
  - Task **20.5.1.2:** add **§9.5** crosswalk table + short narrative to this worklog (or split file if unwieldy).
  - Session **20.5.2:** baseline placement + explicit event-routing defaults in prose.
  - Keep **DB_HOST** migration policy: do not run migrations from consumer machines against shared DBs.
- Resume sentence:
  - Continue at task **20.5.1.2** — map each **§9.5** line to migration id(s) or document **`gap:`**.

### `20260432_*` run order (lexicographic) — one line each

1. `20260432_000034_valid_events_parent_block_shape.mjs` — Reparent `valid_events` from part_shape to block_shape (via valid_parts); drop orphans; skips if `valid_events` absent. **Tags:** §2, core
2. `20260432_000035_event_assignments_block_instance_only.mjs` — `event_assignments` parent is blockInstance only; remap/dedupe/drop orphans. **Tags:** §2, core
3. `20260432_000036_admin_metadata_valid_events_block_shape.mjs` — Admin: validEvents on blockShape; remove partInstance.eventAssignments metadata. **Tags:** §2, core
4. `20260432_000037_availability_default_location_address.mjs` — Persist default location formatted address on `availability_settings`. **Tags:** other
5. `20260432_000038_prune_orphan_availability_differential_attendees.mjs` — Prune orphan `availability_differential_attendees` rows. **Tags:** adjacent
6. `20260432_000039_wizard_settings_moveable_infeasible_message.mjs` — Wizard setting for moveable/minimizer infeasible completion message. **Tags:** adjacent
7. `20260432_000040_sessions_table_auth.mjs` — Feature 7: `sessions` table DDL for express-session / connect-pg-simple. **Tags:** other
8. `20260432_000041_magic_links_table_auth.mjs` — Feature 7: `magic_links` table DDL. **Tags:** other
9. `20260432_000043_wizard_settings_selection_card_tooltip_delay.mjs` — Wizard setting: selection card tooltip delay ms. **Tags:** other
10. `20260432_000044_add_margin_to_differential_role_enum.mjs` — Add `margin` to `differential_role_enum` and eventShape admin select options. **Tags:** adjacent
11. `20260432_000045_magic_links_user_id_nullable_admin_enum_will_user.mjs` — Magic links `user_id` nullable + admin enum + seed staff user. **Tags:** other
12. `20260432_000046_magic_links_drop_legacy_token_column.mjs` — Drop legacy `magic_links.token` column. **Tags:** other
13. `20260432_000047_sessions_drop_legacy_token_column.mjs` — Drop legacy `sessions.token` column. **Tags:** other
14. `20260432_000048_sessions_expire_column_align_expires_at.mjs` — Align sessions expiry column naming (`expire` vs `expires_at`). **Tags:** other
15. `20260432_000049_rename_moveable_to_minimizer.mjs` — Rename differential role moveable → minimizer (ENUM, JSONB, wizard columns, admin metadata). **Tags:** adjacent
16. `20260432_000050_event_shape_drop_ternary_metadata_fix_differential_role_select.mjs` — Drop event-shape ternary metadata; fix differentialRole admin select (minimizer + margin). **Tags:** §2, adjacent
17. `20260432_000051_rename_valid_shape_relationship_tables.mjs` — Rename shape-level validity tables (`valid_parts` → `valid_part_cascades`, etc.) + admin metadata keys. **Tags:** §2, core
18. `20260432_000052_rename_valid_booking_cascade_cleanup_function.mjs` — Rename cleanup function to match `valid_booking_cascades`. **Tags:** §2, core
19. `20260432_000053_rename_valid_event_assignments_to_valid_event_cascades.mjs` — Rename `valid_event_assignments` → `valid_event_cascades` where older 051 path applied. **Tags:** §2, core
20. `20260432_000054_rename_valid_part_assignments_to_valid_part_cascades.mjs` — Rename `valid_part_assignments` → `valid_part_cascades` where older 051 path applied. **Tags:** §2, core
21. `20260432_000055_rename_valid_part_cascade_cleanup_function.mjs` — Rename cleanup function to match `valid_part_cascades`. **Tags:** §2, core
22. `20260432_000056_rename_users_user_role_seller_to_owner.mjs` — ENUM `seller` → `owner` on `users.user_role`. **Tags:** other
23. `20260432_000057_create_user_role_block_alignments.mjs` — `user_role_block_alignments` for role → user-type block instance. **Tags:** other
24. `20260432_000058_rename_block_shape_type_enum.mjs` — Rename `block_shapes.type` enum: property→time, coupon→price, option→event; align `appointment_selection_lines.line_kind`. **Tags:** §1, §2, core
25. `20260432_000059_block_instance_three_property_columns.mjs` — Block instances: orchestrator + wizard_visible; drop legacy instance fields; admin metadata updates. **Tags:** §2, core
26. `20260432_000060_drop_block_shape_legacy_boolean_columns.mjs` — Drop legacy `block_shapes` booleans (composable, can_have_parts, is_state_control); prune admin metadata. **Tags:** §2, core
27. `20260432_000061_event_schema_placement_instance_attendees.mjs` — Event schema: placement on `event_shapes`, segment columns on `event_instances`, `event_instance_attendees`, default placement seeds, metadata prune. **Tags:** §2, core
28. `20260432_000062_event_shape_placement_admin_metadata.mjs` — Seed admin_metadata for placement_kind / anchor_edge on event shapes. **Tags:** §2, core

### Grouping callout (same order as above)

- **Relational event + validity graph (early):** 034–036, then **051–055** (rename / cleanup functions).
- **Auth / sessions / magic links:** 040–041, 045–048.
- **Wizard / availability / differential-era cleanup:** 037–039, 043–044, 049–050.
- **User role (Feature 6 adjacency):** 056–057.
- **Feature 20 phase 20.1 tranche (enum + instance + event):** **058–062**.
