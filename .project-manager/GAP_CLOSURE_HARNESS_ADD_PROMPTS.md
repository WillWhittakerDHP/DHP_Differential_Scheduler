# Gap closure — harness `/{tier}-add` prompt playbook (Features 0–8, excl. F6)

**Purpose:** Exact slash-command lines to register new harness tiers for **remaining** gap work tracked in [`GAP_CLOSURE_CHECKLIST.md`](GAP_CLOSURE_CHECKLIST.md), using the shared **`tier-add`** implementation ([`.cursor/commands/tiers/shared/tier-add.ts`](../.cursor/commands/tiers/shared/tier-add.ts)) and playbook notes ([`.cursor/commands/tiers/START_END_PLAYBOOK_STRUCTURE.md`](../.cursor/commands/tiers/START_END_PLAYBOOK_STRUCTURE.md) § Adding children).

**Not in scope here:** Feature 6; rows already **done** or **N/A** on the checklist (unless you reopen them deliberately).

---

## How `/{tier}-add` works (read this once)

| Command | ID format | Parent document updated |
|--------|-----------|-------------------------|
| `/feature-add` | Directory slug (e.g. `my-feature`) | **`.project-manager/PROJECT_PLAN.md`** — Feature Summary table (does not create `features/<slug>/` on disk) |
| `/phase-add` | `X.Y` (e.g. `8.8`) | Feature guide — **Phases Breakdown** (`feature-*-guide.md`) |
| `/session-add` | `X.Y.Z` (e.g. `8.5.3`) | **Phase guide** (`phases/phase-X.Y-guide.md`) |
| `/task-add` | `X.Y.Z.A` (e.g. `8.5.3.1`) | **Session guide** (`sessions/session-X.Y.Z-guide.md`) |

- **`/feature-add`** is implemented as **`featureAdd`** in [`.cursor/commands/tiers/shared/tier-add.ts`](../.cursor/commands/tiers/shared/tier-add.ts) (re-exported from `feature/composite/feature.ts`). Most gap work still hangs under **Feature 7** or **Feature 8** via phase/session/task IDs.
- Optional **description** text after the ID is passed to planning resolution (same family as tier-start). Include enough detail for the agent and future you.
- On success, the harness prints **`Next: /{tier}-start …`** — run **`/session-start` / `/phase-start` / `/task-start`** when you are ready to branch, planning docs, and `/accepted-plan` / `/accepted-code` per your gates ([`.cursor/skills/tier-workflow-agent/SKILL.md`](../.cursor/skills/tier-workflow-agent/SKILL.md)).
- **`session-add` will fail** if the parent file **`.project-manager/features/<feature>/phases/phase-X.Y-guide.md`** does not exist or cannot be read. **`phase-add` alone does not create that file.**

**Feature context:** Resolve **Feature 8** work on the branch / context that maps to **`security-hardening`** (IDs starting with `8.`). Resolve **Feature 7** work on **`authentication`** (IDs starting with `7.`). If a command fails with missing feature context, align git branch / harness feature selection with that feature.

---

## Prerequisite (Feature 8 — Joi + optional CSP sessions under phase 8.5)

Active tree currently has **no** [`features/security-hardening/phases/phase-8.5-guide.md`](features/security-hardening/phases/phase-8.5-guide.md), but **`session-add 8.5.*`** appends to that path.

**Do this once before Step A2:**

1. Copy the archived phase guide into the active `phases/` folder (adjust only if you already maintain a different canonical 8.5 guide):

   ```bash
   cp ".project-manager/features/security-hardening/doc-archive/guide/feature/security-hardening/2026-03-24T22-43-16-884Z/phase-8.5-guide.md" \
      ".project-manager/features/security-hardening/phases/phase-8.5-guide.md"
   ```

2. **Edit** the new `phase-8.5-guide.md`: set **Status** / session checkboxes so they match reality (e.g. 8.5.1–8.5.2 delivered in code or superseded by current [`sessions/session-8.5.2-guide.md`](features/security-hardening/sessions/session-8.5.2-guide.md)). This avoids planning confusion; it does not block `tier-add`.

**Alternative (new phase instead of 8.5):** If you refuse to restore 8.5, use **Track B** at the end of this doc (`/phase-add 8.8` + create `phase-8.8-guide.md` manually before any `session-add 8.8.*`).

---

## Step A — GC-8-JOI: Joi / `validateRequest` closure (Feature 8)

Run in order **after** the prerequisite above.

### A1. Register sessions (copy/paste into Cursor)

```text
/session-add 8.5.3 Joi gap closure batch A — Audit first half of server/src/routes/internal for POST/PUT/PATCH (and DELETE bodies if any) missing validateRequest; add Joi schemas and wire validateRequest; preserve existing CSRF and ownership middleware order; update GAP_CLOSURE_CHECKLIST GC-8-JOI when batch is verified (lint + smoke).
```

```text
/session-add 8.5.4 Joi gap closure batch B — Audit remaining server/src/routes/internal routers for missing validateRequest; same constraints as 8.5.3; close or narrow GC-8-JOI when all targeted mutating routes are covered or explicitly exempted with documented rationale.
```

Optional third slice if batches are too large:

