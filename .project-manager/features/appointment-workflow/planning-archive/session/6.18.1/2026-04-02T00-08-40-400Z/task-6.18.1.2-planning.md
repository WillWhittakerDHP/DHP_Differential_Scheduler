# Plan: task 6.18.1.2 — Client + booking audit closure (seller → owner)

## Contract

- **Tier:** task | **ID:** 6.18.1.2 | **Parent session:** 6.18.1
- **Scope:** Verify **no `seller`** remains as **`users.user_role` / API** value outside documented exceptions; eliminate **duplicate hardcoded role arrays** in app source; record **grep audit** in session log; optional **ARCHITECTURE.md** alignment line.
- **Governance:** Thin components; shared catalog imports; no silent role fallbacks.

## Where we left off

Task **6.18.1.1** shipped `@shared` `USER_ROLE_VALUES`, migration, server wiring, and most **client** updates (admin selects, booking builders, wizard `owner` section, `authRedirect`, transformer mapping). Task **6.18.1.2** closes the session plan with a **verification pass** and **doc/session log** updates—not a second full refactor.

## Story

This task **confirms** the **`seller` → `owner`** rename is consistent across **client and shared** surfaces, **documents** allowed exceptions (legacy persisted wizard JSON, migration SQL, block-instance **name** `"Seller"`, unrelated copy), and **captures** the audit in the session log so Session **6.18.1** can end cleanly.

## Codebase recon (agent-led — required)

**Paths reviewed:** `shared/constants/roleConstants.ts`, `shared/types/appointmentTypes.ts`, `client/src/constants/attendeeRoles.ts`, `client/src/types/user.ts`, `client/src/utils/booking/appointmentDataBuilders.ts`, `client/src/utils/transformers/appointmentToWizardTransformer.ts`, `client/src/utils/authRedirect.ts`, `client/src/views/admin/tabs/components/UserCreateForm.vue`, `client/src/views/admin/tabs/components/InlineEditUserRoleCell.vue`, `client/src/types/booking/wizardStateData.ts`, `client/src/composables/booking/useContactsStepData.ts`, `client/src/utils/booking/wizardContactsStepFromState.ts`, `server/src/utils/userTypeMapping.ts` (block **name** vs role key).

**Patterns / call sites:** Role pickers use `[...USER_ROLE_VALUES]` or equivalent; API `userRole` unions use shared constants; wizard **additionalContacts** use canonical **`owner`** with **`seller`** only for **back-compat reads** of old JSON; `userTypeMapping` maps **`USER_ROLE_OWNER`** → block instance **name** `"Seller"` until seeds rename the instance.

**Gaps / unknowns:** Third-party docs under `.project-manager/features/data-flow-alignment/` may still say `seller` — **out of scope** unless explicitly in appointment-workflow session scope; grep `client/src` + `server/src` + `shared/` for product code only.

## Analysis

- **Problem:** Session **6.18.1** promised a **grep-backed audit**; without a recorded pass, drift can return unnoticed.
- **Boundaries:** **Client + shared** source under repo roots above; **no** new server behavior unless a straggler `seller` appears in `server/src` **role** checks (unlikely after 6.18.1.1).
- **Patterns:** Prefer `USER_ROLE_*` / `USER_ROLE_VALUES` from `@shared` via `attendeeRoles`; keep legacy **`seller`** only in wizard **persisted-role** union and equality checks for **migration of old state**.
- **Risks:** Renaming UI field names (`sellerInfo`, `showSeller`) is **high churn** for validators and injection keys — **not required** for this task; they denote the **owner** contact slot, not the DB enum string.
- **Alternatives:** Full rename to `ownerInfo` everywhere — defer to a follow-up UX pass if product wants.

## Design

1. **Grep:** Search `client/src`, `server/src`, `shared/` for `seller` / `"seller"` / `'seller'`; classify each hit (allowlist vs fix).
2. **Fix:** Only if a hit maps to **live `user_role`** or a **parallel role array**; otherwise document-only.
3. **Session log:** Append a short **“Role audit (6.18.1.2)”** subsection with command + summary (allowed vs fixed).
4. **ARCHITECTURE.md** (optional): Adjust **Users / `user_role`** bullet from “Planned” to **delivered** for catalog + rename when audit is clean (appointment-workflow scope).

## Goal

Close **Session 6.18.1** with a **documented, grep-verified** client/shared alignment to **`owner`**, with **no** unintended **`seller`** API values and **no** stray hardcoded full role lists in product source.

## Files (primary)

| Action | Paths |
|--------|--------|
| Verify / tiny edits | Any straggler under `client/src`, `shared/` found by grep |
| Session record | `sessions/session-6.18.1-log.md` (audit excerpt) |
| Optional doc | `.project-manager/ARCHITECTURE.md` § Users / `user_role` |

## Approach

1. Run targeted search (e.g. `rg seller client/src server/src shared`) and triage each match.
2. Fix only **product** issues (e.g. forgotten `'seller'` in a role union or items array).
3. Append grep summary to **session log**.
4. Run `vue-tsc -b`, `server` `tsc --noEmit`, `npm run lint` in `client` and `server`.
5. If all clean, optionally update **ARCHITECTURE.md** one bullet to reflect **delivered** catalog/rename.

## Checkpoint

- Grep triage documented; **no** `seller` as **current** API `user_role` in app source except legacy wizard read paths and comments.
- Lint + typecheck pass.

## Deliverables

- Session log audit note.
- Zero or minimal code diffs (stragglers only).
- Optional ARCHITECTURE.md tweak.

## Acceptance criteria

- [ ] `client/src` has no `'seller'` / `"seller"` used as **`user_role`** except legacy wizard **role** field compatibility (`wizardStateData`, `useContactsStepFromState`, `appointmentToWizardTransformer` branches).
- [ ] No duplicate full role string arrays in product UI (prefer `USER_ROLE_VALUES`).
- [ ] `vue-tsc` and server `tsc --noEmit` pass; client and server lint pass.
- [ ] Session **6.18.1** log updated with audit summary.

## Definition of done

- [ ] `npm run start:dev` still works after any edits (spot-check if code changed).
- [ ] Session guide task **6.18.1.2** checkbox updated at **task-end**.

## Reference

- Session: `sessions/session-6.18.1-planning.md`
- Prior task: `sessions/task-6.18.1.1-planning.md`, `sessions/task-6.18.1.1-handoff.md`
- Phase: `phases/phase-6.18-guide.md`
- `.project-manager/ARCHITECTURE.md` — Users / `user_role`

## Architecture context (pointer)

Domain map and booking boundaries: `.project-manager/ARCHITECTURE.md`. Full injected excerpt lives in session planning if needed.
