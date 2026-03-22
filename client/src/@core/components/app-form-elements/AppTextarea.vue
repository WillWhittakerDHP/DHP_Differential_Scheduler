<script lang="ts" setup>
defineOptions({
  name: 'AppTextarea',
  inheritAttrs: false,
})

const attrs = useAttrs()
const elementId = computed(() => {
  const _elementIdToken = attrs.id
  const _id = useId()
  return _elementIdToken ? `app-textarea-${_elementIdToken}` : _id
})

const textareaBind = computed(() => {
  const { class: _cls, ...rest } = attrs
  return { ...rest, class: null, variant: 'outlined' as const, id: elementId.value }
})

const wrapperClass = computed(() => (attrs.class ?? null) as string | string[] | Record<string, boolean> | null)
</script>

<template>
  <div
    class="app-textarea flex-grow-1"
    :class="wrapperClass"
  >
    <VTextarea
      v-bind="textareaBind"
    >
      <template
        v-for="(_, name) in $slots"
        #[name]="slotProps"
      >
        <slot
          :name="name"
          v-bind="slotProps || {}"
        />
      </template>
    </VTextarea>
  </div>
</template>
