# Session 20.5.1: — Migration chain inventory:** Map existing **`20260432_*`** migrations to **FEATURE_20 §1–2** and **§9.5** ordering; note any **ordering gaps** or **undocumented steps**; choose **worklog vs `MIGRATION_SEQUENCE.md`** as the canonical narrative home; first draft of the sequence table.


### Task 20.5.1.1: Task 20.5.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.1.2



## Completed Tasks

### Task 20.5.1.1: Task 20.5.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (6): `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.1.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.1.1-planning.md`

### `git diff --stat HEAD`

```text
.../analysis/DOMAIN_REWRITE_WORKLOG.md             | 54 ++++++++++++++++++++++
 .../across-ladder.json                             |  2 +-
 .../sessions/session-20.5.1-guide.md               |  2 +-
 .../sessions/session-20.5.1-log.md                 | 18 ++++++++
 4 files changed, 74 insertions(+), 2 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
index 1d250ddf..d4941759 100644
--- a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
+++ b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
@@ -125,3 +125,57 @@
   - Continue client/admin work per **`phase-20.3-guide.md`** execution sequence.
 - Resume sentence:
   - Continue Feature 20 at **Phase 20.3** — admin UX alignment (`PlacementTypeEditor`, `ServiceAtomicEditor`, segment manager under event block instance, EntityCard replacement sequence).
+
+## Checkpoint 9
+
+- Section completed: Feature 20 **Phase 20.5** — Session **20.5.1** — Task **20.5.1.1** (`20260432_*` ordered inventory, docs only)
+- Decisions made (with principles refs):
+  - **Lexicographic order** of migration **filenames** under `server/src/db/migrations/20260432_*.mjs` matches Sequelize execution order for this prefix; the list below is the canonical inventory for cross-walking **FEATURE_20** **§9.5** in task **20.5.1.2**.
+  - **Tags:** **§1** = block-shape type enum rename (**FEATURE_20** §1). **§2** = schema / validity / event-routing surfaces in §2 (including relational **`event_assignments`** and **`valid_*` graph**). **core** = primary Feature 20 DDL in this tranche. **adjacent** = same prefix but mainline is auth, user_role, wizard copy, availability, or legacy differential/minimizer cleanup. **other** = none of the above primary mapping (still runs in the same sequence).
+- Open questions:
+  - **§9.5** bullet-by-bullet mapping — deferred to **20.5.1.2**. Baseline orchestrator / seed narrative — **20.5.2**.
+- Next 3 actions:
+  - Task **20.5.1.2:** add **§9.5** crosswalk table + short narrative to this worklog (or split file if unwieldy).
+  - Session **20.5.2:** baseline placement + explicit event-routing defaults in prose.
+  - Keep **DB_HOST** migration policy: do not run migrations from consumer machines against shared DBs.
+- Resume sentence:
+  - Continue at task **20.5.1.2** — map each **§9.5** line to migration id(s) or document **`gap:`**.
+
+### `20260432_*` run order (lexicographic) — one line each
+
+1. `20260432_000034_valid_events_parent_block_shape.mjs` — Reparent `valid_events` from part_shape to block_shape (via valid_parts); drop orphans; skips if `valid_events` absent. **Tags:** §2, core
+2. `20260432_000035_event_assignments_block_instance_only.mjs` — `event_assignments` parent is blockInstance only; remap/dedupe/drop orphans. **Tags:** §2, core
+3. `20260432_000036_admin_metadata_valid_events_block_shape.mjs` — Admin: validEvents on blockShape; remove partInstance.eventAssignments metadata. **Tags:** §2, core
+4. `20260432_000037_availability_default_location_address.mjs` — Persist default location formatted address on `availability_settings`. **Tags:** other
+5. `20260432_000038_prune_orphan_availability_differential_attendees.mjs` — Prune orphan `availability_differential_attendees` rows. **Tags:** adjacent
+6. `20260432_000039_wizard_settings_moveable_infeasible_message.mjs` — Wizard setting for moveable/minimizer infeasible completion message. **Tags:** adjacent
+7. `20260432_000040_sessions_table_auth.mjs` — Feature 7: `sessions` table DDL for express-session / connect-pg-simple. **Tags:** other
+8. `20260432_000041_magic_links_table_auth.mjs` — Feature 7: `magic_links` table DDL. **Tags:** other
+9. `20260432_000043_wizard_settings_selection_card_tooltip_delay.mjs` — Wizard setting: selection card tooltip delay ms. **Tags:** other
+10. `20260432_000044_add_margin_to_differential_role_enum.mjs` — Add `margin` to `differential_role_enum` and eventShape admin select options. **Tags:** adjacent
+11. `20260432_000045_magic_links_user_id_nullable_admin_enum_will_user.mjs` — Magic links `user_id` nullable + admin enum + seed staff user. **Tags:** other
+12. `20260432_000046_magic_links_drop_legacy_token_column.mjs` — Drop legacy `magic_links.token` column. **Tags:** other
+13. `20260432_000047_sessions_drop_legacy_token_column.mjs` — Drop legacy `sessions.token` column. **Tags:** other
+14. `20260432_000048_sessions_expire_column_align_expires_at.mjs` — Align sessions expiry column naming (`expire` vs `expires_at`). **Tags:** other
+15. `20260432_000049_rename_moveable_to_minimizer.mjs` — Rename differential role moveable → minimizer (ENUM, JSONB, wizard columns, admin metadata). **Tags:** adjacent
+16. `20260432_000050_event_shape_drop_ternary_metadata_fix_differential_role_select.mjs` — Drop event-shape ternary metadata; fix differentialRole admin select (minimizer + margin). **Tags:** §2, adjacent
+17. `20260432_000051_rename_valid_shape_relationship_tables.mjs` — Rename shape-level validity tables (`valid_parts` → `valid_part_cascades`, etc.) + admin metadata keys. **Tags:** §2, core
+18. `20260432_000052_rename_valid_booking_cascade_cleanup_function.mjs` — Rename cleanup function to match `valid_booking_cascades`. **Tags:** §2, core
+19. `20260432_000053_rename_valid_event_assignments_to_valid_event_cascades.mjs` — Rename `valid_event_assignments` → `valid_event_cascades` where older 051 path applied. **Tags:** §2, core
+20. `20260432_000054_rename_valid_part_assignments_to_valid_part_cascades.mjs` — Rename `valid_part_assignments` → `valid_part_cascades` where older 051 path applied. **Tags:** §2, core
+21. `20260432_000055_rename_valid_part_cascade_cleanup_function.mjs` — Rename cleanup function to match `valid_part_cascades`. **Tags:** §2, core
+22. `20260432_000056_rename_users_user_role_seller_to_owner.mjs` — ENUM `seller` → `owner` on `users.user_role`. **Tags:** other
+23. `20260432_000057_create_user_role_block_alignments.mjs` — `user_role_block_alignments` for role → user-type block instance. **Tags:** other
+24. `20260432_000058_rename_block_shape_type_enum.mjs` — Rename `block_shapes.type` enum: property→time, coupon→price, option→event; align `appointment_selection_lines.line_kind`. **Tags:** §1, §2, core
+25. `20260432_000059_block_instance_three_property_columns.mjs` — Block instances: orchestrator + wizard_visible; drop legacy instance fields; admin metadata updates. **Tags:** §2, core
+26. `20260432_000060_drop_block_shape_legacy_boolean_columns.mjs` — Drop legacy `block_shapes` booleans (composable, can_have_parts, is_state_control); prune admin metadata. **Tags:** §2, core
+27. `20260432_000061_event_schema_placement_instance_attendees.mjs` — Event schema: placement on `event_shapes`, segment columns on `event_instances`, `event_instance_attendees`, default placement seeds, metadata prune. **Tags:** §2, core
+28. `20260432_000062_event_shape_placement_admin_metadata.mjs` — Seed admin_metadata for placement_kind / anchor_edge on event shapes. **Tags:** §2, core
+
+### Grouping callout (same order as above)
+
+- **Relational event + validity graph (early):** 034–036, then **051–055** (rename / cleanup functions).
+- **Auth / sessions / magic links:** 040–041, 045–048.
+- **Wizard / availability / differential-era cleanup:** 037–039, 043–044, 049–050.
+- **User role (Feature 6 adjacency):** 056–057.
+- **Feature 20 phase 20.1 tranche (enum + instance + event):** **058–062**.
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 773bde8e..32d9be63 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T23:51:21.326Z",
+  "derivedAt": "2026-04-02T23:53:52.801Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md
index f11abf1d..d320b49f 100644
--- a/.project-manage
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
