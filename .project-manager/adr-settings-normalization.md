# ADR: Relational app settings (no settings JSONB)

## Context

Availability, calendar, and wizard configuration was stored in JSONB (`business_settings` for availability, `calendar_settings.setting_value`, `wizard_settings.setting_value`). A short-lived intermediate table `app_setting_entries` held full-document JSONB per namespace. That approach complicated incremental access, validation at the DB layer, and clear ownership of fields.

## Decision

**Persist settings in normalized relational tables** with child rows where the wire shape is structured (arrays, keyed maps). **REST request/response bodies stay the same**: `AvailabilitySettingsData`, `CalendarSettingsData`, and `WizardSettingsData` are **assembled in server repositories** from joins and **persisted** from PUT bodies via transactional upserts/deletes on child tables.

- **`app_setting_entries`**: removed. Migration `20260325_000006_relational_settings.mjs` backfills from legacy JSONB and/or `app_setting_entries` (if present), then drops that table.
- **Legacy JSONB columns** `wizard_settings.setting_value` and `calendar_settings.setting_value` are dropped after backfill. The `business_settings` row for `availability_settings` is removed after migrating into `availability_settings` + children.
- **Source of truth**: relational tables only; application code does not read or write settings as JSONB documents.

## Schema (logical)

### Wizard (`wizard_settings`)

Singleton row (one row enforced by application). Scalar columns per `WizardSettingsData` field (booleans + nullable text labels). No JSONB.

### Calendar (`calendar_settings` + `calendar_setting_calendars`)

- **Singleton** `calendar_settings`: scalars (`enabled`, `provider`, hold/admin timeout fields, `autoConfirmEnabled`, etc.).
- **Child** `calendar_setting_calendars`: `sort_order`, `email`, `label`, `read_from`, `write_to`, FK to singleton.

### Availability (`availability_settings` + children)

Singleton `availability_settings` for document-level scalars (`minuteIncrement`, `timezone`, location fields, duration rounding, etc.).

| Table | Role |
|-------|------|
| `availability_business_hours` | Per weekday open/close (`day_of_week`, `start_at`, `end_at` as `TIMESTAMPTZ`) |
| `availability_buffer_entries` | One row per buffer kind (`appointment`, `drive_to_candidate`, …) with minutes, enforcement, placement, apply_to |
| `availability_range_constraints` | Parent per range constraint (`business_hours`, `lead_time`, `date_range`) with enforcement + typed columns |
| `availability_range_constraint_hours` | Child hours for `business_hours` range rows |
| `availability_max_work_hours` | One row per scope (`day`, `calendar_week`, `rolling_week`) |
| `availability_max_income_rows` | One row per scope |
| `availability_differential_attendees` | Ordered rows with `role` (`major` \| `minor`) replacing attendee arrays |

## Migrations

- **`20260324_000005_app_setting_entries.mjs`** (historical): may exist on databases that already created `app_setting_entries`. **`20260325_000006_relational_settings.mjs`** reads from `app_setting_entries` when present, else from legacy JSONB, populates relational tables, then drops `app_setting_entries` and legacy columns. **`down()` is intentionally unsupported** (irreversible data shape change).

## Key code paths

| Area | Responsibility |
|------|----------------|
| `server/src/repositories/availabilityRelationalCodec.ts` | Map DB rows ↔ `AvailabilitySettingsData` |
| `server/src/repositories/availabilitySettingsRepository.ts` | Load/save availability document (transaction on save) |
| `server/src/repositories/calendarSettingsRepository.ts` | Load/save calendar document + child calendars |
| `server/src/repositories/wizardSettingsRepository.ts` | Load/save wizard scalars |
| `businessSettingsCrudRouter.ts` | Availability REST; uses availability repository |
| `calendarSettingsCrudRouter.ts`, `wizardSettingsCrudRouter.ts` | Use respective repositories |
| `computedAvailabilityService.ts` | `getAvailabilitySettingsData()` from repository |
| `constraintExtractor.ts` | Unchanged contract: `AvailabilitySettingsData` |

Other `business_settings` keys (non-availability) remain on `business_settings` as before.

## Rollback

Restore from database backup and deploy a server version that matched the prior storage model. Do not rely on migration `down` for `20260325_000006`.

## Manual QA

- Admin → Business Controls: availability, calendar, wizard tabs save/load; hard refresh.
- Booking wizard: labels/flags and availability-driven slots still work.
- Server logs: no unexpected errors on computed availability path.
- After deploy: confirm migration `20260325_000006` applied; `app_setting_entries` absent; `wizard_settings` / `calendar_settings` have no `setting_value` column.

---

## Appendix: Read/write inventory (server)

### Availability

| Location | Operation |
|----------|-----------|
| `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` | GET/PUT/PATCH for `availability_settings` |
| `server/src/services/computedAvailabilityService.ts` | Read availability for slot computation |
| `server/src/repositories/availabilitySettingsRepository.ts` | Canonical read/write |

### Calendar

| Location | Operation |
|----------|-----------|
| `server/src/routes/internal/calendarSettings/calendarSettingsCrudRouter.ts` | GET /, PUT / |
| `server/src/repositories/calendarSettingsRepository.ts` | Load/save |
| `server/src/services/computedAvailabilityService.ts` | `getCalendarSettings()` |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | `getCalendarSettings()` |

### Wizard

| Location | Operation |
|----------|-----------|
| `server/src/routes/internal/wizardSettings/wizardSettingsCrudRouter.ts` | GET /, PUT / |
| `server/src/repositories/wizardSettingsRepository.ts` | Load/save |

### Types / constraints

| Location | Notes |
|----------|-------|
| `server/src/routes/internal/businessSettings/businessSettingsValidators.ts` | Validates availability payload |
| `server/src/services/constraintExtractor.ts` | Uses `AvailabilitySettingsData` |
