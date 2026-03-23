# Plan: task 6.15.1.2 — Logo upload endpoint, disk storage, public URL

## Contract
- **Tier:** task | **ID:** 6.15.1.2
- **Scope:** Server only — multipart upload, persist file, expose URL, write `logoUrl` via existing `saveWizardSettingsData` (depends on **6.15.1.1** columns + repository)
- **Governance:** Thin route handler; named helpers for multer config and URL building; `createLogger` in catch paths

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, server
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Task **6.15.1.1** shipped migration + model + GET/PUT for `brandPrimaryHex`, `brandSecondaryHex`, `logoUrl`. This task adds **file** upload and **serving** so `logoUrl` can point at a real asset.

## Goal
Provide **POST** `multipart/form-data` upload for a wizard logo image, save the file under a configurable disk directory (default under repo `uploads/wizard-logos/`, gitignored), serve files at a stable **public HTTP path** (e.g. `/api/v1/internal/static/wizard-logos/<filename>`), and **persist** the resulting URL in `wizard_settings.logo_url` by merging into current settings via `getWizardSettingsData` + `saveWizardSettingsData`. Restrict MIME types (png/jpeg/webp/svg) and max size (e.g. 2MB). **Out of scope:** admin Vue UI (session **6.15.2**); wizard header (6.15.3).

## Files
- `server/package.json` — add `multer` + `@types/multer`
- `server/src/app.ts` — `express.static` mount for upload directory (path must match URL prefix used in stored `logoUrl`)
- `server/src/routes/internal/wizardSettings/wizardSettingsRouter.ts` (or new router mounted here) — `POST .../logo` with multer, same CSRF/ownership middleware pattern as existing PUT
- `server/src/routes/internal/wizardSettings/wizardSettingsLogoUploadRouter.ts` (optional split) — handler + small helpers
- `server/src/config/wizardLogoUploadConfig.ts` (or similar) — disk path from env, public URL base segment
- `.gitignore` — ignore `uploads/` (or chosen dir)

## Approach
1. Add dependencies; define upload directory (env `WIZARD_LOGO_UPLOAD_DIR` optional); ensure directory exists at startup or on first upload (`fs.mkdirSync` recursive).
2. Configure `multer.diskStorage` with safe filename (`randomUUID` + extension from mimetype); `fileFilter` for allowed images; `limits.fileSize`.
3. Mount `express.static` so GET requests for stored files work behind existing `/api` proxy (Vite proxies `/api` → server).
4. POST handler: on success, build public URL string, load current wizard settings, `saveWizardSettingsData({ ...current, logoUrl })`, return JSON consistent with API conventions (`sendSuccess`).
5. `cd server && npm run lint`.

## Checkpoint
- POST with a valid image returns success and updates `logoUrl` in DB
- GET of the returned URL (browser or curl) serves the file bytes
- Invalid type or oversized file rejected with 4xx and logged
- Server lint passes

## Design Before Execute
- **Stored `logoUrl` format:** Path from site root, e.g. `/api/v1/internal/static/wizard-logos/<file>.png`, so `<img :src="logoUrl">` works when the app is same-origin with API (or proxy in dev).
- **Duplicate upload:** Each upload writes a new file; optional later cleanup of old file is out of scope unless trivial.

---
## Reference
- Prior task handoff: `.project-manager/features/appointment-workflow/sessions/task-6.15.1.1-handoff.md`
- Session plan: `.project-manager/features/appointment-workflow/sessions/session-6.15.1-planning.md`
