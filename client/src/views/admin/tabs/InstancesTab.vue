<!--
  PATTERN: Thin component; orchestration in useInstancesTab (vue-architecture audit).
-->
<script setup lang="ts">
import InstanceBulkEditModal from '@/components/admin/InstanceBulkEditModal.vue'
import BlockInstanceCreateModal from '@/components/admin/BlockInstanceCreateModal.vue'
import { useInstancesTab } from '@/composables/admin/useInstancesTab'
import BlockInstancesGroup from './components/BlockInstancesGroup.vue'
import type { BlockShapeType } from '@/constants/blockShapeTypes'

const props = defineProps<{
  allowedBlockShapeTypes?: readonly BlockShapeType[]
  orchestratorInstancesOnly?: boolean
}>()

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
} = useInstancesTab({
  allowedBlockShapeTypes: () => props.allowedBlockShapeTypes,
  orchestratorInstancesOnly: () => props.orchestratorInstancesOnly,
})
</script>

<template>
  <div class="instances-tab">
    <VAlert type="info" variant="tonal" density="comfortable" class="mb-4">
      <strong>Calendar segments</strong> are edited on each <strong>event</strong> block instance card (open the
      instance under its block shape tab). Segment form fields are defined in code
      (<code>codeFirstMetadataCache.ts</code>).
    </VAlert>

    <!--
      WHY: Provides tabbed interface to switch between BlockShapes and Shapes
      PATTERN: v-model binds to reactive ref for two-way data binding
    -->
    <VTabs
      v-model="activeTab"
      class="mb-4 instances-tabs-container"
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

    <!--
      WHY: Manages which tab content is visible based on activeTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <VWindow
      v-model="activeTab"
    >
      <VWindowItem
        v-for="blockShape in sortedBlockShapes"
        :key="blockShape.id"
        :value="blockShape.id"
      >
        <BlockInstancesGroup :block-shape="blockShape" />
      </VWindowItem>
    </VWindow>

    <!--
      WHY: Provides feedback when no BlockShapes are configured
      PATTERN: Conditional rendering with v-if
    -->
    <VAlert
      v-if="sortedBlockShapes.length === 0"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No BlockShapes found. Create a BlockShape first.
    </VAlert>

    <!--
      WHY: Modals for bulk editing BlockInstances per BlockShape
      PATTERN: One modal per BlockShape, conditionally rendered
    -->
    <template v-for="blockShape in sortedBlockShapes" :key="blockShape.id">
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

    <!--
      WHY: Unified modal for creating and duplicating block instances
      PATTERN: Single modal instance, controlled by createModalOpen state
    -->
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
.instances-tab {
  margin-top: 1rem;
}

.block-shape-tab-content {
  padding: 0.5rem 0;
}

.block-shape-entity-card-wrapper {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.block-instances-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.draggable-instance-item {
  transition: transform 0.2s;
}

.drag-handle {
  cursor: grab;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.drag-handle:hover {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
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
</style>
