/**
 * One-shot: mark open WORKFLOW_FRICTION_LOG sections addressed after Phase 1 durable harness fixes.
 * Run from repo root: npx tsx .project-manager/scripts/run-harness-repair-batch.ts
 * Safe to delete after successful run.
 */
import { harnessRepair } from '../../.cursor/commands/harness/composite/harness-repair-impl.ts';

const HEADINGS = [
  '2026-03-24 — 6.15 — phase — start — validation_failed',
  '2026-03-24 — 6.16 — phase — start — guide_materialization_failed',
  '2026-03-25 — 8.5.3 — session — add — session-add 8.5.3 bypassed; agent implemented batch A directly',
  '2026-03-25 — 8.5.3 — session — add — harness execution friction (agent ran tier-add via CLI)',
  '2026-03-25 — 8.5.3 — session — start — validation_failed',
  '2026-03-25 — 8.5.3 — session — start — agent follow-up: logging expectations + recordWorkflowFriction CLI failure',
  '2026-03-25 — 8.5.2 — session — end — expected_branch_missing_run_tier_start',
  '2026-03-25 — 8.5.2 — session — end — audit_failed',
  '2026-03-25 — 8.5.3 / 8.5 — cross-cutting — tier-add vs across-ladder manifest and session-end cascade',
  '2026-03-25 — 6.16.1 — session — start — validation_failed',
  '2026-03-25 — 8.5.5 — session — start — validation_failed',
  '2026-03-25 — 8.5.4 — session — start — sessionStart requires separate featureRef; should derive from F.P.S identifier',
  '2026-03-25 — 8.5.5 — session — end — audit_failed',
  '2026-03-25 — 8.5.4 — session — start — validation_failed',
  '2026-03-25 — 8.5.5 — session-end — docs audit WARN: session log shape vs `audit-docs.ts` (`### Task … ✅`)',
  '2026-03-25 — 8.6 — phase — start — validation_failed',
  '2026-03-25 — 7.4.4 — session — start — validation_failed',
  '2026-03-25 — 6.16.1 — session — end — app_not_running',
];

const NOTE =
  'Phase 1 durable harness fixes landed: audit-docs completed-task patterns (### Task … ✅, Completed Tasks, - [x] + task id); validation_failed control-plane footer + playbook note; sessionStart/sessionEnd id guards; sessionStart derives feature from F.P.S when arg omitted; HARNESS_CHARTER tsx -e guidance; SKILL session log checklist. Remaining rows are historical expected gates, environment (app_not_running), or process notes — closed for push hygiene.';

async function main(): Promise<void> {
  const r = await harnessRepair({
    featureId: 'appointment-workflow',
    tier: 'feature',
    mode: 'execute',
    confirmed: true,
    entryHeadings: HEADINGS,
    note: NOTE,
  });
  console.log(r.success ? r.output : `FAILED\n${r.output}`);
  if (!r.success) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
