<!--
  LEARNING: Generic Entity Card Component
  WHY: Reusable card component for all entity types (blockShape, partShape, blockInstance, partInstance)
  PATTERN: Generic component that accepts entityKey and entity, handles all CRUD operations
  COMPARISON: React uses GenericInstance. Vue uses EntityCard with DynamicFormFields.
  BENEFITS: DRY, configurable, testable, easier to maintain
-->
<script setup lang="ts">
import { computed, provide, watch, nextTick } from 'vue'
import type { FormContext } from 'vee-validate'
import { useEntityCardForm } from '@/composables/admin/useEntityCardForm'
import { useEntityCardActions } from '@/composables/admin/useEntityCardActions'
import { useEntityDisplay } from '@/composables/admin/useEntityDisplay'
import { useEntityStatus } from '@/composables/admin/useEntityStatus'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useFormFields } from '@/composables/useFormFields'
import { useEntityCardComputed } from '@/composables/admin/useEntityCardComputed'
import { useEntityCardMetadata } from '@/composables/admin/useEntityCardMetadata'
import { useEntityCardFieldConfiguration } from '@/composables/admin/useEntityCardFieldConfiguration'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalEntityKey } from '@/constants/entities'
import FieldRenderer from './fields/FieldRenderer.vue'
import EntityCardContent from './EntityCardContent.vue'
import EntityCardPartsTotals from './EntityCardPartsTotals.vue'
import EntityCardFeePreview from './EntityCardFeePreview.vue'
import { useEntityCardSaveState } from '@/composables/admin/useEntityCardSaveState'
import { useEntityCardExpansion } from '@/composables/admin/useEntityCardExpansion'
import { useConditionalFieldVisibility } from '@/composables/admin/useConditionalFieldVisibility'
import { useFieldContextManager } from '@/composables/admin/useFieldContextManager'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, KEY_ENTER } from './entityCardConstants'
import { createLogger } from '@/utils/logger'
import { VExpansionPanel, VCard } from 'vuetify/components'

/**
 *      Since we explicitly declare all props, we don't need automatic inheritance
 */
defineOptions({
  inheritAttrs: false
})

/**
 */
interface Props<GE extends GlobalEntityKey> {
  entityKey: GE
  /**
   */
  entity: GlobalEntity<GE>
  /**
   */
  expanded?: boolean
  /**
   */
  useExpansionPanel?: boolean
  /**
   */
  form?: FormContext
  /**
   */
  isNew?: boolean
  /**
   */
  disableAutoSave?: boolean
  /**
   */
  fieldMetadata?: Record<string, FieldMetadataEntry>
}

const props = withDefaults(defineProps<Props<GlobalEntityKey>>(), {
  expanded: true,
  isNew: false,
  disableAutoSave: false,
  useExpansionPanel: true
})

/**
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
 */
const { isExpanded, handleExpansionChange } = useEntityCardExpansion({
  expanded: computed(() => props.expanded ?? true)
})

/**
 */
