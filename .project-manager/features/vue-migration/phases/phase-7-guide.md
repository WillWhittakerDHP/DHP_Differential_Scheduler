# Phase 7 Guide

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 2 - High-Level)

---

## Phase Overview

**Phase Number:** 7
**Phase Name:** Booking Wizard Logic Integration
**Description:** Connect the static UI shell to real data and integrate scheduler logic from React codebase. Replace hardcoded data with real data from backend, add state management, integrate cascading selections, user-specific descriptions, and icon display. Focus on UI behaviors and data connections before time calculations.

**Duration:** Estimated 10 sessions
**Status:** Not Started

---

## Phase Objectives

- Create composable for booking wizard state management
- Implement cascading selection system (User Type → Base Service → Additional Services → Availability Options)
- Connect to React scheduler logic in `client/src/scheduler/`
- Replace hardcoded data with real backend data
- Integrate scheduler transformers and utilities
- Implement shared/reusable Description entity with through-table pattern
- Display icons from database with admin portal editing
- Display user-specific descriptions based on selected user type
- Ensure responsive layout and proper element arrangement
- Add form validation and error handling
- Connect to API endpoints for data fetching

---

## Key Deliverables

- useBookingWizard composable with proper state management
- Cascading selection logic working (user → base service → additional services → availability)
- Icon integration from database with admin portal editing
- Description entity and BlockProfileDescription through-table for shared descriptions
- Description CRUD in admin portal with relationship management
- User-specific description display in wizard
- Real data connections for all wizard steps
- Responsive layout and proper element arrangement
- Form validation and error handling
- API integration for service types, property types, availability

---

## Key Activities

- **Create State Management:** Build useBookingWizard composable
- **Implement Cascading Selections:** Connect user → base service → additional services → availability
- **Integrate Icons:** Display icons from database with mapping utility
- **Create Description System:** Build Description entity and through-table for shared descriptions
- **Integrate Scheduler Logic:** Connect to React scheduler codebase
- **Replace Hardcoded Data:** Connect all steps to real backend data
- **Add Validation:** Implement form validation and error handling
- **Connect APIs:** Integrate API endpoints for all data needs
- **Integrate Transformers:** Port scheduler transformers and utilities
- **Responsive Layout:** Ensure proper element arrangement and responsive design

---

## Sessions Breakdown

- [ ] ### Session 7.1: Booking Wizard State Management
**Description:** Create composable for wizard state and integrate scheduler data
**Tasks:** 
- Create `useBookingWizard.ts` composable with selected user type, base service, additional services, availability options
- Integrate `useBooking` to get scheduler entities
- Add computed properties for filtered options based on selections
- Test state management independently

**Files:**
- `client-vue/src/composables/useBookingWizard.ts` (new)

- [ ] ### Session 7.2: Cascading Selection Logic
**Description:** Implement cascading filter logic in ServiceSelectionStep
**Tasks:**
- Update `ServiceSelectionStep` to use `useBookingWizard`
- Implement User Type selection → filter Base Services via `activeBlockIds`
- Implement Base Service selection → filter Additional Services via `activeBlockIds`
- Implement Additional Services multi-select
- Add visual feedback for disabled/empty states
- Test cascading behavior

**Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` (update)

- [ ] ### Session 7.3: Icon Integration
**Description:** Display icons from database in wizard
**Tasks:**
- Create `iconMapper.ts` utility to map database icon strings to Vuetify icons
- Update `ServiceSelectionStep` to display icons from `SchedulerBlockProfile.icon`
- Handle icon mapping edge cases (null, unknown icons)
- Verify admin portal icon editing works
- Test icon display in wizard

**Files:**
- `client-vue/src/utils/iconMapper.ts` (new)
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` (update)

