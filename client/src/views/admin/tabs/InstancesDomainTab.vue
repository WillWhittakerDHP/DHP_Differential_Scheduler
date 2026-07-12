<!--
  WHY: Instances-first IA — tier 2: all blockShapes (left) + Shapes (right); tier 3 under Shapes: Block | Part | Annotation | Event
  (Block reuses ShapesTabBlockPanel — same AdminEntityEditorPanel cards as shape tabs + Shapes tab block list).
-->
<script setup lang="ts">
import { defineAsyncComponent, provide, ref } from 'vue'
import InstanceBulkEditModal from '@/components/admin/InstanceBulkEditModal.vue'
import BlockInstanceCreateModal from '@/components/admin/BlockInstanceCreateModal.vue'
import { useInstancesTab } from '@/composables/admin/useInstancesTab'
import { useShapesTab } from '@/composables/admin/useShapesTab'
import { INSTANCES_TIER2_SHAPES_DEFINITIONS_TAB } from '@/constants/adminInstancesUi'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { shapesTabInjectionKey } from './shapesTabContext'
import BlockInstancesGroup from './components/BlockInstancesGroup.vue'

const ShapesTabBlockPanel = defineAsyncComponent(() => import('./components/ShapesTabBlockPanel.vue'))
const ShapesTabPartPanel = defineAsyncComponent(() => import('./components/ShapesTabPartPanel.vue'))
const ShapesTabAnnotationPanel = defineAsyncComponent(() => import('./components/ShapesTabAnnotationPanel.vue'))
const ShapesTabEventPanel = defineAsyncComponent(() => import('./components/ShapesTabEventPanel.vue'))

/** Tier 3 when tier 2 is "Shapes" — Block (blockShape cards) + Part / Annotation / Event. */
const shapesSubTab = ref<'block' | 'part' | 'annotation' | 'event'>('block')

const instancesTab = useInstancesTab({
  splitOrchestratorAtomic: true,
})

const shapesTabApi = useShapesTab({
  instancesDomainDragContext: {
    tier2Tab: instancesTab.activeTab,
    shapesSubTab,
    shapesTier2Value: INSTANCES_TIER2_SHAPES_DEFINITIONS_TAB,
  },
})
provide(shapesTabInjectionKey, shapesTabApi)

const {
  activeTab,
  sortedBlockShapes,
  blockInstancesCountByShape,
  handleTabClick,
  bulkEditMode,
  getBulkEditData,
  handleBulkEditConfirm,
  createModalOpen,
  setCreateModalOpen,
  createModalBlockShapeId,
  createModalSourceEntity,
  handleInstanceCreated,
  orchestratorAtomicSubTab,
  hasOrchestratorForShape,
} = instancesTab
</script>

