# Plan: task 6.15.1.1 — Migration, model, types, repository, GET/PUT for brand fields

## Contract
- **Tier:** task | **ID:** 6.15.1.1
- **Scope:** Server persistence + API read/write for `brand_primary_hex`, `brand_secondary_hex`, `logo_url` on `wizard_settings` (no file upload in this task — that is **6.15.1.2**)
- **Governance:** Explicit return types on new helpers; `createLogger` in catch paths; run migrations only when `DB_HOST` is localhost per project policy

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, server
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Task **6.15.1.2** adds multer upload + static serving; this task only ensures columns and singleton GET/PUT accept optional hex + logo URL strings (client or next task may set `logo_url`).

## Where we left off
Session **6.15.1** planning defines two tasks; this is the first.

## Goal
Add nullable **`brand_primary_hex`**, **`brand_secondary_hex`**, and **`logo_url`** to the `wizard_settings` table via migration; extend the Sequelize **WizardSettings** model and **wizardSettingsRepository** so GET returns them and PUT can upsert them; extend **Joi** (`wizardSettingsPutBodySchema`) and **shared `WizardSettingsData`** so the existing singleton CRUD router exposes the new fields without breaking current clients. **Out of scope for this task:** multipart upload, disk storage, and express.static (task **6.15.1.2**).

## Files
- `server/src/db/migrations/<timestamp>-add-brand-fields-wizard-settings.js` (or `.ts` per project convention)
- `server/src/db/models/admin/wizard_settings.ts`
- `shared/types/wizardSettingsTypes.ts`
- `server/src/repositories/wizardSettingsRepository.ts`
- `server/src/routes/schemas/wizardSettingsSchemas.ts`
- `server/src/routes/internal/wizardSettings/wizardSettingsCrudRouter.ts` (only if router must map new fields explicitly — otherwise repository may suffice)

## Approach
1. Add migration with three nullable string columns (`snake_case` DB names, align with existing `field:` mappings on the model).
2. Add three `declare` properties on `WizardSettings` and `init` fields matching migration.
3. Extend `WizardSettingsData` with optional strings; ensure repository `toData` / `fromBody` (or equivalent) passes them through.
4. Extend Joi: optional hex pattern (`^#?[0-9A-Fa-f]{6}$` or stricter), optional URL/string length cap for `logo_url`.
5. Run migration locally; hit existing GET/PUT routes to verify round-trip (manual or Thunder Client).
6. `cd server && npm run lint`.

## Checkpoint
- Migration applies cleanly on local DB
- GET singleton includes the three keys (null when unset)
- PUT with valid body persists and GET reflects values
- Invalid hex or oversized strings rejected with validation error, not silent coersion
- Server lint passes

## Design Before Execute
- **Repository:** Follow existing pattern for `showApplyCoupon`, `useBrandColors`, and label fields — one map layer between API JSON and model.
- **API:** Keep PUT as partial update if that is existing behavior; new fields optional on every request.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- Session plan: `.project-manager/features/appointment-workflow/sessions/session-6.15.1-planning.md`
- TierUp: `.project-manager/features/appointment-workflow/sessions/session-6.15.1-guide.md`
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
