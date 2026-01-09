<!--
  LEARNING: Generic Entity Card Component
  WHY: Reusable card component for all entity types (blockShape, partShape, blockInstance, partInstance)
  PATTERN: Generic component that accepts entityKey and entity, handles all CRUD operations
  COMPARISON: React uses GenericInstance. Vue uses EntityCard with DynamicFormFields.
  BENEFITS: DRY, configurable, testable, easier to maintain
-->
<script setup lang="ts">
import { ref, computed, provide, watch, type Ref } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import { useEntityCardActions } from '@/composables/admin/useEntityCardActions'
import { useEntityDisplay } from '@/composables/admin/useEntityDisplay'
import { useEntityStatus } from '@/composables/admin/useEntityStatus'
import { useFieldVisibility } from '@/composables/admin/useFieldVisibility'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/useAdmin'
import { useFormFields } from '@/composables/formFields/useFormFields'
import { useEntityCrud } from '@/composables/useEntity'
import type { GlobalEntity, GlobalEntityId } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import InputRenderer from './fields/InputRenderer.vue'
import EntityCardSubPanels from './EntityCardSubPanels.vue'
import { categorizeFieldsBySection, type StatusButtonField, warnUnconfiguredBooleanFields } from '@/utils/forms/fieldSectionCategorization'
import { ENTITY_CARD_SAVE_KEY } from './entityCardConstants'
import { isDevModeEnabled } from '@/utils/env/devMode'

/**
 * LEARNING: Disable automatic attribute inheritance
 * WHY: Component has multiple root nodes (div and VDialog), so Vue can't automatically inherit attributes
 *      Since we explicitly declare all props, we don't need automatic inheritance
 * PATTERN: Set inheritAttrs to false to suppress warnings about non-prop attributes
 */
defineOptions({
  inheritAttrs: false
})

/**
 * LEARNING: Generic props interface that works for all entity types
 * WHY: Type-safe prop definition that accepts any entity type
 * PATTERN: Generic component with entityKey and entity props
 */
interface Props<GE extends GlobalEntityKey> {
  entityKey: GE
  /**
   * LEARNING: Entity can be existing entity OR initial values for new entity
   * WHY: Unified component for both create and edit operations
   * PATTERN: When isNew=true, entity contains initial values; when isNew=false, entity is existing entity
   */
  entity: GlobalEntity<GE>
  /**
   * LEARNING: Expanded state prop
   * WHY: Controls whether the card is expanded, which determines if titleField is editable
   * PATTERN: Optional prop defaults to true for backward compatibility (standalone cards are always expanded)
   */
  expanded?: boolean
  /**
   * LEARNING: Hide title field prop
   * WHY: When true, hides the titleField section (used when titleField is rendered in parent component like VExpansionPanels)
   * PATTERN: Optional prop defaults to false - titleField is shown by default
   */
  hideTitleField?: boolean
  /**
   * LEARNING: Optional form instance prop
   * WHY: Allows parent component (like VExpansionPanels) to provide a shared form instance for titleField synchronization
   * PATTERN: Optional prop - if not provided, EntityCard creates its own form instance
   */
  form?: ReturnType<typeof useForm>
  /**
   * LEARNING: New entity mode flag
   * WHY: When true, this card is for creating a new entity (not editing existing)
   * PATTERN: Changes Save behavior to create, shows Cancel instead of Delete
   */
  isNew?: boolean
}

const props = withDefaults(defineProps<Props<GlobalEntityKey>>(), {
  expanded: true,
  hideTitleField: false,
  isNew: false
})

/**
 * LEARNING: Component emits for parent communication
 * WHY: Allows parent component to handle delete, save, and cancel actions
 * PATTERN: defineEmits with TypeScript interface
 */
interface Emits {
  (e: 'delete', id: string): void
  (e: 'saved', entity: GlobalEntity<GlobalEntityKey>): void
  (e: 'cancelled'): void
}

const emit = defineEmits<Emits>()


/**
 * LEARNING: Expansion state - computed from expanded prop
 * WHY: Title field should be read-only when collapsed, editable when expanded
 * PATTERN: Use computed property that reads from expanded prop (defaults to true for backward compatibility)
 * NOTE: When used in VExpansionPanels, parent passes expansion state. When standalone, defaults to expanded.
 */
const isExpanded = computed(() => props.expanded ?? true)

/**
 * LEARNING: Use entity display composable for display name and messages
 * WHY: Moves display logic out of component into reusable composable
 * PATTERN: Composable handles entity name, success message, and delete title
 */
