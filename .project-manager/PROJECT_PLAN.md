# DHP Differential Scheduler — Project Plan

**Purpose:** Single source of truth for all feature development planning and tracking

**Last Updated:** 2026-02-20
**Status:** Active Planning Document

---

## Overview

This document serves as the master project plan for the DHP Differential Scheduler. All feature plans, phase guides, and session documents should align with this plan.

**Structure:** Feature → Phase → Session → Task

**Related Documents:**
- **BETA_LAUNCH_CHECKLIST.md** — Hosting, security, deployment, testing (separate from feature development)
- **future-features-catalog.md** — Evaluated and prioritized feature ideas

---

## Feature Summary

| # | Feature | Status | Directory | Key Dates |
|---|---------|--------|-----------|-----------|
| 0 | Vue.js Migration | ✅ Complete | `features/vue-migration/` | Completed ~2025-02 |
| 1 | Data Flow Alignment | ✅ Complete | `features/data-flow-alignment/` | 2025-02-01 → 2026-01-31 |
| 2 | Google APIs Integration | ✅ Complete | `features/feature-2-google-apis-integration/` | Started 2026-01-31 |
| 3 | Calendar & Appointment Availability | ✅ Complete | `features/calendar-appointment-availability/` | Completed 2026-02-21 |
| 4 | Pricing Cascades | ✅ Complete | — (sub-feature) | Completed 2026-02-13 |
| 5 | Property Enrichment & Mappings | ✅ Complete | — (sub-feature) | Completed 2026-02-11 |
| 6 | Appointment Workflow & Booking Calculations | ⏳ Partial | `features/appointment-workflow/` | Phase 1 complete Jan 2026 |
| 7 | Authentication | 📋 Planning | `features/authentication/` | — |
| 8 | Security Hardening | 📋 Planning | `features/security-hardening/` | — |
| 9 | Testing & Quality Validation | 📋 Planning | `features/testing-quality-validation/` | — |
| 10 | Production Readiness | 📋 Planning | `features/production-readiness/` | — |
| 11 | Pre-Launch Polish | 📋 Planning | `features/beta-launch/` | — |
| 12 | Alpha Launch & Deployment | 📋 Planning | — | — |
| 13 | Beta Feedback System | ✅ Complete | `features/beta-feedback/` | Completed 2026-02-10 |
| 14 | Guided Beta Testing | 📋 Planning | `features/guided-beta-testing/` | — |
| 15 | Beta Feedback Response | 📋 Planning | `features/beta-feedback-response/` | — |
| 16 | UI Polish | 🔮 Not Started | `features/feature-7-ui-polish/` | — |
| 17 | Admin UI Overhaul | 🔮 Not Started | `features/admin-ui-overhaul/` | — |
| 18 | Admin Assistance Wizard | 🔮 Not Started | `features/gpt-admin-automation/` | — |

---

## Milestones

| Milestone | Definition of Done |
|-----------|--------------------|
| **Alpha Ready** | Features 7–10 and Feature 12 substantially complete. App deployed on Render, auth working, core booking and admin flows functional. Will can use it end-to-end from a browser that isn't localhost. No external testers yet. |
| **Beta Ready** | Features 7–14 complete. E2E tests cover critical paths, error tracking live, guided testing system seeded. Testers can log in via magic link, submit feedback, follow assigned test tasks. Ready to invite 5–10 trusted testers. |
| **Production Ready** | Features 7–15 plus password auth transition. Full test coverage, polished UI, rollback procedures documented and tested. Ready for public access. |
| **Native App Ready** | Capacitor shell wrapping the deployed SPA (iOS/Android). Not a PROJECT_PLAN feature — detailed plan in BETA_LAUNCH_CHECKLIST.md Phase 7. |

---

## Environment Configuration

Deployment lifecycle is controlled by **APP_STAGE** (who the deployment is for) alongside **NODE_ENV** (runtime behavior) and **VITE_INCLUDE_DEV_FLAGS** (client dev tools visibility). Set these in root `.env` (local), Render dashboard (deployed), or build env.

| Stage | NODE_ENV | APP_STAGE | VITE_APP_STAGE | VITE_INCLUDE_DEV_FLAGS | Test tooling active |
|-------|---------|-----------|----------------|------------------------|----------------------|
| local | development | local | (optional) | true | When `APP_STAGE=staging` or `TEST_ENABLED=true`; use `npm run start:dev:testing` |
| staging | production | staging | staging | true | Yes |
| alpha | production | alpha | alpha | false | No — clean UI for MLS/external testers |
| beta | production | beta | beta | false | No |
| production | production | production | production | false | No |

**When to set env vars:** Local dev — set `APP_STAGE=local` in root `.env` (or omit; defaults to local). Alpha deployment (e.g. MLS testing) — set `APP_STAGE=alpha`, `VITE_APP_STAGE=alpha`, and `VITE_INCLUDE_DEV_FLAGS=false` in Render so external testers see no dev panels. Staging — set `APP_STAGE=staging` and `VITE_INCLUDE_DEV_FLAGS=true` for internal QA with dev tools.

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
- Phase 8: Deferred → Feature 15 (UI Polish)
- Phase 10: Cancelled (user preference)
- Phase 11: Moved → Feature 15 (UI Polish, bulk updates enhancement)

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

---

## Feature 2: Google APIs Integration

**Status:** ✅ Complete
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

Production OAuth token storage and MLS activation (credentials, validation, end-to-end testing) are tracked in **Feature 11 (Beta Launch)** Phase 11.2 (items 1.8, 1.8b and production token storage).

### Related Documents
---

## Feature 3: Calendar & Appointment Availability

**Status:** ⏳ Reopened (Phase 3.6 in progress)
**Description:** Server-side slot computation, client-side calendar UI, time slot selection, and differential scheduling — all functional for the booking workflow.
**Branch:** `feature/calendar-appointment-availability`

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
- **Calendar event creation/editing UI:** Currently read-only from the calendar perspective.

