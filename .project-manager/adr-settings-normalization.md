# ADR: Normalized app settings (`app_setting_entries`)

## Context

Availability, calendar, and wizard configuration lived in JSONB columns on `business_settings`, `calendar_settings`, and `wizard_settings`.

## Decision

Introduce **`app_setting_entries`**: `namespace` (`availability` | `calendar` | `wizard`), `path` (`document` in phase 1), `value_jsonb`, unique `(namespace, path)`.

- **REST response shapes unchanged**; repositories assemble/persist documents.
- **Migration** backfills from legacy tables (idempotent `ON CONFLICT DO UPDATE`).
- **Application code** reads and writes **only** `app_setting_entries` for those three documents. Legacy JSONB columns are not updated by the app (optional later DROP).

## Schema

| Column         | Type        | Notes                                 |
|----------------|-------------|---------------------------------------|
| id             | UUID PK     |                                       |
| namespace      | TEXT        | CHECK availability, calendar, wizard  |
| path           | TEXT        | `document`                            |
| value_jsonb    | JSONB       | Full document                         |
| schema_version | INT         | Default 1                             |
| updated_at     | TIMESTAMPTZ |                                       |

## Key registry

| namespace    | path       | Document type              |
|-------------|------------|----------------------------|
| availability | document  | `AvailabilitySettingsData` |
| calendar    | document   | `CalendarSettingsData`     |
| wizard      | document   | `WizardSettingsData`       |

## Manual QA

- Admin Business Controls: availability, calendar, wizard save/load; hard refresh.
- Booking wizard and computed availability paths.

## Appendix: Server read/write inventory

### Availability

- `businessSettingsCrudRouter.ts` — GET/POST/PUT/PATCH/DELETE for `availability_settings` (via `availabilitySettingsRepository`)
- `computedAvailabilityService.ts` — reads availability for slots/constraints
- `constraintExtractor.ts` / tests — `AvailabilitySettingsData` shape

### Calendar (singleton)

- `calendarSettingsCrudRouter.ts` — GET/PUT
- `calendarSettingsRepository.ts` — `getCalendarSettings`, `saveCalendarSettingsData`
- `computedAvailabilityService.ts`, `appointmentHelpers.ts` — `getCalendarSettings`

### Wizard (singleton)

- `wizardSettingsCrudRouter.ts` — GET/PUT
- `wizardSettingsRepository.ts` — `getWizardSettingsData`, `saveWizardSettingsData`

### Other `business_settings` keys

Non-`availability_settings` rows stay on `business_settings` and are unchanged.

### Production keys

The scheduling document uses `availability_settings`. Other keys may exist if created via the generic business-settings API; they are not migrated to `app_setting_entries` in phase 1.
