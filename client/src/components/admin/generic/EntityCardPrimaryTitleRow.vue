<script setup lang="ts">
import FieldRenderer from './fields/FieldRenderer.vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { FIELD_VISIBILITY, type FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'

const props = withDefaults(
  defineProps<{
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
    /** When true, static-as-title fields use read-only mode while collapsed (expansion panel). */
    readOnlyStaticWhenCollapsed: boolean
    /** Expansion title rail shows fallback label when metadata/form not ready; modal title row omits fallback. */
    fallbackWhenNotReady?: boolean
  }>(),
  { fallbackWhenNotReady: true }
)
</script>

<template>
  <template v-if="props.titleRowFields.length > 0 && props.isFormReady">
    <div class="flex-grow-1 d-flex align-center gap-2">
      <span
        v-if="props.annotationInstanceShapeTitle"
        class="font-weight-medium text-truncate"
      >{{ props.annotationInstanceShapeTitle }}</span>
      <span
        v-if="props.eventInstanceShapeTitle"
        class="font-weight-medium text-truncate text-medium-emphasis"
      >{{ props.eventInstanceShapeTitle }}</span>
      <template
        v-for="fieldKey in props.titleRowFields"
        :key="fieldKey"
      >
        <div
          v-if="props.fieldTreatsAsStaticTitle(String(fieldKey))"
          class="title-row-field"
          @click.stop
        >
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)"
            :show-label="false"
            :field-metadata="props.composedFieldMetadata"
            :read-only="props.readOnlyStaticWhenCollapsed ? !props.isExpanded : undefined"
          />
        </div>
      </template>
    </div>
    <div class="d-flex align-center gap-2 ms-auto">
      <template
        v-for="fieldKey in props.titleRowFields"
        :key="fieldKey"
      >
        <div
          v-if="
            !props.fieldTreatsAsStaticTitle(String(fieldKey)) &&
              props.composedFieldMetadata[String(fieldKey)]?.visibility !== FIELD_VISIBILITY.STATIC_AS_TITLE
          "
          @click.stop
        >
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)"
            :show-label="false"
            :field-metadata="props.composedFieldMetadata"
          />
        </div>
      </template>
    </div>
  </template>
  <span
    v-else-if="props.fallbackWhenNotReady"
    class="flex-grow-1"
  >{{ props.expansionFallbackTitle }}</span>
</template>
