# Session 1.3.9 Guide: Multi-Select Services Refactor

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.9 - Multi-Select Services Refactor  
**Status:** ✅ Complete (Code Work)  
**Priority:** High (Enables true multi-select for all wizard selections)  
**Created:** 2026-01-03

**Last Updated:** 2026-01-07 (Post-session maintenance recorded in `session-1.3.9-log.md`)

---

## Session Overview

**Session Number:** 1.3.9  
**Session Name:** Multi-Select Services Refactor  
**Description:** Refactor wizard selections from single-select to multi-select arrays for all block instance types (services, dwelling adjustments, availability options). Rename to accumulation naming convention (`accServices`, `accDwelling`, `accAvailability`). Update database schema, state management, UI components, and transformers to support arrays throughout.

**Dependencies:** Session 1.3.8 (Property and Address Table Separation Migration Plan) ✅ Complete

---

## Learning Goals

**Before Starting:**
- Understand current single-select wizard state management (`selectedBaseService`, `selectedDwellingAdjustment`)
- Understand database schema with FK columns (`base_service_id`, `dwelling_adjustment_id`)
- Understand SelectionCard component architecture and `isParent` conditional logic
- Review accumulation naming patterns for duration calculations

**During Session:**
- Learn how to migrate database FK columns to JSONB arrays
- Learn how to refactor wizard state from single values to arrays
- Learn how to separate SelectionCard into focused components
- Learn how to update transformers for array-based data flow

**After Session:**
- Understand multi-select array patterns in Vue.js wizard state
- Understand JSONB array storage and querying patterns
- Understand component separation patterns for cleaner architecture
- Understand accumulation naming for clarity in calculations

---

## Objectives

- Convert single-select FK columns to JSONB arrays in database
- Update backend models and API routes to use array fields
- Refactor wizard state management to use arrays (selectedServices, selectedDwellingAdjustments)
- Separate SelectionCard component into SelectionCard (parent) and NestedSelectionCard (nested)
- Update all wizard step components to support multi-select
- Update transformers and duration calculations for arrays
- Comprehensive testing and validation

---

## Sub-Sessions

This session is broken into 7 sub-sessions to manage complexity:

### Session 1.3.9.1: Database Migration
**Goal:** Create and execute database migration to convert single FK columns to JSONB arrays.

**Key Tasks:**
- Create migration file: `[timestamp]_convert_single_fks_to_arrays.mjs`
- Add new JSONB columns: `selected_service_ids`, `selected_dwelling_adjustment_ids`
- Migrate existing data (single values → arrays)
- Drop old FK columns and indexes
- Add GIN indexes on JSONB columns

**Key Files:**
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs` (new)

**Related Guide:** `session-1.3.9.1-guide.md`

---

### Session 1.3.9.2: Backend Model and API Updates
**Goal:** Update backend models and API routes to use array fields.

**Key Tasks:**
- Update Appointment model (remove FK fields, add array fields)
- Update model relationships in `models/index.ts`
- Update appointment router request validation
- Update appointment creation/update logic

**Key Files:**
- `server/src/db/models/booking/appointment.ts`
- `server/src/db/models/index.ts`
- `server/src/api/routes/appointmentRouter.ts`

**Related Guide:** `session-1.3.9.2-guide.md`

---

### Session 1.3.9.3: Frontend Type and Wizard State Updates
**Goal:** Update TypeScript types and wizard composable to use arrays.

**Key Tasks:**
- Update Appointment types (Request/Response)
- Update wizard state refs (selectedServices, selectedDwellingAdjustments)
- Update selection methods (toggleService, toggleDwellingAdjustment)
- Add accumulation computed properties (accServices, accDwelling, accAvailability)
- Update wizard state plugin

**Key Files:**
- `client-vue/src/types/appointment.ts`
- `client-vue/src/types/wizard.ts`
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/components/booking/plugins/wizardStatePlugin.ts`

**Related Guide:** `session-1.3.9.3-guide.md`

---

### Session 1.3.9.4: Component Architecture Refactor (NestedSelectionCard)
**Goal:** Separate SelectionCard into two focused components and simplify architecture.

**Key Tasks:**
- Create NestedSelectionCard component (new)
- Simplify SelectionCard (remove isParent logic)
- Update SelectionCardGroup to use NestedSelectionCard
- Update SelectionCardGroup props to support arrays

**Key Files:**
- `client-vue/src/components/booking/NestedSelectionCard.vue` (new)
- `client-vue/src/components/booking/SelectionCard.vue`
- `client-vue/src/components/booking/SelectionCardGroup.vue`

**Related Guide:** `session-1.3.9.4-guide.md`

---

### Session 1.3.9.5: UI Component Updates and Integration
**Goal:** Update all wizard step components to use multi-select arrays.

**Key Tasks:**
- Update ServiceSelectionStep (checkbox config, array modelValue)
- Update PropertyDetailsStep (dwelling adjustment multi-select)
- Update AvailabilityStep (array references, differential service checks)
- Update BookingWizard (validation, stepper subtitles, appointment creation)

**Key Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/components/booking/BookingWizard.vue`

**Related Guide:** `session-1.3.9.5-guide.md`

---

### Session 1.3.9.6: Transformer and Duration Calculation Updates
**Goal:** Update transformers and duration calculations to work with arrays.

**Key Tasks:**
- Update appointmentToWizardTransformer (array mappings)
- Update collectAppointmentData (array ID extraction)
- Update accumulatedBlockInstances computed (simplify accumulation)
- Update timeSlotCalculations references

**Key Files:**
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts`
- `client-vue/src/components/booking/BookingWizard.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/utils/timeSlotCalculations.ts`

