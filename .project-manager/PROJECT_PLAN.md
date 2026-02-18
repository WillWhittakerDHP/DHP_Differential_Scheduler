# DHP Differential Scheduler — Project Plan

**Purpose:** Single source of truth for all feature development planning and tracking

**Last Updated:** 2026-02-18
**Status:** Active Planning Document

---

## Overview

This document serves as the master project plan for the DHP Differential Scheduler. All feature plans, phase guides, and session documents should align with this plan.

**Structure:** Feature → Phase → Session → Task

**Related Documents:**
- **Launch Infrastructure:** `../../BETA_LAUNCH_CHECKLIST.md` — Hosting, security, deployment, testing (separate from feature development)
- **Future Features:** `future-features-catalog.md` — Evaluated and prioritized feature ideas

---

## Feature Summary

| # | Feature | Status | Directory | Key Dates |
|---|---------|--------|-----------|-----------|
| 0 | Vue.js Migration | ✅ Complete | `features/vue-migration/` | Completed ~2025-02 |
| 1 | Data Flow Alignment | ✅ Complete | `features/data-flow-alignment/` | 2025-02-01 → 2026-01-31 |
| 2 | Google APIs Integration | ✅ Functionally Complete | `features/feature-2-google-apis-integration/` | Started 2026-01-31 |
| 3 | Booking Calculations | ⏳ Core Complete | `features/booking-calculations/` | — |
| 4 | Calendar & Appointment Availability | ✅ Functionally Complete | `features/calendar-appointment-availability/` | — |
| 5 | Beta Feedback System | ✅ Complete | `features/beta-feedback/` | Completed 2026-02-10 |
| 6 | Pricing Cascades | ✅ Complete | — (sub-feature, no dedicated dir) | Completed 2026-02-13 |
| 7 | Property Enrichment & Mappings | ✅ Complete | — (sub-feature, no dedicated dir) | Completed 2026-02-11 |
| 8 | Appointment Workflow | ⏳ Partial | `features/appointment-workflow/` | Phase 1 complete Jan 2026 |
| 9 | Test Suite Setup | 📋 Planning | `features/test-suite-setup/` | — |
| 10 | Beta Feedback Response | 📋 Planning | `features/beta-feedback-response/` | — |
| 11 | Beta Launch | 📋 Planning | `features/beta-launch/` | — |
| 12 | UI Polish | 🔮 Future | `features/feature-7-ui-polish/` | — |
| 13 | Admin UI Overhaul | 🔮 Future | `features/admin-ui-overhaul/` | — |
| 14 | Admin Assistance Wizard | 🔮 Future | `features/gpt-admin-automation/` (to be renamed) | — |

---

## Feature 0: Vue.js Migration

**Status:** ✅ Core Complete
**Description:** Migrate entire application from React to Vue.js with full feature parity, improved type safety, and modern Vue 3 patterns.

### Completion Summary

Structural migration complete. All major systems in place and functional:

- ✅ **Phases 1–6 Complete:** Data layer, state management, data flow foundation, admin panel structure, documentation cleanup, booking wizard structure
- ✅ **Phase 9 Mostly Complete:** Comprehensive naming refactoring (Type→Shape, Profile→Instance, Type→Kind) with database schema, models, API, transformers, and UI updates
- ✅ **Core Infrastructure:** Admin panel, booking wizard, data layer, state management, annotation system, component system, data flow foundation

**Archived Phases:**
- Phase 7: Archived (work completed in Phase 6)
- Phase 8: Deferred → Feature 9 (UI Polish)
- Phase 10: Cancelled (user preference)
- Phase 11: Moved → Feature 9 (UI Polish, bulk updates enhancement)

**Detailed Documentation:**
- **Completion Summary:** `features/vue-migration/vue-migration-completion-summary.md`
- **Feature Guide:** `features/vue-migration/feature-vue-migration-guide.md`
- **Phase Guides:** `features/vue-migration/phases/phase-[N]-guide.md`

---

## Feature 1: Data Flow Alignment

**Status:** ✅ Complete
**Description:** Fix data flow issues, broken interactions, and admin panel functionality. Ensure all admin panel features work correctly with unified data flow.
**Branch:** `feature/data-flow-alignment` (merged to main)
**Completed:** 2026-01-31

