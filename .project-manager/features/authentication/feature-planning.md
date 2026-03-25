<!-- harness-planning-rollup tier=feature id=authentication consolidatedAt=2026-03-25T19:43:01.092Z -->

# Consolidated planning: feature authentication

## Feature authentication (parent)

## Goal

Ship **authentication** for the scheduler app in phased slices: persist identity and session data (Phase 7.1), add server-side auth infrastructure and strategy seams (Phase 7.2), implement **magic-link** login for beta/dev (Phase 7.3), wire **Vue client** flows (guards, session awareness, UX) (Phase 7.4), and leave **password-based** production auth explicitly deferred (Phase 7.5) until strategy and security review land.

Fold two inherited design threads into planning (not blockers here): **pre-alpha user-type switching** for E2E (how testers impersonate or select roles / auth levels) and **Google OAuth** scope (in v1 strategy vs deferred). Document choices in phase guides or checkpoints as they land.

## Files

- **Planning / control:** `.project-manager/features/authentication/feature-authentication-guide.md`, phase guides under `.project-manager/features/authentication/phases/` (created per `/phase-start`), feature log and handoff in the same feature folder.
- **Server:** `server/src/**` — models/migrations aligned with Phase 7.1; auth config, session handling, middleware, and route protection in Phase 7.2–7.3; strategy implementations (magic link first).
- **Client (Vue):** `client/src/**` — login/callback UI, composables or stores for session, route guards, and admin vs booking surfaces per Phase 7.4.
- **Quality:** `client/.audit-reports/` and project playbooks (type, composable, function, component) at tier boundaries per workflow.

## Approach

1. **Follow the guide’s phase order:** `7.1` → `7.2` → `7.3` → `7.4`; treat `7.5` as deferred until magic-link + client paths are stable and product agrees on password/OAuth scope.
2. **Each phase:** `/phase-start` → implement per phase guide → `/phase-end`; merge/cascade per harness; no skipping governance at tier boundaries.
3. **Open questions:** In **Phases 7.2–7.4**, decide or stub **tester user-type switching** (minimal dev-only affordance vs full matrix) and record **Google OAuth** as out-of-scope for initial beta unless explicitly pulled into a phase.
4. **Branching:** Target branch `feature/authentication` from `develop` when execute mode runs after **`/accepted-plan`** (and **`/accepted-build`** if Gate 2 applied); keep work off unrelated feature branches.

## Checkpoint

- **After 7.1:** Data model and migrations support users/sessions (or agreed equivalents); no blocking schema gaps for magic link.
- **After 7.3:** Magic-link flow demonstrable in development (send link, consume token, establish session) with logging and failure paths visible.
- **After 7.4:** Client reflects auth state; protected routes behave; tester role switching approach is either implemented or explicitly documented as follow-up.
- **Before 7.5:** Written decision on password + OAuth timeline; Phase 7.5 only starts after that scope is approved.

---

## Phase 7.1 (source: phase-7.1-planning.md)

### Goal

**Phase 7.1 (this tier):** Add PostgreSQL persistence for auth-related data — migrations for **`sessions`** and **`magic_links`** (names as agreed in implementation), plus **Sequelize models** registered with the app — so Phase 7.2 can implement session manager, middleware, and strategies without schema gaps.

**Feature context (inheritance):** Later phases add server infrastructure (7.2), magic-link strategy (7.3), Vue client (7.4), and defer password production auth (7.5). Track **pre-alpha user-type switching** and **Google OAuth** as open questions in guides; they do not block 7.1 schema/models.

### Files

- **Planning / control:** `phase-7.1-planning.md` (this doc), `phase-7.1-guide.md`, `feature-authentication-guide.md`, feature log/handoff under `.project-manager/features/authentication/`.
- **Server (7.1):** `server/migrations/**` (new migration files), `server/src/db/models/**` (new or extended models + associations), `server/src/db/models/index.ts` wiring; reference existing `Users` model for FKs.
- **Deferred out of 7.1:** `server/src/auth/**`, middleware replacement, client auth UI — Phases 7.2–7.4.
- **Quality:** Governance playbooks under `.project-manager/`; session/task tier audits when coding tasks run.

### Approach

1. **Session 7.1.1:** Design and land migrations — `sessions` (server-side session store: e.g. `sid`, `user_id` FK to `users`, `expires_at`, `data` or JSON blob per chosen pattern), `magic_links` (token hash, email or user reference, expiry, consumed flag). Add indexes for lookup and expiry cleanup; follow existing Sequelize migration style in the repo.
2. **Session 7.1.2:** Implement Sequelize models, `init`/associations, export through model index; no Express middleware or routes required for 7.1 — behavior lives in 7.2+.
3. **Migration policy:** Author migrations in-repo; run `npm run migrate` (or project equivalent) only when local DB policy allows (`DB_HOST` localhost).
4. **After phase:** `/phase-end 7.1` when all sessions complete; then `/phase-start 7.2` per feature order in PROJECT_PLAN.

### Checkpoint

- **After 7.1.1:** Migrations applied (or ready to apply on host DB); tables match agreed columns and indexes; no ad-hoc DDL left undocumented.
- **After 7.1.2:** Models load in app bootstrap; associations to `User` (if applicable) defined; TypeScript types and Sequelize definitions consistent with migrations.

---

## Phase 7.3 (source: phase-7.3-planning.md)

### Goal

Implement **magic-link authentication** on the server: a `magicLinkStrategy` (or equivalent) that fits the existing strategy contract, persistence using the `magic_links` model, a **request-link** path (email in production-shaped hook; **console or structured log in dev**), and a **verify** path that validates the token, creates a server session via the session manager, and sets the **httpOnly session cookie**. Leave password and OAuth out of this phase.

### Files

- **New / extended server:** `server/src/auth/strategies/` (magic link strategy), `server/src/routes/internal/auth/authRouter.ts` (request + verify handlers), optional `server/src/services/` or `server/src/auth/` helper for outbound email vs dev logging.
- **Existing seams:** `server/src/auth/strategies/strategyTypes.ts`, `server/src/auth/sessionManager.ts`, `server/src/auth/sessionCookie.ts`, `server/src/db/models/auth/magic_link.ts`.
- **Planning:** this file, `phase-7.3-guide.md`, and post-phase `phase-7.3-handoff.md` when 7.3 ends.

### Approach

1. Implement magic-link token lifecycle (create, store, expiry, single-use or rotation policy) against the existing DB model; keep branching shallow and log failures with the project logger.
2. Expose HTTP endpoints consistent with Phase 7.2 router patterns; wire verify flow to **session create + cookie set** so `requireAuth` succeeds on the next request.
3. Abstract **email delivery** behind a small interface or env-gated implementation so dev never requires SMTP.
4. Defer **client** login forms and deep guard alignment to **7.3** only as needed for manual smoke (e.g. hitting verify URL); full Vue work stays in **7.4**.

### Checkpoint

- Requesting a magic link for a known user identity produces a persisted token and a visible delivery signal (email or dev log).
- Visiting the verify URL (or POST, per design) with a valid token yields a session and cookie; invalid/expired tokens return clear errors and logs.
- No new migrations unless the team discovers a gap versus `magic_links` / sessions schema from 7.1.

---
