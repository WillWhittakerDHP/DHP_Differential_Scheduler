# Phase 6 Guide

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 2 - High-Level)

---

## Phase Overview

**Phase Number:** 6
**Phase Name:** Booking Wizard Logic Integration
**Description:** Connect the static UI shell to real data and integrate scheduler logic from React codebase. Replace hardcoded data with real data from backend, add state management, integrate cascading selections, user-specific descriptions, and icon display. Focus on UI behaviors and data connections before time calculations.

**Duration:** 15 sessions
**Status:** Complete

---

## Phase Objectives

- Convert Jose's React/MUI wizard to Vue/Vuetify
- Build static UI shell matching Jose's beautiful design
- Create Confirmation step with hardcoded data
- Create placeholder components for other steps
- Set up routing and navigation
- Focus on visual design and layout only (no logic)

---

## Key Deliverables

- BookingWizard.vue main component with VStepper
- ConfirmationStep.vue with hardcoded data matching Jose's design
- Placeholder step components (ServiceSelection, PropertyDetails, Availability, Contacts)
- Routing configured at `/booking`
- Visual design matching Jose's UI exactly

---

## Key Activities

- **Convert Wizard Structure:** Adapt Jose's React/MUI wizard to Vue/Vuetify
- **Build Confirmation Step:** Create Confirmation step with hardcoded data matching Jose's layout
- **Create Placeholder Steps:** Build minimal placeholder components for other steps
- **Set Up Routing:** Configure route and navigation
- **Match Visual Design:** Replicate Jose's beautiful UI exactly

---

## Sessions Breakdown

- [x] ### Session 6.1: Create Wizard Layout & Confirmation Step
**Description:** Create main wizard component with stepper and Phase 5 confirmation step
**Tasks:** Component creation tasks
**Learning Goals:**
- Understand Vuetify VStepper component
- Learn Vue component structure patterns
- Convert React/MUI patterns to Vue/Vuetify

**Task Breakdown:**
- **6.1.1:** Create BookingWizard.vue with VStepper component
- **6.1.2:** Set up step navigation (simple ref(0) for active step)
- **6.1.3:** Create ConfirmationStep.vue with hardcoded data
- **6.1.4:** Match Jose's visual design (summary table, price breakdown card)
- **6.1.5:** Add Previous/Next/Submit navigation buttons

- [x] ### Session 6.2: Cascading Selection Logic
**Description:** Integrate cascading selection logic for user type → base service → additional services → availability options
**Status:** Complete

- [x] ### Session 6.3: Icon Integration
**Description:** Integrate icon display from database with admin portal editing
**Status:** Complete

- [x] ### Session 6.4: User-Specific Descriptions - Database Schema
**Description:** Create database schema and models for user-specific descriptions
**Status:** Complete

- [x] ### Session 6.5: User-Specific Descriptions - API Types & Transformers
**Description:** Create API types and transformers for user-specific descriptions
**Status:** Complete

- [x] ### Session 6.6: User-Specific Descriptions - Admin Portal
**Description:** Add user-specific description CRUD in admin portal
**Status:** Complete

- [x] ### Session 6.7: User-Specific Descriptions - Wizard Display
**Description:** Display user-specific descriptions in booking wizard based on selected user type
**Status:** Complete

- [x] ### Session 6.8: Page Layout & Responsive Design
**Description:** Ensure responsive layout and proper element arrangement
**Status:** Complete

- [x] ### Session 6.9: Availability Options Integration
**Description:** Integrate availability options into booking wizard
**Status:** Complete

- [x] ### Session 6.10: Entity Composition System
**Description:** Verify and document Entity Composition System implementation
**Status:** Complete
**Note:** Replaced by Session 6.11 (Align Component Management)

- [x] ### Session 6.11: Align Component Management
**Description:** Replace entity composition system with component system using unified relationship pattern
**Status:** Complete

- [x] ### Session 6.12: Refactor Annotations
**Description:** Replace description system with annotation system using shape-instance pattern
**Status:** Complete

- [x] ### Session 6.13: User Types Migration and Relationship Router Enhancement
**Description:** Migrate user types to BlockInstance entities and enhance relationship router
**Status:** Complete

- [x] ### Session 6.14: Data Flow Unification and Field Config Updates
**Description:** Unify data flows through globalData and update field configurations
**Status:** Complete

