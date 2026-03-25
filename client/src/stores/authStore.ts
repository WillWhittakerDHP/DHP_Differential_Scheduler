import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import apiClient from '@/utils/api'
import { globalCsrfToken } from '@/utils/api/csrfContext'
import { createLogger } from '@/utils/logger'

const logger = createLogger('authStore')

export type AuthUser = { userId: string; role: string }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const sessionLoaded = ref(false)
  const csrfToken = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  function syncCsrfToGlobal(): void {
    globalCsrfToken.value = csrfToken.value
  }

  async function fetchCsrfToken(): Promise<void> {
    const { data } = await apiClient.get<{ csrfToken: string }>('/auth/csrf-token')
    csrfToken.value = data.csrfToken
    syncCsrfToGlobal()
  }

  async function refreshSession(): Promise<void> {
    try {
      const { data } = await apiClient.get<{ userId: string; role: string }>('/auth/session/me')
      user.value = { userId: data.userId, role: data.role }
    } catch (error: unknown) {
      logger.debug('session/me not authenticated or failed', { error })
      user.value = null
    } finally {
      sessionLoaded.value = true
    }
  }

  /**
   * Bootstrap: CSRF first (for mutating calls), then session.
   */
  async function initializeAuth(): Promise<void> {
    try {
      await fetchCsrfToken()
    } catch (error: unknown) {
      logger.warn('fetchCsrfToken failed', { error })
    }
    try {
      await refreshSession()
    } catch (error: unknown) {
      logger.warn('refreshSession failed', { error })
      sessionLoaded.value = true
    }
  }

  async function requestMagicLink(email: string): Promise<void> {
    if (csrfToken.value === null) {
      await fetchCsrfToken()
    }
    await apiClient.post('/auth/magic-link/request', { email })
  }

  async function verifyMagicLinkToken(token: string): Promise<void> {
    await apiClient.get('/auth/magic-link/verify', { params: { token } })
    await fetchCsrfToken()
    await refreshSession()
  }

  async function logout(): Promise<void> {
    if (csrfToken.value === null) {
      await fetchCsrfToken()
    }
    try {
      await apiClient.post('/auth/logout')
    } catch (error: unknown) {
      logger.warn('logout request failed', { error })
    }
    user.value = null
    await fetchCsrfToken()
    syncCsrfToGlobal()
  }

  function setGuest(): void {
    user.value = null
    sessionLoaded.value = true
  }

  return {
    user,
    sessionLoaded,
    csrfToken,
    isAuthenticated,
    initializeAuth,
    fetchCsrfToken,
    refreshSession,
    requestMagicLink,
    verifyMagicLinkToken,
    logout,
    setGuest,
    syncCsrfToGlobal,
  }
})
