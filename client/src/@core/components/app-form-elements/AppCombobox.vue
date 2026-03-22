<script lang="ts" setup>
defineOptions({
  name: 'AppCombobox',
  inheritAttrs: false,
})

const attrs = useAttrs()
const elementId = computed(() => {
  const _elementIdToken = attrs.id
  const _id = useId()
  return _elementIdToken ? `app-combobox-${_elementIdToken}` : _id
})

const label = computed(() => attrs.label as string | undefined)
const comboboxBind = computed(() => {
  const { class: _cls, ...rest } = attrs
  return {
    ...rest,
    class: null,
    label: undefined,
    variant: 'outlined' as const,
    id: elementId.value,
    menuProps: {
      contentClass: [
        'app-inner-list',
        'app-combobox__content',
        'v-combobox__content',
        attrs.multiple !== undefined ? 'v-list-select-multiple' : '',
      ],
    },
  }
})

const wrapperClass = computed(() => (attrs.class ?? null) as string | string[] | Record<string, boolean> | null)
</script>

<template>
  <div
    class="app-combobox flex-grow-1"
    :class="wrapperClass"
  >
    <VLabel
      v-if="label"
      :for="elementId"
      class="mb-1 text-body-medium"
      :text="label"
    />

    <VCombobox
      v-bind="comboboxBind"
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
    </VCombobox>
  </div>
</template>
