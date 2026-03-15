# Feature Admin UI Overhaul Guide

**Purpose:** Feature-level guide for planning and tracking major initiatives

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** Admin UI Overhaul
**Description:** (1) **Admin vs Developer Split:** Rename current admin panel to Developer; create a new Admin panel from scratch for business administration only. (2) **Smart UI Redesign:** Guided workflows, relationship builders, templates, contextual intelligence, progressive disclosure. (3) **Live Preview Panel:** Real-time booking simulation. (4) **Selective AI Assistance:** GPT-powered helpers integrated into workflows.
**Status:** Research

**Duration:** 10–11 weeks (2–3 weeks Phase 0, 3 weeks Phase 1, 2 weeks Phase 2, 3 weeks Phase 3)
**Started:** 2025-02-01
**Completed:** [Date] (if complete)

---

## Research Phase

**Status:** In Progress

### Research Findings

[Summary of research findings - see research question template for details]

**Key Decisions:**
- [Decision 1]
- [Decision 2]
- [Decision 3]

**Technology Choices:**
- [Technology 1] - [Rationale]
- [Technology 2] - [Rationale]

**Architecture:**
[High-level architecture description]

**Risks Identified:**
- [Risk 1] - [Mitigation]
- [Risk 2] - [Mitigation]

**Research Documentation:**
- Research Questions: `project-manager/features/admin-ui-overhaul/research-questions.md`
- External Research: [Links to research sources]
- Feature Guide (this document): `project-manager/features/admin-ui-overhaul/feature-admin-ui-overhaul-guide.md`

---

## Feature Objectives

- Reduce admin cognitive load through guided workflows and progressive disclosure
- Enable real-time feedback via live preview panel showing booking simulation results
- Integrate AI assistance as helpful suggestions without replacing admin decision-making
- Reduce service creation time from 15+ minutes to < 5 minutes
- Reduce configuration error rate from 20%+ to < 5%
- Enable non-technical admins to successfully configure services without deep domain knowledge

---

## Current State

**Admin panel today** (`/admin`, `AdminPanel.vue`):

| Tab | Content | Nature |
|-----|---------|--------|
| Instances | Block/Part/Event/Annotation instances, entity cards, metadata editing | Dev / data model |
| Shapes | Block/Part/Event/Annotation shapes, metadata | Dev / schema |
| APPOINTMENTS | Appointments, properties, users tables | Mixed |
| CONTROLS | Business rules, constraints, calendar, holds, grid, wizard settings | Business admin |

**Data chain using "admin":**

- **Client:** `views/admin/`, `composables/admin/`, `components/admin/`, `types/admin/`, `utils/admin/`, `utils/api/adminMetadataApi.ts`
- **Router:** `/admin`, `admin-panel`, `admin-booking-entry`
- **API:** `/admin-metadata`, `/admin-primitive-metadata`, `/admin-relationship-metadata`
- **Server:** `routes/internal/admin-metadata/`, `db/models/admin/` (adminMetadata, adminRelationshipMetadata, business_settings, etc.)
- **Composables:** `useAdmin`, `useAdminConfig`, `useAdminAvailabilitySettings`, etc.

---

## Architecture Decision: Admin vs Developer Split

**Current panel** = Developer (dev/data-model focus): Instances, Shapes, metadata, block shapes, entity forms, dev tools.

**New panel** = Admin (business administration only): Users, roles, permissions, org settings. Flat, focused UI. No metadata, shapes, instances.

**Rename strategy:** Client renames first; API and DB renames optional and migration-driven.

**CONTROLS placement:** Explicit decision required — Business Controls (rules, calendar, holds, wizard) may live in Admin panel rather than Developer. To be decided during Phase 0 planning.

