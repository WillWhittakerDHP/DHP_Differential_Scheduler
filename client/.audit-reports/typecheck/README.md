## Typecheck Audit (Generated + Process)

This folder mirrors the workflow used by `client-vue/.audit/`:
- A **generator** produces deterministic JSON + Markdown reports.
- Reports compute metrics and bucket work into **P0/P1/P2**.
- We execute fixes by following the ranked queue (no ad-hoc “chasing errors”).

### Goals
- Make `client-vue && npm run build` pass.
- Avoid “typing sprawl”:
  - Prefer **shared** types/helpers when a pattern repeats 2+ times.
  - Avoid unsafe casts (`as any`, `as unknown as`, broad `Record<string, unknown>` index access).

### Files
- `typecheck-audit.json`: structured output (errors, pools, metrics).
- `typecheck-audit.md`: full report (per-file + per-error details).
- `typecheck-audit-summary.md`: sortable index (all files/pools).
- `typecheck-audit-config.json`: weights and heuristics configuration.

### Running the audit
Run from repo root:

```bash
npm run typecheck:run
```

Run from `client-vue/`:

```bash
npm run typecheck:run
```

### Recommended cadence (keeps this “audit-driven”, not “command-driven”)
- While actively fixing a specific pool: make edits freely without rerunning.
- At a pool boundary (“Pool X should be fixed now”): run `npm run typecheck:run` once to verify the pool disappears / drops.
- Avoid running raw `vue-tsc` commands directly; prefer the generator scripts so reports stay deterministic and comparable over time.

### Prioritization rubric (P0/P1/P2)
- **P0**: build-blocking + high ROI (high blast radius / high repetition) and low-to-medium risk.
- **P1**: build-blocking but lower ROI or higher risk; or unblocks multiple downstream pools.
- **P2**: non-blocking hygiene; do after build is green.

### Rules of engagement (anti-sprawl)
- If an error signature repeats **2+ times**, create/reuse a shared type/helper instead of patching each callsite.
- Do not add unsafe casts to “make it green”.
- Prefer typed adapters at boundaries:
  - Example: `getEntityField(entity, fieldKey)` over `(entity as Record<string, unknown>)[fieldKey]`.


