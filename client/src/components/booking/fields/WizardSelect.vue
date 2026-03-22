<!--
  PATTERN: Wizard-level wrapper for VSelect.
  WHY: Bakes in persistent-placeholder, full-width, and standardized error handling
  so step sections don't repeat the same props on every select field.
-->
<template>
  <VSelect
    v-bind="$attrs"
    persistent-placeholder
    full-width
    :error-messages="wizardErrorMessages"
  >
    <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps" />
    </template>
  </VSelect>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  fieldErrors?: Record<string, string>
  errorKey?: string
}>()

const wizardErrorMessages = computed((): string[] | undefined => {
  if (props.fieldErrors && props.errorKey !== undefined) {
    const msg = props.fieldErrors[props.errorKey]
    return msg ? [msg] : []
  }
  return undefined
})
</script>
