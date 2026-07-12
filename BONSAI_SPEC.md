# Bonsai (DHP Differential Scheduler) — Reboot Spec

**Status:** Active — this is the governing document for all agent work
**Written:** July 2026, from a verified audit of the repository state
**Owner:** Will (will@districthomepro.com) — solo founder, non-developer. Explain decisions in plain language. When in doubt, ask him; don't guess.

---

## 0. How to use this document

This spec replaces the previous process system. Read this section carefully because it overrides instructions you will find elsewhere in this repository.

### The old harness is retired

This repo contains an elaborate agent-workflow harness built between 2025 and March 2026: `.cursor/commands/`, `.cursor/rules/` tier/audit machinery, and the `.project-manager/` session/phase/task workflow (guides, planning docs, handoffs, audits, evidence packages). **It is retired.** It became heavier than the product it managed, and its paperwork no longer matches reality.

**It will be physically deleted in Phase 0 (§5.3)** — Will wants it gone, and git history preserves it if ever needed. Until that deletion lands:

- **Do NOT** create session logs, handoff docs, audit files, evidence packages, planning docs, or preflight packages.
- **Do NOT** follow tier/phase/session numbering rituals (e.g., "task 20.8.1.2") or run `.cursor/commands/` scripts or the repo's custom slash commands.
- **Do NOT** update `.project-manager/PROJECT_PLAN.md`, `LAUNCH_CHECKLIST.md`, or phase guides. They are historical records — useful to *read* for context, never authoritative, never to be maintained.
- **DO** work in ordinary professional style: small focused commits, clear commit messages, tests and typecheck as the quality gate, and a short note in `PROGRESS.md` (repo root, create it) when a phase milestone lands.

### Truth hierarchy

When documents disagree (they do — see §3.4), resolve conflicts in this order:

1. **The actual code and database schema** — reality wins.
2. **`docs/ARCHITECTURE_PRINCIPLES.md`** — the architectural constitution. Binding for all design decisions. If code contradicts it, the code is the bug (that's Phase 1's job to fix).
3. **This spec** — scope, sequencing, and acceptance criteria.
4. Everything else in the repo — historical context only.

If following ARCHITECTURE_PRINCIPLES.md would require work far beyond the current phase's scope, stop and ask Will rather than improvising.

---

## 1. What this product is

Will is an independent home inspector (District Home Pro). Some of his inspections take up to 12 hours, but clients only need to attend a short presentation at the end. So when a client books, they're really booking **two linked events at different times**: Will's inspection start, and the client's presentation. The gap between them varies with property details (type, square footage). Will calls this **differential scheduling**, and no off-the-shelf scheduler supports it — clients pick "1:00 PM" and then get confused when Will says "actually show up at 7:00 PM."

**Bonsai** is a single-page scheduling app that solves this:

- **Client-facing booking wizard** (5 steps: Service Selection → Property Details → Appointment Availability → Contact Information → Confirmation). Clients see *their* arrival time; the differential math happens invisibly. Property details auto-fill from MLS data where possible.
- **Admin interface** where Will composes his service catalog from configurable building blocks, sets pricing/time/event rules, and manages appointments.
- **Integrations:** Google Calendar (availability + event creation), Google Maps (geocoding, drive time), Bright MLS (property enrichment — infrastructure built, credentials pending beta).

Not every service is differential; the system also handles standard scheduling. The full narrative behaviour spec is `USER_STORY.md` (repo root) — dated but still the best description of intended wizard behaviour.

### The flagship scenario: "Minimize Time On Site"

This is the single most important capability in the system — the edge case that made building Bonsai necessary. It is a first-class requirement, not a nice-to-have, and it has named acceptance criteria in Phases 1 and 2 (§6.1, §7 item 7).

When a client selects the **Minimize Time On Site** option, the appointment restructures so the client's on-site window shrinks to the minimum: all exterior inspection block components move to an **early-arrival segment** (Will works outside before the on-site window), and all possibly-off-site parts (report writing, formal presentation) move **outside the inspection window entirely** — scheduled wherever they fit. All of this must be configurable from the admin panel: which parts are exterior/off-site-eligible, and where each segment may land.

The architecture was designed around exactly this. ARCHITECTURE_PRINCIPLES.md §5.2 uses "Minimize Time On Site" as its worked example: an event **profile** (`composite=true, orchestrator=false`) owning named segments — `EarlyArrival` (FrontMarginal), `Primary`, `FormalPresentation` (BackSecondary), `OffSite` (BackFloating) — whose `event_assignments` override the baseline "everything in Primary" graph, with PartFinalizer falling back to the baseline for unassigned parts. Placement types are admin-managed data rows (§5.1/§5.3), which is what makes the segment layout admin-controllable without code changes. Partial client implementation exists (the "minimizer" flow in the availability step).

