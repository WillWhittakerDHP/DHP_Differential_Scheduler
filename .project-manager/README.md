# Project Manager Documentation Structure

**Purpose:** This README explains the project manager documentation structure and which documents are current.

**Last Updated:** 2026-03-15

---

## Directory Structure

```
.project-manager/
├── README.md (this file)
├── PROJECT_PLAN.md ⭐ SINGLE SOURCE OF TRUTH
├── FEATURE_VALIDATION_CHECKLIST.md (pre-phase planning validation)
├── future-features-catalog.md (future features catalog)
├── PROJECT_MANAGER_HANDOFF.md (project-level handoff)
├── docs/ (architecture and reference docs)
├── features/ (feature-level documentation)
│   ├── vue-migration/ (Feature 0 — ✅ Complete)
│   ├── data-flow-alignment/ (Feature 1 — ✅ Complete)
│   ├── google-apis-integration/ (Feature 2 — ✅ Complete)
│   ├── calendar-appointment-availability/ (Feature 3 — ✅ Complete)
│   ├── appointment-workflow/ (Feature 6 — ⏳ Partial)
│   ├── authentication/ (Feature 7 — 📋 Planning)
│   ├── security-hardening/ (Feature 8 — 📋 Planning)
│   ├── guided-alpha-testing/ (Feature 9 — 📋 Planning)
│   ├── testing-quality-validation/ (Feature 10 — 📋 Planning)
│   ├── production-readiness/ (Feature 11 — 📋 Planning)
│   ├── pre-launch-polish/ (Feature 12 — 📋 Planning)
│   ├── beta-feedback/ (Feature 14 — ✅ Complete)
│   ├── beta-feedback-response/ (Feature 15 — 📋 Planning)
│   ├── ui-polish/ (Feature 16 — 🔮 Future)
│   ├── admin-ui-overhaul/ (Feature 17 — 🔮 Future)
│   ├── admin-assistance-wizard/ (Feature 18 — 🔮 Future)
│   └── booking-calculations/ (historical — merged into Feature 6)
└── archive/ (historical/archived documents)
```

---

## Source of Truth Documents

### Project Level
- **Master Plan:** `PROJECT_PLAN.md` ⭐ **SINGLE SOURCE OF TRUTH** — All features, phases, and statuses
- **Launch Infrastructure:** `../../LAUNCH_CHECKLIST.md` ⭐ — Hosting, security, deployment, testing (root-level)

### Feature Level (Tier 1)
Each feature directory contains:
- **README.md** — Feature overview, key objectives, architecture
- **feature-{feature-name}-guide.md** — Detailed phases, sessions, success criteria
- **feature-completion-summary.md** — Post-completion summary (for completed features)
- **feature-[N]-handoff.md** — Current status and transition context (for in-progress features)

### Phase Level (Tier 2)
- **Phase Guides:** `features/[feature]/phases/phase-[N]-guide.md`
- **Phase Handoffs:** `features/[feature]/phases/phase-[N]-handoff.md`

### Session Level (Tier 3)
- **Session Logs:** `features/[feature]/sessions/session-[X.Y]-log.md`
- **Session Handoffs:** `features/[feature]/sessions/session-[X.Y]-handoff.md`

---

## Current Status (2026-03-15)

### Completed / Functionally Complete
- **Feature 0:** Vue.js Migration — ✅ Complete
- **Feature 1:** Data Flow Alignment — ✅ Complete (2026-01-31)
- **Feature 2:** Google APIs Integration — ✅ Complete (MLS credentials pending on external provider)
- **Feature 3:** Calendar & Appointment Availability — ✅ Complete (2026-02-21)
- **Feature 4:** Pricing Cascades — ✅ Complete (2026-02-13)
- **Feature 5:** Property Enrichment & Mappings — ✅ Complete (2026-02-11)
- **Feature 14:** Beta Feedback System — ✅ Complete (2026-02-10)

### In Progress
- **Feature 6:** Appointment Workflow & Booking Calculations — ⏳ Partial (Phase 6.10 active)