Admin calendar view is tracked in **Feature 16 (Admin UI Overhaul)**. Real-time availability sync is tracked in **Feature 11 (Beta Launch)**.

---

## Feature 4: Pricing Cascades

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

## Feature 5: Property Enrichment & Mappings

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

## Feature 6: Appointment Workflow & Booking Calculations

**Status:** ⏳ Partial (Phase 1 Complete for workflow; core complete for calculations)
**Description:** Appointment status workflow with 8 statuses, user tracking, and UI enhancements; plus fee and time calculation logic for the booking wizard. Booking calculation logic is implemented; workflow Phase 1 complete.
**Branch:** `feature/google-apis-integration`

### Appointment Workflow Phases

| Phase | Name | Status | What |
|-------|------|--------|------|
| 6.1 | Status Workflow & UI Enhancements | ✅ Complete (Jan 2026) | — |
| 6.2 | Held & Override Stubs | ✅ Complete | Prep held status and admin-override as stubs; Feature 7 enacts when auth is set up (trusted hold; admin override). |
| 6.3 | Confirmation Routine | ✅ Complete | submitted to confirmed; admin or auto confirm; notifications. |
| 6.4 | Moveable Modal & preClosing | ⏳ Not Started | preClosing property; differential consolidation; modal gate logic; UX softening; re-enable MoveablePartsModal. |
| 6.5 | Rescheduling Flow | Not Started | Reschedule confirmed; reuse wizard; rescheduling to submitted. |
| 6.6 | Soft Delete vs Hard Delete | Not Started | Policy and UI for cancelled vs deleted; retention; audit. |
| 6.7 | Scheduled By Auto-Population | Not Started (depends on Feature 7 Auth) | Set scheduled_by_id from logged-in user. |
| 6.8 | Admin Force-Create & Constraint Overrides | Not Started (depends on Feature 7 Auth) | Force-create appointments bypassing blockers; constraint_overrides table; reschedule with exceptions. |

### Phase 6.1 Completed (Workflow)
- Updated status ENUM from 5 to 8 values (started, held, rescheduling, quoted, submitted, confirmed, cancelled, deleted)
- Added `scheduled_by_id` column with FK to users table
- Interactive tooltips and cross-tab navigation in admin UI
- Color-coded status chips

### Phase 6.4: Moveable Modal Refinement & preClosing Property (Not Started)
- Add `preClosing` boolean to block_instances (full stack: migration → model → types → transformer) to distinguish services with pre-closing work
- Consolidate three parallel differential derivations into one canonical `isDifferentialBooking` computed (derive once, propagate everywhere)
- Gate the moveable modal so it only opens for `preClosing` services; show the completion time grid only when a closing date is provided; allow passthrough without timeslot selection
- Soften modal UX: smaller dialog, delayed appearance (~400ms), smooth enter/exit transitions
- Re-enable the currently-disabled MoveablePartsModal and verify full integration

### Booking Calculations (Core Complete)
**Fee calculations:** `calculateBlockInstanceFee()`, `buildConfirmationPriceData()`, `calculatePartsTotals()`, pricing cascade resolution via `pricingCascadeResolver.ts`. **Time calculations:** `useTimeSlotCalculations()`, `calculateAppointmentSlots()`, `calculateTotalDurationFromAppointmentSlots()`, `createBlockFinal()` / `createPartFinals()`. Shared finalization and fee utilities live in `client/src/utils/booking/` and are used by the confirmation step and related composables.

**Remaining (calculations):** **useFeeCalculations composable:** Add a composable parallel to `useTimeSlotCalculations()`, reusing existing fee and finalization utils (`calculateBlockInstanceFee`, `buildConfirmationPriceData`, pricing cascade resolution, `createBlockFinal` / `createPartFinals`). Wire it into the confirmation step so fee logic is exposed in one place. **Admin-configurable fee-related settings:** Coupon discount, delivery charges, and delivery-free behavior are currently hardcoded in the fee flow. Move to admin-configurable business settings and have the fee flow (e.g. useFeeCalculations or shared utils) read from those settings.

### Key Files
- **Workflow:** Feature 6 appointment-workflow planning (see Related Documents)
- **Calculations:** confirmationStepData, partsTotals, pricingCascadeResolver, appointmentTimeCalculations, useTimeSlotCalculations, BlockFinal/PartFinals (booking utils)
- **Archived planning:** booking-calculations planning (archived)

### Related Documents
- Phase 6.4 Guide: `features/appointment-workflow/phases/phase-6.4-guide.md` (Moveable Modal & preClosing)
- Phase 6.8 Guide: `features/appointment-workflow/phases/phase-6.8-guide.md` (architecture, data model, implementation checklist, decision log for Admin Force-Create)
- BETA_LAUNCH_CHECKLIST.md Phase 8A (force-create detail)
- Feature 6 workflow and booking-calculations planning: `features/appointment-workflow/`

---

## Feature 7: Authentication

**Status:** 📋 Planning
**Description:** Pluggable authentication using a Strategy Pattern: Magic Link for beta/development (passwordless), Email + Password for production. Shared session infrastructure (PostgreSQL sessions table, httpOnly cookies, requireAuth middleware). See BETA_LAUNCH_CHECKLIST.md Phase 2A.
**Branch:** TBD

### Existing Stubs & Scaffolding

The following auth-related code already exists in the codebase:

