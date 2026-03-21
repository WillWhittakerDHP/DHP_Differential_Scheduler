<!--
  WHY: Reusable card component for all entity types (blockShape, partShape, blockInstance, partInstance)
  PATTERN: Generic component that accepts entityKey and entity, handles all CRUD operations
  COMPARISON: React uses GenericInstance. Vue uses EntityCard with DynamicFormFields.
  BENEFITS: DRY, configurable, testable, easier to maintain
-->
<script setup lang="ts">
import { computed, provide } from 'vue'
import type { FormContext } from 'vee-validate'
import { useEntityCardForm } from '@/composables/admin/useEntityCardForm'
import { useEntityCardSaveAndActions } from '@/composables/admin/useEntityCardSaveAndActions'
import { entityDisplay } from '@/utils/admin/entityDisplay'
import { useEntityStatus } from '@/composables/admin/useEntityStatus'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useEntityCardMetadata } from '@/composables/admin/useEntityCardMetadata'
import { useEntityCardFormSetup } from '@/composables/admin/useEntityCardFormSetup'
import type { GlobalEntity } from '@/types/entities'
import { FIELD_VISIBILITY, type FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalEntityKey } from '@/constants/entities'
import FieldRenderer from './fields/FieldRenderer.vue'
import EntityCardContent from './EntityCardContent.vue'
import EntityCardPartsTotals from './EntityCardPartsTotals.vue'
import EntityCardFeePreview from './EntityCardFeePreview.vue'
import { useEntityCardExpansion } from '@/composables/admin/useEntityCardExpansion'
import { useEntityCardFieldContextAndVisibility } from '@/composables/admin/useEntityCardFieldContextAndVisibility'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY } from './entityCardConstants'
import { entityCardTitleKeydown } from '@/utils/admin/entityCardTitleKeydown'
import { createLogger } from '@/utils/logger'
import { listSortedUserTypeBlockInstances } from '@/utils/admin/userTypeBlockInstances'
import { Icon } from '@iconify/vue'
import { VExpansionPanel, VCard } from 'vuetify/components'

/**
 *      Since we explicitly declare all props, we don't need automatic inheritance
 */
defineOptions({
  inheritAttrs: false
})

interface Props<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: GlobalEntity<GE>
  expanded?: boolean
  useExpansionPanel?: boolean
  form?: FormContext
  isNew?: boolean
  disableAutoSave?: boolean
  fieldMetadata?: Record<string, FieldMetadataEntry>
  /** Set when this card is a child inside RelationshipCollection; true if parent block shape is state control (user type). */
  parentBlockShapeIsStateControl?: boolean
}

const props = withDefaults(defineProps<Props<GlobalEntityKey>>(), {
  expanded: true,
  isNew: false,
  disableAutoSave: false,
  useExpansionPanel: true,
  parentBlockShapeIsStateControl: false,
})

interface Emits {
  (e: 'delete', id: string): void
  (e: 'saved', entity: GlobalEntity<GlobalEntityKey>): void
  (e: 'cancelled'): void
  (e: 'duplicate', entity: GlobalEntity<GlobalEntityKey>): void
}

const emit = defineEmits<Emits>()

/**
 */
const { isExpanded, handleExpansionChange } = useEntityCardExpansion({
  expanded: computed(() => props.expanded ?? true)
})
const { handleTitleKeydown } = entityCardTitleKeydown()

/**
 * WHY: Use entity display composable for display name and messages
WHY: Moves d...
 */
const entityDisplayComposable = entityDisplay(useAdminConfig())
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

// WHY: Reduces component complexity by moving metadata logic to composable
// PATTERN: Composable provides composedFieldMetadata and isMetadataLoading
const { composedFieldMetadata: baseComposedFieldMetadata, isMetadataLoading } = useEntityCardMetadata({
  entityKey: props.entityKey,
  entity: props.entity,
  filteredMetadata: props.fieldMetadata
})

/**
 * WHY: Per-user annotation editor syncs `text` + `contentRows`; hide primitive `text` via metadata (field location dispatcher), not a parallel filter composable.
 */
const composedFieldMetadata = computed(() => {
  const base = baseComposedFieldMetadata.value
  if (props.entityKey !== 'annotationInstance') {
    return base
  }
  if (props.parentBlockShapeIsStateControl) {
    return base
  }
  if (listSortedUserTypeBlockInstances(admin).length === 0) {
    return base
  }
  const textEntry = base.text
  if (!textEntry) {
    return base
  }
  return {
    ...base,
    text: { ...textEntry, visibility: FIELD_VISIBILITY.HIDDEN },
  }
})