### Phases — All Complete

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 1.1 | Database Setup & Appointment Structure | ✅ Complete | 2025-12-04 |
| 1.2 | Booking Wizard Data Flow Fixes | ✅ Complete | 2025-12-04 |
| 1.3 | Interaction Fixes and Validation | ✅ Complete | 2025-12-29 |
| 1.4 | Admin Panel Data Flow Fixes | ✅ Complete | 2026-01-31 |
| 1.5 | Business Rules & Validation | ✅ Complete | 2026-01-31 |

### Key Achievements
- Created appointments, properties, and users database tables with relationships
- Established dual-cache architecture (globalData/businessData)
- Fixed all admin panel CRUD operations and wizard data flow
- Created database-driven business rules system (replaces hardcoded validation)
- 30+ sessions across all phases

### Related Documents
- **Completion Summary:** `features/data-flow-alignment/feature-completion-summary.md` ⭐
- **Feature Plan:** `features/data-flow-alignment/feature-plan.md`
- **README:** `features/data-flow-alignment/README.md`

---

## Feature 2: Google APIs Integration

**Status:** ✅ Functionally Complete
**Description:** Integrate Google Calendar API (availability fetching, event creation), Google Maps API (address autocomplete, drive time), and MLS API (property data).
**Branch:** `feature/google-apis-integration`
**Started:** 2026-01-31

### Phases

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 2.0 | Calendar Configuration UI | ✅ Complete | Admin interface for calendar selection |
| 2.1 | Google Calendar API Integration | ✅ Complete | OAuth, free-busy, events, caching, rate limiting, error handling |
| 2.2 | Google Maps API Integration | ✅ Complete | Places autocomplete, Routes drive time, geocoding, session tokens |
| 2.3 | MLS API Integration | ✅ Infrastructure Complete | All code built; blocked on Bright MLS credentials (requires beta launch) |

### What's Built

**Google Calendar API (Phase 2.1)**
- OAuth2 client with file-based token persistence
- Sliding window rate limiting (60 req/min)
- TTL-based caching (free-busy 5/15 min, events with locations)
- Event creation with attendee invitations
- Full calendar events API with location extraction and geocoding
- Typed error handling with exponential backoff retry and jitter
- Graceful degradation with cache fallback
- Admin API Dev Panel for debugging

**Google Maps API (Phase 2.2)**
- Places API: address autocomplete, place details, geocoding, session token billing optimization
- Routes API: drive time calculations with traffic-aware routing (modern replacement for legacy Distance Matrix)
- Drive time caching (24hr TTL), retry logic, fallback estimates
- Wizard address autocomplete integration
- Drive time buffer refactor (dual `driveTimeTo`/`driveTimeFrom` architecture)

**Bright MLS API (Phase 2.3 — Infrastructure)**
- `brightMlsApiClient.ts`, `brightMlsAuth.ts`, `brightMlsTransformer.ts`
- Property enrichment route (`/api/v1/external/property-enrichment`)
- Client service (`propertyEnrichmentApiService.ts`)
- Auto-populates property form from MLS data, suggests block instances from features
- Returns 503 until credentials are configured — **Bright MLS requires beta launch before issuing API credentials**

**Caching Infrastructure**
- Drive time cache (24hr TTL)
- Address geocoding cache (30-day TTL)
- Calendar events cache (5/15 min TTL)
- Property enrichment cache (60 min TTL)
- Free-busy cache (5/15 min TTL)

**No TODO comments found in any Google service files.**

### Key Files

**Server:**
- `server/src/config/googleOAuth.ts` — OAuth client
- `server/src/services/google/calendar/` — Event creation, events fetching, credentials, helpers, types
- `server/src/services/google/maps/` — Routes API, Places API, helpers, error handler, types
- `server/src/services/google/shared/` — Retry, rate limiter, API config
- `server/src/services/driveTimeCache.ts`, `addressGeocodingCache.ts`, `calendarEventsCache.ts`, `freeBusyCache.ts`, `propertyEnrichmentCache.ts`
- `server/src/routes/external/` — Calendar, Maps, OAuth, property enrichment routes + debug routes

