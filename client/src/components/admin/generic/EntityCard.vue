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
import { useEntityCardExpansion } from '@/composables/admin/useEntityCardExpansion'
import { useConditionalFieldVisibility } from '@/composables/admin/useConditionalFieldVisibility'
import { useFieldContextManager } from '@/composables/admin/useFieldContextManager'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY } from './entityCardConstants'
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
   * PATTERN: Optional prop defaults to true (standalone cards are always expanded)
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
 * LEARNING: Expansion state management
 * WHY: Title field should be read-only when collapsed, editable when expanded
 * PATTERN: Use composable for expansion state management
 */
const { isExpanded, handleExpansionChange } = useEntityCardExpansion({
  expanded: computed(() => props.expanded ?? true)
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

// LEARNING: Field location provides inline/stacked fields directly
// WHY: useFieldLocation already categorizes fields by location including layout
// PATTERN: Derive inline/stacked configs from fieldLocation after it's computed

/**
 * LEARNING: Use field location for field categorization
 * WHY: Single source of truth for WHERE fields render based on metadata
 * PATTERN: Composable that determines field locations from metadata + context
 */
const fieldLocation = useFieldLocation({
  fieldKeys: computed(() => fieldKeys.value as GlobalFieldKey<GlobalEntityKey>[]),
  fieldMetadata: composedFieldMetadata,
  isExpanded: isExpanded
})

// LEARNING: Derive inline/stacked configs from fieldLocation
// WHY: useFormFields needs inlineFieldsConfig/stackedFieldsConfig, but we can derive from fieldLocation
// PATTERN: Extract from fieldLocation.fieldsByLocation after fieldLocation is computed
const inlineFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directInline)
const stackedFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directStacked)

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

/**
 * LEARNING: Field context management with warnings
 * WHY: Encapsulates field context retrieval with warnings for missing contexts
 * PATTERN: Use composable for managing field context access
 */
const { getFieldContext, fieldsMissingContexts } = useFieldContextManager({
  getFieldContext: formFields.getFieldContext,
  fieldsByLocation: fieldLocation.fieldsByLocation,
  isMetadataLoading,
  isMetadataReady,
  fieldsNeedingContexts: formFields.fieldsNeedingContexts,
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
 * LEARNING: Conditional field visibility filtering
 * WHY: Some fields should only show under certain conditions (e.g., composite when composable=true)
 * PATTERN: Use composable for filtering fieldsByLocation based on business rules
 */
const { filteredFieldsByLocation } = useConditionalFieldVisibility({
  fieldsByLocation: fieldLocation.fieldsByLocation,
  entityKey: props.entityKey,
  isComposable,
  form,
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
    if (!savedEntity) {
      logger.error('Saved entity not found after save', { entityKey: props.entityKey, entityId: props.entity.id })
      throw new Error(`Saved entity not found after save: ${props.entityKey} ${props.entity.id}`)
    }
    
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

// LEARNING: Title row event handling simplified
// WHY: Use Vue event modifiers (@click.stop, @keydown.space.stop) directly in template
// PATTERN: No complex DOM traversal needed - event modifiers handle it declaratively

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
  >
    <template #title>
      <div 
        class="d-flex align-center gap-2 flex-grow-1 flex-wrap"
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
              <div v-if="composedFieldMetadata[String(fieldKey)]?.visibility === 'staticAsTitle'" @click.stop @keydown.space.stop>
                <FieldRenderer
                  :field-context="getFieldContext(fieldKey)"
                  :show-label="false"
                  :field-metadata="composedFieldMetadata"
                  :read-only="!isExpanded"
                />
              </div>
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
              <div v-if="composedFieldMetadata[String(fieldKey)]?.visibility !== 'staticAsTitle'" @click.stop @keydown.space.stop>
                <FieldRenderer
                  :field-context="getFieldContext(fieldKey)"
                  :show-label="false"
                  :field-metadata="composedFieldMetadata"
                />
              </div>
            </template>
          </div>
        </template>
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
          :fields-by-location="filteredFieldsByLocation"
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
    LEARNING: Render content directly when useExpansionPanel=false (modals)
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
          <div v-if="composedFieldMetadata[String(fieldKey)]?.visibility !== 'staticAsTitle'" @click.stop @keydown.space.stop>
            <FieldRenderer
              :field-context="getFieldContext(fieldKey)"
              :show-label="false"
              :field-metadata="composedFieldMetadata"
            />
          </div>
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
      :fields-by-location="filteredFieldsByLocation"
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


