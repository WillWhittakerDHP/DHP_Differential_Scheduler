<script lang="ts" setup>
defineOptions({
  name: 'AppAutocomplete',
  inheritAttrs: false,
})


const elementId = computed(() => {
  const _elementIdToken = attrs.id
  const _id = useId()
  return _elementIdToken ? `app-autocomplete-${_elementIdToken}` : _id
})

const attrs = useAttrs()
const label = computed(() => attrs.label as string | undefined)
const autocompleteBind = computed(() => {
  const { class: _cls, ...rest } = attrs
  return {
    ...rest,
    class: null,
    label: undefined,
    id: elementId.value,
    variant: 'outlined' as const,
    menuProps: {
      contentClass: [
        'app-inner-list',
        'app-autocomplete__content',
        'v-autocomplete__content',
      ],
    },
  }
})

const wrapperClass = computed(() => (attrs.class ?? null) as string | string[] | Record<string, boolean> | null)
</script>

<template>
  <div
    class="app-autocomplete flex-grow-1"
    :class="wrapperClass"
  >
    <VLabel
      v-if="label"
      :for="elementId"
      class="mb-1 text-body-medium"
      :text="label"
    />
    <VAutocomplete
      v-bind="autocompleteBind"
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
    </VAutocomplete>
  </div>
</template>
