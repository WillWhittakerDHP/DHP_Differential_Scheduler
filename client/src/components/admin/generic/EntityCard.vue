<!--
  LEARNING: Generic Entity Card Component
  WHY: Reusable card component for all entity types (blockShape, partShape, blockInstance, partInstance)
  PATTERN: Generic component that accepts entityKey and entity, handles all CRUD operations
  COMPARISON: React uses GenericInstance. Vue uses EntityCard with DynamicFormFields.
  BENEFITS: DRY, configurable, testable, easier to maintain
-->
<script setup lang="ts">
import { ref, computed, provide, watch, nextTick, type Ref } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import { useEntityCardActions } from '@/composables/admin/useEntityCardActions'
import { useEntityDisplay } from '@/composables/admin/useEntityDisplay'
import { useEntityStatus } from '@/composables/admin/useEntityStatus'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/useAdmin'
import { useFormFields } from '@/composables/useFormFields'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import FieldRenderer from './fields/FieldRenderer.vue'
import EntityCardContent from './EntityCardContent.vue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFieldLocation } from '@/composables/admin/useFieldLocation'
import { useInstanceShape } from '@/composables/admin/useInstanceShape'
import { useEntityCardSaveState } from '@/composables/admin/useEntityCardSaveState'
import { useEntityCardStoreSync } from '@/composables/admin/useEntityCardStoreSync'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY } from './entityCardConstants'
import { useNotification } from '@/composables/useNotification'
import { createLogger, isScopeExplicitlyEnabled } from '@/utils/logger'
import { VExpansionPanel, VCard } from 'vuetify/components'

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
  (e: 'duplicate', entity: GlobalEntity<GlobalEntityKey>): void
}

const emit = defineEmits<Emits>()


/**
 * LEARNING: Expansion state - sync with actual panel group state
 * WHY: Title field should be read-only when collapsed, editable when expanded
 * PATTERN: Track expansion state from VExpansionPanel group:selected events
 * NOTE: When useExpansionPanel=true, EntityCard should reflect actual panel state (not just props)
 * FIX: For staticAsTitle fields, read-only should be false when expanded (editable), true when collapsed (read-only)
 *      Logic: :read-only="!isExpanded" means:
 *        - When isExpanded=false (collapsed) → read-only=true (read-only) ✓
 *        - When isExpanded=true (expanded) → read-only=false (editable) ✓
 */
// LEARNING: Internal expansion state
// WHY: group:selected reflects actual VExpansionPanel state even if parent props lag
// PATTERN: Initialize from props, then sync from group:selected events
const internalExpanded = ref(props.expanded ?? true)

// LEARNING: Keep internal state in sync with prop updates
// WHY: Parent may programmatically control expansion (e.g., auto-expand on create)
// PATTERN: Watch prop changes, but allow group:selected to be the primary source of truth
watch(() => props.expanded, (newValue) => {
  internalExpanded.value = newValue ?? true
})

// LEARNING: Handle panel selection changes from Vuetify group
// WHY: Ensures expansion state reflects the actual UI state
// PATTERN: Update internal state when VExpansionPanel emits group:selected
const handleExpansionChange = (event: { value: boolean }): void => {
  internalExpanded.value = event.value
}

// LEARNING: Use internal ref for expansion state
// WHY: Internal ref is updated by group:selected, ensuring UI and state are aligned
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
 * LEARNING: Scoped logger for EntityCard debugging
 * WHY: Provides structured logging for debugging form state, metadata loading, and save operations
 * PATTERN: Use createLogger with scope name, enable via VITE_DEBUG_SCOPES=EntityCard
 */
const logger = createLogger('EntityCard')

/**
 * LEARNING: Vee-Validate form instance
 * WHY: DynamicFormFields needs form instance for field validation and management
 *      Title field also needs form instance for editing
 * PATTERN: Use provided form instance or create new one, initialize with entity values BEFORE fields are created
 * FIX: Initialize form with entity from store (has relationships) instead of props.entity
 * NOTE: Must be defined before titleFieldContext watch that uses it
 */
