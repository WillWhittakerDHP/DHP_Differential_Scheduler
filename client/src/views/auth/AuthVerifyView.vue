<template>
  <VContainer class="fill-height" fluid>
    <VRow align="center" justify="center">
      <VCol cols="12" sm="8" md="6">
        <VCard>
          <VCardTitle>Signing you in</VCardTitle>
          <VCardText>
            <p v-if="status === 'loading'">Verifying your link…</p>
            <VAlert v-else-if="status === 'error'" type="error" variant="tonal" density="compact">
              {{ errorText }}
            </VAlert>
            <p v-else>Redirecting…</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AuthVerifyView')
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const status = ref<'loading' | 'ok' | 'error'>('loading')
const errorText = ref('This sign-in link is invalid or expired.')

onMounted(() => {
  void (async () => {
    const token = typeof route.query.token === 'string' ? route.query.token : ''
    if (token === '') {
      status.value = 'error'
      return
    }
    try {
      await auth.verifyMagicLinkToken(token)
      status.value = 'ok'
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
      await router.replace(redirect ?? '/')
    } catch (err: unknown) {
      logger.warn('magic link verify failed', { err })
      status.value = 'error'
    }
  })()
})
</script>
