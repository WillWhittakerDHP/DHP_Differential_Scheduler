<!--
  WHY: Instances-first IA — tier 2: blockShape instance tabs only.
  Shape definitions now live in the top-level Shapes admin tab.
-->
<script setup lang="ts">
import InstanceBulkEditModal from '@/components/admin/InstanceBulkEditModal.vue'
import BlockInstanceCreateModal from '@/components/admin/BlockInstanceCreateModal.vue'
import { useInstancesTab } from '@/composables/admin/useInstancesTab'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import BlockInstancesGroup from './components/BlockInstancesGroup.vue'

const instancesTab = useInstancesTab({
  splitOrchestratorAtomic: true,
})

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
    <VTabs
      v-model="activeTab"
      class="instances-tabs-container mb-4"
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

    </VWindow>

    <VAlert
      v-if="sortedBlockShapes.length === 0"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No block shapes found. Create block shapes in your data workflow as needed. Use the <strong>Shapes</strong> tab for
      block, part, annotation, and event type definitions.
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

.instances-tabs-container :deep(.v-tab) {
  flex: 0 1 auto;
}

.instances-tabs-container :deep(.v-tabs) {
  display: flex;
}

.instances-tabs-container :deep(.v-slide-group__content) {
  display: flex;
}

.orchestrator-atomic-tabs :deep(.v-tab) {
  flex: 0 1 auto;
}
</style>
