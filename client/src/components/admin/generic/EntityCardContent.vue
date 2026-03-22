<!--
  WHY: Extracts shared form content from EntityCard to eliminate template duplication
  PATTERN: Child component that receives all necessary props for rendering form fields and actions
-->
<script setup lang="ts">
import type { FieldsByLocation } from '@/types/admin/conditionalFieldVisibility'
import FieldRenderer from './fields/FieldRenderer.vue'
import AnnotationContentEditor from './fields/AnnotationContentEditor.vue'
import EventInstanceTemplateRef from './fields/EventInstanceTemplateRef.vue'
import EntityCardSubPanels from './EntityCardSubPanels.vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { ComputedRef } from 'vue'
import type { EntityCardSharedProps } from './entityCardConstants'

interface Props extends EntityCardSharedProps {
  entity: GlobalEntity<GlobalEntityKey>
  form: FormContext
  getFieldContext: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  composedFieldMetadata: Record<string, FieldMetadataEntry>
  fieldsByLocation: FieldsByLocation
  fieldsMissingContexts: GlobalFieldKey<GlobalEntityKey>[]
  isFormReady: boolean
  isNew: boolean
  /** True when parent RelationshipCollection is under a state-control block shape (hide per–user-type annotation UI). */
  parentBlockShapeIsStateControl?: boolean
  handleSave: () => Promise<void>
  handleUndo: () => void
  handleDuplicate?: () => Promise<void>
  handleDeleteClick: () => void
  handleCancel: () => void
  unifiedSaveState: {
    canSave: ComputedRef<boolean>
  }
}

defineProps<Props>()
</script>

<template>
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
    <div class="text-body-small mt-2">
      This usually means the field contexts are still being created. If this persists, check that the field is properly configured in /admin-metadata.
    </div>
  </VAlert>

  <!-- WHY: Fields without panel assignment render in main card area -->
  <!-- PATTERN: Organized by layout (inline vs stacked) from metadata -->
  <VRow v-if="fieldsByLocation.directInline.length > 0" class="mb-4">
    <VCol
      v-for="fieldKey in fieldsByLocation.directInline"
      :key="fieldKey"
      cols="12"
      sm="12"
      md="8"
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

  <EventInstanceTemplateRef v-if="entityKey === 'eventInstance'" />

  <div v-for="fieldKey in fieldsByLocation.directStacked" :key="fieldKey" class="mb-4">
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

  <AnnotationContentEditor
    v-if="entityKey === 'annotationInstance' && !parentBlockShapeIsStateControl"
    :entity="entity"
    :form="form"
  />

  <EntityCardSubPanels
    :entity-key="entityKey"
    :entity-id="entityId"
    :entity="entity"
    :form="form"
    :sub-panel-fields="fieldsByLocation.subPanels"
    :get-field-context="getFieldContext"
    :field-metadata="composedFieldMetadata"
  />
  
  <!--
    WHY: Provides Undo, Save, and Delete/Cancel actions
    PATTERN: Buttons at bottom of form fields with proper spacing
    NOTE: Shows Cancel instead of Delete when in new entity mode
  -->
  <div class="d-flex align-center justify-end mt-4 pt-4 form-actions-bar">
    <VBtn
      v-if="!isNew"
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
      :disabled="isNew ? false : !unifiedSaveState.canSave.value"
      @click="handleSave"
      class="mr-2"
    >
      Save
    </VBtn>
    <!-- Duplicate button for existing block instances -->
    <VBtn
      v-if="!isNew && entityKey === 'blockInstance'"
      color="success"
      prepend-icon="tabler-copy"
      @click="handleDuplicate"
      class="mr-2"
    >
      Duplicate
    </VBtn>
    <!-- Delete button for existing entities -->
    <VBtn
      v-if="!isNew"
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
</template>

<style scoped>
.form-actions-bar {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
