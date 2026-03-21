# ADR: Normalized app settings (`app_setting_entries`)

## Context

Availability, calendar, and wizard configuration lived in JSONB columns on `business_settings`, `calendar_settings`, and `wizard_settings`. That split storage and complicated versioning and incremental access.

## Decision

Introduce **`app_setting_entries`**: one row per logical scope with `namespace` (`availability` | `calendar` | `wizard`), `path` (`document` for phase 1), and `value_jsonb`. Unique `(namespace, path)`.

- **Phase 1**: Single path `document` holds the full JSON document matching current REST bodies.
- **Reads/writes** go through repositories; **REST response shapes are unchanged**.
- **Migration** backfills from legacy tables (idempotent `ON CONFLICT DO UPDATE`).
- **Source of truth** after rollout: `app_setting_entries` only; legacy JSONB on the three tables is no longer read or updated by application code (optional later column drop).

## Schema (logical)

| Column           | Type        | Notes                                      |
|------------------|-------------|--------------------------------------------|
| id               | UUID PK     |                                            |
| namespace        | TEXT        | CHECK: availability, calendar, wizard      |
| path             | TEXT        | `document` (registry; extend later)        |
| value_jsonb      | JSONB       | Full settings object                       |
| schema_version   | INT         | Default 1                                  |
| updated_at       | TIMESTAMPTZ |                                            |

Unique: `(namespace, path)`.

## Key registry (code)

| namespace    | path       | Assembled shape                          |
|-------------|------------|------------------------------------------|
| availability| document   | `AvailabilitySettingsData` (wire)      |
| calendar    | document   | `CalendarSettingsData`                   |
| wizard      | document   | `WizardSettingsData`                     |

## Phases

1. DDL + backfill migration.
2. Repositories + wire `computedAvailabilityService`, business/calendar/wizard CRUD.
3. Dual-write (legacy + `app_setting_entries`) during transition — **superseded**: this rollout writes only `app_setting_entries` after migration backfill; legacy JSONB is left as historical snapshot until optional DROP.
4. Legacy JSONB no longer read/written by app (this ADR’s target state).

## Rollback

Re-run from backup or undo migration `down` (drops `app_setting_entries`). Restore prior server version that read legacy JSONB only.

## Manual QA

- Admin → Business Controls: availability, calendar, wizard tabs save/load; hard refresh.
- Booking wizard: labels/flags and availability-driven slots still work.
- Server logs: no unexpected errors on computed availability path.

---

## Appendix: Read/write inventory (server)

### `business_settings` / availability

| Location | Operation |
|----------|-----------|
| `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` | GET list/key, POST, PUT, PATCH, DELETE for `availability_settings` and other keys |
| `server/src/services/computedAvailabilityService.ts` | Read availability for slot computation (`fetchAvailabilitySettings`) |
| `server/src/repositories/availabilitySettingsRepository.ts` | Canonical read/write for availability document |

### `calendar_settings` (singleton)

| Location | Operation |
|----------|-----------|
| `server/src/routes/internal/calendarSettings/calendarSettingsCrudRouter.ts` | GET /, PUT / |
| `server/src/repositories/calendarSettingsRepository.ts` | Read (and save) for services |
| `server/src/services/computedAvailabilityService.ts` | `getCalendarSettings()` |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | `getCalendarSettings()` |

### `wizard_settings` (singleton)

| Location | Operation |
|----------|-----------|
| `server/src/routes/internal/wizardSettings/wizardSettingsCrudRouter.ts` | GET /, PUT / |
| `server/src/repositories/wizardSettingsRepository.ts` | Canonical read/write |

### Types / constraints

| Location | Notes |
|----------|-------|
| `server/src/routes/internal/businessSettings/businessSettingsValidators.ts` | Validates availability payload |
| `server/src/services/constraintExtractor.ts` | Uses `AvailabilitySettingsData` type |

### `business_settings` keys in production

Application CRUD treats arbitrary `setting_key` values; the **documented primary key** for scheduling is `availability_settings` (`AVAILABILITY_SETTINGS_KEY`). Other keys may exist if created via API; they remain on `business_settings` and are **not** moved to `app_setting_entries` in phase 1.
