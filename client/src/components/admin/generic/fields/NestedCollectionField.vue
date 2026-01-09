<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="showLabel"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!--
      LEARNING: Use PartInstancesNestedSection for partInstance fields
      WHY: Provides inline creation with VExpansionPanels and EntityCard pattern
      PATTERN: Specialized component for partInstance creation with full form fields
    -->
    <PartInstancesNestedSection
      v-if="childEntityKey === 'partInstance' && parentEntity"
      :block-instance-id="parentEntity.id"
    />
    
    <!--
      LEARNING: Generic NestedCollection for other entity types
      WHY: Falls back to basic nested collection rendering for non-partInstance fields
      PATTERN: No dialog needed - creation happens inline in the nested section
    -->
    <NestedCollection
      v-else-if="shouldDisplay && childEntityKey"
      :child-entity-key="childEntityKey"
      :parent-entity="parentEntity!"
      :get-child-parent-id="getChildParentId"
      :get-parent-id="getParentId"
      :default-expanded="defaultExpanded"
    />
    
    <div v-else-if="isDev" class="nested-field-placeholder">
      No valid options configured for this nested field
    </div>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: NestedCollectionField component renders nested collection fields (e.g., activeConstituents)
 * 
 * WHY: Some fields like activeConstituents need to display child entities (partInstance instances)
 *      in a nested collection format, not as a regular select dropdown
 * 
 * PATTERN: Reads config to determine childEntityKey, relationshipKey, and optionsFieldKey
 *          Gets parent entity and parent type to check valid options
 *          Filters child entities based on relationship array
 * 
 * COMPARISON: React uses NestedCollectionSelectField. Vue uses NestedCollectionField with NestedCollection component
 * 
 * NOTE: PartInstance creation is now handled inline by PartInstancesNestedSection using EntityCard
 */

import { computed } from 'vue'
import BaseInput from './BaseInput.vue'
import NestedCollection from '../collections/NestedCollection.vue'
import PartInstancesNestedSection from '../../PartInstancesNestedSection.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useNestedCollectionField } from '../../../../composables/admin/useNestedCollectionField'
import { isDevModeEnabled } from '@/utils/env/devMode'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { fieldContext } = props

// Check if in development mode
const isDev = computed(() => isDevModeEnabled())

// Use composable for nested collection field logic
const nestedField = useNestedCollectionField(fieldContext)

// Extract values from composable for template
const {
  childEntityKey,
  shouldDisplay,
  defaultExpanded,
  getChildParentId,
  getParentId,
  parentEntity
} = nestedField
</script>

<style scoped>
.nested-field-placeholder {
  padding: 16px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  color: #6c757d;
  font-size: 14px;
  text-align: center;
}
</style>