**Client:**
- `client/src/services/mapsApiService.ts` — Autocomplete, place details, session tokens
- `client/src/services/calendarApiService.ts` — Computed availability fetching
- `client/src/services/propertyEnrichmentApiService.ts` — MLS property lookup
- `client/src/composables/booking/useComputedAvailability.ts` — Server slot fetching with 14-day prefetch
- `client/src/composables/booking/useMapsSessionToken.ts` — Maps session tokens

### Remaining Work
- **MLS credentials:** External dependency — Bright MLS issues credentials after beta launch. Infrastructure is ready.
- **Production token storage:** OAuth tokens currently file-based. Consider database storage for production deployment.

### Related Documents
- **Feature Plan:** `features/feature-2-google-apis-integration/feature-plan.md`
- **Handoff:** `features/feature-2-google-apis-integration/feature-2-handoff.md`
- **Log:** `features/feature-2-google-apis-integration/feature-2-log.md`

---

## Feature 3: Booking Calculations

**Status:** ⏳ Core Complete
**Description:** Fee and time calculation logic for the booking wizard. Core calculation logic is implemented and tested; needs consolidation into a unified composable.
**Branch:** `feature/google-apis-integration` (built alongside other features)

### What's Built

**Fee Calculations (Working)**
- `calculateBlockInstanceFee()` — base fee + overage fee per block instance, with pricing cascade integration
- `buildConfirmationPriceData()` — aggregates fees across all block types into full breakdown (`baseFeeTotal`, `overageFeeTotal`, `totalFee`, `lineItems`)
- `calculatePartsTotals()` — shared utility for summing part properties (fees, times, rates)
- Pricing cascade resolution via `pricingCascadeResolver.ts` (`resolvePricingCascadeParts()`, `getEffectivePartsForFee()`)

**Time Calculations (Working)**
- `useTimeSlotCalculations()` — composable for time slot duration calculations from `AppointmentShape`
- `calculateAppointmentSlots()` — creates `AppointmentSlots` from block instances
- `calculateTotalDurationFromAppointmentSlots()` — sums durations across slots
- `createBlockFinal()` / `createPartFinals()` — block and part finalization with totals

**Tests (Exist)**
- `client/src/utils/booking/__tests__/confirmationStepData.test.ts` — fee calculation edge cases, multipliers, overage fees, aggregation, line items

### Key Files
- `client/src/utils/booking/confirmationStepData.ts` — Fee calculations
- `client/src/utils/booking/partsTotals.ts` — Parts totals utility
- `client/src/utils/booking/pricingCascadeResolver.ts` — Pricing cascade resolution
- `client/src/composables/booking/useTimeSlotCalculations.ts` — Time slot calculations
- `client/src/utils/booking/appointmentTimeCalculations.ts` — Appointment slot calculations
- `client/src/utils/booking/BlockFinal.ts` / `PartFinal.ts` — Finalization logic

### Remaining Work
- **`useBookingCalculator` composable:** Planned unified API wrapping existing calculation utilities. The underlying logic works — this is a consolidation refactor, not new logic.
- **Hardcoded values:** `couponDiscount = 0`, `deliveryCharges = 5.0`, `deliveryFree = true` need to come from business settings or a coupon system.

### Related Documents
- **Feature Plan:** `features/booking-calculations/feature-plan.md`
- **README:** `features/booking-calculations/README.md`

---

## Feature 4: Calendar & Appointment Availability

**Status:** ✅ Functionally Complete
**Description:** Server-side slot computation, client-side calendar UI, time slot selection, and differential scheduling — all functional for the booking workflow.
**Branch:** `feature/google-apis-integration` (built alongside other features)

### What's Built

**Server-Side (Complete)**
- `computedAvailabilityService.ts` — Main orchestrator (419 lines): fetches settings, extracts constraints, fetches calendar events, calculates drive times, pre-computes capacity, generates slots
- `slotComputationService.ts` — Slot generation with range/overlap/capacity constraint checking
- `capacityComputer.ts` — Pre-computes scheduled hours (daily, calendar week, rolling week)
- `constraintExtractor.ts` — Extracts range, overlap, and capacity constraints from DB settings
- `availabilityRouter.ts` — `POST /api/v1/internal/availability/computed-data`