- [ ] ### Session 7.4: User-Specific Descriptions - Database Schema & Models
**Description:** Create Description entity and BlockProfileDescription through-table for shared, reusable descriptions
**Tasks:**
- Create `Description` model with id, text, userType (optional), createdAt/updatedAt
- Create `BlockProfileDescription` through-table model with block_profile_id, description_id, userType (optional), orderIndex, isDefault (optional)
- Add Sequelize associations (`BlockProfile.belongsToMany(Description, { through: BlockProfileDescription })`)
- Create migration to create `descriptions` and `block_profile_descriptions` tables
- Create seed data for example descriptions
- Update entity constants to include `'description'` entity key
- Update relationship constants to include descriptions relationship
- Test database changes and associations

**Files:**
- `server/src/db/models/scheduler/description.ts` (new)
- `server/src/db/models/scheduler/block_profile_description.ts` (new)
- `server/src/db/models/index.ts` (update associations)
- `server/src/db/migrations/XXXX-create-descriptions-system.ts` (new)
- `server/src/db/seedScripts/schedulerSeeds/description_seeds.json` (new)
- `client/src/global/constants/entityConstants.ts` (add description entity)
- `client/src/global/constants/relationshipConstants.ts` (add descriptions relationship)

- [ ] ### Session 7.5: User-Specific Descriptions - API Types & Transformers
**Description:** Update API types and transformers to include Description entity and relationships
**Tasks:**
- Add `DescriptionEntity` type to `globalEntityTypes.ts`
- Update `BlockProfileEntity` to include `descriptions: string[]` (description IDs via relationship)
- Update `globalToBookingTransformer` to include descriptions array on `SchedulerBlockProfile`
- Update Vue transformer to match React transformer changes
- Filter descriptions by `userType` when transforming for scheduler
- Test transformer output includes descriptions correctly

**Files:**
- `client/src/global/types/globalEntityTypes.ts` (add DescriptionEntity)
- `client/src/scheduler/dataTransformation/globalToBookingTransformer.ts` (update)
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` (update)

- [ ] ### Session 7.6: User-Specific Descriptions - Admin Portal
**Description:** Enable CRUD operations for Description entity and relationship management in admin portal
**Tasks:**
- Add Description entity to admin portal (new entity type with CRUD)
- Add descriptions relationship field to BlockProfile form (multi-select)
- Create Description select component that shows description text in dropdown
- Allow creating new descriptions from BlockProfile form
- Allow selecting existing descriptions from dropdown
- Test Description CRUD operations
- Test BlockProfile description relationship management

**Files:**
- `client/src/admin/configs/instanceConfig.ts` (add description entity config)
- `client/src/admin/configs/instanceConfig.ts` (add descriptions relationship field to blockProfile)
- `client/src/admin/components/generic/fields/selectFields.tsx` (verify multi-select works)
- Verify: `client/src/admin/hooks/useRelationship.ts` (should handle new relationship)

- [ ] ### Session 7.7: User-Specific Descriptions - Wizard Display
**Description:** Display correct descriptions in wizard based on selected user type
**Tasks:**
- Update `ServiceSelectionStep` to read descriptions from `SchedulerBlockProfile.descriptions` array
- Implement logic to filter descriptions by selected user type
- Handle multiple descriptions per BlockProfile (display all matching user type)
- Add fallback to generic `description` field if no descriptions in relationship
- Test description display for all user types (buyer, agent, owner)
- Test description display when multiple descriptions exist

**Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` (update)

- [ ] ### Session 7.8: Page Layout & Responsive Design
**Description:** Arrange elements properly and ensure responsive layout after data integration is complete
**Tasks:**
- Review and adjust spacing in `ServiceSelectionStep`
- Ensure proper element visibility based on selections
- Test responsive behavior (mobile, tablet, desktop)
- Verify visual hierarchy and flow
- Update `AvailabilityStep` layout if needed
- Ensure descriptions display properly at all screen sizes

**Files:**
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue` (update)
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` (update)