- [x] ### Session 6.15: UI Updates, Migration Fixes, and Admin Config Updates
**Description:** Update UI components, fix migrations, and update admin/server configs
**Status:** Complete

- [ ] ### Session 6.16: Automated Description Generation from Website
**Description:** Create tool to read content from www.districthomepro.com and use AI to automatically generate user-type-specific descriptions (buyer, agent, owner) for services
**Tasks:** Web content extraction, AI generation, admin UI
**Learning Goals:**
- Browser automation and web scraping
- AI prompt engineering for structured content generation
- Admin tool development patterns

**Task Breakdown:**
- **6.10.1:** Explore website structure and identify service pages
- **6.10.2:** Create web content extraction service
- **6.10.3:** Create AI description generation service
- **6.10.4:** Create backend API endpoints for generation
- **6.10.5:** Create admin UI - generation interface
- **6.10.6:** Create admin UI - review & edit interface
- **6.10.7:** Integrate with Description API
- **6.10.8:** Add to admin portal

- [ ] ### Session 6.11: Align Seed Scripts to Current Database State
**Description:** Update seed scripts and seed data JSON files to include all fields that exist in the current database schema, particularly boolean fields (`active`, `dependent`, `visible`) added in Phase 9 migrations
**Tasks:** Update seed data files, verify seed script, test execution
**Learning Goals:**
- Understanding seed data structure and database schema alignment
- Field defaults and model requirements
- Seed script testing and validation

**Task Breakdown:**
- **6.11.1:** Update PartShape seeds with boolean fields
- **6.11.2:** Update PartInstance seeds with boolean fields
- **6.11.3:** Update BlockInstance seeds with boolean fields
- **6.11.4:** Review seed script logic
- **6.11.5:** Test seed script execution
- **6.11.6:** Update seed script documentation

---

## Dependencies

**Prerequisites:**
- Phase 1 complete (data layer, transformers)
- Phase 2 complete (state management)
- Phase 3 complete (data flow foundation verified)
- Phase 4 complete (Vuexy admin integration - for patterns)
- Phase 5 complete (React cleanup and removal)
- Jose's wizard reference available

**Downstream Impact:**
- Enables Phase 7 (Booking Wizard Logic Integration)
- Completes core Vue migration UI shell

---

## Success Criteria

- [x] Booking wizard state management working
- [x] Cascading selections work correctly (each selection filters next level)
- [x] Icons display correctly from database
- [x] Icons are editable in admin portal
- [x] Descriptions change based on selected user type
- [x] User-specific descriptions are editable in admin portal (shared/reusable)
- [x] Page layout is responsive and properly arranged
- [x] Elements show/hide appropriately based on selections
- [x] All hardcoded data replaced with real data
- [x] Scheduler logic integrated from React codebase
- [x] All wizard steps functional with real data
- [x] Component system functional (replaced composition system)
- [x] Annotation system functional (replaced description system)
- [x] User types migrated to BlockInstance entities
- [x] Data flow unified through globalData
- [x] UI components updated for new systems

---

## Notes

This phase focuses on building a static UI shell - no logic, no data connections, just the visual structure. All data in the confirmation step will be hardcoded. The goal is to match Jose's beautiful design exactly using Vue/Vuetify components. Logic integration and data connections will happen in Phase 7.

**Key Principles:**
- **No Logic:** This is a static UI shell - no state management, no API calls, no data transformations
- **Hardcoded Data:** All data in ConfirmationStep will be hardcoded strings/numbers
- **Visual Match:** Focus on matching Jose's beautiful design exactly
- **Simple State:** Just `ref(0)` for active step, basic click handlers for navigation

**Jose's Wizard Reference:**
- GitHub: `WillWhittakerDHP/Stuff-From_Jose`
- Location: `src/views/pages/wizard-examples/scheduler/index.js`
- Phase 5 Component: `StepPriceDetails.js`
- Focus on: Visual design, layout patterns, UX flows
- What NOT to implement yet: Logic, data connections, state management (saved for Phase 7)

---

## Related Documents

- Phase Log: `.cursor/project-manager/features/vue-migration/phases/phase-6-log.md`
- Phase Handoff: `.cursor/project-manager/features/vue-migration/phases/phase-6-handoff.md`
- Session Guides: `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-guide.md`
- Jose's Wizard Reference: `/Users/districthomepro/Bonsai/Jose-Scheduler-Reference/src/views/pages/wizard-examples/scheduler/`
