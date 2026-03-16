# Convert availability settings blob to independent table entries

## Current state

- **Storage:** One row in `business_settings` with `setting_key = 'availability_settings'` and `setting_value` = full JSON blob (businessHours, buffers, calendarConfig, showApplyCouponInWizard, etc.). Column `auto_confirm_enabled` lives on the same row.
- **API:** Client GET `/business-settings/availability_settings` receives `{ setting_key, setting_value, auto_confirm_enabled }`. PUT sends `{ setting_value, auto_confirm_enabled }` and overwrites the blob.
- **Readers:** appointmentHelpers, computedAvailabilityService, constraintExtractor all do `BusinessSettings.findOne({ where: { settingKey: AVAILABILITY_SETTINGS_KEY }})` and use `setting.settingValue` (and sometimes `setting.autoConfirmEnabled`).

## Target design

- **New table:** `availability_setting_entries` with one row per logical piece: `id` (UUID PK), `entry_key` (VARCHAR UNIQUE), `value` (JSONB), `created_at`, `updated_at`.
- **Same API contract:** GET still returns the same shape; PUT still accepts the same payload. Client and validation unchanged.
- **Single source of truth:** All reads/writes for availability go through a new server-side layer that assembles from entries (GET) or decomposes into entries (PUT).

## Implementation plan

(Summarized; see original plan for full steps.)

1. **New table and model** — Migration + Sequelize model for `availability_setting_entries`.
2. **Availability settings repository** — getAvailabilitySettings() assembles from entries; saveAvailabilitySettings(blob, autoConfirmEnabled) validates and upserts per entry_key.
3. **Wire GET/PUT for availability_settings** — Router uses repo for key `availability_settings` instead of BusinessSettings.
4. **Replace direct BusinessSettings access** — getSettingWithDefault, appointmentHelpers, computedAvailabilityService use repo.
5. **Data migration** — Backfill from current `business_settings` row into entries; optionally remove old row later.
6. **Validation and edge cases** — Keep full-object validation; define POST/DELETE behavior for availability_settings.

## Top-level keys to store as rows

businessHours, minuteIncrement, rangeConstraints, buffers, maxWorkHours, maxIncome, timezone, durationRounding, differentialPerspectives, calendarConfig, defaultLocation, overlapSources, showApplyCouponInWizard, useBrandColorsInWizard, autoConfirmEnabled.

---

## 8. Update session and task docs (new task)

After implementing the independent-entries change, update the phase and session documentation so this work is tracked as a first-class task.

### 8.1 Add a new session for this work

- **Phase guide** ([`.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`](.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md))  
  In **Sessions Breakdown**, add a new session (e.g. **Session 6.10.6**) for converting availability settings from a single blob to independent table entries. Include:
  - **Title:** e.g. "Convert availability settings blob to independent table entries"
  - **Description:** Replace the single `availability_settings` JSONB blob in `business_settings` with a new table `availability_setting_entries` (one row per top-level key). Keep existing GET/PUT API and client contract; server assembles on read and decomposes on write.
  - **Tasks:** (1) New table + migration + repo; (2) Wire GET/PUT to repo; (3) Replace all direct BusinessSettings access for availability; (4) Data migration and optional cleanup.
  - **See:** `sessions/session-6.10.6-guide.md` (to be created).

### 8.2 Create session planning and guide docs

- **Session planning** — Create [`.project-manager/features/appointment-workflow/sessions/session-6.10.6-planning.md`](.project-manager/features/appointment-workflow/sessions/session-6.10.6-planning.md) using the same structure as existing session planning docs (Contract, Work Profile, Where we left off, Goal, Files, Approach, Checkpoint, How we build the tierDown, Reference). Scope: convert availability settings blob to independent entries; tasks aligned with sections 1–6 of this plan.
- **Session guide** — Create [`.project-manager/features/appointment-workflow/sessions/session-6.10.6-guide.md`](.project-manager/features/appointment-workflow/sessions/session-6.10.6-guide.md) with Quick Start, Session Workflow, Session Overview, Key Context (repo, assembly/decompose, top-level keys), Tasks (e.g. 6.10.6.1 Table + repo, 6.10.6.2 Wire GET/PUT, 6.10.6.3 Replace callers, 6.10.6.4 Migration), Success Criteria, and Related Documents. Reference this plan and the phase guide.

### 8.3 Optional handoff

- When starting Session 6.10.6, a handoff doc ([`session-6.10.6-handoff.md`](.project-manager/features/appointment-workflow/sessions/session-6.10.6-handoff.md)) can be created from the previous session’s end state (e.g. 6.10.5) with transition context and branch; include “availability settings independent entries” in Next Action and scope.

### Summary

| Doc | Action |
|-----|--------|
| `phase-6.10-guide.md` | Add Session 6.10.6 to Sessions Breakdown with title, description, tasks, and link to session-6.10.6-guide.md. |
| `session-6.10.6-planning.md` | Create; scope = independent entries; tasks = table+repo, wire API, replace callers, migration. |
| `session-6.10.6-guide.md` | Create; task list and checkpoints aligned with planning; reference this plan. |
| `session-6.10.6-handoff.md` | Optional; create when starting 6.10.6 with transition context. |

This keeps the independent-entries work visible in the phase and session structure and gives a clear task/session to run (e.g. `/session-start 6.10.6`, `/task-start 6.10.6.1`) when executing the change.
