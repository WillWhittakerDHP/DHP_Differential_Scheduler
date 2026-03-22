import type { RouteRecordRaw } from 'vue-router'
import { parse } from 'cookie-es'
import { destr } from 'destr'
import { USER_ROLE_CLIENT } from '@/constants/attendeeRoles'
import { createLogger } from '@/utils/logger'

const emailRouteComponent = () => import('@/pages/apps/email/index.vue')
const logger = createLogger('additional-routes')

/** Match `useCookie('userData')` while tolerating different cookie-name casing from older clients or proxies. */
function cookieValueCaseInsensitive(
  cookies: Record<string, string>,
  canonicalName: string
): string | undefined {
  const target = canonicalName.toLowerCase()
  for (const [key, value] of Object.entries(cookies)) {
    if (key.toLowerCase() === target)
      return value
  }
  return undefined
}

function decodeCookiePayload(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch (decodeErr: unknown) {
    logger.warn('Cookie segment URI decode failed; using raw string', { decodeErr })
    return raw
  }
}

function getUserRoleFromCookie(): string | undefined {
  if (typeof document === 'undefined')
    return undefined

  const raw = cookieValueCaseInsensitive(parse(document.cookie), 'userData')
  if (raw === undefined || raw === '')
    return undefined

  try {
    const decoded = decodeCookiePayload(raw)
    const userData = destr<unknown>(decoded)
    if (userData === null || typeof userData !== 'object' || Array.isArray(userData))
      return undefined
    const role = (userData as Record<string, unknown>).role
    return typeof role === 'string' ? role : undefined
  } catch (err: unknown) {
    logger.warn('Failed to parse userData cookie for index redirect', { err })
    return undefined
  }
}

export const redirects: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    redirect: (to) => {
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
