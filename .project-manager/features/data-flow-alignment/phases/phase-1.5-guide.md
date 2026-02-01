# Phase 1.5 Guide: Business Rules & Validation

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 1.5
**Phase Name:** Business Rules & Validation
**Description:** Set up business logic admin tab structure, configure required fields, set up validation messages, and implement "requires agent" logic. Enable admin-configurable validation rules tied to annotation sets.

**Duration:** Estimated 2-3 weeks
**Status:** In Progress

---

## Phase Objectives

- Set up business logic admin tab structure for managing validation rules
- Configure required fields per service/dwelling adjustment (admin-configurable)
- Set up validation message annotations tied to business rules
- Implement "requires agent" logic with modal workflows
- Set up confirmation modal validation logic for property details
- Create database schema for business rules and validation configuration
- Connect business rules to annotation sets for user-facing messages

---

## Sessions Breakdown

- [ ] ### Session 1.5.1: Business Rules Database Infrastructure
**Description:** Create database tables and models for business rules configuration. Replace hardcoded validation logic (isMultiFamily, requiresAgent, conditional required fields) with database-driven rules.
**Tasks:** 6 tasks
**Learning Goals:**
- Database schema design for configurable business rules
- Relationship modeling between business rules and block instances
- Annotation instances integration with validation messages
- Leveraging existing patterns (requiresUnitNumber flag, BusinessSettings JSONB)
**Key Deliverables:**
- `business_rules` table with rule_type and JSONB config
- Block instance validation flags (is_multi_family, requires_agent)
- BusinessRule Sequelize model with typed JSONB
- Business rules API router (full CRUD)
- Seed default business rules linked to annotation instances

- [ ] ### Session 1.5.2: Business Rules Admin Tab
**Description:** Create admin panel tab for managing business rules (required fields UI, validation message configuration)
**Tasks:** 4-5 tasks
**Learning Goals:**
- Admin UI patterns for configuration management
- Form design for complex rule configuration
- Real-time preview of validation rules

- [ ] ### Session 1.5.3: Required Fields Validation Logic
**Description:** Implement required fields validation in wizard (property details confirmation modal, required field checking)
**Tasks:** 4-5 tasks
**Learning Goals:**
- Dynamic validation based on business rules
- Modal workflows for confirmation
- Annotation-driven user messages

- [ ] ### Session 1.5.4: "Requires Agent" Logic Implementation
**Description:** Implement "requires agent" detection and modal workflow (agent/client contact info validation)
**Tasks:** 3-4 tasks
**Learning Goals:**
- Service-specific validation logic
- Shared composable patterns for modal/step data
- Conditional form field requirements

---

## Dependencies

**Prerequisites:**
- Phase 1.4 Complete (Admin Panel Data Flow Fixes, Business Controls Tab, Dual-Cache Architecture) ✅
- Database structure supports annotation entities (annotationShape, annotationInstance) ✅
- GlobalData cache includes all 8 entity types and 10 relationship types ✅
- Admin panel tabs infrastructure in place ✅

**Downstream Impact:**
- Business rules configuration will affect booking wizard validation behavior
- Annotation sets will drive user-facing validation messages
- Required fields configuration will affect property details step workflow
- Agent requirements will affect contacts step validation

---

## Success Criteria

- [ ] Business rules database tables created and functional
- [ ] Business rules admin tab created and integrated
- [ ] Required fields configurable per service/dwelling adjustment in admin panel
- [ ] Property details confirmation modal shows required fields based on business rules
- [ ] Validation messages come from annotation sets (no hardcoded messages)
- [ ] "Requires agent" logic detects services requiring agent/client info
- [ ] "Requires agent" modal properly integrated with wizard form data (shared composable)
- [ ] Confirmation modals properly show annotation-driven messages
- [ ] All validation rules dynamically loaded from database
- [ ] Business rules properly invalidate cache when modified

---

## End of Phase Workflow

**CRITICAL: Prompt before completing phase**

After completing all sessions in a phase, **prompt the user** before running `/phase-end`:

```
## Ready to Complete Phase?

All sessions complete. Ready to run phase-completion workflow?

**This will:**
- Mark phase complete (update checkboxes and status)
- Update phase log with completion summary
- Update main handoff document
- Git commit/push

**Proceed with /phase-end?** (yes/no)
```

**If user says "yes":**
- Run `/phase-end` command automatically
- Complete all phase-completion steps

**If user says "no":**
- Address any requested changes
- Re-prompt when ready

After completing all sessions in a phase:

1. **Verify phase completion** - All sessions complete, success criteria met
2. **Update phase status** - Mark phase as Complete
3. **Update phase handoff** - Document phase completion and transition context
4. **Workflow Feedback** (Optional - only if issues encountered):
   - Were there any problems managing this phase workflow or issues with results?
   - Note any sticking points, inefficiencies, or workflow friction for future improvement
   - Consider if phase-level issues suggest improvements needed at session or task level

---

## Notes

**Key Design Decisions:**
- Business rules stored in database (not config files) for runtime flexibility
- Validation messages driven by annotation sets (admin-configurable, not hardcoded)
- Required fields tied to block instances (services, dwelling adjustments)
- Modal workflows share composables with wizard steps (single source of truth for form data)

**Technical Approach:**
- Database table: `business_rules` with relationships to block_instances and annotations
- Admin tab follows existing tab pattern (similar to BusinessControlsTab)
- Wizard validation uses dynamic rule loading (not static validation schemas)
- Modals use provide/inject to access wizard step data composables

---

## Related Documents

- Phase Log: `phase-1.5-log.md`
- Phase Handoff: `phase-1.5-handoff.md`
- Feature Plan: `../feature-plan.md`
- Phase 1.4 Handoff: `phase-1.4-handoff.md`
- Cache Architecture: `../docs/CACHE_ARCHITECTURE.md`