const form = props.form || useForm({
  // LEARNING: Initialize form with entity from props initially
  // WHY: Store sync composable will handle updating form when store entity loads
  // PATTERN: Initialize with props.entity, store sync will update when store entity is available
  initialValues: {
    ...props.entity,
  }
})

// LEARNING: Explicitly set form values to ensure they're available immediately
// WHY: Vee-Validate might not populate form.values immediately from initialValues
//      Setting values explicitly ensures form.values is populated before field contexts are created
// PATTERN: Use setValues to populate form.values synchronously
if (!props.form) {
  form.setValues({
    ...props.entity,
  })
  // LEARNING: EntityCard form initialization logs are opt-in only
  // WHY: Reduces console noise - only log when explicitly enabled via VITE_DEBUG_SCOPES=EntityCard
  // PATTERN: Use isScopeExplicitlyEnabled to require explicit enabling
  if (isScopeExplicitlyEnabled('EntityCard')) {
    logger.debug('Form initialized', { 
      entityKey: props.entityKey, 
      entityId: props.entity.id, 
      isNew: props.isNew,
      initialValues: Object.keys(props.entity)
    })
  }
}

/**
 * LEARNING: Use store sync composable to handle form synchronization
 * WHY: Extracts complex store entity sync logic into dedicated composable
 * PATTERN: Composable handles all sync scenarios (ID change, initial load, field updates)
 * NOTE: Only sync if form wasn't provided by parent (parent handles sync in that case)
 */
const storeSyncResult = !props.form && !props.isNew ? useEntityCardStoreSync({
  entityKey: props.entityKey,
  entityId: computed(() => String(props.entity.id)),
  form,
  isNew: props.isNew,
  getStoreEntity: () => {
    if (props.isNew) {
      return undefined
    }
    return admin.getEntity(props.entityKey, props.entity.id) || undefined
  },
  initialEntity: props.entity
}) : null

// LEARNING: Get store entity for form initialization
// WHY: Store entity has relationships attached via adminTransformer, props.entity might not
// PATTERN: Use store entity (with relationships) as source of truth for form initialization
const storeEntity = computed(() => {
  if (props.isNew) {
    return props.entity
  }
  const storeEntityValue = admin.getEntity(props.entityKey, props.entity.id)
  return storeEntityValue || props.entity
})
const instanceConfig = computed(() => adminConfig.getInstanceConfig(props.entityKey).value || {})

// LEARNING: Use unified metadata composable for all entity types
// WHY: Single composable handles all entity types without special casing
// PATTERN: Pass entityKey and entity, composable handles entity type mapping and inheritance
// NOTE: If filtered metadata is provided via prop, use that instead of fetching
const fetchedMetadata = useEntityMetadata(
  props.entityKey,
  computed(() => props.entity)
)

// LEARNING: Use unified metadata (already includes both primitive and relationship metadata)
// WHY: useEntityMetadata.getMetadata() already merges primitive and relationship metadata
// PATTERN: Use fetchedMetadata directly - no additional merging needed
const composedFieldMetadata = computed(() => {
  if (props.fieldMetadata) {
    // LEARNING: When filtered metadata is provided, use it as-is
    // WHY: Parent components (like bulk edit modals) have already filtered to desired fields
    // PATTERN: Parent controls which fields to show
    return props.fieldMetadata
  }
  
  // LEARNING: fetchedMetadata.fieldMetadata already includes both primitive and relationship metadata
  // WHY: useAdmin().getMetadata() merges them automatically
  // PATTERN: Use directly without additional merging
  return fetchedMetadata.fieldMetadata.value
})
const isMetadataLoading = computed(() => {
  // LEARNING: Metadata is synchronous from GlobalData, so isLoading is always false
  // WHY: useEntityMetadata returns isLoading: computed(() => false)
  // PATTERN: Use fetchedMetadata.isLoading directly
  return fetchedMetadata.isLoading.value
})

// LEARNING: Computed to check if metadata is ready (unified metadata includes both primitive and relationship)
// WHY: Gate warnings until metadata is fully loaded and can be meaningfully displayed
// PATTERN: Check metadata is loaded and has keys
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

