<template>
    <div class="annotations-field">
      <!-- Button to add/select annotations -->
      <VBtn
        color="primary"
        variant="outlined"
        size="small"
        prepend-icon="tabler-plus"
        class="mb-4"
        @click="dialogState.openDialog()"
      >
      Add Annotation
      </VBtn>

      <!-- List of selected annotations with metadata editing -->
      <!-- LEARNING: Restructured columns per user request -->
      <!-- WHY: State Context, Type, Text columns - removed Default column (redundant) -->
      <!-- PATTERN: State Context = Generic (if userTypeBlock null) or userTypeBlock value -->
      <VCard v-if="annotationsWithMetadata.length > 0" class="mt-4">
        <VCardTitle class="text-subtitle-1">Selected Annotations</VCardTitle>
        <VCardText>
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-left">State Context</th>
                <th class="text-left">Type</th>
                <th class="text-left">Text</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="ann in sortedAnnotations"
                :key="ann.id"
              >
                <!-- State Context: Generic or UserTypeBlock selection -->
                <td>
                  <VSelect
                    v-model="ann.userTypeBlock"
                    :items="getAvailableUserTypeBlocksForAnnotationLocal(ann)"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="width: 150px"
                    :error="hasDuplicateUserTypeBlockLocal(ann)"
                    :error-messages="hasDuplicateUserTypeBlockLocal(ann) ? ['Another annotation already uses this user type'] : []"
                    @update:model-value="handleUpdateMetadata(ann)"
                  />
                </td>
                <!-- Type: Annotation type/shape -->
                <td>
                  <VSelect
                    v-model="ann.type"
                    :items="annotationTypeOptions"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="width: 150px"
                    item-title="name"
                    item-value="id"
                    :placeholder="(ann as typeof ann & { typeName?: string }).typeName || 'Select type...'"
                    @update:model-value="handleUpdateAnnotationType(ann)"
                  />
                </td>
                <!-- Text: Annotation text content -->
                <td>
                  <div class="text-body-2">{{ ann.text }}</div>
                </td>
                <!-- Actions: Remove button -->
                <td class="text-right">
                  <VBtn
                    icon="tabler-trash"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="handleRemoveAnnotation(ann)"
                  />
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>

      <!-- Empty state -->
      <VAlert
        v-else-if="blockInstanceId"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        No annotations selected. Add annotations using the selector above or create a new one.
      </VAlert>
      
      <!-- New block instance message -->
      <VAlert
        v-else
        type="warning"
        variant="tonal"
        class="mt-4"
      >
        Save the block instance first to manage annotations.
      </VAlert>

    <!-- Dialog for selecting or creating annotation -->
    <VDialog
      v-model="showDialog"
      max-width="700"
    >
      <VCard>
        <VCardTitle>Add or Create Annotation</VCardTitle>
        <VCardText>
          <VTabs v-model="dialogState.dialogTab" class="mb-4">
            <VTab value="select">Select Existing</VTab>
            <VTab value="create">Create New</VTab>
          </VTabs>
          
          <VWindow v-model="dialogState.dialogTab">
            <!-- Select Existing Tab -->
            <VWindowItem value="select">
              <AppSelect
                v-model="selectedAnnotationIds"
                :items="allAnnotationsWithBlockInstances"
                :label="'Select Annotations'"
                :placeholder="'Choose annotations to add...'"
                :multiple="true"
                :chips="true"
                :closable-chips="true"
                item-title="displayText"
                item-value="id"
                class="mb-4"
              />
              
              <!-- User Type selector for selected annotations -->
              <VSelect
                v-model="dialogState.selectedUserTypeBlock"
                :items="userTypeBlockOptions"
                label="User Type (optional)"
                placeholder="Select user type for all selected annotations..."
                variant="outlined"
                :disabled="!selectedAnnotationIds || selectedAnnotationIds.length === 0"
              />
            </VWindowItem>
            
            <!-- Create New Tab -->
            <VWindowItem value="create">
              <VSelect
                v-model="dialogState.newAnnotationType"
                :items="annotationTypeOptions"
                label="Type *"
                placeholder="Select annotation type..."
                variant="outlined"
                item-title="name"
                item-value="id"
                class="mb-4"
                required
              />
              <VTextField
                v-model="dialogState.newAnnotationText"
                label="Annotation Text"
                placeholder="Enter annotation text..."
                variant="outlined"
                class="mb-4"
              />
              <VSelect
                v-model="dialogState.newAnnotationUserTypeBlock"
                :items="userTypeBlockOptions"
                label="User Type (optional)"
                variant="outlined"
              />
            </VWindowItem>
          </VWindow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="handleCloseDialog"
          >
            Cancel
          </VBtn>
          <VBtn
            v-if="dialogState.dialogTab.value === 'select'"
            color="primary"
            :disabled="!selectedAnnotationIds || selectedAnnotationIds.length === 0"
            @click="handleAddSelectedAnnotations"
          >
            Add Selected
          </VBtn>
          <VBtn
            v-else
            color="primary"
            :disabled="!dialogState.newAnnotationText.value.trim() || !dialogState.newAnnotationType"
            @click="handleCreateAnnotation"
          >
            Create
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
/**
 * AnnotationsField Component
 * 
 * LEARNING: Comprehensive field component for managing annotations with metadata
 * WHY: Allows admins to select annotations, edit metadata (userTypeBlock, isDefault, orderIndex), 
 *      create new annotations, and reorder them
 * PATTERN: Uses AnnotationAssignment relationships to manage metadata
 * 
 * Features:
 * - Multi-select from existing annotations
 * - Create new annotations inline
 * - Edit metadata (userTypeBlock, isDefault, orderIndex) for each annotation
 * - Reorder annotations (up/down buttons)
 * - Remove annotations
 */

