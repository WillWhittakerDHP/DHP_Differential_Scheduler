# Plan: phase 7.3 — 7.3

## Contract
- **Tier:** phase | **ID:** 7.3
- **Scope:** 7.3
- **Governance:** 2 governance highlights — read reports before filling slots

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
Phase **7.2** is complete: strategy types, session manager, cookie helpers, `requireAuth`, and auth router scaffolding exist under `server/src/auth/` and integrate with Phase **7.1** models. Phase **7.3** adds the first concrete strategy (magic link) and server routes that create sessions end-to-end—still **without** new Vue UI (that is Phase **7.4**).

## Goal
Implement **magic-link authentication** on the server: a `magicLinkStrategy` (or equivalent) that fits the existing strategy contract, persistence using the `magic_links` model, a **request-link** path (email in production-shaped hook; **console or structured log in dev**), and a **verify** path that validates the token, creates a server session via the session manager, and sets the **httpOnly session cookie**. Leave password and OAuth out of this phase.

## Files
- **New / extended server:** `server/src/auth/strategies/` (magic link strategy), `server/src/routes/internal/auth/authRouter.ts` (request + verify handlers), optional `server/src/services/` or `server/src/auth/` helper for outbound email vs dev logging.
- **Existing seams:** `server/src/auth/strategies/strategyTypes.ts`, `server/src/auth/sessionManager.ts`, `server/src/auth/sessionCookie.ts`, `server/src/db/models/auth/magic_link.ts`.
- **Planning:** this file, `phase-7.3-guide.md`, and post-phase `phase-7.3-handoff.md` when 7.3 ends.

## Approach
1. Implement magic-link token lifecycle (create, store, expiry, single-use or rotation policy) against the existing DB model; keep branching shallow and log failures with the project logger.
2. Expose HTTP endpoints consistent with Phase 7.2 router patterns; wire verify flow to **session create + cookie set** so `requireAuth` succeeds on the next request.
3. Abstract **email delivery** behind a small interface or env-gated implementation so dev never requires SMTP.
4. Defer **client** login forms and deep guard alignment to **7.3** only as needed for manual smoke (e.g. hitting verify URL); full Vue work stays in **7.4**.

## Checkpoint
- Requesting a magic link for a known user identity produces a persisted token and a visible delivery signal (email or dev log).
- Visiting the verify URL (or POST, per design) with a valid token yields a session and cookie; invalid/expired tokens return clear errors and logs.
- No new migrations unless the team discovers a gap versus `magic_links` / sessions schema from 7.1.

## How we build the tierDown to achieve them
- **Session 7.3.1:** Magic link strategy — token generation, persistence, expiry/consumption rules aligned with `strategyTypes` and `magic_link` model.
- **Session 7.3.2:** Request-magic-link API + mailer abstraction (real email when configured; console/logger fallback in dev).
- **Session 7.3.3:** Verify route — validate token, create session, set cookie, structured error paths and logging.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/feature-authentication-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/phases/phase-7.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
