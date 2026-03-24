# Harness code ↔ documentation matrix

**Purpose:** Reduce agent confusion when `result.outcome.reasonCode` (raw string from tier commands) differs from names in the tier playbook or charter. **Routing** uses `parseReasonCode()` in `.cursor/commands/harness/reason-code.ts` before `routeByOutcome()` in `control-plane-route.ts`.

**Important:** The JSON return value often still contains the **raw** `outcome.reasonCode` emitted by the step or `*-end-impl`. The control plane builds `controlPlaneDecision` from the **normalized** code. Prefer **`controlPlaneDecision.message`**, **`questionKey`**, and **`success`** for UX; use this matrix when you need to interpret a **granular** raw code.

---

## Canonical types and routers

| Artifact | Path |
|----------|------|
| `ReasonCode` union | `.cursor/commands/harness/contracts.ts` |
| Legacy / granular → canonical | `.cursor/commands/harness/reason-code.ts` (`LEGACY_TO_CHARTER`, `parseReasonCode`) |
| Control-plane switch | `.cursor/commands/tiers/shared/control-plane-route.ts` (`routeByOutcome`) |
| Agent behavior (narrative) | `.cursor/commands/tiers/START_END_PLAYBOOK_STRUCTURE.md` |
| Quick reference | `.cursor/skills/tier-workflow-agent/SKILL.md`, `reason-codes.md` |

---

## Live kernel vs charter step IDs

The charter describes a **multi-step** `StepId` pipeline (`preflight`, `load_context`, …). The **current** kernel graph is **Pattern A**: a single orchestration step that delegates to the full tier runner.

| Layer | Path | Behavior |
|-------|------|----------|
| Step graph (v1 actual) | `.cursor/commands/harness/step-graph.ts` | One step (`validate_identifier`) → adapter runs whole start/end workflow |
| Tier start steps | `.cursor/commands/harness/run-start-steps.ts` + `tiers/shared/tier-start-steps.ts` | Real ordering of validate, context, branch, planning gate, … |
| Tier end steps | `.cursor/commands/harness/run-end-steps.ts` + `tiers/shared/tier-end-steps.ts` | Ordered end pipeline (`END_WORKFLOW_STEP_IDS` in `run-end-steps.ts`): includes **`deliverables_check`** then **`planning_rollup`** (consolidate planning docs via `DocumentManager.rollupPlanningArtifacts`) **before** **`commit_remaining`** and **`git`** |

End-state multi-step kernel in `.project-manager/HARNESS_CHARTER.md` §7 is **target architecture**, not the only step trace the repo records today.

---

## Raw `reasonCode` → `parseReasonCode` → router (failure path)

Granular strings below are normalized for routing and workflow-friction policy (`shouldAppendWorkflowFriction` uses `parseReasonCode`). All map into existing `ReasonCode` values; **handler** is from `routeByOutcome` for `success === false` unless noted.

### Git / merge (from `tier-branch-manager` and similar)

Emitted inside git helpers; often **not** copied to `TierOutcome` when the impl wraps the failure as `git_failed` (e.g. feature/session-end merge). If a raw code appears, it normalizes as:

| Raw string | Normalized | Router handler |
|------------|------------|----------------|
| `submodule_sync_failed`, `submodule_update_failed`, `current_branch_unknown`, `ambiguous_branch_prefix`, `pull_root_failed`, `branch_not_based_on_parent`, `diverged_from_remote`, `no_parent_branch`, `invalid_merge_options`, `tier_branch_not_found`, `parent_branch_not_found`, `wrong_branch_before_merge`, `pre_merge_commit_failed`, `dirty_tree_before_merge`, `merge_failed`, `push_failed_after_merge`, `delete_local_branch_failed`, `delete_remote_branch_failed` | `git_failed` | `handleGitFailedTierEnd` if `tierEndGitResumable`; else `handleFailure` |

### Tier-end quality gates (feature / phase / session / task `*-end-impl.ts`)

| Raw string | Normalized | Router handler |
|------------|------------|----------------|
| `lint_or_typecheck_failed` | `preflight_failed` | `handleFailure` |
| `test_goal_validation_failed`, `test_goal_validation_error`, `test_file_fix_permission`, `test_code_error`, `test_failed`, `test_error_analysis`, `test_execution_failed`, `tests_failed`, `test_code_error_permission_required`, `test_code_error_fix_manually`, `app_code_test_failure`, `test_error_analysis_failed`, `test_run_error` | `test_failed` | `handleFailure` |
| `create_branch_failed` | `branch_failed` | `handleFailure` |
| `vue_architecture_gate_failed` | `audit_failed` | `handleAuditFailed` |
| `task_end_error` | `unhandled_error` | `handleFailure` |

### Tier start / harness

| Raw string | Normalized | Notes |
|------------|------------|--------|
| `unknown_tier` | `validation_failed` | `step-adapter.ts` |
| `fill_tier_down_failed` | `guide_materialization_failed` | `run-start-steps.ts` |

**Note:** `audit_fix` appears as a **WorkProfile** classifier input in `audit-fix-prompt.ts`, not as a standard `TierOutcome.reasonCode` for `routeByOutcome`.

### Already listed in `LEGACY_TO_CHARTER`

Examples: `pending_push_confirmation` → `pending_push`, `uncommitted_changes_blocking` → `uncommitted_blocking`, `plan_mode` → `context_gathering`, `verification_work_suggested` → `verification_suggested`.

---

## Raw `reasonCode` → router (success path)

Handled in the **`success === true`** branch of `routeByOutcome` (no `parse` difference for these beyond identity):

- `context_gathering`, `guide_fill_pending`, `pending_push` / `pending_push_confirmation`, `verification_suggested` / `verification_work_suggested`, `task_complete`, `reopen_ok`, `uncommitted_blocking` / `uncommitted_changes_blocking`, `start_ok`, `end_ok`

---

## Unknown strings

Any string **not** in `LEGACY_TO_CHARTER` and not matching a key maps to **`unhandled_error`** → `handleFailure` on failure; on success path, `default` → `handleFailure`.

---

## Playbook alignment

`START_END_PLAYBOOK_STRUCTURE.md` states that **failure** reason codes not listed in per-code sections follow the **HARD STOP** block. After normalization, granular test/git codes above behave as **`test_failed`**, **`preflight_failed`**, **`git_failed`**, **`audit_failed`**, or **`unhandled_error`** for that purpose.

---

## Maintenance

When adding a new **`outcome.reasonCode`** string in TypeScript:

1. Prefer reusing an existing **canonical** `ReasonCode` in the emitter.
2. If you need a granular diagnostic string, add a row here and a **`LEGACY_TO_CHARTER`** entry in `reason-code.ts` mapping to the canonical code that matches the intended handler in `control-plane-route.ts`.