- [ ] ### Session 7.9: Availability Options Integration
**Description:** Connect availability options to cascading selection system
**Tasks:**
- Update `AvailabilityStep` to use `useBookingWizard` for availability options
- Filter availability options based on selected services
- Display availability options with proper layout
- Test availability selection flow

**Files:**
- `client-vue/src/components/booking/steps/AvailabilityStep.vue` (update)

- [ ] ### Session 7.10: Entity Pooling System
**Description:** Implement configurable pooling system where entities can pool other entities of the same type, creating aggregated/composite entities. Pool masters are computed views that aggregate properties from pool members at query time. Supports hierarchical pooling where pool members can themselves be pool masters.

**Tasks:**
- **Backend Foundation:**
  - Create `PooledInstance` model (through table) with `pool_master_id`, `pool_member_id`, `entity_type`, `order_index`, `disabled`
  - Add pooling config to `EntityConfig` in entity registry (`PoolingConfig` with aggregation rules)
  - Create pooled instances API routes (`/api/pooled-instances`) with CRUD operations
  - Add validation to prevent circular references and ensure same entity type
- **Frontend Types & Constants:**
  - Create pooling types (`FetchedPooledInstance`, `PooledInstance`, `PoolingConfig`, `DistributionStrategy`)
  - Add pooling constants (relationship keys, aggregation strategies, distribution strategies)
  - Extend entity types to include `pooledMembers?: GlobalEntityId[]` and `isPoolMaster?: boolean`
- **Data Fetching & Transformation:**
  - Update global transformer to fetch and transform pooled instances
  - Create pooling aggregator (`poolingAggregator.ts`) with aggregation strategies (sum, merge, first, every, custom)
  - Implement recursive pool member resolution for hierarchical pooling
  - Add `pooledInstances` to `GlobalData` type
- **Composables & CRUD:**
  - Create `usePooledEntity` composable with methods for pool management
  - Add pooling methods to `useEntity` composable
  - Implement computed aggregated entity retrieval (always recalculates from members)
  - Add Vue Query caching with invalidation on pool membership changes
- **UI Components:**
  - Create `MasterChangeDistributionModal` component for distributing master changes to members
  - Support distribution strategies: proportional, equal, manual per-member
  - Show preview of how changes will be distributed
- **Integration:**
  - Update admin transformer to handle pooled entities
  - Update scheduler transformer to aggregate part profiles from pooled block profiles
  - Configure `blockProfile` entity with pooling enabled and aggregation rules

