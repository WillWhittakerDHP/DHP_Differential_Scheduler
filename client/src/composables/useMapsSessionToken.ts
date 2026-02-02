/**
 * useMapsSessionToken Composable
 * 
 * LEARNING: Manages Google Maps session token for Places API autocomplete
 * WHY: Session tokens optimize billing - one autocomplete session = one charge
 * PATTERN: Shared composable for token management across components
 * 
 * Session 2.2.5: Pre-fetch token when Step 2 becomes active to avoid blocking
 */

import { ref, type Ref } from 'vue'
import { getSessionToken } from '@/services/mapsApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useMapsSessionToken')

// Shared token ref across all instances
const sharedToken: Ref<string> = ref('')
const isFetching: Ref<boolean> = ref(false)

/**
 * useMapsSessionToken composable
 * 
 * LEARNING: Provides session token management for Maps API
 * WHY: Centralizes token fetching logic, enables pre-fetching
 * PATTERN: Singleton pattern - shared token across all components
 */
export function useMapsSessionToken() {
  /**
   * Pre-fetch session token
   * LEARNING: Fetches token in background without blocking
   * WHY: Token ready when user needs it, no delay on first keystroke
   */
  const prefetchToken = async (): Promise<void> => {
    // Don't fetch if already have token or currently fetching
    if (sharedToken.value || isFetching.value) {
      return
    }

    isFetching.value = true
    try {
      sharedToken.value = await getSessionToken()
      logger.debug('[prefetchToken] Got session token')
    } catch (error) {
      logger.warn('[prefetchToken] Failed to get token:', error)
      // Continue without token - will generate client-side fallback
    } finally {
      isFetching.value = false
    }
  }

  /**
   * Get session token (lazy fetch if not available)
   * LEARNING: Returns existing token or fetches one if needed
   * WHY: Fallback for components that need token immediately
   */
  const getToken = async (): Promise<string> => {
    if (sharedToken.value) {
      return sharedToken.value
    }

    // Fetch if not already fetching
    if (!isFetching.value) {
      await prefetchToken()
    }

    // Return token (may be empty if fetch failed, will use client-side fallback)
    return sharedToken.value || crypto.randomUUID()
  }

  /**
   * Reset token (for new autocomplete session)
   * LEARNING: Clears token to start new billing session
   * WHY: After place-details call, token is consumed
   */
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
