# Plan: task 6.10.6.3 — Server: Remove old availability_setting_entries path

## Contract
- **Tier:** task | **ID:** 6.10.6.3
- **Scope:** Server — Delete availabilitySettingsRepository, availability_setting_entry model, migrations; remove from registry
- **Governance:** 1 governance highlight

## Where we left off
Task 6.10.6.2 complete; consumers use new tables.

## Goal
Delete server/src/repositories/availabilitySettingsRepository.ts; delete server/src/db/models/admin/availability_setting_entry.ts; delete migrations 20260306_100004_create_availability_setting_entries.mjs and 20260306_100005_backfill_availability_setting_entries.mjs. Remove AvailabilitySettingEntry from server/src/db/models/index.ts, server/src/config/models.ts, server/src/config/app.ts.

## Files
- Deleted: availabilitySettingsRepository.ts, availability_setting_entry.ts, two migrations
- Updated: models/index.ts, config/models.ts, config/app.ts

## Checkpoint
- No references to AvailabilitySettingEntry or availabilitySettingsRepository; server builds and runs.

---
## Reference
- TierUp guide: `sessions/session-6.10.6-guide.md`
