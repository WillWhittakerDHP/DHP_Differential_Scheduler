<script setup lang="ts">
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { buildTimeBlockEventReadout } from '@/utils/admin/timeBlockEventReadout'

const props = defineProps<{
  blockInstanceId: string
}>()

const { globalData } = useGlobal()

const readout = computed(() => {
  const data = globalData.value
  if (!data) {
    return { applies: false, title: 'Events', timeBlockName: '', eventNames: [] }
  }
  return buildTimeBlockEventReadout({
    blockInstanceId: props.blockInstanceId,
    blockInstances: data.entities.blockInstance,
    blockShapes: data.entities.blockShape,
    eventAssignments: data.relationships.eventAssignments,
  })
})
</script>

<template>
  <VList density="compact">
    <VListItem>
      <VListItemTitle>{{ readout.timeBlockName }}</VListItemTitle>
      <VListItemSubtitle>
        <template v-if="readout.eventNames.length > 0">
          Claimed by {{ readout.eventNames.join(', ') }}
        </template>
        <template v-else>
          Not claimed by an active event segment yet.
        </template>
      </VListItemSubtitle>
    </VListItem>
  </VList>
</template>