function handleTitleKeydown(event: KeyboardEvent): void {
  if (!event.isTrusted) {
    return
  }
  const target = event.target as Element | null
  const key = event.key
  if (key !== ' ' && key !== 'Spacebar' && key !== KEY_ENTER && event.keyCode !== 32 && event.keyCode !== 13) {
    return
  }
  const editable = target?.closest?.('input, textarea, select, [contenteditable="true"]')
  if (!editable) {
    return
  }
  event.stopPropagation()
  event.preventDefault()
  const synthetic = new KeyboardEvent('keydown', {
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    which: event.which,
    bubbles: false,
    cancelable: true
  })
  editable.dispatchEvent(synthetic)
  if (synthetic.defaultPrevented || !('value' in editable) || !('setSelectionRange' in editable)) {
    return
  }
  interface InputLikeElement extends Element {
    value: string
    selectionStart: number | null
    selectionEnd: number | null
    setSelectionRange(start: number, end: number): void
  }
  function isInputLike(el: Element): el is InputLikeElement {
    return 'value' in el && 'setSelectionRange' in el
  }
  if (!isInputLike(editable)) return
  const start = editable.selectionStart ?? editable.value.length
  const end = editable.selectionEnd ?? start
  const char = event.key === KEY_ENTER ? '\n' : ' '
  const before = editable.value.slice(0, start)
  const after = editable.value.slice(end)
  editable.value = before + char + after
  editable.setSelectionRange(start + char.length, start + char.length)
  editable.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * WHY: Use entity display composable for display name and messages
WHY: Moves d...
 */
const entityDisplayComposable = useEntityDisplay()
const {
  getEntityDeleteTitle
} = entityDisplayComposable

/**
 * WHY: Use entity status composable for component status checks
WHY: Moves comp...
 */
void useEntityStatus({
  entityKey: props.entityKey,
  entity: computed(() => props.entity)
})


const adminConfig = useAdminConfig()
const admin = useAdmin()

/**
 */
const logger = createLogger('EntityCard')

/**
 * PATTERN: Single form owner in composable; component only consumes and passes form ref down
 */
const { form } = useEntityCardForm({
  entityKey: props.entityKey,
  entity: props.entity,
  entityId: computed(() => props.entity.id),
  isNew: props.isNew,
  form: props.form
})

/** Form instance for template binding; children require FormContext, not Ref. */
const formForTemplate = computed(() => form.value!)

// LEARNING: Use metadata composable to extract metadata-related computed properties
// WHY: Reduces component complexity by moving metadata logic to composable
// PATTERN: Composable provides composedFieldMetadata and isMetadataLoading
const { composedFieldMetadata, isMetadataLoading } = useEntityCardMetadata({
  entityKey: props.entityKey,
  entity: props.entity,
  filteredMetadata: props.fieldMetadata
})

// LEARNING: Use computed properties composable to extract computed logic
// WHY: Reduces component complexity by moving computed properties to composable
// PATTERN: Composable provides fieldKeys, isMetadataReady, entityName, isComposable
const entityCardComputed = useEntityCardComputed({
  entityKey: props.entityKey,
  entity: props.entity,
  composedFieldMetadata,
  isMetadataLoading
})

// PATTERN: Destructure computed properties from composable
const { fieldKeys, isMetadataReady, entityName, isComposable } = entityCardComputed

// LEARNING: Use field configuration composable to extract field configuration computed properties
// WHY: Reduces component complexity by moving field configuration logic to composable
// PATTERN: Composable provides finalFieldKeys, fieldLocation, inlineFieldsConfig, stackedFieldsConfig
const {
  finalFieldKeys,
  fieldLocation,
  inlineFieldsConfig,
  stackedFieldsConfig
} = useEntityCardFieldConfiguration({
  entityKey: props.entityKey,
  fieldKeys,
  composedFieldMetadata,
  isExpanded,
  filteredMetadata: props.fieldMetadata
})

const formFields = useFormFields({
  entityKey: props.entityKey,
  entityId: computed(() => props.entity.id),
  form,
  fieldKeys: finalFieldKeys,
  fieldMetadata: composedFieldMetadata,
  inlineFieldsConfig,
  stackedFieldsConfig,
  adminConfig
})

watch(() => formFields.fieldsNeedingContexts.value, (fieldsNeedingContexts) => {
  if (fieldsNeedingContexts.length > 0) {
    logger.debug('Fields needing contexts', { 
      entityKey: props.entityKey, 
      entityId: props.entity.id,
      fieldsNeedingContexts: fieldsNeedingContexts.map(String)
    })
  }
})

const isFormReady = computed(() => formFields.isFormReady.value)

/**
 */
const { getFieldContext, fieldsMissingContexts } = useFieldContextManager({
  getFieldContext: formFields.getFieldContext,
  fieldsByLocation: fieldLocation.fieldsByLocation,
  isMetadataLoading,
  isMetadataReady,
  fieldsNeedingContexts: formFields.fieldsNeedingContexts,
})

/**
 * WHY: Some fields should only show under certain conditions (e.g., composite w...
 */
const { filteredFieldsByLocation } = useConditionalFieldVisibility({
  fieldsByLocation: fieldLocation.fieldsByLocation,
  entityKey: props.entityKey,
  isComposable,
  form: form.value!,
})

/**
 * WHY: Extracted to composable to reduce component complexity
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
 * WHY: Unified save state management
PATTERN: Composable that combines form dir...
 */
const unifiedSaveState = useEntityCardSaveState({
  form: form.value!,
  entityKey: props.entityKey,
  entityId: props.entity.id,
  getEntityValues: () => {
    // PATTERN: Get entity from store (has latest saved values) or fall back to props.entity
    const savedEntity = props.isNew ? props.entity : (admin.getEntity(props.entityKey, props.entity.id) || props.entity)
    return savedEntity as Record<string, unknown>
  }
})

/** Reset form with saved entity from store; throws if entity not found (reduces handleSave nesting). */
function resetFormWithSavedEntity(): void {
  const savedEntity = admin.getEntity(props.entityKey, props.entity.id)
  if (!savedEntity) {
    logger.error('Saved entity not found after save', { entityKey: props.entityKey, entityId: props.entity.id })
    throw new Error(`Saved entity not found after save: ${props.entityKey} ${props.entity.id}`)
  }
  form.value!.resetForm({ values: { ...savedEntity } })
  form.value!.setValues({ ...savedEntity })
  logger.debug('Form reset after save', { entityId: props.entity.id })
}

/**
 * WHY: Wrapped save handler that resets unified save state and form after save
...
 */
const handleSave = async (): Promise<void> => {
  logger.debug('Save triggered', { 
    entityKey: props.entityKey, 
    entityId: props.entity.id,
    isDirty: form.value!.meta.value.dirty,
    formValues: Object.keys(form.value!.values !== undefined && form.value!.values !== null ? form.value!.values : {})
  })
  await _handleSave()
  await nextTick()
  if (!props.isNew) {
    resetFormWithSavedEntity()
  }
  unifiedSaveState.resetSaveState()
}

/**
 * LEARNING: Wrapped undo handler that resets unified save state
 */
const handleUndo = (): void => {
  _handleUndo()
  unifiedSaveState.resetSaveState()
}

/**
 * PATTERN: Emit event instead of creating immediately - same pattern as create flow
 */
const handleDuplicate = async (): Promise<void> => {
  if (props.entityKey !== 'blockInstance') {
    return
  }

  const currentEntity = props.entity as GlobalEntity<'blockInstance'>
  
  emit('duplicate', currentEntity)
}

provide(ENTITY_CARD_SAVE_KEY, {
  handleSave,
  isNew: props.isNew,
  disableAutoSave: props.disableAutoSave
})

provide(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, props.disableAutoSave)

/**
 * PATTERN: Call function directly in template when value doesn't need reactivity
 */
const titleRowFields = fieldLocation.titleRowFields


/**
 * WHY: Expose methods and state for parent components (minimal API)
PATTERN: Ex...
 */
defineExpose({
  getFieldContext,
  getNameFieldContext: () => getFieldContext('name'),
  form,
  handleSave,
  // LEARNING: Expose readiness state for parent components (if needed for other purposes)
  // PATTERN: Expose computed properties for external access
  isMetadataReady,
  isFormReady: formFields.isFormReady
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
    :value="entity.id"
    :class="$attrs.class"
    @group:selected="handleExpansionChange"
    @keydown.capture="handleTitleKeydown"
  >
    <template #title>
      <div
        class="d-flex flex-column gap-2 flex-grow-1"
        @keydown="handleTitleKeydown"
      >
        <div class="d-flex align-center gap-2 flex-wrap">
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
                <div v-if="composedFieldMetadata[String(fieldKey)]?.visibility === 'staticAsTitle'" class="title-row-field" @click.stop>
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
                <div v-if="composedFieldMetadata[String(fieldKey)]?.visibility !== 'staticAsTitle'" @click.stop>
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
        
        <!-- LEARNING: Parts totals displayed in title row below name and status buttons -->
        <!-- WHY: Shows parts totals at top of card when entity can have parts -->
        <!-- PATTERN: Component renders conditionally based on canHaveParts flag -->
        <EntityCardPartsTotals
          :entity-key="entityKey"
          :entity-id="entity.id"
        />
      </div>
    </template>
    
    <template #text>
      <!-- LEARNING: VExpansionPanel already provides card styling, so use div instead of nested VCard -->
      <!-- WHY: VExpansionPanel has card-like appearance, adding VCard inside creates "card within card" visual issue -->
      <!-- PATTERN: Use div wrapper when useExpansionPanel=true, VCard wrapper when useExpansionPanel=false -->
      <div class="entity-card-content pa-4">
        <EntityCardFeePreview
          v-if="entityKey === 'blockInstance'"
          :entity-key="entityKey"
          :entity-id="entity.id"
        />
        <EntityCardContent
          :entity-key="entityKey"
          :entity-id="entity.id"
          :entity="entity"
          :form="formForTemplate"
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
    <div
      v-if="titleRowFields.length > 0 && isFormReady"
      class="d-flex align-center gap-2 mb-4 flex-wrap"
      @keydown="handleTitleKeydown"
    >
      <!-- LEARNING: staticAsTitle fields render first, left-justified -->
      <!-- WHY: Name field should be on the left side of the title row, always first -->
      <!-- PATTERN: Use template wrapper with v-if to conditionally render staticAsTitle fields in left container -->
      <div class="flex-grow-1 d-flex align-center gap-2">
        <template
          v-for="fieldKey in titleRowFields"
          :key="fieldKey"
        >
          <div v-if="composedFieldMetadata[String(fieldKey)]?.visibility === 'staticAsTitle'" class="title-row-field">
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
          <div v-if="composedFieldMetadata[String(fieldKey)]?.visibility !== 'staticAsTitle'" @click.stop>
            <FieldRenderer
              :field-context="getFieldContext(fieldKey)"
              :show-label="false"
              :field-metadata="composedFieldMetadata"
            />
          </div>
        </template>
      </div>
    </div>

    <EntityCardFeePreview
      v-if="entityKey === 'blockInstance'"
      :entity-key="entityKey"
      :entity-id="entity.id"
    />
    <EntityCardContent
      :entity-key="entityKey"
      :entity-id="entity.id"
      :entity="entity"
      :form="formForTemplate"
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
      <VCardTitle class="text-h6">{{ getEntityDeleteTitle(entityKey) }}</VCardTitle>
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


