# Session 6.18.1: Shared role catalog + `seller` → `owner` + full-stack audit

## Role audit (task 6.18.1.2) — 2026-04-01

**Scope:** `rg seller` on `client/src`, `server/src`, `shared` (product source).

**Allowlist (intentional; no change):**

- **Legacy wizard JSON:** `wizardStateData` union includes `seller`; `useContactsStepData`, `wizardContactsStepFromState`, and `appointmentToWizardTransformer` accept `seller` alongside `owner` when rehydrating old persisted state.
- **Contact slot naming:** `sellerInfo`, `showSeller`, validation keys `sellerFirstName` / `sellerLastName` / `sellerEmail` — UI/composable identifiers for the **owner** contact section, not the DB enum string.
- **Unrelated:** `NavBarNotifications.vue` (“best seller” copy); `appointmentHelpers.ts` key `seller: 'secondary'` (display tier, not `user_role`).
- **Server:** migration `20260432_000056_*` and baseline SQL; comment in `ownershipEnforcement.ts`; `roleConstants.ts` comment on `USER_ROLE_OWNER`.

**Result:** No remaining `seller` as **current** `users.user_role` / API value outside the legacy-wizard allowlist above.

**Verification:** `vue-tsc -b`, `server` `tsc --noEmit`, `npm run lint` in `client` and `server` — pass at closure.

---

## Completed tasks

| Task | Outcome |
|------|---------|
| **6.18.1.1** | `@shared` `USER_ROLE_VALUES`, ENUM migration `seller` → `owner`, server Joi / Sequelize / `userTypeMapping` / routes / middleware; client + shared alignment shipped with audit follow-up. |
| **6.18.1.2** | Grep triage documented above; `.project-manager/ARCHITECTURE.md` Users / `user_role` + domain table updated to **delivered** for Session 6.18.1; session guide tasks filled. |

**Next:** `/session-end 6.18.1`, then Session **6.18.2** (admin role ↔ block instance alignment) per phase guide.
