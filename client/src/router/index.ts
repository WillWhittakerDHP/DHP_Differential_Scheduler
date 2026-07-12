import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { isAuthDisabled } from '@/constants/authRuntime'

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

  if (isAuthDisabled() && (to.name === 'login' || to.name === 'auth-verify')) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/admin'
    return redirect
  }

  const publicAuthRoutes = new Set(['login', 'auth-verify'])
  const needsAdminSession =
    !isAuthDisabled() &&
    (to.path.startsWith('/admin') ||
    to.name === 'admin-panel' ||
    to.name === 'admin-booking-entry')
  if (needsAdminSession && !publicAuthRoutes.has(String(to.name))) {
    const auth = useAuthStore()
    if (!auth.sessionLoaded) {
      await auth.refreshSession()
    }
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
})

export default router