import { useAnnotationsFieldViewModel } from '@/composables/admin/useAnnotationsFieldViewModel'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

const props = defineProps<Props>()
const { fieldContext } = props

const {
  blockInstanceId,
  metadata,
  dialogState,
  annotationsWithMetadata,
  sortedAnnotations,
  availableAnnotations: _availableAnnotations,
  allAnnotationsWithBlockInstances,
  hasDuplicateUserTypeBlock: hasDuplicateUserTypeBlockLocal,
  getAvailableUserTypeBlocksForAnnotation: getAvailableUserTypeBlocksForAnnotationLocal,
  handleCloseDialog,
  handleAddAnnotations: _handleAddAnnotations,
  handleAddSelectedAnnotations,
  handleCreateAnnotation,
  handleUpdateAnnotationType,
  handleUpdateMetadata,
  handleUpdateDefault: _handleUpdateDefault,
  handleRemoveAnnotation,
} = useAnnotationsFieldViewModel(fieldContext)

// NOTE: Unused handlers prefixed with _ - quick add and default features removed from UI

// LEARNING: Destructure showDialog from dialogState for v-model binding
// WHY: v-model needs direct ref access, not nested property access
// PATTERN: Destructure refs that are used with v-model for proper reactivity
const { showDialog, selectedAnnotationIds } = dialogState

// LEARNING: Destructure computed properties from metadata for template binding
// WHY: VSelect items prop expects array, not computed ref object
// PATTERN: Destructure computed properties that are passed to component props
const { annotationTypeOptions, userTypeBlockOptions } = metadata

</script>

<style scoped lang="scss">
// LEARNING: Add border around entire annotations field including label
// WHY: Visual separation for the annotations management area
// PATTERN: Use :deep() to style parent BaseInput wrapper
:deep(.field-wrapper) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 12px;
  background-color: rgba(var(--v-theme-surface), 1);
}

.annotations-field {
  width: 100%;
}
</style>

