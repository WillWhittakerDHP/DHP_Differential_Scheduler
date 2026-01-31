# Phase 1.5 Handoff: Business Rules & Validation

**Feature:** Data Flow Alignment
**Phase:** 1.5 - Business Rules & Validation
**Status:** In Progress
**Started:** 2026-01-31
**Last Updated:** 2026-01-31

---

## Phase Overview

**Phase Number:** 1.5
**Phase Name:** Business Rules & Validation
**Description:** Set up business logic admin tab structure, configure required fields, set up validation messages, and implement "requires agent" logic. Enable admin-configurable validation rules tied to annotation sets.

**Current Status:** In Progress
**Dependencies:** Phase 1.4 (Admin Panel Data Flow Fixes) ✅ Complete

---

## Objectives

- Set up business logic admin tab structure for managing validation rules
- Configure required fields per service/dwelling adjustment (admin-configurable)
- Set up validation message annotations tied to business rules
- Implement "requires agent" logic with modal workflows
- Set up confirmation modal validation logic for property details
- Create database schema for business rules and validation configuration

---

## Sessions Overview

| Session | Name | Status |
|---------|------|--------|
| 1.5.1 | Business Rules Database Infrastructure | ⏳ Not Started |
| 1.5.2 | Business Rules Admin Tab | ⏳ Not Started |
| 1.5.3 | Required Fields Validation Logic | ⏳ Not Started |
| 1.5.4 | "Requires Agent" Logic Implementation | ⏳ Not Started |

---

## Transition Context from Phase 1.4

**Where we left off:**
Phase 1.4 completed all admin panel data flow fixes, established dual-cache architecture (globalData/businessData), completed wizard UI setup, and verified all CRUD operations work correctly. Business controls infrastructure is in place for admin-configurable settings.

**What you need to start Phase 1.5:**
- Database structure supports annotation entities (annotationShape, annotationInstance in entities) ✅
- Admin panel tabs infrastructure in place (can add new tabs) ✅
- Business controls pattern established (reference for business rules tab) ✅
- Wizard modal workflows exist (reference for confirmation/agent modals) ✅

**Key Architecture from Phase 1.4:**
```
┌──────────────────────────────────────────────┬───────────────────────────────────────┐
│ GlobalData ['globalData']                    │ BusinessData ['businessData']         │
├──────────────────────────────────────────────┼───────────────────────────────────────┤
│ • entities (8 types):                        │ • appointments                        │
│   - blockInstance                            │ • properties                          │
│   - blockShape                               │ • users                               │
│   - partInstance                             │                                       │
│   - partShape                                │                                       │
│   - eventShape                               │                                       │
│   - eventInstance                            │                                       │
│   - annotationShape                          │                                       │
│   - annotationInstance                       │                                       │
│                                              │                                       │
│ • relationships (10 types):                  │                                       │
│   - validCascades                            │                                       │
│   - validParts                               │                                       │
│   - validAnnotations                         │                                       │
│   - dependentInstances                       │                                       │
│   - bookingCascades                          │                                       │
│   - partAssignments                          │                                       │
│   - annotationAssignments                    │                                       │
│   - eventAssignments                         │                                       │
│   - attendeeAssignments                      │                                       │
│   - instanceComponents                       │                                       │
├──────────────────────────────────────────────┼───────────────────────────────────────┤
│ Pattern: refetchQueries                      │ Pattern: optimistic + refetchQueries  │
│ Change Frequency: Low                        │ Change Frequency: High                │
└──────────────────────────────────────────────┴───────────────────────────────────────┘
```

**Note:** Annotations (annotationShape, annotationInstance) are core entities in the entities section, not separate top-level properties.

---

## Next Action

**Ready for:** Session 1.5.1 - Business Rules Database Infrastructure

**First Steps:**
1. Review existing annotation sets structure (globalData)
2. Design business_rules table schema (relationships to block_instances and annotations)
3. Create migration for business_rules table
4. Create Sequelize model with TypeScript types
5. Create API routes for CRUD operations

---

## Architecture Notes

### Business Rules Design Approach

**Database Storage:**
- `business_rules` table with configurable validation rules
- Relationships: `business_rules` → `block_instances` (which services/dwelling adjustments trigger rules)
- Relationships: `business_rules` → `annotations` (which messages to show)

**Validation Flow:**
1. Wizard step detects user selections (service, dwelling adjustment)
2. Loads business rules for selected block instances
3. Checks if required fields are filled
4. If missing, shows modal with annotation-driven message
5. Modal shares composable with wizard step (single source of truth)

**"Requires Agent" Flow:**
1. Service selection step detects "requires agent" flag on selected services
2. On wizard navigation, checks if agent/client contact info is filled
3. If missing, shows RequiresAgentModal with annotation message
4. Modal shows unfilled contact fields (same composable as ContactsStep)
5. User fills fields in modal or returns to ContactsStep

---

## Key Files

### To Be Created (Session 1.5.1)
- `server/src/db/migrations/[timestamp]_create_business_rules_table.mjs`
- `server/src/db/models/admin/business_rule.ts`
- `server/src/routes/internal/businessRulesRouter.ts`

### To Be Created (Session 1.5.2)
- `client/src/views/admin/tabs/BusinessRulesTab.vue`
- `client/src/composables/useBusinessRules.ts`

### To Be Created (Session 1.5.3)
- `client/src/components/booking/modals/PropertyConfirmationModal.vue` (may already exist from Phase 1.4.10)
- `client/src/composables/useRequiredFieldsValidation.ts`

### To Be Created (Session 1.5.4)
- `client/src/components/booking/modals/RequiresAgentModal.vue`
- `client/src/composables/useRequiresAgentValidation.ts`

### To Be Modified
- `client/src/composables/useBookingWizard.ts` (add validation logic)
- `client/src/components/booking/steps/PropertyDetailsStep.vue` (add confirmation modal)
- `client/src/components/booking/steps/ContactsStep.vue` (integrate with RequiresAgentModal)

---

## Related Documents

- **Phase Guide**: `phase-1.5-guide.md`
- **Phase Log**: `phase-1.5-log.md`
- **Feature Plan**: `../feature-plan.md`
- **Phase 1.4 Handoff**: `phase-1.4-handoff.md`
- **Cache Architecture**: `../docs/CACHE_ARCHITECTURE.md`

---

**Phase Status:** In Progress
**Last Completed Session:** None (Phase just started)
**Phase Started:** 2026-01-31
**Last Updated:** 2026-01-31
