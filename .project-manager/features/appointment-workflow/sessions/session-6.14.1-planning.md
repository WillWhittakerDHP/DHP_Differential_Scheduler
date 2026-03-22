# Session 6.14.1 Planning: Organization defaults & resolved numeric policy

**Session:** 6.14.1  
**Phase:** 6.14  
**Status:** Registered via `/session-add` intent

---

## Goal

Introduce an **organization-level defaults** model (option 3: canonical defaults object + optional overrides / merge at read time) for admin-controlled **numeric policy** that today is scattered across Business Controls. Defaults should be the single source of truth for “what we use when nothing more specific is set”; calendar or future per-entity overrides only store **deltas** or **explicit values** where they differ.

---

## Scope — fields that share the same concept (increments, rates, caps, minute-based policy)

### Time grid & rounding (minutes)

- **`minuteIncrement`** (slot grid) — currently **Calendar → Grid** (`GridConfigPanel.vue`).
- **`durationRounding`** (`enabled`, `increment`, `method`) — **Constraints → Rounding**; `increment` already documented as able to align with `minuteIncrement`.
- **`driveTimeFee.driveTimeRoundingMinutes`** — drive-time **billing** rounding (distinct from overlap drive buffers) — **Calendar → Confirmation & holds** (`DriveTimeFeeAdminFields.vue`).

### Drive-time billing (money + complimentary minutes)

- **`driveTimeFee.complimentaryDriveMinutes`**, **`driveTimeFee.drivingRatePerHour`** — same Confirmation & holds panel as above.

### Holds & admin entry (calendar UX)

- **`holdDurationMinutes`**, **`holdDurationMin`**, **`holdDurationMax`**, **`holdDurationFallback`** — Confirmation & holds.
- **`adminEntryTimeout`** (`value` + unit days/weeks) — same panel.

### Constraints (org baseline candidates)

- **Lead time:** `LeadTimeConfig.minutes` — **Constraints → Range**.
- **Overlap buffers:** minutes on appointment / drive-to / drive-from / lunch — **Constraints → Overlap**.
- **Capacity:** `maxHours`, `maxIncome` (and rolling direction where applicable) — **Constraints → Capacity**.

---

## Out of scope (unless explicitly pulled in)

- Wizard copy/labels (`wizard_settings`)
- Pure enums/toggles without numeric merge
- MLS/business rules tab content
- Multi-tenant calendars (design for it but implement only if already in roadmap)

---

## Deliverables

1. **Shared types** (e.g. under `shared/types/`) for `OrganizationDefaults` (or equivalent) with nested groups: `timeAndRounding`, `driveTimeFee`, `holdsAndAdminEntry`, optionally `constraintBaselines` — exact shape to be decided in session, but must be explicit and JSON-serializable.

2. **Merge / resolve function(s):** input = stored defaults + stored calendar/availability payload (or partial overrides); output = **resolved** numbers used by client fee pipeline, slot generation, and server validators — **one place**, no duplicated fallback logic in Vue only.

3. **Persistence strategy:** Document whether defaults live in a new API field, `calendar_settings`, availability JSON, or a new table; align with existing split save paths in `BusinessControlsTab.vue` (`handleSave` for constraints vs calendar vs wizard).

4. **Admin UI:** Add a dedicated surface (recommend new top-level Business Controls tab **“Organization defaults”** or **“Policies”**) with sub-sections mirroring the type groups; existing panels may **link** to defaults or show “Using organization default” vs override — exact UX to be specified in planning doc.

5. **Tests:** Unit tests for merge/resolver (edge cases: missing keys, zero vs unset, clamping hold duration to min/max).

6. **Docs:** Update phase/session planning and any `REQUIRED_DOC_SECTIONS` handoff as per project workflow.

---

## Success criteria

- Resolver is used (or wired with clear follow-up task) wherever **`minuteIncrement`**, **duration rounding increment**, and **`driveTimeFee`** fields are read for booking.
- Admin can edit org defaults in one place.
- No silent fallback that hides misconfiguration (log or validate explicitly per project standards).

---

## Dependencies

Phase 6.14 guide and feature guide list this session; phase 6.14 exists before `/session-start 6.14.1`.
