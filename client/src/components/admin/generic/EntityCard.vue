<!--
  LEARNING: Generic Entity Card Component
  WHY: Reusable card component for all entity types (blockShape, partShape, blockInstance, partInstance)
  PATTERN: Generic component that accepts entityKey and entity, handles all CRUD operations
  COMPARISON: React uses GenericInstance. Vue uses EntityCard with DynamicFormFields.
  BENEFITS: DRY, configurable, testable, easier to maintain
-->
<script setup lang="ts">
import { ref, computed, provide, watch, watchEffect, toRef, nextTick, type Ref } from 'vue'
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
import FieldRenderer from './fields/FieldRenderer.vue'
import EntityCardSubPanels from './EntityCardSubPanels.vue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useRelationshipMetadata } from '@/composables/admin/useRelationshipMetadata'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'
import { useFieldLocation } from '@/composables/admin/useFieldLocation'
import { useEntityCardSaveState } from '@/composables/admin/useEntityCardSaveState'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY } from './entityCardConstants'
import { useGlobal } from '@/composables/useGlobal'
import { useNotification } from '@/composables/useNotification'
import { VExpansionPanel, VExpansionPanels, VCard } from 'vuetify/components'

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
   * LEARNING: Whether EntityCard should wrap itself in VExpansionPanel
   * WHY: When true (default), EntityCard is self-contained with its own expand/collapse. When false (modals), renders without wrapper
   * PATTERN: Optional prop defaults to true for self-contained behavior
   */
  useExpansionPanel?: boolean
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
  isNew: false,
  disableAutoSave: false,
  useExpansionPanel: true
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
 * LEARNING: Expansion state - track from expanded prop reactively
 * WHY: Title field should be read-only when collapsed, editable when expanded
 * PATTERN: Use computed that tracks expanded prop, with watch to ensure reactivity
 * NOTE: When useExpansionPanel=true, parent VExpansionPanels controls expansion via v-model
 * FIX: For staticAsTitle fields, read-only should be false when expanded (editable), true when collapsed (read-only)
 *      Logic: :read-only="!isExpanded" means:
 *        - When isExpanded=false (collapsed) → read-only=true (read-only) ✓
 *        - When isExpanded=true (expanded) → read-only=false (editable) ✓
 */
// LEARNING: Track expansion state using internal ref + watch
// WHY: props.expanded is passed as function call (isPanelExpanded), not reactive computed, so we need to watch it
// PATTERN: Use ref to track state, watch prop to update ref when it changes
const internalExpanded = ref(props.expanded ?? true)

// LEARNING: Watch expanded prop to sync internal state
// WHY: When parent VExpansionPanels updates expansion state, props.expanded changes, but computed doesn't track function calls
// PATTERN: Watch prop and update internal ref - this ensures reactivity
watch(() => props.expanded, (newValue) => {
  const expanded = newValue ?? true
  internalExpanded.value = expanded
}, { immediate: true })

// LEARNING: Use internal ref for expansion state
// WHY: Internal ref is updated by watch, ensuring reactivity when prop changes
// PATTERN: Computed reads from reactive ref
const isExpanded = computed(() => {
  return internalExpanded.value
})

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
  // FIX: Use storeEntity if available, fallback to props.entity to ensure values always exist
  initialValues: {
    ...(storeEntity.value || props.entity),
  }
})