const entityDisplayComposable = useEntityDisplay()
const {
  getEntityName: getEntityNameFromComposable,
  getEntityDeleteTitle
} = entityDisplayComposable

/**
 * LEARNING: Use entity status composable for component status checks
 * WHY: Moves component status logic out of component into reusable composable
 * PATTERN: Composable handles composer, component, and composable detection
 */
void useEntityStatus({
  entityKey: props.entityKey,
  entity: computed(() => props.entity)
})
// NOTE: Entity status composable is initialized for potential future use (component badges, etc.)
// The destructured values are intentionally not used in the current UI

// NOTE: useAnnotationDisplay composable removed - annotation chips no longer displayed in card header
// Annotations are shown in the Annotations sub-panel instead

const adminConfig = useAdminConfig()
const admin = useAdmin()

/**
 * LEARNING: Get entity from store with relationships attached
 * WHY: Store entity has relationships attached via adminTransformer, props.entity might not
 * PATTERN: Use store entity (with relationships) as source of truth for form initialization
 */
const storeEntity = computed(() => {
  if (props.isNew) {
    return props.entity
  }
  const storeEntityValue = admin.getEntity(props.entityKey, props.entity.id)
  return storeEntityValue || props.entity
})

/**
 * LEARNING: Vee-Validate form instance
 * WHY: DynamicFormFields needs form instance for field validation and management
 *      Title field also needs form instance for editing
 * PATTERN: Use provided form instance or create new one, initialize with entity values BEFORE fields are created
 * FIX: Initialize form with entity from store (has relationships) instead of props.entity
 * NOTE: Must be defined before titleFieldContext watch that uses it
 */
const form = props.form || useForm({
  // LEARNING: Initialize form with entity from store to ensure relationships are attached
  // WHY: Store entity has relationships attached via adminTransformer, props.entity might not
  // PATTERN: Get entity from store (useAdmin().getEntity()) instead of props.entity
  // NOTE: useForm initializes form.values synchronously, so form.values will be available immediately
  initialValues: {
    ...storeEntity.value,
  }
})

/**
 * LEARNING: Sync form values when store entity updates
 * WHY: If store entity updates (e.g., relationships load), form should reflect that
 * PATTERN: Use resetForm instead of setValues to properly reset field initial values
 * NOTE: Only sync for existing entities (not new ones), and only if form wasn't provided by parent
 */
if (!props.form && !props.isNew) {
  watch(storeEntity, (newStoreEntity, oldStoreEntity) => {
    if (newStoreEntity && oldStoreEntity && newStoreEntity !== oldStoreEntity) {
      // Use resetForm to properly reset all fields and their initial values
      // This ensures fields that were initialized with wrong values get updated
      form.resetForm({
        values: {
          ...newStoreEntity,
        }
      })
    }
  }, { immediate: false })
}
const instanceConfig = computed(() => adminConfig.getInstanceConfig(props.entityKey).value || {})
const additionalOmittedFields: GlobalFieldKey<GlobalEntityKey>[] =
  props.entityKey === 'blockInstance' ? ['blockShapeRef'] : []

const fieldVisibility = useFieldVisibility({
  entityKey: props.entityKey,
  entityId: computed(() => props.entity.id),
  modalMode: false,
  additionalOmittedFields
})
const { visibleFields, inlineFieldsConfig, stackedFieldsConfig, omittedFields } = fieldVisibility

/**
 * LEARNING: Create field contexts directly in EntityCard using useFormFields
 * WHY: Previously delegated to EntityFormContent, but that caused timing issues
 *      (template tried to render fields before EntityFormContent mounted)
 * PATTERN: Create field contexts at the same level where they're used
 * FIX: This eliminates the "Cannot read properties of undefined (reading 'fieldKey')" error
 */
const formFields = useFormFields({
  entityKey: props.entityKey,
  entityId: computed(() => props.entity.id),
  form: ref<FormContext | undefined>(form as unknown as FormContext | undefined) as Ref<FormContext | undefined>,
  visibleFields,
  inlineFieldsConfig,
  stackedFieldsConfig,
  omitFieldsConfig: omittedFields,
  adminConfig
})

const { getFieldContext } = formFields

const categorizedFields = computed(() => {
  const fieldsConfig = instanceConfig.value?.fields
  return categorizeFieldsBySection(visibleFields.value as GlobalFieldKey<GlobalEntityKey>[], fieldsConfig)
})

