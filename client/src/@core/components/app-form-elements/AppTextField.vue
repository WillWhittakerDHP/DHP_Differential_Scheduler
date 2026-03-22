<script lang="ts" setup>
defineOptions({
  name: 'AppTextField',
  inheritAttrs: false,
})

const attrs = useAttrs()
const elementId = computed(() => {
  const _elementIdToken = attrs.id
  const _id = useId()
  return _elementIdToken ? `app-text-field-${_elementIdToken}` : _id
})

const textFieldBind = computed(() => {
  const { class: _cls, ...rest } = attrs
  return { ...rest, class: null, variant: 'outlined' as const, id: elementId.value }
})

const wrapperClass = computed(() => (attrs.class ?? null) as string | string[] | Record<string, boolean> | null)
</script>

<template>
  <div
    class="app-text-field flex-grow-1"
    :class="wrapperClass"
  >
    <VTextField
      v-bind="textFieldBind"
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
    </VTextField>
  </div>
</template>