### The domain model in one paragraph

Services are assembled from **blocks** (composed of **parts**). A **shape** defines structure (like a class); an **instance** is a configured occurrence (like an object). Blocks come in five semantic types: `user`, `service`, `time`, `price`, `event`. The three concerns that once had bespoke logic — how long things take (**time**), what they cost (**price**), and who shows up when (**event**, the differential part) — are all handled by the same layered resolution: shape → block instance → part instance, with part instances acting as a value ledger (`defaultTime`/`timePerUnit`, `defaultFee`/`feePerUnit`, `defaultEvent`/`eventOverride`). Event routing is **data** (placement types + `event_assignments` rows), not hard-coded logic. Full detail with diagrams and invariants: `ARCHITECTURE_PRINCIPLES.md`.

---

## 2. Tech stack (verified)

```
Monorepo
├── client/   Vue 3 + Vite + Vuetify + TypeScript SPA
│             Pinia, Vue Query, VeeValidate, Vitest (~117 test files)
├── server/   Express + TypeScript + Sequelize + PostgreSQL
│             Jest (~15 test files), Helmet, Morgan
├── shared/   Types and utilities shared across client/server
└── .github/workflows/ci.yml   Lint, typecheck, test, build
```

Dev ports: client 3002 (Vite proxy) → server 3001 → PostgreSQL (`scheduler_db`). Schema changes go through Sequelize migrations only (`server/src/db/migrations/`) — never `sequelize.sync()`, never manual DDL. A DB backup exists at repo root: `differential_scheduler_backup.dump`.

---

## 3. Current state (audited July 2026 — trust this over any doc)

### 3.1 Where work stopped

Work stopped in early April 2026, mid-way through **Feature 20 ("Domain Architecture Alignment")** — a major refactor to make the codebase match ARCHITECTURE_PRINCIPLES.md.

- **Branch:** `feature/domain-architecture-alignment` (checked out; also exists on origin; `main` and `develop` are behind it).
- **Working tree:** ~223 modified/deleted files uncommitted (~2,455 insertions, 2,817 deletions). The last handoff note (2026-04-04) says the task-20.8.1.2 renames (`timePerUnit`/`feePerUnit`, migration `20260404_000004`) "are reflected in repo" — i.e., the uncommitted work was believed near-complete, not abandoned mid-keystroke.
- **Feature 20 progress:** subphases 20.1–20.7 complete (verified: the old admin-metadata stack greps clean; the migrations landed). Stopped at 20.8; 20.9–20.13 not started.

### 3.2 What Feature 20 already accomplished (don't redo)

- Admin metadata pipeline fully removed (models, routes, client API — `rg 'adminMetadata'` returns nothing in `client/src` / `server/src`).
- Domain rename to `time`/`price`/`event` semantic types largely landed.
- `differentialEventRoleOverrides` removed; roles resolve from `placement_kind`.
- Migration sequence `20260432_*` executed the schema transforms with explicit, idempotent DDL.

### 3.3 Known mid-migration debt (Will's "properties that seem unrelated to anything")

The model layer is caught between old and new worlds. Verified examples:

- `block_instances` carries a grab-bag of domain-specific columns on *every* instance regardless of semantic type: `baseSqFt`, `requiresUnitNumber`, `isMultiFamily`, `requiresAgent`, `preClosing`, `agentPermissions`, nullable `icon`/`semanticType`.
- `blockInstanceId` on part instances has no FK constraint (intentional? verify in Phase 0).
- **A worked example of the truth hierarchy:** `block_instances` carries `composite`, `orchestrator`, `wizardVisible`. The older redesign doc (`DOMAIN_ARCHITECTURE_REDESIGN.md` §1.5) says these should move to `block_shapes` — but ARCHITECTURE_PRINCIPLES.md §2 (which wins) defines all three as **instance-level** properties. The code matches the principles; the redesign doc is superseded on this point. What remains open is *verifying their semantics*, not relocating them (Phase 1, item 1).

Phase 1 resolves this per the principles doc. Do not "clean up" opportunistically before Phase 0's audit establishes what's actually wired to what.

### 3.4 Known document lies (why the harness is retired)