| What | File | Notes |
|------|------|-------|
| `csrfProtection` (stub) | `server/src/middlewares/security.ts` | Exported, already wired into many CRUD/state-changing routes. Just calls `next()`. |
| `checkOwnership` (stub) | `server/src/middlewares/security.ts` | Exported, wired into property, entity, business-settings, appointment CRUD. Just calls `next()`. |
| `_requireAuth` (stub) | `server/src/middlewares/security.ts` | **Not exported / not used anywhere.** Ready to be replaced by the real `requireAuth` from `auth/`. |
| Login routes (empty) | `server/src/routes/internal/participantRoutes/login-routes.ts` | Commented-out export; no functional routes. |
| Login model (empty) | `server/src/db/models/participantModels/Logins.ts` | Commented-out password/hooks; no functional model. |
| Security docs | `server/docs/SECURITY_STUBS.md` | Documents planned behavior of the security stubs. |
| Router guards | `client/src/plugins/1.router/guards.ts` | Checks `userData` and `accessToken` cookies for isLoggedIn; redirects to `login` route. |
| UserProfile logout | `client/src/layouts/components/UserProfile.vue` | Clears cookies and redirects to `/login`. |

**What does NOT exist yet:** No `server/src/auth/` directory (strategy interface, session manager, auth router, magic-link strategy), no session/magic_links DB tables/models, no client auth store or auth views.

### Implementation Order

| Step | What | Depends On |
|------|------|------------|
| 1 | **Database & Models** — Migrations for `sessions` and `magic_links` tables; Sequelize models. | — |
| 2 | **Server Auth Infrastructure** — Strategy interface (`strategyTypes.ts`), session manager (`sessionManager.ts`), real `requireAuth` middleware (cookie → session → `req.user`), auth router, auth config. Replace `_requireAuth` stub. | Step 1 |
| 3 | **Magic Link Strategy** — `magicLinkStrategy.ts`, email service (or console log in dev), verify route that creates a session and sets the cookie. | Step 2 |
| 4 | **Client Auth** — Pinia auth store + composable, auth views (MagicLinkForm, verify landing), align router guards with real session cookie. | Step 3 |
| 5 | **Enactment** — Wire auth into other features (see checklist below). | Step 4 |
| — | **Password Strategy** — Deferred to production (post-beta). | Step 2 |

### Enactment (after auth is in place)

Implement the following so that authenticated users and roles are used where other features expect them:

- [ ] **Enact held/override (Feature 6 stubs):** Wire role checks into Feature 6 stubs so trusted agents and admins can hold slots and admins can override blockages.
- [ ] **Enact scheduled-by auto-population (Feature 6.6):** Set `scheduled_by_id` from the current logged-in user on appointment create; optionally set `updated_by` (or equivalent) on edit. Use `req.user` (or client auth context) and persist via appointment API.
- [ ] **Role-based access:** Restrict admin panel (and any admin-only routes) to authenticated users with appropriate roles (e.g. agent, transaction_manager) per product rules.
- [ ] **Guided beta / feedback:** Where Feature 14 (Guided Beta Testing) or Feature 15 (Beta Feedback Response) need user identity or email (e.g. show tasks when authenticated, send notifications to reporter), wire in auth (current user, session) so those features can rely on it.
- [ ] **CSRF:** Replace `csrfProtection` stub with real implementation once session-based auth is active (existing route wiring stays).
- [ ] **Ownership:** Replace `checkOwnership` stub so it verifies `req.user` against resource owner (existing route wiring stays).

### Related Documents
- **Checklist:** `../../BETA_LAUNCH_CHECKLIST.md` Phase 2A

---

## Feature 8: Security Hardening

**Status:** 📋 Planning
**Description:** CORS lockdown, rate limiting, request validation (Joi), secrets audit, security headers (Helmet), CSRF when using session-based auth. Protects API before external access.
**Branch:** TBD

### Existing Infrastructure & Stubs

| What | File(s) | Status |
|------|---------|--------|
| Helmet (security headers) | `server/src/app.ts` | Installed (`^8.1.0`), applied globally via `app.use(helmet())`. **Default config only** — no custom CSP, HSTS tuning, or referrer policy. |
| CORS | `server/src/app.ts` | Installed (`^2.8.6`), applied globally via `app.use(cors())`. **Wide open** — no origin restriction. No `CORS_ORIGIN` env var exists. |
| Joi | `server/package.json` | Installed (`^18.0.2`). Used only in `envConfig.ts` for env-var validation — **not used for request body validation**. |
| Custom per-route validators | `*Validators.ts` files across most routers | Hand-written `ValidationResult`-based functions (required fields, enum checks, ID validation). Present for entities, relationships, properties, businessSettings, betaFeedback, admin-metadata, availability, businessRules. **Not Joi schemas.** |
| Per-route sanitizers | `entitySanitizers.ts` | Exist for entities (booking mode enum fix-up). Other routers lack dedicated sanitizers. |
| CRUD router factory security wiring | `server/src/routes/helpers/createCrudRouter.ts` | `csrfProtection` on POST/PUT/PATCH/DELETE; `checkOwnership` on PUT/PATCH/DELETE. **All CRUD routers inherit this automatically.** |
| `csrfProtection` (stub) | `server/src/middlewares/security.ts` | Exported, wired into ~16 route files. Just calls `next()`. |
| `checkOwnership` (stub) | `server/src/middlewares/security.ts` | Exported, wired into ~7 route files. Just calls `next()`. |
| Outbound API rate limiter | `server/src/services/rateLimiter.ts`, `googleApiRateLimiter.ts` | Sliding-window limiter for **outbound** Google/MLS API calls. **Not** inbound HTTP rate limiting. |
| `.gitignore` | Root `.gitignore` | Covers `.env`, `.env.*`, `.google-tokens.json`. |
| `.env.example` | `server/.env.example` | Exists but **only covers Bright MLS vars** — missing DB, PORT, Google OAuth, and future auth vars. |
| Error handler | `server/src/middlewares/errorHandler.ts` | Global handler hides stack traces in production (`isProduction() ? "🥞" : stack`). |
| Security stubs doc | `server/docs/SECURITY_STUBS.md` | Documents planned behavior for csrf, requireAuth, checkOwnership. |
| Route structure | `server/src/routes/index.ts` | Clean split: `/api/v1/internal/*` (admin/app CRUD) vs `/api/v1/external/*` (Google/MLS integrations). Rate limiting can target these separately. |

