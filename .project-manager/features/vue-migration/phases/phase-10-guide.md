# Phase 10 Guide

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 2 - High-Level)

---

## Phase Overview

**Phase Number:** 10
**Phase Name:** Property Management System
**Description:** Build a simple, integrated property management system for BlockShapes and PartShapes, allowing dynamic property definition and assignment without the complexity of the previous system. Properties are managed directly within the Shapes tab, providing a streamlined interface for defining entity structure.

**Duration:** Estimated 5 sessions
**Status:** Not Started

---

## Phase Objectives

- Create database models for PropertyDefinition and EntityPropertyMapping
- Build API endpoints for property CRUD operations
- Create frontend types and composables for property management
- Integrate property management UI into ShapesTab
- Enable dynamic property assignment to BlockShapes and PartShapes
- Support property ordering and configuration per entity type
- Keep the system simple and intuitive (avoid complexity of previous system)

---

## Key Deliverables

- PropertyDefinition database model and migrations
- EntityPropertyMapping database model and migrations
- Property CRUD API endpoints
- Frontend property types and composables
- Property management UI integrated into ShapesTab
- Property assignment interface for shapes
- Simple property creation dialog
- Property ordering and configuration system

---

## Key Activities

- **Database Foundation:** Create PropertyDefinition and EntityPropertyMapping models
- **API Layer:** Build CRUD endpoints for properties and mappings
- **Frontend Types:** Define TypeScript types for property system
- **Composables:** Create Vue composables for property operations
- **UI Integration:** Add property management to ShapesTab
- **Testing & Validation:** Test property assignment and form generation

---

## Sessions Breakdown

- [ ] ### Session 10.1: Database Models & Schema
**Description:** Create PropertyDefinition and EntityPropertyMapping database models with proper relationships and constraints
**Tasks:** 
- Create PropertyDefinition model (name, display_name, data_type, backend_field_name, default_value, validation_rules, is_required, is_system_property, description)
- Create EntityPropertyMapping model (entity_key, property_name, is_active, order_index, entity_specific_config)
- Create migrations for both tables
- Add Sequelize associations
- Create seed data from existing property_definition_seeds.json and entity_property_mapping_seeds.json
- Test database changes

**Files:**
- `server/src/db/models/property/property_definition.ts` (new)
- `server/src/db/models/property/entity_property_mapping.ts` (new)
- `server/src/db/models/index.ts` (update - add property models)
- `server/src/db/migrations/XXXX-create-property-definitions.ts` (new)
- `server/src/db/migrations/XXXX-create-entity-property-mappings.ts` (new)
- `server/src/db/seedScripts/adminSeeds/property_definition_seeds.json` (update if needed)
- `server/src/db/seedScripts/adminSeeds/entity_property_mapping_seeds.json` (update if needed)

**Learning Goals:**
- Sequelize model creation patterns
- Database migration best practices
- Many-to-many relationship patterns
- Seed data structure and execution

- [ ] ### Session 10.2: API Endpoints
**Description:** Create CRUD API endpoints for PropertyDefinition and EntityPropertyMapping
**Tasks:**
- Create PropertyDefinition router with GET, POST, PUT, PATCH, DELETE endpoints
- Create EntityPropertyMapping router with GET, POST, PUT, PATCH, DELETE endpoints
- Add endpoints for fetching properties by entity type
- Add endpoints for bulk operations (assign multiple properties to entity)
- Add validation for property definitions (data type validation, field name validation)
- Register routes in main router
- Test all endpoints

**Files:**
- `server/src/routes/internal/properties/propertyDefinitionRouter.ts` (new)
- `server/src/routes/internal/properties/entityPropertyMappingRouter.ts` (new)
- `server/src/routes/internal/index.ts` (update - register property routes)

**Learning Goals:**
- Express router patterns
- RESTful API design
- Request validation
- Error handling patterns

- [ ] ### Session 10.3: Frontend Types & Composables
**Description:** Create TypeScript types and Vue composables for property management
**Tasks:**
- Create PropertyDefinition type interface
- Create EntityPropertyMapping type interface
- Create property-related constants (data types, validation rule types)
- Create usePropertyDefinition composable (CRUD operations)
- Create useEntityPropertyMapping composable (assignment operations)
- Integrate with existing useEntity composable
- Add Vue Query caching for properties
- Test composables independently

**Files:**
- `client-vue/src/types/properties.ts` (new)
- `client-vue/src/constants/properties.ts` (new)
- `client-vue/src/composables/usePropertyDefinition.ts` (new)
- `client-vue/src/composables/useEntityPropertyMapping.ts` (new)
- `client-vue/src/composables/useEntity.ts` (update - add property methods if needed)

**Learning Goals:**
- TypeScript type design patterns
- Vue composable patterns
- Vue Query integration
- Type-safe API client usage