/**
 * LEARNING: Computed property for entity name
 * WHY: Gets entity name for display in title and delete dialog
 * PATTERN: Use composable function
 */
const entityName = computed(() => {
  return getEntityNameFromComposable(props.entityKey, props.entity)
})

/**
 * LEARNING: Use entity card actions composable for save/reset/delete handlers
 * WHY: Extracts action handlers from component to composable
 * PATTERN: Composable wraps useEntityForm + useEntityCrud and provides action handlers
 */
const entityCardActions = useEntityCardActions({
  entityKey: props.entityKey,
  entity: computed(() => props.entity),
  form,
  isNew: props.isNew,
  onDelete: (id: string) => {
    emit('delete', id)
  },
  onSaved: (entity: GlobalEntity<GlobalEntityKey>) => {
    emit('saved', entity)
  },
  onCancelled: () => {
    emit('cancelled')
  }
})

const {
  canSave: _canSave,
  hasChanges: _hasChanges,
  showDeleteDialog,
  isNew: _isNew, // Already have props.isNew
  handleSave,
  handleUndo,
  handleDeleteClick,
  handleDelete,
  handleCancelDelete,
  handleCancel
} = entityCardActions

/**
 * LEARNING: Provide handleSave and isNew to child input components
 * WHY: Allows input components (like TextInput) to trigger full form save on Enter key
 *      when creating new entities, instead of just saving the individual field
 * PATTERN: Use provide/inject to pass parent methods to children
 */
provide(ENTITY_CARD_SAVE_KEY, {
  handleSave,
  isNew: props.isNew
})

/**
 * LEARNING: Computed property for delete dialog title
 * WHY: Provides entity-type-specific delete dialog title
 * PATTERN: Use composable function
 */
const deleteDialogTitle = computed(() => {
  return getEntityDeleteTitle(props.entityKey)
})

/**
 * LEARNING: Config-driven status button fields
 * WHY: Replaces hardcoded boolean flags with config-driven approach from adminConfig
 * PATTERN: Extract statusButtonFields from field categorization, same pattern as InstancesTab.vue
 * 
 * Styling:
 * - TRUE: variant="flat" (solid color)
 * - FALSE: variant="outlined" (border-only, same color)
 */
type StatusButtonFieldWithValue = StatusButtonField & {
  value: boolean
}

const statusButtonFields = computed((): StatusButtonFieldWithValue[] => {
  const fieldsConfig = instanceConfig.value?.fields
  if (!fieldsConfig) return []
  
  // LEARNING: DevMode warning for unconfigured boolean fields
  // WHY: Helps catch boolean fields that exist in formFieldConfig but aren't configured in adminConfig
  // PATTERN: Call warning function when statusButtonFields are computed (runs reactively)
  const formFieldConfig = adminConfig.getEntityFormFieldConfig(props.entityKey).value
  warnUnconfiguredBooleanFields(props.entityKey, formFieldConfig, fieldsConfig)
  
  // Use categorization utility to extract status button fields
  const categorized = categorizeFieldsBySection([], fieldsConfig)
  
  // Map status button fields to include current values from entity
  return categorized.statusButtonFields.map((field) => {
    // LEARNING: Read boolean value from entity dynamically
    // WHY: Allows any boolean field configured as statusButton to work without hardcoding
    // PATTERN: Access entity property by key, handle nullable/undefined values
    const entityRecord = props.entity as unknown as Record<string, unknown>
    const fieldValue = entityRecord[field.key]
    const booleanValue = fieldValue === true || fieldValue === 1 || fieldValue === 'true'
    
    return {
      ...field,
      value: booleanValue
    }
  })
})

/**
 * LEARNING: Entity CRUD for status button toggle
 * WHY: Clicking status buttons should update the database, not just UI
 * PATTERN: Use useEntityCrud to get update mutation for this entity type
 */
const entityCrud = {
  blockInstance: useEntityCrud('blockInstance'),
  blockShape: useEntityCrud('blockShape'),
  partInstance: useEntityCrud('partInstance'),
  partShape: useEntityCrud('partShape'),
} as const

/**
 * LEARNING: Toggle status button field value dynamically
 * WHY: Clicking a status button toggles the boolean value in the database
 * PATTERN: Use update mutation with partial entity to toggle any configured field dynamically
 */
