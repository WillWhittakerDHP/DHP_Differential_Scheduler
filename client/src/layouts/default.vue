<script lang="ts" setup>
import { computed } from 'vue'
import type { LoadingIndicatorInstance } from '@/types/loadingIndicator'
import { useConfigStore } from '@core/stores/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils'
import { useLayoutLoading } from '@/composables/useLayoutLoading'

const DefaultLayoutWithHorizontalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithHorizontalNav.vue'))
const DefaultLayoutWithVerticalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithVerticalNav.vue'))

const configStore = useConfigStore()

switchToVerticalNavOnLtOverlayNavBreakpoint()

const { layoutAttrs, injectSkinClasses } = useSkins()

injectSkinClasses()

// LEARNING: Use layout loading composable
// PATTERN: Composable handles loading indicator state and watchers
const refLoadingIndicator = ref<LoadingIndicatorInstance | null>(null)

const { isFallbackStateActive } = useLayoutLoading({
  refLoadingIndicator
})

const layoutComponent = computed(() =>
  configStore.appContentLayoutNav === AppContentLayoutNav.Vertical ? DefaultLayoutWithVerticalNav : DefaultLayoutWithHorizontalNav
)
</script>

<template>
  <Component
    v-bind="layoutAttrs"
    :is="layoutComponent"
  >
    <AppLoadingIndicator ref="refLoadingIndicator" />

    <RouterView v-slot="{ Component }">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>
  </Component>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";
</style>
