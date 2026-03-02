# Session 4.6 Guide: Generic Component System & Field System

**Purpose:** Session-level guide for creating generic reusable components and enhancing field system

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 4 - Vuexy Admin Panel Integration
**Session:** 4.6
**Status:** ✅ Completed (retroactively documented)

---

## Session Overview

**Session Number:** 4.6
**Session Name:** Generic Component System & Field System
**Description:** Create generic reusable components (EntityDialog, EntityCard, DynamicFormFields, GroupedEntityCard) and enhance field system for config-driven form generation. Replace entity-specific components with generic components that work for all entity types.

**Duration:** Estimated 6-8 hours
**Dependencies:** Sessions 4.1, 4.2, 4.3, 4.4, 4.5 complete

---

## Session Objectives

- Create generic EntityDialog component for all entity types
- Create generic EntityCard component for all entity types
- Create GroupedEntityCard component for expandable grouped display
- Create DynamicFormFields component for config-driven form generation
- Create useAdminConfig composable for reactive config access
- Enhance field system components with better integration
- Add NestedCollectionField for nested collections
- Update admin views to use generic components

---

## Key Deliverables

- EntityDialog.vue - Generic dialog component for all entity types
- EntityCard.vue - Generic card component for all entity types
- GroupedEntityCard.vue - Expandable grouped card wrapper
- DynamicFormFields.vue - Config-driven form field generator
- useAdminConfig.ts - Reactive admin config composable
- NestedCollectionField.vue - Nested collection field component
- Enhanced field components with better integration
- Updated admin views using generic components

---

## Detailed Task Breakdown

### Task 4.6.1: Create Generic EntityDialog Component

**File:** `client-vue/src/components/admin/generic/EntityDialog.vue`

**Steps:**
1. Create generic dialog component that accepts entityKey and optional entity
2. Support create mode (no entity) and edit mode (with entity)
3. Integrate with DynamicFormFields for form generation
4. Handle form validation using vee-validate
5. Integrate with useEntityCrud for create/update operations
6. Support initialValues prop for pre-populating form fields
7. Handle dialog visibility with v-model
8. Emit saved event after successful save

**Key Features:**
- Generic component works for all entity types (blockType, partType, blockProfile, partProfile)
- Uses DynamicFormFields for config-driven form generation
- Supports create and edit modes
- Handles form validation and error display
- Integrates with useEntityCrud composable
- Supports initialValues for pre-populating fields (e.g., partTypeRef from slot)

---

### Task 4.6.2: Create Generic EntityCard Component

**File:** `client-vue/src/components/admin/generic/EntityCard.vue`

**Steps:**
1. Create generic card component that accepts entityKey and entity
2. Display title field in card header
3. Integrate with DynamicFormFields for inline editing
4. Handle delete operations with confirmation dialog
5. Support expansion state (though parent VExpansionPanel handles visibility)
6. Integrate with useEntityCrud for update/delete operations
7. Use useAdminConfig to get titleField and formFieldConfig
8. Create FieldContext for title field editing

**Key Features:**
- Generic component works for all entity types
- Title field displayed in card header, editable inline
- Form fields rendered using DynamicFormFields
- Delete confirmation dialog
- Auto-save functionality for field changes
- Integrates with admin config for field configuration

---

### Task 4.6.3: Create GroupedEntityCard Component

**File:** `client-vue/src/components/admin/generic/GroupedEntityCard.vue`

**Steps:**
1. Create wrapper component for expandable grouped display
2. Use VExpansionPanel for collapsible cards
3. Display title field in collapsed panel header
4. Show EntityCard content when expanded
5. Support defaultExpanded prop for initial state
6. Support showDragHandle prop for drag-and-drop
7. Delegate CRUD operations to EntityCard

**Key Features:**
- Wraps EntityCard in VExpansionPanel
- Displays title field in collapsed state
- Supports drag handle for reordering
- Maintains expansion state
- Delegates all operations to EntityCard

---

### Task 4.6.4: Create DynamicFormFields Component

**File:** `client-vue/src/components/admin/generic/DynamicFormFields.vue`

**Steps:**
1. Create component that generates form fields from admin configs
2. Get formFieldConfig for entity type
3. Get instanceConfig to determine field layout (inline, stacked, omitted)
4. Filter out omitted fields
5. Group fields by layout (inline, stacked, regular)
6. Create FieldContext for each field dynamically
7. Render InputRenderer (formerly FieldRenderer) for each field
8. Handle field context readiness timing (async context creation)
9. Support modalMode prop for conditional field visibility
10. Support additionalOmittedFields prop for parent control

**Key Features:**
- Config-driven field generation
- Supports inline, stacked, and regular field layouts
- Handles async field context creation
- Filters omitted fields based on config
- Supports conditional field visibility (modalMode)
- Uses Vuetify responsive grid for inline fields

---

### Task 4.6.5: Create useAdminConfig Composable

**File:** `client-vue/src/composables/useAdminConfig.ts`