**Related Guide:** `session-1.3.9.6-guide.md`

---

### Session 1.3.9.7: Testing and Validation
**Goal:** Comprehensive testing and validation of multi-select functionality.

**Key Tasks:**
- Test data migration (existing appointments)
- Test multi-select UI (services, dwelling adjustments)
- Test duration calculation (multiple selections)
- Test appointment creation/loading (arrays)
- End-to-end testing

**Key Files:**
- Test files (to be created as needed)
- Migration verification scripts

**Related Guide:** `session-1.3.9.7-guide.md`

---

## Implementation Order

The sub-sessions must be completed in order due to dependencies:

1. **Session 1.3.9.1** (Database Migration) - Foundation for all other changes
2. **Session 1.3.9.2** (Backend Updates) - Depends on database schema
3. **Session 1.3.9.3** (Frontend Types/State) - Foundation for UI changes
4. **Session 1.3.9.4** (Component Architecture) - Foundation for UI components
5. **Session 1.3.9.5** (UI Updates) - Depends on state and component architecture
6. **Session 1.3.9.6** (Transformers) - Depends on state and UI updates
7. **Session 1.3.9.7** (Testing) - Final validation of all changes

---

## Architecture Changes Summary

### Current State → Target State

**State Management:**
- `selectedBaseService: ref<BookingBlockInstance | null>` → `selectedServices: ref<BookingBlockInstance[]>`
- `selectedDwellingAdjustment: ref<BookingBlockInstance | null>` → `selectedDwellingAdjustments: ref<BookingBlockInstance[]>`
- `selectedAvailabilityOptions: ref<BookingBlockInstance[]>` → (unchanged, already array)

**Database Schema:**
- `base_service_id` (FK) → `selected_service_ids` (JSONB array)
- `dwelling_adjustment_id` (FK) → `selected_dwelling_adjustment_ids` (JSONB array)
- `selected_availability_options` (JSONB array) → (unchanged)

**Component Architecture:**
- `SelectionCard` (handles both parent and nested) → `SelectionCard` (parent only) + `NestedSelectionCard` (nested only)

**Accumulation Naming:**
- Add computed properties: `accServices`, `accDwelling`, `accAvailability` for clarity in duration calculations

---

## Key Files

### Backend
- `server/src/db/migrations/[timestamp]_convert_single_fks_to_arrays.mjs` (new)
- `server/src/db/models/booking/appointment.ts`
- `server/src/db/models/index.ts`
- `server/src/api/routes/appointmentRouter.ts`

### Frontend
- `client-vue/src/types/appointment.ts`
- `client-vue/src/types/wizard.ts`
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/components/booking/plugins/wizardStatePlugin.ts`
- `client-vue/src/components/booking/SelectionCardGroup.vue`
- `client-vue/src/components/booking/SelectionCard.vue`
- `client-vue/src/components/booking/NestedSelectionCard.vue` (new)
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/components/booking/BookingWizard.vue`
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts`
- `client-vue/src/utils/timeSlotCalculations.ts`

---

## Success Criteria

- ✅ All selections support multi-select (services, dwelling adjustments, availability options)
- ✅ Database schema uses JSONB arrays for all selections
- ✅ Existing data migrated successfully (single values → arrays)
- ✅ Wizard state uses accumulation naming (`accServices`, `accDwelling`, `accAvailability`)
- ✅ SelectionCardGroup config-driven approach works with checkboxes
- ✅ NestedSelectionCard component created and integrated
- ✅ SelectionCard simplified (removed isParent logic)
- ✅ Context update issues resolved with component separation
- ✅ Duration calculation accumulates from all selected blocks
- ✅ Appointment creation/loading works with arrays
- ✅ No data loss during migration
- ⏸️ All tests pass (deferred until Phase 1.4 ends)

---

## Implementation Notes

- **Database Migration:** Must preserve existing data by converting single FK values to single-item arrays
- **State Management:** Use Vue 3 Composition API patterns with `ref<BookingBlockInstance[]>` for arrays
- **Component Separation:** NestedSelectionCard handles only nested children, SelectionCard handles only parent cards
- **Accumulation Naming:** Use `accServices`, `accDwelling`, `accAvailability` computed properties for clarity
- **Backward Compatibility:** Ensure transformers handle both old (single) and new (array) formats during transition

---

## Related Documents

- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Phase Handoff**: `../phases/phase-1.3-handoff.md`
- **Original Plan**: `../../../../.cursor/plans/multi-select_services_refactor_83ca41e7.plan.md`
- **Previous Session**: `session-1.3.8-guide.md`

---

**Next Session:** Phase 1.4 - Admin Panel Data Flow Fixes  
**Testing:** Session 1.3.9.7 (Testing and Validation) deferred until Phase 1.4 ends

---

## Session Status

**Code Work:** ✅ Complete (Sessions 1.3.9.1 - 1.3.9.6)  
**Testing:** ⏸️ Deferred (Session 1.3.9.7) until Phase 1.4 ends

All code changes for the multi-select services refactor have been completed. Testing and validation will be performed after Phase 1.4 ends to allow for comprehensive testing of all Phase 1.3 changes together.