**What does NOT exist yet:** No `express-rate-limit` (inbound HTTP rate limiting), no CORS origin restriction, no Helmet production config (CSP, HSTS), no Joi request-body schemas, no real CSRF implementation, no real checkOwnership implementation, no comprehensive `.env.example`, no formal secrets audit.

**Key architectural note:** The CRUD router factory (`createCrudRouter`) already wires `csrfProtection` and `checkOwnership` into every CRUD resource. Replacing the stubs with real implementations in `security.ts` will activate them on all routes automatically — no route-file changes needed.

### Implementation Order

| Step | What | Depends On |
|------|------|------------|
| 1 | **CORS lockdown** — Add `CORS_ORIGIN` env var, pass `{ origin }` to `cors()`. Set `http://localhost:3002` in dev, Render URL in production. | — |
| 2 | **Inbound rate limiting** — Install `express-rate-limit`, apply general limiter to `/api/v1/internal/*` (100 req/15 min), stricter limiter for auth routes (10 req/15 min). | — |
| 3 | **Helmet production config** — Add CSP, tighten HSTS, configure referrer policy. Verify Vue app still loads. | — |
| 4 | **Secrets audit** — Scan committed files for hardcoded credentials; expand `.env.example` to document all expected env vars; verify `.gitignore` coverage. | — |
| 5 | **Joi request body validation** — Audit routes missing validation; add Joi schemas for unvalidated POST/PUT bodies. Optionally migrate existing custom validators to Joi over time. | — |
| 6 | **CSRF real implementation** — Replace `csrfProtection` stub with token validation (double-submit cookie or `csrf-csrf`). Existing route wiring stays. | Feature 7 (sessions) |
| 7 | **checkOwnership real implementation** — Replace stub to verify `req.user.id` against resource owner field. Existing route wiring stays. | Feature 7 (`req.user`) |

> **Steps 1–5 are independent of Feature 7** and can be done now. Steps 6–7 require working sessions/auth and align with Feature 7's Enactment phase.

### Related Documents
- **Checklist:** `../../BETA_LAUNCH_CHECKLIST.md` Phase 2

---

## Feature 9: Testing & Quality Validation

**Status:** 📋 Planning
**Description:** Test infrastructure (E2E with Playwright, integration tests, CI) plus quality validation (mutation testing with Stryker, property-based testing with fast-check, behavioral alignment audit). Ensures tests exist and verify desired behavior.
**Branch:** TBD

### Phases

| Phase | Name | Status |
|-------|------|--------|
| 9.1 | Audit & Coverage Targets | Not Started |
| 9.2 | Playwright Setup | Not Started |
| 9.3 | E2E Tests for Critical Flows | Not Started |
| 9.4 | Server Integration Tests | Not Started |
| 9.5 | Mutation & Property-Based Testing (Stryker, fast-check) | Not Started |
| 9.6 | Behavioral Alignment Audit | Not Started |
| 9.7 | CI Pipeline Enhancements | Not Started |

### Existing Test Infrastructure

| What | Location | Status |
|------|----------|--------|
| Vitest (client unit tests) | `client/vitest.config.ts`, `client/src/**/__tests__/*.test.ts` | **~112 test files.** jsdom environment, single-threaded pool, v8 coverage provider (text, json, html, lcov reporters). |
| Jest (server unit/integration) | `server/jest.config.js`, `server/src/**/__tests__/*.test.ts` | **15 test files.** ts-jest ESM preset, coverage collection. |
| Test DB infrastructure | `server/src/test/setup/testDb.ts`, `jestSetup.ts` | Full lifecycle: `setupTestDb` (connect + sync force to `scheduler_test`), `clearTestData` (truncate), `teardownTestDb` (close). |
| Client test setup | `client/src/utils/__tests__/setup.ts` | Stubs for `matchMedia`, `IntersectionObserver`, `ResizeObserver`; filters jsdom noise. |
| Test factories | `client/src/utils/__tests__/factories/` | 4 factories: entity, appointment, relationship, globalData. |
| Test helpers & mocks | `client/src/utils/__tests__/testHelpers.ts`, `mocks/mockApiResponses.ts`, `mocks/apiHandlers.ts` | Shared test utilities and API mocks. |
| `APP_STAGE` / `TEST_ENABLED` | Root `.env` (`APP_STAGE=local`), `scripts/start-dev.mjs`, `.cursor/commands/testing/utils/test-config.ts` | Test tooling active when `APP_STAGE=staging` or legacy `TEST_ENABLED=true`. Dev script adds test watcher, Cursor prompts and audit scripts respect the same check. |
| `start:dev:testing` script | Root `package.json` | `cross-env APP_STAGE=staging node scripts/start-dev.mjs` — runs server + client + test watcher. |
| CI pipeline | `.github/workflows/ci.yml` | 7 jobs: lint-client, lint-server, typecheck-client, typecheck-server, test-client (Vitest), test-server (Jest + PostgreSQL service), build-client. |
| Test files excluded from tsc | `client/tsconfig.json`, `server/tsconfig.json` | Both exclude `__tests__/**` and `*.test.ts` from compilation (intentional until Phase 3.0). |
| Testing rules (disabled) | `.cursor/rules/testing-headers.mdc` | `alwaysApply: false` — disabled until Phase 3.0. Requires descriptive headers on test files. |
| Test audit system | `client/.scripts/test-audit.mjs`, `.audit-reports/test-audit*.{json,md}` | Identifies untested source files, priorities, coverage gaps. Reports **787 untested source files**, 0 orphaned tests. |
| Coverage-risk crossref audit | `client/.scripts/coverage-risk-crossref-audit.mjs` | Cross-references fan-in with test coverage to surface high-risk untested files. |
| Test generation scripts | `client/package.json` scripts: `audit:test:generate`, `audit:test:generate:api`, `audit:test:ai` | Scripts to generate test stubs and AI-assisted test creation. |
| Cursor test config | `.cursor/commands/testing/utils/test-config.ts` | Fine-grained toggles for watch mode, smart detection, prompt-driven resolution, auto-fix. Gated by `APP_STAGE=staging` or legacy `TEST_ENABLED=true`. |

