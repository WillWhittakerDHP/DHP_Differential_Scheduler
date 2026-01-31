# Project Manager Documentation Structure

**Purpose:** This README explains the project manager documentation structure and which documents are current.

**Last Updated:** 2025-02-01

---

## Directory Structure

```
.project-manager/
├── README.md (this file)
├── MASTER_FEATURE_INDEX.md (overview of all features)
├── PROJECT_MANAGER_HANDOFF.md (project-level handoff)
├── docs/ (architecture and reference docs)
├── features/ (feature-level documentation)
│   ├── vue-migration/ (Vue migration feature - ✅ Core Complete)
│   │   ├── vue-migration-completion-summary.md ⭐ COMPLETE
│   │   ├── feature-vue-migration-guide.md (feature strategy)
│   │   ├── phases/ (phase-level guides - historical)
│   │   └── sessions/ (session logs - historical)
│   ├── data-flow-alignment/ (Feature 1)
│   ├── feature-2-google-apis-integration/ (Feature 2)
│   ├── booking-calculations/ (Feature 3)
│   ├── calendar-appointment-availability/ (Feature 4)
│   ├── feature-7-ui-polish/ (Feature 7)
│   └── gpt-admin-automation/ (Feature 6)
└── project-plan.md.old (archived - for reference only)
```

---

## Source of Truth Documents

### Feature Level (Tier 1)
- **Strategy:** `features/vue-migration/feature-vue-migration-guide.md`
- **Current Status:** `features/vue-migration/feature-vue-migration-handoff.md` ⭐ **CURRENT**
- **Historical Log:** `features/vue-migration/feature-vue-migration-log.md`

### Phase Level (Tier 2)
- **Phase Guides:** `features/vue-migration/phases/phase-[N]-guide.md` ⭐ **CURRENT**
- **Phase Logs:** `features/vue-migration/phases/phase-[N]-log.md` (historical)
- **Phase Handoffs:** `features/vue-migration/phases/phase-[N]-handoff.md` (historical)

### Session Level (Tier 3)
- **Session Logs:** `features/vue-migration/sessions/session-[X.Y]-log.md` (historical)
- **Session Guides:** `features/vue-migration/sessions/session-[X.Y]-guide.md` (historical)
- **Session Handoffs:** `features/vue-migration/sessions/session-[X.Y]-handoff.md` (historical)

---

## Current Status (2025-02-01)

### Single Source of Truth
- **Master Plan:** `PROJECT_PLAN.md` ⭐ **CURRENT - Use this as source of truth**
- All phase guides and todos align with PROJECT_PLAN.md

### Vue Migration Feature (Feature 0)
- **Status:** ✅ Core Complete
- **Completed Phases:** 1, 2, 3, 4, 5, 6 ✅
- **Phase 9:** Mostly Complete (naming refactoring done)
- **Completion Summary:** `features/vue-migration/vue-migration-completion-summary.md`
- **Note:** Structural migration complete. Remaining work is feature development, not migration work.

### New Features (Post-Migration)
- **Feature 1:** Data Flow Alignment - Fix data flow issues and interactions
- **Feature 2:** Google APIs Integration - Integrate external APIs
- **Feature 3:** Booking Calculations - Extract and implement calculation logic
- **Feature 4:** Calendar & Appointment Availability - Build calendar and availability features
- **Feature 6:** GPT-Powered Admin Panel Automation - Natural language automation (separate feature)
- **Feature 7:** UI Polish - Polish admin panel and wizard UI (includes bulk updates)

### Recent Changes (2025-02-01)
- **Vue Migration Closed:** Marked as "Core Complete" with completion summary
- **New Features Created:** 5 new features organized from remaining work
- **Phases Archived:** Phases 7-11 archived or moved to new features
- **Phase 10 Cancelled:** Property Management System cancelled per user preference
- **Phase 11 Moved:** Bulk Updates moved to Feature 2: UI Polish as small enhancement

---

## Path References

**Important:** All path references should use `.project-manager/` (project root, not inside `.cursor/`).

The `.cursor/` directory contains codebase-agnostic tools and commands, while `.project-manager/` contains project-specific planning documentation.

---

## Document Types

### Guides
- **Purpose:** Planning and objectives
- **When to Update:** When phase/feature objectives change
- **Examples:** `phase-4-guide.md`, `feature-vue-migration-guide.md`

### Handoffs
- **Purpose:** Current status and transition context
- **When to Update:** After completing phases/sessions
- **Examples:** `feature-vue-migration-handoff.md`

### Logs
- **Purpose:** Historical record of work completed
- **When to Update:** After completing work
- **Examples:** `feature-vue-migration-log.md`, `session-1-1-log.md`

---

## Which Documents to Use

### For Current Planning
1. **Start with:** `PROJECT_PLAN.md` ⭐ **SINGLE SOURCE OF TRUTH**
2. **Vue Migration Status:** `features/vue-migration/vue-migration-completion-summary.md` (completion summary)
3. **Feature Plans:** `features/[feature-name]/feature-plan.md` (detailed feature plans)
   - **CRITICAL:** Must be created before phase planning documents
4. **Feature READMEs:** `features/[feature-name]/README.md` (feature overviews)
   - **CRITICAL:** Must be created before phase planning documents
5. **Validation:** See `FEATURE_VALIDATION_CHECKLIST.md` for pre-phase planning validation requirements

### For Historical Reference
- Session logs: `sessions/session-[X.Y]-log.md`
- Phase logs: `phases/phase-[N]-log.md`
- Feature log: `feature-vue-migration-log.md`

### For Architecture Reference
- See: `docs/` directory for architecture documents
- See: `MASTER_FEATURE_INDEX.md` for feature overview

---

## Notes

- **Archived Documents:** `project-plan.md.old` is archived and should not be modified
- **Path Consistency:** Always use `project-manager` (not `workflow-manager`) in new documents
- **Vue Migration:** Core Complete - Structural migration achieved. See completion summary for details.
- **Current Focus:** Feature development (Features 1-4, 6-7) - Data flow, APIs, calculations, calendar, UI polish
- **Feature-Level Docs Requirement:** Feature-level planning documents (`feature-plan.md`, `README.md`) MUST be created before any phase planning documents. See `FEATURE_VALIDATION_CHECKLIST.md` for validation requirements.

---

## Root Planning Documents

The following documents are in the project-manager root:

- **PROJECT_PLAN.md** ⭐ **CURRENT** - Single source of truth for project planning (includes Vue migration and new features)
- **MASTER_FEATURE_INDEX.md** ⭐ **CURRENT** - Overview of all features
- **future-features-catalog.md** ⭐ **CURRENT** - Future features catalog (as requested)
- **PROJECT_MANAGER_HANDOFF.md** - Technical handoff for project manager system itself
- **FEATURE_VALIDATION_CHECKLIST.md** ⭐ **CURRENT** - Validation requirements for feature-level docs before phase planning
- **README.md** - This document
- **archive/** - Historical/archived documents (project-plan.md.old, project-manager-cleanup.plan.md, SWITCHOVER_SUMMARY.md)

## Questions?

If you're unsure which document to use:
1. **Start with:** `PROJECT_PLAN.md` - Single source of truth
2. Check `features/vue-migration/vue-migration-completion-summary.md` for Vue migration status
3. Review relevant `features/[feature-name]/feature-plan.md` for detailed feature plans
4. Consult `features/[feature-name]/README.md` for feature overviews

