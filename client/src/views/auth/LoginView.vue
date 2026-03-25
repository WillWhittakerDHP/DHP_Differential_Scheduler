<template>
  <VContainer class="fill-height" fluid>
    <VRow align="center" justify="center">
      <VCol cols="12" sm="8" md="5" lg="4">
        <VCard>
          <VCardTitle>Sign in</VCardTitle>
          <VCardText>
            <p class="text-body-2 mb-4">
              Enter your email. We will send you a magic link to sign in.
            </p>
            <VTextField
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              :disabled="submitting"
              @keyup.enter="submit"
            />
            <VAlert v-if="message" type="success" variant="tonal" class="mt-4" density="compact">
              {{ message }}
            </VAlert>
            <VAlert v-if="errorText" type="error" variant="tonal" class="mt-4" density="compact">
              {{ errorText }}
            </VAlert>
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn color="primary" :loading="submitting" @click="submit">Send link</VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { defaultPostAuthPath } from '@/utils/authRedirect'
import { createLogger } from '@/utils/logger'

const logger = createLogger('LoginView')
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const submitting = ref(false)
const message = ref('')
const errorText = ref('')

async function submit(): Promise<void> {
  errorText.value = ''
  message.value = ''
  submitting.value = true
  try {
    await auth.requestMagicLink(email.value.trim())
    message.value = 'If an account exists for that email, a sign-in link has been sent.'
  } catch (err: unknown) {
    logger.error('magic link request failed', { err })
    errorText.value = 'Could not send sign-in link. Try again later.'
  } finally {
    submitting.value = false
  }
}

const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : undefined

watch(
  () => auth.isAuthenticated,
  (ok) => {
    if (ok) {
      void router.push(redirectTarget ?? defaultPostAuthPath(auth.user?.role))
    }
  },
  { immediate: true }
)
</script>