**What does NOT exist yet:** Test tooling is off by default (`APP_STAGE=local` without `staging`). No Playwright (no E2E tests), no Stryker (no mutation testing), no fast-check (no property-based tests), no behavioral alignment audit script, no coverage thresholds enforced in vitest/jest configs, no E2E CI job, no pre-commit hooks (husky/lint-staged).

**Key architectural note:** Test tooling is gated by `APP_STAGE=staging` (or legacy `TEST_ENABLED=true`) in root `.env`. Use `npm run start:dev:testing` to run dev with test watcher, or set `APP_STAGE=staging` in `.env` so `start:dev` includes tests — no other code changes needed.

### Implementation Order

| Step | What | Depends On |
|------|------|------------|
| **0** | **Activate testing** — (a) Set `APP_STAGE=staging` in root `.env` (or use `npm run start:dev:testing`). (b) Re-enable `.cursor/rules/testing-headers.mdc` (`alwaysApply: true`). (c) Remove `__tests__/**` and `*.test.ts` exclusions from client and server `tsconfig.json` so test files are type-checked. | — |
| 1 | **Coverage audit (Phase 9.1)** — Run `npx vitest --coverage` (client) and `npx jest --coverage` (server). Review against the 787-file gap list. Define and enforce coverage targets. | Step 0 |
| 2 | **Fix & expand existing tests (Phase 9.4)** — Fill coverage gaps for the test audit's high-priority files (transformers, booking composables). Add server integration tests for newer routes (appointments, beta-feedback, admin-metadata, property-mappings, availability). | Step 1 |
| 3 | **Playwright setup (Phase 9.2)** — Install Playwright, create `e2e/` directory, base fixtures, smoke tests (health check, pages load). | Step 0 |
| 4 | **E2E critical flows (Phase 9.3)** — Booking wizard happy path, admin CRUD, error states, responsive. Auth flow E2E deferred until Feature 7 is built. | Step 3, partial Feature 7 |
| 5 | **Mutation testing — Stryker (Phase 9.5)** — Install Stryker, configure for Vitest, run on transformer primitives and booking composables. Fix surviving mutants. | Step 2 |
| 6 | **Property-based testing — fast-check (Phase 9.5)** — Install fast-check, write `*.property.test.ts` for pure functions (transformers, booking utils). | Step 2 |
| 7 | **Behavioral alignment audit (Phase 9.6)** — Create `test-alignment-audit.mjs`, grade existing tests A–D, strengthen low-grade tests. | Step 2 |
| 8 | **CI enhancements (Phase 9.7)** — Expand `.github/workflows/ci.yml` branch triggers to all branches (currently only main/master). Add Playwright E2E job, coverage reporting on PRs, artifact uploads on failure. Optional: pre-commit hooks (husky + lint-staged). | Steps 3–4 |

> **Step 0 is the prerequisite for everything** — APP_STAGE=staging (or start:dev:testing), testing-headers rule, and tsconfig re-inclusion so test files are type-checked. Everything else builds from there.

### Security Note

⚠️ The root `.env` file currently contains a `GIT_MCP_SERVER` GitHub PAT token alongside `APP_STAGE` (and other vars). While `.env` is gitignored, this token should be moved to a more appropriate location (e.g., a dedicated `.env.local` or an OS keychain) and flagged in the Feature 8 secrets audit (Step 4). PAT tokens in any `.env` file — even gitignored ones — risk accidental exposure in backups, screenshots, or shared dev environments.

### Related Documents
- **Checklist:** `../../BETA_LAUNCH_CHECKLIST.md` (Phase 3, 3A, items 3.1–3.10)

---

## Feature 10: Production Readiness

**Status:** 📋 Planning
**Description:** Health check endpoint, Sentry error tracking, production logging, database backups, uptime monitoring, migration strategy, rollback procedures (application + DB + seed).
**Branch:** TBD

### Existing Infrastructure

| What | Location | Status |
|------|----------|--------|
| Scoped logger (server) | `server/src/utils/logger.ts` | Fully implemented. Level gating via `LOG_LEVEL` env var. **Defaults to `warn` in production**, `debug` in dev. Scope-based debug filtering via `DEBUG_SCOPES`. Used across entire server. |
| Scoped logger (client) | `client/src/utils/logger.ts` | Parallel implementation using Vite env vars (`VITE_LOG_LEVEL`). Shared types from `shared/types/loggerTypes.ts`. |
| Global error handler | `server/src/middlewares/errorHandler.ts` | Catches all unhandled Express errors. Hides stack in production (`"🥞"`). Logs via `createLogger`. **Natural Sentry integration point.** |
| `isProduction()` helper | `server/src/utils/envHelpers.ts` | Centralized `NODE_ENV === 'production'` check. Used by logger and error handler. Companion: `APP_STAGE` for deployment audience. |
| `getAppStage()` / `isPreRelease()` | `server/src/utils/envHelpers.ts` | `getAppStage()` returns `APP_STAGE` env (local, staging, alpha, beta, production). `isPreRelease()` true when stage is not production. Use for stage-specific behavior (e.g. MLS sandbox vs prod). |
| Env config with Joi validation | `server/src/config/envConfig.ts` | Validates 7 core env vars at startup (`APP_STAGE`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `PORT`). Crashes if invalid. **Does not validate** Google, JWT, Bright MLS, or future auth/security vars (~15+ other `process.env` refs across 21 files). |
| Migration infrastructure | `server/src/scripts/run-migrations.mjs`, `server/src/db/migrations/` (9 files) | Custom ESM-compatible runner, full `up`/`down` support. Scripts: `migrate`, `migrate:status`, `migrate:undo`, `migrate:undo:all`, `db:migrate:generate`. |
| Migration documentation | `server/src/db/migrations/README.md` | Comprehensive docs: commands, best practices, workflow, troubleshooting, rollback procedures (application, DB, seed data). |
| `.env.production` template | `server/.env.production` | Exists with values for DB, Google API, JWT. **Contains real credentials — should be placeholder-only** (see security note). |
| `.env.example` | `server/.env.example` | Exists but **only covers Bright MLS vars** — incomplete. |
| CI pipeline | `.github/workflows/ci.yml` | 7 jobs: lint, typecheck, test, build. **No deploy job.** |