- `LAUNCH_CHECKLIST.md` (Feb 2026) says authentication "does not exist / middleware stubs are no-ops." **False now:** magic-link auth was subsequently built (`server/src/routes/internal/auth/authRouter.ts`, sessions + magic_links migrations). `PROJECT_PLAN.md`'s summary table says Feature 7 (Auth) and Feature 8 (Security) are ✅ Complete — while *detail sections in the same file* still say "📋 Planning."
- `PROJECT_PLAN.md` marks Features 0–8 and 14 complete, but Will believes some earlier features were never truly closed out. Phase 0 verifies by behaviour, not paperwork.
- The launch checklist's progress tracker shows 0/137 items started — stale; some of that work happened under other names.

---

## 4. Goal and scope

**Goal: Alpha.** Bonsai deployed (Render), auth working, and Will booking real District Home Pro appointments through it end-to-end from a normal browser. No external users.

**Explicitly OUT of scope** (do not start, do not partially implement):

- Ionic migration, Capacitor wrap, native iOS/Android apps
- Beta tester onboarding / guided testing system (Feature 9 / Phase 6A)
- Admin UI Overhaul (Feature 17), Admin Assistance Wizard (Feature 18), UI Polish (Feature 16)
- CRM / inspection-platform integration (Feature 19)
- Password auth strategy (magic-link only for alpha)
- E2E test suite buildout, mutation testing (basic smoke coverage is in scope; the full Feature 10 program is not)

These are real future work. Note ideas in `PROGRESS.md` and move on.

---

## 5. Phase 0 — Resurrect and audit

*Purpose: establish ground truth. Nothing else proceeds until this is done. This phase changes no behaviour except where needed to get things running.*

### 5.1 Bring it back to life

