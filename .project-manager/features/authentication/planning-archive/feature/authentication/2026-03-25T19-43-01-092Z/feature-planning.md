# Plan: feature authentication — authentication

## Contract
- **Tier:** feature | **ID:** authentication
- **Scope:** authentication
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this feature.

## Inherited Open Questions (from project 7)

> Unresolved items from the parent **Open Questions** sections — **planning input** for the agent, not a hard gate.

1. **[Open Questions (Feature 7)]** **Pre-alpha user-type switching:** For E2E testing, what mechanism lets testers switch between user types and associated auth levels (toggle, select menu)? How many auth conditions exist — admin / non-logged-in / non-agent / client / agent? Agents logged in have different rights than unauthenticated non-agents and non-admins. *(Needs design decision before Enactment step.)*
2. **[Open Questions (Feature 7)]** **Google OAuth:** Can we add a "Log in with Google" option? *(Needs scoping — deferred or included in auth strategy step.)*
### Agent: required synthesis

- Treat each item as **design input**: fold decisions, alternatives, and structure hints into **Goal**, **Approach**, **Checkpoint**, and **How we build the tierDown** where they affect scope or sequencing.
- If an item is **deferred**, say so in **Approach** or **Checkpoint** (where and when it will be decided).
- **Do not** require the human to run `/resolve-question` before continuing tier-start; **filling this planning doc** is the contract. Optionally record decisions in the parent guide later with `/resolve-question`.

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

## How we build the tierDown to achieve them
- **Phase 7.1:** Database & Models
- **Phase 7.2:** Server Infrastructure (strategy interface, session, config, middleware, router)
- **Phase 7.3:** Magic Link Strategy (beta / development)
- **Phase 7.4:** Client-Side Auth
- **Phase 7.5:** Password Strategy (production — deferred)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/feature-authentication-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/feature-authentication-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
