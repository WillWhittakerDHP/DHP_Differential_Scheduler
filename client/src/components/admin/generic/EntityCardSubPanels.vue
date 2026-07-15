<script setup lang="ts">
import FieldRenderer from './fields/FieldRenderer.vue'
import RelationshipCollection from './collections/RelationshipCollection.vue'
import TimeBlockEventReadout from './TimeBlockEventReadout.vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { EntityCardSharedProps } from './entityCardConstants'
import { useEntityCardSubPanels, type SubPanelFields } from '@/composables/admin/useEntityCardSubPanels'

interface Props extends EntityCardSharedProps {
  entity: GlobalEntity<GlobalEntityKey>
  form: FormContext
  subPanelFields: SubPanelFields
  getFieldContext: (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ) => FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  fieldMetadata?: Record<string, FieldMetadataEntry>
}

const props = defineProps<Props>()

const {
  blockShapeName,
  partsSummary,
  partsPanelTitle,
  partsBulkEditLabel,
  isRelationshipCollectionField,
  expandedPanels,
  partsBulkEditMode,
  togglePartsBulkEditMode,
  relationshipsSummary,
  eventsPanelTitle,
  showTimeBlockEventReadout,
  showEventsPanel,
  hasAnySubPanelFields,
} = useEntityCardSubPanels(props)
</script>

<template>
  <VExpansionPanels
    v-model="expandedPanels"
    v-if="hasAnySubPanelFields"
    multiple
    class="mt-4"
  >
    <!-- WHY: Shows preview of constituent parts in panel title with bulk edit functionality -->
    <!-- PATTERN: "Parts: Name1, Name2 +X more" format with bulk edit button (similar to InstancesTab) -->
    <VExpansionPanel v-if="subPanelFields.parts.length" value="parts">
      <template #title>
        <div class="d-flex align-center justify-space-between flex-grow-1">
          <div>
            <span class="font-weight-medium">{{ partsPanelTitle }}</span>
            <span v-if="partsSummary" class="ml-2 text-medium-emphasis text-body-medium">
              {{ partsSummary }}
            </span>
          </div>
          <VBtn
            v-if="props.entityKey === 'blockInstance'"
            :variant="partsBulkEditMode ? 'flat' : 'outlined'"
            :color="partsBulkEditMode ? 'success' : undefined"
            size="small"
            prepend-icon="tabler-edit"
            @click.stop="togglePartsBulkEditMode"
          >
            {{ partsBulkEditLabel }}
          </VBtn>
        </div>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.parts" :key="fieldKey" class="mb-4">
          <!-- WHY: Bulk edit button in panel title needs access to RelationshipCollection's exposed methods -->
          <!-- PATTERN: Check component type from metadata - if relationshipCollection, render RelationshipCollection with ref; otherwise use FieldRenderer -->
          <RelationshipCollection
            v-if="isRelationshipCollectionField(fieldKey)"
            ref="partsCollectionRef"
            :field-context="props.getFieldContext(fieldKey)!"
            collection-type="parts"
          />
          <FieldRenderer
            v-else
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

    <!-- WHY: Shows preview of related entities in panel title -->
    <!-- PATTERN: "Relationships: Name1, Name2 +X more" format -->
    <VExpansionPanel v-if="subPanelFields.relationships.length" value="relationships">
      <template #title>
        <span class="font-weight-medium">Relationships</span>
        <span v-if="relationshipsSummary" class="ml-2 text-medium-emphasis text-body-medium">
          {{ relationshipsSummary }}
        </span>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.relationships" :key="fieldKey" class="mb-4">
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

    <!-- WHY: User requested no annotation chips/summary in panel titles -->
    <!-- PATTERN: Simple panel with just "Annotations" label -->
    <VExpansionPanel v-if="subPanelFields.annotations.length" value="annotations">
      <template #title>
        <span class="font-weight-medium">Annotations</span>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.annotations" :key="fieldKey" class="mb-4">
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="false"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

    <!-- WHY: Shows event instances configured for shapes -->
    <!-- PATTERN: Simple panel with "Events" label -->
    <VExpansionPanel v-if="showEventsPanel" value="events">
      <template #title>
        <span class="font-weight-medium">{{ eventsPanelTitle }}</span>
      </template>
      <template #text>
        <TimeBlockEventReadout
          v-if="showTimeBlockEventReadout"
          :block-instance-id="String(entity.id)"
        />
        <div
          v-for="fieldKey in subPanelFields.events"
          v-else
          :key="fieldKey"
          class="mb-4"
        >
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

    <!-- WHY: instanceComponents field renders here when composite and composable -->
    <!-- PATTERN: Title uses blockShapeName for "{BlockShape} Components" -->
    <VExpansionPanel v-if="subPanelFields.composition.length" value="composition">
      <template #title>
        <span class="font-weight-medium">{{ blockShapeName }} Components</span>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.composition" :key="fieldKey" class="mb-4">
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

  </VExpansionPanels>
</template>
