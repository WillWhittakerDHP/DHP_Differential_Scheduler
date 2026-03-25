import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import { getQueryClient } from '@/plugins/3.vue-query'
import apiClient, { getAdminMetadataBatchEndpoint } from '@/utils/api'
import { createLogger, isScopeExplicitlyEnabled } from '@/utils/logger'
import { useAuthStore } from '@/stores/authStore'

import type { MetadataCache } from '@/types/admin/metadataCache'
const logger = createLogger('Router Guard')

let authBootstrapped = false

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/booking/BookingWizardView.vue'),
  },
  {
    path: '/booking',
    name: 'booking-wizard',
    component: () => import('@/views/booking/BookingWizardView.vue'),
  },
  {
    path: '/admin',
    name: 'admin-panel',
    component: () => import('@/views/admin/AdminPanel.vue'),
  },
  {
    path: '/admin/booking',
    name: 'admin-booking-entry',
    component: () => import('@/views/admin/AdminBookingEntryView.vue'),
  },
  {
    path: '/beta-feedback',
    name: 'beta-feedback',
    component: () => import('@/views/beta/BetaFeedbackView.vue'),
  },
  {
    path: '/cancel',
    name: 'cancel-appointment',
    component: () => import('@/views/booking/CancelConfirmView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
  },
  {
    path: '/auth/verify',
    name: 'auth-verify',
    component: () => import('@/views/auth/AuthVerifyView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  if (!authBootstrapped) {
    authBootstrapped = true
    const auth = useAuthStore()
    await auth.initializeAuth()
  }

  const publicAuthRoutes = new Set(['login', 'auth-verify'])
  const needsAdminSession =
    to.path.startsWith('/admin') ||
    to.name === 'admin-panel' ||
    to.name === 'admin-booking-entry'
  if (needsAdminSession && !publicAuthRoutes.has(String(to.name))) {
    const auth = useAuthStore()
    if (!auth.sessionLoaded) {
      await auth.refreshSession()
    }
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  if (to.path.startsWith('/admin') || to.name === 'admin-panel') {
    const queryClient = getQueryClient()
    if (!queryClient) {
      return
    }

    const existingData = queryClient.getQueryData<MetadataCache>(['adminMetadata'])

    if (!existingData) {
      try {
        if (isScopeExplicitlyEnabled('Router Guard')) {
          logger.debug('Prefetching admin metadata for', to.path)
        }
        const endpoint = getAdminMetadataBatchEndpoint()
        const response = await apiClient.get<MetadataCache>(endpoint)
        queryClient.setQueryData<MetadataCache>(['adminMetadata'], response.data)
        if (isScopeExplicitlyEnabled('Router Guard')) {
          logger.debug('Admin metadata prefetched successfully')
        }
      } catch (error) {
        logger.warn('Failed to prefetch admin metadata:', error)
      }
    }
  }
})

export default router

