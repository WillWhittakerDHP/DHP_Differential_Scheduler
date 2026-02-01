import type { Router, RouteLocationNormalized } from 'vue-router'
import { canNavigate } from '@layouts/plugins/casl'
import { getQueryClient } from '@/plugins/3.vue-query'
import apiClient, { getAdminMetadataBatchEndpoint } from '@/utils/api'
import type { MetadataCache } from '@/composables/admin/useMetadataCache'

export const setupGuards = (router: Router) => {
  router.beforeEach(async (to: RouteLocationNormalized) => {
    // WHY: Ensures metadata is in cache before components render (same pattern as globalData)
    // PATTERN: Prefetch in route guard, components read from cache synchronously
    if (to.path.startsWith('/admin') || to.name === 'admin-panel') {
      const queryClient = getQueryClient()
      if (!queryClient) {
        return
      }
      
      const existingData = queryClient.getQueryData<MetadataCache>(['adminMetadata'])
      
      if (!existingData) {
        try {
          const endpoint = getAdminMetadataBatchEndpoint()
          const response = await apiClient.get<MetadataCache>(endpoint)
          queryClient.setQueryData<MetadataCache>(['adminMetadata'], response.data)
        } catch (error) {
          console.warn('[Router Guard] Failed to prefetch admin metadata:', error)
        }
      }
    }
    /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
    if (to.meta.public)
      return

    const isLoggedIn = !!(useCookie('userData').value && useCookie('accessToken').value)

    /*
      If user is logged in and is trying to access login like page, redirect to home
      else allow visiting the page
      (WARN: Don't allow executing further by return statement because next code will check for permissions)
     */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/'
      else
        return undefined
    }

    if (!canNavigate(to) && to.matched.length) {
       
      return isLoggedIn
        ? { name: 'not-authorized' }
        : {
            name: 'login',
            query: {
              ...to.query,
              to: to.fullPath !== '/' ? to.path : undefined,
            },
          }
       
    }
  })
}