**Files:**
- `server/src/db/models/scheduler/pooled_instance.ts` (new)
- `server/src/db/models/index.ts` (update)
- `server/src/config/entityRegistry.ts` (update - add pooling config)
- `server/src/routes/internal/pooledInstances/pooledInstanceRouter.ts` (new)
- `server/src/routes/internal/index.ts` (update - register routes)
- `client-vue/src/types/pooling.ts` (new)
- `client-vue/src/constants/pooling.ts` (new)
- `client-vue/src/types/entities.ts` (update - add pooling fields)
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts` (update)
- `client-vue/src/utils/transformers/poolingAggregator.ts` (new)
- `client-vue/src/composables/usePooledEntity.ts` (new)
- `client-vue/src/composables/useEntity.ts` (update - add pool methods)
- `client-vue/src/components/admin/pooling/MasterChangeDistributionModal.vue` (new)
- `client-vue/src/utils/transformers/globalToAdminTransformer.ts` (update if needed)
- `client/src/scheduler/dataTransformation/globalToBookingTransformer.ts` (update if needed)

**Key Architecture Decisions:**
- **Computed Masters**: Pool masters are computed views that aggregate properties from pool members (no stored totals)
- **Bidirectional Changes**: Member → Master changes automatically update master's computed values (computed at query time). Master → Member changes trigger distribution modal to select strategy.
- **Aggregation Strategies**: sum (fees/times), merge (arrays), first (name), every (booleans), custom (entity-specific)
- **Hierarchical Pooling**: Supports recursive aggregation where pool members can themselves be pool masters
- **Part Profile Aggregation**: When pooling block profiles, aggregate all part profiles from all pooled blocks

---

## Dependencies

**Prerequisites:**
- Phase 1 complete (data layer, transformers)
- Phase 2 complete (state management)
- Phase 3 complete (data flow foundation verified)
- Phase 4 complete (Vuexy admin integration)
- Phase 5 complete (React cleanup and removal)
- Phase 6 complete (static UI shell)
- React scheduler logic available in `client/src/scheduler/`

**Downstream Impact:**
- Completes core Vue migration
- Enables production use of booking wizard
- Enables Phase 5 (React cleanup) after verification

---

## Success Criteria

- [ ] Booking wizard state management working
- [ ] Cascading selections work correctly (each selection filters next level)
- [ ] Icons display correctly from database
- [ ] Icons are editable in admin portal
- [ ] Descriptions change based on selected user type
- [ ] User-specific descriptions are editable in admin portal (shared/reusable)
- [ ] Page layout is responsive and properly arranged
- [ ] Elements show/hide appropriately based on selections
- [ ] All hardcoded data replaced with real data
- [ ] Scheduler logic integrated from React codebase
- [ ] All wizard steps functional with real data
- [ ] Form validation working
- [ ] API connections established
- [ ] All selections persist in wizard state
- [ ] Entity pooling system functional with computed masters
- [ ] Pool members can be added/removed from pools
- [ ] Master changes distribute to members via modal
- [ ] Hierarchical pooling works correctly
- [ ] Part profiles aggregate correctly from pooled block profiles

---

## Notes

This phase focuses on connecting the static UI shell built in Phase 6 to real data and logic. The goal is to integrate existing React scheduler logic while maintaining the beautiful UI from Phase 6. This phase specifically focuses on UI behaviors and data connections - time calculations and fee logic will be handled in a future phase.

**Key Principles:**
- **Reuse React Logic:** Port existing scheduler logic rather than rebuilding
- **Maintain UI:** Keep the beautiful UI from Phase 6 intact
- **Type Safety:** Ensure all data connections are properly typed
- **Error Handling:** Add comprehensive error handling and validation
- **Testing:** Test each step thoroughly before moving to next
- **Shared Resources:** Use Description entity pattern for shared/reusable content
- **Responsive First:** Ensure layout works at all screen sizes

**Architecture Decisions:**
- **Description System:** Using Description entity + BlockProfileDescription through-table pattern for shared/reusable descriptions that can be updated once and affect all BlockProfiles using them
- **Cascading Selections:** Using `activeBlockIds` from `SchedulerBlockProfile` to filter children, matching React `ListMaker` component pattern
- **Icon Mapping:** Creating utility to map database icon strings (Ant Design names) to Vuetify/Tabler icons

**Integration Points:**
- `client/src/scheduler/contexts/schedulerContext.tsx` - Scheduler state management
- `client/src/scheduler/dataTransformation/globalToBookingTransformer.ts` - Data transformers
- `client/src/scheduler/components/listMaker.tsx` - Cascading selection logic reference
- `client-vue/src/composables/useBooking.ts` - Vue scheduler composable
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` - Vue transformer

**Database Changes:**
- New Description entity and BlockProfileDescription through-table (Session 7.4)
- New PooledInstance through-table for entity pooling (Session 7.10)

**Future Considerations:**
- Time calculations and fee logic will be handled in a future phase
- May need to handle relationships differently than React version
- May need to refactor some logic for better Vue patterns
- Consider creating Vue-specific utilities if React patterns don't translate well

---

## Related Documents

- Phase Log: `.cursor/project-manager/features/vue-migration/phases/phase-7-log.md` (to be created)
- Phase Handoff: `.cursor/project-manager/features/vue-migration/phases/phase-7-handoff.md` (to be created)
- Session Guides: `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-guide.md`
- React Scheduler Reference: `client/src/scheduler/`


