<!--
  LEARNING: Generic Entity Card Component
  WHY: Reusable card component for all entity types (blockShape, partShape, blockInstance, partInstance)
  PATTERN: Generic component that accepts entityKey and entity, handles all CRUD operations
  COMPARISON: React uses GenericInstance. Vue uses EntityCard with DynamicFormFields.
  BENEFITS: DRY, configurable, testable, easier to maintain
-->
<script setup lang="ts">
import { ref, computed, provide, watch, watchEffect, type Ref } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import { useEntityCardActions } from '@/composables/admin/useEntityCardActions'
import { useEntityDisplay } from '@/composables/admin/useEntityDisplay'
import { useEntityStatus } from '@/composables/admin/useEntityStatus'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/useAdmin'
import { useFormFields } from '@/composables/formFields/useFormFields'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import InputRenderer from './fields/InputRenderer.vue'
import EntityCardSubPanels from './EntityCardSubPanels.vue'
import StatusButton from './StatusButton.vue'
import { categorizeFieldsBySection } from '@/utils/forms/fieldSectionCategorization'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useRelationshipMetadata } from '@/composables/admin/useRelationshipMetadata'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'
import { useStatusButtonFields } from '@/composables/admin/useStatusButtonFields'
import { useEntityCardSaveState } from '@/composables/admin/useEntityCardSaveState'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY } from './entityCardConstants'
import { useGlobal } from '@/composables/useGlobal'
import { useNotification } from '@/composables/useNotification'

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
  /**
   * LEARNING: Disable auto-save on field blur prop
   * WHY: Prevents field blur from triggering auto-save (e.g., in bulk edit modals with template entities)
   * PATTERN: When true, field components won't auto-save on blur
   */
  disableAutoSave?: boolean
  /**
   * LEARNING: Optional filtered field metadata
   * WHY: Allows parent components to pass filtered metadata (e.g., bulk edit modals showing only bulkEdit fields)
   * PATTERN: If provided, use this instead of fetching metadata
   */
  fieldMetadata?: Record<string, import('@/types/entityMetadata').FieldMetadataEntry>
}

