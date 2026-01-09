/**
 * Vue Router Configuration
 * 
 * LEARNING: Vue Router setup for SPA routing
 * WHY: Enables client-side routing without page reloads
 * PATTERN: Define routes and create router instance
 * COMPARISON: React uses React Router. Vue uses Vue Router
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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

export default router

