<!--
  WHY: Annotation copy varies by wizard user type; one row per user type plus a chosen default for the generic row and `annotation_instances.text`.
  PATTERN: Syncs `text` + `contentRows` on the vee-validate form (see resolveAnnotationTextForAssignment on server).
-->
<script setup lang="ts">
import {
  useAnnotationContentEditor,
  type UseAnnotationContentEditorProps,
} from '@/composables/admin/useAnnotationContentEditor'

const props = defineProps<UseAnnotationContentEditorProps>()

const { userTypeBlockInstances, perUserTexts, defaultUserTypeInstanceId, setPerUserText } =
  useAnnotationContentEditor(props)
</script>

<template>
  <div
    v-if="userTypeBlockInstances.length > 0"
    class="annotation-content-editor mt-4"
  >
    <div class="text-subtitle-2 mb-1">
      Text by user type
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Each row is stored for that wizard user type. Mark one row as the default fallback when no row matches the assignment; that value is also kept in sync with the annotation’s main text field for saves and older code paths.
    </p>

    <VRadioGroup
      v-model="defaultUserTypeInstanceId"
      class="annotation-content-radio-group"
      hide-details
    >
      <div
        v-for="inst in userTypeBlockInstances"
        :key="inst.id"
        class="annotation-user-type-row mb-4"
      >
        <div class="d-flex align-start gap-3">
          <div class="pt-2">
            <VRadio
              :value="String(inst.id)"
              density="comfortable"
            />
          </div>
          <div class="flex-grow-1 min-width-0">
            <div class="d-flex flex-wrap align-center gap-2 mb-1">
              <VLabel class="text-body-2 font-weight-medium mb-0">
                {{ inst.name || 'User type' }}
              </VLabel>
              <VChip
                v-if="defaultUserTypeInstanceId === String(inst.id)"
                size="small"
                variant="tonal"
                color="primary"
              >
                Default fallback
              </VChip>
            </div>
            <VTextarea
              :model-value="perUserTexts[String(inst.id)] ?? ''"
              rows="3"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="(v: string) => setPerUserText(String(inst.id), v)"
            />
          </div>
        </div>
      </div>
    </VRadioGroup>
  </div>
</template>
