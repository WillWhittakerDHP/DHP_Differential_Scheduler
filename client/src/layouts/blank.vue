<script lang="ts" setup>
import { useSuspenseFallback } from '@/composables/layout/useSuspenseFallback'

const { injectSkinClasses } = useSkins()
const { isFallbackStateActive, refLoadingIndicator } = useSuspenseFallback()
void refLoadingIndicator

injectSkinClasses()
</script>

<template>
  <AppLoadingIndicator ref="refLoadingIndicator" />

  <div
    class="layout-wrapper layout-blank"
    data-allow-mismatch
  >
    <RouterView #="{Component}">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>
  </div>
</template>

<style scoped>
.layout-wrapper.layout-blank {
  flex-direction: column;
}
</style>