// LEARNING: Log field context creation
// WHY: Helps debug field rendering issues
// PATTERN: Watch fieldsNeedingContexts to log when contexts are created
watch(() => formFields.fieldsNeedingContexts.value, (fieldsNeedingContexts) => {
  if (fieldsNeedingContexts.length > 0) {
    logger.debug('Fields needing contexts', { 
      entityKey: props.entityKey, 
      entityId: props.entity.id,
      fieldsNeedingContexts: fieldsNeedingContexts.map(String)
    })
  }
})

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
  
  const missing = allCategorizedFields.filter(fieldKey => !getFieldContext(fieldKey))
  
  if (missing.length > 0) {
    logger.debug('Fields missing contexts', { 
      entityKey: props.entityKey, 
      entityId: props.entity.id,
      missingFields: missing.map(String)
    })
  }
  
  return missing
})

/**
 * LEARNING: Get BlockShape properties for conditional field visibility
 * WHY: Composition panel visibility depends on BlockShape.composable property
 * PATTERN: Use useInstanceShape composable to access BlockShape from BlockInstance
 */
const instanceShape = props.entityKey === 'blockInstance' 
  ? useInstanceShape({
      entityKey: 'blockInstance',
      entityId: computed(() => props.entity.id)
    })
  : null

const isComposable = computed(() => {
  if (props.entityKey !== 'blockInstance') return false
  return instanceShape?.blockShape.value?.composable === true
})

/**
 * LEARNING: Use field location dispatcher for location assignment
 * WHY: Single source of truth for WHERE fields render based on metadata
 * PATTERN: Composable that determines field locations from metadata + context
 * FIX: Use internal isExpanded computed (synced via group:selected + prop watch)
 *      This ensures field location updates reactively when expansion state changes
 */