**Client-Side (Complete)**
- `useComputedAvailability.ts` — Fetches server-computed slots with 14-day prefetch and per-day fallback
- `useAvailabilityOrchestrator.ts` — Coordinates all availability step composables, transforms server slots to client `TimeSlot[]`
- `useAvailabilityLogic.ts` — Date range calculations, differential service detection, time slot grouping
- `useAppointmentSlots.ts` — Applies appointment shape to slots, handles differential scheduling (major/minor perspectives), generates graph bars
- `AvailabilityCalendarSection.vue` — Vuetify date picker with differential graph display
- `AvailabilityStep.vue` — Full availability step integrated into booking wizard
- 7+ supporting composables: validation, UI state, defaults, slot colors, empty state, moveable parts scheduling, step data

**End-to-End Flow**
1. User selects property → `candidatePlaceId` extracted
2. User selects services → `duration` calculated from block instances
3. `useComputedAvailability` watches placeId/duration → triggers 14-day prefetch
4. Server computes slots (constraints, calendar events, drive times, capacity)
5. Client displays calendar with available dates and time slots
6. User selects date → orchestrator gets slots for that day
7. `useAppointmentSlots` applies appointment shape → displays slots with differential info
8. User selects slot → stored in wizard state

### Remaining Work
- **Admin calendar view:** Admins can configure calendars but can't view a calendar overview of all appointments
- **Real-time sync:** Relies on API calls; no WebSocket/polling for live updates
- **Calendar event creation/editing UI:** Currently read-only from the calendar perspective

These gaps are admin/management features, not part of the core booking availability flow.

### Related Documents
- **Feature Plan:** `features/calendar-appointment-availability/feature-plan.md`
- **README:** `features/calendar-appointment-availability/README.md`

---

## Feature 5: Beta Feedback System

**Status:** ✅ Complete
**Description:** Full-stack beta feedback collection system with categorized submissions, tagging, and admin dashboard.
**Branch:** `feature/google-apis-integration`
**Completed:** 2026-02-10

### What Was Built
- Floating feedback widget accessible from any page
- Modal form with category selection (bug, feature_request, general, ux)
- Tags system for organizing feedback
- Admin dashboard with filtering, sorting, and management
- Full CRUD API with database models and migration

### Key Files
- **Server:** `server/src/db/models/beta/`, `server/src/routes/internal/beta-feedback/`
- **Client:** `client/src/components/beta/`, `client/src/composables/beta/`
- **Migration:** `server/src/db/migrations/20260210_100000_create_beta_feedback.mjs`

### Related Documents
- **Feature Plan:** `features/beta-feedback/feature-plan.md`
- **README:** `features/beta-feedback/README.md`

---

## Feature 6: Pricing Cascades

**Status:** ✅ Complete
**Description:** Pricing cascade system with shape-level validation and instance-level resolution for booking fee calculations.
**Branch:** `feature/google-apis-integration`
**Completed:** 2026-02-13

### What Was Built
- `ValidPricingCascade` model (shape-level — defines which pricing cascades are valid)
- `PricingCascade` model (instance-level — actual pricing values)
- Admin UI for managing pricing cascades
- Booking fee flow integration with cascade resolution
- Database migrations and seed metadata

### Key Files
- **Server:** `server/src/db/models/booking/pricing_cascade.ts`, `server/src/db/models/admin/valid_pricing_cascade.ts`
- **Client:** `client/src/composables/booking/usePricingCascadeInstances.ts`, `client/src/utils/booking/pricingCascadeResolver.ts`
- **Migrations:** `server/src/db/migrations/20260213_100000_create_pricing_cascades.mjs`, `server/src/db/migrations/20260213_100001_seed_pricing_cascade_metadata.mjs`

---

## Feature 7: Property Enrichment & Mappings

**Status:** ✅ Complete
**Description:** BrightMLS integration with field mapping and feature mapping systems for automatic property data enrichment.
**Branch:** `feature/google-apis-integration`
**Completed:** 2026-02-11

### What Was Built
- `PropertyFieldMapping` model — maps MLS fields to application property fields
- `PropertyFeatureMapping` model — maps MLS features to application features
- BrightMLS transformer for data normalization
- Property field mapper and feature matcher services
- Admin UI for managing field and feature mappings (PropertyMappingsTab)
- Property enrichment API routes

