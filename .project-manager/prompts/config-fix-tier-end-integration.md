# Prompt: Integrate config-fix into the tier-end workflow

## Goal

A new script `client/.scripts/config-fix.mjs` auto-repairs mechanical drift in `client/.audit-reports/audit-global-config.json` (the central allowlist config). It fixes two categories automatically and reports a third:

1. **Path Integrity Drift** — specific file references that don't resolve on disk (e.g., missing `.ts` extensions). Auto-fixed by trying common extensions.
2. **Stale Entry Drift** — allowlist entries with zero suppression hits across recent audit runs. Auto-fixed by removing entries flagged by prune suggestions.
3. **Annotation Coverage Drift** — inventory items missing from `inventory-annotations.json`. Report-only (not auto-fixable).

The script is already working and has an npm script: `npm run audit:config-fix`. It exports `runConfigFix()` and `renderConfigFixSummary()` for programmatic use.

**The task is to wire this into the tier-end workflow so it runs automatically before every end-audit, keeping the config healthy without manual intervention.**

---

## Architecture context

### Tier-end step pipeline (canonical order)

The shared tier-end workflow runs steps in this order (see `run-end-steps.ts`):

```
plan_mode_exit → resolve_run_tests → pre_work → test_goal_validation
→ run_tests → mid_work → comment_cleanup → readme_cleanup
→ commit_remaining → git → verification_check
→ end_audit → after_audit → clear_scope → cascade
```

### Key files

| File | Role |
|------|------|
| `.cursor/commands/harness/run-end-steps.ts` | Canonical step runner — orchestrates the pipeline |
| `.cursor/commands/tiers/shared/tier-end-steps.ts` | Shared step implementations (one function per step) |
| `.cursor/commands/tiers/shared/tier-end-workflow-types.ts` | `TierEndWorkflowContext` and `TierEndWorkflowHooks` types |
| `client/.scripts/config-fix.mjs` | The new auto-fix script |

### Existing pattern for non-blocking shared steps

Steps like `stepReadmeCleanup` and `stepCommitUncommittedNonCursor` show the pattern:

- Declared as `async function stepX(ctx): Promise<void>` (void = never blocks the pipeline)
- Records results via `ctx.steps.stepName = { success, output }`
- Appends human-readable output via `ctx.output.push(...)`
- Registered in `run-end-steps.ts` with `recordEndStep` tracing

---

## Recommended integration point

**Insert a new step `stepConfigFix` between `verification_check` and `end_audit` in the pipeline.**

Why this position:
- It must run **before** `end_audit` so the audit runs against a clean config
- It should run **after** `git` / `commit_remaining` so the working tree is committed and any config changes from the fix are clearly attributable to this automated step
- It should run **after** `verification_check` since config health is orthogonal to verification
- It's non-blocking: if it finds unfixable issues or annotation gaps, those are informational only

---

## Implementation plan

### 1. Add `stepConfigFix` to `tier-end-steps.ts`

```typescript
/**
 * Auto-repair config drift (path integrity + stale allowlist entries) before
 * end-audit runs. Non-blocking: records results but never returns an early exit.
 */
export async function stepConfigFix(
  ctx: TierEndWorkflowContext,
  hooks: TierEndWorkflowHooks
): Promise<void> {
  if (hooks.runEndAudit !== true) return;

  // Spawn the config-fix script; capture structured JSON output
  // Use child_process because the script is .mjs and the commands layer is TypeScript
  const { execSync } = await import('child_process');
  const projectRoot = /* resolve from ctx or import PROJECT_ROOT */;
  const scriptPath = path.join(projectRoot, 'client/.scripts/config-fix.mjs');

  try {
    const stdout = execSync(`node "${scriptPath}"`, {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 15_000,
    });

    // stdout is the markdown summary from renderConfigFixSummary
    const hasAutoFixes = /Total auto-fixes applied: \*\*[1-9]/.test(stdout);
    ctx.steps.configFix = {
      success: true,
      output: hasAutoFixes ? stdout.trim() : 'Config health: no drift detected.',
    };
    if (hasAutoFixes) ctx.output.push(stdout.trim());
  } catch (err) {
    const msg = `Config fix failed (non-blocking): ${err instanceof Error ? err.message : String(err)}`;
    ctx.steps.configFix = { success: false, output: msg };
    // Non-blocking: log but don't return an early exit
    console.warn(msg);
  }
}
```

**Notes:**
- Guard on `hooks.runEndAudit !== true` so config-fix only runs when audits are enabled
- The script is invoked via `child_process.execSync` because `.cursor/commands/` is TypeScript and the script is `.mjs`
- 15-second timeout is generous; typical run is ~500ms
- On failure: log a warning and continue — never block tier-end for config health

### 2. Register in `run-end-steps.ts`

Import `stepConfigFix` from `tier-end-steps`, then insert it between `verification_check` and `end_audit`:

```typescript
// ... after stepVerificationCheck ...

await recordEndStep(ctx, 'config_fix', 'enter');
await stepConfigFix(ctx, hooks);
await recordEndStep(ctx, 'config_fix', 'exit_success');

// ... then stepEndAudit ...
```

### 3. No changes to tier implementations

This is entirely in the shared layer. No changes needed in `task-end-impl.ts`, `session-end-impl.ts`, `phase-end-impl.ts`, or `feature-end-impl.ts`.

### 4. Update the audit-prewarm position (minor)

The prewarm currently fires at the top of `runTierEndWorkflow`. That's fine — config-fix runs in ~500ms, and the prewarm spawns audit scripts in parallel. By the time config-fix finishes and `stepEndAudit` awaits, the audits are already running. No timing conflict.

---

## Validation

After integration, verify:

1. `config-fix` step appears in the tier-end trace/output
2. When path integrity drift is present (remove a `.ts` extension from an allowlist entry), the step auto-repairs it and the subsequent audit passes
3. When no drift is present, the step is silent (doesn't pollute output)
4. A failing config-fix (e.g., malformed JSON) doesn't block tier-end

---

## Summary

| What | Where | Blocking? |
|------|-------|-----------|
| New step function | `tiers/shared/tier-end-steps.ts` | No (void return) |
| Pipeline registration | `harness/run-end-steps.ts` | No |
| Position in pipeline | After `verification_check`, before `end_audit` | — |
| Tier impl changes | None | — |
| New npm script | `audit:config-fix` (already added) | — |