const fieldLocation = useFieldLocation({
  fieldKeys: computed(() => fieldKeys.value as GlobalFieldKey<GlobalEntityKey>[]),
  fieldMetadata: composedFieldMetadata,
  isExpanded: isExpanded
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
 * LEARNING: Filter fields based on conditional visibility rules
 * WHY: Some fields should only show under certain conditions (e.g., composite when composable=true)
 * PATTERN: Filter categorizedFields after location dispatch but before rendering
 */
const filteredCategorizedFields = computed(() => {
  const base = categorizedFields.value
  
  // Get form values for conditional checks
  const formValues = form.values
  
  // Filter composite field: only show when BlockShape.composable === true
  const filteredDirectStacked = base.directFields.stacked.filter(fieldKey => {
    if (String(fieldKey) === 'composite') {
      return isComposable.value === true
    }
    return true
  })
  
  const filteredDirectInline = base.directFields.inline.filter(fieldKey => {
    if (String(fieldKey) === 'composite') {
      return isComposable.value === true
    }
    return true
  })
  
  // Filter instanceComponents: only show when composite=true AND composable=true
  const filteredRelationships = base.subPanelFields.relationships.filter(fieldKey => {
    if (String(fieldKey) === 'instanceComponents') {
      const compositeValue = formValues.composite === true
      return compositeValue && isComposable.value === true
    }
    return true
  })
  
  return {
    ...base,
    directFields: {
      inline: filteredDirectInline,
      stacked: filteredDirectStacked
    },
    subPanelFields: {
      ...base.subPanelFields,
      relationships: filteredRelationships
    }
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
  logger.debug('Save triggered', { 
    entityKey: props.entityKey, 
    entityId: props.entity.id,
    isDirty: form.meta.value.dirty,
    formValues: Object.keys(form.values || {})
  })
  
  await _handleSave()
  
  // LEARNING: Reset form with updated entity values from store after save
  // WHY: After save, entity is updated in store, form should reflect the saved values
  // PATTERN: Wait for next tick to ensure store is updated, then get entity and reset form
  // NOTE: Vue Query mutations update cache, but we wait a tick to ensure propagation
  await nextTick()
  
  if (!props.isNew) {
    const savedEntity = admin.getEntity(props.entityKey, props.entity.id)
    if (savedEntity) {
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
      logger.debug('Form reset after save', { entityId: props.entity.id })
    }
    // Note: If savedEntity is not found, form will keep current values (acceptable fallback)
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
 * LEARNING: Duplicate handler that emits duplicate event for parent to handle
 * WHY: Allows parent (InstancesTab) to show inline creation card with pre-filled values
 * PATTERN: Emit event instead of creating immediately - same pattern as create flow
 */
const handleDuplicate = (): void => {
  // Only allow duplication for block instances
  if (props.entityKey !== 'blockInstance') {
    return
  }

  // Get current entity values (saved values, not form.values which may have unsaved changes)
  const currentEntity = props.entity as GlobalEntity<'blockInstance'>
  
  // Emit duplicate event - parent will handle showing inline creation card
  emit('duplicate', currentEntity)
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
// Note: statusButtonToggle removed - unused (onToggle callback not needed)
// const statusButtonToggle = useStatusButtonToggle({ ... })

/**
 * LEARNING: Container click handler for debugging
 * WHY: Can be used to detect event propagation issues
 * PATTERN: Separate method for template event handler
 */
// Note: handleContainerClick removed - unused

/**
 * LEARNING: Handle title row clicks - prevent expansion panel from intercepting interactive element clicks
 * WHY: Status buttons and editable input fields are in title row, but clicks should interact with those elements, not expand panel
 * PATTERN: Stop propagation for clicks on interactive elements (status buttons, editable input fields, etc.)
 */
const handleTitleRowClick = (event: Event): void => {
  // LEARNING: Stop propagation if click is on interactive elements (status buttons, editable input fields, etc.)
  // WHY: Allow clicks on empty space or read-only fields to expand panel, but prevent clicks on editable interactive elements from expanding
  // PATTERN: Check if click target is an interactive element or its parent, then check if it's editable before stopping propagation
  const target = event.target as HTMLElement
  
  // Check for status buttons
  const isStatusButton = target.closest('.v-chip') || target.closest('[role="switch"]')
  
  // Check for input fields (input, textarea, select, or elements within a field container)
  const inputElement = target.closest('input') || 
                       target.closest('textarea') || 
                       target.closest('select')
  const fieldContainer = target.closest('.v-field') ||
                         target.closest('.v-input') ||
                         target.closest('.v-text-field') ||
                         target.closest('.v-select') ||
                         target.closest('.v-autocomplete') ||
                         target.closest('.v-combobox')
  
  // Only stop propagation if:
  // 1. It's a status button, OR
  // 2. It's an editable input field (not disabled/readonly)
  if (isStatusButton) {
    // Status button click - let it handle the click, don't expand panel
    event.stopPropagation()
  } else if (inputElement) {
    // Check if input is editable (not disabled or readonly)
    const isEditable = !(inputElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).disabled &&
                       !(inputElement as HTMLInputElement | HTMLTextAreaElement).readOnly
    if (isEditable) {
      // Editable input field click - let it handle the click, don't expand panel
      event.stopPropagation()
    }
    // If input is read-only or disabled, allow click to propagate (expand panel)
  } else if (fieldContainer) {
    // Check if field container contains a disabled or readonly input
    const containedInput = fieldContainer.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    if (containedInput && !containedInput.disabled && !(containedInput as HTMLInputElement | HTMLTextAreaElement).readOnly) {
      // Editable field container click - let it handle the click, don't expand panel
      event.stopPropagation()
    }
    // If field container has disabled/readonly input, allow click to propagate (expand panel)
  }
  // Otherwise, allow default behavior (expand/collapse panel)
}

/**
 * LEARNING: Handle title row keyboard events - prevent expansion panel from intercepting spacebar when typing in input fields
 * WHY: VExpansionPanel has default keyboard behavior (Space toggles expansion), but spacebar should type in input fields, not toggle panel
 * PATTERN: Check if event originated from an input field, and if so, prevent spacebar from toggling the panel
 */
const handleTitleRowKeydown = (event: KeyboardEvent): void => {
  // Only handle spacebar key - let Enter/Return pass through to field handlers
  if (event.key !== ' ' && event.key !== 'Spacebar' && event.keyCode !== 32) {
    return
  }
  
  // LEARNING: Check event.target to see where the event originated
  // WHY: event.target tells us the actual element that triggered the event, which is more reliable than document.activeElement
  // PATTERN: Check event.target first, then fall back to document.activeElement if needed
  const target = event.target as HTMLElement
  const activeElement = document.activeElement as HTMLElement
  
  // Helper function to check if an element is or contains an input field
  const isInputFieldElement = (element: HTMLElement | null): boolean => {
    if (!element) return false
    return (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT' ||
      !!element.closest('input') ||
      !!element.closest('textarea') ||
      !!element.closest('select') ||
      !!element.closest('.v-field') ||
      !!element.closest('.v-input') ||
      !!element.closest('.v-text-field') ||
      !!element.closest('.v-select') ||
      !!element.closest('.v-autocomplete') ||
      !!element.closest('.v-combobox')
    )
  }
  
  // Check if event originated from an input field
  const isInputField = isInputFieldElement(target) || isInputFieldElement(activeElement)
  
  if (isInputField) {
    // Find the actual input element to check if it's editable
    const findInputElement = (element: HTMLElement | null): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null => {
      if (!element) return null
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
        return element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      }
      return (element.closest('input') || element.closest('textarea') || element.closest('select')) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    }
    
    const inputElement = findInputElement(target) || findInputElement(activeElement)
    
    if (inputElement) {
      const isEditable = !inputElement.disabled &&
                        !(inputElement as HTMLInputElement | HTMLTextAreaElement).readOnly
      
      if (isEditable) {
        // LEARNING: Event originated from an editable input field - prevent spacebar from toggling panel
        // WHY: Spacebar should type in the input field, not toggle the expansion panel or cause blur
        // PATTERN: Stop propagation immediately to prevent VExpansionPanel from handling the spacebar
        event.stopPropagation()
        // Don't preventDefault - we want spacebar to type in the input normally
        return
      }
    }
  }
  // Otherwise, allow default behavior (spacebar toggles expansion panel)
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
  handleSave,
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
    @group:selected="handleExpansionChange"
    @keydown="handleTitleRowKeydown"
  >
    <template #title>
      <div 
        class="d-flex align-center gap-2 flex-grow-1 flex-wrap"
        @click="handleTitleRowClick"
        @keydown="handleTitleRowKeydown"
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
      <!-- LEARNING: VExpansionPanel already provides card styling, so use div instead of nested VCard -->
      <!-- WHY: VExpansionPanel has card-like appearance, adding VCard inside creates "card within card" visual issue -->
      <!-- PATTERN: Use div wrapper when useExpansionPanel=true, VCard wrapper when useExpansionPanel=false -->
      <div class="entity-card-content pa-4">
        <EntityCardContent
          :entity-key="entityKey"
          :entity-id="entity.id"
          :entity="entity"
          :form="form"
          :get-field-context="getFieldContext"
          :composed-field-metadata="composedFieldMetadata"
          :categorized-fields="filteredCategorizedFields"
          :fields-missing-contexts="fieldsMissingContexts"
          :is-form-ready="isFormReady"
          :is-new="props.isNew"
          :handle-save="handleSave"
          :handle-undo="handleUndo"
          :handle-duplicate="handleDuplicate"
          :handle-delete-click="handleDeleteClick"
          :handle-cancel="handleCancel"
          :unified-save-state="unifiedSaveState"
        />
      </div>
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
    <div v-if="titleRowFields.length > 0 && isFormReady" class="d-flex align-center gap-2 mb-4 flex-wrap">
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

    <EntityCardContent
      :entity-key="entityKey"
      :entity-id="entity.id"
      :entity="entity"
      :form="form"
      :get-field-context="getFieldContext"
      :composed-field-metadata="composedFieldMetadata"
      :categorized-fields="filteredCategorizedFields"
      :fields-missing-contexts="fieldsMissingContexts"
      :is-form-ready="isFormReady"
      :is-new="props.isNew"
      :handle-save="handleSave"
      :handle-undo="handleUndo"
      :handle-duplicate="handleDuplicate"
      :handle-delete-click="handleDeleteClick"
      :handle-cancel="handleCancel"
      :unified-save-state="unifiedSaveState"
    />
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