**What does NOT exist yet:** No health check endpoint, no Sentry (`@sentry/node` / `@sentry/vue`), no request ID / correlation ID middleware, no uptime monitoring, no `render.yaml` Blueprint, no comprehensive env audit or `.env.example`, no database backup script, no deploy CI job, no pre-deploy migration hook.

**Key architectural notes:**
- **Logging is production-ready.** Level gating and stack-trace hiding already work. Main gap is request IDs for per-request traceability.
- **Migration infrastructure is solid.** Runner, undo, docs, and rollback procedures exist. Just needs wiring into a deployment pipeline (e.g., Render pre-deploy command).
- **Error handler is the Sentry hook.** `errorHandler.ts` is the single catch-all — adding `Sentry.captureException(error)` is a one-line integration.
- **`envConfig.ts` validates only 6 of ~15+ env vars.** Google OAuth, JWT, Bright MLS, and future auth/security vars are all accessed via raw `process.env` without startup validation.

### Implementation Order

| Step | What | Depends On |
|------|------|------------|
| 1 | **Health check endpoint** — `GET /api/v1/health` returning `{ status, database, timestamp }`. Verify DB connectivity. | — |
| 2 | **Comprehensive env audit** — Inventory all `process.env` usage (21 files), expand `envConfig.ts` Joi schema to validate all required vars at startup, expand `.env.example` to document every var. | — |
| 3 | **Sentry setup** — Install `@sentry/node` (server) and `@sentry/vue` (client). Integrate into `errorHandler.ts`. Configure DSN via env var. | — |
| 4 | **Request ID middleware** — Generate UUID per request, attach to `req`, include in logger prefix. Enables log tracing. | — |
| 5 | **Production logging review** — Verify `LOG_LEVEL=warn` in production env. Audit noisy log calls. Consider structured JSON logging (optional). | — |
| 6 | **Database backu strategy** — Document Render backup tier or create `pg_dump` script for free tier. | — |
| 7 | **Pre-deploy migration hook** — Wire `npm run migrate` into Render's pre-deploy command or build script. | Step 1 (health check for verification) |
| 8 | **Uptime monitoring** — Set up UptimeRobot (free) or equivalent to monitor health check endpoint. Configure alerts. | Step 1 |
| 9 | **Rollback verification** — Test `migrate:undo` for all recent migrations locally. Document verified rollback state. | Step 7 |

> **Steps 1–5 are independent and could be parallelized.** Steps 6–9 relate to the deploy pipeline which overlaps with Feature 12 (Alpha Launch).

### Security Note

⚠️ `server/.env.production` currently contains **real credentials**: Google API keys, Google client secret, JWT secret key, GitHub PAT token, and default DB password. While `.env.*` files are gitignored, this file should be sanitized to contain only placeholder values (e.g., `YOUR_GOOGLE_CLIENT_ID_HERE`). Real production secrets should live exclusively in the hosting platform's environment variable configuration (e.g., Render dashboard). Flag for Feature 8 secrets audit (Step 4).

### Related Documents
- BETA_LAUNCH_CHECKLIST.md Phase 5; Feature 10 production-readiness planning

---

## Feature 11: Pre-Launch Polish

**Status:** 📋 Planning
**Description:** Pre-launch polish before inviting testers: Vue error boundary, loading/error state review, cross-browser and device testing, README update, verify feedback system in production, alpha tester onboarding guide. Depends on Feature 12 (Alpha Launch) for production verification items.
**Branch:** TBD

### Scope (from BETA_LAUNCH_CHECKLIST Phase 6)

