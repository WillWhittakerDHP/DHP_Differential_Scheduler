# Feature calendar-appointment-availability Guide

**Purpose:** Feature-level guide for planning and tracking the Calendar & Appointment Availability system

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** calendar-appointment-availability
**Description:** Server-side slot computation, client-side calendar UI, time slot selection, and differential scheduling — all functional for the booking workflow.
**Status:** Complete

**Duration:** ~12 months (built alongside Features 2, 4, 5)
**Started:** 2025-02-01
**Completed:** 2026-02-21

---

## Research Phase

**Status:** Complete (research conducted during implementation alongside Feature 2)

### Research Findings

Research was conducted as part of the Google APIs integration (Feature 2) which provided the foundation for this feature.

**Key Decisions:**
- Server-side slot computation (not client-side) for security and consistency
- 14-day prefetch strategy for smooth UX without excessive API calls
- Orchestrator pattern to coordinate 10+ composables cleanly
- Shared types in `shared/` directory for server-client consistency
- Vuetify date picker with custom graph bar overlay for differential visualization

**Technology Choices:**
- Vuetify Date Picker — Native Vue 3 component with responsive design
- Computed Availability Service — Server-side orchestrator pattern
- Constraint-based slot filtering — Extensible violation key system

**Architecture:**
The availability system follows a pipeline pattern: the server fetches calendar events and drive times, extracts constraints from business settings, computes capacity, and generates filtered slots. The client receives pre-computed slots, applies appointment shape (differential scheduling), and presents them in a calendar UI. An orchestrator composable coordinates 10+ specialized composables.

**Risks Identified:**
- API rate limits on Google Calendar/Maps — Mitigated with caching and rate limiting (Feature 2)
- Complex composable coordination — Mitigated with orchestrator pattern
- Calendar event creation needs auth — Deferred to Phase 3.5 (depends on Feature 7)

---

## Feature Objectives

- Compute available appointment slots server-side using calendar events, drive times, and business constraints
- Display available dates and time slots in a responsive calendar UI with Vuetify
- Support differential scheduling (major/minor service perspectives with offset arrival times)
- Integrate availability into the booking wizard as a complete step with validation
- Provide admin-configurable availability settings (capacity limits, lead times, overlap rules)
- Support calendar event creation and editing from the availability UI

---

## Phases Breakdown

- [x] ### Phase 3.1: Server-Side Slot Computation
**Description:** Build the server-side availability pipeline that computes appointment slots
**Status:** ✅ Complete
**Key Files:** `computedAvailabilityService.ts`, `slotComputationService.ts`, `capacityComputer.ts`, `constraintExtractor.ts`, `availabilityRouter.ts`
**Success Criteria:**
- Server computes available slots from business constraints
- Calendar events and drive times factored into availability
- Capacity limits enforced (daily, weekly, rolling)

- [x] ### Phase 3.2: Client-Side Calendar UI
**Description:** Build the client-side calendar component with Vuetify integration
**Status:** ✅ Complete
**Key Files:** `AvailabilityCalendarSection.vue`, `AvailabilityStep.vue`, `useComputedAvailability.ts`, `useAvailabilityOrchestrator.ts`, 10+ supporting composables
**Success Criteria:**
- Calendar displays available dates and time slots
- 14-day prefetch for smooth UX
- Responsive design for mobile and desktop

- [x] ### Phase 3.3: Differential Scheduling & Slot Selection
**Description:** Implement differential scheduling and time slot selection
**Status:** ✅ Complete
**Key Files:** `useAppointmentSlots.ts`, `appointmentSlotBuilder.ts`
**Success Criteria:**
- Major/minor perspective differential scheduling working
- Graph bar visualization for differential display
- Slot selection integrated with wizard state

- [x] ### Phase 3.4: Wizard Integration & End-to-End Flow
**Description:** Integrate availability into the booking wizard
**Status:** ✅ Complete
**Success Criteria:**
- Complete end-to-end flow from property selection to slot selection
- Validation enforced before proceeding

