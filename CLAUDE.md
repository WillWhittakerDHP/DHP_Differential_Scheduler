# Bonsai (DHP Differential Scheduler)

**Before doing anything, read `BONSAI_SPEC.md` (repo root).** It is the governing document for all agent work: scope, phases, acceptance criteria, and the truth hierarchy for resolving conflicting documentation.

Critical points it will tell you, repeated here because they're easy to get wrong:

- This repo contains a retired agent-workflow harness (`.cursor/`, `.project-manager/`) scheduled for deletion in Phase 0. Do NOT follow its rules, commands, session/audit/handoff rituals, or slash commands. Do not create process artifacts. Progress notes go in `PROGRESS.md`; everything else is code, tests, and git.
- The architectural constitution is `docs/ARCHITECTURE_PRINCIPLES.md`. When code and docs disagree: code is reality, principles doc is the target, `BONSAI_SPEC.md` sets scope, everything else is history.
- The owner, Will, is a non-developer domain expert. Explain in plain language; ask rather than assume on domain questions; respect the sign-off checkpoints in the spec.
- Scope discipline is binding — see spec §4 for the out-of-scope list. The flagship requirement is the "Minimize Time On Site" scenario (spec §1 and §6.1).

Practical notes:

- npm, not yarn. Dev: `npm run start:dev` (root). Schema changes via Sequelize migrations only; never `sequelize.sync()`. Run migrations only against localhost DBs (except the deliberate Phase 2 prod deploy).
- Monorepo: `client/` (Vue 3 + Vuetify + Vite, Vitest), `server/` (Express + Sequelize + Postgres, Jest), `shared/`.
- Typecheck + lint + tests green before merge. Never weaken a test to make it pass.
