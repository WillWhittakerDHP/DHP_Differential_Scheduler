<!--
  WHY: Shared Save/Cancel/Edit/Delete row actions with shallow v-if depth (component-health).
-->
<script setup lang="ts">
defineProps<{
  isEditing: boolean
}>()

const emit = defineEmits<{
  save: []
  cancel: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div v-if="isEditing" class="d-flex gap-2">
    <VBtn prepend-icon="tabler-check" size="small" color="success" variant="text" @click="emit('save')">
      Save
    </VBtn>
    <VBtn prepend-icon="tabler-x" size="small" color="error" variant="text" @click="emit('cancel')">
      Cancel
    </VBtn>
  </div>
  <div v-else class="d-flex gap-2">
    <VBtn prepend-icon="tabler-pencil" size="small" variant="text" @click="emit('edit')">
      Edit
    </VBtn>
    <VBtn prepend-icon="tabler-trash" size="small" color="error" variant="text" @click="emit('delete')">
      Delete
    </VBtn>
  </div>
</template>
