/**
 * PATTERN: useMapsSessionToken Composable

PATTERN: Shared composable for token man...
 */
import { ref, type Ref } from 'vue'
import { getSessionToken } from '@/services/mapsApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useMapsSessionToken')

const sharedToken: Ref<string> = ref('')
const isFetching: Ref<boolean> = ref(false)

/**
 * PATTERN: useMapsSessionToken composable

PATTERN: Singleton pattern - shared toke...
 */
export function useMapsSessionToken() {
  const prefetchToken = async (): Promise<void> => {
    if (sharedToken.value || isFetching.value) {
      return
    }

    isFetching.value = true
    try {
      sharedToken.value = await getSessionToken()
      logger.debug('[prefetchToken] Got session token')
    } catch (error) {
      logger.warn('[prefetchToken] Failed to get token:', error)
    } finally {
      isFetching.value = false
    }
  }

  const getToken = async (): Promise<string> => {
    if (sharedToken.value) {
      return sharedToken.value
    }

    if (!isFetching.value) {
      await prefetchToken()
    }

    return sharedToken.value || crypto.randomUUID()
  }

  const resetToken = (): void => {
    sharedToken.value = ''
  }

  return {
    token: sharedToken,
    prefetchToken,
    getToken,
    resetToken
  }
}