### Key Files
- **Server Models:** `server/src/db/models/mappings/property_field_mapping.ts`, `server/src/db/models/mappings/property_feature_mapping.ts`
- **Server Services:** `server/src/services/propertyFieldMapper.ts`, `server/src/services/propertyFeatureMatcher.ts`, `server/src/services/brightMls/brightMlsTransformer.ts`
- **Server Routes:** `server/src/routes/external/propertyEnrichmentRoutes.ts`, `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts`
- **Client:** `client/src/views/admin/tabs/PropertyMappingsTab.vue`, `client/src/utils/api/propertyMappingsApi.ts`
- **Migrations:** `server/src/db/migrations/20260201_100001_create_property_field_mappings.mjs`, `server/src/db/migrations/20260201_100002_create_property_feature_mappings.mjs`

---

## Feature 8: Appointment Workflow

**Status:** ⏳ Partial (Phase 1 Complete)
**Description:** Comprehensive appointment status workflow with 8 statuses, user tracking, and interactive UI enhancements.
**Branch:** `feature/google-apis-integration`

### Phases

| Phase | Name | Status |
|-------|------|--------|
| 8.1 | Status Workflow & UI Enhancements | ✅ Complete (Jan 2026) |
| 8.2 | Held Status & Booking Fee Logic | Not Started |
| 8.3 | Confirmation Routine | Not Started |
| 8.4 | Rescheduling Flow | Not Started |
| 8.5 | Soft Delete vs Hard Delete | Not Started |
| 8.6 | Scheduled By Auto-Population | Not Started (depends on auth) |

### Phase 8.1 Completed
- Updated status ENUM from 5 to 8 values (started, held, rescheduling, quoted, submitted, confirmed, cancelled, deleted)
- Added `scheduled_by_id` column with FK to users table
- Interactive tooltips and cross-tab navigation in admin UI
- Color-coded status chips

### Related Documents
- **Feature Plan:** `features/appointment-workflow/feature-plan.md`

---

## Feature 9: Test Suite Setup

**Status:** 📋 Planning
**Description:** Comprehensive testing strategy with E2E tests (Playwright), expanded integration tests, and CI pipeline enhancements.
**Branch:** TBD

### Phases

| Phase | Name | Status |
|-------|------|--------|
| 9.1 | Audit & Coverage Targets | Not Started |
| 9.2 | Playwright Setup | Not Started |
| 9.3 | E2E Tests for Critical Flows | Not Started |
| 9.4 | Server Integration Tests | Not Started |
| 9.5 | CI Pipeline Enhancements | Not Started |

**Current test infrastructure:** 117 Vitest client tests, 15 Jest server tests, TypeScript + ESLint static analysis. No E2E tests.

### Related Documents
- **Feature Plan:** `features/test-suite-setup/feature-plan.md`
- **README:** `features/test-suite-setup/README.md`
- **Detailed Checklist:** `../../BETA_LAUNCH_CHECKLIST.md` (Phase 3, items 3.1–3.10)

---

## Feature 10: Beta Feedback Response

**Status:** 📋 Planning
**Description:** Dedicated workflow for triaging, prioritizing, and responding to beta tester feedback collected by Feature 5. Turns raw feedback into actionable work items and communicates resolution back to reporters.
**Branch:** TBD

### Planned Phases
1. **Triage Workflow** — Status tracking for feedback items (new → triaged → in-progress → resolved → closed), priority assignment, category refinement
2. **Response System** — Email notifications to reporters when feedback is addressed, resolution notes visible in admin dashboard
3. **Feedback → Work Item Pipeline** — Convert feedback into project tasks, link feedback to features/bugs, track which feedback drove which changes
4. **Analytics & Reporting** — Feedback volume trends, response time metrics, category breakdowns, satisfaction tracking

### Dependencies
- Feature 5 (Beta Feedback System) — must be complete (✅ it is)
- Authentication system (BETA_LAUNCH_CHECKLIST Phase 2A) — needed for user identity and email notifications