// LEARNING: Explicitly set form values to ensure they're available immediately
// WHY: Vee-Validate might not populate form.values immediately from initialValues
//      Setting values explicitly ensures form.values is populated before field contexts are created
// PATTERN: Use setValues to populate form.values synchronously
if (!props.form) {
  const initialEntity = storeEntity.value || props.entity
  form.setValues({
    ...initialEntity,
  })
}

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
  // Track last entity ID and last reset values to detect actual changes
  let lastEntityId = String(props.entity.id)
  let lastResetValues: Record<string, unknown> | null = null
  
  watch(storeEntity, (newStoreEntity, oldStoreEntity) => {
    if (!newStoreEntity) {
      return
    }
    
    const newEntityId = String(newStoreEntity.id)
    const entityIdChanged = newEntityId !== lastEntityId
    const isInitialLoad = !oldStoreEntity
    const storeEntityJustLoaded = oldStoreEntity === props.entity && newStoreEntity !== props.entity
    
    // LEARNING: Reset form ONLY when:
    // 1. Entity ID changes (different entity)
    // 2. Initial load (oldStoreEntity is falsy)
    // 3. Store entity just loaded (was props.entity, now is store entity)
    // WHY: For same entity with changed values, use form.setFieldValue() for individual fields
    //      This uses Vee-Validate's built-in form-level API instead of field-level watches
    // PATTERN: Reset on entity ID change/initial load, use setFieldValue for individual field updates
    const shouldReset = entityIdChanged || isInitialLoad || storeEntityJustLoaded

    if (shouldReset) {
      // LEARNING: Reset form when entity ID changes or on initial load
      // WHY: resetForm updates all fields and sets initial values for future resets
      // PATTERN: Use resetForm for entity changes, setFieldValue for individual field updates
      lastEntityId = newEntityId
      lastResetValues = { ...newStoreEntity }
      
      // LEARNING: Use resetForm to update both current values AND initial values (per vee-validate docs)
      // WHY: resetForm updates all fields that are part of the form, even if they were created before
      //      It sets both current values and new initial values for future resets
      // PATTERN: Call resetForm with values to update all fields
      form.resetForm({
        values: {
          ...newStoreEntity,
        }
      })
    } else if (oldStoreEntity) {
      // LEARNING: Store entity changed but same ID - use form.setFieldValue() for individual fields
      // WHY: Vee-Validate automatically syncs useField() instances when setFieldValue() is called
      //      This is more efficient than resetting the entire form and uses Vee-Validate's built-in API
      // PATTERN: Compare old vs new to find changed fields, then use setFieldValue for each
      // NOTE: Only sync fields that exist in the form (check form.values) to avoid calling setFieldValue for non-form fields
      const formFieldKeys = form.values ? Object.keys(form.values) : []
      const changedFields = Object.keys(newStoreEntity).filter(key => {
        // Only check fields that exist in the form
        if (!formFieldKeys.includes(key)) {
          return false
        }
        const oldValue = oldStoreEntity[key]
        const newValue = newStoreEntity[key]
        return JSON.stringify(oldValue) !== JSON.stringify(newValue)
      })
      
      if (changedFields.length > 0) {
        // LEARNING: Use Vee-Validate's form.setFieldValue() for each changed field
        // WHY: setFieldValue() automatically syncs the corresponding useField() instance
        //      This is the correct Vee-Validate method for programmatic field updates
        //      Only call setFieldValue for fields that exist in the form (already filtered above)
        // PATTERN: Use form-level API instead of field-level watches, filter to form fields only
        changedFields.forEach(fieldKey => {
          form.setFieldValue(fieldKey, newStoreEntity[fieldKey])
        })
      }
      
      // Update lastResetValues for next comparison
      lastResetValues = { ...newStoreEntity }
    }
  }, { immediate: true, deep: true }) // Run immediately and watch deeply for value changes
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
// WHY: Relationship fields (activeParts, validCascades, etc.) are not on entity objects
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
    // LEARNING: When filtered metadata is provided, use it as-is
    // WHY: Parent components (like bulk edit modals) have already filtered to desired fields
    // PATTERN: Don't merge relationship metadata - parent controls which fields to show
    return props.fieldMetadata
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
  const isLoading = isMetadataLoading.value
  const metadata = composedFieldMetadata.value
  const isReady = !isLoading && metadata !== undefined && Object.keys(metadata).length >= 0
  return isReady
})

// LEARNING: Get field keys from metadata exclusively - no fallbacks
// WHY: Metadata is the single source of truth for which fields to render
// PATTERN: Use metadata keys only - fail explicitly if metadata is not available
const fieldKeys = computed(() => {
  // LEARNING: When fieldMetadata prop is provided, use it exclusively
  // WHY: Parent components (like bulk edit modals) pass filtered metadata
  // PATTERN: If prop provided, use those keys only - no fallback to entity keys
  if (props.fieldMetadata && Object.keys(props.fieldMetadata).length > 0) {
    return Object.keys(props.fieldMetadata) as GlobalFieldKey<GlobalEntityKey>[]
  }
  
  // LEARNING: Use composedFieldMetadata as exclusive source of truth
  // WHY: Metadata determines which fields to render - no fallback to entity object
  // PATTERN: Fail explicitly if metadata is not available rather than falling back to entity keys
  if (composedFieldMetadata.value && Object.keys(composedFieldMetadata.value).length > 0) {
    return Object.keys(composedFieldMetadata.value) as GlobalFieldKey<GlobalEntityKey>[]
  }
  
  // LEARNING: Fail explicitly - return empty array if no metadata available
  // WHY: No fallbacks - metadata must be available for fields to render
  // PATTERN: Return empty array to fail visibly rather than silently falling back
  return [] as GlobalFieldKey<GlobalEntityKey>[]
})