<template>
  <div class="instances-domain-tab">
    <VRow class="mb-4 tier2-row align-end" no-gutters>
      <VCol class="tier2-block-shapes-col flex-grow-1 min-width-0 pr-2">
        <VTabs
          v-model="activeTab"
          class="instances-tabs-container"
          :mandatory="false"
        >
          <VTab
            v-for="blockShape in sortedBlockShapes"
            :key="blockShape.id"
            :value="blockShape.id"
            @click="handleTabClick(blockShape.id)"
          >
            {{ blockShape.name }} ({{ blockInstancesCountByShape.get(blockShape.id) || 0 }})
          </VTab>
        </VTabs>
      </VCol>
      <VCol cols="auto" class="flex-shrink-0">
        <VTabs
          v-model="activeTab"
          density="compact"
          class="tier2-shapes-right-tab"
        >
          <VTab :value="INSTANCES_TIER2_SHAPES_DEFINITIONS_TAB">
            Shapes
          </VTab>
        </VTabs>
      </VCol>
    </VRow>

    <VWindow v-model="activeTab">
      <VWindowItem
        v-for="blockShape in sortedBlockShapes"
        :key="blockShape.id"
        :value="blockShape.id"
      >
        <VAlert
          v-if="blockShape.semanticType === BLOCK_SHAPE_TYPES.EVENT"
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-4"
        >
          <strong>Calendar segments</strong> are edited on each <strong>event</strong> block instance card (open the
          instance under its block shape tab). Segment form fields are defined in code
          (<code>codeFirstMetadataCache.ts</code>).
        </VAlert>

        <template v-if="hasOrchestratorForShape(blockShape.id)">
          <VTabs
            v-model="orchestratorAtomicSubTab"
            class="mb-4 orchestrator-atomic-tabs"
            density="compact"
          >
            <VTab value="orchestrator">
              Orchestrator
            </VTab>
            <VTab value="atomic">
              Atomic
            </VTab>
          </VTabs>
          <BlockInstancesGroup
            :block-shape="blockShape"
            :block-shape-panel-placement="orchestratorAtomicSubTab === 'orchestrator' ? 'top' : 'none'"
          />
        </template>
        <BlockInstancesGroup
          v-else
          :block-shape="blockShape"
          block-shape-panel-placement="top"
        />
      </VWindowItem>

      <VWindowItem
        :key="INSTANCES_TIER2_SHAPES_DEFINITIONS_TAB"
        :value="INSTANCES_TIER2_SHAPES_DEFINITIONS_TAB"
      >
        <VTabs
          v-model="shapesSubTab"
          class="mb-4 shapes-subtabs"
          density="compact"
        >
          <VTab value="block">
            Block
          </VTab>
          <VTab value="part">
            Part
          </VTab>
          <VTab value="annotation">
            Annotation
          </VTab>
          <VTab value="event">
            Event
          </VTab>
        </VTabs>
        <VWindow v-model="shapesSubTab">
          <VWindowItem value="block">
            <ShapesTabBlockPanel />
          </VWindowItem>
          <VWindowItem value="part">
            <ShapesTabPartPanel />
          </VWindowItem>
          <VWindowItem value="annotation">
            <ShapesTabAnnotationPanel />
          </VWindowItem>
          <VWindowItem value="event">
            <ShapesTabEventPanel />
          </VWindowItem>
        </VWindow>
      </VWindowItem>
    </VWindow>

    <VAlert
      v-if="sortedBlockShapes.length === 0"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No block shapes found. Create block shapes in your data workflow as needed. Use the <strong>Shapes</strong> tab for
      block, part, annotation, and event shape definitions.
    </VAlert>

    <template v-for="blockShape in sortedBlockShapes" :key="`bulk-${blockShape.id}`">
      <InstanceBulkEditModal
        :model-value="bulkEditMode.get(blockShape.id) || false"
        :block-shape-id="blockShape.id"
        :block-shape-name="blockShape.name"
        :bulk-edit-data="getBulkEditData(blockShape.id)"
        :instance-count="blockInstancesCountByShape.get(blockShape.id) || 0"
        @update:model-value="(value) => bulkEditMode.set(blockShape.id, value)"
        @confirm="(data) => handleBulkEditConfirm(blockShape.id, data)"
      />
    </template>

    <BlockInstanceCreateModal
      :model-value="createModalOpen"
      :block-shape-id="createModalBlockShapeId"
      :source-entity="createModalSourceEntity"
      @update:model-value="setCreateModalOpen"
      @created="handleInstanceCreated"
    />
  </div>
</template>

<style scoped>
.instances-domain-tab {
  margin-top: 1rem;
}

.tier2-row {
  flex-wrap: nowrap;
}

.tier2-block-shapes-col :deep(.v-tabs) {
  width: 100%;
}

.instances-tabs-container :deep(.v-tab) {
  flex: 0 1 auto;
}

.instances-tabs-container :deep(.v-tabs) {
  display: flex;
}

.instances-tabs-container :deep(.v-slide-group__content) {
  display: flex;
}

.tier2-shapes-right-tab :deep(.v-slide-group__content) {
  justify-content: flex-end;
}

.shapes-subtabs :deep(.v-tab),
.orchestrator-atomic-tabs :deep(.v-tab) {
  flex: 0 1 auto;
}
</style>