### Planning (Pre-Launch)
- **Feature 7:** Authentication
- **Feature 8:** Security Hardening
- **Feature 9:** Guided Alpha Testing
- **Feature 10:** Testing & Quality Validation
- **Feature 11:** Production Readiness
- **Feature 12:** Pre-Launch Polish
- **Feature 13:** Alpha Launch & Deployment
- **Feature 15:** Beta Feedback Response
- **Feature 19:** CRM / Inspection Platform Integration

### Future (Post-Launch)
- **Feature 16:** UI Polish
- **Feature 17:** Admin UI Overhaul
- **Feature 18:** Admin Assistance Wizard

---

## Root-Level Planning Documents

### In This Directory
- **PROJECT_PLAN.md** ⭐ **CURRENT** — Single source of truth for all feature development
- **FEATURE_VALIDATION_CHECKLIST.md** ⭐ **CURRENT** — Validation requirements for feature-level docs before phase planning
- **future-features-catalog.md** ⭐ **CURRENT** — Future features catalog
- **PROJECT_MANAGER_HANDOFF.md** — Technical handoff for project manager system itself
- **README.md** — This document

### In Project Root
- **LAUNCH_CHECKLIST.md** ⭐ **CURRENT** — Master checklist for launch infrastructure (hosting, auth, security, CI/CD, testing). This is a separate tracking artifact from feature development — think of it as "Can we ship it safely?" vs PROJECT_PLAN's "What does the app do?"

### Archive
- **archive/** — Historical/archived documents (`project-plan.md.old`, etc.)

---

## Document Types

### Guides
- **Purpose:** Planning and objectives
- **When to Update:** When phase/feature objectives change

### Handoffs
- **Purpose:** Current status and transition context
- **When to Update:** After completing phases/sessions

### Logs
- **Purpose:** Historical record of work completed
- **When to Update:** After completing work

### Completion Summaries
- **Purpose:** Final summary when a feature is fully complete
- **When to Create:** When all phases of a feature are done

---

## Which Documents to Use

### For Current Planning
1. **Start with:** `PROJECT_PLAN.md` ⭐ — Single source of truth for feature development
2. **Launch readiness:** `../../LAUNCH_CHECKLIST.md` — Infrastructure and deployment
3. **Feature details:** `features/[feature-name]/feature-{feature-name}-guide.md` — Detailed feature plans
4. **Feature overviews:** `features/[feature-name]/README.md` — Quick feature summaries
5. **Validation:** See `FEATURE_VALIDATION_CHECKLIST.md` for pre-phase planning requirements

### For Historical Reference
- Session logs: `features/[feature]/sessions/session-[X.Y]-log.md`
- Phase logs: `features/[feature]/phases/phase-[N]-log.md`
- Completion summaries: `features/[feature]/feature-completion-summary.md`

### For Architecture Reference
- See: `docs/` directory for architecture documents
- See: `features/admin-ui-overhaul/` for admin redesign research

---

## Notes

- **Path Consistency:** All path references should use `.project-manager/` (project root, not inside `.cursor/`)
- **Client Directory:** The Vue 3 application lives in `client/` (previously `client-vue/` — renamed after React codebase removal)
- **Feature-Level Docs Requirement:** Feature-level planning documents (feature guide, `README.md`) MUST be created before any phase planning documents. See `FEATURE_VALIDATION_CHECKLIST.md`.
- **3-Tier Structure:** Feature → Phase → Session. Each tier has its own documentation as needed.
- **Features 4–5:** Pricing Cascades and Property Enrichment are complete sub-features documented in PROJECT_PLAN without dedicated directories.
- **Feature 18:** "Admin Assistance Wizard" replaces the original "GPT Admin Automation" concept. Directory renamed to `admin-assistance-wizard/`.

---

## Questions?

If you're unsure which document to use:
1. **Feature development:** Start with `PROJECT_PLAN.md`
2. **Launch infrastructure:** Start with `../../LAUNCH_CHECKLIST.md`
3. **Specific feature:** Check `features/[feature-name]/README.md`
4. **Current progress on active feature:** Check `features/[feature-name]/feature-[N]-handoff.md`
