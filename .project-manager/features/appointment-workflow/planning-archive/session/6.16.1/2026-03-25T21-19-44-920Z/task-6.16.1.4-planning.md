# Plan: task 6.16.1.4 — Admin UI verification + lint (session 6.16.1 closeout)

## Contract
- **Tier:** task | **ID:** 6.16.1.4
- **Scope:** Verify admin surfaces for differential roles include **Margin**; run **client + server** lint; confirm **session 6.16.1** quality gate (app running is acceptable smoke).
- **Governance:** Thin verification task; avoid scope creep into Phase 6.16.2.

## Where we left off

Tasks **6.16.1.1–6.16.1.3** delivered shared types, DB ENUM + model, part finalizer **`margin` → `minimizer: 'override'`**, and **`DifferentialEventRoleOverridesField`** already imports **`DIFFERENTIAL_ROLE_LABELS`** including **Margin**. Migration **20260432_000044** updates **`admin_metadata`** for event-shape **differentialRole** select options in DB-backed admin.

## Story

**This task confirms** admin + lint health for the margin rollout **so that** session **6.16.1** can close without hidden hardcoded role lists or broken governance gates.

## Analysis

- **Override matrix (`DifferentialEventRoleOverridesField.vue`):** Already lists **Margin** via **`DIFFERENTIAL_ROLE_LABELS.margin`**. **`differentialRoleMatrixRows`** only surfaces **`templateRole`** from entities — no enum hardcoding.
- **Event shape template role (metadata-driven select):** Options come from **`admin_metadata.input_config`**; migration **6.16.1.2** added Margin to the canonical row — after migrate on host DB, Shapes UI will show Margin without further Vue changes.
- **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`** uses **`value: null`** for template “none”; override UI uses explicit **`'none'`** for block overrides — **two semantics**; do not blindly replace override **`roleSelectItems`** with **`SELECT_OPTIONS`** without a small mapping layer (out of scope unless we add a 5-line helper).
- **Risk:** None beyond missing grep — if a stray **`'major'|'minor'|'moveable'`** guard exists in admin-only code, fix minimally.

## Design

1. **Grep / read:** Confirm no admin-only differential-role list omits **`margin`** (except intentional legacy docs).
2. **Lint:** `cd client && npm run lint` and `cd server && npm run lint`.
3. **App:** User **`npm run start:dev`** already running counts as smoke; agent does not need to restart if lint is clean (per session checklist “acceptable when already running”).
4. **Code changes:** Only if grep finds a gap; otherwise **no product diff** beyond possible **comment** in **`DifferentialEventRoleOverridesField`** noting **`admin_metadata`** + **`DIFFERENTIAL_ROLE_LABELS`** alignment.

## Goal

Session **6.16.1** exit criteria: admin paths documented, **client + server** lint clean, no known missing **Margin** entry in reviewed surfaces.

## Files (expected touch)

- **Likely none** (verification-only), or at most:
  - `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` — optional comment only

## Approach

1. Search `client/` for **`moveable`** / **`DifferentialRole`** in admin + booking admin utils; confirm **Margin** coverage or fix.
2. Run both linters.
3. If all green, **no code edits** — note in task handoff.

## Checkpoint

- Lint passes both packages.
- Grep shows no stale three-value-only differential role lists in admin UI code paths we care about.

## Deliverables

- Verification notes (implicit in `/task-end` handoff).
- Clean lint.

## Acceptance Criteria

- [ ] Client ESLint passes.
- [ ] Server ESLint passes.
- [ ] Override field includes **Margin** (already true) or is fixed in-session.
- [ ] Optional: one-line comment if it clarifies **none** vs **inherit** vs **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`**.

## Implementation Orders (for `/accepted-code`)

1. Grep + fix only if needed.
2. `npm run lint` in `client/` and `server/`.
3. `/task-end 6.16.1.4` → then **`/session-end 6.16.1`** per cascade.

## Definition of Done

- [ ] Session guide task **6.16.1.4** checked off
- [ ] Session log / handoff updated by harness

---
## Reference
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md`
