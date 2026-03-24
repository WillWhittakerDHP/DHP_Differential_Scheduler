# Harness performance & UX notes (session smoke, Mar 2026)

Short reference from smoke runs (`session-start 6.13.3`, `session-end 6.13.2`) and follow-up fixes.

## Latency

- **Session-end** can take **~15–20s** in a full repo: tier-quality npm audits (changed-only), docs audit, Vue architecture audit, external signal import, optional `gh` PR check (network), markdown report write.
- **Bottlenecks:** sequential audit steps (by design), child processes under `client/`, git/working-tree queries.

## Duplicate output

- **Fixed:** `step-adapter` (formerly `tier-adapter`) was pushing `result.output` and the kernel **also** pushed `stepResult.output` → doubled start/end bodies. Adapter push removed.
- **Fixed:** `formatChoiceForChat` for **`audit_failed`** no longer repeats the full `decision.message` (report already in command output); choice block uses a short prompt + options only.

## Console noise

- **Fixed:** `deriveSessionDescription` — missing session guide at session-start is normal; no `console.warn` unless unexpected error (opt-in `TIER_LOG_DERIVE_SESSION=1` for debug).
- **Fixed:** `audit-docs` — missing guide/log/handoff **ENOENT** findings still lower score, but stderr no longer spams full stacks unless non-ENOENT (`TIER_LOG_AUDIT_DOCS=1` for missing-file debug).

## Docs gaps vs audit

- Session tier **docs** audit expects: session **guide** (sections Quick Start, Tasks, Session Workflow with substance), **log** (status + `### Task … ✅` entries), **handoff** (Current Status, Next Action, Transition Context).
- **Vue-architecture** / **tier-quality** are separate; failing docs alone can block `session-end` until score thresholds pass.

## Recommendations

1. Run **session-start** before heavy implementation so guides/logs exist early.
2. For CI/local iteration, consider documenting env flags to shorten audits (if the harness adds them later).
3. Keep **feature ref** explicit when `.tier-scope` points at a different feature than the session ID.

**Last updated:** 2026-03-24
