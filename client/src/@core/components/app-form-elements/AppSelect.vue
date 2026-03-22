<script lang="ts" setup>
defineOptions({
  name: 'AppSelect',
  inheritAttrs: false,
})

const attrs = useAttrs()

const elementId = computed (() => {
  const _elementIdToken = attrs.id
  const _id = useId()

  return _elementIdToken ? `app-select-${_elementIdToken}` : _id
})

const menuProps = computed(() => {
  const defaultContentClass = [
    'app-inner-list',
    'app-select__content',
    'v-select__content',
    attrs.multiple !== undefined ? 'v-list-select-multiple' : ''
  ].filter(Boolean)
  
  const defaultMenuProps = {
    contentClass: defaultContentClass,
  }
  
  const userMenuProps = (attrs['menu-props'] || attrs.menuProps) as Record<string, unknown> | undefined
  
  if (userMenuProps) {
    // PATTERN: Combine arrays, filter out falsy values
    const userContentClass = userMenuProps.contentClass
      ? (Array.isArray(userMenuProps.contentClass) 
          ? userMenuProps.contentClass 
          : [userMenuProps.contentClass])
      : []
    
    return {
      ...defaultMenuProps,
      ...userMenuProps,
      contentClass: [
        ...defaultContentClass,
        ...userContentClass
      ].filter(Boolean)
    }
  }
  
  return defaultMenuProps
})

const selectBind = computed(() => {
  const { class: _cls, ...rest } = attrs
  return { ...rest, class: null, variant: 'outlined' as const, id: elementId.value, menuProps: menuProps.value }
})

const wrapperClass = computed(() => (attrs.class ?? null) as string | string[] | Record<string, boolean> | null)
</script>

<template>
  <div
    class="app-select flex-grow-1"
    :class="wrapperClass"
  >
    <VSelect
      v-bind="selectBind"
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
    </VSelect>
  </div>
</template>
