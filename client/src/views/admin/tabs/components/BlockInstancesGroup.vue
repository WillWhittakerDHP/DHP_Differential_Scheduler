<!-- Extracted from InstancesTab for component-health (allowlist repair). -->
<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import { instancesTabContextKey } from '@/types/admin/adminInjectionKeys'
import { groupedInstanceDragZoneKey } from '@/composables/admin/useInstanceDragAndDrop'
import type { GlobalEntity } from '@/types/entities'
import { asEmptyArray } from '@/utils/safeDefaults'

const props = defineProps<{
  blockShape: GlobalEntity<'blockShape'>
}>()

const injected = inject(instancesTabContextKey)
if (!injected) throw new Error('BlockInstancesGroup must be used inside InstancesTab')
const ctx = injected as NonNullable<typeof injected>

// inject() returns a plain object so ctx.expandedInstances is a raw Ref —
// VExpansionPanels would receive the Ref wrapper instead of the string[].
const expandedInstances = ctx.expandedInstances

const blockShapeComposableMap = computed(() => ctx.blockShapeComposable.value)
const blockShapeStateControlMap = computed(() => ctx.blockShapeStateControl.value)
const blockShapeValidBookingCascadesMap = computed(() => ctx.blockShapeValidBookingCascades.value)
const bulkEditModeMap = computed(() => ctx.bulkEditMode.value)
const shapeEditModalOpenMap = computed(() => ctx.shapeEditModalOpen.value)
const blockInstances = computed(() => {
  const list = ctx.blockInstancesLists.value.get(props.blockShape.id)?.value
  const main = ctx.mainInstancesByShape.value.get(props.blockShape.id)
  return asEmptyArray(list ?? main)
})
const groupedInstances = computed(() => {
  const zoneKey = groupedInstanceDragZoneKey(props.blockShape.id)
  const fromList = ctx.blockInstancesLists.value.get(zoneKey)?.value
  const fromShape = ctx.groupedInstancesByShape.value.get(props.blockShape.id)
  return asEmptyArray(fromList ?? fromShape)
})
const hasMainOrGrouped = computed(() => blockInstances.value.length > 0 || groupedInstances.value.length > 0)
const cascadeLabel = computed(() => {
  const cascades = asEmptyArray(blockShapeValidBookingCascadesMap.value.get(props.blockShape.id))
  return cascades.length > 0 ? `Cascades: ${cascades.join(', ')}` : 'No Cascades'
})

function setGroupContainer(_id: string, el: HTMLElement | null): void {
  ctx.groupContainers.value.set(props.blockShape.id, el)
}

function setPanelsRefOnMap(
  mapRef: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>,
  el: Element | ComponentPublicInstance | null
): void {
  const elTyped = el as ComponentPublicInstance | HTMLElement | null
  const blockShapeId = props.blockShape.id
  if (!mapRef.value.has(blockShapeId)) {
    mapRef.value.set(blockShapeId, ref(elTyped))
  } else {
    const panelsRef = mapRef.value.get(blockShapeId)
    if (panelsRef) panelsRef.value = elTyped
  }
}

function setGroupPanelsRef(el: Element | ComponentPublicInstance | null): void {
  setPanelsRefOnMap(ctx.groupPanelsContainers, el)
}

function setGroupPanelsGroupedRef(el: Element | ComponentPublicInstance | null): void {
  setPanelsRefOnMap(ctx.groupPanelsGroupedContainers, el)
}
</script>

