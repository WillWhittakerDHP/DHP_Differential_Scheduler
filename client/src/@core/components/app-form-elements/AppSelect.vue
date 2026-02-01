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

/**
 * WHY: Multi-select dropdowns should stay open when selecting items for better UX
 * PATTERN: Set closeOnContentClick: false for multiple selects, true for single selects
 */
const menuProps = computed(() => {
  const defaultContentClass = [
    'app-inner-list',
    'app-select__content',
    'v-select__content',
    attrs.multiple !== undefined ? 'v-list-select-multiple' : ''
  ].filter(Boolean)
  
  // PATTERN: Set closeOnContentClick based on multiple prop
  const isMultiple = attrs.multiple !== undefined
  
  const defaultMenuProps = {
    contentClass: defaultContentClass,
    closeOnContentClick: !isMultiple // LEARNING: Keep open for multi-select, close for single-select
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
</script>

<template>
  <div
    class="app-select flex-grow-1"
    :class="$attrs.class"
  >
    <VSelect
      v-bind="{
        ...$attrs,
        class: null,
        variant: 'outlined',
        id: elementId,
        menuProps: menuProps,
      }"
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
