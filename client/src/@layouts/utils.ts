import { ref, computed, watch } from 'vue'
import type { Router } from 'vue-router'
import { layoutConfig } from '@layouts/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { useLayoutConfigStore } from '@layouts/stores/config'
import type { NavGroup, NavLink, NavLinkProps } from '@layouts/types'

export const openGroups = ref<string[]>([])


export const getComputedNavLinkToProp = computed(() => (link: NavLink) => {
  const props: NavLinkProps = {
    target: link.target,
    rel: link.rel,
  }

  if (link.to)
    props.to = typeof link.to === 'string' ? { name: link.to } : link.to
  else props.href = link.href

  return props
})

export const resolveNavLinkRouteName = (link: NavLink, router: Router) => {
  if (!link.to)
    return null

  if (typeof link.to === 'string')
    return link.to

  return router.resolve(link.to).name
}

export const isNavLinkActive = (link: NavLink, router: Router) => {
  const matchedRoutes = router.currentRoute.value.matched

  const resolveRoutedName = resolveNavLinkRouteName(link, router)

  if (!resolveRoutedName)
    return false

  return matchedRoutes.some(route => {
    return route.name === resolveRoutedName || route.meta.navActiveLink === resolveRoutedName
  })
}

export const isNavGroupActive = (children: (NavLink | NavGroup)[], router: Router): boolean =>
  children.some(child => {
    if ('children' in child)
      return isNavGroupActive(child.children, router)

    return isNavLinkActive(child, router)
  })

export const _setDirAttr = (dir: 'ltr' | 'rtl') => {
  if (typeof document !== 'undefined')
    document.documentElement.setAttribute('dir', dir)
}

export const getDynamicI18nProps = (key: string, tag = 'span') => {
  if (!layoutConfig.app.i18n.enable)
    return {}

  return {
    keypath: key,
    tag,
    scope: 'global',
  }
}

export const switchToVerticalNavOnLtOverlayNavBreakpoint = () => {
  const configStore = useLayoutConfigStore()

  /*
      ℹ️ This is flag will hold nav type need to render when switching between lgAndUp from mdAndDown window width

      Requirement: When we nav is set to `horizontal` and we hit the `mdAndDown` breakpoint nav type shall change to `vertical` nav
      Now if we go back to `lgAndUp` breakpoint from `mdAndDown` how we will know which was previous nav type in large device?

      Let's assign value of `appContentLayoutNav` as default value of lgAndUpNav. Why 🤔?
        If template is viewed in lgAndUp
          We will assign `appContentLayoutNav` value to `lgAndUpNav` because at this point both constant is same
          Hence, for `lgAndUpNav` it will take value from theme config file
        else
          It will always show vertical nav and if user increase the window width it will fallback to `appContentLayoutNav` value
          But `appContentLayoutNav` will be value set in theme config file
    */
  const lgAndUpNav = ref(configStore.appContentLayoutNav)

  watch(
    () => configStore.appContentLayoutNav,
    value => {
      if (!configStore.isLessThanOverlayNavBreakpoint)
        lgAndUpNav.value = value
    },
  )

  watch(() => configStore.isLessThanOverlayNavBreakpoint, val => {
    configStore.appContentLayoutNav = val ? AppContentLayoutNav.Vertical : lgAndUpNav.value
  }, { immediate: true })
}


export const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i

  hex = hex.replace(shorthandRegex, (_m: string, r: string, g: string, b: string) => {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return result ? `${Number.parseInt(result[1], 16)},${Number.parseInt(result[2], 16)},${Number.parseInt(result[3], 16)}` : null
}

export const rgbaToHex = (rgba: string, forceRemoveAlpha = false) => {
  return (
    `#${
      rgba
        .replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
        .split(',') // splits them at ","
        .filter((_str, index) => !forceRemoveAlpha || index !== 3)
        .map(str => Number.parseFloat(str)) // Converts them to numbers
        .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
        .map(number => number.toString(16)) // Converts numbers to hex
        .map(str => (str.length === 1 ? `0${str}` : str)) // Adds 0 when length of one number is 1
        .join('')}`
  )
}