### Related Documents
- **Feature 10 docs:** `features/beta-feedback-response/`
- **Feature 5 docs:** `features/beta-feedback/` (the collection system this feature builds upon)
- **Beta Launch Checklist:** `../../BETA_LAUNCH_CHECKLIST.md`

---

## Feature 11: Beta Launch

**Status:** 📋 Planning
**Description:** Final preparation and execution of beta launch. Covers hosting deployment, production database setup, environment configuration, and go-live verification. Detailed planning to follow — see BETA_LAUNCH_CHECKLIST.md for the infrastructure checklist this feature will draw from.
**Branch:** TBD

### Scope (to be detailed)
- Hosting & deployment on Render (API + static site + database)
- Authentication implementation (Magic Link strategy for beta)
- Security hardening (CORS, rate limiting, input validation)
- Production environment configuration
- Database migrations on production
- End-to-end verification in hosted environment
- Alpha tester onboarding

### Related Documents
- **Detailed Checklist:** `../../BETA_LAUNCH_CHECKLIST.md` ⭐ — The comprehensive checklist this feature will execute against
- **Feature Plan:** TBD (will be created when work begins)

---

## Feature 12: UI Polish

**Status:** 🔮 Future
**Description:** Polish admin panel and booking wizard UI. Fix flow/interactions, improve visual design, ensure consistent styling. Includes bulk updates as a small admin UI enhancement.
**Branch:** `feature/ui-polish`

### Phases

| Phase | Name | Status |
|-------|------|--------|
| 12.1 | Admin Panel UI Polish | Not Started |
| 12.2 | Booking Wizard UI Polish | Not Started |
| 12.3 | Responsive Design and Mobile Optimization | Not Started |
| 12.4 | Bulk Updates Enhancement | Not Started |

**Note:** Phase 12.4 (Bulk Updates) was originally planned as Phase 11 of the Vue Migration but moved here as a small admin UI enhancement.

### Related Documents
- **Feature Plan:** `features/feature-7-ui-polish/feature-plan.md`
- **README:** `features/feature-7-ui-polish/README.md`

---

## Feature 13: Admin UI Overhaul

**Status:** 🔮 Future
**Description:** Complete redesign of the admin interface to reduce cognitive load for non-technical administrators. Guided workflows, live preview panel, relationship builders, templates, progressive disclosure.
**Branch:** TBD

### Planned Phases
1. **Smart UI Redesign** — Guided workflows, relationship builder, templates, contextual intelligence, progressive disclosure
2. **Live Preview Panel** — Real-time booking simulation as admins configure services
3. **Integration with Admin Assistance Wizard** (Feature 14)

### Design Philosophy
- Reliability first: core workflows stay deterministic
- Progressive disclosure: start simple, reveal complexity as needed
- Target: non-technical administrators doing initial bulk service setup then periodic adjustments

### Related Documents
- **Feature Plan:** `features/admin-ui-overhaul/feature-plan.md`
- **README:** `features/admin-ui-overhaul/README.md`

---

## Feature 14: Admin Assistance Wizard

**Status:** 🔮 Future
**Description:** Step-by-step guided wizard that walks administrators through setting up services, parts, relationships, and compositions. Replaces manual form-filling with a structured walkthrough that explains each step, validates inputs, and provides contextual help. No external AI dependency — pure deterministic guided workflow.
**Branch:** TBD
**Directory:** `features/gpt-admin-automation/` (to be renamed to `features/admin-assistance-wizard/`)

### Planned Phases
1. **Foundation & Wizard Framework** — Wizard shell component, step navigation, progress tracking
2. **Service Setup Wizard** — Walk through creating shapes, instances, and their relationships step by step
3. **Relationship & Composition Wizard** — Guided cascades, constituents, and compositions setup
4. **Templates & Quick Setup** — Pre-configured service templates for common inspection types
5. **Contextual Help & Validation** — Inline help, smart suggestions based on existing data, validation before each step

### How It Differs From Feature 13 (Admin UI Overhaul)
- Feature 13 redesigns the overall admin panel layout, navigation, and visual structure
- Feature 14 adds an overlay wizard experience that guides users through specific multi-step setup tasks
- Feature 14 should be built after Feature 13 so the wizard integrates into the redesigned admin panel