const props = withDefaults(defineProps<Props<GlobalEntityKey>>(), {
  expanded: true,
  hideTitleField: false,
  isNew: false,
  disableAutoSave: false
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
 * LEARNING: Track entity ID to detect actual entity changes vs reference changes
 * WHY: Entity object reference might change (e.g., modal open/close, store refetch)
 *      but we only want to reset form when entity ID changes or entity is actually updated
 *      Prevents resetting form when modal opens/closes or store refetches with same data
 * PATTERN: Compare entity IDs, not object references, to avoid unnecessary resets
 */
if (!props.form && !props.isNew) {
  // Track last entity ID to detect actual entity changes
  let lastEntityId = String(props.entity.id)
  
  watch(storeEntity, (newStoreEntity, oldStoreEntity) => {
    if (!newStoreEntity) return
    
    const newEntityId = String(newStoreEntity.id)
    const entityIdChanged = newEntityId !== lastEntityId
    
    // LEARNING: Only reset form when entity ID actually changes
    // WHY: Prevents resetting form when entity reference changes but ID is the same
    //      (e.g., modal open/close, store refetch with same data)
    //      This prevents losing user edits when modal opens/closes
    // PATTERN: Compare IDs, not object references
    if (entityIdChanged) {
      lastEntityId = newEntityId
      form.resetForm({
        values: {
          ...newStoreEntity,
        }
      })
      return
    }
    
    // LEARNING: Also reset if entity was missing and now exists (initial load)
    // WHY: When entity first loads from store, we should initialize form
    // PATTERN: Check if old entity was null/undefined
    if (!oldStoreEntity && newStoreEntity) {
      form.resetForm({
        values: {
          ...newStoreEntity,
        }
      })
    }
    // NOTE: If entity ID hasn't changed and entity already existed, don't reset
    //       This prevents overwriting user edits when modal opens/closes or store refetches
  }, { immediate: false })
}
const instanceConfig = computed(() => adminConfig.getInstanceConfig(props.entityKey).value || {})

// LEARNING: Use unified metadata composable for all entity types
// WHY: Single composable handles all entity types without special casing
// PATTERN: Pass entityKey and entity, composable handles entity type mapping and inheritance
// NOTE: If filtered metadata is provided via prop, use that instead of fetching
const fetchedMetadata = useEntityMetadata(
  props.entityKey,
  computed(() => props.entity)
)

// LEARNING: Fetch relationship metadata separately and merge with field metadata
// WHY: Relationship fields (activeConstituents, validCascades, etc.) are not on entity objects
//      but need metadata for rendering configuration
// PATTERN: Fetch relationship metadata and merge into unified metadata map
const fetchedRelationshipMetadata = useRelationshipMetadata(
  props.entityKey,
  computed(() => props.entity)
)

// LEARNING: Merge field metadata and relationship metadata into unified map
// WHY: Relationship fields need to be treated as regular fields for rendering
// PATTERN: Merge relationship metadata using relationship keys as field keys
const composedFieldMetadata = computed(() => {
  if (props.fieldMetadata) {
    // If filtered metadata is provided via prop, merge relationship metadata into it
    const merged = { ...props.fieldMetadata }
    const relationshipMeta = fetchedRelationshipMetadata.relationshipMetadata.value
    for (const [relationshipKey, entry] of Object.entries(relationshipMeta)) {
      // Merge relationship metadata as field metadata (using relationshipKey as fieldKey)
      merged[relationshipKey] = entry
    }
    return merged
  }
  
  // Merge fetched field metadata with relationship metadata
  const fieldMeta = fetchedMetadata.fieldMetadata.value
  const relationshipMeta = fetchedRelationshipMetadata.relationshipMetadata.value
  const merged = { ...fieldMeta }
  for (const [relationshipKey, entry] of Object.entries(relationshipMeta)) {
    // Merge relationship metadata as field metadata (using relationshipKey as fieldKey)
    merged[relationshipKey] = entry
  }
  return merged
})
const isMetadataLoading = computed(() => {
  if (props.fieldMetadata) {
    return fetchedRelationshipMetadata.isLoading.value
  }
  return fetchedMetadata.isLoading.value || fetchedRelationshipMetadata.isLoading.value
})

// LEARNING: Computed to check if metadata is ready (both input and relationship metadata loaded and merged)
// WHY: Gate warnings until metadata is fully loaded and can be meaningfully displayed
// PATTERN: Check both metadata sources are loaded and merged metadata has keys
const isMetadataReady = computed(() => {
  if (isMetadataLoading.value) return false
  const metadata = composedFieldMetadata.value
  // Metadata is ready when we have keys (even if empty, that's still "ready")
  return metadata !== undefined && Object.keys(metadata).length >= 0
})

// LEARNING: Get field keys immediately from entity object, merge with metadata when available
// WHY: Field keys are static properties of the entity - they don't change, so get them immediately
//      Metadata tells us HOW to render fields, but field keys come from the entity itself
// PATTERN: Extract keys from entity immediately, use metadata for rendering config (not for key discovery)
const fieldKeys = computed(() => {
  // LEARNING: Get keys from entity object immediately - they're always available
  // WHY: Entity object has all field keys as properties, no need to wait for metadata
  // PATTERN: Extract keys from entity, filter out non-field properties and system fields
  const entityKeys = Object.keys(props.entity).filter(key => {
    // Filter out non-field properties that shouldn't be rendered
    // LEARNING: Exclude system fields (createdAt, updatedAt) and special fields (annotations)
    // WHY: System fields are managed by database, annotations handled separately via AnnotationsField
    // PATTERN: Filter out known system/special fields to prevent "Unknown input type" warnings
    const systemFields = ['id', 'entityKey', 'orderIndex', 'createdAt', 'updatedAt', 'annotations']
    return !systemFields.includes(key)
  }) as GlobalFieldKey<GlobalEntityKey>[]
  
  // LEARNING: If metadata is available, use it as source of truth for which fields to include
  // WHY: Metadata might have additional fields (including relationship fields) or filter out some fields
  // PATTERN: Prefer metadata keys if available, otherwise use entity keys
  // NOTE: Relationship fields are included in metadata but not on entity object
  if (composedFieldMetadata.value && Object.keys(composedFieldMetadata.value).length > 0) {
    return Object.keys(composedFieldMetadata.value) as GlobalFieldKey<GlobalEntityKey>[]
  }
  
  // LEARNING: Fallback to entity keys if metadata not yet loaded
  // WHY: Don't wait for metadata - field keys are available immediately from entity
  // PATTERN: Use entity keys immediately, metadata will update when it loads
  return entityKeys
})

// LEARNING: Get layout config from instanceConfig (temporary until metadata provides layout)
// WHY: Layout hints (inlineFields, stackedFields) still come from config for now
// PATTERN: Read directly from instanceConfig
const inlineFieldsConfig = computed(() => {
  const config = instanceConfig.value as { inlineFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
  return (config?.inlineFields || []) as GlobalFieldKey<GlobalEntityKey>[]
})

const stackedFieldsConfig = computed(() => {
  const config = instanceConfig.value as { stackedFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
  return (config?.stackedFields || []) as GlobalFieldKey<GlobalEntityKey>[]
})

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
  fieldKeys,
  fieldMetadata: composedFieldMetadata,
  inlineFieldsConfig,
  stackedFieldsConfig,
  adminConfig
})

const { getFieldContext: originalGetFieldContext } = formFields

const { warning: showWarning } = useNotification()

/**
 * LEARNING: Wrapped getFieldContext with warnings for missing contexts
 * WHY: Fail visibly - warn when fields don't have contexts instead of silently hiding them
 * PATTERN: Wrap original function to add error handling and notifications
 */
const getFieldContext = (fieldKey: GlobalFieldKey<GlobalEntityKey>) => {
  const context = originalGetFieldContext(fieldKey)

  const isPending =
    isMetadataLoading.value ||
    formFields.fieldsNeedingContexts.value.includes(fieldKey)

  // LEARNING: Only warn for missing contexts after metadata is ready and not pending
  // WHY: Suppress warnings during async loading - wait until metadata can be meaningfully displayed
  // PATTERN: Gate warnings on isMetadataReady and !isPending
  if (!context && !isPending && isMetadataReady.value) {
    const errorMessage = `[EntityCard] Missing fieldContext for field "${String(fieldKey)}" on ${props.entityKey} (${props.entity.id}). Field must be configured in /admin-input-metadata or /admin-relationship-metadata before rendering.`
    console.warn(errorMessage, {
      entityKey: props.entityKey,
      entityId: props.entity.id,
      fieldKey: String(fieldKey),
      fieldKeys: fieldKeys.value.map(f => String(f)),
      metadataKeys: Object.keys(composedFieldMetadata.value || {})
    })
    showWarning(`Field "${String(fieldKey)}" is missing configuration. Check /admin-input-metadata or /admin-relationship-metadata.`, 6000)
  }

  return context
}

/**
 * LEARNING: Track fields missing contexts for UI display
 * WHY: Show which fields are missing contexts in the UI
 * PATTERN: Computed property that filters categorized fields by missing contexts
 */
const fieldsMissingContexts = computed(() => {
  const allCategorizedFields = [
    ...categorizedFields.value.directFields.inline,
    ...categorizedFields.value.directFields.stacked,
    ...categorizedFields.value.subPanelFields.parts,
    ...categorizedFields.value.subPanelFields.relationships,
    ...categorizedFields.value.subPanelFields.annotations
  ]
  
  return allCategorizedFields.filter(fieldKey => !getFieldContext(fieldKey))
})

/**
 * LEARNING: Get BlockShape properties for conditional field visibility
 * WHY: Status buttons visibility depends on BlockShape properties (e.g., constituable for state control)
 * PATTERN: Only compute for blockInstance entities, get BlockShape from global data
 */
const { globalData } = useGlobal()

const blockShapeProperties = computed(() => {
  if (props.entityKey !== 'blockInstance') {
    return undefined
  }
  
  const blockInstance = props.entity as GlobalEntity<'blockInstance'>
  const blockShapeRef = blockInstance.blockShapeRef
  if (!blockShapeRef) {
    return undefined
  }
  
  // LEARNING: Convert both IDs to strings for consistent comparison
  // WHY: Ensures type-safe comparison (UUIDs might be strings or numbers)
  //      Matches pattern used in useAdmin.getEntity for consistency
  const blockShape = globalData.value?.entities?.blockShape?.find(bs => String(bs.id) === String(blockShapeRef))
  if (!blockShape) {
    return undefined
  }
  
  // LEARNING: Type assertion - blockShape is from blockShape array, so it's BlockShapeEntity
  // WHY: TypeScript doesn't narrow union types from array.find(), so we assert the type
  // PATTERN: Assert to specific entity type since we know it's from the blockShape array
  const blockShapeEntity = blockShape as import('@/types/entities').BlockShapeEntity
  
  return {
    constituable: blockShapeEntity.constituable === true,
    composable: blockShapeEntity.composable === true,
    composite: (blockInstance as GlobalEntity<'blockInstance'>).composite === true
  }
})

const categorizedFields = computed(() => {
  // LEARNING: Guard against metadata still loading
  // WHY: Don't trigger "not configured" error while metadata is still fetching
  // PATTERN: Return empty result during loading, let reactivity re-run when loaded
  if (isMetadataLoading.value) {
    // Return empty result while loading - computed will re-run when data arrives
    return {
      directFields: { inline: [], stacked: [] },
      subPanelFields: { parts: [], relationships: [], annotations: [] },
      statusButtonFields: []
    }
  }
  
  const fieldsConfig = instanceConfig.value?.fields
  
  // LEARNING: Categorize using unified fieldMetadata (passed explicitly)
  // WHY: Pass all fields from metadata, categorization handles visibility filtering
  const result = categorizeFieldsBySection(
    fieldKeys.value as GlobalFieldKey<GlobalEntityKey>[], 
    fieldsConfig,
    {
      blockShapeProperties: blockShapeProperties.value,
      fieldMetadata: composedFieldMetadata.value
    }
  )
  
  return result
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
  handleSave: _handleSave,
  handleUndo: _handleUndo,
  handleDeleteClick,
  handleDelete,
  handleCancelDelete,
  handleCancel
} = entityCardActions

/**
 * LEARNING: Unified save state management
 * WHY: Tracks both form field changes AND status button changes
 * PATTERN: Composable that combines form dirty state with status button change tracking
 */
const unifiedSaveState = useEntityCardSaveState({
  form,
  entityKey: props.entityKey,
  entityId: String(props.entity.id),
  getEntityValues: () => {
    // LEARNING: Get current entity values from store after save
    // WHY: After save, entity is updated in store, so we use store entity for reset
    // PATTERN: Get entity from store (has latest saved values) or fall back to props.entity
    const savedEntity = props.isNew ? props.entity : (admin.getEntity(props.entityKey, props.entity.id) || props.entity)
    // LEARNING: Convert entity to Record<string, unknown> via unknown for type safety
    // WHY: TypeScript requires explicit conversion through unknown when converting between incompatible types
    // PATTERN: Convert via unknown first, then to Record<string, unknown>
    return savedEntity as unknown as Record<string, unknown>
  }
})

/**
 * LEARNING: Wrapped save handler that resets unified save state after save
 * WHY: After successful save, we need to reset both form and status button change tracking
 * PATTERN: Wrap original handleSave, call resetSaveState after successful save
 */
const handleSave = async (): Promise<void> => {
  await _handleSave()
  // Reset unified save state after successful save
  unifiedSaveState.resetSaveState()
}

/**
 * LEARNING: Wrapped undo handler that resets unified save state
 * WHY: Undo should reset both form and status button changes
 * PATTERN: Wrap original handleUndo, call resetSaveState
 */
const handleUndo = (): void => {
  _handleUndo()
  // Reset unified save state when undoing changes
  unifiedSaveState.resetSaveState()
}

/**
 * LEARNING: Provide handleSave and isNew to child input components
 * WHY: Allows input components (like TextInput) to trigger full form save on Enter key
 *      when creating new entities, instead of just saving the individual field
 * PATTERN: Use provide/inject to pass parent methods to children
 */
provide(ENTITY_CARD_SAVE_KEY, {
  handleSave,
  isNew: props.isNew,
  disableAutoSave: props.disableAutoSave
})

/**
 * LEARNING: Provide disableAutoSave flag to child input components
 * WHY: Allows field components to check if auto-save should be disabled (e.g., in bulk edit modals)
 * PATTERN: Use provide/inject to pass flag to children
 */
provide(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, props.disableAutoSave)

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
// LEARNING: Use composable for status button fields
// WHY: Single source of truth for status button field logic
// PATTERN: Composable handles all the complexity of getting status buttons from config
// NOTE: Composable will look up blockShape/partShape reactively from entity, so we don't pass them
const { statusButtonFields } = useStatusButtonFields({
  entityKey: props.entityKey,
  entity: computed(() => props.entity),
  blockShapeProperties: blockShapeProperties, // Pass computed ref - composable will unwrap it
  isExpanded: computed(() => props.expanded ?? true)
})

/**
 * LEARNING: Use reusable status button toggle composable
 * WHY: Ensures consistent toggle behavior across all entity types
 * PATTERN: Pure configuration-based composable
 * FIX: Pass entityId to ensure reactive store reads
 * LEARNING: Pass toggle callback to track status button changes
 * WHY: Allows unified save state to track when status buttons are toggled
 * PATTERN: Callback notifies parent of changes for save state management
 */
const statusButtonToggle = useStatusButtonToggle({
  entityKey: props.entityKey,
  entityId: computed(() => props.entity.id),
  onToggle: (fieldKey: string) => {
    unifiedSaveState.markStatusButtonChanged(fieldKey)
  }
})

/**
 * LEARNING: Container click handler for debugging
 * WHY: Can be used to detect event propagation issues
 * PATTERN: Separate method for template event handler
 */
const handleContainerClick = (_event: Event): void => {
  // No-op - kept for potential debugging
}

/**
 * LEARNING: Expose methods for parent components
 * WHY: VExpansionPanels might need access to name field context (though currently not used)
 * PATTERN: Expose getFieldContext function directly
 */
defineExpose({
  getFieldContext,
  getNameFieldContext: () => getFieldContext('name'),
  form
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
      <!-- Config-driven status buttons using reusable StatusButton component -->
      <StatusButton
        v-for="field in statusButtonFields"
        :key="field.key"
        :label="field.label"
        :color="field.color"
        :is-active="field.value"
        @click="(event) => statusButtonToggle.toggleStatusButton(field.key, event)"
      />
      <!-- NOTE: Annotation chips removed per user request - annotations shown in Annotations panel instead -->
    </div>
    
    <!-- LEARNING: Warning for fields missing contexts -->
    <!-- WHY: Fail visibly - show which fields are missing contexts -->
    <!-- PATTERN: VAlert component for error display -->
    <VAlert
      v-if="fieldsMissingContexts.length > 0"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      <strong>Missing Field Contexts:</strong> The following fields are configured in metadata but don't have contexts yet:
      <ul class="mt-2 mb-0">
        <li v-for="fieldKey in fieldsMissingContexts" :key="fieldKey">
          {{ String(fieldKey) }}
        </li>
      </ul>
      <div class="text-caption mt-2">
        This usually means the field contexts are still being created. If this persists, check that the field is properly configured in /admin-input-metadata.
      </div>
    </VAlert>

    <!-- LEARNING: Direct fields (panel: 'none') rendered in card content -->
    <!-- WHY: Fields without panel assignment render in main card area -->
    <!-- PATTERN: Organized by layout (inline vs stacked) from metadata -->
    <VRow v-if="categorizedFields.directFields.inline.length > 0" class="mb-4">
      <VCol
        v-for="fieldKey in categorizedFields.directFields.inline"
        :key="fieldKey"
        cols="12"
        sm="6"
        md="4"
      >
        <InputRenderer
          v-if="getFieldContext(fieldKey)"
          :field-context="getFieldContext(fieldKey)!"
          :show-label="true"
          :field-metadata="composedFieldMetadata"
        />
        <VAlert
          v-else
          type="warning"
          variant="tonal"
          density="compact"
        >
          Field "{{ String(fieldKey) }}" is missing context
        </VAlert>
      </VCol>
    </VRow>

    <div v-for="fieldKey in categorizedFields.directFields.stacked" :key="fieldKey" class="mb-4">
      <InputRenderer
        v-if="getFieldContext(fieldKey)"
        :field-context="getFieldContext(fieldKey)!"
        :show-label="true"
        :field-metadata="composedFieldMetadata"
      />
      <VAlert
        v-else
        type="warning"
        variant="tonal"
        density="compact"
      >
        Field "{{ String(fieldKey) }}" is missing context
      </VAlert>
    </div>

    <EntityCardSubPanels
      :entity-key="entityKey"
      :entity-id="entity.id"
      :entity="entity"
      :form="form"
      :sub-panel-fields="categorizedFields.subPanelFields"
      :get-field-context="getFieldContext"
      :field-metadata="composedFieldMetadata"
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
        :disabled="!unifiedSaveState.canSave.value"
        @click="handleUndo"
        class="mr-2"
      >
        Undo
      </VBtn>
      <VBtn
        color="primary"
        prepend-icon="tabler-device-floppy"
        :disabled="props.isNew ? false : !unifiedSaveState.canSave.value"
        @click="handleSave"
        class="mr-2"
      >
        Save
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


