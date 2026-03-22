<script setup lang="ts">
import { computed } from 'vue'
import FieldRenderer from './fields/FieldRenderer.vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { FIELD_VISIBILITY, type FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'

export interface EntityCardPrimaryTitleRowModel {
  titleRowFields: GlobalFieldKey<GlobalEntityKey>[]
  isFormReady: boolean
  isExpanded: boolean
  annotationInstanceShapeTitle: string
  eventInstanceShapeTitle: string
  expansionFallbackTitle: string
  composedFieldMetadata: Record<string, FieldMetadataEntry>
  fieldTreatsAsStaticTitle: (fieldKey: string) => boolean
  getFieldContext: (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ) => FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  readOnlyStaticWhenCollapsed: boolean
  fallbackWhenNotReady?: boolean
}

const props = defineProps<{
  titleRow: EntityCardPrimaryTitleRowModel
}>()

const r = computed<EntityCardPrimaryTitleRowModel>(() => ({
  ...props.titleRow,
  fallbackWhenNotReady: props.titleRow.fallbackWhenNotReady ?? true,
}))
</script>

<template>
  <template v-if="r.titleRowFields.length > 0 && r.isFormReady">
    <div class="flex-grow-1 d-flex align-center gap-2">
      <span
        v-if="r.annotationInstanceShapeTitle"
        class="font-weight-medium text-truncate"
      >{{ r.annotationInstanceShapeTitle }}</span>
      <span
        v-if="r.eventInstanceShapeTitle"
        class="font-weight-medium text-truncate text-medium-emphasis"
      >{{ r.eventInstanceShapeTitle }}</span>
      <template
        v-for="fieldKey in r.titleRowFields"
        :key="fieldKey"
      >
        <div
          v-if="r.fieldTreatsAsStaticTitle(String(fieldKey))"
          class="title-row-field"
          @click.stop
        >
          <FieldRenderer
            :field-context="r.getFieldContext(fieldKey)"
            :show-label="false"
            :field-metadata="r.composedFieldMetadata"
            :read-only="r.readOnlyStaticWhenCollapsed ? !r.isExpanded : undefined"
          />
        </div>
      </template>
    </div>
    <div class="d-flex align-center gap-2 ms-auto">
      <template
        v-for="fieldKey in r.titleRowFields"
        :key="fieldKey"
      >
        <div
          v-if="
            !r.fieldTreatsAsStaticTitle(String(fieldKey)) &&
              r.composedFieldMetadata[String(fieldKey)]?.visibility !== FIELD_VISIBILITY.STATIC_AS_TITLE
          "
          @click.stop
        >
          <FieldRenderer
            :field-context="r.getFieldContext(fieldKey)"
            :show-label="false"
            :field-metadata="r.composedFieldMetadata"
          />
        </div>
      </template>
    </div>
  </template>
  <span
    v-else-if="r.fallbackWhenNotReady"
    class="flex-grow-1"
  >{{ r.expansionFallbackTitle }}</span>
</template>