**Steps:**
1. Create composable for reactive admin config access
2. Cache computed refs to avoid duplicate computeds
3. Provide getFormFieldConfig() method
4. Provide getDisplayFieldConfig() method
5. Provide getInstanceConfig() method
6. Cache config reference to prevent excessive calls
7. Support rebuildConfig() for dynamic property updates

**Key Features:**
- Reactive access to admin configuration
- Cached computed refs for performance
- Methods for form field config, display field config, and instance config
- Config caching to prevent excessive calls
- Support for rebuilding config after PROPERTY_KEYS loaded

---

### Task 4.6.6: Enhance Field System Components

**Files:**
- `client-vue/src/composables/useFieldContext.ts`
- `client-vue/src/components/admin/generic/fields/InputRenderer.vue` (formerly FieldRenderer.vue)
- `client-vue/src/components/admin/generic/fields/BooleanInputField.vue`
- `client-vue/src/components/admin/generic/fields/TextInputField.vue`
- `client-vue/src/components/admin/generic/fields/SelectFields.vue`
- `client-vue/src/components/admin/generic/fields/PrimitiveFields.vue`

**Steps:**
1. Enhance useFieldContext with better integration
2. Update InputRenderer (formerly FieldRenderer) to handle all field types
3. Improve field components with better type safety
4. Add validation and error handling
5. Improve integration with vee-validate
6. Add support for nested collections

**Key Enhancements:**
- Better type safety in field components
- Improved validation and error handling
- Better integration with vee-validate
- Support for nested collections
- Enhanced field context management

---

### Task 4.6.7: Create NestedCollectionField Component

**File:** `client-vue/src/components/admin/generic/fields/NestedCollectionField.vue`

**Steps:**
1. Create field component for nested collections
2. Integrate with NestedCollection component
3. Handle collection item CRUD operations
4. Support relationship management
5. Handle validation and error display

**Key Features:**
- Field component for nested collections
- Integrates with NestedCollection component
- Handles item CRUD operations
- Supports relationship management
- Validation and error handling

---

### Task 4.6.8: Update Admin Views to Use Generic Components

**Files:**
- `client-vue/src/views/admin/tabs/TypesTab.vue`
- `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Steps:**
1. Replace entity-specific dialogs with EntityDialog
2. Replace entity-specific cards with EntityCard
3. Update to use generic components
4. Test all CRUD operations work correctly
5. Verify form generation works for all entity types

**Key Updates:**
- TypesTab uses EntityDialog for BlockType and PartType
- ProfilesTab uses EntityDialog for BlockProfile and PartProfile
- All cards use EntityCard or GroupedEntityCard
- Generic components handle all entity types

---

## Architecture Notes

### Generic Component Pattern

**Why:** Reduces code duplication, improves maintainability, ensures consistent behavior
**Pattern:** Generic components accept entityKey and entity props, use configs for behavior
**Benefit:** Single component handles all entity types, easier to update and maintain

### Config-Driven Form Generation

**Why:** Ensures all fields from PROPERTY_KEYS are included, reduces hardcoding
**Pattern:** DynamicFormFields iterates over formFieldConfig to render fields
**Benefit:** Adding new fields doesn't require component changes, consistent field rendering

### Field Context System

**Why:** Provides isolated field state and validation, enables auto-save
**Pattern:** Each field has its own FieldContext with form integration
**Benefit:** Fields are independent, can be auto-saved individually, better error handling

---

## Files Created

- `client-vue/src/components/admin/generic/EntityDialog.vue`
- `client-vue/src/components/admin/generic/EntityCard.vue`
- `client-vue/src/components/admin/generic/GroupedEntityCard.vue`
- `client-vue/src/components/admin/generic/DynamicFormFields.vue`
- `client-vue/src/components/admin/generic/fields/NestedCollectionField.vue`
- `client-vue/src/components/admin/generic/collections/NestedCollection.vue`
- `client-vue/src/composables/useAdminConfig.ts`

## Files Enhanced

- `client-vue/src/composables/useFieldContext.ts`
- `client-vue/src/components/admin/generic/fields/InputRenderer.vue` (formerly FieldRenderer.vue)
- `client-vue/src/components/admin/generic/fields/BooleanInputField.vue`
- `client-vue/src/components/admin/generic/fields/TextInputField.vue`
- `client-vue/src/components/admin/generic/fields/SelectFields.vue`
- `client-vue/src/components/admin/generic/fields/PrimitiveFields.vue`
- `client-vue/src/views/admin/tabs/TypesTab.vue`
- `client-vue/src/views/admin/tabs/ProfilesTab.vue`

---

## Success Criteria

- [x] EntityDialog works for all entity types
- [x] EntityCard works for all entity types
- [x] GroupedEntityCard provides expandable display
- [x] DynamicFormFields generates fields from configs
- [x] useAdminConfig provides reactive config access
- [x] Field system components enhanced
- [x] NestedCollectionField works correctly
- [x] Admin views updated to use generic components
- [x] All CRUD operations work with generic components
- [x] Form generation works for all entity types

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-4-guide.md`
- Session 4.5 Guide: `project-manager/features/vue-migration/sessions/session-4.5-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