const {
  formFields,
  fieldKeys: _fieldKeys,
  isMetadataReady,
  entityName,
  isComposable,
  finalFieldKeys: _finalFieldKeys,
  fieldLocation,
  inlineFieldsConfig: _inlineFieldsConfig,
  stackedFieldsConfig: _stackedFieldsConfig,
  isFormReady,
} = useEntityCardFormSetup({
  entityKey: props.entityKey,
  entity: props.entity,
  composedFieldMetadata,
  isMetadataLoading,
  isExpanded,
  filteredMetadata: props.fieldMetadata,
  form,
  adminConfig,
})

const { getFieldContext, fieldsMissingContexts, filteredFieldsByLocation } =
  useEntityCardFieldContextAndVisibility({
    formFields,
    fieldLocation,
    isMetadataLoading,
    isMetadataReady,
    entityKey: props.entityKey,
    isComposable,
    form: form.value!,
    logger,
  })

const {
  handleSave,
  handleUndo,
  showDeleteDialog,
  handleDeleteClick,
  handleDelete,
  handleCancelDelete,
  handleCancel,
  handleDuplicate,
  unifiedSaveState,
} = useEntityCardSaveAndActions({
  entityKey: props.entityKey,
  entity: props.entity,
  isNew: props.isNew,
  form,
  admin,
  emit,
  logger,
})

provide(ENTITY_CARD_SAVE_KEY, {
  handleSave,
  isNew: props.isNew,
  disableAutoSave: props.disableAutoSave
})

provide(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, props.disableAutoSave)

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
  // PATTERN: Expose computed properties for external access
  isMetadataReady,
  isFormReady: formFields.isFormReady
})
</script>

<template>
  <!--
    WHY: EntityCard owns its rendering - title row, expand/collapse, and content
    PATTERN: When useExpansionPanel=true, wraps in VExpansionPanel. When false (modals), renders content directly.
    NOTE: When used inside parent VExpansionPanels, EntityCard renders as VExpansionPanel. When standalone, renders content directly.
  -->
  <VExpansionPanel
    v-if="props.useExpansionPanel"
    :value="String(entity.id)"
    :class="[
      $attrs.class,
      entityKey === 'blockInstance'
        ? 'entity-card-expansion--instance-reorder'
        : entityKey === 'blockShape' || entityKey === 'partShape'
          ? 'entity-card-expansion--shape-list-reorder'
          : undefined,
    ]"
    @group:selected="handleExpansionChange"
    @keydown.capture="handleTitleKeydown"
  >
    <template #title>
      <div
        class="d-flex flex-column gap-2 flex-grow-1"
        :class="{
          'entity-card-title--reorder-indent':
            entityKey === 'blockInstance' || entityKey === 'blockShape' || entityKey === 'partShape',
        }"
        @keydown="handleTitleKeydown"
      >
        <div class="d-flex align-center gap-2 flex-wrap">
          <!--
            WHY: Native HTML5 drag does not start from descendants of <button> (VExpansionPanelTitle).
            PATTERN: .instance-drag-handle lives in the panel default slot (sibling of title), positioned over the title rail — see below.
          -->
          <!-- WHY: Name field should be on the left side of the title row -->
          <!-- PATTERN: Render name field first, then status buttons on the right -->
          <template v-if="titleRowFields.length > 0 && isFormReady">
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
        
        <!-- WHY: Shows parts totals at top of card when entity can have parts -->
        <!-- PATTERN: Component renders conditionally based on canHaveParts flag -->
        <EntityCardPartsTotals
          :entity-key="entityKey"
          :entity-id="entity.id"
        />
      </div>
    </template>
    
    <template #text>
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
          :parent-block-shape-is-state-control="props.parentBlockShapeIsStateControl"
          :handle-save="handleSave"
          :handle-undo="handleUndo"
          :handle-duplicate="handleDuplicate"
          :handle-delete-click="handleDeleteClick"
          :handle-cancel="handleCancel"
          :unified-save-state="unifiedSaveState"
        />
      </div>
    </template>
    <!--
      WHY: Sibling of VExpansionPanelTitle (not inside its <button>) so the panel’s native draggable + FormKit dragHandle work on desktop.
      PATTERN: Absolutely positioned over the title area; matches useInstanceDragAndDrop dragHandle selector inside .v-expansion-panel.
    -->
    <span
      v-if="entityKey === 'blockInstance'"
      class="instance-drag-handle instance-drag-handle--floated"
      role="img"
      aria-label="Drag to reorder"
      @click.stop
    >
      <Icon
        icon="tabler:grip-vertical"
        width="20"
        height="20"
        class="instance-drag-handle-icon"
        aria-hidden="true"
      />
    </span>
    <!--
      WHY: FormKit drag on the whole panel steals clicks from VExpansionPanelTitle; grip + dragHandle matches Instances tab.
      PATTERN: Same floated grip as blockInstance; used only for block/part shape lists in ShapesTab.
    -->
    <span
      v-else-if="entityKey === 'blockShape' || entityKey === 'partShape'"
      class="shape-list-drag-handle shape-list-drag-handle--floated"
      role="img"
      aria-label="Drag to reorder"
      @click.stop
    >
      <Icon
        icon="tabler:grip-vertical"
        width="20"
        height="20"
        class="shape-list-drag-handle-icon"
        aria-hidden="true"
      />
    </span>
  </VExpansionPanel>

  <!--
    WHY: Modals don't need VExpansionPanel wrapper, just render content directly
    PATTERN: Conditional rendering based on useExpansionPanel prop
  -->
  <div v-else class="entity-card-content">
    <!-- WHY: TitleRow fields should still be visible even without expansion panel -->
    <div
      v-if="titleRowFields.length > 0 && isFormReady"
      class="d-flex align-center gap-2 mb-4 flex-wrap"
      @keydown="handleTitleKeydown"
    >
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
      :parent-block-shape-is-state-control="props.parentBlockShapeIsStateControl"
      :handle-save="handleSave"
      :handle-undo="handleUndo"
      :handle-duplicate="handleDuplicate"
      :handle-delete-click="handleDeleteClick"
      :handle-cancel="handleCancel"
      :unified-save-state="unifiedSaveState"
    />
  </div>
  <!--
    WHY: Provides confirmation before deleting entity
    PATTERN: VDialog with confirmation message
  -->
  <VDialog v-model="showDeleteDialog" max-width="400px">
    <VCard>
      <VCardTitle class="text-headline-small">{{ getEntityDeleteTitle(entityKey) }}</VCardTitle>
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