// LEARNING: Derive layout config from metadata layout property
// WHY: Metadata is the single source of truth for field layout - each field has layout: 'inline' | 'stacked'
// PATTERN: Extract field keys from metadata where layout matches, sorted by displayOrder
const inlineFieldsConfig = computed(() => {
  if (!composedFieldMetadata.value) {
    // Fallback to adminConfig during migration period
    const config = instanceConfig.value as { inlineFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    return (config?.inlineFields || []) as GlobalFieldKey<GlobalEntityKey>[]
  }
  
  // LEARNING: Get all fields with layout: 'inline' from metadata, sorted by displayOrder
  // WHY: Metadata is the source of truth for layout
  // PATTERN: Filter by layout property, sort by displayOrder
  return Object.entries(composedFieldMetadata.value)
    .filter(([_, meta]) => meta.layout === 'inline')
    .sort(([_, a], [__, b]) => a.displayOrder - b.displayOrder)
    .map(([fieldKey]) => fieldKey as GlobalFieldKey<GlobalEntityKey>)
})

const stackedFieldsConfig = computed(() => {
  if (!composedFieldMetadata.value) {
    // Fallback to adminConfig during migration period
    const config = instanceConfig.value as { stackedFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    return (config?.stackedFields || []) as GlobalFieldKey<GlobalEntityKey>[]
  }
  
  // LEARNING: Get all fields with layout: 'stacked' from metadata, sorted by displayOrder
  // WHY: Metadata is the source of truth for layout
  // PATTERN: Filter by layout property, sort by displayOrder
  return Object.entries(composedFieldMetadata.value)
    .filter(([_, meta]) => meta.layout === 'stacked')
    .sort(([_, a], [__, b]) => a.displayOrder - b.displayOrder)
    .map(([fieldKey]) => fieldKey as GlobalFieldKey<GlobalEntityKey>)
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

/**
 * LEARNING: Computed property for form readiness
 * WHY: Template needs access to isFormReady, but it's nested in formFields object
 * PATTERN: Create computed property that accesses formFields.isFormReady
 */
const isFormReady = computed(() => formFields.isFormReady.value)

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
    showWarning(`Field "${String(fieldKey)}" is missing configuration. Check /admin-input-metadata or /admin-relationship-metadata.`, 6000)
  }

  return context
}

/**
 * LEARNING: Track fields missing contexts for UI display
 * WHY: Show which fields are missing contexts in the UI
 * PATTERN: Computed property that filters fields by location and missing contexts
 */
const fieldsMissingContexts = computed(() => {
  const locations = fieldLocation.fieldsByLocation.value
  const allCategorizedFields = [
    ...locations.directInline,
    ...locations.directStacked,
    ...locations.subPanels.parts,
    ...locations.subPanels.relationships,
    ...locations.subPanels.annotations
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

/**
 * LEARNING: Use field location dispatcher for location assignment
 * WHY: Single source of truth for WHERE fields render based on metadata
 * PATTERN: Composable that determines field locations from metadata + context
 */
const fieldLocation = useFieldLocation({
  fieldKeys: computed(() => fieldKeys.value as GlobalFieldKey<GlobalEntityKey>[]),
  fieldMetadata: composedFieldMetadata,
  isExpanded: computed(() => props.expanded ?? true)
})

/**
 * LEARNING: Computed property for categorized fields (backward compatibility)
 * WHY: Template still references categorizedFields, so we provide it from location dispatcher
 * PATTERN: Map fieldsByLocation to old categorizedFields structure
 * NOTE: This maintains backward compatibility while using new location dispatcher internally
 */
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
  
  const locations = fieldLocation.fieldsByLocation.value
  
  // LEARNING: Map new location structure to old categorizedFields structure
  // WHY: Maintain backward compatibility with existing template code
  // PATTERN: Transform fieldsByLocation to match old categorizeFieldsBySection output
  return {
    directFields: {
      inline: locations.directInline,
      stacked: locations.directStacked
    },
    subPanelFields: {
      parts: locations.subPanels.parts,
      relationships: locations.subPanels.relationships,
      annotations: locations.subPanels.annotations
    },
    // LEARNING: Status button fields are those with renderAs: 'statusButton' in title row location
    // WHY: Status buttons appear in title row (titleRow) AND can appear in form body
    // PATTERN: Extract status buttons from title row fields (they're titleRow with renderAs: 'statusButton')
    statusButtonFields: locations.titleRow
      .filter(fieldKey => {
        const meta = composedFieldMetadata.value[String(fieldKey)]
        return meta?.renderAs === 'statusButton'
      })
      .map(fieldKey => {
        const meta = composedFieldMetadata.value[String(fieldKey)]
        return {
          key: fieldKey,
          label: meta?.label || String(fieldKey).charAt(0).toUpperCase() + String(fieldKey).slice(1),
          color: meta?.statusButtonColor || 'default',
          order: meta?.displayOrder ?? 0
        }
      })
      .sort((a, b) => a.order - b.order)
  }
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
 * LEARNING: Wrapped save handler that resets unified save state and form after save
 * WHY: After successful save, we need to reset both form and status button change tracking
 *      Also need to reset form with updated entity values from store
 * PATTERN: Wrap original handleSave, reset form with store entity, then reset save state
 */
const handleSave = async (): Promise<void> => {
  await _handleSave()
  
  // LEARNING: Reset form with updated entity values from store after save
  // WHY: After save, entity is updated in store, form should reflect the saved values
  // PATTERN: Wait for next tick to ensure store is updated, then get entity and reset form
  // NOTE: Vue Query mutations update cache, but we wait a tick to ensure propagation
  await nextTick()
  
  if (!props.isNew) {
    const savedEntity = admin.getEntity(props.entityKey, props.entity.id)
    if (savedEntity) {
      console.log('[FORM-RESET] Resetting form after full save', {
        entityKey: String(props.entityKey),
        entityId: String(props.entity.id),
        entityName: savedEntity.name,
        sampleValues: {
          name: (savedEntity as { name?: unknown }).name,
          id: savedEntity.id
        }
      })
      
      // Reset form with saved entity values to ensure fields display updated values
      form.resetForm({
        values: {
          ...savedEntity,
        }
      })
      // Also use setValues to ensure fields sync immediately
      form.setValues({
        ...savedEntity,
      })
      
    } else {
      console.warn('[FORM-RESET] Saved entity not found in store after save', {
        entityKey: String(props.entityKey),
        entityId: String(props.entity.id)
      })
    }
  }
  
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
 * LEARNING: Title row fields from composable - NO filtering
 * WHY: Composable returns all title row fields - component renders based on metadata directly
 * PATTERN: Use composable's titleRowFields - read metadata in template to determine rendering
 */
const titleRowFields = fieldLocation.titleRowFields

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
 * LEARNING: Handle title row clicks - prevent expansion panel from intercepting status button clicks
 * WHY: Status buttons are in title row, but clicks should toggle buttons, not expand panel
 * PATTERN: Stop propagation for clicks on title row (status buttons handle their own clicks)
 */
const handleTitleRowClick = (event: Event): void => {
  // LEARNING: Only stop propagation if click is on status button area
  // WHY: Allow clicks on name field to expand panel, but prevent clicks on status buttons from expanding
  // PATTERN: Check if click target is a status button or its parent, then stop propagation
  const target = event.target as HTMLElement
  const isStatusButton = target.closest('.v-chip') || target.closest('[role="switch"]')
  
  if (isStatusButton) {
    // Status button click - let it handle the click, don't expand panel
    event.stopPropagation()
  }
  // Otherwise, allow default behavior (expand/collapse panel)
}

/**
 * LEARNING: Expose methods and state for parent components (minimal API)
 * WHY: EntityCard is now self-contained, but some parent components may need form access
 * PATTERN: Expose only what's needed for external access (form, readiness state)
 */
defineExpose({
  getFieldContext,
  getNameFieldContext: () => getFieldContext('name'),
  form,
  // LEARNING: Expose readiness state for parent components (if needed for other purposes)
  // WHY: Some parent components may need to check readiness for non-rendering purposes
  // PATTERN: Expose computed properties for external access
  isMetadataReady,
  isFormReady: formFields.isFormReady
  // NOTE: titleRowFields and composedFieldMetadata no longer exposed - EntityCard renders them internally
})
</script>

<template>
  <!--
    LEARNING: Self-contained EntityCard with optional VExpansionPanel wrapper
    WHY: EntityCard owns its rendering - title row, expand/collapse, and content
    PATTERN: When useExpansionPanel=true, wraps in VExpansionPanel. When false (modals), renders content directly.
    NOTE: When used inside parent VExpansionPanels, EntityCard renders as VExpansionPanel. When standalone, renders content directly.
  -->
  <VExpansionPanel
    v-if="props.useExpansionPanel"
    :value="String(entity.id)"
    :class="$attrs.class"
  >
    <template #title>
      <div 
        class="d-flex align-center gap-2 flex-grow-1"
        @click="handleTitleRowClick"
      >
        <!-- LEARNING: Render name field left-justified in panel title -->
        <!-- WHY: Name field should be on the left side of the title row -->
        <!-- PATTERN: Render name field first, then status buttons on the right -->
        <template v-if="titleRowFields.length > 0 && isFormReady">
          <!-- LEARNING: staticAsTitle fields render first, left-justified -->
          <!-- WHY: Name field should be on the left side of the title row, always first -->
          <!-- PATTERN: Use template wrapper with v-if to conditionally render staticAsTitle fields in left container -->
          <div class="flex-grow-1 d-flex align-center gap-2">
            <template
              v-for="fieldKey in titleRowFields"
              :key="fieldKey"
            >
              <FieldRenderer
                v-if="composedFieldMetadata[String(fieldKey)]?.visibility === 'staticAsTitle'"
                :field-context="getFieldContext(fieldKey)"
                :show-label="false"
                :field-metadata="composedFieldMetadata"
                :read-only="!isExpanded"
              />
            </template>
          </div>
          
          <!-- LEARNING: Other titleRow fields render after, right-justified -->
          <!-- WHY: Status buttons and other titleRow fields should be on the right side -->
          <!-- PATTERN: Use template wrapper with v-if to conditionally render non-staticAsTitle fields in right container -->
          <div class="d-flex align-center gap-2 ms-auto">
            <template
              v-for="fieldKey in titleRowFields"
              :key="fieldKey"
            >
              <FieldRenderer
                v-if="composedFieldMetadata[String(fieldKey)]?.visibility !== 'staticAsTitle'"
                :field-context="getFieldContext(fieldKey)"
                :show-label="false"
                :field-metadata="composedFieldMetadata"
              />
            </template>
          </div>
        </template>
        <!-- Fallback to entity name if fields not ready -->
        <span v-else class="flex-grow-1">{{ entityName }}</span>
      </div>
    </template>
    
    <template #text>
      <!-- LEARNING: Wrap content in VCard for visual containment -->
      <!-- WHY: Provides clear visual boundary so buttons appear contained within EntityCard -->
      <!-- PATTERN: VCard wrapper ensures all content (fields and buttons) is visually contained -->
      <!-- NOTE: VCard with elevation provides clear visual boundary for buttons -->
      <VCard variant="elevated" elevation="2" class="entity-card-wrapper ma-0">
        <VCardText class="entity-card-content pa-4">
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
              <FieldRenderer
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
            <FieldRenderer
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
        </VCardText>
      </VCard>
    </template>
  </VExpansionPanel>

  <!--
    LEARNING: Fallback: Render content directly when useExpansionPanel=false (modals)
    WHY: Modals don't need VExpansionPanel wrapper, just render content directly
    PATTERN: Conditional rendering based on useExpansionPanel prop
  -->
  <div v-else class="entity-card-content">
    <!-- LEARNING: Title row fields render at top when not using expansion panel -->
    <!-- WHY: TitleRow fields should still be visible even without expansion panel -->
    <div v-if="titleRowFields.length > 0 && isFormReady" class="d-flex align-center gap-2 mb-4">
      <!-- LEARNING: staticAsTitle fields render first, left-justified -->
      <!-- WHY: Name field should be on the left side of the title row, always first -->
      <!-- PATTERN: Use template wrapper with v-if to conditionally render staticAsTitle fields in left container -->
      <div class="flex-grow-1 d-flex align-center gap-2">
        <template
          v-for="fieldKey in titleRowFields"
          :key="fieldKey"
        >
          <FieldRenderer
            v-if="composedFieldMetadata[String(fieldKey)]?.visibility === 'staticAsTitle'"
            :field-context="getFieldContext(fieldKey)"
            :show-label="false"
            :field-metadata="composedFieldMetadata"
            :read-only="!isExpanded"
          />
        </template>
      </div>
      
      <!-- LEARNING: Other titleRow fields render after, right-justified -->
      <!-- WHY: Status buttons and other titleRow fields should be on the right side -->
      <!-- PATTERN: Use template wrapper with v-if to conditionally render non-staticAsTitle fields in right container -->
      <div class="d-flex align-center gap-2 ms-auto">
        <template
          v-for="fieldKey in titleRowFields"
          :key="fieldKey"
        >
          <FieldRenderer
            v-if="composedFieldMetadata[String(fieldKey)]?.visibility !== 'staticAsTitle'"
            :field-context="getFieldContext(fieldKey)"
            :show-label="false"
            :field-metadata="composedFieldMetadata"
          />
        </template>
      </div>
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
        <FieldRenderer
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
      <FieldRenderer
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
        @click="handleDelete"
      >
        Delete
      </VBtn>
      <!-- Cancel button for new entities -->
      <VBtn
        v-else
        variant="outlined"
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