1. Install dependencies with **npm** (root, then `client/` and `server/` via the root scripts); create/restore the local Postgres DB (use `differential_scheduler_backup.dump` if a fresh migrate+seed doesn't produce a usable state); run migrations.
2. Get `npm run start:dev` (root — runs `scripts/start-dev.mjs`) serving client + server. Fix only what blocks startup.
3. Run typecheck, lint, and both test suites. Record results (counts, failures) in `PROGRESS.md`.

### 5.2 Triage the uncommitted work

The ~223 uncommitted files are believed to be the near-complete task-20.8.1.2 rename work. Review the diff **as a whole**, characterize it (renames vs. behaviour changes vs. deletions), and either commit it in coherent chunks with accurate messages or — only if it's demonstrably broken — stash it with a written explanation. Do not let it rot uncommitted. Ask Will before discarding anything.

### 5.3 Demolish the harness

Once §5.2's triage is committed (not before — some uncommitted files touch these directories):

1. **Rescue the keepers** into `docs/` at repo root: `ARCHITECTURE_PRINCIPLES.md`, `ARCHITECTURE.md`, `DOMAIN_ARCHITECTURE_REDESIGN.md`, `DOMAIN_REWRITE_WORKLOG.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` (rescued from the retired `.project-manager/` tree). Paths in this spec point at `docs/`.
2. **Delete** `.cursor/` in its entirety (rules, commands, plans, scripts, audit machinery, the embedded project-manager copy — this includes Will's custom slash commands, which are also retired) and everything remaining in `.project-manager/`.
3. **Delete root-level harness debris:** `tsconfig.cursor-commands.json`, `vitest.config.workspace.cursor.ts`, `comment-audit-data.json`, `COMMENT_AUDIT_REPORT.md`, `TOOLS.md`. Check `eslint-local-plugin/` before deleting — remove it only if the active lint config doesn't consume it.
4. **Cruft sweep:** `git rm` the phantom root entries `express-api-typescript@0.0.2`, `main@1.0.0`, `node`, `npm` (empty accidental-npm artifacts; two are git-tracked). Then sweep for any other duplicate/copy/orphan files and folders — anything with no inbound reference and no purpose. Rule: delete only what a grep proves unreferenced; when in doubt, list it in `PROGRESS.md` and ask Will.
5. **Vuexy caution:** `client/src/@core` and `client/src/@layouts` are the Vuexy template framework layer and are **live dependencies** (20+ client files import from them). Do NOT bulk-delete. Pruning provably-unused Vuexy components/scss within them is fair game during Phase 1 cleanup, individually and grep-proven, never wholesale.
6. Keep at root: `USER_STORY.md`, `LAUNCH_CHECKLIST.md` (reference reading for Phase 2), `COMMIT_HISTORY.md`, this spec, `PROGRESS.md`.
7. Note: `.cursor/` contains a nested git repo; deleting it may require force-removal. Commit the deletion as its own commit ("Remove agent-workflow harness") so it's trivially revertible.

Related but outside this repo: the sibling folder `cursor-project-management-suite/` in Will's Bonsai directory is the harness's source distribution — Will can delete it whenever; agents shouldn't touch things outside the repo. Slash commands registered globally in Cursor's app settings must be removed by Will in Cursor itself.

### 5.4 Behaviour audit (not paperwork audit)

Walk the two core surfaces and record what actually works, in `PROGRESS.md`:

- **Booking wizard:** all five steps, standard AND differential service paths, quote-only path, slot selection against Google Calendar (or its mock/cache), confirmation. Specifically exercise the **minimizer flow** (client code exists: `client/src/types/minimizerScheduling.ts`, minimizer modal + slot grid in the availability step) and record how much of the flagship scenario (§6.1) already works.
- **Admin:** service catalog CRUD (shapes, block instances, part instances), pricing/time/event configuration, appointment management, calendar configuration.
- **Auth:** magic-link request → email (or logged link in dev) → verify → session cookie → protected route access. This was claimed complete; prove it.
- **Integrations:** Google Calendar + Maps against real credentials if available; Bright MLS stays mocked (credentials blocked until beta — expected).

### 5.5 Schema/model audit

Produce a table (in `PROGRESS.md`) of every column on the core admin/booking models: name, where it's read, where it's written, whether ARCHITECTURE_PRINCIPLES.md sanctions it. This is the input for Phase 1 — it converts Will's "unrelated properties" feeling into a concrete kill/keep/move list.

**Phase 0 exit criteria:** app runs locally; test/typecheck baseline recorded; uncommitted work resolved; harness deleted (keepers rescued to `docs/`); behaviour + schema audit written up in `PROGRESS.md`; Will has read the audit summary and signed off on the Phase 1 kill/keep/move list.

---

## 6. Phase 1 — Close out Feature 20 (substance only)

*Purpose: finish the architecture alignment so the codebase matches ARCHITECTURE_PRINCIPLES.md, then stop. This is the distilled substance of old phases 20.8–20.13 with the process ceremony deleted.*

Work items (order within phase is the implementing agent's call, informed by the Phase 0 audit):

1. **Three-property semantics verification.** Prove that `composite`, `orchestrator`, `wizardVisible` (instance-level, per principles §2) actually drive behaviour as defined — composite/orchestrator semantics against real cascade graphs, `wizardVisible` against what the wizard renders — not merely that the columns exist. Fix wiring where behaviour is hard-coded instead of flag-driven.
2. **Grab-bag column resolution.** Execute the Phase 0 kill/keep/move list for the remaining orphaned instance properties (`baseSqFt`, `requiresUnitNumber`, `isMultiFamily`, `requiresAgent`, `preClosing`, `agentPermissions`, …). Each column ends up: dropped, moved to its proper owner, or documented as sanctioned.
3. **Part-ledger contract.** Verify the `defaultTime`/`timePerUnit`, `defaultFee`/`feePerUnit`, `defaultEvent`/`eventOverride` ledger is consistently named and consumed end-to-end (the uncommitted rename work was the start of this).
4. **Event/attendee ownership.** Event routing resolves from placement types + `event_assignments` data everywhere; attendee (who-shows-up-when) logic reads `placement_kind` only; no residual role-override or code-first routing paths.
5. **Booking pipeline alignment.** Verify the finalizer/slot pipeline groups parts by lineage bucket (principles §4.2.1), not by shape *name* — greps suggest the shape-name-keyed helpers may already be gone via the uncommitted renames; confirm rather than assume. Verify zero-out ordering matches principles §4.4 step 5 ("zero-out last, per part") in the live path, and add a test that proves it.
6. **Vocabulary retirement.** Remove transitional aliases still teaching the old model (`property`/`coupon`/`option` → `time`/`price`/`event`) in code, types, and API surfaces. Grep-clean acceptance.
7. **Migration coherence.** The migration chain from a fresh DB produces the final schema without relying on implicit defaults; seeds produce a bookable demo catalog.

### 6.1 Flagship acceptance scenario (blocking for Phase 1 exit)

Configure and prove "Minimize Time On Site" end-to-end, using only admin-panel configuration (no code changes to define the profile):

1. In admin: mark the exterior parts of a real service as early-arrival-eligible and the report-writing/presentation parts as off-site-eligible, via an event profile with segments per principles §5.2.
2. In the wizard: book that service twice — once standard, once with Minimize Time On Site selected.
3. Verify: the minimized booking yields an early-arrival segment before the on-site window containing exactly the exterior parts; a shrunken primary on-site window; report writing floating off-site; the presentation anchored after; the client-facing display showing only the client's own times.
4. Verify: changing the profile's segment configuration in admin (e.g., moving a part between segments, changing a placement anchor) changes the next booking's layout — no deploy required.
5. Capture this as an automated integration test at the pipeline level (given catalog + profile + selections → expected segment layout), so it can never silently regress.

**Phase 1 exit criteria:** schema audit table shows every column sanctioned; targeted greps clean (old vocabulary, override paths, metadata remnants); all tests green including new coverage for zero-out ordering and event routing; booking wizard and admin verified working by hand; merged to `main` (or `develop` then `main` — pick one flow and record it).

---

## 7. Phase 2 — Alpha launch

*Purpose: get it hosted, secured, and in daily real use by Will. Distilled from LAUNCH_CHECKLIST.md phases 0–2A, which remain useful reference reading (especially Appendix A's `render.yaml` template) but are not the checklist of record.*

1. **Deploy on Render:** static site (client) + web service (server) + managed Postgres. `render.yaml` in repo root. Environment variables documented in `.env.example`; secrets set in Render dashboard, never committed.
2. **Production database:** migrations run against prod; seed/import Will's real service catalog (from local DB export if faster).
3. **Auth in production:** magic-link flow with a real transactional email provider (pick one — Resend/Postmark/SES — present tradeoffs to Will before wiring). Sessions httpOnly + secure; admin routes behind `requireAuth` + role check, verified by attempting access without auth.
4. **Security hardening:** CORS locked to the deployed client origin; rate limiting on internal API routes (exists for external APIs only); request validation on booking + auth endpoints; secrets audit (`git log` scan + repo scan); Helmet config reviewed beyond defaults.
5. **Operability minimum:** health-check endpoint; Sentry (or equivalent) error tracking on client + server; production logging sane; documented one-command rollback (previous deploy + DB backup restore).
6. **Google integration in prod:** OAuth credentials for the production origin; Calendar + Maps verified live.
7. **Alpha acceptance:** Will completes — from his phone or a non-dev browser — a real standard booking, a real differential booking, and a real **Minimize Time On Site** booking (§6.1 scenario against production), sees correct Google Calendar events for every segment, and manages the appointments in admin. He then uses Bonsai for real client scheduling for two weeks; bugs found go straight into `PROGRESS.md` as the seed of the post-alpha backlog.

---

## 8. Working agreements for agents

- **Ask, don't assume.** Will is the domain expert on inspection scheduling. If the principles doc and the code suggest two defensible readings, ask him with a concrete example ("should a quote-only booking create a calendar hold?") rather than picking silently.
- **Small, reviewable increments.** One concern per commit/PR. No 223-file working trees ever again.
- **Tests are the gate.** Typecheck + lint + suites green before merge. New behaviour ships with a test. Don't fix a failing test by weakening it (the old `immutable-tests` rule survives in spirit).
- **No new process artifacts.** Progress lives in `PROGRESS.md` (append-only, dated, terse) and git history. That's it.
- **Respect the migration discipline.** Sequelize migrations only; run DDL only against localhost DBs unless doing the deliberate prod deploy in Phase 2.
- **Don't expand scope.** §4's out-of-scope list is binding. The temptation to "quickly modernize" the Vuetify UI or start the Ionic migration is exactly how the last two years happened.

## 9. Key file map

| What | Where |
|---|---|
| Architectural constitution (binding) | `docs/ARCHITECTURE_PRINCIPLES.md` |
| Behaviour spec (wizard narrative) | `USER_STORY.md` |
| This spec + progress log | `BONSAI_SPEC.md`, `PROGRESS.md` (repo root) |
| Domain models | `server/src/db/models/admin/` |
| Migrations | `server/src/db/migrations/` |
| Auth | `server/src/routes/internal/auth/`, `server/src/auth/` |
| Booking pipeline (server) | `server/src/routes/internal/appointments/appointmentHelpers.ts`, `server/src/services/` (locate via `PartFinalizer`) |
| Wizard steps (client) | `client/src/components/booking/steps/` |
| Minimizer flow (client) | `client/src/types/minimizerScheduling.ts`, availability-step minimizer modal/grid |
| Admin editors (client) | `client/src/components/admin/` |
| Historical plans (context only) | `LAUNCH_CHECKLIST.md`, `docs/DOMAIN_REWRITE_WORKLOG.md`, `docs/FEATURE_20_ARCHITECTURE_REDESIGN.md` |
| DB backup | `differential_scheduler_backup.dump` |

## 10. Open items for Will

1. Confirm local Google API credentials still work (Calendar + Maps) or need re-issuing.
2. Choose transactional email provider when Phase 2 reaches auth (agent will present options).
3. Render account + billing when Phase 2 starts.
4. Sign-off checkpoints: end of Phase 0 (audit + kill/keep/move list), end of Phase 1 (hands-on booking + admin walkthrough), Phase 2 acceptance (two weeks of real use).