<style scoped>
/*
  WHY: VExpansionPanelTitle renders .v-expansion-panel-title__overlay first, absolutely covering the button.
       At opacity 0 it still captures pointers, so the drag handle never receives hover (cursor stays default).
  PATTERN: pointer-events: none on that overlay only for block-instance cards that expose a reorder grip.
*/
:deep(.entity-card-expansion--instance-reorder .v-expansion-panel-title__overlay),
:deep(.entity-card-expansion--shape-list-reorder .v-expansion-panel-title__overlay) {
  pointer-events: none;
}

/* WHY: Floated grip sits over the title rail — indent title content so it does not sit under the icon */
.entity-card-title--reorder-indent {
  padding-inline-start: 2.5rem;
}

.entity-card-expansion--instance-reorder,
.entity-card-expansion--shape-list-reorder {
  position: relative;
}

.instance-drag-handle {
  cursor: grab;
  touch-action: none;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
  padding: 4px;
  z-index: 2;
}

.instance-drag-handle--floated {
  position: absolute;
  left: 10px;
  /* WHY: Align with expansion title row (~min-height 48px / 2) */
  top: calc(var(--v-expansion-panel-title-min-height, 48px) / 2);
  transform: translateY(-50%);
}

.instance-drag-handle:active {
  cursor: grabbing;
}

/* WHY: Inline SVG from Iconify uses currentColor — match Vuetify medium-emphasis text */
.instance-drag-handle-icon {
  display: block;
  flex-shrink: 0;
  cursor: grab;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.shape-list-drag-handle {
  cursor: grab;
  touch-action: none;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
  padding: 4px;
  z-index: 2;
}

.shape-list-drag-handle--floated {
  position: absolute;
  left: 10px;
  top: calc(var(--v-expansion-panel-title-min-height, 48px) / 2);
  transform: translateY(-50%);
}

.shape-list-drag-handle:active {
  cursor: grabbing;
}

.shape-list-drag-handle-icon {
  display: block;
  flex-shrink: 0;
  cursor: grab;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