```text
/session-add 8.5.5 Joi gap closure batch C — Misc internal routes, dev-only routers, and edge POST/PUT paths missed in 8.5.3–8.5.4; final pass to mark GC-8-JOI done.
```

### A2. Execute each session through the harness (repeat per session)

For **8.5.3**, then **8.5.4**, then **8.5.5** (if used):

1. `/session-start 8.5.3` — *(or the next session ID)* — use the description line you registered.
2. Complete planning; run **`/accepted-plan`** when the gate applies.
3. Implement; run **`/accepted-code`** for task tier if used.
4. **`/session-end 8.5.3`** — update session log/handoff and **`GAP_CLOSURE_CHECKLIST.md`** row **GC-8-JOI** (narrow scope or set `done`).

### A3. Optional `task-add` lines (after `session-start` creates / opens the session guide)

Register tasks **only** if you want explicit task-tier tracking. IDs must be **four segments** (`8.5.3.1`, …). Example:

```text
/task-add 8.5.3.1 Inventory internal routers in batch A and list handlers missing validateRequest
```

```text
/task-add 8.5.3.2 Add Joi schemas and validateRequest for batch A endpoints; run server lint
```

```text
/task-add 8.5.3.3 Smoke: credentialed POST/PUT against a sample of changed routes; update checklist Notes
```

Repeat with **`8.5.4.1`**, **`8.5.4.2`**, … for the next session.

---

## Step B — GC-7-E1: Enactment / internal API policy (Feature 7)

Parent phase **7.4** already has an active phase guide: [`phases/phase-7.4-guide.md`](features/authentication/phases/phase-7.4-guide.md).

### B1. Register session

```text
/session-add 7.4.4 Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified.
```

### B2. Execute

1. `/session-start 7.4.4` — *(same pattern as Step A2)*  
2. Planning → **`/accepted-plan`** as required  
3. Implementation → **`/session-end 7.4.4`**  
4. Refresh **`GAP_CLOSURE_CHECKLIST.md`** **GC-7-E1**.

### B3. Optional tasks

```text
/task-add 7.4.4.1 Produce allowlist matrix: wizard-safe routes vs admin-auth-required routes
```

```text
/task-add 7.4.4.2 Apply middleware to agreed routers; server lint + smoke admin + anonymous wizard
```

---

## Step C — CSP staging/production follow-up (optional; checklist GC-8.5.2 note)

Only if you want harness traceability beyond “iterate in staging.” Same parent as Step A (**phase 8.5** guide must exist).

```text
/session-add 8.5.6 CSP hardening — Staging/production pass: fix reported CSP violations; tighten connect-src/img-src (and related directives) for real CDN/API origins; document changes in server/docs/SECURITY_STUBS.md; verify Vue production build.
```

Then: `/session-start 8.5.6` → … → `/session-end 8.5.6`.

---

## Step D — Optional hygiene (GC-10-NOTE)

No tier required. If you prefer harness tracking:

```text
/session-add 8.5.7 Repo hygiene — Document GIT_MCP_SERVER / PAT expectations in root or server .env.example; no product code unless needed; checklist GC-10-NOTE.
```

*(Only use **8.5.7** if it does not collide with an existing registered session; otherwise pick the next free **8.5.N** in `phase-8.5-guide.md`.)*

---

## Track B — New phase **8.8** (if you skip restoring phase 8.5)

Use when you want Joi work under a fresh phase ID.

### B0. Register phase in feature guide

```text
/phase-add 8.8 Joi and validateRequest gap closure — GC-8-JOI: complete validateRequest coverage on internal mutating routes; batches split across sessions 8.8.1+; links to GAP_CLOSURE_CHECKLIST and server/src/routes/internal.
```

### B1. Create parent phase guide file (required before `session-add`)

Create **`.project-manager/features/security-hardening/phases/phase-8.8-guide.md`** on disk. Minimum: copy structure from [`phases/phase-8.6-guide.md`](features/security-hardening/phases/phase-8.6-guide.md), retitle to **Phase 8.8**, and include a **`## Sessions Breakdown`** (or equivalent) heading so append logic can register children.

### B2. Register sessions

```text
/session-add 8.8.1 Joi gap closure batch A — (same intent as Step A1 batch A)
```

```text
/session-add 8.8.2 Joi gap closure batch B — (same intent as Step A1 batch B)
```

### B3. Execute

`/phase-start 8.8` when you want phase-level planning/branch semantics; otherwise start each session with `/session-start 8.8.1`, etc., and end with **`/session-end`**.

---

## Checklist rows touched by this playbook

| Step | Checklist IDs |
|------|----------------|
| A | **GC-8-JOI** |
| B | **GC-7-E1** |
| C | **GC-8.5.2** (refinement / verification notes) |
| D | **GC-10-NOTE** |

Delegated / out of scope for this file: **GC-02**, **GC-02b**, **GC-03**, **GC-03b**, **GC-7-E4**, **GC-7-E2** (design), **GC-7.5**, **GC-7-E3** (deferred).

---

## Maintenance

When a tier completes, update [**GAP_CLOSURE_CHECKLIST.md**](GAP_CLOSURE_CHECKLIST.md) **Status**, **Harness anchor**, and **Notes** per the checklist’s maintenance rules. Optionally link the session log or PR in **Notes**.

_Last updated: 2026-03-25_