### Key Objectives
- Reduce time to create a service from 15+ minutes to under 5 minutes
- Eliminate configuration errors through step-by-step validation
- Provide contextual help that explains *why* each configuration choice matters
- Support template-based quick setup for common service types

### Related Documents
- **Existing directory:** `features/gpt-admin-automation/` (contains initial planning docs — to be repurposed)

---

## Infrastructure & Refactors

The following work was completed on the `feature/google-apis-integration` branch but does not constitute standalone features:

| Work | Commit | Description |
|------|--------|-------------|
| Router Modularization | `0da7ef3` | Complete router modularization and extraction of shared utilities |
| BlockFinal Refactor | `6a690ad` | Clarified block-level finalization logic |
| Server Logging Migration | `d723a34` | Dev panel enhancements, booking refactoring, cleanup |
| Audit & Typecheck Fixes | `6bb7626`, `ca9baa0`, `d07cbcf`, `c0497d7` | Multiple passes of typecheck, lint, and error-handling improvements |
| Busy Period Attribution | `763968f` | Source attribution and multi-calendar event fetching |
| Dev Panel Restructure | `9f0262e` | Consolidated API debugging and improved UX |

---

## Future Features Catalog

See `future-features-catalog.md` for comprehensive catalog of future features identified in USER_STORY.md and common commercial scheduler features for evaluation and prioritization.

---

## Related Documents

### Root-Level Planning
- **Beta Launch Checklist:** `../../BETA_LAUNCH_CHECKLIST.md` — Infrastructure, deployment, testing, security
- **Future Features:** `future-features-catalog.md`
- **Feature Validation:** `FEATURE_VALIDATION_CHECKLIST.md`

### Feature Documentation

| Feature | Key Documents |
|---------|--------------|
| Feature 0: Vue Migration | `features/vue-migration/vue-migration-completion-summary.md` |
| Feature 1: Data Flow Alignment | `features/data-flow-alignment/feature-completion-summary.md` |
| Feature 2: Google APIs | `features/feature-2-google-apis-integration/feature-2-handoff.md` |
| Feature 3: Booking Calculations | `features/booking-calculations/feature-plan.md` |
| Feature 4: Calendar & Availability | `features/calendar-appointment-availability/feature-plan.md` |
| Feature 5: Beta Feedback | `features/beta-feedback/feature-plan.md` |
| Feature 8: Appointment Workflow | `features/appointment-workflow/feature-plan.md` |
| Feature 9: Test Suite Setup | `features/test-suite-setup/feature-plan.md` |
| Feature 10: Beta Feedback Response | `features/beta-feedback-response/feature-plan.md` |
| Feature 11: Beta Launch | `../../BETA_LAUNCH_CHECKLIST.md` |
| Feature 12: UI Polish | `features/feature-7-ui-polish/feature-plan.md` |
| Feature 13: Admin UI Overhaul | `features/admin-ui-overhaul/feature-plan.md` |
| Feature 14: Admin Assistance Wizard | `features/gpt-admin-automation/feature-plan.md` (to be renamed) |

---

## Notes

- This is the single source of truth for project planning
- All phase guides and session documents should align with this document
- **Vue Migration (Feature 0) is Core Complete** — structural migration achieved; remaining work is feature development
- **Data Flow Alignment (Feature 1) is Complete** — all 5 phases finished 2026-01-31
- **Google APIs (Feature 2) is Functionally Complete** — Calendar and Maps fully working, MLS infrastructure built but blocked on external credentials
- **Booking Calculations (Feature 3) is Core Complete** — calculation logic works end-to-end, needs consolidation composable
- **Calendar & Availability (Feature 4) is Functionally Complete** — full server-side computation and client-side UI working for booking flow
- **Beta Launch Infrastructure** is tracked separately in `BETA_LAUNCH_CHECKLIST.md` (hosting, auth, security, CI/CD)
- The `client/` directory contains the Vue 3 application (previously `client-vue/` — renamed after React removal)
- Features 6–7 (Pricing Cascades, Property Enrichment) are complete sub-features without dedicated directories
- Feature 14 (Admin Assistance Wizard) replaces the original "GPT Admin Automation" concept — deterministic guided workflows instead of AI dependency
