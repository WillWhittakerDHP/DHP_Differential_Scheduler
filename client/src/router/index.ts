/**
 * Vue Router Configuration
 * 
 * LEARNING: Vue Router setup for SPA routing
 * WHY: Enables client-side routing without page reloads
 * PATTERN: Define routes and create router instance
 * COMPARISON: React uses React Router. Vue uses Vue Router
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import { getQueryClient } from '@/plugins/3.vue-query'
import apiClient, { getAdminMetadataBatchEndpoint } from '@/utils/api'
import type { MetadataCache } from '@/composables/admin/useMetadataCache'
import { createLogger, isScopeExplicitlyEnabled } from '@/utils/logger'

const logger = createLogger('Router Guard')

/**
 * Route definitions
 * LEARNING: Route records define path-to-component mappings
 * WHY: Centralized route configuration
 * PATTERN: Array of route objects with path, name, and component
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/booking/BookingWizardView.vue'),
  },
  // Booking wizard route
  {
    path: '/booking',
    name: 'booking-wizard',
    component: () => import('@/views/booking/BookingWizardView.vue'),
  },
  // Main admin route with tabbed interface
  {
    path: '/admin',
    name: 'admin-panel',
    component: () => import('@/views/admin/AdminPanel.vue'),
  },
  // Note: Separate entity routes removed - functionality moved to AdminPanel tabs
  // Block Type, Block Profile, Part Type, and Part Profile management
  // will be integrated into Profiles and Types tabs in later sessions
]

/**
 * Create router instance
 * LEARNING: Router factory function creates router with history mode
 * WHY: Provides routing functionality to Vue app
 * PATTERN: Use createWebHistory for HTML5 history mode
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// LEARNING: Prefetch admin metadata when navigating to admin routes
// WHY: Ensures metadata is in cache before components render (same pattern as globalData)
// PATTERN: Prefetch in route guard, components read from cache synchronously
router.beforeEach(async (to: RouteLocationNormalized) => {
  if (to.path.startsWith('/admin') || to.name === 'admin-panel') {
    const queryClient = getQueryClient()
    if (!queryClient) {
      // QueryClient not initialized yet, skip prefetch
      return
    }
    
    const existingData = queryClient.getQueryData<MetadataCache>(['adminMetadata'])
    
    // Only prefetch if not already in cache
    if (!existingData) {
      try {
        // LEARNING: Router Guard logs are opt-in only
        // WHY: Reduces console noise - only log when explicitly enabled via VITE_DEBUG_SCOPES="Router Guard"
        // PATTERN: Use isScopeExplicitlyEnabled to require explicit enabling
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
        // Continue navigation even if prefetch fails
        logger.warn('Failed to prefetch admin metadata:', error)
      }
    }
  }
})

export default router

