# Plan: task 6.10.6.1 — Server: New tables, models, CRUD

## Contract
- **Tier:** task | **ID:** 6.10.6.1
- **Scope:** Server — Create CalendarSettings and WizardSettings models, migrations, singleton CRUD routers; simplify businessSettings router
- **Governance:** 1 governance highlight — read reports before filling slots

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Session 6.10.6 started; first task is server tables and CRUD.

## Goal
Create CalendarSettings and WizardSettings models (id, settingValue JSONB, createdAt, updatedAt). Add migrations: create calendar_settings and wizard_settings tables; split existing business_settings/blob data into three tables and drop availability_setting_entries; drop auto_confirm_enabled column. Add singleton CRUD routers (GET /, PUT /) for calendar-settings and wizard-settings; mount at /calendar-settings and /wizard-settings. Simplify businessSettingsCrudRouter to direct read/write of availability_settings row only; remove availability_setting_entries branching.

## Files
- `server/src/db/models/admin/calendar_settings.ts`, `wizard_settings.ts`
- `server/src/db/migrations/` (20260315_100001–100004)
- `server/src/routes/internal/calendarSettings/calendarSettingsCrudRouter.ts`, `wizardSettings/wizardSettingsCrudRouter.ts`
- `server/src/routes/internal/index.ts` (mount)
- `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts`

## Checkpoint
- Two new models registered; four migrations runnable; two new routers return/upsert single row; business settings router no longer references availability_setting_entries.

---
## Reference
- TierUp guide: `sessions/session-6.10.6-guide.md`