const toggleStatusButton = async (fieldKey: GlobalFieldKey<GlobalEntityKey>, event?: Event): Promise<void> => {
  // DEBUG: Log click event details
  if (isDevModeEnabled()) {
    console.log('[EntityCard] toggleStatusButton called', {
      fieldKey,
      eventTarget: event?.target,
      eventCurrentTarget: event?.currentTarget,
      eventType: event?.type,
      timestamp: new Date().toISOString()
    })
  }

  // LEARNING: Stop event propagation to prevent triggering other click handlers
  // WHY: Prevents clicks on status buttons from propagating to parent elements or sibling buttons
  // PATTERN: Explicitly stop propagation in handler as backup to @click.stop
  if (event) {
    event.stopPropagation()
    event.preventDefault()
    if (isDevModeEnabled()) {
      console.log('[EntityCard] Event propagation stopped', { fieldKey })
    }
  }

  // LEARNING: Get current value from entity dynamically
  // WHY: Works with any boolean field configured as statusButton, not just hardcoded ones
  // PATTERN: Read value from entity by key, handle nullable/undefined values
  const entityRecord = props.entity as unknown as Record<string, unknown>
  const fieldValue = entityRecord[fieldKey]
  const currentValue = fieldValue === true || fieldValue === 1 || fieldValue === 'true'
  const newValue = !currentValue
  const id = props.entity.id

  if (isDevModeEnabled()) {
    console.log('[EntityCard] Toggling field', {
      fieldKey,
      currentValue,
      newValue,
      entityId: id
    })
  }

  // LEARNING: Use entity-specific CRUD to update field dynamically
  // WHY: Works for any entity type and any field configured as statusButton
  // PATTERN: Build update payload dynamically with field key and new value
  const crud = entityCrud[props.entityKey]
  if (crud) {
    // Type assertion needed because props.entityKey is a union type, but crud.update expects a specific entity type
    // We know at runtime that crud matches props.entityKey, so this is safe
    const updatePayload = { [fieldKey]: newValue } as Partial<GlobalEntity<GlobalEntityKey>>
    await (crud.update as (entity: Partial<GlobalEntity<GlobalEntityKey>>, id: GlobalEntityId) => Promise<unknown>)(updatePayload, id)
  } else {
    console.error(`[EntityCard] No CRUD available for entity type: ${props.entityKey}`)
  }
}

/**
 * LEARNING: Container click handler for debugging
 * WHY: Logs when container is clicked to detect event propagation issues
 * PATTERN: Separate method for template event handler
 */
const handleContainerClick = (event: Event): void => {
  if (isDevModeEnabled()) {
    console.log('[EntityCard] Container clicked', { 
      target: event.target, 
      currentTarget: event.currentTarget 
    })
  }
}

/**
 * LEARNING: Expose methods for parent components
 * WHY: VExpansionPanels might need access to name field context (though currently not used)
 * PATTERN: Expose getFieldContext function directly
 */
defineExpose({
  getFieldContext,
  getNameFieldContext: () => getFieldContext('name')
})
</script>