- [ ] ### Session 10.4: UI Components - Property Management in ShapesTab
**Description:** Add property management UI to ShapesTab, integrated into BlockShape and PartShape cards
**Tasks:**
- Add "Properties" section to BlockShapeCard component
- Add "Properties" section to PartShapeCard component
- Create PropertyList component (displays assigned properties with ordering)
- Create PropertyAssignmentDialog component (assign existing or create new properties)
- Create PropertyDefinitionDialog component (create/edit property definitions)
- Add drag-and-drop for property ordering
- Add toggle for active/inactive properties
- Integrate with usePropertyDefinition and useEntityPropertyMapping composables
- Test property assignment flow

**Files:**
- `client-vue/src/views/admin/components/BlockShapeCard.vue` (update - add properties section)
- `client-vue/src/views/admin/components/PartShapeCard.vue` (update - add properties section)
- `client-vue/src/components/admin/properties/PropertyList.vue` (new)
- `client-vue/src/components/admin/properties/PropertyAssignmentDialog.vue` (new)
- `client-vue/src/components/admin/properties/PropertyDefinitionDialog.vue` (new)
- `client-vue/src/views/admin/tabs/ShapesTab.vue` (update - ensure properties are visible)

**Learning Goals:**
- Component composition patterns
- Dialog/modal patterns in Vuetify
- Drag-and-drop integration
- Form handling with property definitions

- [ ] ### Session 10.5: Integration & Testing
**Description:** Connect property system to entity forms and verify end-to-end functionality
**Tasks:**
- Verify property definitions appear in entity forms
- Test property assignment to BlockShapes
- Test property assignment to PartShapes
- Verify property ordering affects form field order
- Test property creation from shapes tab
- Test property editing and deletion
- Verify inactive properties are hidden from forms
- Test system property protection (can't delete system properties)
- End-to-end testing of property management workflow
- Update documentation

**Files:**
- `client-vue/src/components/admin/generic/EntityCard.vue` (verify property integration)
- `client-vue/src/composables/useFieldContext.ts` (verify property-based field generation)
- Test files and documentation updates

**Learning Goals:**
- Integration testing patterns
- End-to-end workflow validation
- System property protection patterns
- Documentation best practices

---

## Dependencies

**Prerequisites:**
- Phase 1 complete (data layer, transformers)
- Phase 2 complete (state management)
- Phase 3 complete (data flow foundation verified)
- Phase 4 complete (Vuexy admin integration)
- Phase 5 complete (React cleanup and removal)
- Phase 6 complete (admin panel structure - ShapesTab exists)
- Existing property seed data available

**Downstream Impact:**
- Enables dynamic property management without code changes
- Simplifies adding new properties to entities
- Foundation for future property-based features
- Reduces need for manual property definition in code

---

## Success Criteria

- [ ] PropertyDefinition model created and seeded
- [ ] EntityPropertyMapping model created and seeded
- [ ] All API endpoints working (CRUD operations)
- [ ] Property management UI integrated into ShapesTab
- [ ] Properties can be assigned to BlockShapes
- [ ] Properties can be assigned to PartShapes
- [ ] Property ordering works via drag-and-drop
- [ ] Properties can be created from shapes tab
- [ ] Properties can be edited and deleted (non-system properties)
- [ ] Property assignments affect entity forms
- [ ] System properties are protected from deletion
- [ ] End-to-end workflow tested and working

---

## Notes

This phase focuses on building a simple, integrated property management system. The goal is to avoid the complexity of the previous system while providing essential functionality:

**Key Principles:**
- **Simplicity First:** Keep the system simple and intuitive
- **Integrated:** Properties managed where shapes are managed (ShapesTab)
- **Flexible:** Support different data types and validation rules
- **Ordered:** Properties can be reordered per entity type
- **Protected:** System properties cannot be deleted

**Architecture Decisions:**
- **PropertyDefinition:** Centralized property definitions (reusable across entity types)
- **EntityPropertyMapping:** Many-to-many relationship between entities and properties
- **Order Index:** Properties can be ordered per entity type via order_index
- **Active Flag:** Properties can be temporarily disabled without deletion
- **System Properties:** Core properties (name, orderIndex, disabled) are protected

**Integration Points:**
- `client-vue/src/views/admin/tabs/ShapesTab.vue` - Main integration point
- `client-vue/src/components/admin/generic/EntityCard.vue` - Property display in forms
- `client-vue/src/composables/useFieldContext.ts` - Property-based field generation
- `server/src/routes/internal/properties/` - API endpoints

**Database Changes:**
- New `property_definitions` table
- New `entity_property_mappings` table
- Migrations for both tables

**Future Considerations:**
- May need property validation rules UI (advanced)
- May need property inheritance system (future enhancement)
- May need property templates (future enhancement)
- Consider property versioning if needed

---

## Related Documents

- Phase Handoff: `project-manager/features/vue-migration/phases/phase-10-handoff.md` (to be created)
- Session Guides: `project-manager/features/vue-migration/sessions/session-10.[X]-guide.md` (to be created)
- Property Seed Data: `server/src/db/seedScripts/adminSeeds/property_definition_seeds.json`
- Entity Mapping Seed Data: `server/src/db/seedScripts/adminSeeds/entity_property_mapping_seeds.json`

