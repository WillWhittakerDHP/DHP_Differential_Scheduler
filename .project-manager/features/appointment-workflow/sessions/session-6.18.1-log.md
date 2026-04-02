# Session 6.18.1: Shared role catalog + `seller` → `owner` + full-stack audit

## Role audit (task 6.18.1.2) — 2026-04-01

**Scope:** `rg seller` on `client/src`, `server/src`, `shared` (product source).

**Post–6.18.1.2 follow-up (no legacy wizard reads):**

- **Wizard / contacts:** `additionalContacts[].role` is **`owner` only** (type + runtime). UI and composables use **`ownerInfo`**, **`showOwner`**, validation keys **`ownerFirstName`** / **`ownerLastName`** / **`ownerEmail`**. Old persisted JSON with `seller` / `sellerInfo` is not read client-side.
- **`appointmentToWizardTransformer`:** Still maps **block instance display name** normalized to `seller` or `owner` (admin may label the user-type block “Seller”) into wizard role **`owner`** — not a persisted `user_role` of `seller`.
- **Admin display:** `getRoleColor` uses **`owner`** for chip color; demo notification copy avoids “best seller”.
- **Server / shared:** migration and docs may still mention historical `seller`; `ownershipEnforcement.ts` comment may note rename.

**Result:** No `seller` as **current** `users.user_role` / API value; client product source has no wizard-role `seller` except the transformer slug match above.

**Verification:** `vue-tsc -b`, `server` `tsc --noEmit`, `npm run lint` in `client` and `server` — pass at closure.

---

## Completed tasks

| Task | Outcome |
|------|---------|
| **6.18.1.1** | `@shared` `USER_ROLE_VALUES`, ENUM migration `seller` → `owner`, server Joi / Sequelize / `userTypeMapping` / routes / middleware; client + shared alignment shipped with audit follow-up. |
| **6.18.1.2** | Grep triage documented above; `.project-manager/ARCHITECTURE.md` Users / `user_role` + domain table updated to **delivered** for Session 6.18.1; session guide tasks filled. |

**Next:** `/session-end 6.18.1`, then Session **6.18.2** (admin role ↔ block instance alignment) per phase guide.
