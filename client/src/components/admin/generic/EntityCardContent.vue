<!--
  LEARNING: Entity Card Content Component
  WHY: Extracts shared form content from EntityCard to eliminate template duplication
  PATTERN: Child component that receives all necessary props for rendering form fields and actions
-->
<script setup lang="ts">
import FieldRenderer from './fields/FieldRenderer.vue'
import EntityCardSubPanels from './EntityCardSubPanels.vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import type { ComputedRef } from 'vue'

interface CategorizedFields {
  directFields: {
    inline: GlobalFieldKey<GlobalEntityKey>[]
    stacked: GlobalFieldKey<GlobalEntityKey>[]
  }
  subPanelFields: {
    parts: GlobalFieldKey<GlobalEntityKey>[]
    relationships: GlobalFieldKey<GlobalEntityKey>[]
    annotations: GlobalFieldKey<GlobalEntityKey>[]
  }
}

interface Props {
  entityKey: GlobalEntityKey
  entityId: string
  entity: GlobalEntity<GlobalEntityKey>
  form: FormContext
  getFieldContext: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  composedFieldMetadata: Record<string, FieldMetadataEntry>
  categorizedFields: CategorizedFields
  fieldsMissingContexts: GlobalFieldKey<GlobalEntityKey>[]
  isFormReady: boolean
  isNew: boolean
  handleSave: () => Promise<void>
  handleUndo: () => void
  handleDeleteClick: () => void
  handleCancel: () => void
  unifiedSaveState: {
    canSave: ComputedRef<boolean>
  }
}

const props = defineProps<Props>()
</script>

<template>
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
    :entity-id="entityId"
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
