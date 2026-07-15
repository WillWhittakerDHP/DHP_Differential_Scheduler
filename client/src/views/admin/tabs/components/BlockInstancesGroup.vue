<!-- Extracted from InstancesTab for component-health (allowlist repair). -->
<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import AdminEntityEditorPanel from '@/components/admin/generic/AdminEntityEditorPanel.vue'
import BlockInstanceConvergenceEditors from '@/components/admin/generic/BlockInstanceConvergenceEditors.vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { instancesTabContextKey } from '@/types/admin/adminInjectionKeys'
import { groupedInstanceDragZoneKey } from '@/composables/admin/useInstanceDragAndDrop'
import type { GlobalEntity } from '@/types/entities'
import { asEmptyArray } from '@/utils/safeDefaults'

const props = withDefaults(
  defineProps<{
    blockShape: GlobalEntity<'blockShape'>
    /** Instances-first IA: block shape editor at top, bottom (legacy), or hidden (atomic column when split). */
    blockShapePanelPlacement?: 'top' | 'bottom' | 'none'
  }>(),
  { blockShapePanelPlacement: 'bottom' }
)

const injected = inject(instancesTabContextKey)
if (!injected) throw new Error('BlockInstancesGroup requires instances tab context (provide instancesTabContextKey)')
const ctx = injected as NonNullable<typeof injected>

/**
 * WHY: One shared v-model across multiple VExpansionPanels (main + grouped + block shape) makes Vuetify's
 * group composable fight itself → "Maximum recursive updates" when switching tabs (e.g. Atomic).
 * PATTERN: Each panel stack gets its own model; :expanded still reflects any stack that holds the id.
 */
const expandedTopBlockShape = ref<string[]>([])
const expandedMainInstances = ref<string[]>([])
const expandedGroupedInstances = ref<string[]>([])
const expandedBottomBlockShape = ref<string[]>([])

function isEntityExpanded(entityId: string): boolean {
  return (
    expandedTopBlockShape.value.includes(entityId) ||
    expandedMainInstances.value.includes(entityId) ||
    expandedGroupedInstances.value.includes(entityId) ||
    expandedBottomBlockShape.value.includes(entityId)
  )
}

const blockShapeComposableMap = computed(() => ctx.blockShapeComposable.value)
const blockShapeStateControlMap = computed(() => ctx.blockShapeStateControl.value)
const blockShapeValidBookingCascadesMap = computed(() => ctx.blockShapeValidBookingCascades.value)
const bulkEditModeMap = computed(() => ctx.bulkEditMode.value)
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
  return cascades.length > 0 ? `Allowed active time shapes: ${cascades.join(', ')}` : 'No active time shapes'
})

/** Service / time / price / event instances use the part-ledger convergence path (Feature 20 Phase 3). */
const showPartLedgerConvergence = computed((): boolean => {
  const t = props.blockShape.semanticType
  return (
    t === BLOCK_SHAPE_TYPES.SERVICE ||
    t === BLOCK_SHAPE_TYPES.TIME ||
    t === BLOCK_SHAPE_TYPES.PRICE ||
    t === BLOCK_SHAPE_TYPES.EVENT
  )
})

function setGroupContainer(_id: string, el: HTMLElement | null): void {
  const id = props.blockShape.id
  if (ctx.groupContainers.value.get(id) === el) {
    return
  }
  ctx.groupContainers.value.set(id, el)
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
    if (panelsRef && panelsRef.value !== elTyped) {
      panelsRef.value = elTyped
    }
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
    <VExpansionPanels
      v-if="blockShapePanelPlacement === 'top'"
      v-model="expandedTopBlockShape"
      multiple
      class="mb-4 block-shape-entity-card-wrapper"
    >
      <AdminEntityEditorPanel
        entity-key="blockShape"
        :entity="blockShape"
        :expanded="isEntityExpanded(blockShape.id)"
      />
    </VExpansionPanels>

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
      </div>
    </div>

    <div
      :ref="(el) => setGroupContainer(blockShape.id, el as HTMLElement | null)"
      class="block-instances-container"
    >
      <VExpansionPanels
        v-if="blockInstances.length > 0"
        :ref="setGroupPanelsRef"
        v-model="expandedMainInstances"
        multiple
      >
        <AdminEntityEditorPanel
          v-for="instance in blockInstances"
          :key="instance.id"
          :class="`draggable-instance-${blockShape.id} draggable-instance-item`"
          :data-drag-id="instance.id"
          entity-key="blockInstance"
          :entity="instance"
          :expanded="isEntityExpanded(instance.id)"
          :block-instance-semantic-type-override="blockShape.semanticType"
          @saved="ctx.handleExistingBlockInstanceSaved"
          @delete="(id: string) => ctx.handleDeleteBlockInstance(id)"
          @duplicate="ctx.handleDuplicateClick"
        >
          <template
            v-if="showPartLedgerConvergence"
            #blockInstanceConvergence="{ entity }"
          >
            <BlockInstanceConvergenceEditors
              :block-shape="blockShape"
              :block-instance-id="entity.id"
            />
          </template>
        </AdminEntityEditorPanel>
      </VExpansionPanels>
      <VCard
        v-if="groupedInstances.length > 0"
        variant="outlined"
        color="warning"
        class="mt-4 grouped-instances-card"
      >
        <VCardTitle class="text-body-large d-flex align-center gap-2">
          <VIcon icon="tabler-folders" size="small" />
          Additional / option-only instances
          <VChip size="small" variant="tonal" class="ml-2">
            {{ groupedInstances.length }}
          </VChip>
        </VCardTitle>
        <VCardText>
          <VExpansionPanels
            :ref="setGroupPanelsGroupedRef"
            v-model="expandedGroupedInstances"
            multiple
          >
            <AdminEntityEditorPanel
              v-for="instance in groupedInstances"
              :key="instance.id"
              :class="`draggable-instance-${blockShape.id} draggable-instance-item`"
              :data-drag-id="instance.id"
              entity-key="blockInstance"
              :entity="instance"
              :expanded="isEntityExpanded(instance.id)"
              :block-instance-semantic-type-override="blockShape.semanticType"
              @saved="ctx.handleExistingBlockInstanceSaved"
              @delete="(id: string) => ctx.handleDeleteBlockInstance(id)"
              @duplicate="ctx.handleDuplicateClick"
            >
              <template
                v-if="showPartLedgerConvergence"
                #blockInstanceConvergence="{ entity }"
              >
                <BlockInstanceConvergenceEditors
                  :block-shape="blockShape"
                  :block-instance-id="entity.id"
                />
              </template>
            </AdminEntityEditorPanel>
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
      <template v-if="blockShapePanelPlacement === 'bottom'">
        <VDivider class="my-6" />
        <VExpansionPanels v-model="expandedBottomBlockShape" multiple>
          <AdminEntityEditorPanel
            entity-key="blockShape"
            :entity="blockShape"
            :expanded="isEntityExpanded(blockShape.id)"
          />
        </VExpansionPanels>
      </template>
    </div>
  </div>
</template>

<style scoped>
.block-shape-entity-card-wrapper {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.03);
}
</style>