**Grep/Replace scope (straightforward renames):**
- `views/admin/` → `views/developer/`
- `composables/admin/` → `composables/developer/`
- `components/admin/` → `components/developer/`
- `types/admin/` → `types/developer/`
- `utils/admin/` → `utils/developer/`
- `useAdmin` → `useDeveloper`
- `AdminPanel` → `DeveloperPanel`
- Route `/admin` → `/developer`, `admin-panel` → `developer-panel`

---

## Phases Breakdown

- [ ] ### Phase 0: Admin vs Developer Split
**Description:** Rename current admin panel to Developer; create a new Admin panel for business administration only.
**Duration:** 2–3 weeks
**Sessions:** [To be determined]
**Dependencies:** None
**Tasks:**
1. **Rename current admin → Developer:** Grep/replace across client (views, composables, components, types, utils, router). Decide on API path renames (`/admin-metadata` → `/developer-metadata` or keep). Decide on DB model renames vs. keeping DB names.
2. **Route and access:** `/admin` → `/developer` for the current panel. Add `/admin` for the new Admin panel.
3. **New Admin panel:** New route, layout, and components. Only business admin: users, roles, permissions, org settings. Flat, focused UI; no metadata, shapes, instances.
4. **Move CONTROLS:** Decide whether Business Controls (rules, calendar, holds, wizard) live in Developer or Admin.
**Scope:**
- **Developer:** Instances, Shapes, metadata, block shapes, entity forms, dev tools.
- **Admin:** Users, roles, permissions, org settings (and optionally CONTROLS).
**Grep/replace strategy:** Start with client-only renames. Treat API and DB renames as separate, optional steps with migrations.
**Caveats:**
- **User role `admin`:** Used in `userRole === 'admin'` for access control. Decide: keep admin as a role, or introduce developer as a separate role.
- **API paths:** `/admin-metadata`, etc. may be external contracts. Options: keep paths and only rename UI, or rename and migrate.
- **DB models:** Renaming tables/columns needs migrations; often easier to keep DB names and only rename in app code.
**Success Criteria:**
- Developer panel at `/developer` with Instances, Shapes, metadata, entity forms
- Admin panel at `/admin` with users, roles, permissions, org settings only
- CONTROLS placement decided and implemented

- [ ] ### Phase 1: Smart UI Redesign
**Description:** Implement guided workflows, relationship builder, templates, contextual intelligence, and progressive disclosure to simplify Developer interface
**Duration:** 3 weeks
**Sessions:** [To be determined]
**Dependencies:** Phase 0 (Admin vs Developer Split)
**Success Criteria:**
- Admin can create complete service without understanding underlying data model
- Guided workflows prevent 90%+ of invalid configurations
- Templates enable < 2 minute service creation for common types
- 70%+ of smart suggestions are accepted by admins
- 80% of operations completed in simple mode

- [ ] ### Phase 2: Live Preview Panel
**Description:** Extract booking calculation logic and create live preview panel showing real-time booking simulation results as admins configure services
**Duration:** 2 weeks
**Sessions:** [To be determined]
**Dependencies:** Phase 1 (needs forms to integrate preview)
**Success Criteria:**
- Preview updates within 200ms of field blur
- Calculations match booking wizard exactly
- All three example properties show accurate results
- Visual indicators clearly show status (✅❌⚠️)

- [ ] ### Phase 3: Selective AI Assistance
**Description:** Adapt existing GPT feature plan to integrate AI assistance into workflows (not standalone chat), including smart suggestions, natural language search, and auto-complete
**Duration:** 3 weeks
**Sessions:** [To be determined]
**Dependencies:** Phase 1 (needs workflows to integrate AI)
**Success Criteria:**
- AI suggestions appear within 3 seconds
- 60%+ of suggestions are useful/accurate
- AI doesn't replace admin decision-making (always review/approve)
- Natural language search returns relevant results

---

## Dependencies

**Prerequisites:**
- Existing admin panel infrastructure
- Booking wizard calculation logic (for Phase 2)
- GPT admin automation feature plan (for Phase 3)