- [x] ### Phase 3.5: Calendar Invite Configuration & Wiring
**Description:** EventInstance calendar properties, template variable resolution, and invite pipeline wiring
**Status:** ✅ Complete
**Completed:** 2026-02-21
**Key Files:** `server/src/services/invites/`, `server/src/db/models/booking/event_instance.ts`, `client/src/views/admin/tabs/InstancesTab.vue`
**Success Criteria:**
- EventInstance model extended with 10 Google Calendar property columns
- Admin UI for configuring all calendar properties per EventInstance
- Template variable resolution for summary/description/location fields
- Invite orchestration pipeline wired to appointment creation and status transitions

- [ ] ### Phase 3.6: differentialRole with Moveable Modal
**Description:** Add `differentialRole` enum field to EventShape for direct role declaration (major/minor/moveable), update 9 consumer files to use role-based resolution, and re-enable the moveable parts scheduling modal
**Status:** In Progress
**Key Files:** `server/src/db/models/booking/event_shape.ts`, `client/src/utils/eventAttendeeUtils.ts`, `client/src/composables/booking/useMoveablePartsScheduling.ts`, `client/src/composables/booking/useAvailabilityStepHandlers.ts`
**Success Criteria:**
- EventShape has `differentialRole` column with migration and seed data
- All consumer files use `differentialRole`-first resolution with attendee fallback
- Moveable parts modal triggers when moveable parts detected in slot selection
- TypeScript compiles, linting passes, app starts

---

## Dependencies

**Prerequisites:**
- Feature 0: Vue.js Migration (✅ Complete)
- Feature 1: Data Flow Alignment (✅ Complete)
- Feature 2: Google APIs Integration (✅ Complete)

**Downstream Impact:**
- Feature 6 Phase 6.8 (Force-Create) uses slot computation's violation keys
- Feature 16 (Admin UI Overhaul) includes admin calendar view
- Feature 11 (Beta Launch) includes real-time availability sync

**External Dependencies:**
- Google Calendar API (integrated via Feature 2)
- Google Maps Routes API (integrated via Feature 2)

---

## Success Criteria

- [x] Phase 3.1 complete — Server-side slot computation
- [x] Phase 3.2 complete — Client-side calendar UI
- [x] Phase 3.3 complete — Differential scheduling
- [x] Phase 3.4 complete — Wizard integration
- [x] Phase 3.5 complete — Calendar invite configuration & wiring
- [ ] Phase 3.6 complete — differentialRole field and moveable modal re-enabled
- [x] Architecture decisions documented
- [x] Code quality checks passing
- [ ] All tests passing (deferred — Feature 9)
- [ ] Ready for production

---

## Git Branch Strategy

**Branch Name:** `feature/calendar-appointment-availability`
**Branch From:** `develop`

**Branch Management:**
- Created: 2026-02-21 (formalized with feature-start)
- Historical note: Phases 3.1–3.5 were originally built on `feature/google-apis-integration` alongside Features 2, 4, 5

---

## End of Feature Workflow

**CRITICAL: Prompt before ending feature**

After completing Phase 3.6, **prompt the user** before running `/feature-end`:

```
## Ready to End Feature?

All phases complete. Ready to merge feature branch?

**This will:**
- Generate feature summary
- Merge feature/calendar-appointment-availability → develop
- Delete feature branch
- Finalize documentation

**Proceed with /feature-end?** (yes/no)
```

---

## Notes

- Phases 3.1–3.4 were built alongside Feature 2 (Google APIs Integration) on the same branch
- The feature numbering in the original plan used "4.x" phase numbers but has been renumbered to "3.x" to match the feature ID
- Phase 3.5 (event creation/editing UI) depends on Feature 7 (Authentication) for user identity
- Admin calendar view is tracked separately in Feature 16 (Admin UI Overhaul)
- 60+ source files across server, client, shared directories
- 13 test files covering server and client availability logic

---

## Related Documents

- Feature Guide (this document): `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-guide.md`
- Feature Log: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-log.md`
- Feature Handoff: `.project-manager/features/calendar-appointment-availability/feature-calendar-appointment-availability-handoff.md`
- PROJECT_PLAN.md: Feature 3 section
