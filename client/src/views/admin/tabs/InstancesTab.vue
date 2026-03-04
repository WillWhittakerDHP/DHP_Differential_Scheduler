<!--
  PATTERN: Thin component; orchestration in useInstancesTab (vue-architecture audit).
-->
<script setup lang="ts">
import InstanceBulkEditModal from '@/components/admin/InstanceBulkEditModal.vue'
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import BlockInstanceCreateModal from '@/components/admin/BlockInstanceCreateModal.vue'
import { createBlockInstanceConfigSentinel } from '@/utils/entities/entityTypeMapping'
import { useInstancesTab } from '@/composables/admin/useInstancesTab'
import FeeCalibrationPanel from './components/FeeCalibrationPanel.vue'
import BlockInstancesGroup from './components/BlockInstancesGroup.vue'
import EventInstancesSection from './components/EventInstancesSection.vue'

const {
  activeTab,
  sortedBlockShapes,
  blockInstancesCountByShape,
  handleTabClick,
  filteredEventInstances,
  bulkEditMode,
  getBulkEditData,
  handleBulkEditConfirm,
  shapeEditModalOpen,
  createModalOpen,
  setCreateModalOpen,
  createModalBlockShapeId,
  createModalSourceEntity,
  handleInstanceCreated,
  handleExistingBlockShapeSaved,
  eventInstanceMetadataModalOpen,
  eventInstanceFieldsGlobalEntity,
} = useInstancesTab()
</script>

<template>
  <div class="instances-tab">
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
      <VSpacer />
      <VTab
        value="calibration"
        @click="activeTab = 'calibration'"
        class="calibration-tab"
      >
        Calibration
      </VTab>
      <VTab
        value="eventInstances"
        @click="activeTab = 'eventInstances'"
        class="event-instances-tab"
      >
        Events ({{ filteredEventInstances.length }})
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
      
      <!-- Fee Calibration Tab Content -->
      <VWindowItem value="calibration">
        <FeeCalibrationPanel />
      </VWindowItem>

      <!-- Event Instances Tab Content -->
      <VWindowItem value="eventInstances">
        <EventInstancesSection />
      </VWindowItem>
    </VWindow>
    
    <!--
      WHY: Provides feedback when no BlockShapes are configured
      PATTERN: Conditional rendering with v-if
    -->
    <VAlert
      v-if="sortedBlockShapes.length === 0 && activeTab !== 'eventInstances'"
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
      WHY: Modals for editing field metadata and shape templates
      PATTERN: One modal per BlockShape, conditionally rendered
    -->
    <template v-for="blockShape in sortedBlockShapes" :key="`shape-${blockShape.id}`">
      <MetadataEditModal
        :model-value="shapeEditModalOpen.get(blockShape.id) || false"
        entity-key="blockInstance"
        :entity="createBlockInstanceConfigSentinel(blockShape.id)"
        :block-shape-ref="blockShape.id"
        :entity-name="blockShape.name || `BlockShape ${blockShape.id}`"
        @update:model-value="(value) => shapeEditModalOpen.set(blockShape.id, value)"
        @saved="() => handleExistingBlockShapeSaved(blockShape.id)"
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
    
    <!--
      WHY: Single modal for configuring all EventInstance field definitions globally
      PATTERN: Global config modal triggered from section header, uses sentinel UUID
    -->
    <MetadataEditModal
      v-model="eventInstanceMetadataModalOpen"
      entity-key="eventInstance"
      :entity="eventInstanceFieldsGlobalEntity"
      entity-name="Event Instance Fields (Global)"
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
  flex: 1;
}

.event-instances-tab {
  margin-left: auto;
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.event-instances-tab:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.event-instances-tab-content {
  padding: 0.5rem 0;
}
</style>