<template>
  <!--
    LEARNING: EntityCard content without nested card wrapper
    WHY: Parent VExpansionPanel already provides card structure, avoid card-within-card
    PATTERN: Render content directly - title field, form fields, and buttons
    NOTE: Parent VExpansionPanel handles expansion, so we always show content when parent expands
  -->
  <div class="entity-card-content">
    <!-- LEARNING: Config-driven status button fields - only show when NOT in expansion panel wrapper -->
    <!-- WHY: When hideTitleField is true, flags are rendered in parent's panel title instead -->
    <!-- PATTERN: Separate row for status buttons that renders when not using wrapper component -->
    <div 
      v-if="!hideTitleField && statusButtonFields.length > 0" 
      class="d-flex align-center gap-1 flex-wrap mb-4"
      @click="handleContainerClick"
    >
      <!-- Config-driven status buttons - solid when true, outlined when false, clickable to toggle -->
      <VChip
        v-for="field in statusButtonFields"
        :key="field.key"
        :color="field.color"
        :variant="field.value ? 'flat' : 'outlined'"
        size="small"
        style="cursor: pointer; position: relative; z-index: 1"
        role="switch"
        :aria-checked="String(field.value)"
        :aria-label="`Toggle ${field.label}`"
        @click.stop.prevent="toggleStatusButton(field.key, $event)"
        @mousedown.stop
        @mouseup.stop
      >
        {{ field.label }}
      </VChip>
      <!-- NOTE: Annotation chips removed per user request - annotations shown in Annotations panel instead -->
    </div>
    
    <!-- LEARNING: Header fields (including name) as editable inputs -->
    <!-- WHY: Name field should be editable when the card is expanded, regardless of hideTitleField -->
    <!-- PATTERN: Show header fields when:
         - !hideTitleField (standalone card - always show)
         - hideTitleField && isExpanded (expansion panel - show editable input when expanded)
    -->
    <!-- NOTE: When hideTitleField is true, the static name is in the panel title, but we still show editable input -->
    <div v-if="categorizedFields.headerFields.length > 0 && (!hideTitleField || isExpanded)" class="mb-4">
      <VRow class="align-center">
        <VCol
          v-for="fieldKey in categorizedFields.headerFields"
          :key="fieldKey"
          cols="auto"
          class="flex-grow-1"
        >
          <InputRenderer
            :field-context="getFieldContext(fieldKey)!"
            :show-label="hideTitleField"
          />
        </VCol>
      </VRow>
    </div>
    
    <!--
      LEARNING: EntityFormContent component generates fields from admin configs
      WHY: Shared component for consistent field rendering in both cards and dialogs
      PATTERN: Pass entityKey, entityId, form, and additionalOmittedFields
      NOTE: All relationship fields (validCascades, validConstituents, bookingCascades, activeConstituents) 
            are rendered as relationshipSelect fields via config
      NOTE: blockShapeRef is hidden for blockInstance (implied by tab/group context)
      NOTE: For blockInstance, this now only renders Relationships and Annotations panels (Form inputs removed)
      NOTE: modalMode defaults to false for cards (titleField rendered in card title, not as form field)
      NOTE: We don't exclude name/active from EntityFormContent so contexts are created
            EntityFormContent will exclude them from its own rendering (rendered in title area)
    -->
    <VRow v-if="categorizedFields.directInlineFields.length > 0" class="mb-4">
      <VCol
        v-for="fieldKey in categorizedFields.directInlineFields"
        :key="fieldKey"
        cols="12"
        sm="6"
        md="4"
      >
        <InputRenderer
          :field-context="getFieldContext(fieldKey)!"
          :show-label="true"
        />
      </VCol>
    </VRow>

    <div v-for="fieldKey in categorizedFields.directStackedFields" :key="fieldKey" class="mb-4">
      <InputRenderer
        :field-context="getFieldContext(fieldKey)!"
        :show-label="true"
      />
    </div>

    <EntityCardSubPanels
      :entity-key="entityKey"
      :entity-id="entity.id"
      :entity="entity"
      :form="form"
      :sub-panel-fields="categorizedFields.subPanelFields"
      :get-field-context="getFieldContext"
    />
    
    <!--
      LEARNING: Action buttons for form operations
      WHY: Provides Undo, Save, and Delete/Cancel actions
      PATTERN: Buttons at bottom of form fields with proper spacing
      NOTE: Shows Cancel instead of Delete when in new entity mode
    -->
    <div class="d-flex align-center justify-end mt-4 pt-4" style="border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
      <VBtn
        v-if="!props.isNew"
        variant="outlined"
        prepend-icon="tabler-undo"
        :disabled="!form.meta.value.dirty"
        @click="handleUndo"
        class="mr-2"
      >
        Undo
      </VBtn>
      <VBtn
        color="primary"
        prepend-icon="tabler-device-floppy"
        :disabled="props.isNew ? false : !form.meta.value.dirty"
        @click="handleSave"
        class="mr-2"
      >
        {{ props.isNew ? 'Create' : 'Save' }}
      </VBtn>
      <!-- Delete button for existing entities -->
      <VBtn
        v-if="!props.isNew"
        color="error"
        prepend-icon="tabler-trash"
        @click="handleDeleteClick"
      >
        Delete
      </VBtn>
      <!-- Cancel button for new entities -->
      <VBtn
        v-else
        variant="outlined"
        prepend-icon="tabler-x"
        @click="handleCancel"
      >
        Cancel
      </VBtn>
    </div>
  </div>
  
  <!--
    LEARNING: Delete Confirmation Dialog
    WHY: Provides confirmation before deleting entity
    PATTERN: VDialog with confirmation message
  -->
  <VDialog v-model="showDeleteDialog" max-width="400px">
    <VCard>
      <VCardTitle class="text-h6">{{ deleteDialogTitle }}</VCardTitle>
      <VCardText>
        Are you sure you want to delete "{{ entityName }}"? This action cannot be undone.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="outlined" @click="handleCancelDelete">Cancel</VBtn>
        <VBtn color="error" @click="handleDelete">Delete</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>


