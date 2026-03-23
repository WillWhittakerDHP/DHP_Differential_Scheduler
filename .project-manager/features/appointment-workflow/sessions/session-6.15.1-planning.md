# Plan: session 6.15.1 — DB schema and brand settings API with logo upload

## Contract
- **Tier:** session | **ID:** 6.15.1
- **Scope:** Server-only: migration + model + repository + routes for brand fields and logo file upload
- **Governance:** Read function playbook and server route patterns; `createLogger` in catch paths; no migrations on remote DB hosts (project policy)

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** server
- **Governance domains:** server, shared types
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Admin UI is **6.15.2**; wizard consumption is **6.15.3**. This session ends when API + storage contracts are stable for those tiers.

## Where we left off
Phase **6.15** is in progress on branch `phase-6.15`. Session **6.15.1** is the foundation: persist brand anchors and logo URL on `wizard_settings` and expose upload + read/write APIs before any Vue work.

## Goal
Add **relational columns** (or agreed storage) on `wizard_settings` for **brand primary hex**, **brand secondary hex**, and **logo URL**; implement a **multipart logo upload** endpoint and **static/public serving** so the URL stored in DB resolves to the file; extend **GET/PUT** wizard settings so clients can read and update brand fields. Align with existing `wizardSettingsCrudRouter`, `wizardSettingsRepository`, `wizardSettingsSchemas`, and `shared/types/wizardSettingsTypes.ts`. **Done** when migration + model + repository + routes are wired, validation rejects bad input, errors are logged, and a manual check can upload a file and see it via the returned URL (no admin UI required in this session).

## Files
- `server/src/db/migrations/` — new migration adding columns (nullable strings for hex + logo path/URL)
- `server/src/db/models/admin/wizard_settings.ts` — new attributes + `field` mappings
- `shared/types/wizardSettingsTypes.ts` — extend `WizardSettingsData` (or parallel export) for API payloads
- `server/src/repositories/wizardSettingsRepository.ts` — map new fields
- `server/src/routes/schemas/wizardSettingsSchemas.ts` — Joi for PUT body including brand fields
- `server/src/routes/internal/wizardSettings/wizardSettingsCrudRouter.ts` — wire GET/PUT; add upload route or sibling router mounted under existing internal API
- Upload/storage: follow existing project patterns for `multer` (or equivalent), disk destination, and `express.static` or dedicated GET for public assets (document URL shape)
- **Reference:** `.project-manager/features/appointment-workflow/phases/phase-6.15-guide.md` (session 6.15.1 block)

## Approach
1. **Migration + model** — Add nullable `brand_primary_hex`, `brand_secondary_hex`, `logo_url` (names may match DB conventions); run only where `DB_HOST` is localhost per workspace policy.
2. **Shared types + repository** — Single source of truth for field names; repository read/write maps to Sequelize.
3. **Validation** — Joi (or existing pattern) for hex format and URL/path length; reject invalid payloads with clear errors.
4. **Upload** — POST (or PUT) multipart upload endpoint; save file; set `logo_url` to public URL or path contract documented for 6.15.2/6.15.3.
5. **GET/PUT wizard settings** — Existing singleton upsert; merge new fields without breaking current clients (defaults null/omitted).
6. **Quality** — `cd server && npm run lint`; no new automated tests (Phase 3.0 policy).

## Checkpoint
- Migration applies on local dev DB; Sequelize model matches table
- GET returns new fields (null when unset); PUT persists them
- Upload stores file and `logo_url` is consistent with how static middleware serves it
- Server lint passes; no empty catch blocks

## How we build the tierDown to achieve them
- **Task 6.15.1.1:** Migration, model, shared types, repository, and wizard settings GET/PUT schema wiring
- **Task 6.15.1.2:** Logo upload endpoint, file storage, public URL contract, and integration with PUT/GET

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.15-guide.md`
- Governance reports: `client/.audit-reports/` — session focus is server; still run server lint
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