<template>
  <div class="block-shape-tab-content">
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center gap-2 flex-wrap">
        <VChip
          v-if="blockShapeComposableMap.get(blockShape.id)"
          color="success"
          size="small"
          prepend-icon="tabler-link"
          variant="flat"
        >
          Composable
        </VChip>
        <VChip
          v-if="blockShapeStateControlMap.get(blockShape.id)"
          color="secondary"
          size="small"
          prepend-icon="tabler-toggle-left"
          variant="flat"
        >
          State Control
        </VChip>
        <VChip
          :color="ctx.shapeCascadeColor(blockShape)"
          size="small"
          prepend-icon="tabler-hierarchy"
          variant="tonal"
        >
          {{ cascadeLabel }}
        </VChip>
      </div>
      <div class="d-flex align-center gap-2">
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="ctx.handleCreateClick(blockShape.id)"
        >
          Create
        </VBtn>
        <VBtn
          :color="bulkEditModeMap.get(blockShape.id) ? 'success' : 'default'"
          :variant="bulkEditModeMap.get(blockShape.id) ? 'flat' : 'outlined'"
          prepend-icon="tabler-edit"
          @click="ctx.toggleBulkEditMode(blockShape.id)"
        >
          {{ bulkEditModeMap.get(blockShape.id) ? 'Exit Bulk Edit' : 'Bulk Edit' }}
        </VBtn>
        <VBtn
          :color="shapeEditModalOpenMap.get(blockShape.id) ? 'primary' : 'default'"
          :variant="shapeEditModalOpenMap.get(blockShape.id) ? 'flat' : 'outlined'"
          prepend-icon="tabler-settings"
          @click="ctx.toggleShapeEditModal(blockShape.id)"
        >
          Instance Fields
        </VBtn>
      </div>
    </div>
    <div
      :ref="(el) => setGroupContainer(blockShape.id, el as HTMLElement | null)"
      class="block-instances-container"
    >
      <VExpansionPanels
        v-if="blockInstances.length > 0"
        :ref="setGroupPanelsRef"
        v-model="expandedInstances"
        multiple
      >
        <EntityCard
          v-for="instance in blockInstances"
          :key="instance.id"
          :class="`draggable-instance-${blockShape.id} draggable-instance-item`"
          :data-drag-id="instance.id"
          entity-key="blockInstance"
          :entity="instance"
          :expanded="ctx.isPanelExpanded(instance.id)"
          @saved="ctx.handleExistingBlockInstanceSaved"
          @delete="(id: string) => ctx.handleDeleteBlockInstance(id)"
          @duplicate="ctx.handleDuplicateClick"
        />
      </VExpansionPanels>
      <VCard
        v-if="groupedInstances.length > 0"
        variant="outlined"
        color="warning"
        class="mt-4 grouped-instances-card"
      >
        <VCardTitle class="text-body-large d-flex align-center gap-2">
          <VIcon icon="tabler-folders" size="small" />
          Not standalone-only (add-on only or both)
          <VChip size="small" variant="tonal" class="ml-2">
            {{ groupedInstances.length }}
          </VChip>
        </VCardTitle>
        <VCardText>
          <VExpansionPanels
            :ref="setGroupPanelsGroupedRef"
            v-model="expandedInstances"
            multiple
          >
            <EntityCard
              v-for="instance in groupedInstances"
              :key="instance.id"
              :class="`draggable-instance-${blockShape.id} draggable-instance-item`"
              :data-drag-id="instance.id"
              entity-key="blockInstance"
              :entity="instance"
              :expanded="ctx.isPanelExpanded(instance.id)"
              @saved="ctx.handleExistingBlockInstanceSaved"
              @delete="(id: string) => ctx.handleDeleteBlockInstance(id)"
              @duplicate="ctx.handleDuplicateClick"
            />
          </VExpansionPanels>
        </VCardText>
      </VCard>
      <VAlert
        v-if="!hasMainOrGrouped"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        No BlockInstances found for {{ blockShape.name }}. Create one to get started.
      </VAlert>
      <VDivider class="my-6" />
      <VExpansionPanels v-model="expandedInstances" multiple>
        <EntityCard
          entity-key="blockShape"
          :entity="blockShape"
          :expanded="ctx.isPanelExpanded(blockShape.id)"
        />
      </VExpansionPanels>
    </div>
  </div>
</template>