**Downstream Impact:**
- Will significantly improve admin user experience
- May require admin training on new workflows
- Could affect how services are configured going forward

**External Dependencies:**
- OpenAI API key (for Phase 3 AI features)
- Vuetify components (for UI components)
- D3.js or vis.js (for relationship graph visualization)

---

## Success Criteria

- [ ] All phases completed
- [ ] All research questions answered
- [ ] Architecture decisions documented
- [ ] Code quality checks passing
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Performance targets met (< 200ms preview updates, < 1s form load)
- [ ] User experience metrics met (time to create service < 5 min, error rate < 5%)
- [ ] Ready for production

---

## Git Branch Strategy

**Branch Name:** `feature/admin-ui-overhaul`
**Branch From:** `develop`
**Merge To:** `develop`

**Branch Management:**
- Created: [Date] (at feature start)
- Merged: [Date] (at feature end)
- Deleted: [Date] (after merge)

---

## End of Feature Workflow

**CRITICAL: Prompt before ending feature**

After completing all phases in a feature, **prompt the user** before running `/feature-end`:

```
## Ready to End Feature?

All phases complete. Ready to merge feature branch?

**This will:**
- Generate feature summary
- Merge feature/admin-ui-overhaul → develop
- Delete feature branch
- Finalize documentation

**Proceed with /feature-end?** (yes/no)
```

**If user says "yes":**
- Run `/feature-end` command automatically
- Complete all feature-end steps (verify completion, update docs, generate summary)
- **After all checks pass and docs are updated, prompt for commit/merge/push:**
  ```
  ## Ready to Commit, Merge, and Push?
  
  All feature-end checks completed successfully:
  - ✅ Feature summary generated
  - ✅ Feature documentation closed
  - ✅ All documentation updated
  
  **Ready to commit, merge, and push all changes?**
  
  This will:
  - Commit all changes with feature completion message
  - Merge feature/admin-ui-overhaul → develop
  - Delete feature branch
  - Push to remote repository
  
  **Proceed with commit, merge, and push?** (yes/no)
  ```
- **If user says "yes" to commit/merge/push:** Execute git commit, merge, delete branch, and push, then end feature
- **If user says "no" to commit/merge/push:** End feature without committing (user can commit and merge manually later)

**If user says "no" to feature-end:**
- Address any requested changes
- Re-prompt when ready

After completing all phases in a feature:

1. **Verify feature completion** - All phases complete, success criteria met
2. **Update feature status** - Mark feature as Complete
3. **Update feature handoff** - Document feature completion and transition context
4. **Generate feature summary** - Create completion summary
5. **PROMPT USER FOR COMMIT/MERGE/PUSH** - After all checks pass and docs are updated, prompt user before git operations
6. **Merge feature branch** - Merge to develop (after user approval)
7. **Delete feature branch** - Clean up branch (after merge)
8. **Workflow Feedback** (Optional - only if issues encountered):
   - Were there any problems managing this feature workflow or issues with results?
   - Note any sticking points, inefficiencies, or workflow friction for future improvement
   - Consider if feature-level issues suggest improvements needed at phase, session, or task level

---

## Notes

- Feature plan document contains detailed implementation specifications
- Integrates with existing GPT admin automation feature plan
- Focus on reliability first, AI as helper (not replacement)
- Progressive disclosure to reduce complexity for non-technical users

---

## Related Documents

- Feature Guide (this document): `project-manager/features/admin-ui-overhaul/feature-admin-ui-overhaul-guide.md`
- Feature Log: `project-manager/features/admin-ui-overhaul/feature-admin-ui-overhaul-log.md`
- Feature Handoff: `project-manager/features/admin-ui-overhaul/feature-admin-ui-overhaul-handoff.md`
- Phase Guides: `project-manager/features/admin-ui-overhaul/phases/phase-[N]-guide.md`
- Research Questions: `project-manager/features/admin-ui-overhaul/research-questions.md`


