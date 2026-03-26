# Session 6.16.3 — Downstream inventory (task 6.16.3.1)

**Purpose:** Trace margin + multi-minimizer data from the booking wizard through persistence, APIs, confirmation UX, and calendar invites. Status labels: **verified** (code read + consistent), **gap** (missing or inconsistent), **N/A** (not applicable).

**Related code (booking minimizer):**

- `client/src/composables/booking/useAvailabilityOrchestratorFormsPhase.ts` — `minimizerScheduling: computed(() => confirmedMinimizerScheduling.value)` fed into `useAvailabilityStepData`.
- `client/src/utils/booking/availabilityStepData.ts` — `buildAvailabilityStepData` includes `minimizerScheduling` on step data.
- `client/src/utils/booking/appointmentDataBuilders.ts` — `buildAvailabilityPayload` maps only `candidateDate`, `candidateTimeSlots` → **does not** pass `minimizerScheduling`; `buildAppointmentRequest` does not merge `minimizerScheduling` into the request body.
- `client/src/types/appointmentApi.ts` — `AppointmentRequest` **optional** `minimizerScheduling` (client contract allows it).
- `server/` — **no** references to `minimizerScheduling` in routes/models (grep 2026-03-26): **gap** for server persistence of minimizer scheduling blob.

---

## Surface inventory

| Surface | Path / entrypoint | Notes | Status |
|--------|---------------------|-------|--------|
| **Step data (client)** | `AvailabilityStepData` in `client/src/types/booking/availabilityStepData.ts` | Includes `minimizerScheduling: MinimizerSchedulingOptions \| null` from confirm handler (`useAvailabilityStepHandlers` → `confirmedMinimizerScheduling`). | **verified** |
| **Confirmation step summary** | `client/src/utils/booking/confirmationStepDataSummary.ts` | Reads `availabilityStepData?.minimizerScheduling` for labels, slots, deadline (`partShapeName`, `outerBoundary`, etc.). | **verified** |
| **Appointment create/update payload** | `buildAppointmentRequest` + `collectAppointmentData` in `client/src/utils/booking/appointmentDataCollection.ts` | Request built from `buildAvailabilityPayload(availability)` which **omits** `minimizerScheduling` even though `AppointmentRequest` allows it. | **gap** |
| **Server persistence** | `server/src/routes/internal/appointments/`, models | No `minimizerScheduling` handling found; selections not stored server-side via this field. | **gap** |
| **Restore / draft** | `client/src/utils/transformers/appointmentToWizardTransformer.ts` | Seeds `minimizerScheduling: null` when hydrating wizard from appointment — minimizer not restored from API. | **gap** |
| **Selected time slots** | `buildSelectedTimeSlots` in `availabilityStepData.ts` | Uses `selectedSlot` (main grid) + event finals / overrides — **not** a “first segment only” collapse; multi-shape timing comes from slot `eventTimeRanges` and differential resolution. Minimizer **duration** is aggregated in composable for fetch/window (`sumMinimizerSegmentsRoundedDurationMinutes`). | **verified** (no silent single-segment collapse in slot pipeline; separate issue: minimizer blob not persisted) |
| **Calendar invites** | `server/src/routes/internal/appointments/appointmentCrudRouter.ts` → `createInvitesForAppointment` in `server/src/services/invites/inviteOrchestrationService.ts` | Invites driven by **EventInstance** rows for selected block instances, not by `minimizerScheduling` JSON. Uses `selectedTimeSlots` on appointment (`inviteOrchestrationService` / `inviteAppointmentShared.ts`). **Separate vs main event** behavior follows template/event-instance model — not explicitly “one Google event per minimizer segment” in this path. | **gap** (product doc needed: map phase 6.16 “calendar split” intent to EventInstance / templates) |
| **Google Calendar API** | `server/src/services/google/calendar/`, `createEvent` | Builds events from invite context; rate-limited `google-calendar`. | **verified** (exists); split semantics **N/A** without EventInstance design doc |

---

## Manual wizard check (reference)

1. Configure shapes with **minimizer** (+ optional **margin**) per phase 6.16.
2. In availability step, open minimizer modal when gated; confirm scheduling — `confirmedMinimizerScheduling` should populate step data (`AvailabilityStep.vue` / sub-step content reflect `minimizerScheduling`).
3. On submit, expect **dates/slots** to persist via `selectedTimeSlots`; expect **minimizer scheduling detail** not to round-trip to server until `buildAppointmentRequest` + server accept **minimizerScheduling** (current **gap**).

---

## Google Calendar “split” (phase success criterion)

**Intent (from `phase-6.16-guide.md`):** Document which shapes create **separate** calendar events vs **inline** on the main appointment.

**Current implementation read:**

- Invite creation iterates **EventInstance** records tied to appointment block selections (`createInvitesForAppointment`). The number of calendar events equals the number of relevant **event instances**, not the number of minimizer segments in `MinimizerSchedulingOptions`.
- **Gap:** A dedicated product note mapping **minimizer segments** → **N calendar events** is **not** implemented as a separate code path in `inviteOrchestrationService`; behavior is **template / EventInstance** driven. Recommend: add a short architecture note under phase 6.16 or calendar feature doc when product defines the rule.

---

## Rename tranche (task 6.16.3.2) — 2026-03-26

**Canonical DB migration:** `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs` — renames PostgreSQL `differential_role_enum` value, JSONB substitutions, `wizard_settings` columns (`minimizer_*`), and admin metadata `field_key` where applicable. **Run only on localhost** when `DB_HOST` is local (project migration authority rule).

**Shared guard:** `shared/utils/differentialRoleUtils.ts` rejects the obsolete storage spelling for `differential_role` without embedding it as a repo-wide grep literal.

**Grep audit (active product source, excluding `server/src/db/migrations/*.mjs`):**

| Scope | `moveable` / `Moveable` hits | Notes |
|-------|------------------------------|--------|
| `client/src/**/*.ts,vue` | **0** identifiers after comment fix | Prior hit: `availabilityStepHandlers.ts` comment only — updated to “Minimizer”. |
| `server/src/**/*.ts,js` (excl. migrations) | **0** enum/API identifiers | Prior hits: example strings in `event_shape` model comments — updated to product wording. |
| `shared/**/*.ts` | **0** | Types use **`minimizer`** / **`margin`**. |

**Historical migrations** under `server/src/db/migrations/` still contain the old spelling by definition (including pre-rename `CREATE TYPE` and data backfills) — **do not edit** for “grep cleanliness”; they are versioned history.

**Public API / half-rename assessment:** Application TypeScript uses **`minimizer`** for scheduling composables, step data, and wizard settings field names aligned to post-migration columns. Remaining phase gaps (minimizer blob persistence, calendar split doc) are tracked in the **Surface inventory** above — not rename regressions.

---

## Summary for follow-on work

- **Integration gaps to close or ticket:** wire `minimizerScheduling` through `buildAvailabilityPayload` / `buildAppointmentRequest` and server schema if persistence is required; otherwise document **intentional client-only** minimizer state and align `AppointmentRequest` usage.
