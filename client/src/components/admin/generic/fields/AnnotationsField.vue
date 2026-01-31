<template>
  <div class="annotations-field">
    <!--
      LEARNING: Use RelationshipCollection for annotations display and creation
      WHY: Unified pattern with parts collection, handles EntityCard rendering and inline creation
      PATTERN: RelationshipCollection handles basic CRUD, metadata editing handled separately below
    -->
    <RelationshipCollection
      :field-context="fieldContext"
      collection-type="annotations"
      ref="relationshipCollectionRef"
    />
    
    <!--
      LEARNING: Metadata editing panel for annotations
      WHY: Annotations have relationship-level metadata (userTypeBlock, isDefault, orderIndex) that needs editing
      PATTERN: Show metadata editing table below the collection display
      NOTE: This could be integrated into RelationshipCollection in the future, but keeping separate for now
    -->
    <!-- TODO: Add metadata editing UI here if needed -->
    <!-- For now, metadata editing can be done via EntityCard sub-panels or relationship editing -->
  </div>
</template>

<script setup lang="ts">
/**
 * AnnotationsField Component
 * 
 * LEARNING: Field component for managing annotations using RelationshipCollection
 * WHY: Uses unified collection pattern with parts, handles basic CRUD via RelationshipCollection
 * PATTERN: Wraps RelationshipCollection for annotations, metadata editing can be added separately
 * 
 * Features:
 * - Display annotations using RelationshipCollection
 * - Inline creation via EntityCard
 * - Basic CRUD operations
 * 
 * NOTE: Metadata editing (userTypeBlock, isDefault, orderIndex) can be handled via:
 * - EntityCard sub-panels for relationship metadata
 * - Separate metadata editing component
 * - Or integrated into RelationshipCollection in the future
 */

import { ref } from 'vue'
import RelationshipCollection from '../collections/RelationshipCollection.vue'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

const props = defineProps<Props>()
const { fieldContext } = props

const relationshipCollectionRef = ref<InstanceType<typeof RelationshipCollection> | null>(null)

</script>

<style scoped lang="scss">
.annotations-field {
  width: 100%;
}
</style>

