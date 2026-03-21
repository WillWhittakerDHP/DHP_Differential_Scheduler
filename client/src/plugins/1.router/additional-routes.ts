import type { RouteRecordRaw } from 'vue-router'
import { parse } from 'cookie-es'
import { destr } from 'destr'
import { USER_ROLE_CLIENT } from '@/constants/attendeeRoles'

const emailRouteComponent = () => import('@/pages/apps/email/index.vue')
const redirectPlaceholderComponent = { render: () => null }

function getUserRoleFromCookie(): string | undefined {
  if (typeof document === 'undefined')
    return undefined

  const userDataCookie = parse(document.cookie).userData
  const userData = userDataCookie
    ? destr<Record<string, unknown> | null>(decodeURIComponent(userDataCookie))
    : null

  return typeof userData?.role === 'string' ? userData.role : undefined
}

export const redirects: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: redirectPlaceholderComponent,
    beforeEnter: (to) => {
      const userRole = getUserRoleFromCookie()

      if (userRole === 'admin')
        return { name: 'dashboards-crm' }
      if (userRole === USER_ROLE_CLIENT)
        return { name: 'access-control' }

      return { name: 'login', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]

export const routes: RouteRecordRaw[] = [
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('@/pages/apps/logistics/dashboard.vue'),
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('@/pages/apps/academy/dashboard.vue'),
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },
]