- **Vue error boundary** — Graceful fallback UI when a component crashes. (NOTE FROM USER: I want to make sure that we get a note in the betafeedback chain for any fallback behavior that IDs where the fallback happened and any other data we can generate with-out AI to help us see problems, kind of like how the logger always logs on errors, fallbacks, and defaults in dev mode. as far as i remember, we have a database table that is supposed to accept feedback in a way you can read it. i want something like that. ASK ME FORE MORE DETAIL IF YOU DON"T UNDERSTAND WHAT I MEAN. infact, this may be helpful for lots of things, and not just the vue error boundary)
- **Loading/error state review** — Audit all views for spinners, error messages, retry buttons.
- **Cross-browser/device testing** — Desktop (Chrome/Firefox/Safari) and mobile (iOS/Android).
- **README update** — Deployment instructions and architecture overview.
- **Verify feedback system in production** — Smoke-test existing feedback system (Feature 13) in hosted env; blocked by Feature 12 (deployed env).
- **Alpha tester onboarding guide** — Static document for testers who prefer docs over in-app guide.

### Related Documents
- BETA_LAUNCH_CHECKLIST.md Phase 6

---

## Feature 12: Alpha Launch & Deployment

**Status:** 📋 Planning
**Description:** Alpha milestone. Merge & sanity check, Render setup (API + static site + PostgreSQL), render.yaml Blueprint. App deployed, auth working, core booking + admin flows functional; no external testers yet. Depends on Features 7–10. See BETA_LAUNCH_CHECKLIST.md Phase 0, Phase 1, Appendix A.
**Branch:** TBD

### Existing Infrastructure

| What | Location | Status |
|------|----------|--------|
| Server PORT handling | `server/src/index.ts` | Reads `process.env.SERVER_PORT \|\| process.env.PORT \|\| 3001`. **Render-compatible** — respects dynamically assigned PORT. |
| Server build & start | `server/package.json` | `build: "tsc"` → `dist/`. `start: "node dist/server/src/index.js"`. Ready for Render Web Service. |
| Client build | `client/package.json` | `build: "vue-tsc -b && vite build"` → `client/dist/` with manual chunk splitting. |
| Root build scripts | `package.json` | `start` (prod build + serve), `build:prod` (server tsc), `client:build`, `seed`. |
| `VITE_API_BASE_URL` env var | `client/src/utils/api/index.ts`, 3 service files, `vite-env.d.ts` | **Typed** in `ImportMetaEnv`. Used across all API calls. See inconsistency note below. |
| Vite dev proxy | `client/vite.config.ts` lines 100–108 | Proxies `/api` → `http://localhost:3001`. Dev only — production needs `VITE_API_BASE_URL`. |
| Migration runner | `server/src/scripts/run-migrations.mjs` | `npm run migrate`. Ready to wire as Render pre-deploy command. |
| Seed script | Root `package.json` | `seed: "npm --prefix server run seed"`. Available for initial production data. |
| Google OAuth token persistence | `server/src/config/googleOAuthTokenPersistence.ts` | **File-based** (`.google-tokens.json`). Works for dev, **not production-safe** — tokens lost on Render deploys/restarts. |
| Google OAuth redirect URI | `server/src/config/googleOAuth.ts` | Reads `process.env.GOOGLE_REDIRECT_URI`. Configurable per environment. |
| CORS (wide open) | `server/src/app.ts` line 49 | `app.use(cors())` — no origin restriction. Must be locked down before launch (Feature 8 Step 1). |
| CI pipeline | `.github/workflows/ci.yml` | 7 jobs (lint, typecheck, test, build). **No deploy job.** |
| Feature 12 planning | BETA_LAUNCH_CHECKLIST Phase 0–1, Appendix A | Merge/sanity, Render setup, Blueprint; env var table, render.yaml template spec. |

**What does NOT exist yet:** No `render.yaml` Blueprint (spec exists in feature plan but no actual file), no Dockerfile/docker-compose, no deploy CI job, no client `.env.production`, no health check endpoint (Feature 10 prerequisite), CORS not locked down (Feature 8 prerequisite), no production OAuth token storage, Bright MLS credentials not yet procured.

### Issues to Resolve Before Launch

**API base URL inconsistency:** The main axios client (`client/src/utils/api/index.ts`) defaults to `'/api/v1/internal'` (relative path — works with Vite proxy, breaks in production without `VITE_API_BASE_URL`). The three external service files (`calendarApiService.ts`, `mapsApiService.ts`, `propertyEnrichmentApiService.ts`) default to `'http://localhost:3001'` (absolute — also breaks in production). These need normalization, and `VITE_API_BASE_URL` **must** be set in Render at build time.

**Google OAuth tokens:** File-based storage is ephemeral on Render. Tokens are lost on every deploy/restart. Needs DB-backed or alternative persistent storage for production. Feature plan notes this as optional item 1.8c.

**Vite `base` option:** Not set in `vite.config.ts`. Fine for root-domain/subdomain deployment (Render default URLs). Only needs changing if deploying to a subdirectory.

**Environment variables for alpha (MLS testers):** For the alpha deployment (e.g. MLS integration testing), set in the Render dashboard: `APP_STAGE=alpha`, `VITE_APP_STAGE=alpha`, and `VITE_INCLUDE_DEV_FLAGS=false` (client build-time vars). That yields a production build with no dev panels or debug UI — external testers see a clean app. See **Environment Configuration** (above) for the full stage matrix.

### Implementation Order

| Step | What | Depends On |
|------|------|------------|
| 1 | **Fix API base URL inconsistency** — Normalize all service files to use a shared constant or the same axios client. Ensure consistent fallback. | — |
| 2 | **Create client `.env.production`** — Set `VITE_API_BASE_URL` placeholder. Create `.env.development` if needed. | Step 1 |
| 3 | **Merge & sanity check (Feature 12)** — Verify CI passes, production build works, SPA serves correctly. Verify PORT handling. Checklist Phase 0. | — |
| 4 | **Create `render.yaml` Blueprint (Feature 12)** — Codify infrastructure: PostgreSQL, API web service, static site, env vars. Checklist Phase 1. | — |
| 5 | **Render account & DB setup (Feature 12)** — Create Render account, connect GitHub, create PostgreSQL instance. Checklist Phase 1. | — |
| 6 | **Deploy API service (Feature 12)** — Configure web service, set env vars (including `APP_STAGE` e.g. `alpha` for MLS testers), lock CORS, run migrations. | Feature 8 Step 1 (CORS), Feature 10 Step 1 (health check) |
| 7 | **Deploy static site (Feature 12)** — Configure static site, set `VITE_API_BASE_URL`, `VITE_APP_STAGE` (e.g. `alpha` for MLS testers), and `VITE_INCLUDE_DEV_FLAGS=false` for alpha, add SPA rewrite rule. | Step 6 |
| 8 | **Google OAuth production config (Feature 12)** — Update redirect URI in Google Cloud Console. Consider DB-backed token storage. | Step 6 |
| 9 | **Bright MLS credentials (Feature 12)** — Procure credentials, configure env vars, test enrichment pipeline. | Step 6 |
| 10 | **End-to-end verification (Feature 12)** — Static site loads, API responds, DB connected, calendar works. | Steps 6–9 |
| 11 | **Deploy CI job (optional)** — Add auto-deploy from `main` to Render. Manual deploys initially acceptable. | Step 10 |

> **Steps 1–4 can be done before any Render account exists.** Steps 5–10 are the deployment sequence. Feature 12 depends on Features 7 (auth), 8 (security), 9 (testing), and 10 (production readiness) being substantially complete.

### Related Documents
- BETA_LAUNCH_CHECKLIST.md Phase 0, Phase 1, Appendix A

---

## Feature 13: Beta Feedback System

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
- **Server:** beta models, beta-feedback routes
- **Client:** beta components, beta composables
- **Migration:** beta feedback table (20260210)

### Related Documents
- BETA_LAUNCH_CHECKLIST.md; Feature 13 planning

---

## Feature 14: Guided Beta Testing

**Status:** 📋 Planning
**Description:** In-app guided testing: assign randomized tasks to testers, collect structured feedback per task, coverage analytics. Database-driven (beta_test_tasks, beta_test_assignments, beta_test_addresses). Depends on Feature 7 (Authentication).
**Branch:** TBD

### Related Documents
- BETA_LAUNCH_CHECKLIST.md Phase 6A

---

## Feature 15: Beta Feedback Response

**Status:** 📋 Planning
**Description:** Dedicated workflow for triaging, prioritizing, and responding to beta tester feedback (Feature 13). Status tracking, email notifications to reporters, feedback → work item pipeline, analytics. Post-launch.
**Branch:** TBD

### Dependencies
- Feature 13 (Beta Feedback System) — complete (✅)
- Feature 7 (Authentication) — for user identity and email notifications

### Related Documents
- BETA_LAUNCH_CHECKLIST.md; Feature 13 planning

---

## Feature 16: UI Polish

**Status:** 🔮 Future
**Description:** Polish admin panel and booking wizard UI. Fix flow/interactions, improve visual design, consistent styling. Includes bulk updates as small admin UI enhancement.
**Branch:** TBD

### Phases
| Phase | Name | Status |
|-------|------|--------|
| 16.1 | Admin Panel UI Polish | Not Started |
| 16.2 | Booking Wizard UI Polish | Not Started |
| 16.3 | Responsive Design and Mobile Optimization | Not Started |
| 16.4 | Bulk Updates Enhancement | Not Started |

### Related Documents
- BETA_LAUNCH_CHECKLIST.md; Feature 16 planning

---

## Feature 17: Admin UI Overhaul

**Status:** 🔮 Future
**Description:** Complete redesign of the admin interface. Guided workflows, live preview panel, relationship builders, templates, progressive disclosure.
**Branch:** TBD

### Planned Phases
1. **Smart UI Redesign** — Guided workflows, relationship builder, templates
2. **Live Preview Panel** — Real-time booking simulation as admins configure services
3. **Integration with Admin Assistance Wizard** (Feature 18)

### Related Documents
- BETA_LAUNCH_CHECKLIST.md Phase 7 (Ionic Stage 2 depends on this); Feature 17 planning

---

## Feature 18: Admin Assistance Wizard

**Status:** 🔮 Future
**Description:** Step-by-step guided wizard for setting up services, parts, relationships, and compositions. No external AI — deterministic guided workflow. Build after Feature 17 so wizard integrates into redesigned admin panel.
**Branch:** TBD

### Planned Phases
1. Foundation & Wizard Framework
2. Service Setup Wizard
3. Relationship & Composition Wizard
4. Templates & Quick Setup
5. Contextual Help & Validation

### Related Documents
- Feature 18 planning (wizard; to be renamed from prior automation concept)

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

See future-features-catalog.md for comprehensive catalog of future features identified in USER_STORY.md and common commercial scheduler features for evaluation and prioritization.

---

## Native App Shell (Checklist-Only)

Native app packaging is not tracked as a PROJECT_PLAN feature. **BETA_LAUNCH_CHECKLIST.md Phase 7** holds the full plan: Capacitor Stage 1 (wrap SPA as iOS/Android app, zero component changes), optional Ionic Stage 2 (selective Ionic Vue conversion for booking wizard after Admin UI Overhaul). Stage 2 depends on **Feature 17 (Admin UI Overhaul)** and **Feature 16 Phase 16.3 (Responsive Design)** for mobile UX baseline.

---

## Related Documents

### Root-Level Planning
- **Beta Launch Checklist:** `../../BETA_LAUNCH_CHECKLIST.md` — Infrastructure, deployment, testing, security
- **Future Features:** `future-features-catalog.md`
- **Feature Validation:** `FEATURE_VALIDATION_CHECKLIST.md`

---

## Notes

- This is the single source of truth for project planning
- All phase guides and session documents should align with this document
- **Vue Migration (Feature 0) is Core Complete** — structural migration achieved; remaining work is feature development
- **Data Flow Alignment (Feature 1) is Complete** — all 5 phases finished 2026-01-31
- **Google APIs (Feature 2) is Complete** — Calendar and Maps fully working, MLS infrastructure built (returns 503 until configured). Production OAuth storage and MLS activation are tracked in Feature 12 (Alpha Launch).
- **Calendar & Availability (Feature 3) is Complete** — full server-side computation, client-side UI, invite configuration, and template pipeline working for booking flow
- **Features 4–5 (Pricing Cascades, Property Enrichment)** are complete sub-features without dedicated directories
- **Feature 6 (Appointment Workflow & Booking Calculations)** — workflow Phase 1 complete; booking calculation logic core complete, needs consolidation composable
- **Launch infrastructure** is tracked in BETA_LAUNCH_CHECKLIST.md (hosting, auth, security, CI/CD)
- **Feature 18 (Admin Assistance Wizard)** replaces the original "GPT Admin Automation" concept — deterministic guided workflows instead of AI dependency
